-- Optimizado: temp wallets + tracking batch; sin ::DATE.
-- Test: EXPLAIN ANALYZE SELECT index_wami.pillar_activity_behavior_calculate(10);

CREATE OR REPLACE FUNCTION index_wami.pillar_activity_behavior_calculate(p_limit integer DEFAULT 100)
RETURNS integer
    LANGUAGE plpgsql
AS $$
DECLARE
    v_processed integer := 0;
    w               record;
    -- ====================== SCORES POR ITEM ======================
    -- Bloque Básica (10 pts)
    v_inflow_outflow_balance_score   numeric := 0;
    v_inflow_outflow_balance_reason  jsonb;
    v_unique_counterparties_score    numeric := 0;
    v_unique_counterparties_reason   jsonb;

    -- Bloque Intermedia (9 pts)
    v_low_wash_trading_score         numeric := 0;
    v_low_wash_trading_reason        jsonb;
    v_low_suspicious_patterns_score  numeric := 0;
    v_low_suspicious_patterns_reason jsonb;

    -- Bloque Avanzada (6 pts)
    v_low_cex_interaction_score      numeric := 0;
    v_low_cex_interaction_reason     jsonb;
    v_healthy_interaction_ratio_score numeric := 0;
    v_healthy_interaction_ratio_reason jsonb;

    -- Bloques resumen
    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0;

    v_pillar_summary             jsonb;

    -- Variables de cálculo
    v_total_value_moved_usd numeric;

