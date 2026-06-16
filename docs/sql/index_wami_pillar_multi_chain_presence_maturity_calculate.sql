-- Optimizado: temp wallets + tracking batch; sin ::DATE.
-- Test: EXPLAIN ANALYZE SELECT index_wami.pillar_multi_chain_presence_maturity_calculate(10);

CREATE OR REPLACE FUNCTION index_wami.pillar_multi_chain_presence_maturity_calculate(p_limit integer DEFAULT 100)
RETURNS integer
    LANGUAGE plpgsql
AS $$
DECLARE
    v_processed integer := 0;
    w               record;
    -- ====================== SCORES POR ITEM ======================
    -- Bloque Básica (10 pts)
    v_activity_span_age_score        numeric := 0;
    v_activity_span_age_reason       jsonb;
    v_multi_chain_presence_score     numeric := 0;
    v_multi_chain_presence_reason    jsonb;

    -- Bloque Intermedia (9 pts)
    v_cross_chain_balance_score      numeric := 0;
    v_cross_chain_balance_reason     jsonb;
    v_sustained_engagement_score     numeric := 0;
    v_sustained_engagement_reason    jsonb;

    -- Bloque Avanzada (6 pts)
    v_high_active_chains_score       numeric := 0;
    v_high_active_chains_reason      jsonb;
    v_cross_chain_consistency_score  numeric := 0;
    v_cross_chain_consistency_reason jsonb;

    -- Bloques resumen
    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0; 

    -- NUEVO: Resumen detallado del pilar
    v_pillar_summary     jsonb;

