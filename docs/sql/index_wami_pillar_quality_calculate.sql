-- Optimizado: temp wallets + portafolio_agg + tracking batch; sin ::DATE.
-- Test: EXPLAIN ANALYZE SELECT index_wami.pillar_quality_calculate(10);

CREATE OR REPLACE FUNCTION index_wami.pillar_quality_calculate(p_limit integer DEFAULT 100) RETURNS integer
    LANGUAGE plpgsql
AS $$
DECLARE
    v_processed integer := 0;
    w               record;
    -- ====================== SCORES POR ITEM ======================
    -- Bloque Básica (10 pts)
    v_total_value_health_score       numeric := 0;
    v_total_value_health_reason      jsonb;
    v_liquid_assets_ratio_score      numeric := 0;
    v_liquid_assets_ratio_reason     jsonb;

    -- Bloque Intermedia (9 pts)
    v_token_diversification_score    numeric := 0;
    v_token_diversification_reason   jsonb;
    v_stable_verified_assets_score   numeric := 0;
    v_stable_verified_assets_reason  jsonb;

    -- Bloque Avanzada (6 pts)
    v_low_risk_holdings_score        numeric := 0;
    v_low_risk_holdings_reason       jsonb;
    v_sophisticated_composition_score numeric := 0;
    v_sophisticated_composition_reason jsonb;

    -- Bloques resumen
    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0; 

    v_pillar_summary             jsonb;

    -- Variables temporales para agregación de details
    v_num_tokens                integer;
    v_stable_verified_pct       numeric;
    v_meme_pct                  numeric;
    v_has_lp                    boolean;

