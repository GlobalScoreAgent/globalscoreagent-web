-- Optimizado: JOINs en vez de IN (SELECT ...) y sin ::DATE en updated_at.
-- Test: EXPLAIN ANALYZE SELECT index_humi.agent_usage_populate_data(10);

CREATE OR REPLACE FUNCTION index_humi.agent_usage_populate_data(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processed_count integer;
    v_source_id constant bigint := 1;
BEGIN
    WITH target_agents AS (
        SELECT a.id AS agent_id
        FROM erc_8004.agents a
        LEFT JOIN index_humi.agent_usage au ON a.id = au.agent_id
        WHERE au.agent_id IS NULL
           OR au.updated_at < CURRENT_DATE::timestamptz
        LIMIT p_limit
    ),
    tx_metrics AS (
        SELECT 
            r.agent_id,
            r.on_chain_created_at,
            SUM(rtx.nonce_current)                                        AS nonce_current,
            SUM(rtx.nonce_delta)                                          AS nonce_delta_yesterday,
            SUM(rtx.nonce_current - rtx.nonce_delta_15days)               AS nonce_delta_15_days,
            SUM(rtx.nonce_current - rtx.nonce_delta_1month)               AS nonce_delta_30_days,
            SUM(rtx.balance_delta)                                        AS balance_delta_yesterday,
            SUM(rtx.balance_current - rtx.balance_delta_15days)           AS balance_delta_15_days,
            SUM(rtx.balance_current - rtx.balance_delta_1month)           AS balance_delta_30_days
        FROM erc_8004.registration_tx rtx
        JOIN erc_8004.registrations r ON rtx.registration_id = r.id
        JOIN target_agents ta        ON r.agent_id = ta.agent_id
        WHERE r.is_registration_active = true
        GROUP BY r.agent_id, r.on_chain_created_at
    ),
    attestation_metrics AS (
        SELECT 
            aa.agent_id,
            COUNT(*) FILTER (WHERE aa.is_spam = false AND aa.is_revoke = false) AS attestations_delta_30_days,
            COUNT(*) FILTER (WHERE aa.is_revoke = true)                         AS attestations_delta_30_days_revoke,
            COUNT(*) FILTER (WHERE aa.is_spam = true)                           AS attestations_delta_30_days_spam,
            COALESCE(AVG(aa.attestation_score) FILTER (
                WHERE aa.is_spam = false AND aa.is_revoke = false
            ), 0)                                                                AS attestations_avg
        FROM erc_8004.agent_analysis_attestation aa
        JOIN target_agents ta ON aa.agent_id = ta.agent_id
        WHERE aa.created_at >= (now() - INTERVAL '30 days')
        GROUP BY aa.agent_id
    ),
    comments_agg AS (
        SELECT 
            c.agent_id,
            COUNT(*) FILTER (WHERE c.is_revoke = false) AS comm_30,
            COUNT(*) FILTER (WHERE c.is_revoke = true)  AS comm_30_rev
        FROM erc_8004.agent_analysis_comments c
        JOIN target_agents ta ON c.agent_id = ta.agent_id
        WHERE c.on_chain_created_at >= (now() - INTERVAL '30 days')
        GROUP BY c.agent_id
    ),
    exec_agg AS (
        SELECT 
            e.agent_id,
            COUNT(*) FILTER (WHERE e.is_revoke = false OR e.is_revoke IS NULL) AS exec_30,
            COUNT(*) FILTER (WHERE e.is_revoke = true)                         AS exec_30_rev
        FROM erc_8004.agent_analysis_on_chain_executions e
        JOIN target_agents ta ON e.agent_id = ta.agent_id
        WHERE e.created_at >= (now() - INTERVAL '30 days')
        GROUP BY e.agent_id
    ),
    comment_exec_metrics AS (
        SELECT 
            ta.agent_id,
            COALESCE(ca.comm_30, 0)     AS comm_30,
            COALESCE(ca.comm_30_rev, 0) AS comm_30_rev,
            COALESCE(ea.exec_30, 0)     AS exec_30,
            COALESCE(ea.exec_30_rev, 0) AS exec_30_rev
        FROM target_agents ta
        LEFT JOIN comments_agg ca ON ta.agent_id = ca.agent_id
        LEFT JOIN exec_agg ea     ON ta.agent_id = ea.agent_id
    ),
    feedback_metrics AS (
        SELECT 
            f.agent_id,
            COUNT(*) FILTER (WHERE f.is_revoke = false OR f.is_revoke IS NULL) AS feedback_delta_30,
            COALESCE(AVG(f.feedback_score) FILTER (
                WHERE (f.is_revoke = false OR f.is_revoke IS NULL)
                  AND NOT (f.tags::jsonb ?| ARRAY['revenue', 'revenues'])
            ), 0) AS feedback_avg,
            COALESCE(SUM(f.feedback_score) FILTER (
                WHERE (f.is_revoke = false OR f.is_revoke IS NULL)
                  AND (f.tags::jsonb ?| ARRAY['revenue', 'revenues'])
            ), 0) AS feedback_revenue,
            COUNT(*) FILTER (WHERE f.is_revoke = true) AS feedback_revoke_30
        FROM erc_8004.agent_analysis_on_chain_feedbacks f
        JOIN target_agents ta ON f.agent_id = ta.agent_id
        WHERE f.created_at >= (now() - INTERVAL '30 days')
        GROUP BY f.agent_id
    ),
    protocol_metrics AS (
        SELECT 
            pa.agent_id,
            COUNT(*) FILTER (WHERE pa.is_revoke = false OR pa.is_revoke IS NULL) AS prot_delta_30,
            COALESCE(AVG(pa.protocol_activity_score) FILTER (
                WHERE pa.is_revoke = false OR pa.is_revoke IS NULL
            ), 0) AS prot_avg,
            COUNT(*) FILTER (
                WHERE (pa.is_revoke = false OR pa.is_revoke IS NULL)
                  AND pa.has_payment = true
            ) AS prot_payments,
            COUNT(*) FILTER (WHERE pa.is_revoke = true) AS prot_revoke_30
        FROM erc_8004.agent_analysis_protocol_activity pa
        JOIN erc_8004.agent_feedback_entities fe ON pa.entity_id = fe.id
        JOIN target_agents ta ON pa.agent_id = ta.agent_id
        WHERE pa.activity_at >= (now() - INTERVAL '30 days')
          AND fe.entity_type = 'protocol_activity'
          AND fe.is_activity = true
        GROUP BY pa.agent_id
    )
    INSERT INTO index_humi.agent_usage (
        agent_id, agent_created_at, source_id,
        nonce_current, nonce_delta_yesterday, nonce_delta_15_days, nonce_delta_30_days,
        balance_delta_yesterday, balance_delta_15_days, balance_delta_30_days,
        attestations_delta_30_days, attestations_delta_30_days_revoke, attestations_delta_30_days_spam, attestations_delta_30_days_score_avg,
        comments_delta_30_days, comments_delta_30_days_revoke,
        on_chain_executions_delta_30_days, on_chain_executions_delta_30_days_revoke,
        on_chain_feedbacks_delta_30_day, on_chain_feedbacks_30_days_score_avg,
        on_chain_feedbacks_30_days_revenue, on_chain_feedback_delta_30_days_revoke,
        protocol_activity_delta_30_days, protocol_activity_delta_30_days_score_avg, protocol_activity_delta_30_days_with_payments, protocol_activity_delta_30_days_revoke,
        created_at, updated_at
    )
    SELECT 
        ta.agent_id,
        tx.on_chain_created_at,
        v_source_id,
        COALESCE(tx.nonce_current, 0),
        COALESCE(tx.nonce_delta_yesterday, 0),
        COALESCE(tx.nonce_delta_15_days, 0),
        COALESCE(tx.nonce_delta_30_days, 0),
        COALESCE(tx.balance_delta_yesterday, 0),
        COALESCE(tx.balance_delta_15_days, 0),
        COALESCE(tx.balance_delta_30_days, 0),
        COALESCE(att.attestations_delta_30_days, 0),
        COALESCE(att.attestations_delta_30_days_revoke, 0),
        COALESCE(att.attestations_delta_30_days_spam, 0),
        COALESCE(att.attestations_avg, 0),
        COALESCE(ce.comm_30, 0),
        COALESCE(ce.comm_30_rev, 0),
        COALESCE(ce.exec_30, 0),
        COALESCE(ce.exec_30_rev, 0),
        COALESCE(f.feedback_delta_30, 0),
        COALESCE(f.feedback_avg, 0),
        COALESCE(f.feedback_revenue, 0),
        COALESCE(f.feedback_revoke_30, 0),
        COALESCE(p.prot_delta_30, 0),
        COALESCE(p.prot_avg, 0),
        COALESCE(p.prot_payments, 0),
        COALESCE(p.prot_revoke_30, 0),
        now(),
        now()
    FROM target_agents ta
    LEFT JOIN tx_metrics        tx  ON ta.agent_id = tx.agent_id
    LEFT JOIN attestation_metrics att ON ta.agent_id = att.agent_id
    LEFT JOIN comment_exec_metrics ce ON ta.agent_id = ce.agent_id
    LEFT JOIN feedback_metrics   f   ON ta.agent_id = f.agent_id
    LEFT JOIN protocol_metrics   p   ON ta.agent_id = p.agent_id
    ON CONFLICT (agent_id) DO UPDATE SET
        source_id                                 = EXCLUDED.source_id,
        agent_created_at                          = EXCLUDED.agent_created_at,
        nonce_current                             = EXCLUDED.nonce_current,
        nonce_delta_yesterday                     = EXCLUDED.nonce_delta_yesterday,
        nonce_delta_15_days                       = EXCLUDED.nonce_delta_15_days,
        nonce_delta_30_days                       = EXCLUDED.nonce_delta_30_days,
        balance_delta_yesterday                   = EXCLUDED.balance_delta_yesterday,
        balance_delta_15_days                     = EXCLUDED.balance_delta_15_days,
        balance_delta_30_days                     = EXCLUDED.balance_delta_30_days,
        attestations_delta_30_days                = EXCLUDED.attestations_delta_30_days,
        attestations_delta_30_days_revoke         = EXCLUDED.attestations_delta_30_days_revoke,
        attestations_delta_30_days_spam           = EXCLUDED.attestations_delta_30_days_spam,
        attestations_delta_30_days_score_avg      = EXCLUDED.attestations_delta_30_days_score_avg,
        comments_delta_30_days                    = EXCLUDED.comments_delta_30_days,
        comments_delta_30_days_revoke             = EXCLUDED.comments_delta_30_days_revoke,
        on_chain_executions_delta_30_days         = EXCLUDED.on_chain_executions_delta_30_days,
        on_chain_executions_delta_30_days_revoke  = EXCLUDED.on_chain_executions_delta_30_days_revoke,
        on_chain_feedbacks_delta_30_day           = EXCLUDED.on_chain_feedbacks_delta_30_day,
        on_chain_feedbacks_30_days_score_avg      = EXCLUDED.on_chain_feedbacks_30_days_score_avg,
        on_chain_feedbacks_30_days_revenue        = EXCLUDED.on_chain_feedbacks_30_days_revenue,
        on_chain_feedback_delta_30_days_revoke    = EXCLUDED.on_chain_feedback_delta_30_days_revoke,
        protocol_activity_delta_30_days           = EXCLUDED.protocol_activity_delta_30_days,
        protocol_activity_delta_30_days_score_avg = EXCLUDED.protocol_activity_delta_30_days_score_avg,
        protocol_activity_delta_30_days_with_payments = EXCLUDED.protocol_activity_delta_30_days_with_payments,
        protocol_activity_delta_30_days_revoke    = EXCLUDED.protocol_activity_delta_30_days_revoke,
        updated_at                                = now();

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    RETURN jsonb_build_object('status', 'success', 'records_processed', v_processed_count);
END;
$$;

