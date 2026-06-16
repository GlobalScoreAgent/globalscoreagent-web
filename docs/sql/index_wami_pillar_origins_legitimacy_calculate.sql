-- Optimizado: temp wallets + tracking batch; sin ::DATE.
-- Test: EXPLAIN ANALYZE SELECT index_wami.pillar_origins_legitimacy_calculate(10);

CREATE OR REPLACE FUNCTION index_wami.pillar_origins_legitimacy_calculate(p_limit integer DEFAULT 100)
RETURNS integer
    LANGUAGE plpgsql
AS $$
DECLARE
    v_processed integer := 0;
    w               record;
    -- ====================== SCORES POR ITEM ======================
    -- Bloque Básica (10 pts)
    v_first_funds_quality_score       numeric := 0;
    v_first_funds_quality_reason      jsonb;
    v_mixing_risk_score               numeric := 0;
    v_mixing_risk_reason              jsonb;

    -- Bloque Intermedia (9 pts)
    v_low_cex_reliance_score          numeric := 0;
    v_low_cex_reliance_reason         jsonb;
    v_funding_diversity_score         numeric := 0;
    v_funding_diversity_reason        jsonb;

    -- Bloque Avanzada (6 pts)
    v_low_inflow_concentration_score  numeric := 0;
    v_low_inflow_concentration_reason jsonb;
    v_minimal_mixing_risk_score       numeric := 0;
    v_minimal_mixing_risk_reason      jsonb;

    v_pillar_summary             jsonb;

    -- Bloques resumen
    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0; 

