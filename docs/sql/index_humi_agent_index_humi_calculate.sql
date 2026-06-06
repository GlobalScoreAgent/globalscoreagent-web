-- Optimizado: sin ::DATE; final_score en CTE intermedia; INSERT tracking antes de UPDATE.
-- Test: EXPLAIN ANALYZE SELECT index_humi.agent_index_humi_calculate(10);

CREATE OR REPLACE FUNCTION index_humi.agent_index_humi_calculate(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO index_humi, erc_8004, public
AS $$
DECLARE
    v_processed integer := 0;
BEGIN
    CREATE TEMP TABLE temp_humi_calc AS
    WITH agents_to_process AS (
        SELECT a.id
        FROM erc_8004.agents a
        LEFT JOIN index_humi.index_humi_agent iha ON a.id = iha.agent_id
        WHERE iha.agent_id IS NULL OR iha.calculated_at < CURRENT_DATE::timestamptz
        ORDER BY iha.calculated_at ASC NULLS FIRST
        LIMIT p_limit
    ),
    pillars AS (
        SELECT
            atp.id AS agent_id,
            ph.pillar_score AS hist_score,
            jsonb_build_object(
                'block_basic_score', ph.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Owner Wallet Active', 'points', ph.owner_wallet_active_score, 'reason', ph.owner_wallet_active_reason),
                    jsonb_build_object('name', 'Ownership Stability', 'points', ph.agent_owner_stability_score, 'reason', ph.agent_owner_stability_reason)
                ),
                'block_intermediate_score', ph.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Owner Advanced Antiquity', 'points', ph.owner_antiquity_score, 'reason', ph.owner_antiquity_reason),
                    jsonb_build_object('name', 'Active Agents in Portfolio', 'points', ph.portafolio_agent_active_score, 'reason', ph.portafolio_agent_active_reason),
                    jsonb_build_object('name', 'Minimum External Audit', 'points', ph.portafolio_basic_external_audits_score, 'reason', ph.portafolio_basic_external_audits_reason),
                    jsonb_build_object('name', 'No External Warnings', 'points', ph.portafolio_warnings_score, 'reason', ph.portafolio_warnings_reason)
                ),
                'block_advanced_score', ph.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'Good Metadata + Services', 'points', ph.portafolio_quality_agent_score, 'reason', ph.portafolio_quality_agent_reason),
                    jsonb_build_object('name', 'Advanced External Audits', 'points', ph.portafolio_advanced_external_audits_score, 'reason', ph.portafolio_advanced_external_audits_reason),
                    jsonb_build_object('name', 'General Portfolio Activity', 'points', ph.portafolio_general_activity_score, 'reason', ph.portafolio_general_activity_reason)
                ),
                'summary', ph.pillar_summary
            ) AS hist_reason,
            pi.pillar_score AS info_score,
            jsonb_build_object(
                'block_basic_score', pi.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Name', 'points', pi.name_score, 'reason', pi.name_reason),
                    jsonb_build_object('name', 'Description', 'points', pi.description_score, 'reason', pi.description_reason),
                    jsonb_build_object('name', 'Image', 'points', pi.image_score, 'reason', pi.image_reason),
                    jsonb_build_object('name', 'Basic Sources', 'points', pi.profiles_score, 'reason', pi.profiles_reason)
                ),
                'block_intermediate_score', pi.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'External Sources / Diversity', 'points', pi.extended_profiles_score, 'reason', pi.extended_profiles_reason),
                    jsonb_build_object('name', 'Web or Email', 'points', pi.basic_contact_score, 'reason', pi.basic_contact_reason),
                    jsonb_build_object('name', 'Programmatic / API', 'points', pi.extended_contact_score, 'reason', pi.extended_contact_reason),
                    jsonb_build_object('name', 'Supported Trust', 'points', pi.supported_trust_score, 'reason', pi.supported_trust_reason),
                    jsonb_build_object('name', 'Verification Methods', 'points', pi.verification_methods_score, 'reason', pi.verification_methods_reason),
                    jsonb_build_object('name', 'Basic Technical Metadata', 'points', pi.basic_technical_metadata_score, 'reason', pi.basic_technical_metadata_reason)
                ),
                'block_advanced_score', pi.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'MCP Endpoint', 'points', pi.mcp_endpoint_score, 'reason', pi.mcp_endpoint_reason),
                    jsonb_build_object('name', 'A2A Endpoint', 'points', pi.a2a_endpoint_score, 'reason', pi.a2a_endpoint_reason),
                    jsonb_build_object('name', 'Advanced Technical Setup', 'points', pi.advanced_technical_metadata_score, 'reason', pi.advanced_technical_metadata_reason)
                ),
                'summary', pi.pillar_summary
            ) AS info_reason,
            pm.pillar_score AS meas_score,
            jsonb_build_object(
                'block_basic_score', pm.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Metadata Richness', 'points', pm.metadata_richness_score, 'reason', pm.metadata_richness_reason),
                    jsonb_build_object('name', 'Basic Existence', 'points', pm.existence_score, 'reason', pm.existence_reason)
                ),
                'block_intermediate_score', pm.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Wallet Transaction Quality', 'points', pm.intermediate_wallet_transaction_score, 'reason', pm.intermediate_wallet_transaction_reason),
                    jsonb_build_object('name', 'External Audit', 'points', pm.intermediate_external_audits_score, 'reason', pm.intermediate_external_audits_reason),
                    jsonb_build_object('name', 'Protocol Activity', 'points', pm.intermediate_protocol_activities_score, 'reason', pm.intermediate_protocol_activities_reason)
                ),
                'block_advanced_score', pm.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'External Audit (Advanced)', 'points', pm.advanced_external_audits_score, 'reason', pm.advanced_external_audits_reason),
                    jsonb_build_object('name', 'Wallet Transaction Quality (Advanced)', 'points', pm.advanced_wallet_transaction_score, 'reason', pm.advanced_wallet_transaction_reason),
                    jsonb_build_object('name', 'Identity Analysis', 'points', pm.identity_analysis_score, 'reason', pm.identity_analysis_reason),
                    jsonb_build_object('name', 'Protocol Activity (Advanced)', 'points', pm.advanced_protocol_activities_score, 'reason', pm.advanced_protocol_activities_reason)
                ),
                'summary', pm.pillar_summary
            ) AS meas_reason,
            pu.pillar_score AS usag_score,
            jsonb_build_object(
                'block_basic_score', pu.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Basic General Activity', 'points', pu.basic_activity_score, 'reason', pu.basic_activity_reason)
                ),
                'block_intermediate_score', pu.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Wallet Intermediate', 'points', pu.wallet_intermediate_activity_score, 'reason', pu.wallet_intermediate_activity_reason),
                    jsonb_build_object('name', 'On-Chain Activity Intermediate', 'points', pu.on_chain_intermediate_activity_score, 'reason', pu.on_chain_intermediate_activity_reason),
                    jsonb_build_object('name', 'Comments', 'points', pu.comment_score, 'reason', pu.comment_reason)
                ),
                'block_advanced_score', pu.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'Wallet Advanced', 'points', pu.wallet_advanced_activity_score, 'reason', pu.wallet_advanced_activity_reason),
                    jsonb_build_object('name', 'On-Chain Activity Advanced', 'points', pu.on_chain_advanced_activity_score, 'reason', pu.on_chain_advanced_activity_reason),
                    jsonb_build_object('name', 'Protocol Activity with Payments', 'points', pu.on_chain_activity_paid_score, 'reason', pu.on_chain_activity_paid_reason)
                ),
                'summary', pu.pillar_summary
            ) AS usag_reason,
            iha.calculated_at AS old_calculated_at,
            iha.pillar_history_score,
            iha.pillar_history_reason,
            iha.pillar_information_score,
            iha.pillar_information_reason,
            iha.pillar_measure_score,
            iha.pillar_measure_reason,
            iha.pillar_usage_score,
            iha.pillar_usage_reason,
            iha.index_humi_score,
            iha.version
        FROM agents_to_process atp
        LEFT JOIN index_humi.index_humi_agent iha ON iha.agent_id = atp.id
        LEFT JOIN index_humi.pillar_history ph ON ph.agent_id = atp.id
        LEFT JOIN index_humi.agent_information ai ON ai.agent_id = atp.id
        LEFT JOIN index_humi.pillar_agent_information pi ON pi.agent_information_id = ai.id
        LEFT JOIN index_humi.agent_measures am ON am.agent_id = atp.id
        LEFT JOIN index_humi.pillar_agent_measure pm ON pm.agent_measure_id = am.id
        LEFT JOIN index_humi.agent_usage au ON au.agent_id = atp.id
        LEFT JOIN index_humi.pillar_agent_usage pu ON pu.agent_usage_id = au.id
    ),
    scored AS (
        SELECT
            p.*,
            COALESCE(p.hist_score, 0) + COALESCE(p.info_score, 0)
                + COALESCE(p.meas_score, 0) + COALESCE(p.usag_score, 0) AS final_score
        FROM pillars p
    )
    SELECT
        s.agent_id,
        s.version,
        COALESCE(s.hist_score, 0) AS hist_score,
        COALESCE(s.hist_reason, '{}') AS hist_reason,
        COALESCE(s.info_score, 0) AS info_score,
        COALESCE(s.info_reason, '{}') AS info_reason,
        COALESCE(s.meas_score, 0) AS meas_score,
        COALESCE(s.meas_reason, '{}') AS meas_reason,
        COALESCE(s.usag_score, 0) AS usag_score,
        COALESCE(s.usag_reason, '{}') AS usag_reason,
        s.final_score,
        CASE
            WHEN s.final_score BETWEEN 0 AND 49 THEN 'Unstable'
            WHEN s.final_score BETWEEN 50 AND 64 THEN 'Developing'
            WHEN s.final_score BETWEEN 65 AND 79 THEN 'Stable'
            WHEN s.final_score BETWEEN 80 AND 89 THEN 'Very Stable'
            WHEN s.final_score BETWEEN 90 AND 100 THEN 'Elite'
            ELSE 'Not Calculated'
        END AS maturity_level,
        (
            SELECT jsonb_agg(elem ORDER BY (elem->>'date')::date DESC)
            FROM (
                SELECT elem
                FROM jsonb_array_elements(COALESCE(it.humi_score_last_30_days, '[]'::jsonb)) elem
                WHERE elem->>'date' != CURRENT_DATE::text
                UNION ALL
                SELECT jsonb_build_object(
                    'date', COALESCE(s.old_calculated_at, NOW()),
                    'pillar_history_score', s.pillar_history_score,
                    'pillar_information_score', s.pillar_information_score,
                    'pillar_measure_score', s.pillar_measure_score,
                    'pillar_usage_score', s.pillar_usage_score,
                    'index_humi_score', s.index_humi_score
                )
            ) sub(elem)
            WHERE (elem->>'date')::date >= (CURRENT_DATE - INTERVAL '30 days')
        ) AS new_last_30_days,
        (
            WITH current_month AS (
                SELECT to_char(COALESCE(s.old_calculated_at, NOW())::date, 'YYYY-MM') AS month_str
            )
            SELECT
                COALESCE(
                    (SELECT jsonb_agg(elem)
                     FROM jsonb_array_elements(COALESCE(it.humi_score_tracking, '[]'::jsonb)) elem
                     WHERE elem->>'date' != (SELECT month_str FROM current_month)),
                    '[]'::jsonb
                ) || jsonb_build_array(
                    jsonb_build_object(
                        'date', (SELECT month_str FROM current_month),
                        'index_humi_score', COALESCE(s.index_humi_score, 0)
                    )
                )
        ) AS new_monthly_tracking
    FROM scored s
    LEFT JOIN index_humi.index_humi_tracking it ON it.agent_id = s.agent_id;

    INSERT INTO index_humi.index_humi_agent (
        agent_id,
        pillar_history_score, pillar_history_reason,
        pillar_information_score, pillar_information_reason,
        pillar_measure_score, pillar_measure_reason,
        pillar_usage_score, pillar_usage_reason,
        index_humi_score, calculated_at, version,
        change_reason, triggered_by, calculated_by,
        maturity_level
    )
    SELECT
        agent_id,
        hist_score, hist_reason,
        info_score, info_reason,
        meas_score, meas_reason,
        usag_score, usag_reason,
        final_score,
        NOW(),
        COALESCE(version, 0) + 1,
        'full_index_calculation',
        'batch_process',
        'humi_engine_v2',
        maturity_level
    FROM temp_humi_calc
    ON CONFLICT (agent_id) DO UPDATE SET
        pillar_history_score = EXCLUDED.pillar_history_score,
        pillar_history_reason = EXCLUDED.pillar_history_reason,
        pillar_information_score = EXCLUDED.pillar_information_score,
        pillar_information_reason = EXCLUDED.pillar_information_reason,
        pillar_measure_score = EXCLUDED.pillar_measure_score,
        pillar_measure_reason = EXCLUDED.pillar_measure_reason,
        pillar_usage_score = EXCLUDED.pillar_usage_score,
        pillar_usage_reason = EXCLUDED.pillar_usage_reason,
        index_humi_score = EXCLUDED.index_humi_score,
        calculated_at = NOW(),
        version = EXCLUDED.version,
        change_reason = EXCLUDED.change_reason,
        triggered_by = EXCLUDED.triggered_by,
        calculated_by = EXCLUDED.calculated_by,
        maturity_level = EXCLUDED.maturity_level;

    INSERT INTO index_humi.index_humi_tracking (agent_id)
    SELECT agent_id FROM temp_humi_calc
    ON CONFLICT (agent_id) DO NOTHING;

    UPDATE index_humi.index_humi_tracking it
    SET
        humi_score_last_30_days = t.new_last_30_days,
        humi_score_tracking     = t.new_monthly_tracking
    FROM temp_humi_calc t
    WHERE it.agent_id = t.agent_id;

    GET DIAGNOSTICS v_processed = ROW_COUNT;
    DROP TABLE IF EXISTS temp_humi_calc;
    RETURN v_processed;
END;
$$;