BEGIN
    CREATE TEMP TABLE temp_pillar_wallets ON COMMIT DROP AS
    SELECT 
            wtd.wallet_id,
            wtd.chain_id,
            wpo.total_portfolio_value_usd,
            wpo.liquid_ratio_pct,
            wpo.liquid_value_usd,
            wpo.locked_value_usd,
            wpo.id AS portafolio_id
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN walcert.wallet_portafolio wpo 
               ON wtd.wallet_id = wpo.wallet_id 
              AND wtd.chain_id = wpo.chain_id
        LEFT JOIN index_wami.pillar_quality pq 
               ON wtd.wallet_id = pq.wallet_id 
              AND wtd.chain_id = pq.chain_id
        WHERE pq.wallet_id IS NULL 
           OR pq.calculated_at < CURRENT_DATE::timestamptz
        ORDER BY pq.calculated_at ASC NULLS FIRST
        LIMIT p_limit;

    CREATE TEMP TABLE temp_portafolio_agg ON COMMIT DROP AS
    SELECT
        wallet_portafolio_id,
        COUNT(DISTINCT token_symbol) AS num_tokens,
        COALESCE(SUM(CASE WHEN is_stablecoin OR is_verified THEN value_usd ELSE 0 END) / NULLIF(SUM(value_usd), 0) * 100, 0) AS stable_verified_pct,
        COALESCE(SUM(CASE WHEN token_category = 'meme_or_other' THEN value_usd ELSE 0 END) / NULLIF(SUM(value_usd), 0) * 100, 0) AS meme_pct,
        COUNT(CASE WHEN lp_details IS NOT NULL THEN 1 END) > 0 AS has_lp
    FROM walcert.wallet_portafolio_details
    WHERE wallet_portafolio_id IN (SELECT portafolio_id FROM temp_pillar_wallets WHERE portafolio_id IS NOT NULL)
    GROUP BY wallet_portafolio_id;

    INSERT INTO index_wami.index_wami_tracking (wallet_id, chain_id)
    SELECT wallet_id, chain_id FROM temp_pillar_wallets
    ON CONFLICT (wallet_id, chain_id) DO NOTHING;

    WITH existing AS (
        SELECT ep.* FROM temp_pillar_wallets t
        INNER JOIN index_wami.pillar_quality ep ON ep.wallet_id = t.wallet_id AND ep.chain_id = t.chain_id
    ),
    archive AS (
        SELECT e.wallet_id, e.chain_id,
            to_char(COALESCE(e.calculated_at::date, CURRENT_DATE), 'YYYY-MM') AS current_month,
            e.calculated_at, e.pillar_score, e.block_basic_score, e.block_intermediate_score, e.block_advanced_score,
            it.pillar_portfolio_quality_score_last_30_days AS old_last_30,
            it.pillar_portfolio_quality_score_tracking AS old_tracking
        FROM existing e
        INNER JOIN index_wami.index_wami_tracking it ON it.wallet_id = e.wallet_id AND it.chain_id = e.chain_id
    ),
    computed AS (
        SELECT a.*,
            (SELECT jsonb_agg(elem) FROM (
                SELECT elem FROM jsonb_array_elements(
                    jsonb_build_array(jsonb_build_object('date', a.calculated_at, 'pillar_score', a.pillar_score,
                        'block_basic_score', a.block_basic_score, 'block_intermediate_score', a.block_intermediate_score,
                        'block_advanced_score', a.block_advanced_score))
                    || COALESCE((SELECT jsonb_agg(e2) FROM jsonb_array_elements(COALESCE(a.old_last_30,'[]'::jsonb)) e2
                        WHERE e2->>'date' != CURRENT_DATE::text), '[]'::jsonb)
                ) elem WHERE (elem->>'date')::date >= (CURRENT_DATE - INTERVAL '30 days')
            ) sub) AS new_last_30,
            COALESCE((SELECT jsonb_agg(CASE WHEN elem->>'date' = a.current_month THEN
                jsonb_build_object('date', a.current_month, 'avg_score',
                    CASE WHEN (elem->>'avg_score') IS NOT NULL THEN ((elem->>'avg_score')::numeric + a.pillar_score) / 2.0 ELSE a.pillar_score END)
                ELSE elem END) FROM jsonb_array_elements(COALESCE(a.old_tracking,'[]'::jsonb)) elem),
                jsonb_build_array(jsonb_build_object('date', a.current_month, 'avg_score', a.pillar_score))) AS new_monthly
        FROM archive a
    )
    UPDATE index_wami.index_wami_tracking it
    SET pillar_portfolio_quality_score_last_30_days = c.new_last_30,
        pillar_portfolio_quality_score_tracking = c.new_monthly
    FROM computed c WHERE it.wallet_id = c.wallet_id AND it.chain_id = c.chain_id;

    FOR w IN SELECT * FROM temp_pillar_wallets LOOP
        -- ====================== BLOQUE BÁSICA (10 pts) ======================

        -- 1. Total Value Health
        IF COALESCE(w.total_portfolio_value_usd, 0) <= 20 THEN
            v_total_value_health_score := 1.0;
            v_total_value_health_reason := jsonb_build_object(
                'total_usd', round(w.total_portfolio_value_usd, 2),
                'reason_eng', 'Extremely low portfolio value (≤ $20), indicating very limited economic substance and high risk of low operational capacity.',
                'reason_esp', 'Valor de portafolio extremadamente bajo (≤ $20), indicando sustancia económica muy limitada y alto riesgo de baja capacidad operativa.'
            );
        ELSIF COALESCE(w.total_portfolio_value_usd, 0) <= 60 THEN
            v_total_value_health_score := 2.0;
            v_total_value_health_reason := jsonb_build_object(
                'total_usd', round(w.total_portfolio_value_usd, 2),
                'reason_eng', 'Low portfolio value ($20–$60), typical of early-stage or low-activity wallets with limited financial health.',
                'reason_esp', 'Bajo valor de portafolio ($20–$60), típico de wallets en etapa inicial o de baja actividad con salud financiera limitada.'
            );
        ELSIF COALESCE(w.total_portfolio_value_usd, 0) <= 150 THEN
            v_total_value_health_score := 3.0;
            v_total_value_health_reason := jsonb_build_object(
                'total_usd', round(w.total_portfolio_value_usd, 2),
                'reason_eng', 'Moderate portfolio value ($60–$150), showing acceptable economic substance for a growing wallet.',
                'reason_esp', 'Valor de portafolio moderado ($60–$150), mostrando sustancia económica aceptable para una wallet en crecimiento.'
            );
        ELSIF COALESCE(w.total_portfolio_value_usd, 0) <= 500 THEN
            v_total_value_health_score := 4.0;
            v_total_value_health_reason := jsonb_build_object(
                'total_usd', round(w.total_portfolio_value_usd, 2),
                'reason_eng', 'Good portfolio value ($150–$500), reflecting solid financial health and operational seriousness.',
                'reason_esp', 'Buen valor de portafolio ($150–$500), reflejando sólida salud financiera y seriedad operativa.'
            );
        ELSE
            v_total_value_health_score := 5.0;
            v_total_value_health_reason := jsonb_build_object(
                'total_usd', round(w.total_portfolio_value_usd, 2),
                'reason_eng', 'High portfolio value (>$500), demonstrating strong economic substance and high operational maturity.',
                'reason_esp', 'Alto valor de portafolio (>$500), demostrando fuerte sustancia económica y alta madurez operativa.'
            );
        END IF;

        -- 2. Liquid Assets Ratio
        IF COALESCE(w.liquid_ratio_pct, 100) >= 90 THEN
            v_liquid_assets_ratio_score := 3.0;
            v_liquid_assets_ratio_reason := jsonb_build_object(
                'liquid_ratio_pct', round(w.liquid_ratio_pct, 2),
                'reason_eng', 'Excellent liquidity (≥90%), allowing the wallet to access capital quickly with minimal risk of being locked in illiquid positions.',
                'reason_esp', 'Liquidez excelente (≥90%), permitiendo acceso rápido al capital con riesgo mínimo de estar bloqueado en posiciones ilíquidas.'
            );
        ELSIF COALESCE(w.liquid_ratio_pct, 100) >= 70 THEN
            v_liquid_assets_ratio_score := 2.0;
            v_liquid_assets_ratio_reason := jsonb_build_object(
                'liquid_ratio_pct', round(w.liquid_ratio_pct, 2),
                'reason_eng', 'Good liquidity (70–89%), providing reasonable access to capital with moderate risk.',
                'reason_esp', 'Buena liquidez (70–89%), proporcionando acceso razonable al capital con riesgo moderado.'
            );
        ELSIF COALESCE(w.liquid_ratio_pct, 100) >= 50 THEN
            v_liquid_assets_ratio_score := 1.0;
            v_liquid_assets_ratio_reason := jsonb_build_object(
                'liquid_ratio_pct', round(w.liquid_ratio_pct, 2),
                'reason_eng', 'Moderate liquidity (50–69%), indicating some exposure to illiquid assets.',
                'reason_esp', 'Liquidez moderada (50–69%), indicando cierta exposición a activos ilíquidos.'
            );
        ELSE
            v_liquid_assets_ratio_score := 0.0;
            v_liquid_assets_ratio_reason := jsonb_build_object(
                'liquid_ratio_pct', round(w.liquid_ratio_pct, 2),
                'reason_eng', 'Low liquidity (<50%), signaling high risk of capital being locked in illiquid positions.',
                'reason_esp', 'Baja liquidez (<50%), señalando alto riesgo de que el capital esté bloqueado en posiciones ilíquidas.'
            );
        END IF;

        v_block_basic := v_total_value_health_score + v_liquid_assets_ratio_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================

        -- Agregación de detalles del portafolio
        SELECT pa.num_tokens, pa.stable_verified_pct, pa.meme_pct, pa.has_lp
        INTO v_num_tokens, v_stable_verified_pct, v_meme_pct, v_has_lp
        FROM temp_portafolio_agg pa
        WHERE pa.wallet_portafolio_id = w.portafolio_id;


        -- 3. Token Diversification
        DECLARE
            v_concentration_pct numeric := 100.0 / NULLIF(v_num_tokens, 0);
        BEGIN
            IF v_num_tokens >= 15 THEN
                v_token_diversification_score := 6.0;
                v_token_diversification_reason := jsonb_build_object(
                    'num_tokens', v_num_tokens,
                    'concentration_pct', round(v_concentration_pct, 2),
                    'reason_eng', 'Exceptional token diversification (≥15 tokens), reflecting advanced portfolio management and minimal concentration risk.',
                    'reason_esp', 'Diversificación de tokens excepcional (≥15 tokens), reflejando gestión avanzada de portafolio y riesgo de concentración mínimo.'
                );
            ELSIF v_num_tokens >= 8 THEN
                v_token_diversification_score := 4.0;
                v_token_diversification_reason := jsonb_build_object(
                    'num_tokens', v_num_tokens,
                    'concentration_pct', round(v_concentration_pct, 2),
                    'reason_eng', 'Very good diversification (≥8 tokens), demonstrating sophisticated portfolio construction.',
                    'reason_esp', 'Muy buena diversificación (≥8 tokens), demostrando construcción sofisticada de portafolio.'
                );
            ELSIF v_num_tokens >= 4 THEN
                v_token_diversification_score := 2.0;
                v_token_diversification_reason := jsonb_build_object(
                    'num_tokens', v_num_tokens,
                    'concentration_pct', round(v_concentration_pct, 2),
                    'reason_eng', 'Moderate diversification (≥4 tokens), acceptable for most wallets.',
                    'reason_esp', 'Diversificación moderada (≥4 tokens), aceptable para la mayoría de wallets.'
                );
            ELSE
                v_token_diversification_score := 0.0;
                v_token_diversification_reason := jsonb_build_object(
                    'num_tokens', v_num_tokens,
                    'concentration_pct', round(v_concentration_pct, 2),
                    'reason_eng', 'Poor token diversification (highly concentrated), increasing volatility and single-asset risk.',
                    'reason_esp', 'Pobre diversificación de tokens (altamente concentrada), aumentando volatilidad y riesgo de un solo activo.'
                );
            END IF;
        END;

        -- 4. Stable & Verified Assets
        IF v_stable_verified_pct >= 60 THEN
            v_stable_verified_assets_score := 3.0;
            v_stable_verified_assets_reason := jsonb_build_object(
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'High allocation to stable and verified assets (≥60%), indicating strong risk management and low volatility exposure.',
                'reason_esp', 'Alta asignación a activos estables y verificados (≥60%), indicando fuerte gestión de riesgo y baja exposición a volatilidad.'
            );
        ELSIF v_stable_verified_pct >= 40 THEN
            v_stable_verified_assets_score := 2.0;
            v_stable_verified_assets_reason := jsonb_build_object(
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'Moderate allocation to stable and verified assets (40–59%), providing acceptable stability.',
                'reason_esp', 'Asignación moderada a activos estables y verificados (40–59%), proporcionando estabilidad aceptable.'
            );
        ELSIF v_stable_verified_pct >= 20 THEN
            v_stable_verified_assets_score := 1.0;
            v_stable_verified_assets_reason := jsonb_build_object(
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'Low allocation to stable and verified assets (20–39%), increasing overall portfolio volatility risk.',
                'reason_esp', 'Baja asignación a activos estables y verificados (20–39%), aumentando el riesgo de volatilidad general del portafolio.'
            );
        ELSE
            v_stable_verified_assets_score := 0.0;
            v_stable_verified_assets_reason := jsonb_build_object(
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'Very low allocation to stable and verified assets (<20%), indicating high exposure to speculative holdings.',
                'reason_esp', 'Asignación muy baja a activos estables y verificados (<20%), indicando alta exposición a holdings especulativos.'
            );
        END IF;

        v_block_intermediate := v_token_diversification_score + v_stable_verified_assets_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================

        -- 5. Low Risk Holdings
        IF v_meme_pct <= 30 THEN
            v_low_risk_holdings_score := 3.0;
            v_low_risk_holdings_reason := jsonb_build_object(
                'meme_pct', round(v_meme_pct, 2),
                'reason_eng', 'Very low exposure to high-risk meme assets (≤30%), showing conservative and professional portfolio management.',
                'reason_esp', 'Exposición muy baja a activos meme de alto riesgo (≤30%), mostrando gestión de portafolio conservadora y profesional.'
            );
        ELSIF v_meme_pct <= 50 THEN
            v_low_risk_holdings_score := 1.5;
            v_low_risk_holdings_reason := jsonb_build_object(
                'meme_pct', round(v_meme_pct, 2),
                'reason_eng', 'Moderate exposure to meme assets (30–50%), acceptable for growth-oriented wallets but with increased volatility.',
                'reason_esp', 'Exposición moderada a activos meme (30–50%), aceptable para wallets orientadas al crecimiento pero con mayor volatilidad.'
            );
        ELSE
            v_low_risk_holdings_score := 0.0;
            v_low_risk_holdings_reason := jsonb_build_object(
                'meme_pct', round(v_meme_pct, 2),
                'reason_eng', 'High exposure to meme and speculative assets (>50%), indicating elevated risk and speculative behavior.',
                'reason_esp', 'Alta exposición a activos meme y especulativos (>50%), indicando riesgo elevado y comportamiento especulativo.'
            );
        END IF;

        -- 6. Sophisticated Composition
        IF v_has_lp AND v_stable_verified_pct >= 40 THEN
            v_sophisticated_composition_score := 3.0;
            v_sophisticated_composition_reason := jsonb_build_object(
                'has_lp', v_has_lp,
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'Wallet uses advanced DeFi instruments (LP + solid stable allocation), demonstrating sophisticated portfolio construction.',
                'reason_esp', 'La wallet utiliza instrumentos DeFi avanzados (LP + sólida asignación a stables), demostrando construcción sofisticada de portafolio.'
            );
        ELSIF v_has_lp OR v_stable_verified_pct >= 60 THEN
            v_sophisticated_composition_score := 1.5;
            v_sophisticated_composition_reason := jsonb_build_object(
                'has_lp', v_has_lp,
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'Moderate sophisticated composition with either LP usage or high stable allocation.',
                'reason_esp', 'Composición sofisticada moderada con uso de LP o alta asignación a stables.'
            );
        ELSE
            v_sophisticated_composition_score := 0.0;
            v_sophisticated_composition_reason := jsonb_build_object(
                'has_lp', v_has_lp,
                'stable_verified_pct', round(v_stable_verified_pct, 2),
                'reason_eng', 'Basic or no sophisticated DeFi usage, indicating limited advanced portfolio management.',
                'reason_esp', 'Uso básico o nulo de DeFi sofisticado, indicando gestión avanzada de portafolio limitada.'
            );
        END IF;

        v_block_advanced := v_low_risk_holdings_score + v_sophisticated_composition_score;

        -- ====================== TOTAL ======================
        v_total_score := v_block_basic + v_block_intermediate + v_block_advanced;

                -- ====================== ANÁLISIS NARRATIVO DEL PILAR PORTFOLIO QUALITY (LENGUAJE DE NEGOCIO) ======================
        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'The wallet demonstrates excellent portfolio quality with strong value, diversification and risk management.'
                    WHEN v_total_score >= 18.5 THEN 'The wallet shows solid portfolio quality with good diversification and healthy asset composition.'
                    WHEN v_total_score >= 15.0 THEN 'The wallet has acceptable portfolio quality but presents clear areas for improvement in diversification or risk management.'
                    WHEN v_total_score >= 11.0 THEN 'The wallet has weak to moderate portfolio quality with several concerning risk factors.'
                    ELSE 'The wallet exhibits very poor portfolio quality. High risk due to concentration, speculation or lack of sophistication.'
                END,

            'overall_assessment_esp', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'La wallet demuestra una excelente calidad de portafolio con fuerte valor, diversificación y gestión de riesgo.'
                    WHEN v_total_score >= 18.5 THEN 'La wallet muestra una sólida calidad de portafolio con buena diversificación y composición saludable de activos.'
                    WHEN v_total_score >= 15.0 THEN 'La wallet tiene una calidad de portafolio aceptable pero presenta áreas claras de mejora en diversificación o gestión de riesgo.'
                    WHEN v_total_score >= 11.0 THEN 'La wallet tiene una calidad de portafolio débil a moderada con varios factores de riesgo preocupantes.'
                    ELSE 'La wallet presenta una calidad de portafolio muy pobre. Alto riesgo por concentración, especulación o falta de sofisticación.'
                END,

            'business_interpretation_eng', 
                'This Portfolio Quality pillar evaluates the wallet''s economic substance, asset diversification, liquidity and risk profile. ' ||
                CASE 
                    WHEN v_total_value_health_score <= 2.0 THEN 'Very low portfolio value significantly limits the wallet''s operational capacity. '
                    WHEN v_token_diversification_score = 0 THEN 'Poor token diversification creates dangerous concentration risk. '
                    WHEN v_stable_verified_assets_score = 0 THEN 'Heavy exposure to speculative assets increases volatility risk. '
                    WHEN v_low_risk_holdings_score = 0 THEN 'High allocation to meme and high-risk tokens is concerning. '
                    ELSE 'The wallet maintains reasonable portfolio health. '
                END ||
                'Overall, the current level suggests ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'high financial and volatility risk.'
                    WHEN v_total_score < 15.0 THEN 'moderate risk with structural weaknesses.'
                    WHEN v_total_score < 18.5 THEN 'acceptable but not robust portfolio.'
                    ELSE 'strong portfolio quality and good risk management.'
                END,

            'business_interpretation_esp', 
                'Este pilar Portfolio Quality evalúa la sustancia económica de la wallet, la diversificación de activos, liquidez y perfil de riesgo. ' ||
                CASE 
                    WHEN v_total_value_health_score <= 2.0 THEN 'Valor de portafolio muy bajo limita significativamente la capacidad operativa de la wallet. '
                    WHEN v_token_diversification_score = 0 THEN 'Pobre diversificación de tokens crea un riesgo de concentración peligroso. '
                    WHEN v_stable_verified_assets_score = 0 THEN 'Alta exposición a activos especulativos aumenta el riesgo de volatilidad. '
                    WHEN v_low_risk_holdings_score = 0 THEN 'Alta asignación a tokens meme y de alto riesgo es preocupante. '
                    ELSE 'La wallet mantiene una salud de portafolio razonable. '
                END ||
                'En general, el nivel actual sugiere ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'alto riesgo financiero y de volatilidad.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado con debilidades estructurales.'
                    WHEN v_total_score < 18.5 THEN 'portafolio aceptable pero no robusto.'
                    ELSE 'fuerte calidad de portafolio y buena gestión de riesgo.'
                END,

            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_total_value_health_score >= 4.0 THEN 'Solid portfolio economic value' END),
                        (CASE WHEN v_token_diversification_score >= 4.0 THEN 'Excellent token diversification' END),
                        (CASE WHEN v_stable_verified_assets_score >= 2.0 THEN 'Strong allocation to stable and verified assets' END),
                        (CASE WHEN v_sophisticated_composition_score = 3.0 THEN 'Sophisticated DeFi usage (LP positions)' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_total_value_health_score >= 4.0 THEN 'Sólido valor económico del portafolio' END),
                        (CASE WHEN v_token_diversification_score >= 4.0 THEN 'Excelente diversificación de tokens' END),
                        (CASE WHEN v_stable_verified_assets_score >= 2.0 THEN 'Fuerte asignación a activos estables y verificados' END),
                        (CASE WHEN v_sophisticated_composition_score = 3.0 THEN 'Uso sofisticado de DeFi (posiciones LP)' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_total_value_health_score <= 2.0 THEN 'Extremely low total portfolio value' END),
                        (CASE WHEN v_token_diversification_score = 0 THEN 'Highly concentrated token holdings' END),
                        (CASE WHEN v_stable_verified_assets_score = 0 THEN 'High exposure to speculative assets' END),
                        (CASE WHEN v_low_risk_holdings_score = 0 THEN 'Significant meme/high-risk asset allocation' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_total_value_health_score <= 2.0 THEN 'Valor total del portafolio extremadamente bajo' END),
                        (CASE WHEN v_token_diversification_score = 0 THEN 'Tenencias de tokens altamente concentradas' END),
                        (CASE WHEN v_stable_verified_assets_score = 0 THEN 'Alta exposición a activos especulativos' END),
                        (CASE WHEN v_low_risk_holdings_score = 0 THEN 'Asignación significativa a activos meme/de alto riesgo' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            -- ====================== RECOMENDACIÓN DINÁMICA ======================
            'recommendation_eng', 
                CASE 
                    WHEN v_total_value_health_score <= 2.0 THEN 'Priority: Increase overall portfolio value to demonstrate real economic substance and operational capacity.'
                    WHEN v_token_diversification_score = 0 THEN 'Focus on diversifying holdings across more tokens to reduce concentration risk.'
                    WHEN v_stable_verified_assets_score = 0 THEN 'Increase allocation to stablecoins and verified assets to lower portfolio volatility.'
                    WHEN v_low_risk_holdings_score = 0 THEN 'Reduce exposure to meme and high-risk tokens to improve overall risk profile.'
                    ELSE 'Continue optimizing portfolio composition by adding sophisticated DeFi positions (LP) and maintaining good liquidity.'
                END,

            'recommendation_esp', 
                CASE 
                    WHEN v_total_value_health_score <= 2.0 THEN 'Prioridad: Aumentar el valor total del portafolio para demostrar sustancia económica real y capacidad operativa.'
                    WHEN v_token_diversification_score = 0 THEN 'Enfocarse en diversificar las tenencias entre más tokens para reducir el riesgo de concentración.'
                    WHEN v_stable_verified_assets_score = 0 THEN 'Aumentar la asignación a stablecoins y activos verificados para reducir la volatilidad del portafolio.'
                    WHEN v_low_risk_holdings_score = 0 THEN 'Reducir la exposición a tokens meme y de alto riesgo para mejorar el perfil de riesgo general.'
                    ELSE 'Continuar optimizando la composición del portafolio agregando posiciones DeFi sofisticadas (LP) y manteniendo buena liquidez.'
                END,

            'last_calculated', now()
        );

        -- ====================== UPSERT ======================
        INSERT INTO index_wami.pillar_quality (
            wallet_id, chain_id,
            total_value_health_score, total_value_health_reason,
            liquid_assets_ratio_score, liquid_assets_ratio_reason,
            token_diversification_score, token_diversification_reason,
            stable_verified_assets_score, stable_verified_assets_reason,
            low_risk_holdings_score, low_risk_holdings_reason,
            sophisticated_composition_score, sophisticated_composition_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary, calculated_at, change_reason, calculated_by
        )
        VALUES (
            w.wallet_id,
            w.chain_id,
            v_total_value_health_score, v_total_value_health_reason,
            v_liquid_assets_ratio_score, v_liquid_assets_ratio_reason,
            v_token_diversification_score, v_token_diversification_reason,
            v_stable_verified_assets_score, v_stable_verified_assets_reason,
            v_low_risk_holdings_score, v_low_risk_holdings_reason,
            v_sophisticated_composition_score, v_sophisticated_composition_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary, now(), 'recalculation - refined portfolio logic v2 (business-oriented reasons + tracking + bilingüe)', 'system'
        )
        ON CONFLICT (wallet_id, chain_id) DO UPDATE
        SET 
            total_value_health_score = EXCLUDED.total_value_health_score,
            total_value_health_reason = EXCLUDED.total_value_health_reason,
            liquid_assets_ratio_score = EXCLUDED.liquid_assets_ratio_score,
            liquid_assets_ratio_reason = EXCLUDED.liquid_assets_ratio_reason,
            token_diversification_score = EXCLUDED.token_diversification_score,
            token_diversification_reason = EXCLUDED.token_diversification_reason,
            stable_verified_assets_score = EXCLUDED.stable_verified_assets_score,
            stable_verified_assets_reason = EXCLUDED.stable_verified_assets_reason,
            low_risk_holdings_score = EXCLUDED.low_risk_holdings_score,
            low_risk_holdings_reason = EXCLUDED.low_risk_holdings_reason,
            sophisticated_composition_score = EXCLUDED.sophisticated_composition_score,
            sophisticated_composition_reason = EXCLUDED.sophisticated_composition_reason,
            block_basic_score = EXCLUDED.block_basic_score,
            block_intermediate_score = EXCLUDED.block_intermediate_score,
            block_advanced_score = EXCLUDED.block_advanced_score,
            pillar_score = EXCLUDED.pillar_score,
            pillar_summary = EXCLUDED.pillar_summary,            
            calculated_at = EXCLUDED.calculated_at,
            change_reason = EXCLUDED.change_reason,
            calculated_by = EXCLUDED.calculated_by;

        v_processed := v_processed + 1;
    END LOOP;
    DROP TABLE IF EXISTS temp_portafolio_agg;
    DROP TABLE IF EXISTS temp_pillar_wallets;
    RETURN v_processed;
END;`r`n$;
;
