-- MVs erc_8004.agent_summary_* + pillar_measures + pillar_measures_tracking (sin agent_measures).
-- Test: SELECT index_humi.agent_pillar_measure_calculate(10);

CREATE OR REPLACE FUNCTION index_humi.agent_pillar_measure_calculate(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO index_humi, erc_8004, public
AS $$
DECLARE
    v_processed integer := 0;
    w               record;

    v_metadata_richness_score     numeric := 0;
    v_metadata_richness_reason    jsonb;
    v_existence_score             numeric := 0;
    v_existence_reason            jsonb;

    v_intermediate_wallet_score   numeric := 0;
    v_intermediate_wallet_reason  jsonb;
    v_intermediate_audit_score    numeric := 0;
    v_intermediate_audit_reason   jsonb;
    v_intermediate_protocol_score numeric := 0;
    v_intermediate_protocol_reason jsonb;

    v_advanced_audit_score        numeric := 0;
    v_advanced_audit_reason       jsonb;
    v_advanced_wallet_score       numeric := 0;
    v_advanced_wallet_reason      jsonb;
    v_identity_analysis_score     numeric := 0;
    v_identity_analysis_reason    jsonb;
    v_advanced_protocol_score     numeric := 0;
    v_advanced_protocol_reason    jsonb;

    v_penalty_score               numeric := 0;
    v_penalty_reason              jsonb;

    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0;

    v_pillar_summary     jsonb;
    v_new_version        text := '1';

BEGIN
    CREATE TEMP TABLE temp_target_agents (
        agent_id bigint PRIMARY KEY
    ) ON COMMIT DROP;

    INSERT INTO temp_target_agents (agent_id)
    SELECT a.id
    FROM erc_8004.agents a
    JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
    LEFT JOIN index_humi.pillar_measures pm ON a.id = pm.agent_id
    WHERE ap.source = 'definitive'
      AND (pm.agent_id IS NULL OR pm.calculated_at < CURRENT_DATE::timestamptz)
    ORDER BY pm.calculated_at ASC NULLS FIRST
    LIMIT p_limit;

    SELECT COUNT(*)::integer INTO v_processed FROM temp_target_agents;

    INSERT INTO index_humi.pillar_measures_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ta.agent_id, '[]'::jsonb, '[]'::jsonb
    FROM temp_target_agents ta
    ON CONFLICT (agent_id) DO NOTHING;

    WITH current_state AS (
        SELECT
            ta.agent_id,
            pm.pillar_score AS old_pillar_score,
            pm.block_basic_score AS old_block_basic_score,
            pm.block_intermediate_score AS old_block_intermediate_score,
            pm.block_advanced_score AS old_block_advanced_score,
            pm.calculated_at AS old_calculated_at,
            COALESCE(pmt.pillar_score_last_30_days, '[]'::jsonb) AS old_last_30_days,
            COALESCE(pmt.pillar_score_monthly, '[]'::jsonb) AS old_monthly
        FROM temp_target_agents ta
        LEFT JOIN index_humi.pillar_measures pm ON pm.agent_id = ta.agent_id
        LEFT JOIN index_humi.pillar_measures_tracking pmt ON pmt.agent_id = ta.agent_id
    ),
    archive AS (
        SELECT
            cs.agent_id,
            to_char(COALESCE(cs.old_calculated_at::date, CURRENT_DATE), 'YYYY-MM') AS current_month,
            cs.old_pillar_score,
            cs.old_block_basic_score,
            cs.old_block_intermediate_score,
            cs.old_block_advanced_score,
            cs.old_calculated_at,
            cs.old_last_30_days,
            cs.old_monthly
        FROM current_state cs
        WHERE cs.old_calculated_at IS NOT NULL
    ),
    computed_tracking AS (
        SELECT
            a.*,
            (
                SELECT jsonb_agg(elem ORDER BY (elem->>'date')::timestamptz DESC)
                FROM (
                    SELECT jsonb_build_object(
                        'date', a.old_calculated_at,
                        'pillar_score', a.old_pillar_score,
                        'block_basic_score', a.old_block_basic_score,
                        'block_intermediate_score', a.old_block_intermediate_score,
                        'block_advanced_score', a.old_block_advanced_score
                    ) AS elem
                    UNION ALL
                    SELECT elem
                    FROM jsonb_array_elements(COALESCE(a.old_last_30_days, '[]'::jsonb)) elem
                    WHERE (elem->>'date')::date >= (CURRENT_DATE - INTERVAL '30 days')
                      AND (elem->>'date')::date < COALESCE(a.old_calculated_at::date, CURRENT_DATE)
                ) sub
            ) AS new_last_30_days,
            COALESCE((
                SELECT jsonb_agg(
                    CASE
                        WHEN (elem->>'date') = a.current_month THEN
                            jsonb_build_object(
                                'date', a.current_month,
                                'avg_score',
                                CASE
                                    WHEN (elem->>'avg_score') IS NOT NULL
                                    THEN ((elem->>'avg_score')::numeric + COALESCE(a.old_pillar_score, 0)) / 2.0
                                    ELSE COALESCE(a.old_pillar_score, 0)
                                END
                            )
                        ELSE elem
                    END
                    ORDER BY (elem->>'date')
                )
                FROM jsonb_array_elements(COALESCE(a.old_monthly, '[]'::jsonb)) elem
            ), jsonb_build_array(jsonb_build_object('date', a.current_month, 'avg_score', COALESCE(a.old_pillar_score, 0)))) AS new_monthly
        FROM archive a
    )
    INSERT INTO index_humi.pillar_measures_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ct.agent_id, ct.new_last_30_days, ct.new_monthly
    FROM computed_tracking ct
    ON CONFLICT (agent_id) DO UPDATE SET
        pillar_score_last_30_days = EXCLUDED.pillar_score_last_30_days,
        pillar_score_monthly = EXCLUDED.pillar_score_monthly;

    FOR w IN
        SELECT
            ta.agent_id,
            jsonb_build_object(
                'score', COALESCE(a.metadata_richness_score, 0),
                'category', COALESCE(a.metadata_category, 'unknown')
            ) AS metadata_richness_information,
            jsonb_build_object(
                'nonce_current', COALESCE(wtx.total_nonce_current, 0),
                'nonce_delta_7days', COALESCE(wtx.total_nonce_delta_7days, 0),
                'nonce_delta_15days', COALESCE(wtx.total_nonce_delta_15days, 0),
                'nonce_delta_1month', COALESCE(wtx.total_nonce_delta_1month, 0),
                'nonce_delta_2month', COALESCE(wtx.total_nonce_delta_2month, 0),
                'nonce_delta_3month', COALESCE(wtx.total_nonce_delta_3month, 0),
                'nonce_delta_6month', COALESCE(wtx.total_nonce_delta_6month, 0),
                'nonce_delta_9month', COALESCE(wtx.total_nonce_delta_9month, 0),
                'nonce_delta_12month', COALESCE(wtx.total_nonce_delta_12month, 0),
                'balance_current', COALESCE(wtx.total_balance_current, 0),
                'balance_delta_7days', COALESCE(wtx.total_balance_delta_7days, 0),
                'balance_delta_15days', COALESCE(wtx.total_balance_delta_15days, 0),
                'balance_delta_1month', COALESCE(wtx.total_balance_delta_1month, 0),
                'balance_delta_2month', COALESCE(wtx.total_balance_delta_2month, 0),
                'balance_delta_3month', COALESCE(wtx.total_balance_delta_3month, 0),
                'balance_delta_6month', COALESCE(wtx.total_balance_delta_6month, 0),
                'balance_delta_9month', COALESCE(wtx.total_balance_delta_9month, 0),
                'balance_delta_12month', COALESCE(wtx.total_balance_delta_12month, 0)
            ) AS wallet_transaction_data,
            jsonb_build_object(
                'total_count', COALESCE(ast.attestations_total_count, 0),
                'valid_count', COALESCE(ast.attestations_valid_count, 0),
                'avg_score', COALESCE(ast.attestation_score_avg, 0)
            ) AS attestations_summary,
            jsonb_build_object(
                'total_count', COALESCE(oce.on_chain_executions_count, 0),
                'valid_count', COALESCE(oce.on_chain_executions_valid_count, 0)
            ) AS on_chain_executions_summary,
            jsonb_build_object(
                'total_count', COALESCE(ocf.on_chain_feedbacks_count, 0),
                'valid_count', COALESCE(ocf.on_chain_feedbacks_valid_count, 0)
            ) AS on_chain_feedbacks_summary,
            jsonb_build_object(
                'total_count', COALESCE(opa.protocol_activity_count, 0),
                'valid_count', COALESCE(opa.protocol_activity_valid_count, 0),
                'valid_payment_count', COALESCE(opa.protocol_activity_valid_payment_count, 0),
                'avg_score', COALESCE(opa.protocol_activity_score, 0)
            ) AS protocol_activity_summary,
            jsonb_build_object(
                'total_count', COALESCE(ea.external_source_count, 0),
                'valid_count', COALESCE(ea.external_source_valid_count, 0),
                'avg_score', COALESCE(ea.external_source_score, 0)
            ) AS external_audits_summary,
            COALESCE(wrn.warnings_data, '[]'::jsonb) AS warnings_summary,
            COALESCE(
                (
                    SELECT jsonb_build_object(
                        'identity_score', ai.identity_score,
                        'identity_stage', ai.identity_stage,
                        'updated_at', ai.updated_at
                    )
                    FROM erc_8004.agent_analysis_identity ai
                    WHERE ai.agent_id = ta.agent_id
                      AND ai.is_revoke = false
                    ORDER BY ai.updated_at DESC
                    LIMIT 1
                ),
                '{}'::jsonb
            ) AS identity_analysis
        FROM temp_target_agents ta
        JOIN erc_8004.agents a ON a.id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_wallet_tx wtx ON wtx.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_attestations ast ON ast.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_on_chain_executions oce ON oce.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_on_chain_feedbacks ocf ON ocf.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_protocol_activity opa ON opa.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_external_audits ea ON ea.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_warning wrn ON wrn.agent_id = ta.agent_id
    LOOP

        -- ====================== BLOQUE BÁSICA (10 pts) ======================
        DECLARE
            v_richness_score numeric := COALESCE((w.metadata_richness_information->>'score')::numeric, 0);
            v_metadata_category text := COALESCE(w.metadata_richness_information->>'category', 'unknown');
        BEGIN
            v_metadata_richness_score := (v_richness_score / 100.0) * 4.0;
            v_metadata_richness_reason := jsonb_build_object(
                'richness_score', v_richness_score,
                'metadata_category', v_metadata_category,
                'reason_eng', CASE v_metadata_category
                    WHEN 'Excellent / Production-Ready' THEN 'Excellent metadata richness (85–100): production-ready profile with complete professional presence.'
                    WHEN 'Strong / Well-Developed' THEN 'Strong metadata richness (70–84): well-developed agent profile suitable for most real-world use.'
                    WHEN 'Moderate / Basic' THEN 'Moderate metadata richness (50–69): functional but needs improvement in key metadata areas.'
                    WHEN 'Limited / Incomplete' THEN 'Limited metadata richness (below 50): incomplete profile requiring significant metadata work.'
                    ELSE 'Limited metadata richness: category unknown or insufficient; treated as incomplete profile.'
                END,
                'reason_esp', CASE v_metadata_category
                    WHEN 'Excellent / Production-Ready' THEN 'Riqueza de metadatos excelente (85–100): perfil listo para producción con presencia profesional completa.'
                    WHEN 'Strong / Well-Developed' THEN 'Riqueza de metadatos fuerte (70–84): perfil bien desarrollado apto para la mayoría de usos reales.'
                    WHEN 'Moderate / Basic' THEN 'Riqueza de metadatos moderada (50–69): funcional pero requiere mejoras en áreas clave de metadatos.'
                    WHEN 'Limited / Incomplete' THEN 'Riqueza de metadatos limitada (menos de 50): perfil incompleto que requiere trabajo significativo en metadatos.'
                    ELSE 'Riqueza de metadatos limitada: categoría desconocida o insuficiente; se trata como perfil incompleto.'
                END
            );
        END;

        DECLARE
            v_nonce_current bigint := COALESCE((w.wallet_transaction_data->>'nonce_current')::bigint, 0);
            v_has_onchain_basic boolean := FALSE;
            v_att_valid integer := COALESCE((w.attestations_summary->>'valid_count')::int, 0);
            v_exec_valid integer := COALESCE((w.on_chain_executions_summary->>'valid_count')::int, 0);
            v_fb_valid integer := COALESCE((w.on_chain_feedbacks_summary->>'valid_count')::int, 0);
        BEGIN
            v_has_onchain_basic := v_att_valid > 0 OR v_exec_valid > 0 OR v_fb_valid > 0;

            IF v_nonce_current > 0 OR v_has_onchain_basic THEN
                v_existence_score := 6.0;
                v_existence_reason := jsonb_build_object(
                    'wallet_basic', v_nonce_current > 0,
                    'nonce_current', v_nonce_current,
                    'onchain_basic', v_has_onchain_basic,
                    'attestations_valid_count', v_att_valid,
                    'on_chain_executions_valid_count', v_exec_valid,
                    'on_chain_feedbacks_valid_count', v_fb_valid,
                    'reason_eng', 'Clear evidence of real existence through wallet activity or on-chain signals (attestations, executions, feedbacks), establishing strong foundational legitimacy.',
                    'reason_esp', 'Evidencia clara de existencia real mediante actividad en wallet o señales on-chain (attestations, executions, feedbacks), estableciendo una legitimidad fundamental sólida.'
                );
            ELSE
                v_existence_score := 0;
                v_existence_reason := jsonb_build_object(
                    'wallet_basic', false,
                    'nonce_current', v_nonce_current,
                    'onchain_basic', false,
                    'attestations_valid_count', v_att_valid,
                    'on_chain_executions_valid_count', v_exec_valid,
                    'on_chain_feedbacks_valid_count', v_fb_valid,
                    'reason_eng', 'No evidence of wallet activity or valid on-chain records, indicating potential lack of real operational existence.',
                    'reason_esp', 'No se detecta evidencia de actividad en wallet ni registros on-chain válidos, lo que indica posible falta de existencia operativa real.'
                );
            END IF;
        END;

        v_block_basic := v_metadata_richness_score + v_existence_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================
        DECLARE
            v_nonce_3m bigint := COALESCE((w.wallet_transaction_data->>'nonce_delta_3month')::bigint, 0);
            v_nonce_1m bigint := COALESCE((w.wallet_transaction_data->>'nonce_delta_1month')::bigint, 0);
            v_nonce_used bigint := 0;
        BEGIN
            v_nonce_used := CASE WHEN v_nonce_3m > 0 THEN v_nonce_3m ELSE v_nonce_1m END;

            IF v_nonce_used >= 1000 THEN
                v_intermediate_wallet_score := 3.0;
            ELSIF v_nonce_used >= 300 THEN
                v_intermediate_wallet_score := 2.0;
            ELSIF v_nonce_used >= 50 THEN
                v_intermediate_wallet_score := 1.0;
            ELSIF v_nonce_used >= 1 THEN
                v_intermediate_wallet_score := 0.5;
            ELSE
                v_intermediate_wallet_score := 0;
            END IF;

            v_intermediate_wallet_reason := jsonb_build_object(
                'nonce_used_field', CASE WHEN v_nonce_3m > 0 THEN 'nonce_delta_3month' ELSE 'nonce_delta_1month' END,
                'value', v_nonce_used,
                'reason_eng', CASE
                    WHEN v_intermediate_wallet_score = 3.0 THEN 'Very strong wallet transaction volume, indicating high real-world usage and operational health.'
                    WHEN v_intermediate_wallet_score = 2.0 THEN 'Good wallet transaction volume, showing solid and consistent activity.'
                    WHEN v_intermediate_wallet_score = 1.0 THEN 'Moderate wallet transaction volume, acceptable for growing agents.'
                    WHEN v_intermediate_wallet_score = 0.5 THEN 'Minimal wallet transaction volume, indicating early-stage usage.'
                    ELSE 'No meaningful wallet transaction volume detected, raising concerns about operational engagement.'
                END,
                'reason_esp', CASE
                    WHEN v_intermediate_wallet_score = 3.0 THEN 'Volumen de transacciones en wallet muy fuerte, indicando alto uso real y salud operativa.'
                    WHEN v_intermediate_wallet_score = 2.0 THEN 'Buen volumen de transacciones en wallet, mostrando actividad sólida y consistente.'
                    WHEN v_intermediate_wallet_score = 1.0 THEN 'Volumen de transacciones moderado, aceptable para agentes en crecimiento.'
                    WHEN v_intermediate_wallet_score = 0.5 THEN 'Volumen de transacciones mínimo, indicando uso en etapa inicial.'
                    ELSE 'No se detecta volumen significativo de transacciones, generando preocupación sobre el engagement operativo.'
                END
            );
        END;

        DECLARE
            v_audit_count integer := COALESCE((w.external_audits_summary->>'valid_count')::int, 0);
            v_avg_score numeric := COALESCE((w.external_audits_summary->>'avg_score')::numeric, 0);
        BEGIN
            IF v_audit_count > 0 THEN
                IF v_avg_score >= 70 THEN
                    v_intermediate_audit_score := 3.0;
                ELSIF v_avg_score >= 50 THEN
                    v_intermediate_audit_score := 2.0;
                ELSIF v_avg_score >= 0 THEN
                    v_intermediate_audit_score := 1.0;
                END IF;
            END IF;

            v_intermediate_audit_reason := jsonb_build_object(
                'valid_audits_count', v_audit_count,
                'avg_score', round(v_avg_score, 2),
                'reason_eng', CASE
                    WHEN v_intermediate_audit_score = 3.0 THEN 'Strong external audit presence with high average quality (≥70%), providing excellent third-party validation.'
                    WHEN v_intermediate_audit_score = 2.0 THEN 'Moderate external audit presence with acceptable quality.'
                    WHEN v_intermediate_audit_score = 1.0 THEN 'Basic external audit presence, offering limited but positive validation.'
                    ELSE 'No meaningful external audits found, missing important third-party credibility signals.'
                END,
                'reason_esp', CASE
                    WHEN v_intermediate_audit_score = 3.0 THEN 'Fuerte presencia de auditorías externas con alta calidad promedio (≥70%), brindando excelente validación de terceros.'
                    WHEN v_intermediate_audit_score = 2.0 THEN 'Presencia moderada de auditorías externas con calidad aceptable.'
                    WHEN v_intermediate_audit_score = 1.0 THEN 'Presencia básica de auditorías externas, ofreciendo validación limitada pero positiva.'
                    ELSE 'No se encontraron auditorías externas significativas, faltando señales importantes de credibilidad de terceros.'
                END
            );
        END;

        DECLARE
            v_prot_count integer := COALESCE((w.protocol_activity_summary->>'valid_count')::int, 0);
            v_avg_prot numeric := COALESCE((w.protocol_activity_summary->>'avg_score')::numeric, 0);
        BEGIN
            IF v_prot_count BETWEEN 1 AND 7 AND v_prot_count > 0 THEN
                IF v_avg_prot >= 60 THEN
                    v_intermediate_protocol_score := 3.0;
                ELSIF v_avg_prot >= 40 THEN
                    v_intermediate_protocol_score := 2.0;
                ELSIF v_avg_prot >= 0 THEN
                    v_intermediate_protocol_score := 1.0;
                END IF;
            END IF;

            v_intermediate_protocol_reason := jsonb_build_object(
                'valid_activities_count', v_prot_count,
                'avg_score', round(v_avg_prot, 2),
                'reason_eng', CASE
                    WHEN v_intermediate_protocol_score = 3.0 THEN 'Strong protocol activity with good volume and quality, demonstrating real on-chain engagement.'
                    WHEN v_intermediate_protocol_score = 2.0 THEN 'Moderate protocol activity, showing acceptable operational usage.'
                    WHEN v_intermediate_protocol_score = 1.0 THEN 'Basic protocol activity, providing minimal but positive signals.'
                    ELSE 'No meaningful protocol activity detected, limiting demonstrated real-world usage.'
                END,
                'reason_esp', CASE
                    WHEN v_intermediate_protocol_score = 3.0 THEN 'Fuerte actividad en protocolos con buen volumen y calidad, demostrando engagement real on-chain.'
                    WHEN v_intermediate_protocol_score = 2.0 THEN 'Actividad moderada en protocolos, mostrando uso operativo aceptable.'
                    WHEN v_intermediate_protocol_score = 1.0 THEN 'Actividad básica en protocolos, proporcionando señales mínimas pero positivas.'
                    ELSE 'No se detecta actividad significativa en protocolos, limitando la demostración de uso real.'
                END
            );
        END;

        v_block_intermediate := v_intermediate_wallet_score + v_intermediate_audit_score + v_intermediate_protocol_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================
        DECLARE
            v_audit_count integer := COALESCE((w.external_audits_summary->>'valid_count')::int, 0);
            v_avg_score numeric := COALESCE((w.external_audits_summary->>'avg_score')::numeric, 0);
        BEGIN
            IF v_audit_count >= 2 AND v_audit_count > 0 THEN
                IF v_avg_score >= 90 THEN
                    v_advanced_audit_score := 3.0;
                ELSIF v_avg_score >= 80 THEN
                    v_advanced_audit_score := 2.5;
                ELSIF v_avg_score >= 70 THEN
                    v_advanced_audit_score := 2.0;
                ELSIF v_avg_score >= 60 THEN
                    v_advanced_audit_score := 1.0;
                END IF;
            END IF;

            v_advanced_audit_reason := jsonb_build_object(
                'valid_audits_count', v_audit_count,
                'avg_score', round(v_avg_score, 2),
                'reason_eng', CASE
                    WHEN v_advanced_audit_score = 3.0 THEN 'Exceptional advanced external audit coverage with very high quality (≥90%), representing best-in-class third-party validation.'
                    WHEN v_advanced_audit_score >= 2.5 THEN 'Strong advanced external audit coverage with excellent quality.'
                    WHEN v_advanced_audit_score >= 2.0 THEN 'Good advanced external audit coverage with solid quality.'
                    ELSE 'Limited advanced external audit coverage or quality, reducing high-end credibility signals.'
                END,
                'reason_esp', CASE
                    WHEN v_advanced_audit_score = 3.0 THEN 'Cobertura excepcional de auditorías externas avanzadas con calidad muy alta (≥90%), representando validación de terceros de clase mundial.'
                    WHEN v_advanced_audit_score >= 2.5 THEN 'Fuerte cobertura de auditorías externas avanzadas con calidad excelente.'
                    WHEN v_advanced_audit_score >= 2.0 THEN 'Buena cobertura de auditorías externas avanzadas con calidad sólida.'
                    ELSE 'Cobertura o calidad limitada de auditorías externas avanzadas, reduciendo señales de credibilidad de alto nivel.'
                END
            );
        END;

        DECLARE
            v_nonce_6m bigint := COALESCE((w.wallet_transaction_data->>'nonce_delta_6month')::bigint, 0);
        BEGIN
            IF v_nonce_6m >= 800 THEN
                v_advanced_wallet_score := 1.0;
                v_advanced_wallet_reason := jsonb_build_object(
                    'nonce_delta_6month', v_nonce_6m,
                    'reason_eng', 'Sustained high wallet transaction volume over 6 months, demonstrating consistent long-term usage and operational health.',
                    'reason_esp', 'Volumen sostenido alto de transacciones en wallet durante 6 meses, demostrando uso consistente a largo plazo y salud operativa.'
                );
            ELSE
                v_advanced_wallet_score := 0;
                v_advanced_wallet_reason := jsonb_build_object(
                    'nonce_delta_6month', v_nonce_6m,
                    'reason_eng', 'Insufficient sustained wallet volume over 6 months, limiting evidence of long-term operational commitment.',
                    'reason_esp', 'Volumen sostenido insuficiente en wallet durante 6 meses, limitando la evidencia de compromiso operativo a largo plazo.'
                );
            END IF;
        END;

        DECLARE
            v_prot_count integer := COALESCE((w.protocol_activity_summary->>'valid_count')::int, 0);
            v_avg_prot numeric := COALESCE((w.protocol_activity_summary->>'avg_score')::numeric, 0);
        BEGIN
            IF v_prot_count >= 10 AND v_prot_count > 0 THEN
                IF v_avg_prot >= 90 THEN
                    v_advanced_protocol_score := 1.0;
                ELSIF v_avg_prot >= 80 THEN
                    v_advanced_protocol_score := 0.75;
                ELSIF v_avg_prot >= 70 THEN
                    v_advanced_protocol_score := 0.5;
                END IF;
            END IF;

            v_advanced_protocol_reason := jsonb_build_object(
                'valid_activities_count', v_prot_count,
                'avg_score', round(v_avg_prot, 2),
                'reason_eng', CASE
                    WHEN v_advanced_protocol_score = 1.0 THEN 'Exceptional advanced protocol activity with very high quality and volume, reflecting elite operational maturity.'
                    WHEN v_advanced_protocol_score >= 0.75 THEN 'Strong advanced protocol activity with good quality.'
                    WHEN v_advanced_protocol_score >= 0.5 THEN 'Moderate advanced protocol activity.'
                    ELSE 'Limited advanced protocol activity, reducing evidence of high-end on-chain engagement.'
                END,
                'reason_esp', CASE
                    WHEN v_advanced_protocol_score = 1.0 THEN 'Actividad excepcional en protocolos avanzados con calidad y volumen muy altos, reflejando madurez operativa de élite.'
                    WHEN v_advanced_protocol_score >= 0.75 THEN 'Fuerte actividad en protocolos avanzados con buena calidad.'
                    WHEN v_advanced_protocol_score >= 0.5 THEN 'Actividad moderada en protocolos avanzados.'
                    ELSE 'Actividad avanzada en protocolos limitada, reduciendo la evidencia de engagement on-chain de alto nivel.'
                END
            );
        END;

        DECLARE
            v_ident jsonb := w.identity_analysis;
        BEGIN
            IF v_ident IS NOT NULL
               AND v_ident <> '{}'::jsonb
               AND (v_ident->>'identity_score') IS NOT NULL THEN

                v_identity_analysis_score := LEAST(1.0, COALESCE((v_ident->>'identity_score')::numeric, 0) / 100.0);

                v_identity_analysis_reason := jsonb_build_object(
                    'identity_score', (v_ident->>'identity_score')::numeric,
                    'identity_stage', v_ident->>'identity_stage',
                    'reason_eng', CASE
                        WHEN v_identity_analysis_score = 1.0 THEN 'Excellent identity analysis with strong soulbound verification, providing maximum trust and authenticity signals.'
                        WHEN v_identity_analysis_score >= 0.5 THEN 'Good identity analysis, contributing positively to agent credibility.'
                        ELSE 'Limited identity analysis, reducing overall trust signals.'
                    END,
                    'reason_esp', CASE
                        WHEN v_identity_analysis_score = 1.0 THEN 'Análisis de identidad excelente con fuerte verificación soulbound, proporcionando señales máximas de confianza y autenticidad.'
                        WHEN v_identity_analysis_score >= 0.5 THEN 'Buen análisis de identidad, contribuyendo positivamente a la credibilidad del agente.'
                        ELSE 'Análisis de identidad limitado, reduciendo las señales generales de confianza.'
                    END
                );
            ELSE
                v_identity_analysis_score := 0;
                v_identity_analysis_reason := jsonb_build_object(
                    'reason_eng', 'No identity analysis present, missing critical authenticity and trust validation.',
                    'reason_esp', 'No hay análisis de identidad presente, faltando validación crítica de autenticidad y confianza.'
                );
            END IF;
        END;

        v_block_advanced := v_advanced_audit_score + v_advanced_wallet_score +
                            v_identity_analysis_score + v_advanced_protocol_score;

        -- ====================== PENALIZACIÓN (warnings) ======================
        DECLARE
            v_warning_elem jsonb;
            v_warnings_list jsonb := '[]'::jsonb;
            v_msg_eng text;
            v_msg_esp text;
            v_warn_type text;
        BEGIN
            v_penalty_score := 0;

            FOR v_warning_elem IN
                SELECT value FROM jsonb_array_elements(COALESCE(w.warnings_summary, '[]'::jsonb))
            LOOP
                v_penalty_score := v_penalty_score + COALESCE((v_warning_elem->>'score_impact')::numeric, 0);
                v_msg_eng := v_warning_elem->>'message';
                v_warn_type := v_warning_elem->>'type';

                v_msg_esp := CASE v_warn_type
                    WHEN 'duplication_metadata' THEN 'Agente con metadatos duplicados'
                    WHEN 'multi_agent_wallet' THEN COALESCE(
                        format('Wallet compartida con %s agente(s)',
                            COALESCE((v_warning_elem->'details'->>'shared_with_agents_count'), '0')),
                        v_msg_eng)
                    WHEN 'dummy_metadata' THEN 'Metadatos de baja calidad'
                    WHEN 'attestations_spam' THEN COALESCE(
                        format('Attestations spam detectadas (%s)',
                            COALESCE((v_warning_elem->'details'->>'spam_count'), '0')),
                        v_msg_eng)
                    WHEN 'external_audit_warning' THEN 'Auditoría externa con señales de riesgo'
                    WHEN 'high_revocations' THEN COALESCE(v_msg_eng, 'Alta tasa de revocaciones')
                    WHEN 'owner_inactive_agents' THEN 'Owner con alta proporción de agentes inactivos'
                    WHEN 'high_ownership_churn' THEN 'Alta rotación reciente de ownership'
                    WHEN 'transactional_wallet_same_as_owner' THEN 'Wallet transaccional coincide con wallet del owner'
                    WHEN 'lower_realness' THEN COALESCE(v_msg_eng, 'Puntaje Realness bajo')
                    WHEN 'lower_metadata_richness' THEN COALESCE(v_msg_eng, 'Riqueza de metadatos baja')
                    ELSE COALESCE(v_msg_eng, v_warn_type)
                END;

                v_warnings_list := v_warnings_list || jsonb_build_array(
                    jsonb_build_object(
                        'type', v_warn_type,
                        'severity', v_warning_elem->>'severity',
                        'score_impact', COALESCE((v_warning_elem->>'score_impact')::numeric, 0),
                        'message_eng', v_msg_eng,
                        'message_esp', v_msg_esp,
                        'details', COALESCE(v_warning_elem->'details', '{}'::jsonb)
                    )
                );
            END LOOP;

            v_penalty_reason := jsonb_build_object(
                'total_penalty', v_penalty_score,
                'warnings', v_warnings_list,
                'warnings_count', jsonb_array_length(v_warnings_list),
                'reason_eng', CASE
                    WHEN v_penalty_score < 0 THEN 'Active warnings detected; cumulative score impact reduces overall Measure pillar score.'
                    ELSE 'No active warnings; no penalty applied in this calculation cycle.'
                END,
                'reason_esp', CASE
                    WHEN v_penalty_score < 0 THEN 'Advertencias activas detectadas; el impacto acumulado reduce el puntaje del pilar Measure.'
                    ELSE 'Sin advertencias activas; no se aplica penalización en este ciclo de cálculo.'
                END
            );
        END;

        v_total_score := GREATEST(v_block_basic + v_block_intermediate + v_block_advanced + v_penalty_score, 0);

        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng',
                CASE
                    WHEN v_total_score >= 22.0 THEN 'The agent demonstrates excellent foundational maturity and strong market credibility.'
                    WHEN v_total_score >= 18.5 THEN 'The agent has solid foundations with good legitimacy signals, though some strengthening is still recommended.'
                    WHEN v_total_score >= 15.0 THEN 'The agent has acceptable foundations but shows clear areas of weakness that could limit its perceived trustworthiness.'
                    WHEN v_total_score >= 11.0 THEN 'The agent has weak foundational quality. Multiple red flags are affecting its credibility in the ecosystem.'
                    ELSE 'The agent exhibits very weak foundational quality. Significant concerns exist regarding its legitimacy and professionalism.'
                END,
            'overall_assessment_esp',
                CASE
                    WHEN v_total_score >= 22.0 THEN 'El agente demuestra una excelente madurez fundamental y fuerte credibilidad en el mercado.'
                    WHEN v_total_score >= 18.5 THEN 'El agente tiene fundamentos sólidos con buenas señales de legitimidad, aunque se recomienda fortalecer algunos aspectos.'
                    WHEN v_total_score >= 15.0 THEN 'El agente tiene fundamentos aceptables pero presenta claras debilidades que podrían limitar su confianza percibida.'
                    WHEN v_total_score >= 11.0 THEN 'El agente tiene una calidad fundamental débil. Múltiples alertas rojas afectan su credibilidad en el ecosistema.'
                    ELSE 'El agente presenta una calidad fundamental muy débil. Existen preocupaciones importantes sobre su legitimidad y profesionalismo.'
                END,
            'business_interpretation_eng',
                'This Measure pillar evaluates the agent''s core identity strength, proof of existence, and foundational credibility. ' ||
                CASE
                    WHEN v_penalty_score < 0 THEN 'Active warnings are materially undermining trust and score. '
                    WHEN v_metadata_richness_score < 2.0 THEN 'Poor metadata quality significantly weakens the agent''s professional appearance. '
                    WHEN v_existence_score < 4.0 THEN 'Lack of sufficient on-chain proof of existence raises serious legitimacy concerns. '
                    ELSE 'The agent shows reasonable foundational elements. '
                END ||
                'Overall, the current level suggests ' ||
                CASE
                    WHEN v_total_score < 11.0 THEN 'high risk for partners and users.'
                    WHEN v_total_score < 15.0 THEN 'moderate to high risk.'
                    WHEN v_total_score < 18.5 THEN 'moderate risk.'
                    ELSE 'relatively low risk.'
                END,
            'business_interpretation_esp',
                'Este pilar Measure evalúa la fortaleza de la identidad del agente, la prueba de existencia real y su credibilidad fundamental. ' ||
                CASE
                    WHEN v_penalty_score < 0 THEN 'Advertencias activas están socavando materialmente la confianza y el puntaje. '
                    WHEN v_metadata_richness_score < 2.0 THEN 'La baja calidad de metadatos debilita significativamente la apariencia profesional del agente. '
                    WHEN v_existence_score < 4.0 THEN 'La falta de prueba suficiente de existencia on-chain genera serias dudas sobre su legitimidad. '
                    ELSE 'El agente muestra elementos fundamentales razonables. '
                END ||
                'En general, el nivel actual sugiere ' ||
                CASE
                    WHEN v_total_score < 11.0 THEN 'alto riesgo para socios y usuarios.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado a alto.'
                    WHEN v_total_score < 18.5 THEN 'riesgo moderado.'
                    ELSE 'riesgo relativamente bajo.'
                END,
            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_existence_score >= 5.0 THEN 'Demonstrated real on-chain presence and activity' END),
                        (CASE WHEN v_metadata_richness_score >= 3.0 THEN 'Professional and complete identity presentation' END),
                        (CASE WHEN v_intermediate_wallet_score = 3.0 THEN 'Strong operational activity level' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_existence_score >= 5.0 THEN 'Presencia real demostrada mediante actividad on-chain' END),
                        (CASE WHEN v_metadata_richness_score >= 3.0 THEN 'Presentación profesional y completa de identidad' END),
                        (CASE WHEN v_intermediate_wallet_score = 3.0 THEN 'Fuerte nivel de actividad operativa' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_penalty_score < 0 THEN 'Active warnings detected — review severity and resolve operational risks' END),
                        (CASE WHEN v_metadata_richness_score < 2.8 THEN 'Insufficient metadata quality affecting professional perception' END),
                        (CASE WHEN v_existence_score < 4.0 THEN 'Weak proof of real existence and operational history' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_penalty_score < 0 THEN 'Advertencias activas detectadas — revisar severidad y resolver riesgos operativos' END),
                        (CASE WHEN v_metadata_richness_score < 2.8 THEN 'Calidad insuficiente de metadatos afectando la percepción profesional' END),
                        (CASE WHEN v_existence_score < 4.0 THEN 'Débil prueba de existencia real e historial operativo' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'recommendation_eng',
                CASE
                    WHEN v_penalty_score < 0 THEN 'Priority: Address active warnings (duplication, wallet sharing, spam, etc.) as they are materially damaging credibility and score.'
                    WHEN v_metadata_richness_score < 2.0 THEN 'Focus on improving metadata completeness (name, description, image and tags) to strengthen professional perception.'
                    WHEN v_existence_score < 4.0 THEN 'Generate consistent on-chain activity and wallet usage to provide clear proof of real existence.'
                    ELSE 'Continue strengthening metadata quality and on-chain presence to reach higher maturity levels.'
                END,
            'recommendation_esp',
                CASE
                    WHEN v_penalty_score < 0 THEN 'Prioridad: Atender advertencias activas (duplicación, wallet compartida, spam, etc.) ya que dañan materialmente la credibilidad y el puntaje.'
                    WHEN v_metadata_richness_score < 2.0 THEN 'Enfocarse en mejorar la completitud de los metadatos (nombre, descripción, imagen y etiquetas) para fortalecer la percepción profesional.'
                    WHEN v_existence_score < 4.0 THEN 'Generar actividad on-chain consistente y uso de wallet para proporcionar prueba clara de existencia real.'
                    ELSE 'Continuar fortaleciendo la calidad de metadatos y presencia on-chain para alcanzar niveles superiores de madurez.'
                END,
            'last_calculated', now()
        );

        INSERT INTO index_humi.pillar_measures (
            agent_id,
            metadata_richness_score, metadata_richness_reason,
            existence_score, existence_reason,
            intermediate_wallet_transaction_score, intermediate_wallet_transaction_reason,
            intermediate_external_audits_score, intermediate_external_audits_reason,
            intermediate_protocol_activities_score, intermediate_protocol_activities_reason,
            advanced_external_audits_score, advanced_external_audits_reason,
            advanced_wallet_transaction_score, advanced_wallet_transaction_reason,
            advanced_protocol_activities_score, advanced_protocol_activities_reason,
            identity_analysis_score, identity_analysis_reason,
            penalty_score, penalty_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary,
            calculated_at, version, change_reason, calculated_by
        )
        VALUES (
            w.agent_id,
            v_metadata_richness_score, v_metadata_richness_reason,
            v_existence_score, v_existence_reason,
            v_intermediate_wallet_score, v_intermediate_wallet_reason,
            v_intermediate_audit_score, v_intermediate_audit_reason,
            v_intermediate_protocol_score, v_intermediate_protocol_reason,
            v_advanced_audit_score, v_advanced_audit_reason,
            v_advanced_wallet_score, v_advanced_wallet_reason,
            v_advanced_protocol_score, v_advanced_protocol_reason,
            v_identity_analysis_score, v_identity_analysis_reason,
            v_penalty_score, v_penalty_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary,
            now(), v_new_version,
            'recalculation - agent_summary MVs + pillar_measures', 'system'
        )
        ON CONFLICT (agent_id) DO UPDATE SET
            metadata_richness_score = EXCLUDED.metadata_richness_score,
            metadata_richness_reason = EXCLUDED.metadata_richness_reason,
            existence_score = EXCLUDED.existence_score,
            existence_reason = EXCLUDED.existence_reason,
            intermediate_wallet_transaction_score = EXCLUDED.intermediate_wallet_transaction_score,
            intermediate_wallet_transaction_reason = EXCLUDED.intermediate_wallet_transaction_reason,
            intermediate_external_audits_score = EXCLUDED.intermediate_external_audits_score,
            intermediate_external_audits_reason = EXCLUDED.intermediate_external_audits_reason,
            intermediate_protocol_activities_score = EXCLUDED.intermediate_protocol_activities_score,
            intermediate_protocol_activities_reason = EXCLUDED.intermediate_protocol_activities_reason,
            advanced_external_audits_score = EXCLUDED.advanced_external_audits_score,
            advanced_external_audits_reason = EXCLUDED.advanced_external_audits_reason,
            advanced_wallet_transaction_score = EXCLUDED.advanced_wallet_transaction_score,
            advanced_wallet_transaction_reason = EXCLUDED.advanced_wallet_transaction_reason,
            advanced_protocol_activities_score = EXCLUDED.advanced_protocol_activities_score,
            advanced_protocol_activities_reason = EXCLUDED.advanced_protocol_activities_reason,
            identity_analysis_score = EXCLUDED.identity_analysis_score,
            identity_analysis_reason = EXCLUDED.identity_analysis_reason,
            penalty_score = EXCLUDED.penalty_score,
            penalty_reason = EXCLUDED.penalty_reason,
            block_basic_score = EXCLUDED.block_basic_score,
            block_intermediate_score = EXCLUDED.block_intermediate_score,
            block_advanced_score = EXCLUDED.block_advanced_score,
            pillar_score = EXCLUDED.pillar_score,
            calculated_at = EXCLUDED.calculated_at,
            version = EXCLUDED.version,
            pillar_summary = EXCLUDED.pillar_summary,
            change_reason = EXCLUDED.change_reason,
            calculated_by = EXCLUDED.calculated_by;

    END LOOP;

    RETURN v_processed;
END;
$$;