BEGIN
    CREATE TEMP TABLE temp_pillar_wallets ON COMMIT DROP AS
    SELECT 
            wtd.wallet_id,
            wtd.chain_id,
            wrf.total_inflow_usd,
            wrf.total_outflow_usd,
            wrf.net_flow_usd,
            wrf.unique_counterparties,
            wrf.wash_trading_score,
            wrf.suspicious_cycle_count,
            wrf.total_transfers_15d,
            wrf.repeat_interaction_ratio,
            wrf.activity_span_days,
            wrf.cex_inflow_usd,
            wrf.cex_outflow_usd
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN walcert.wallet_recent_flows wrf 
               ON wtd.wallet_id = wrf.wallet_id 
              AND wtd.chain_id = wrf.chain_id
        LEFT JOIN index_wami.pillar_activity_behavior pab 
               ON wtd.wallet_id = pab.wallet_id 
              AND wtd.chain_id = pab.chain_id
        WHERE pab.wallet_id IS NULL 
           OR pab.calculated_at < CURRENT_DATE::timestamptz
        ORDER BY pab.calculated_at ASC NULLS FIRST
        LIMIT p_limit;

    INSERT INTO index_wami.index_wami_tracking (wallet_id, chain_id)
    SELECT wallet_id, chain_id FROM temp_pillar_wallets
    ON CONFLICT (wallet_id, chain_id) DO NOTHING;

    WITH existing AS (
        SELECT ep.* FROM temp_pillar_wallets t
        INNER JOIN index_wami.pillar_activity_behavior ep
            ON ep.wallet_id = t.wallet_id AND ep.chain_id = t.chain_id
    ),
    archive AS (
        SELECT
            e.wallet_id, e.chain_id,
            to_char(COALESCE(e.calculated_at::date, CURRENT_DATE), 'YYYY-MM') AS current_month,
            e.calculated_at, e.pillar_score,
            e.block_basic_score, e.block_intermediate_score, e.block_advanced_score,
            it.pillar_activity_behavior_score_last_30_days AS old_last_30,
            it.pillar_activity_behavior_score_tracking AS old_tracking
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
    SET pillar_activity_behavior_score_last_30_days = c.new_last_30, pillar_activity_behavior_score_tracking = c.new_monthly
    FROM computed c
    WHERE it.wallet_id = c.wallet_id AND it.chain_id = c.chain_id;

    FOR w IN SELECT * FROM temp_pillar_wallets LOOP
        -- ====================== BLOQUE BÁSICA (10 pts) ======================

        -- 1. Inflow / Outflow Balance
        v_total_value_moved_usd := COALESCE(w.total_inflow_usd, 0) + COALESCE(w.total_outflow_usd, 0);
        
        IF v_total_value_moved_usd > 0 THEN
            IF ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd <= 0.20 THEN
                v_inflow_outflow_balance_score := 5.0;
                v_inflow_outflow_balance_reason := jsonb_build_object(
                    'net_flow_usd', round(COALESCE(w.net_flow_usd, 0), 2),
                    'total_value_moved_usd', round(v_total_value_moved_usd, 2),
                    'balance_ratio', round(ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'Inflow and outflow are excellently balanced (≤20% net flow), indicating natural, healthy transactional behavior with very low risk of manipulation or dumping.',
                    'reason_esp', 'Los flujos de entrada y salida están excelentemente balanceados (≤20% flujo neto), indicando comportamiento transaccional natural y saludable con muy bajo riesgo de manipulación o dumping.'
                );
            ELSIF ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd <= 0.40 THEN
                v_inflow_outflow_balance_score := 3.5;
                v_inflow_outflow_balance_reason := jsonb_build_object(
                    'net_flow_usd', round(COALESCE(w.net_flow_usd, 0), 2),
                    'total_value_moved_usd', round(v_total_value_moved_usd, 2),
                    'balance_ratio', round(ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'Inflow and outflow show good balance (≤40% net flow), reflecting relatively natural activity with moderate risk exposure.',
                    'reason_esp', 'Los flujos de entrada y salida muestran un buen balance (≤40% flujo neto), reflejando actividad relativamente natural con exposición de riesgo moderada.'
                );
            ELSIF ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd <= 0.60 THEN
                v_inflow_outflow_balance_score := 2.0;
                v_inflow_outflow_balance_reason := jsonb_build_object(
                    'net_flow_usd', round(COALESCE(w.net_flow_usd, 0), 2),
                    'total_value_moved_usd', round(v_total_value_moved_usd, 2),
                    'balance_ratio', round(ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'Inflow and outflow have moderate imbalance (≤60% net flow), suggesting some concentration risk but still within acceptable business thresholds.',
                    'reason_esp', 'Los flujos de entrada y salida tienen un desbalance moderado (≤60% flujo neto), sugiriendo algún riesgo de concentración pero aún dentro de umbrales aceptables de negocio.'
                );
            ELSE
                v_inflow_outflow_balance_score := 0.0;
                v_inflow_outflow_balance_reason := jsonb_build_object(
                    'net_flow_usd', round(COALESCE(w.net_flow_usd, 0), 2),
                    'total_value_moved_usd', round(v_total_value_moved_usd, 2),
                    'balance_ratio', round(ABS(COALESCE(w.net_flow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'Extreme inflow/outflow imbalance detected (>60% net flow), indicating potential manipulative or high-risk transactional patterns.',
                    'reason_esp', 'Desbalance extremo de entrada/salida detectado (>60% flujo neto), indicando posibles patrones transaccionales manipuladores o de alto riesgo.'
                );
            END IF;
        ELSE
            v_inflow_outflow_balance_score := 0.0;
            v_inflow_outflow_balance_reason := jsonb_build_object(
                'reason_eng', 'No transactional volume detected, making balance analysis not applicable.',
                'reason_esp', 'No se detectó volumen transaccional, por lo que el análisis de balance no aplica.'
            );
        END IF;

        -- 2. Unique Counterparties
        IF COALESCE(w.unique_counterparties, 0) >= 15 THEN
            v_unique_counterparties_score := 5.0;
            v_unique_counterparties_reason := jsonb_build_object(
                'unique_counterparties', COALESCE(w.unique_counterparties, 0),
                'reason_eng', 'Wallet interacts with 15+ unique counterparties, demonstrating excellent network integration and high business legitimacy.',
                'reason_esp', 'La wallet interactúa con 15+ contrapartes únicas, demostrando una excelente integración de red y alta legitimidad empresarial.'
            );
        ELSIF COALESCE(w.unique_counterparties, 0) >= 8 THEN
            v_unique_counterparties_score := 4.0;
            v_unique_counterparties_reason := jsonb_build_object(
                'unique_counterparties', COALESCE(w.unique_counterparties, 0),
                'reason_eng', 'Wallet interacts with 8-14 unique counterparties, showing strong and diversified network relationships.',
                'reason_esp', 'La wallet interactúa con 8-14 contrapartes únicas, mostrando relaciones de red fuertes y diversificadas.'
            );
        ELSIF COALESCE(w.unique_counterparties, 0) >= 3 THEN
            v_unique_counterparties_score := 3.0;
            v_unique_counterparties_reason := jsonb_build_object(
                'unique_counterparties', COALESCE(w.unique_counterparties, 0),
                'reason_eng', 'Wallet interacts with 3-7 unique counterparties, indicating basic but meaningful network engagement.',
                'reason_esp', 'La wallet interactúa con 3-7 contrapartes únicas, indicando un engagement de red básico pero significativo.'
            );
        ELSE
            v_unique_counterparties_score := 0.0;
            v_unique_counterparties_reason := jsonb_build_object(
                'unique_counterparties', COALESCE(w.unique_counterparties, 0),
                'reason_eng', 'Wallet has very few or no unique counterparties, suggesting limited network integration and higher risk of isolation.',
                'reason_esp', 'La wallet tiene muy pocas o ninguna contraparte única, sugiriendo integración de red limitada y mayor riesgo de aislamiento.'
            );
        END IF;

        v_block_basic := v_inflow_outflow_balance_score + v_unique_counterparties_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================

        -- 3. Low Wash Trading
        IF COALESCE(w.wash_trading_score, 0) <= 5 THEN
            v_low_wash_trading_score := 5.0;
            v_low_wash_trading_reason := jsonb_build_object(
                'wash_trading_score', COALESCE(w.wash_trading_score, 0),
                'reason_eng', 'Extremely low wash trading score (≤5), indicating clean, natural transactional behavior with minimal manipulation risk.',
                'reason_esp', 'Puntuación de wash trading extremadamente baja (≤5), indicando comportamiento transaccional limpio y natural con riesgo mínimo de manipulación.'
            );
        ELSIF COALESCE(w.wash_trading_score, 0) <= 15 THEN
            v_low_wash_trading_score := 3.0;
            v_low_wash_trading_reason := jsonb_build_object(
                'wash_trading_score', COALESCE(w.wash_trading_score, 0),
                'reason_eng', 'Low wash trading score (≤15), reflecting mostly legitimate activity with acceptable risk levels.',
                'reason_esp', 'Baja puntuación de wash trading (≤15), reflejando actividad mayormente legítima con niveles de riesgo aceptables.'
            );
        ELSIF COALESCE(w.wash_trading_score, 0) <= 30 THEN
            v_low_wash_trading_score := 1.0;
            v_low_wash_trading_reason := jsonb_build_object(
                'wash_trading_score', COALESCE(w.wash_trading_score, 0),
                'reason_eng', 'Moderate wash trading score (≤30), signaling some artificial volume that requires monitoring.',
                'reason_esp', 'Puntuación moderada de wash trading (≤30), señalando algo de volumen artificial que requiere monitoreo.'
            );
        ELSE
            v_low_wash_trading_score := 0.0;
            v_low_wash_trading_reason := jsonb_build_object(
                'wash_trading_score', COALESCE(w.wash_trading_score, 0),
                'reason_eng', 'High wash trading score detected, indicating significant risk of artificial or manipulative transactional patterns.',
                'reason_esp', 'Alta puntuación de wash trading detectada, indicando riesgo significativo de patrones transaccionales artificiales o manipuladores.'
            );
        END IF;

        -- 4. Low Suspicious Patterns
        IF COALESCE(w.total_transfers_15d, 0) > 0 THEN
            IF COALESCE(w.suspicious_cycle_count, 0)::numeric / w.total_transfers_15d <= 0.08 THEN
                v_low_suspicious_patterns_score := 4.0;
                v_low_suspicious_patterns_reason := jsonb_build_object(
                    'suspicious_ratio', round(COALESCE(w.suspicious_cycle_count, 0)::numeric / w.total_transfers_15d, 4),
                    'reason_eng', 'Extremely low suspicious pattern ratio (≤8%), confirming clean and natural transaction cycles.',
                    'reason_esp', 'Ratio de patrones sospechosos extremadamente bajo (≤8%), confirmando ciclos de transacciones limpios y naturales.'
                );
            ELSIF COALESCE(w.suspicious_cycle_count, 0)::numeric / w.total_transfers_15d <= 0.20 THEN
                v_low_suspicious_patterns_score := 2.5;
                v_low_suspicious_patterns_reason := jsonb_build_object(
                    'suspicious_ratio', round(COALESCE(w.suspicious_cycle_count, 0)::numeric / w.total_transfers_15d, 4),
                    'reason_eng', 'Low suspicious pattern ratio (≤20%), indicating mostly legitimate activity with minor concerns.',
                    'reason_esp', 'Ratio de patrones sospechosos bajo (≤20%), indicando actividad mayormente legítima con preocupaciones menores.'
                );
            ELSE
                v_low_suspicious_patterns_score := 0.0;
                v_low_suspicious_patterns_reason := jsonb_build_object(
                    'suspicious_ratio', round(COALESCE(w.suspicious_cycle_count, 0)::numeric / w.total_transfers_15d, 4),
                    'reason_eng', 'High suspicious cycle ratio detected, suggesting elevated risk of manipulative or circular transaction patterns.',
                    'reason_esp', 'Alto ratio de ciclos sospechosos detectado, sugiriendo riesgo elevado de patrones transaccionales manipuladores o circulares.'
                );
            END IF;
        ELSE
            v_low_suspicious_patterns_score := 0.0;
            v_low_suspicious_patterns_reason := jsonb_build_object(
                'reason_eng', 'No recent transfers available for suspicious pattern analysis.',
                'reason_esp', 'No hay transferencias recientes disponibles para análisis de patrones sospechosos.'
            );
        END IF;

        v_block_intermediate := v_low_wash_trading_score + v_low_suspicious_patterns_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================

        -- 5. Low CEX Interaction
        IF v_total_value_moved_usd > 0 THEN
            IF (COALESCE(w.cex_inflow_usd, 0) + COALESCE(w.cex_outflow_usd, 0)) / v_total_value_moved_usd <= 0.15 THEN
                v_low_cex_interaction_score := 3.0;
                v_low_cex_interaction_reason := jsonb_build_object(
                    'cex_ratio', round((COALESCE(w.cex_inflow_usd, 0) + COALESCE(w.cex_outflow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'Extremely low CEX interaction (≤15%), indicating strong preference for decentralized channels and reduced regulatory/counterparty risk.',
                    'reason_esp', 'Interacción con CEX extremadamente baja (≤15%), indicando fuerte preferencia por canales descentralizados y riesgo regulatorio/contraparte reducido.'
                );
            ELSIF (COALESCE(w.cex_inflow_usd, 0) + COALESCE(w.cex_outflow_usd, 0)) / v_total_value_moved_usd <= 0.35 THEN
                v_low_cex_interaction_score := 1.5;
                v_low_cex_interaction_reason := jsonb_build_object(
                    'cex_ratio', round((COALESCE(w.cex_inflow_usd, 0) + COALESCE(w.cex_outflow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'Moderate CEX interaction (≤35%), acceptable for most business use cases but with some centralized exposure.',
                    'reason_esp', 'Interacción moderada con CEX (≤35%), aceptable para la mayoría de casos de negocio pero con algo de exposición centralizada.'
                );
            ELSE
                v_low_cex_interaction_score := 0.0;
                v_low_cex_interaction_reason := jsonb_build_object(
                    'cex_ratio', round((COALESCE(w.cex_inflow_usd, 0) + COALESCE(w.cex_outflow_usd, 0)) / v_total_value_moved_usd, 4),
                    'reason_eng', 'High CEX dependency detected, increasing regulatory and counterparty risk for the wallet.',
                    'reason_esp', 'Alta dependencia de CEX detectada, aumentando el riesgo regulatorio y de contraparte para la wallet.'
                );
            END IF;
        ELSE
            v_low_cex_interaction_score := 0.0;
            v_low_cex_interaction_reason := jsonb_build_object(
                'reason_eng', 'No transactional volume available for CEX interaction analysis.',
                'reason_esp', 'No hay volumen transaccional disponible para análisis de interacción con CEX.'
            );
        END IF;

        -- 6. Healthy Interaction Ratio
        IF COALESCE(w.repeat_interaction_ratio, 0) >= 0.85 THEN
            v_healthy_interaction_ratio_score := 5.0;
            v_healthy_interaction_ratio_reason := jsonb_build_object(
                'repeat_interaction_ratio', round(COALESCE(w.repeat_interaction_ratio, 0), 2),
                'reason_eng', 'Exceptional healthy interaction ratio (≥85%), showing strong, repeated and natural relationships with counterparties.',
                'reason_esp', 'Ratio de interacción saludable excepcional (≥85%), mostrando relaciones fuertes, repetidas y naturales con contrapartes.'
            );
        ELSIF COALESCE(w.repeat_interaction_ratio, 0) >= 0.65 THEN
            v_healthy_interaction_ratio_score := 4.0;
            v_healthy_interaction_ratio_reason := jsonb_build_object(
                'repeat_interaction_ratio', round(COALESCE(w.repeat_interaction_ratio, 0), 2),
                'reason_eng', 'Strong healthy interaction ratio (≥65%), indicating consistent and trusted network relationships.',
                'reason_esp', 'Fuerte ratio de interacción saludable (≥65%), indicando relaciones de red consistentes y confiables.'
            );
        ELSIF COALESCE(w.repeat_interaction_ratio, 0) >= 0.40 THEN
            v_healthy_interaction_ratio_score := 3.0;
            v_healthy_interaction_ratio_reason := jsonb_build_object(
                'repeat_interaction_ratio', round(COALESCE(w.repeat_interaction_ratio, 0), 2),
                'reason_eng', 'Moderate healthy interaction ratio (≥40%), showing acceptable repeated engagement with counterparties.',
                'reason_esp', 'Ratio de interacción saludable moderado (≥40%), mostrando engagement repetido aceptable con contrapartes.'
            );
        ELSE
            v_healthy_interaction_ratio_score := 0.0;
            v_healthy_interaction_ratio_reason := jsonb_build_object(
                'repeat_interaction_ratio', round(COALESCE(w.repeat_interaction_ratio, 0), 2),
                'reason_eng', 'Low repeat interaction ratio, suggesting mostly one-off or opportunistic transactions with limited relationship building.',
                'reason_esp', 'Bajo ratio de interacción repetida, sugiriendo transacciones mayormente únicas u oportunistas con construcción limitada de relaciones.'
            );
        END IF;

        v_block_advanced := v_low_cex_interaction_score + v_healthy_interaction_ratio_score;

        -- ====================== TOTAL ======================
        v_total_score := v_block_basic + v_block_intermediate + v_block_advanced;

                -- ====================== ANÁLISIS NARRATIVO DEL PILAR ACTIVITY BEHAVIOR (LENGUAJE DE NEGOCIO) ======================
        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'The wallet demonstrates excellent transactional health, natural behavior and strong legitimacy signals.'
                    WHEN v_total_score >= 18.5 THEN 'The wallet shows solid activity behavior with good network integration and low risk patterns.'
                    WHEN v_total_score >= 15.0 THEN 'The wallet has acceptable activity levels but presents some concerning patterns that require attention.'
                    WHEN v_total_score >= 11.0 THEN 'The wallet has weak to moderate activity behavior with several risk indicators.'
                    ELSE 'The wallet exhibits very poor activity behavior. High risk of artificial or suspicious transactional patterns.'
                END,

            'overall_assessment_esp', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'La wallet demuestra una excelente salud transaccional, comportamiento natural y fuertes señales de legitimidad.'
                    WHEN v_total_score >= 18.5 THEN 'La wallet muestra un comportamiento de actividad sólido con buena integración de red y patrones de bajo riesgo.'
                    WHEN v_total_score >= 15.0 THEN 'La wallet tiene niveles de actividad aceptables pero presenta algunos patrones preocupantes que requieren atención.'
                    WHEN v_total_score >= 11.0 THEN 'La wallet tiene un comportamiento de actividad débil a moderado con varios indicadores de riesgo.'
                    ELSE 'La wallet presenta un comportamiento de actividad muy pobre. Alto riesgo de patrones transaccionales artificiales o sospechosos.'
                END,

            'business_interpretation_eng', 
                'This Activity Behavior pillar analyzes the naturalness, health and legitimacy of the wallet''s transactional patterns. ' ||
                CASE 
                    WHEN v_low_wash_trading_score = 0 THEN 'Significant wash trading signals were detected, raising serious manipulation concerns. '
                    WHEN v_low_suspicious_patterns_score = 0 THEN 'Suspicious transaction cycles are present, indicating potential artificial activity. '
                    WHEN v_low_cex_interaction_score = 0 THEN 'High dependency on centralized exchanges increases regulatory and counterparty risk. '
                    WHEN v_healthy_interaction_ratio_score = 0 THEN 'Mostly one-off transactions suggest lack of real business relationships. '
                    ELSE 'The wallet shows relatively healthy and natural transactional behavior. '
                END ||
                'Overall, the current level suggests ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'high risk of non-organic or manipulative behavior.'
                    WHEN v_total_score < 15.0 THEN 'moderate risk with concerning patterns.'
                    WHEN v_total_score < 18.5 THEN 'acceptable activity but not fully mature.'
                    ELSE 'strong transactional health and low manipulation risk.'
                END,

            'business_interpretation_esp', 
                'Este pilar Activity Behavior analiza la naturalidad, salud y legitimidad de los patrones transaccionales de la wallet. ' ||
                CASE 
                    WHEN v_low_wash_trading_score = 0 THEN 'Se detectaron señales significativas de wash trading, generando serias preocupaciones de manipulación. '
                    WHEN v_low_suspicious_patterns_score = 0 THEN 'Existen ciclos de transacciones sospechosos, indicando posible actividad artificial. '
                    WHEN v_low_cex_interaction_score = 0 THEN 'Alta dependencia de exchanges centralizados aumenta el riesgo regulatorio y de contraparte. '
                    WHEN v_healthy_interaction_ratio_score = 0 THEN 'La mayoría de transacciones son únicas, sugiriendo falta de relaciones de negocio reales. '
                    ELSE 'La wallet muestra un comportamiento transaccional relativamente saludable y natural. '
                END ||
                'En general, el nivel actual sugiere ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'alto riesgo de comportamiento no orgánico o manipulador.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado con patrones preocupantes.'
                    WHEN v_total_score < 18.5 THEN 'actividad aceptable pero no completamente madura.'
                    ELSE 'fuerte salud transaccional y bajo riesgo de manipulación.'
                END,

            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_inflow_outflow_balance_score >= 4.0 THEN 'Excellent inflow/outflow balance indicating natural activity' END),
                        (CASE WHEN v_unique_counterparties_score >= 4.0 THEN 'Strong network with many unique counterparties' END),
                        (CASE WHEN v_healthy_interaction_ratio_score >= 4.0 THEN 'High repeat interaction ratio showing real relationships' END),
                        (CASE WHEN v_low_wash_trading_score = 5.0 THEN 'Very clean wash trading profile' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_inflow_outflow_balance_score >= 4.0 THEN 'Excelente balance de entrada/salida indicando actividad natural' END),
                        (CASE WHEN v_unique_counterparties_score >= 4.0 THEN 'Fuerte red con muchas contrapartes únicas' END),
                        (CASE WHEN v_healthy_interaction_ratio_score >= 4.0 THEN 'Alto ratio de interacción repetida mostrando relaciones reales' END),
                        (CASE WHEN v_low_wash_trading_score = 5.0 THEN 'Perfil de wash trading muy limpio' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_low_wash_trading_score = 0 THEN 'High wash trading signals detected' END),
                        (CASE WHEN v_low_suspicious_patterns_score = 0 THEN 'Suspicious transaction cycles present' END),
                        (CASE WHEN v_low_cex_interaction_score = 0 THEN 'High dependency on centralized exchanges' END),
                        (CASE WHEN v_healthy_interaction_ratio_score = 0 THEN 'Mostly one-off transactions' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_low_wash_trading_score = 0 THEN 'Señales altas de wash trading detectadas' END),
                        (CASE WHEN v_low_suspicious_patterns_score = 0 THEN 'Ciclos de transacciones sospechosos presentes' END),
                        (CASE WHEN v_low_cex_interaction_score = 0 THEN 'Alta dependencia de exchanges centralizados' END),
                        (CASE WHEN v_healthy_interaction_ratio_score = 0 THEN 'Mayoría de transacciones únicas' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            -- ====================== RECOMENDACIÓN DINÁMICA ======================
            'recommendation_eng', 
                CASE 
                    WHEN v_low_wash_trading_score = 0 THEN 'Priority: Investigate and reduce wash trading patterns. This is the most critical risk currently affecting the wallet.'
                    WHEN v_low_suspicious_patterns_score = 0 THEN 'Focus on eliminating suspicious transaction cycles to improve behavioral legitimacy.'
                    WHEN v_low_cex_interaction_score = 0 THEN 'Reduce dependency on centralized exchanges by increasing decentralized interactions.'
                    WHEN v_healthy_interaction_ratio_score = 0 THEN 'Build stronger, repeated relationships with counterparties to demonstrate real business activity.'
                    ELSE 'Continue maintaining healthy transaction patterns and further diversify interactions across chains and counterparties.'
                END,

            'recommendation_esp', 
                CASE 
                    WHEN v_low_wash_trading_score = 0 THEN 'Prioridad: Investigar y reducir patrones de wash trading. Este es el riesgo más crítico que afecta actualmente a la wallet.'
                    WHEN v_low_suspicious_patterns_score = 0 THEN 'Enfocarse en eliminar ciclos de transacciones sospechosos para mejorar la legitimidad del comportamiento.'
                    WHEN v_low_cex_interaction_score = 0 THEN 'Reducir la dependencia de exchanges centralizados aumentando interacciones descentralizadas.'
                    WHEN v_healthy_interaction_ratio_score = 0 THEN 'Construir relaciones más fuertes y repetidas con contrapartes para demostrar actividad de negocio real.'
                    ELSE 'Continuar manteniendo patrones transaccionales saludables y diversificar aún más las interacciones entre chains y contrapartes.'
                END,

            'last_calculated', now()
        );

        -- ====================== UPSERT ======================
        INSERT INTO index_wami.pillar_activity_behavior (
            wallet_id, chain_id,
            inflow_outflow_balance_score, inflow_outflow_balance_reason,
            unique_counterparties_score, unique_counterparties_reason,
            low_wash_trading_score, low_wash_trading_reason,
            low_suspicious_patterns_score, low_suspicious_patterns_reason,
            low_cex_interaction_score, low_cex_interaction_reason,
            healthy_interaction_ratio_score, healthy_interaction_ratio_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary, calculated_at, change_reason, calculated_by
        )
        VALUES (
            w.wallet_id,
            w.chain_id,
            v_inflow_outflow_balance_score, v_inflow_outflow_balance_reason,
            v_unique_counterparties_score, v_unique_counterparties_reason,
            v_low_wash_trading_score, v_low_wash_trading_reason,
            v_low_suspicious_patterns_score, v_low_suspicious_patterns_reason,
            v_low_cex_interaction_score, v_low_cex_interaction_reason,
            v_healthy_interaction_ratio_score, v_healthy_interaction_ratio_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary, now(), 'recalculation - refined activity behavior logic v2 (business-oriented reasons + tracking + bilingüe)', 'system'
        )
        ON CONFLICT (wallet_id, chain_id) DO UPDATE
        SET 
            inflow_outflow_balance_score = EXCLUDED.inflow_outflow_balance_score,
            inflow_outflow_balance_reason = EXCLUDED.inflow_outflow_balance_reason,
            unique_counterparties_score = EXCLUDED.unique_counterparties_score,
            unique_counterparties_reason = EXCLUDED.unique_counterparties_reason,
            low_wash_trading_score = EXCLUDED.low_wash_trading_score,
            low_wash_trading_reason = EXCLUDED.low_wash_trading_reason,
            low_suspicious_patterns_score = EXCLUDED.low_suspicious_patterns_score,
            low_suspicious_patterns_reason = EXCLUDED.low_suspicious_patterns_reason,
            low_cex_interaction_score = EXCLUDED.low_cex_interaction_score,
            low_cex_interaction_reason = EXCLUDED.low_cex_interaction_reason,
            healthy_interaction_ratio_score = EXCLUDED.healthy_interaction_ratio_score,
            healthy_interaction_ratio_reason = EXCLUDED.healthy_interaction_ratio_reason,
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
