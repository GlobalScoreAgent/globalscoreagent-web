-- MVs erc_8004.agent_summary_* + pillar_usage + pillar_usage_tracking (sin agent_usage).
-- Test: SELECT index_humi.agent_pillar_usage_calculate(10);

CREATE OR REPLACE FUNCTION index_humi.agent_pillar_usage_calculate(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO index_humi, erc_8004, public
AS $$
DECLARE
    v_processed integer := 0;
    w               record;

    v_basic_activity_score       numeric := 0;
    v_basic_activity_reason      jsonb;

    v_wallet_intermediate_score  numeric := 0;
    v_wallet_intermediate_reason jsonb;
    v_on_chain_intermediate_score numeric := 0;
    v_on_chain_intermediate_reason jsonb;
    v_comment_score              numeric := 0;
    v_comment_reason             jsonb;

    v_wallet_advanced_score      numeric := 0;
    v_wallet_advanced_reason     jsonb;
    v_on_chain_advanced_score    numeric := 0;
    v_on_chain_advanced_reason   jsonb;
    v_on_chain_paid_score        numeric := 0;
    v_on_chain_paid_reason       jsonb;

    v_penalty_score              numeric := 0;
    v_penalty_reason             jsonb;

    v_block_basic                numeric := 0;
    v_block_intermediate         numeric := 0;
    v_block_advanced             numeric := 0;
    v_pillar_score               numeric := 0;

    v_pillar_summary             jsonb;
    v_new_version                text := '1';

BEGIN
    CREATE TEMP TABLE temp_target_agents (
        agent_id bigint PRIMARY KEY
    ) ON COMMIT DROP;

    INSERT INTO temp_target_agents (agent_id)
    SELECT a.id
    FROM erc_8004.agents a
    JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
    LEFT JOIN index_humi.pillar_usage pu ON a.id = pu.agent_id
    WHERE ap.source = 'definitive'
      AND (pu.agent_id IS NULL OR pu.calculated_at < CURRENT_DATE::timestamptz)
    ORDER BY pu.calculated_at ASC NULLS FIRST
    LIMIT p_limit;

    SELECT COUNT(*)::integer INTO v_processed FROM temp_target_agents;

    INSERT INTO index_humi.pillar_usage_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ta.agent_id, '[]'::jsonb, '[]'::jsonb
    FROM temp_target_agents ta
    ON CONFLICT (agent_id) DO NOTHING;

    WITH current_state AS (
        SELECT
            ta.agent_id,
            pu.pillar_score AS old_pillar_score,
            pu.block_basic_score AS old_block_basic_score,
            pu.block_intermediate_score AS old_block_intermediate_score,
            pu.block_advanced_score AS old_block_advanced_score,
            pu.calculated_at AS old_calculated_at,
            COALESCE(put.pillar_score_last_30_days, '[]'::jsonb) AS old_last_30_days,
            COALESCE(put.pillar_score_monthly, '[]'::jsonb) AS old_monthly
        FROM temp_target_agents ta
        LEFT JOIN index_humi.pillar_usage pu ON pu.agent_id = ta.agent_id
        LEFT JOIN index_humi.pillar_usage_tracking put ON put.agent_id = ta.agent_id
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
    INSERT INTO index_humi.pillar_usage_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ct.agent_id, ct.new_last_30_days, ct.new_monthly
    FROM computed_tracking ct
    ON CONFLICT (agent_id) DO UPDATE SET
        pillar_score_last_30_days = EXCLUDED.pillar_score_last_30_days,
        pillar_score_monthly = EXCLUDED.pillar_score_monthly;

    FOR w IN
        SELECT
            ta.agent_id,
            a.on_chain_created_at AS agent_created_at,
            jsonb_build_object(
                'nonce_current', COALESCE(wtx.total_nonce_current, 0),
                'nonce_delta_yesterday', COALESCE(wtx.total_nonce_delta_7days, 0),
                'nonce_delta_15_days', COALESCE(wtx.total_nonce_delta_15days, 0),
                'nonce_delta_30_days', COALESCE(wtx.total_nonce_delta_1month, 0),
                'balance_current', COALESCE(wtx.total_balance_current, 0),
                'balance_delta_yesterday', COALESCE(wtx.total_balance_delta_7days, 0),
                'balance_delta_15_days', COALESCE(wtx.total_balance_delta_15days, 0),
                'balance_delta_30_days', COALESCE(wtx.total_balance_delta_1month, 0)
            ) AS wallet_tx_summary,
            jsonb_build_object(
                'total_count', COALESCE(ast.attestations_total_count, 0),
                'valid_count', COALESCE(ast.attestations_valid_count, 0),
                'revoke_count', COALESCE(ast.attestations_revoke_count, 0),
                'spam_count', COALESCE(ast.attestation_spam_count, 0),
                'avg_score', ast.attestation_score_avg
            ) AS attestations_summary,
            jsonb_build_object(
                'total_count', COALESCE(oce.on_chain_executions_count, 0),
                'valid_count', COALESCE(oce.on_chain_executions_valid_count, 0),
                'revoke_count', COALESCE(oce.on_chain_executions_revoke_count, 0)
            ) AS on_chain_executions_summary,
            jsonb_build_object(
                'total_count', COALESCE(ocf.on_chain_feedbacks_count, 0),
                'valid_count', COALESCE(ocf.on_chain_feedbacks_valid_count, 0),
                'revoke_count', COALESCE(ocf.on_chain_feedbacks_revoke_count, 0),
                'avg_score', ocf.on_chain_feedbacks_avg_score
            ) AS on_chain_feedbacks_summary,
            jsonb_build_object(
                'total_count', COALESCE(opa.protocol_activity_count, 0),
                'valid_count', COALESCE(opa.protocol_activity_valid_count, 0),
                'revoke_count', COALESCE(opa.protocol_activity_revoke_count, 0),
                'valid_payment_count', COALESCE(opa.protocol_activity_valid_payment_count, 0),
                'avg_score', opa.protocol_activity_score
            ) AS protocol_activity_summary,
            jsonb_build_object(
                'total_count', COALESCE(com.comments_total_count, 0),
                'valid_count', COALESCE(com.comments_valid_count, 0),
                'revoke_count', COALESCE(com.comments_revoke_count, 0)
            ) AS comments_summary
        FROM temp_target_agents ta
        JOIN erc_8004.agents a ON a.id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_wallet_tx wtx ON wtx.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_attestation_last_30_days ast ON ast.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_on_chain_executions_last_30_days oce ON oce.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_on_chain_feedbacks_last_30_days ocf ON ocf.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_protocol_activity_last_30_days opa ON opa.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_comments_last_30_days com ON com.agent_id = ta.agent_id
    LOOP
        v_basic_activity_score := 0;
        v_wallet_intermediate_score := 0;
        v_on_chain_intermediate_score := 0;
        v_comment_score := 0;
        v_wallet_advanced_score := 0;
        v_on_chain_advanced_score := 0;
        v_on_chain_paid_score := 0;
        v_penalty_score := 0;

        -- ====================== BLOQUE BÁSICA (10 pts) ======================
        DECLARE
            v_agent_age_days integer := 0;
            v_nonce_current numeric := 0;
            v_nonce_delta_30 numeric := 0;
            v_att_valid integer := 0;
            v_exec_valid integer := 0;
            v_fb_valid integer := 0;
            v_prot_valid integer := 0;
        BEGIN
            v_nonce_current := COALESCE((w.wallet_tx_summary->>'nonce_current')::numeric, 0);
            v_nonce_delta_30 := COALESCE((w.wallet_tx_summary->>'nonce_delta_30_days')::numeric, 0);
            v_att_valid := COALESCE((w.attestations_summary->>'valid_count')::int, 0);
            v_exec_valid := COALESCE((w.on_chain_executions_summary->>'valid_count')::int, 0);
            v_fb_valid := COALESCE((w.on_chain_feedbacks_summary->>'valid_count')::int, 0);
            v_prot_valid := COALESCE((w.protocol_activity_summary->>'valid_count')::int, 0);

            IF w.agent_created_at IS NOT NULL THEN
                v_agent_age_days := EXTRACT(DAY FROM (CURRENT_DATE - w.agent_created_at))::int;
            END IF;

            IF v_agent_age_days < 30 THEN
                IF v_nonce_current > 0 THEN
                    v_basic_activity_score := 10.0;
                    v_basic_activity_reason := jsonb_build_object(
                        'type', 'new_agent',
                        'age_days', v_agent_age_days,
                        'nonce_current', v_nonce_current,
                        'reason_eng', 'New agent showing immediate on-chain activity (nonce_current > 0), indicating strong initial engagement and operational readiness.',
                        'reason_esp', 'Agente nuevo mostrando actividad on-chain inmediata (nonce_current > 0), indicando fuerte engagement inicial y preparación operativa.'
                    );
                ELSE
                    v_basic_activity_score := 0;
                    v_basic_activity_reason := jsonb_build_object(
                        'reason_eng', 'New agent with no current activity (nonce_current = 0), suggesting low initial engagement or potential inactivity.',
                        'reason_esp', 'Agente nuevo sin actividad actual (nonce_current = 0), sugiriendo bajo engagement inicial o posible inactividad.'
                    );
                END IF;
            ELSE
                IF v_nonce_delta_30 > 0 OR
                   ((v_att_valid > 0)::int + (v_exec_valid > 0)::int + (v_fb_valid > 0)::int + (v_prot_valid > 0)::int) >= 2 THEN
                    v_basic_activity_score := 10.0;
                    v_basic_activity_reason := jsonb_build_object(
                        'type', 'established_agent',
                        'age_days', v_agent_age_days,
                        'nonce_delta_30d', v_nonce_delta_30,
                        'onchain_types', (v_att_valid > 0)::int + (v_exec_valid > 0)::int + (v_fb_valid > 0)::int + (v_prot_valid > 0)::int,
                        'reason_eng', 'Established agent demonstrating consistent recent activity across multiple on-chain channels, reflecting healthy operational maturity.',
                        'reason_esp', 'Agente establecido demostrando actividad reciente consistente en múltiples canales on-chain, reflejando madurez operativa saludable.'
                    );
                ELSE
                    v_basic_activity_score := 0;
                    v_basic_activity_reason := jsonb_build_object(
                        'reason_eng', 'No meaningful activity detected in the last 30 days, indicating potential inactivity or low engagement risk.',
                        'reason_esp', 'No se detecta actividad significativa en los últimos 30 días, indicando posible inactividad o bajo riesgo de engagement.'
                    );
                END IF;
            END IF;
        END;

        v_block_basic := v_basic_activity_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================

        -- 1. Wallet Intermediate
        DECLARE
            v_agent_age_days integer := 0;
            v_nonce_current numeric := 0;
            v_nonce_delta_15 numeric := 0;
        BEGIN
            v_nonce_current := COALESCE((w.wallet_tx_summary->>'nonce_current')::numeric, 0);
            v_nonce_delta_15 := COALESCE((w.wallet_tx_summary->>'nonce_delta_15_days')::numeric, 0);

            IF w.agent_created_at IS NOT NULL THEN
                v_agent_age_days := EXTRACT(DAY FROM (CURRENT_DATE - w.agent_created_at))::int;
            END IF;

            IF v_agent_age_days < 15 THEN
                IF v_nonce_current >= 301 THEN
                    v_wallet_intermediate_score := 3.0;
                ELSIF v_nonce_current >= 101 THEN
                    v_wallet_intermediate_score := 2.0;
                ELSIF v_nonce_current >= 1 THEN
                    v_wallet_intermediate_score := 1.0;
                ELSE
                    v_wallet_intermediate_score := 0;
                END IF;
            ELSE
                IF v_nonce_delta_15 >= 301 THEN
                    v_wallet_intermediate_score := 3.0;
                ELSIF v_nonce_delta_15 >= 101 THEN
                    v_wallet_intermediate_score := 2.0;
                ELSIF v_nonce_delta_15 >= 1 THEN
                    v_wallet_intermediate_score := 1.0;
                ELSE
                    v_wallet_intermediate_score := 0;
                END IF;
            END IF;

            v_wallet_intermediate_reason := jsonb_build_object(
                'age_days', v_agent_age_days,
                'nonce_used', CASE WHEN v_agent_age_days < 15 THEN 'nonce_current' ELSE 'nonce_delta_15_days' END,
                'value', CASE WHEN v_agent_age_days < 15 THEN v_nonce_current ELSE v_nonce_delta_15 END,
                'reason_eng', CASE
                    WHEN v_wallet_intermediate_score = 3.0 THEN 'Strong recent wallet activity demonstrating healthy transactional volume.'
                    WHEN v_wallet_intermediate_score = 2.0 THEN 'Moderate wallet activity showing acceptable engagement levels.'
                    WHEN v_wallet_intermediate_score = 1.0 THEN 'Minimal wallet activity, indicating early-stage or low-intensity usage.'
                    ELSE 'No meaningful wallet activity detected, raising concerns about operational engagement.'
                END,
                'reason_esp', CASE
                    WHEN v_wallet_intermediate_score = 3.0 THEN 'Fuerte actividad reciente en wallet demostrando volumen transaccional saludable.'
                    WHEN v_wallet_intermediate_score = 2.0 THEN 'Actividad moderada en wallet mostrando niveles aceptables de engagement.'
                    WHEN v_wallet_intermediate_score = 1.0 THEN 'Actividad mínima en wallet, indicando uso en etapa inicial o de baja intensidad.'
                    ELSE 'No se detecta actividad significativa en wallet, generando preocupación sobre el engagement operativo.'
                END
            );
        END;

        -- 2. On-Chain Activity Intermediate
        DECLARE
            v_onchain_count integer := 0;
            v_onchain_avg   numeric := 0;
            v_att_valid integer := 0;
            v_exec_valid integer := 0;
            v_fb_valid integer := 0;
            v_prot_valid integer := 0;
            v_att_avg numeric;
            v_fb_avg numeric;
            v_prot_avg numeric;
        BEGIN
            v_att_valid := COALESCE((w.attestations_summary->>'valid_count')::int, 0);
            v_exec_valid := COALESCE((w.on_chain_executions_summary->>'valid_count')::int, 0);
            v_fb_valid := COALESCE((w.on_chain_feedbacks_summary->>'valid_count')::int, 0);
            v_prot_valid := COALESCE((w.protocol_activity_summary->>'valid_count')::int, 0);

            v_onchain_count := (CASE WHEN v_att_valid > 0 THEN 1 ELSE 0 END) +
                               (CASE WHEN v_exec_valid > 0 THEN 1 ELSE 0 END) +
                               (CASE WHEN v_fb_valid > 0 THEN 1 ELSE 0 END) +
                               (CASE WHEN v_prot_valid > 0 THEN 1 ELSE 0 END);

            v_att_avg := (w.attestations_summary->>'avg_score')::numeric;
            v_fb_avg := (w.on_chain_feedbacks_summary->>'avg_score')::numeric;
            v_prot_avg := (w.protocol_activity_summary->>'avg_score')::numeric;

            v_onchain_avg := (
                COALESCE(v_att_avg, 0) +
                COALESCE(v_fb_avg, 0) +
                COALESCE(v_prot_avg, 0)
            ) / NULLIF(
                (CASE WHEN v_att_avg IS NOT NULL THEN 1 ELSE 0 END) +
                (CASE WHEN v_fb_avg IS NOT NULL THEN 1 ELSE 0 END) +
                (CASE WHEN v_prot_avg IS NOT NULL THEN 1 ELSE 0 END), 0
            );

            IF v_onchain_count >= 2 THEN
                IF v_onchain_avg >= 90 THEN
                    v_on_chain_intermediate_score := 5.0;
                ELSIF v_onchain_avg >= 70 THEN
                    v_on_chain_intermediate_score := 4.0;
                ELSIF v_onchain_avg >= 50 THEN
                    v_on_chain_intermediate_score := 3.0;
                ELSIF v_onchain_avg >= 30 THEN
                    v_on_chain_intermediate_score := 2.5;
                ELSIF v_onchain_avg >= 10 THEN
                    v_on_chain_intermediate_score := 1.5;
                ELSE
                    v_on_chain_intermediate_score := 0;
                END IF;
            ELSE
                v_on_chain_intermediate_score := 0;
            END IF;

            v_on_chain_intermediate_reason := jsonb_build_object(
                'active_types', v_onchain_count,
                'avg_score', round(COALESCE(v_onchain_avg, 0), 2),
                'reason_eng', CASE
                    WHEN v_on_chain_intermediate_score = 5.0 THEN 'Outstanding on-chain activity across multiple channels with very high quality scores.'
                    WHEN v_on_chain_intermediate_score >= 4.0 THEN 'Strong on-chain activity with good quality and diversity.'
                    WHEN v_on_chain_intermediate_score >= 3.0 THEN 'Moderate on-chain activity with acceptable quality.'
                    ELSE 'Limited or low-quality on-chain activity, indicating room for operational improvement.'
                END,
                'reason_esp', CASE
                    WHEN v_on_chain_intermediate_score = 5.0 THEN 'Actividad on-chain sobresaliente en múltiples canales con puntuaciones de calidad muy altas.'
                    WHEN v_on_chain_intermediate_score >= 4.0 THEN 'Fuerte actividad on-chain con buena calidad y diversidad.'
                    WHEN v_on_chain_intermediate_score >= 3.0 THEN 'Actividad on-chain moderada con calidad aceptable.'
                    ELSE 'Actividad on-chain limitada o de baja calidad, indicando espacio para mejora operativa.'
                END
            );
        END;

        -- 3. Comments
        DECLARE
            v_comments_valid integer := 0;
            v_comments_revoke integer := 0;
        BEGIN
            v_comments_valid := COALESCE((w.comments_summary->>'valid_count')::int, 0);
            v_comments_revoke := COALESCE((w.comments_summary->>'revoke_count')::int, 0);

            IF v_comments_valid >= 1 AND v_comments_revoke = 0 THEN
                v_comment_score := 1.0;
                v_comment_reason := jsonb_build_object(
                    'comments_30d', v_comments_valid,
                    'reason_eng', 'Positive recent feedback received with no revokes, strengthening community trust and validation of the agent.',
                    'reason_esp', 'Feedback positivo reciente recibido sin revocaciones, fortaleciendo la confianza comunitaria y la validación del agente.'
                );
            ELSE
                v_comment_score := 0;
                v_comment_reason := jsonb_build_object(
                    'comments_30d', v_comments_valid,
                    'revoke', v_comments_revoke,
                    'reason_eng', 'No recent positive comments or presence of revokes, reducing social proof and perceived reliability.',
                    'reason_esp', 'Sin comentarios positivos recientes o presencia de revocaciones, reduciendo la prueba social y la confiabilidad percibida.'
                );
            END IF;
        END;

        v_block_intermediate := v_wallet_intermediate_score + v_on_chain_intermediate_score + v_comment_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================
        -- 1. Wallet Advanced
        DECLARE
            v_agent_age_days integer := 0;
            v_nonce_current numeric := 0;
            v_nonce_delta_yesterday numeric := 0;
        BEGIN
            v_nonce_current := COALESCE((w.wallet_tx_summary->>'nonce_current')::numeric, 0);
            v_nonce_delta_yesterday := COALESCE((w.wallet_tx_summary->>'nonce_delta_yesterday')::numeric, 0);

            IF w.agent_created_at IS NOT NULL THEN
                v_agent_age_days := EXTRACT(DAY FROM (CURRENT_DATE - w.agent_created_at))::int;
            END IF;

            IF v_agent_age_days = 0 THEN
                IF v_nonce_current >= 500 THEN
                    v_wallet_advanced_score := 1.5;
                    v_wallet_advanced_reason := jsonb_build_object(
                        'reason_eng', 'Very high immediate wallet activity on day of creation, indicating strong initial momentum.',
                        'reason_esp', 'Actividad inmediata muy alta en wallet el día de creación, indicando fuerte momentum inicial.'
                    );
                ELSE
                    v_wallet_advanced_score := 0;
                    v_wallet_advanced_reason := jsonb_build_object(
                        'reason_eng', 'Low immediate wallet activity on day of creation.',
                        'reason_esp', 'Baja actividad inmediata en wallet el día de creación.'
                    );
                END IF;
            ELSE
                IF v_nonce_delta_yesterday >= 500 THEN
                    v_wallet_advanced_score := 1.5;
                    v_wallet_advanced_reason := jsonb_build_object(
                        'reason_eng', 'Extremely high recent daily wallet activity, reflecting intense and sustained usage.',
                        'reason_esp', 'Actividad diaria reciente extremadamente alta en wallet, reflejando uso intenso y sostenido.'
                    );
                ELSE
                    v_wallet_advanced_score := 0;
                    v_wallet_advanced_reason := jsonb_build_object(
                        'reason_eng', 'Insufficient recent daily wallet activity to qualify as advanced.',
                        'reason_esp', 'Actividad diaria reciente insuficiente para calificar como avanzada.'
                    );
                END IF;
            END IF;
        END;

        -- 2. On-Chain Activity Advanced
        DECLARE
            v_onchain_count integer := 0;
            v_onchain_avg   numeric := 0;
            v_att_valid integer := 0;
            v_exec_valid integer := 0;
            v_fb_valid integer := 0;
            v_prot_valid integer := 0;
            v_att_avg numeric;
            v_fb_avg numeric;
            v_prot_avg numeric;
        BEGIN
            v_att_valid := COALESCE((w.attestations_summary->>'valid_count')::int, 0);
            v_exec_valid := COALESCE((w.on_chain_executions_summary->>'valid_count')::int, 0);
            v_fb_valid := COALESCE((w.on_chain_feedbacks_summary->>'valid_count')::int, 0);
            v_prot_valid := COALESCE((w.protocol_activity_summary->>'valid_count')::int, 0);

            v_onchain_count := (CASE WHEN v_att_valid > 0 THEN 1 ELSE 0 END) +
                               (CASE WHEN v_exec_valid > 0 THEN 1 ELSE 0 END) +
                               (CASE WHEN v_fb_valid > 0 THEN 1 ELSE 0 END) +
                               (CASE WHEN v_prot_valid > 0 THEN 1 ELSE 0 END);

            v_att_avg := (w.attestations_summary->>'avg_score')::numeric;
            v_fb_avg := (w.on_chain_feedbacks_summary->>'avg_score')::numeric;
            v_prot_avg := (w.protocol_activity_summary->>'avg_score')::numeric;

            v_onchain_avg := (
                COALESCE(v_att_avg, 0) +
                COALESCE(v_fb_avg, 0) +
                COALESCE(v_prot_avg, 0)
            ) / NULLIF(
                (CASE WHEN v_att_avg IS NOT NULL THEN 1 ELSE 0 END) +
                (CASE WHEN v_fb_avg IS NOT NULL THEN 1 ELSE 0 END) +
                (CASE WHEN v_prot_avg IS NOT NULL THEN 1 ELSE 0 END), 0
            );

            IF v_onchain_count >= 3 THEN
                IF v_onchain_avg >= 80 THEN
                    v_on_chain_advanced_score := 3.0;
                ELSIF v_onchain_avg >= 70 THEN
                    v_on_chain_advanced_score := 2.0;
                ELSIF v_onchain_avg >= 60 THEN
                    v_on_chain_advanced_score := 1.0;
                ELSE
                    v_on_chain_advanced_score := 0;
                END IF;
            ELSE
                v_on_chain_advanced_score := 0;
            END IF;

            v_on_chain_advanced_reason := jsonb_build_object(
                'active_types', v_onchain_count,
                'avg_score', round(COALESCE(v_onchain_avg, 0), 2),
                'reason_eng', CASE
                    WHEN v_on_chain_advanced_score = 3.0 THEN 'Outstanding advanced on-chain activity across 3+ channels with very high quality scores.'
                    WHEN v_on_chain_advanced_score = 2.0 THEN 'Strong advanced on-chain activity with good quality and diversity.'
                    WHEN v_on_chain_advanced_score = 1.0 THEN 'Moderate advanced on-chain activity with acceptable quality.'
                    ELSE 'Limited advanced on-chain activity, indicating room for operational growth.'
                END,
                'reason_esp', CASE
                    WHEN v_on_chain_advanced_score = 3.0 THEN 'Actividad on-chain avanzada sobresaliente en 3+ canales con puntuaciones de calidad muy altas.'
                    WHEN v_on_chain_advanced_score = 2.0 THEN 'Fuerte actividad on-chain avanzada con buena calidad y diversidad.'
                    WHEN v_on_chain_advanced_score = 1.0 THEN 'Actividad on-chain avanzada moderada con calidad aceptable.'
                    ELSE 'Actividad on-chain avanzada limitada, indicando espacio para crecimiento operativo.'
                END
            );
        END;

        -- 3. Protocol Activity with Payments
        DECLARE
            v_prot_valid integer := 0;
            v_prot_payments integer := 0;
        BEGIN
            v_prot_valid := COALESCE((w.protocol_activity_summary->>'valid_count')::int, 0);
            v_prot_payments := COALESCE((w.protocol_activity_summary->>'valid_payment_count')::int, 0);

            IF v_prot_valid >= 2 AND v_prot_payments >= 1 THEN
                v_on_chain_paid_score := 1.5;
                v_on_chain_paid_reason := jsonb_build_object(
                    'protocol_30d', v_prot_valid,
                    'with_payments', v_prot_payments,
                    'reason_eng', 'Strong paid protocol activity detected, demonstrating real economic usage and business value generation.',
                    'reason_esp', 'Fuerte actividad pagada en protocolos detectada, demostrando uso económico real y generación de valor de negocio.'
                );
            ELSE
                v_on_chain_paid_score := 0;
                v_on_chain_paid_reason := jsonb_build_object(
                    'protocol_30d', v_prot_valid,
                    'with_payments', v_prot_payments,
                    'reason_eng', 'Insufficient paid protocol activity, limiting demonstrated economic engagement.',
                    'reason_esp', 'Actividad pagada en protocolos insuficiente, limitando el engagement económico demostrado.'
                );
            END IF;
        END;

        v_block_advanced := v_wallet_advanced_score + v_on_chain_advanced_score + v_on_chain_paid_score;

        -- ====================== PENALIZACIÓN GLOBAL ======================
        DECLARE
            v_comments_revoke integer := 0;
            v_exec_revoke integer := 0;
            v_fb_revoke integer := 0;
            v_prot_revoke integer := 0;
            v_att_revoke integer := 0;
        BEGIN
            v_comments_revoke := COALESCE((w.comments_summary->>'revoke_count')::int, 0);
            v_exec_revoke := COALESCE((w.on_chain_executions_summary->>'revoke_count')::int, 0);
            v_fb_revoke := COALESCE((w.on_chain_feedbacks_summary->>'revoke_count')::int, 0);
            v_prot_revoke := COALESCE((w.protocol_activity_summary->>'revoke_count')::int, 0);
            v_att_revoke := COALESCE((w.attestations_summary->>'revoke_count')::int, 0);

            IF v_comments_revoke > 0 OR v_exec_revoke > 0 OR v_fb_revoke > 0 OR v_prot_revoke > 0 OR v_att_revoke > 0 THEN
                v_penalty_score := -1.5;
                v_penalty_reason := jsonb_build_object(
                    'reason_eng', 'Recent revokes or warnings detected, negatively impacting perceived reliability and trust.',
                    'reason_esp', 'Revocaciones o advertencias recientes detectadas, impactando negativamente la confiabilidad y confianza percibida.'
                );
            ELSE
                v_penalty_score := 0;
                v_penalty_reason := jsonb_build_object(
                    'reason_eng', 'No recent revokes or warnings, supporting clean and trustworthy activity profile.',
                    'reason_esp', 'Sin revocaciones ni advertencias recientes, apoyando un perfil de actividad limpio y confiable.'
                );
            END IF;
        END;

        -- ====================== TOTAL ======================
        v_pillar_score := v_block_basic + v_block_intermediate + v_block_advanced + v_penalty_score;

        -- ====================== ANÁLISIS NARRATIVO DEL PILAR USAGE ======================
        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng',
                CASE
                    WHEN v_pillar_score >= 22.0 THEN 'The agent demonstrates outstanding usage maturity and strong operational engagement.'
                    WHEN v_pillar_score >= 18.5 THEN 'The agent shows solid and consistent usage patterns with good operational health.'
                    WHEN v_pillar_score >= 15.0 THEN 'The agent has acceptable usage levels but presents opportunities for stronger engagement.'
                    WHEN v_pillar_score >= 11.0 THEN 'The agent has weak to moderate usage. Activity appears limited or inconsistent.'
                    ELSE 'The agent exhibits very low usage. Significant concerns regarding operational activity and engagement.'
                END,
            'overall_assessment_esp',
                CASE
                    WHEN v_pillar_score >= 22.0 THEN 'El agente demuestra una madurez de uso sobresaliente y fuerte engagement operativo.'
                    WHEN v_pillar_score >= 18.5 THEN 'El agente muestra patrones de uso sólidos y consistentes con buena salud operativa.'
                    WHEN v_pillar_score >= 15.0 THEN 'El agente tiene niveles de uso aceptables pero presenta oportunidades para mayor engagement.'
                    WHEN v_pillar_score >= 11.0 THEN 'El agente tiene uso débil a moderado. La actividad parece limitada o inconsistente.'
                    ELSE 'El agente presenta un uso muy bajo. Existen preocupaciones importantes sobre su actividad operativa y engagement.'
                END,
            'business_interpretation_eng',
                'This Usage pillar measures the agent''s real operational activity, consistency, and value generation through on-chain interactions. ' ||
                CASE
                    WHEN v_penalty_score < 0 THEN 'Recent revokes are damaging trust and perceived reliability. '
                    WHEN v_basic_activity_score = 0 THEN 'The agent shows concerningly low recent activity. '
                    WHEN v_on_chain_paid_score = 0 THEN 'Lack of paid protocol activity limits demonstrated economic value. '
                    WHEN v_on_chain_intermediate_score < 3.0 THEN 'Limited diversity in on-chain actions reduces operational robustness. '
                    ELSE 'The agent maintains a healthy operational rhythm. '
                END ||
                'Overall, the current level suggests ' ||
                CASE
                    WHEN v_pillar_score < 11.0 THEN 'high risk of inactivity or low adoption.'
                    WHEN v_pillar_score < 15.0 THEN 'moderate risk with limited momentum.'
                    WHEN v_pillar_score < 18.5 THEN 'acceptable but not standout engagement.'
                    ELSE 'strong operational presence and healthy usage.'
                END,
            'business_interpretation_esp',
                'Este pilar Usage mide la actividad operativa real del agente, su consistencia y generación de valor mediante interacciones on-chain. ' ||
                CASE
                    WHEN v_penalty_score < 0 THEN 'Las revocaciones recientes están dañando la confianza y la confiabilidad percibida. '
                    WHEN v_basic_activity_score = 0 THEN 'El agente muestra una actividad reciente preocupantemente baja. '
                    WHEN v_on_chain_paid_score = 0 THEN 'La falta de actividad pagada en protocolos limita el valor económico demostrado. '
                    WHEN v_on_chain_intermediate_score < 3.0 THEN 'Diversidad limitada en acciones on-chain reduce la robustez operativa. '
                    ELSE 'El agente mantiene un ritmo operativo saludable. '
                END ||
                'En general, el nivel actual sugiere ' ||
                CASE
                    WHEN v_pillar_score < 11.0 THEN 'alto riesgo de inactividad o baja adopción.'
                    WHEN v_pillar_score < 15.0 THEN 'riesgo moderado con momentum limitado.'
                    WHEN v_pillar_score < 18.5 THEN 'engagement aceptable pero no destacado.'
                    ELSE 'fuerte presencia operativa y uso saludable.'
                END,
            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_on_chain_paid_score = 1.5 THEN 'Demonstrated paid protocol usage generating real economic value' END),
                        (CASE WHEN v_on_chain_advanced_score >= 2.0 THEN 'Diverse and high-quality on-chain activity across multiple types' END),
                        (CASE WHEN v_basic_activity_score = 10.0 THEN 'Consistent and healthy operational rhythm' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_on_chain_paid_score = 1.5 THEN 'Uso pagado en protocolos que genera valor económico real' END),
                        (CASE WHEN v_on_chain_advanced_score >= 2.0 THEN 'Actividad on-chain diversa y de alta calidad en múltiples tipos' END),
                        (CASE WHEN v_basic_activity_score = 10.0 THEN 'Ritmo operativo consistente y saludable' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_penalty_score < 0 THEN 'Recent revokes detected - negatively impacting trust' END),
                        (CASE WHEN v_basic_activity_score = 0 THEN 'Very low or no recent activity detected' END),
                        (CASE WHEN v_on_chain_paid_score = 0 THEN 'No paid protocol activity detected' END),
                        (CASE WHEN v_on_chain_intermediate_score < 2.0 THEN 'Limited on-chain diversity and engagement' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_penalty_score < 0 THEN 'Revocaciones recientes detectadas - impactando negativamente la confianza' END),
                        (CASE WHEN v_basic_activity_score = 0 THEN 'Actividad reciente muy baja o nula' END),
                        (CASE WHEN v_on_chain_paid_score = 0 THEN 'No se detecta actividad pagada en protocolos' END),
                        (CASE WHEN v_on_chain_intermediate_score < 2.0 THEN 'Diversidad y engagement on-chain limitados' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'recommendation_eng',
                CASE
                    WHEN v_penalty_score < 0 THEN 'Priority: Eliminate all recent revokes and warnings to restore trust and operational credibility.'
                    WHEN v_basic_activity_score = 0 THEN 'Priority: Generate consistent on-chain activity immediately to demonstrate real operational engagement.'
                    WHEN v_on_chain_paid_score = 0 THEN 'Focus on implementing paid protocol interactions to prove real economic usage and business value.'
                    WHEN v_on_chain_intermediate_score < 2.0 THEN 'Increase diversity of on-chain actions (attestations, executions, feedbacks, protocols) to strengthen operational profile.'
                    ELSE 'Continue building momentum by maintaining consistent activity and expanding paid protocol usage.'
                END,
            'recommendation_esp',
                CASE
                    WHEN v_penalty_score < 0 THEN 'Prioridad: Eliminar todas las revocaciones y advertencias recientes para restaurar la confianza y credibilidad operativa.'
                    WHEN v_basic_activity_score = 0 THEN 'Prioridad: Generar actividad on-chain consistente de inmediato para demostrar engagement operativo real.'
                    WHEN v_on_chain_paid_score = 0 THEN 'Enfocarse en implementar interacciones pagadas en protocolos para demostrar uso económico real y valor de negocio.'
                    WHEN v_on_chain_intermediate_score < 2.0 THEN 'Aumentar la diversidad de acciones on-chain (attestations, ejecuciones, feedbacks, protocolos) para fortalecer el perfil operativo.'
                    ELSE 'Continuar construyendo momentum manteniendo actividad consistente y expandiendo el uso de protocolos pagados.'
                END,
            'last_calculated', now()
        );

        -- ====================== UPSERT ======================
        INSERT INTO index_humi.pillar_usage (
            agent_id,
            basic_activity_score, basic_activity_reason,
            wallet_intermediate_activity_score, wallet_intermediate_activity_reason,
            on_chain_intermediate_activity_score, on_chain_intermediate_activity_reason,
            comment_score, comment_reason,
            wallet_advanced_activity_score, wallet_advanced_activity_reason,
            on_chain_advanced_activity_score, on_chain_advanced_activity_reason,
            on_chain_activity_paid_score, on_chain_activity_paid_reason,
            penalty_score, penalty_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary,
            calculated_at, version, change_reason, calculated_by
        )
        VALUES (
            w.agent_id,
            v_basic_activity_score, v_basic_activity_reason,
            v_wallet_intermediate_score, v_wallet_intermediate_reason,
            v_on_chain_intermediate_score, v_on_chain_intermediate_reason,
            v_comment_score, v_comment_reason,
            v_wallet_advanced_score, v_wallet_advanced_reason,
            v_on_chain_advanced_score, v_on_chain_advanced_reason,
            v_on_chain_paid_score, v_on_chain_paid_reason,
            v_penalty_score, v_penalty_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_pillar_score, v_pillar_summary,
            now(), v_new_version,
            'recalculation - agent_summary MVs + pillar_usage', 'system'
        )
        ON CONFLICT (agent_id) DO UPDATE SET
            basic_activity_score = EXCLUDED.basic_activity_score,
            basic_activity_reason = EXCLUDED.basic_activity_reason,
            wallet_intermediate_activity_score = EXCLUDED.wallet_intermediate_activity_score,
            wallet_intermediate_activity_reason = EXCLUDED.wallet_intermediate_activity_reason,
            on_chain_intermediate_activity_score = EXCLUDED.on_chain_intermediate_activity_score,
            on_chain_intermediate_activity_reason = EXCLUDED.on_chain_intermediate_activity_reason,
            comment_score = EXCLUDED.comment_score,
            comment_reason = EXCLUDED.comment_reason,
            wallet_advanced_activity_score = EXCLUDED.wallet_advanced_activity_score,
            wallet_advanced_activity_reason = EXCLUDED.wallet_advanced_activity_reason,
            on_chain_advanced_activity_score = EXCLUDED.on_chain_advanced_activity_score,
            on_chain_advanced_activity_reason = EXCLUDED.on_chain_advanced_activity_reason,
            on_chain_activity_paid_score = EXCLUDED.on_chain_activity_paid_score,
            on_chain_activity_paid_reason = EXCLUDED.on_chain_activity_paid_reason,
            penalty_score = EXCLUDED.penalty_score,
            penalty_reason = EXCLUDED.penalty_reason,
            block_basic_score = EXCLUDED.block_basic_score,
            block_intermediate_score = EXCLUDED.block_intermediate_score,
            block_advanced_score = EXCLUDED.block_advanced_score,
            pillar_score = EXCLUDED.pillar_score,
            pillar_summary = EXCLUDED.pillar_summary,
            calculated_at = EXCLUDED.calculated_at,
            version = EXCLUDED.version,
            change_reason = EXCLUDED.change_reason,
            calculated_by = EXCLUDED.calculated_by;

    END LOOP;

    RETURN v_processed;
END;
$$;
