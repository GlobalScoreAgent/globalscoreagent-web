-- Optimizado: sin ::DATE en filtros de updated_at.
-- Test: EXPLAIN ANALYZE SELECT index_humi.agent_measure_populate_data(10);

CREATE OR REPLACE FUNCTION index_humi.agent_measure_populate_data(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processed_count integer;
BEGIN
    WITH target_agents AS (
        SELECT DISTINCT ON (a.id)
            a.id                       AS agent_id,
            a.has_duplicates,
            a.duplicate_information,
            a.metadata_richness_score,
            a.metadata_richness_information,
            r.id                       AS registration_id
        FROM erc_8004.agents a
        LEFT JOIN index_humi.agent_measures am ON a.id = am.agent_id
        LEFT JOIN erc_8004.registrations r     ON a.id = r.agent_id
        WHERE am.agent_id IS NULL 
           OR am.updated_at < CURRENT_DATE::timestamptz
        ORDER BY a.id, am.updated_at ASC NULLS FIRST
        LIMIT p_limit
    )
    INSERT INTO index_humi.agent_measures (
        source_id,
        agent_id,
        has_external_analysis_identity,
        external_analysis_identity_details,
        gsa_analysis_duplication,
        gsa_duplicate_analysis_information,
        gsa_metadata_richness_score,
        gsa_metadata_richness_information,
        gsa_wallet_quality_information,
        has_external_analysis_audit,
        external_analysis_audit_information,
        has_external_analysis_protocol_activity,
        external_analysis_protocol_activity_information,
        created_at,
        updated_at
    )
    SELECT 
        1 AS source_id,
        t.agent_id,
        EXISTS (
            SELECT 1
            FROM erc_8004.agent_analysis_identity ai
            WHERE ai.agent_id = t.agent_id
              AND ai.is_revoke = false
        ),
        (
            SELECT jsonb_agg(identity_item)
            FROM (
                SELECT DISTINCT ON (entity_id)
                    jsonb_build_object(
                        'entity',                  fe.entity_name,
                        'soul_prompt_complexity',  ai.soul_prompt_complexity,
                        'total_frags',             ai.total_frags,
                        'accepted_frags',          ai.accepted_frags,
                        'identity_score',          ai.identity_score,
                        'identity_stage',          ai.identity_stage,
                        'updated_at',              ai.updated_at
                    ) AS identity_item
                FROM erc_8004.agent_analysis_identity ai
                JOIN erc_8004.agent_feedback_entities fe ON ai.entity_id = fe.id
                WHERE ai.agent_id = t.agent_id
                  AND ai.is_revoke = false
                ORDER BY entity_id, ai.updated_at DESC
            ) sub
        ),
        coalesce(t.has_duplicates, false),
        coalesce(t.duplicate_information, '[]'::jsonb),
        coalesce(t.metadata_richness_score, 0),
        coalesce(t.metadata_richness_information, '{}'::jsonb),
        (
            SELECT jsonb_build_object(
                'nonce_current',           rtx.nonce_current,
                'nonce_delta_7days',       rtx.nonce_delta_7days,
                'nonce_delta_15days',      rtx.nonce_delta_15days,
                'nonce_delta_1month',      rtx.nonce_delta_1month,
                'nonce_delta_2month',      rtx.nonce_delta_2month,
                'nonce_delta_3month',      rtx.nonce_delta_3month,
                'nonce_delta_6month',      rtx.nonce_delta_6month,
                'nonce_delta_9month',      rtx.nonce_delta_9month,
                'nonce_delta_12month',     rtx.nonce_delta_12month,
                'balance_current',         rtx.balance_current,
                'balance_delta_7days',     rtx.balance_delta_7days,
                'balance_delta_15days',    rtx.balance_delta_15days,
                'balance_delta_1month',    rtx.balance_delta_1month,
                'balance_delta_2month',    rtx.balance_delta_2month,
                'balance_delta_3month',    rtx.balance_delta_3month,
                'balance_delta_6month',    rtx.balance_delta_6month,
                'balance_delta_9month',    rtx.balance_delta_9month,
                'balance_delta_12month',   rtx.balance_delta_12month,
                'balance_delta',           rtx.balance_delta,
                'nonce_delta',             rtx.nonce_delta
            )
            FROM erc_8004.registration_tx rtx
            WHERE rtx.registration_id = t.registration_id
        ),
        EXISTS (
            SELECT 1
            FROM erc_8004.agent_analysis_external_audit aea
            WHERE aea.agent_id = t.agent_id
              AND (aea.is_revoke IS FALSE OR aea.is_revoke IS NULL)
        ),
        (
            SELECT jsonb_agg(audit_item)
            FROM (
                SELECT DISTINCT ON (entity_id)
                    jsonb_build_object(
                        'entity',              fe.entity_name,
                        'source_result',       aea.source_result,
                        'source_result_breakdown', aea.source_result_breakdown,
                        'source_warnings',     aea.source_warnings,
                        'external_audit_score', aea.external_audit_score
                    ) AS audit_item
                FROM erc_8004.agent_analysis_external_audit aea
                JOIN erc_8004.agent_feedback_entities fe ON aea.entity_id = fe.id
                WHERE aea.agent_id = t.agent_id
                  AND (aea.is_revoke IS FALSE OR aea.is_revoke IS NULL)
                ORDER BY entity_id, aea.updated_at DESC
            ) sub
        ),
        EXISTS (
            SELECT 1
            FROM erc_8004.agent_analysis_protocol_activity apa
            JOIN erc_8004.agent_feedback_entities fe ON apa.entity_id = fe.id
            WHERE apa.agent_id = t.agent_id
              AND (apa.is_revoke IS FALSE OR apa.is_revoke IS NULL)
              AND fe.entity_type = 'protocol_activity'
              AND fe.is_activity = false
        ),
        (
            SELECT jsonb_agg(activity_item)
            FROM (
                SELECT jsonb_build_object(
                    'entity',                  fe.entity_name,
                    'activity_score',          apa.protocol_activity_score,
                    'activity_details',        apa.activity_details,
                    'has_payment',             apa.has_payment,
                    'updated_at',              apa.updated_at
                ) AS activity_item
                FROM erc_8004.agent_analysis_protocol_activity apa
                JOIN erc_8004.agent_feedback_entities fe ON apa.entity_id = fe.id
                WHERE apa.agent_id = t.agent_id
                  AND (apa.is_revoke IS FALSE OR apa.is_revoke IS NULL)
                  AND fe.entity_type = 'protocol_activity'
                  AND fe.is_activity = false
            ) sub
        ),
        now(),
        now()
    FROM target_agents t
    ON CONFLICT (agent_id) DO UPDATE SET
        has_external_analysis_identity          = EXCLUDED.has_external_analysis_identity,
        external_analysis_identity_details      = EXCLUDED.external_analysis_identity_details,
        gsa_analysis_duplication                = EXCLUDED.gsa_analysis_duplication,
        gsa_duplicate_analysis_information      = EXCLUDED.gsa_duplicate_analysis_information,
        gsa_metadata_richness_score             = EXCLUDED.gsa_metadata_richness_score,
        gsa_metadata_richness_information       = EXCLUDED.gsa_metadata_richness_information,
        gsa_wallet_quality_information          = EXCLUDED.gsa_wallet_quality_information,
        has_external_analysis_audit             = EXCLUDED.has_external_analysis_audit,
        external_analysis_audit_information     = EXCLUDED.external_analysis_audit_information,
        has_external_analysis_protocol_activity = EXCLUDED.has_external_analysis_protocol_activity,
        external_analysis_protocol_activity_information = EXCLUDED.external_analysis_protocol_activity_information,
        updated_at                              = now();

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    RETURN jsonb_build_object('status', 'success', 'records_processed', v_processed_count);
END;
$$;