BEGIN
    CREATE TEMP TABLE temp_pillar_wallets ON COMMIT DROP AS
    SELECT 
            wtd.wallet_id,
            wtd.chain_id,
            wfo.primary_source_type,
            wfo.has_mint_activity,
            wfo.is_cex_origin,
            wfo.detected_cex_addresses,
            wfo.unique_senders,
            wfo.inflow_diversity_ratio,
            wfo.total_transfers,
            wfo.inflow_concentration_score,
            wfo.suspected_mixing_score,
            wfo.mixing_risk
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN walcert.wallet_fund_origins wfo 
               ON wtd.wallet_id = wfo.wallet_id 
              AND wtd.chain_id = wfo.chain_id
        LEFT JOIN index_wami.pillar_origins_legitimacy pwo 
               ON wtd.wallet_id = pwo.wallet_id 
              AND wtd.chain_id = pwo.chain_id
        WHERE pwo.wallet_id IS NULL 
           OR pwo.calculated_at < CURRENT_DATE::timestamptz
        ORDER BY pwo.calculated_at ASC NULLS FIRST
        LIMIT p_limit;

    INSERT INTO index_wami.index_wami_tracking (wallet_id, chain_id)
    SELECT wallet_id, chain_id FROM temp_pillar_wallets
    ON CONFLICT (wallet_id, chain_id) DO NOTHING;

    WITH existing AS (
        SELECT ep.* FROM temp_pillar_wallets t
        INNER JOIN index_wami.pillar_origins_legitimacy ep
            ON ep.wallet_id = t.wallet_id AND ep.chain_id = t.chain_id
    ),
    archive AS (
        SELECT
            e.wallet_id, e.chain_id,
            to_char(COALESCE(e.calculated_at::date, CURRENT_DATE), 'YYYY-MM') AS current_month,
            e.calculated_at, e.pillar_score,
            e.block_basic_score, e.block_intermediate_score, e.block_advanced_score,
            it.pillar_origins_legitimacy_score_last_30_days AS old_last_30,
            it.pillar_origins_legitimacy_score_tracking AS old_tracking
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
    SET pillar_origins_legitimacy_score_last_30_days = c.new_last_30, pillar_origins_legitimacy_score_tracking = c.new_monthly
    FROM computed c
    WHERE it.wallet_id = c.wallet_id AND it.chain_id = c.chain_id;

    FOR w IN SELECT * FROM temp_pillar_wallets LOOP
        -- ====================== BLOQUE BÁSICA (10 pts) ======================

        -- 1. First Funds Quality
        DECLARE
            v_primary text := COALESCE(w.primary_source_type, 'unknown');
            v_is_mint boolean := COALESCE(w.has_mint_activity, false);
        BEGIN
            IF w.is_cex_origin = false 
               AND v_primary IN ('dex', 'bridge', 'organic', 'airdrop', 'wallet') 
               AND NOT v_is_mint THEN
                v_first_funds_quality_score := 8.0;
                v_first_funds_quality_reason := jsonb_build_object(
                    'reason_eng', 'Clean organic first inflow from DEX/bridge/airdrop without mint activity, indicating high legitimacy and low risk of illicit funding.',
                    'reason_esp', 'Primer flujo orgánico limpio desde DEX/bridge/airdrop sin actividad de mint, indicando alta legitimidad y bajo riesgo de fondos ilícitos.',
                    'primary_source', v_primary,
                    'has_mint_activity', false
                );
            ELSIF w.is_cex_origin = false THEN
                v_first_funds_quality_score := 6.0;
                v_first_funds_quality_reason := jsonb_build_object(
                    'reason_eng', 'Non-CEX origin but not perfectly clean first funds, showing acceptable legitimacy with minor risk factors.',
                    'reason_esp', 'Origen no-CEX pero no perfectamente limpio, mostrando legitimidad aceptable con factores de riesgo menores.',
                    'primary_source', v_primary
                );
            ELSIF w.is_cex_origin = true AND v_is_mint THEN
                v_first_funds_quality_score := 1.0;
                v_first_funds_quality_reason := jsonb_build_object(
                    'reason_eng', 'High-risk first inflow from CEX combined with mint activity, significantly increasing concerns about potential illicit or manipulated funding.',
                    'reason_esp', 'Primer flujo de alto riesgo desde CEX combinado con actividad de mint, aumentando significativamente las preocupaciones sobre fondos ilícitos o manipulados.',
                    'primary_source', v_primary,
                    'has_mint_activity', true
                );
            ELSE
                v_first_funds_quality_score := 3.0;
                v_first_funds_quality_reason := jsonb_build_object(
                    'reason_eng', 'First inflow originated from centralized exchange (CEX), introducing moderate regulatory and counterparty risk.',
                    'reason_esp', 'Primer flujo originado de exchange centralizado (CEX), introduciendo riesgo regulatorio y de contraparte moderado.',
                    'primary_source', v_primary
                );
            END IF;
        END;

        -- 2. Mixing Risk
        IF COALESCE(w.suspected_mixing_score, 100) <= 5 THEN
            v_mixing_risk_score := 5.0;
            v_mixing_risk_reason := jsonb_build_object(
                'suspected_mixing_score', w.suspected_mixing_score,
                'mixing_risk', w.mixing_risk,
                'reason_eng', 'Exceptionally low mixing risk (score ≤5), confirming virtually no exposure to mixing/tumbling services and very high fund legitimacy.',
                'reason_esp', 'Riesgo de mixing excepcionalmente bajo (score ≤5), confirmando prácticamente ninguna exposición a servicios de mixing/tumbling y muy alta legitimidad de fondos.'
            );
        ELSIF COALESCE(w.suspected_mixing_score, 100) <= 15 THEN
            v_mixing_risk_score := 4.0;
            v_mixing_risk_reason := jsonb_build_object(
                'suspected_mixing_score', w.suspected_mixing_score,
                'mixing_risk', w.mixing_risk,
                'reason_eng', 'Low mixing risk (score ≤15), indicating minimal exposure to suspicious mixing services and good overall fund cleanliness.',
                'reason_esp', 'Bajo riesgo de mixing (score ≤15), indicando exposición mínima a servicios de mixing sospechosos y buena limpieza general de fondos.'
            );
        ELSIF COALESCE(w.suspected_mixing_score, 100) <= 30 THEN
            v_mixing_risk_score := 3.0;
            v_mixing_risk_reason := jsonb_build_object(
                'suspected_mixing_score', w.suspected_mixing_score,
                'mixing_risk', w.mixing_risk,
                'reason_eng', 'Moderate mixing risk (score ≤30), acceptable for most business use cases but warranting continued monitoring.',
                'reason_esp', 'Riesgo de mixing moderado (score ≤30), aceptable para la mayoría de casos de negocio pero que requiere monitoreo continuo.'
            );
        ELSE
            v_mixing_risk_score := 0.0;
            v_mixing_risk_reason := jsonb_build_object(
                'suspected_mixing_score', w.suspected_mixing_score,
                'mixing_risk', w.mixing_risk,
                'reason_eng', 'High mixing risk detected, suggesting significant potential exposure to illicit funds or tumbling services.',
                'reason_esp', 'Alto riesgo de mixing detectado, sugiriendo exposición significativa a fondos ilícitos o servicios de tumbling.'
            );
        END IF;

        v_block_basic := v_first_funds_quality_score + v_mixing_risk_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================

        -- 3. Low CEX Reliance
        IF w.is_cex_origin = false THEN
            v_low_cex_reliance_score := 5.0;
            v_low_cex_reliance_reason := jsonb_build_object(
                'is_cex_origin', false,
                'detected_cex_count', jsonb_array_length(COALESCE(w.detected_cex_addresses, '[]'::jsonb)),
                'reason_eng', 'No CEX origin detected, demonstrating excellent legitimacy and minimal centralized counterparty or regulatory risk.',
                'reason_esp', 'No se detectó origen de CEX, demostrando excelente legitimidad y riesgo mínimo de contraparte centralizada o regulatorio.'
            );
        ELSE
            DECLARE
                v_cex_count integer := jsonb_array_length(COALESCE(w.detected_cex_addresses, '[]'::jsonb));
            BEGIN
                IF v_cex_count <= 2 THEN
                    v_low_cex_reliance_score := 3.0;
                    v_low_cex_reliance_reason := jsonb_build_object(
                        'is_cex_origin', true,
                        'detected_cex_count', v_cex_count,
                        'reason_eng', 'Limited CEX origin with ≤2 addresses, representing moderate but manageable centralized exposure.',
                        'reason_esp', 'Origen CEX limitado con ≤2 direcciones, representando exposición centralizada moderada pero manejable.'
                    );
                ELSE
                    v_low_cex_reliance_score := 1.0;
                    v_low_cex_reliance_reason := jsonb_build_object(
                        'is_cex_origin', true,
                        'detected_cex_count', v_cex_count,
                        'reason_eng', 'High CEX reliance with >2 detected addresses, increasing regulatory and counterparty risk significantly.',
                        'reason_esp', 'Alta dependencia de CEX con >2 direcciones detectadas, aumentando significativamente el riesgo regulatorio y de contraparte.'
                    );
                END IF;
            END;
        END IF;

        -- 4. Funding Diversity
        DECLARE
            v_diversity numeric := COALESCE(w.inflow_diversity_ratio, 0);
        BEGIN
            IF v_diversity >= 0.80 THEN
                v_funding_diversity_score := 5.0;
                v_funding_diversity_reason := jsonb_build_object(
                    'unique_senders', COALESCE(w.unique_senders, 0),
                    'inflow_diversity_ratio', round(v_diversity, 2),
                    'reason_eng', 'Exceptional funding diversity (ratio ≥80%), indicating broad, organic, and low-risk capital sources with minimal concentration.',
                    'reason_esp', 'Diversidad de financiamiento excepcional (ratio ≥80%), indicando fuentes de capital amplias, orgánicas y de bajo riesgo con mínima concentración.'
                );
            ELSIF v_diversity >= 0.55 THEN
                v_funding_diversity_score := 4.0;
                v_funding_diversity_reason := jsonb_build_object(
                    'unique_senders', COALESCE(w.unique_senders, 0),
                    'inflow_diversity_ratio', round(v_diversity, 2),
                    'reason_eng', 'Strong funding diversity (ratio ≥55%), reflecting healthy and diversified inflow sources.',
                    'reason_esp', 'Fuerte diversidad de financiamiento (ratio ≥55%), reflejando fuentes de entrada saludables y diversificadas.'
                );
            ELSIF v_diversity >= 0.30 THEN
                v_funding_diversity_score := 3.0;
                v_funding_diversity_reason := jsonb_build_object(
                    'unique_senders', COALESCE(w.unique_senders, 0),
                    'inflow_diversity_ratio', round(v_diversity, 2),
                    'reason_eng', 'Moderate funding diversity (ratio ≥30%), acceptable but with room for improvement in source distribution.',
                    'reason_esp', 'Diversidad de financiamiento moderada (ratio ≥30%), aceptable pero con espacio para mejorar la distribución de fuentes.'
                );
            ELSE
                v_funding_diversity_score := 0.0;
                v_funding_diversity_reason := jsonb_build_object(
                    'unique_senders', COALESCE(w.unique_senders, 0),
                    'inflow_diversity_ratio', round(v_diversity, 2),
                    'reason_eng', 'Poor funding diversity with highly concentrated inflows, increasing risk of coordinated or illicit funding.',
                    'reason_esp', 'Pobre diversidad de financiamiento con entradas altamente concentradas, aumentando el riesgo de financiamiento coordinado o ilícito.'
                );
            END IF;
        END;

        v_block_intermediate := v_low_cex_reliance_score + v_funding_diversity_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================

        -- 5. Low Inflow Concentration
        IF COALESCE(w.inflow_concentration_score, 100) <= 30 THEN
            v_low_inflow_concentration_score := 3.0;
            v_low_inflow_concentration_reason := jsonb_build_object(
                'inflow_concentration_score', COALESCE(w.inflow_concentration_score, 100),
                'reason_eng', 'Very low inflow concentration (≤30%), indicating excellent diversification of funding sources and minimal single-source risk.',
                'reason_esp', 'Concentración de entrada muy baja (≤30%), indicando excelente diversificación de fuentes de financiamiento y riesgo mínimo de una sola fuente.'
            );
        ELSIF COALESCE(w.inflow_concentration_score, 100) <= 50 THEN
            v_low_inflow_concentration_score := 1.5;
            v_low_inflow_concentration_reason := jsonb_build_object(
                'inflow_concentration_score', COALESCE(w.inflow_concentration_score, 100),
                'reason_eng', 'Moderate inflow concentration (≤50%), acceptable but with some concentration risk that should be monitored.',
                'reason_esp', 'Concentración de entrada moderada (≤50%), aceptable pero con algo de riesgo de concentración que debe monitorearse.'
            );
        ELSE
            v_low_inflow_concentration_score := 0.0;
            v_low_inflow_concentration_reason := jsonb_build_object(
                'inflow_concentration_score', COALESCE(w.inflow_concentration_score, 100),
                'reason_eng', 'High inflow concentration detected, indicating heavy reliance on few sources and elevated risk of sudden suspicious inflows.',
                'reason_esp', 'Alta concentración de entrada detectada, indicando fuerte dependencia de pocas fuentes y riesgo elevado de entradas sospechosas repentinas.'
            );
        END IF;

        -- 6. Minimal Mixing Risk
        IF COALESCE(w.suspected_mixing_score, 0) = 0 
           AND COALESCE(w.mixing_risk, 'low') = 'low' THEN
            v_minimal_mixing_risk_score := 3.0;
            v_minimal_mixing_risk_reason := jsonb_build_object(
                'suspected_mixing_score', 0,
                'mixing_risk', w.mixing_risk,
                'reason_eng', 'Zero detected mixing risk with clean funding history, confirming highest level of legitimacy and trust in fund origins.',
                'reason_esp', 'Riesgo de mixing detectado cero con historial de fondos limpio, confirmando el máximo nivel de legitimidad y confianza en el origen de los fondos.'
            );
        ELSE
            v_minimal_mixing_risk_score := 0.0;
            v_minimal_mixing_risk_reason := jsonb_build_object(
                'suspected_mixing_score', w.suspected_mixing_score,
                'mixing_risk', w.mixing_risk,
                'reason_eng', 'Presence of mixing risk detected, raising concerns about potential illicit or obfuscated fund origins.',
                'reason_esp', 'Presencia de riesgo de mixing detectada, generando preocupación sobre posibles orígenes de fondos ilícitos u ofuscados.'
            );
        END IF;

        v_block_advanced := v_low_inflow_concentration_score + v_minimal_mixing_risk_score;

        -- ====================== TOTAL ======================
        v_total_score := v_block_basic + v_block_intermediate + v_block_advanced;

                -- ====================== ANÁLISIS NARRATIVO DEL PILAR ORIGINS LEGITIMACY (LENGUAJE DE NEGOCIO) ======================
        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'The wallet demonstrates excellent fund origins legitimacy with very clean, organic and diversified sources.'
                    WHEN v_total_score >= 18.5 THEN 'The wallet shows strong legitimacy in fund origins with good diversification and low mixing risk.'
                    WHEN v_total_score >= 15.0 THEN 'The wallet has acceptable fund origins but presents moderate risks related to CEX reliance or concentration.'
                    WHEN v_total_score >= 11.0 THEN 'The wallet has weak to moderate legitimacy in fund origins with several concerning signals.'
                    ELSE 'The wallet exhibits very weak fund origins legitimacy. High risk of illicit or suspicious funding sources.'
                END,

            'overall_assessment_esp', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'La wallet demuestra una excelente legitimidad en el origen de fondos con fuentes muy limpias, orgánicas y diversificadas.'
                    WHEN v_total_score >= 18.5 THEN 'La wallet muestra una fuerte legitimidad en el origen de fondos con buena diversificación y bajo riesgo de mixing.'
                    WHEN v_total_score >= 15.0 THEN 'La wallet tiene un origen de fondos aceptable pero presenta riesgos moderados relacionados con dependencia de CEX o concentración.'
                    WHEN v_total_score >= 11.0 THEN 'La wallet tiene legitimidad débil a moderada en el origen de fondos con varias señales preocupantes.'
                    ELSE 'La wallet presenta una legitimidad de origen de fondos muy débil. Alto riesgo de fuentes de financiamiento ilícitas o sospechosas.'
                END,

            'business_interpretation_eng', 
                'This Origins Legitimacy pillar evaluates the cleanliness, diversity and risk level of the wallet''s initial funding sources. ' ||
                CASE 
                    WHEN v_first_funds_quality_score <= 3.0 THEN 'Problematic first funds (CEX origin or mint activity) raise serious legitimacy concerns. '
                    WHEN v_mixing_risk_score = 0 THEN 'Significant mixing risk detected, suggesting potential obfuscation of fund sources. '
                    WHEN v_funding_diversity_score <= 2.0 THEN 'Highly concentrated funding sources increase single-point risk. '
                    WHEN v_low_cex_reliance_score <= 1.0 THEN 'Heavy reliance on centralized exchanges introduces regulatory risk. '
                    ELSE 'The wallet shows relatively clean and diversified funding origins. '
                END ||
                'Overall, the current level suggests ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'high risk of illicit or suspicious fund origins.'
                    WHEN v_total_score < 15.0 THEN 'moderate risk with notable vulnerabilities.'
                    WHEN v_total_score < 18.5 THEN 'acceptable but not fully trustworthy origins.'
                    ELSE 'strong legitimacy and low risk in fund provenance.'
                END,

            'business_interpretation_esp', 
                'Este pilar Origins Legitimacy evalúa la limpieza, diversidad y nivel de riesgo de las fuentes de financiamiento inicial de la wallet. ' ||
                CASE 
                    WHEN v_first_funds_quality_score <= 3.0 THEN 'Primeros fondos problemáticos (origen CEX o actividad de mint) generan serias preocupaciones de legitimidad. '
                    WHEN v_mixing_risk_score = 0 THEN 'Se detectó riesgo significativo de mixing, sugiriendo posible ofuscación de fuentes de fondos. '
                    WHEN v_funding_diversity_score <= 2.0 THEN 'Fuentes de financiamiento altamente concentradas aumentan el riesgo de un solo punto. '
                    WHEN v_low_cex_reliance_score <= 1.0 THEN 'Alta dependencia de exchanges centralizados introduce riesgo regulatorio. '
                    ELSE 'La wallet muestra orígenes de fondos relativamente limpios y diversificados. '
                END ||
                'En general, el nivel actual sugiere ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'alto riesgo de orígenes de fondos ilícitos o sospechosos.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado con vulnerabilidades notables.'
                    WHEN v_total_score < 18.5 THEN 'orígenes aceptables pero no completamente confiables.'
                    ELSE 'fuerte legitimidad y bajo riesgo en la procedencia de fondos.'
                END,

            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_first_funds_quality_score >= 6.0 THEN 'Clean organic first fund sources' END),
                        (CASE WHEN v_mixing_risk_score >= 4.0 THEN 'Very low mixing risk' END),
                        (CASE WHEN v_funding_diversity_score >= 4.0 THEN 'Excellent funding source diversification' END),
                        (CASE WHEN v_low_cex_reliance_score = 5.0 THEN 'Minimal CEX dependency' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_first_funds_quality_score >= 6.0 THEN 'Fuentes de primer fondo orgánicas limpias' END),
                        (CASE WHEN v_mixing_risk_score >= 4.0 THEN 'Riesgo de mixing muy bajo' END),
                        (CASE WHEN v_funding_diversity_score >= 4.0 THEN 'Excelente diversificación de fuentes de financiamiento' END),
                        (CASE WHEN v_low_cex_reliance_score = 5.0 THEN 'Dependencia mínima de CEX' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_first_funds_quality_score <= 3.0 THEN 'Problematic first funds origin (CEX or mint)' END),
                        (CASE WHEN v_mixing_risk_score = 0 THEN 'High suspected mixing risk' END),
                        (CASE WHEN v_funding_diversity_score <= 2.0 THEN 'Highly concentrated funding sources' END),
                        (CASE WHEN v_low_cex_reliance_score <= 1.0 THEN 'Heavy CEX reliance' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_first_funds_quality_score <= 3.0 THEN 'Origen de primeros fondos problemático (CEX o mint)' END),
                        (CASE WHEN v_mixing_risk_score = 0 THEN 'Alto riesgo de mixing sospechoso' END),
                        (CASE WHEN v_funding_diversity_score <= 2.0 THEN 'Fuentes de financiamiento altamente concentradas' END),
                        (CASE WHEN v_low_cex_reliance_score <= 1.0 THEN 'Alta dependencia de CEX' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            -- ====================== RECOMENDACIÓN DINÁMICA ======================
            'recommendation_eng', 
                CASE 
                    WHEN v_first_funds_quality_score <= 3.0 THEN 'Priority: Investigate and document the origin of first funds. CEX or mint activity is significantly hurting legitimacy.'
                    WHEN v_mixing_risk_score = 0 THEN 'Critical: Address potential mixing/tumbling exposure immediately as this raises major red flags for fund legitimacy.'
                    WHEN v_funding_diversity_score <= 2.0 THEN 'Focus on diversifying funding sources to reduce concentration risk from few senders.'
                    WHEN v_low_cex_reliance_score <= 1.0 THEN 'Reduce reliance on centralized exchanges by increasing organic and decentralized inflows.'
                    ELSE 'Continue strengthening funding diversity and maintaining low mixing risk to achieve elite legitimacy status.'
                END,

            'recommendation_esp', 
                CASE 
                    WHEN v_first_funds_quality_score <= 3.0 THEN 'Prioridad: Investigar y documentar el origen de los primeros fondos. La actividad CEX o mint está afectando significativamente la legitimidad.'
                    WHEN v_mixing_risk_score = 0 THEN 'Crítico: Abordar inmediatamente la posible exposición a mixing/tumbling, ya que esto genera grandes alertas rojas sobre la legitimidad de los fondos.'
                    WHEN v_funding_diversity_score <= 2.0 THEN 'Enfocarse en diversificar las fuentes de financiamiento para reducir el riesgo de concentración de pocos remitentes.'
                    WHEN v_low_cex_reliance_score <= 1.0 THEN 'Reducir la dependencia de exchanges centralizados aumentando flujos orgánicos y descentralizados.'
                    ELSE 'Continuar fortaleciendo la diversidad de financiamiento y manteniendo bajo riesgo de mixing para alcanzar estatus de legitimidad de élite.'
                END,

            'last_calculated', now()
        );

        -- ====================== UPSERT ======================
        INSERT INTO index_wami.pillar_origins_legitimacy (
            wallet_id,
            chain_id,
            first_funds_quality_score, first_funds_quality_reason,
            mixing_risk_score, mixing_risk_reason,
            low_cex_reliance_score, low_cex_reliance_reason,
            funding_diversity_score, funding_diversity_reason,
            low_inflow_concentration_score, low_inflow_concentration_reason,
            minimal_mixing_risk_score, minimal_mixing_risk_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary, calculated_at, change_reason, calculated_by
        )
        VALUES (
            w.wallet_id,
            w.chain_id,
            v_first_funds_quality_score, v_first_funds_quality_reason,
            v_mixing_risk_score, v_mixing_risk_reason,
            v_low_cex_reliance_score, v_low_cex_reliance_reason,
            v_funding_diversity_score, v_funding_diversity_reason,
            v_low_inflow_concentration_score, v_low_inflow_concentration_reason,
            v_minimal_mixing_risk_score, v_minimal_mixing_risk_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary, now(), 'recalculation - refined origins legitimacy logic v2 (business-oriented reasons + tracking + bilingüe)', 'system'
        )
        ON CONFLICT (wallet_id, chain_id) DO UPDATE
        SET 
            first_funds_quality_score = EXCLUDED.first_funds_quality_score,
            first_funds_quality_reason = EXCLUDED.first_funds_quality_reason,
            mixing_risk_score = EXCLUDED.mixing_risk_score,
            mixing_risk_reason = EXCLUDED.mixing_risk_reason,
            low_cex_reliance_score = EXCLUDED.low_cex_reliance_score,
            low_cex_reliance_reason = EXCLUDED.low_cex_reliance_reason,
            funding_diversity_score = EXCLUDED.funding_diversity_score,
            funding_diversity_reason = EXCLUDED.funding_diversity_reason,
            low_inflow_concentration_score = EXCLUDED.low_inflow_concentration_score,
            low_inflow_concentration_reason = EXCLUDED.low_inflow_concentration_reason,
            minimal_mixing_risk_score = EXCLUDED.minimal_mixing_risk_score,
            minimal_mixing_risk_reason = EXCLUDED.minimal_mixing_risk_reason,
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