BEGIN
    CREATE TEMP TABLE temp_pillar_wallets ON COMMIT DROP AS
    SELECT 
            wtd.wallet_id,
            wtd.chain_id,
            wcc.activity_span_days,
            wcc.number_of_active_chains,
            wcc.first_activity_at,
            wcc.last_activity_at,
            wcc.active_chains,
            wcc.is_multi_chain
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN walcert.wallet_cross_chain wcc 
               ON wtd.wallet_id = wcc.wallet_id 
              AND wtd.chain_id = wcc.chain_id
        LEFT JOIN index_wami.pillar_multi_chain_presence_maturity pmc 
               ON wtd.wallet_id = pmc.wallet_id 
              AND wtd.chain_id = pmc.chain_id
        WHERE pmc.wallet_id IS NULL 
           OR pmc.calculated_at < CURRENT_DATE::timestamptz
        ORDER BY pmc.calculated_at ASC NULLS FIRST
        LIMIT p_limit;

    INSERT INTO index_wami.index_wami_tracking (wallet_id, chain_id)
    SELECT wallet_id, chain_id FROM temp_pillar_wallets
    ON CONFLICT (wallet_id, chain_id) DO NOTHING;

    WITH existing AS (
        SELECT ep.* FROM temp_pillar_wallets t
        INNER JOIN index_wami.pillar_multi_chain_presence_maturity ep
            ON ep.wallet_id = t.wallet_id AND ep.chain_id = t.chain_id
    ),
    archive AS (
        SELECT
            e.wallet_id, e.chain_id,
            to_char(COALESCE(e.calculated_at::date, CURRENT_DATE), 'YYYY-MM') AS current_month,
            e.calculated_at, e.pillar_score,
            e.block_basic_score, e.block_intermediate_score, e.block_advanced_score,
            it.pillar_multi_chain_presence_maturity_score_last_30_days AS old_last_30,
            it.pillar_multi_chain_presence_maturity_score_tracking AS old_tracking
        FROM existing e
        INNER JOIN index_wami.index_wami_tracking it
            ON it.wallet_id = e.wallet_id AND it.chain_id = e.chain_id
    ),
    computed AS (
        SELECT a.*,
            (
                SELECT jsonb_agg(elem) FROM (
                    SELECT elem FROM jsonb_array_elements(
                        jsonb_build_array(jsonb_build_object(
                            'date', a.calculated_at, 'pillar_score', a.pillar_score,
                            'block_basic_score', a.block_basic_score,
                            'block_intermediate_score', a.block_intermediate_score,
                            'block_advanced_score', a.block_advanced_score
                        )) || COALESCE((
                            SELECT jsonb_agg(e2) FROM jsonb_array_elements(COALESCE(a.old_last_30,'[]'::jsonb)) e2
                            WHERE e2->>'date' != CURRENT_DATE::text
                        ), '[]'::jsonb)
                    ) elem
                    WHERE (elem->>'date')::date >= (CURRENT_DATE - INTERVAL '30 days')
                ) sub
            ) AS new_last_30,
            COALESCE((
                SELECT jsonb_agg(
                    CASE WHEN elem->>'date' = a.current_month THEN
                        jsonb_build_object('date', a.current_month, 'avg_score',
                            CASE WHEN (elem->>'avg_score') IS NOT NULL
                                THEN ((elem->>'avg_score')::numeric + a.pillar_score) / 2.0
                                ELSE a.pillar_score END)
                    ELSE elem END)
                FROM jsonb_array_elements(COALESCE(a.old_tracking,'[]'::jsonb)) elem
            ), jsonb_build_array(jsonb_build_object('date', a.current_month, 'avg_score', a.pillar_score))) AS new_monthly
        FROM archive a
    )
    UPDATE index_wami.index_wami_tracking it
    SET pillar_multi_chain_presence_maturity_score_last_30_days = c.new_last_30, pillar_multi_chain_presence_maturity_score_tracking = c.new_monthly
    FROM computed c
    WHERE it.wallet_id = c.wallet_id AND it.chain_id = c.chain_id;

    FOR w IN SELECT * FROM temp_pillar_wallets LOOP
        -- ====================== BLOQUE BÁSICA (10 pts) ======================

        -- 1. Activity Span Age
        IF COALESCE(w.activity_span_days, 0) >= 90 THEN
            v_activity_span_age_score := 5.0;
            v_activity_span_age_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'first_activity_at', w.first_activity_at,
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet demonstrates exceptional longevity with over 90 days of continuous activity, reflecting strong long-term commitment and high operational maturity in the ecosystem.',
                'reason_esp', 'La wallet demuestra una longevidad excepcional con más de 90 días de actividad continua, reflejando un fuerte compromiso a largo plazo y alta madurez operativa en el ecosistema.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 60 THEN
            v_activity_span_age_score := 4.0;
            v_activity_span_age_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'first_activity_at', w.first_activity_at,
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet exhibits solid longevity (60-89 days), indicating reliable and sustained participation with significantly reduced risk of being a short-term wallet.',
                'reason_esp', 'La wallet muestra una longevidad sólida (60-89 días), indicando participación confiable y sostenida con riesgo significativamente reducido de ser una wallet de corto plazo.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 30 THEN
            v_activity_span_age_score := 3.0;
            v_activity_span_age_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'first_activity_at', w.first_activity_at,
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet shows moderate activity span (30-59 days), demonstrating emerging stability and genuine engagement in the network.',
                'reason_esp', 'La wallet muestra un período de actividad moderado (30-59 días), demostrando estabilidad emergente y engagement genuino en la red.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 15 THEN
            v_activity_span_age_score := 2.0;
            v_activity_span_age_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'first_activity_at', w.first_activity_at,
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet is relatively new (15-29 days) but already building a credible track record of activity.',
                'reason_esp', 'La wallet es relativamente nueva (15-29 días) pero ya está construyendo un historial creíble de actividad.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 7 THEN
            v_activity_span_age_score := 1.0;
            v_activity_span_age_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'first_activity_at', w.first_activity_at,
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet has minimal activity span (7-14 days), typical of newer wallets with limited proven maturity.',
                'reason_esp', 'La wallet tiene un período de actividad mínimo (7-14 días), típico de wallets más nuevas con madurez probada limitada.'
            );
        ELSE
            v_activity_span_age_score := 0.0;
            v_activity_span_age_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'first_activity_at', w.first_activity_at,
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet shows very limited or no meaningful activity span, indicating low operational maturity or recent creation.',
                'reason_esp', 'La wallet muestra un período de actividad muy limitado o nulo, indicando baja madurez operativa o creación reciente.'
            );
        END IF;

        -- 2. Multi Chain Presence
        IF COALESCE(w.number_of_active_chains, 0) >= 6 THEN
            v_multi_chain_presence_score := 5.0;
            v_multi_chain_presence_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains', w.active_chains,
                'reason_eng', 'Wallet operates on 6 or more chains, demonstrating exceptional technical sophistication and advanced risk diversification.',
                'reason_esp', 'La wallet opera en 6 o más chains, demostrando una sofisticación técnica excepcional y una diversificación de riesgo avanzada.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 5 THEN
            v_multi_chain_presence_score := 4.0;
            v_multi_chain_presence_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains', w.active_chains,
                'reason_eng', 'Wallet operates on 5 chains, reflecting strong multi-chain capability and good risk mitigation.',
                'reason_esp', 'La wallet opera en 5 chains, reflejando una fuerte capacidad multi-chain y buena mitigación de riesgo.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 4 THEN
            v_multi_chain_presence_score := 3.0;
            v_multi_chain_presence_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains', w.active_chains,
                'reason_eng', 'Wallet operates on 4 chains, showing solid multi-chain presence and moderate diversification.',
                'reason_esp', 'La wallet opera en 4 chains, mostrando una presencia multi-chain sólida y diversificación moderada.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 3 THEN
            v_multi_chain_presence_score := 2.0;
            v_multi_chain_presence_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains', w.active_chains,
                'reason_eng', 'Wallet operates on 3 chains, indicating basic multi-chain awareness.',
                'reason_esp', 'La wallet opera en 3 chains, indicando una conciencia básica multi-chain.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 2 THEN
            v_multi_chain_presence_score := 1.0;
            v_multi_chain_presence_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains', w.active_chains,
                'reason_eng', 'Wallet operates on 2 chains, showing initial steps toward multi-chain diversification.',
                'reason_esp', 'La wallet opera en 2 chains, mostrando los primeros pasos hacia la diversificación multi-chain.'
            );
        ELSE
            v_multi_chain_presence_score := 0.0;
            v_multi_chain_presence_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains', w.active_chains,
                'reason_eng', 'Wallet is single-chain only, limiting diversification and increasing concentration risk.',
                'reason_esp', 'La wallet es de una sola chain, limitando la diversificación y aumentando el riesgo de concentración.'
            );
        END IF;

        v_block_basic := v_activity_span_age_score + v_multi_chain_presence_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================

        -- 3. Cross Chain Balance
        IF COALESCE(w.number_of_active_chains, 0) >= 4 THEN
            v_cross_chain_balance_score := 5.0;
            v_cross_chain_balance_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains_json', w.active_chains,
                'reason_eng', 'Capital is excellently distributed across 4+ chains, significantly reducing concentration risk and improving portfolio resilience.',
                'reason_esp', 'El capital está excelentemente distribuido en 4+ chains, reduciendo significativamente el riesgo de concentración y mejorando la resiliencia del portafolio.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 3 THEN
            v_cross_chain_balance_score := 3.0;
            v_cross_chain_balance_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains_json', w.active_chains,
                'reason_eng', 'Capital shows good distribution across 3 chains, providing moderate risk mitigation.',
                'reason_esp', 'El capital muestra una buena distribución en 3 chains, proporcionando una mitigación de riesgo moderada.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 2 THEN
            v_cross_chain_balance_score := 1.0;
            v_cross_chain_balance_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains_json', w.active_chains,
                'reason_eng', 'Capital is spread across 2 chains, offering basic diversification.',
                'reason_esp', 'El capital está distribuido en 2 chains, ofreciendo una diversificación básica.'
            );
        ELSE
            v_cross_chain_balance_score := 0.0;
            v_cross_chain_balance_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'active_chains_json', w.active_chains,
                'reason_eng', 'All capital is concentrated in a single chain, exposing the wallet to higher concentration risk.',
                'reason_esp', 'Todo el capital está concentrado en una sola chain, exponiendo la wallet a un mayor riesgo de concentración.'
            );
        END IF;

        -- 4. Sustained Engagement
        IF COALESCE(w.activity_span_days, 0) >= 90 AND w.last_activity_at >= NOW() - INTERVAL '7 days' THEN
            v_sustained_engagement_score := 5.0;
            v_sustained_engagement_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet demonstrates exceptional sustained engagement with over 90 days of history and very recent activity (last 7 days), indicating extremely high reliability and long-term operational commitment.',
                'reason_esp', 'La wallet demuestra un engagement sostenido excepcional con más de 90 días de historial y actividad muy reciente (últimos 7 días), indicando una confiabilidad extremadamente alta y compromiso operativo a largo plazo.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 60 AND w.last_activity_at >= NOW() - INTERVAL '7 days' THEN
            v_sustained_engagement_score := 4.0;
            v_sustained_engagement_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet shows strong sustained engagement (60+ days) with recent activity in the last 7 days, reflecting solid long-term participation and low abandonment risk.',
                'reason_esp', 'La wallet muestra un fuerte engagement sostenido (60+ días) con actividad reciente en los últimos 7 días, reflejando una participación sólida a largo plazo y bajo riesgo de abandono.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 30 AND w.last_activity_at >= NOW() - INTERVAL '15 days' THEN
            v_sustained_engagement_score := 3.0;
            v_sustained_engagement_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet maintains moderate sustained engagement (30+ days) with activity in the last 15 days, demonstrating consistent but not yet elite maturity.',
                'reason_esp', 'La wallet mantiene un engagement sostenido moderado (30+ días) con actividad en los últimos 15 días, demostrando consistencia pero aún no madurez de élite.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 15 AND w.last_activity_at >= NOW() - INTERVAL '15 days' THEN
            v_sustained_engagement_score := 2.0;
            v_sustained_engagement_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet shows emerging sustained engagement (15+ days) with recent activity, indicating positive but still developing long-term behavior.',
                'reason_esp', 'La wallet muestra un engagement sostenido emergente (15+ días) con actividad reciente, indicando un comportamiento positivo pero aún en desarrollo a largo plazo.'
            );
        ELSIF COALESCE(w.activity_span_days, 0) >= 7 THEN
            v_sustained_engagement_score := 1.0;
            v_sustained_engagement_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet has basic sustained engagement (7+ days), typical of newer wallets beginning to establish a track record.',
                'reason_esp', 'La wallet tiene un engagement sostenido básico (7+ días), típico de wallets más nuevas que comienzan a establecer un historial.'
            );
        ELSE
            v_sustained_engagement_score := 0.0;
            v_sustained_engagement_reason := jsonb_build_object(
                'activity_span_days', COALESCE(w.activity_span_days, 0),
                'last_activity_at', w.last_activity_at,
                'reason_eng', 'Wallet lacks sustained engagement, showing sporadic or very recent activity only, which increases perceived risk of low commitment.',
                'reason_esp', 'La wallet carece de engagement sostenido, mostrando solo actividad esporádica o muy reciente, lo que aumenta el riesgo percibido de bajo compromiso.'
            );
        END IF;

        v_block_intermediate := v_cross_chain_balance_score + v_sustained_engagement_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================

        -- 5. High Active Chains
        IF COALESCE(w.number_of_active_chains, 0) >= 6 THEN
            v_high_active_chains_score := 5.0;
            v_high_active_chains_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'reason_eng', 'Wallet actively operates on 6+ chains simultaneously, reflecting exceptional operational maturity and professional-grade multi-chain capability.',
                'reason_esp', 'La wallet opera activamente en 6+ chains simultáneamente, reflejando una madurez operativa excepcional y capacidad multi-chain de nivel profesional.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 5 THEN
            v_high_active_chains_score := 4.0;
            v_high_active_chains_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'reason_eng', 'Wallet actively operates on 5 chains, demonstrating very high multi-chain engagement.',
                'reason_esp', 'La wallet opera activamente en 5 chains, demostrando un engagement multi-chain muy alto.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 4 THEN
            v_high_active_chains_score := 3.0;
            v_high_active_chains_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'reason_eng', 'Wallet actively operates on 4 chains, showing strong multi-chain operational capacity.',
                'reason_esp', 'La wallet opera activamente en 4 chains, mostrando una fuerte capacidad operativa multi-chain.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 3 THEN
            v_high_active_chains_score := 2.0;
            v_high_active_chains_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'reason_eng', 'Wallet actively operates on 3 chains, indicating solid multi-chain activity.',
                'reason_esp', 'La wallet opera activamente en 3 chains, indicando una actividad multi-chain sólida.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 2 THEN
            v_high_active_chains_score := 1.0;
            v_high_active_chains_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'reason_eng', 'Wallet actively operates on 2 chains, showing basic multi-chain engagement.',
                'reason_esp', 'La wallet opera activamente en 2 chains, mostrando un engagement multi-chain básico.'
            );
        ELSE
            v_high_active_chains_score := 0.0;
            v_high_active_chains_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'reason_eng', 'Wallet is not demonstrating meaningful multi-chain activity.',
                'reason_esp', 'La wallet no está demostrando una actividad multi-chain significativa.'
            );
        END IF;

        -- 6. Cross Chain Consistency
        IF COALESCE(w.number_of_active_chains, 0) >= 3 THEN
            v_cross_chain_consistency_score := 3.0;
            v_cross_chain_consistency_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'is_multi_chain', COALESCE(w.is_multi_chain, false),
                'reason_eng', 'Activity is consistently distributed across 3+ chains, minimizing single-chain dependency and demonstrating robust operational resilience.',
                'reason_esp', 'La actividad está consistentemente distribuida en 3+ chains, minimizando la dependencia de una sola chain y demostrando una resiliencia operativa robusta.'
            );
        ELSIF COALESCE(w.number_of_active_chains, 0) >= 2 THEN
            v_cross_chain_consistency_score := 1.5;
            v_cross_chain_consistency_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'is_multi_chain', COALESCE(w.is_multi_chain, false),
                'reason_eng', 'Activity is spread across 2 chains, providing basic cross-chain consistency.',
                'reason_esp', 'La actividad está distribuida en 2 chains, proporcionando una consistencia básica cross-chain.'
            );
        ELSE
            v_cross_chain_consistency_score := 0.0;
            v_cross_chain_consistency_reason := jsonb_build_object(
                'number_of_active_chains', COALESCE(w.number_of_active_chains, 0),
                'is_multi_chain', COALESCE(w.is_multi_chain, false),
                'reason_eng', 'Wallet is single-chain only, with no cross-chain consistency.',
                'reason_esp', 'La wallet es de una sola chain, sin consistencia cross-chain.'
            );
        END IF;

        v_block_advanced := v_high_active_chains_score + v_cross_chain_consistency_score;

        -- ====================== TOTAL ======================
        v_total_score := v_block_basic + v_block_intermediate + v_block_advanced;

                -- ====================== ANÁLISIS NARRATIVO DEL PILAR MULTI-CHAIN PRESENCE MATURITY (LENGUAJE DE NEGOCIO) ======================
        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'The wallet demonstrates exceptional multi-chain maturity with outstanding longevity, diversification and consistency.'
                    WHEN v_total_score >= 18.5 THEN 'The wallet shows strong multi-chain presence and good operational maturity.'
                    WHEN v_total_score >= 15.0 THEN 'The wallet has acceptable multi-chain activity but still has room to improve diversification and consistency.'
                    WHEN v_total_score >= 11.0 THEN 'The wallet has moderate to weak multi-chain maturity with limited diversification.'
                    ELSE 'The wallet exhibits very low multi-chain maturity. High concentration risk and limited operational history.'
                END,

            'overall_assessment_esp', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'La wallet demuestra una madurez multi-chain excepcional con longevidad, diversificación y consistencia sobresalientes.'
                    WHEN v_total_score >= 18.5 THEN 'La wallet muestra una fuerte presencia multi-chain y buena madurez operativa.'
                    WHEN v_total_score >= 15.0 THEN 'La wallet tiene actividad multi-chain aceptable pero aún tiene espacio para mejorar diversificación y consistencia.'
                    WHEN v_total_score >= 11.0 THEN 'La wallet tiene madurez multi-chain moderada a débil con diversificación limitada.'
                    ELSE 'La wallet presenta una madurez multi-chain muy baja. Alto riesgo de concentración e historial operativo limitado.'
                END,

            'business_interpretation_eng', 
                'This Multi-Chain Presence pillar evaluates the wallet''s longevity, ability to operate across multiple networks, capital distribution and sustained engagement. ' ||
                CASE 
                    WHEN v_multi_chain_presence_score <= 1.0 THEN 'The wallet is mostly single-chain, exposing it to significant concentration risk. '
                    WHEN v_cross_chain_balance_score = 0 THEN 'Capital is poorly distributed across chains. '
                    WHEN v_sustained_engagement_score <= 2.0 THEN 'Sustained engagement is weak, indicating potential short-term behavior. '
                    ELSE 'The wallet demonstrates solid multi-chain operational capabilities. '
                END ||
                'Overall, the current level suggests ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'high risk due to lack of diversification.'
                    WHEN v_total_score < 15.0 THEN 'moderate risk with limited resilience.'
                    WHEN v_total_score < 18.5 THEN 'acceptable maturity but not yet advanced.'
                    ELSE 'strong risk mitigation and operational sophistication.'
                END,

            'business_interpretation_esp', 
                'Este pilar Multi-Chain Presence evalúa la longevidad de la wallet, su capacidad para operar en múltiples redes, la distribución de capital y el engagement sostenido. ' ||
                CASE 
                    WHEN v_multi_chain_presence_score <= 1.0 THEN 'La wallet es mayormente de una sola chain, exponiéndola a un riesgo significativo de concentración. '
                    WHEN v_cross_chain_balance_score = 0 THEN 'El capital está mal distribuido entre chains. '
                    WHEN v_sustained_engagement_score <= 2.0 THEN 'El engagement sostenido es débil, indicando posible comportamiento de corto plazo. '
                    ELSE 'La wallet demuestra sólidas capacidades operativas multi-chain. '
                END ||
                'En general, el nivel actual sugiere ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'alto riesgo por falta de diversificación.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado con resiliencia limitada.'
                    WHEN v_total_score < 18.5 THEN 'madurez aceptable pero aún no avanzada.'
                    ELSE 'fuerte mitigación de riesgo y sofisticación operativa.'
                END,

            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_activity_span_age_score >= 4.0 THEN 'Proven long-term activity span' END),
                        (CASE WHEN v_multi_chain_presence_score >= 4.0 THEN 'Excellent multi-chain presence' END),
                        (CASE WHEN v_cross_chain_balance_score >= 3.0 THEN 'Well-balanced capital distribution' END),
                        (CASE WHEN v_sustained_engagement_score >= 4.0 THEN 'Strong sustained engagement' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_activity_span_age_score >= 4.0 THEN 'Período de actividad a largo plazo probado' END),
                        (CASE WHEN v_multi_chain_presence_score >= 4.0 THEN 'Excelente presencia multi-chain' END),
                        (CASE WHEN v_cross_chain_balance_score >= 3.0 THEN 'Buena distribución equilibrada de capital' END),
                        (CASE WHEN v_sustained_engagement_score >= 4.0 THEN 'Fuerte engagement sostenido' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_multi_chain_presence_score <= 1.0 THEN 'Primarily single-chain operation' END),
                        (CASE WHEN v_cross_chain_balance_score <= 1.0 THEN 'Poor capital distribution across chains' END),
                        (CASE WHEN v_sustained_engagement_score <= 2.0 THEN 'Weak sustained engagement' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_multi_chain_presence_score <= 1.0 THEN 'Operación principalmente en una sola chain' END),
                        (CASE WHEN v_cross_chain_balance_score <= 1.0 THEN 'Mala distribución de capital entre chains' END),
                        (CASE WHEN v_sustained_engagement_score <= 2.0 THEN 'Débil engagement sostenido' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            -- ====================== RECOMENDACIÓN DINÁMICA ======================
            'recommendation_eng', 
                CASE 
                    WHEN v_multi_chain_presence_score <= 1.0 THEN 'Priority: Expand operations to at least 3-4 different chains to reduce concentration risk.'
                    WHEN v_cross_chain_balance_score <= 1.0 THEN 'Focus on better distributing assets and activity across multiple chains for improved resilience.'
                    WHEN v_sustained_engagement_score <= 2.0 THEN 'Increase consistent activity over time to demonstrate long-term commitment.'
                    ELSE 'Continue expanding multi-chain presence and maintaining balanced activity to achieve elite maturity.'
                END,

            'recommendation_esp', 
                CASE 
                    WHEN v_multi_chain_presence_score <= 1.0 THEN 'Prioridad: Expandir operaciones a al menos 3-4 chains diferentes para reducir el riesgo de concentración.'
                    WHEN v_cross_chain_balance_score <= 1.0 THEN 'Enfocarse en distribuir mejor los activos y la actividad entre múltiples chains para mejorar la resiliencia.'
                    WHEN v_sustained_engagement_score <= 2.0 THEN 'Aumentar la actividad consistente a lo largo del tiempo para demostrar compromiso a largo plazo.'
                    ELSE 'Continuar expandiendo la presencia multi-chain y manteniendo actividad equilibrada para alcanzar madurez de élite.'
                END,

            'last_calculated', now()
        );

        -- ====================== UPSERT ======================
        INSERT INTO index_wami.pillar_multi_chain_presence_maturity (
            wallet_id, chain_id,
            activity_span_age_score, activity_span_age_reason,
            multi_chain_presence_score, multi_chain_presence_reason,
            cross_chain_balance_score, cross_chain_balance_reason,
            sustained_engagement_score, sustained_engagement_reason,
            high_active_chains_score, high_active_chains_reason,
            cross_chain_consistency_score, cross_chain_consistency_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary, calculated_at, change_reason, calculated_by
        )
        VALUES (
            w.wallet_id,
            w.chain_id,
            v_activity_span_age_score, v_activity_span_age_reason,
            v_multi_chain_presence_score, v_multi_chain_presence_reason,
            v_cross_chain_balance_score, v_cross_chain_balance_reason,
            v_sustained_engagement_score, v_sustained_engagement_reason,
            v_high_active_chains_score, v_high_active_chains_reason,
            v_cross_chain_consistency_score, v_cross_chain_consistency_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary, now(), 'recalculation - refined multi-chain maturity logic v2 (business-oriented reasons + tracking + bilingüe)', 'system'
        )
        ON CONFLICT (wallet_id, chain_id) DO UPDATE
        SET 
            activity_span_age_score = EXCLUDED.activity_span_age_score,
            activity_span_age_reason = EXCLUDED.activity_span_age_reason,
            multi_chain_presence_score = EXCLUDED.multi_chain_presence_score,
            multi_chain_presence_reason = EXCLUDED.multi_chain_presence_reason,
            cross_chain_balance_score = EXCLUDED.cross_chain_balance_score,
            cross_chain_balance_reason = EXCLUDED.cross_chain_balance_reason,
            sustained_engagement_score = EXCLUDED.sustained_engagement_score,
            sustained_engagement_reason = EXCLUDED.sustained_engagement_reason,
            high_active_chains_score = EXCLUDED.high_active_chains_score,
            high_active_chains_reason = EXCLUDED.high_active_chains_reason,
            cross_chain_consistency_score = EXCLUDED.cross_chain_consistency_score,
            cross_chain_consistency_reason = EXCLUDED.cross_chain_consistency_reason,
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

    DROP TABLE IF EXISTS temp_pillar_wallets;
    RETURN v_processed;
END;
$$;
