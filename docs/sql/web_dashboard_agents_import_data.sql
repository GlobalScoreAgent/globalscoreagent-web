-- Refactor: lee MVs erc_8004.agent_summary_* en lugar de registrations/registration_tx/agent_analysis_stats.
-- HUMI/WAMI: otros procesos (no incluidos en INSERT/ON CONFLICT).
-- chain_id := erc_8004.agents.chain_id (= web_dashboard.chains_stadistics.id).
--
-- Prerrequisito REFRESH (orden sugerido):
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_services_detailed;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_services;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_wallet_tx;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_profiles;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_owner_wallets;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_warning;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_comments;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_attestations;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_external_audits;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_identity_analysis;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_on_chain_executions;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_on_chain_feedbacks;
--   REFRESH MATERIALIZED VIEW erc_8004.agent_summary_protocol_activity;
--
-- Validación:
--   SELECT web_dashboard.web_dashboard_agents_import_data(5);
--   SELECT agent_id, chain_id, transactional_wallets, has_x402, comments_summary
--   FROM web_dashboard.agents ORDER BY updated_at DESC LIMIT 5;
--   SELECT agent_id, current_humi_score, current_wami_score
--   FROM web_dashboard.agents WHERE agent_id = :id;
--   -- HUMI/WAMI no deben cambiar tras re-import del mismo agente

CREATE OR REPLACE FUNCTION web_dashboard.web_dashboard_agents_import_data(p_limit integer DEFAULT 1000)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = web_dashboard, public, erc_8004
AS $$
DECLARE
    v_processed_count integer;
BEGIN
    INSERT INTO web_dashboard.agents (
        agent_id,
        chain_id,
        on_chain_id,
        on_chain_created_at,
        name,
        description,
        image_url,
        web,
        email,
        owner_wallet,
        owner_since_at,
        owner_changes,
        gobernance_type,
        profiles,
        searchable_metadata,
        supported_trust,
        skills,
        capabilites,
        tags,
        oasf_skills,
        oasf_domains,
        technical_tools,
        technical_prompts,
        technical_capabilities,
        services,
        has_x402,
        nonce_current,
        balance_current,
        nonce_history,
        balance_history,
        has_comments,
        comments_summary,
        has_attestations,
        attestations_summary,
        has_external_audit,
        external_audit_summary,
        has_identity_analysis,
        identity_analysis_summary,
        has_on_chain_executions,
        on_chain_execution_summary,
        has_on_chain_feedbacks,
        on_chain_feedback_summary,
        has_protocol_activity,
        protocol_activity_summary,
        created_at,
        updated_at,
        skills_filters,
        tags_filters,
        capabilities_filters,
        oasf_domains_filters,
        transactional_wallets,
        chain_name,
        wallet_chain_register,
        services_filters,
        metadata_richness_score,
        metadata_richness_information,
        agent_warnings,
        owner_wallet_details,
        realness_status,
        realness_score
    )
    WITH target_agents AS (
        SELECT a.id AS agent_id
        FROM erc_8004.agents a
        LEFT JOIN web_dashboard.agents wa ON wa.agent_id = a.id
        WHERE (
            wa.agent_id IS NULL
            OR wa.updated_at < CURRENT_DATE::timestamptz
        )
        AND EXISTS (
            SELECT 1
            FROM web_dashboard.chains_stadistics cs
            WHERE cs.id = a.chain_id
            LIMIT 1
        )
        ORDER BY wa.updated_at ASC NULLS FIRST, a.id
        LIMIT p_limit
    )
    SELECT
        a.id AS agent_id,
        a.chain_id,
        COALESCE(a.on_chain_agent_id, '') AS on_chain_id,
        COALESCE(a.on_chain_created_at, NOW()) AS on_chain_created_at,
        COALESCE(a.name, '') AS name,
        a.description,
        a.image_url,
        sd.web,
        sd.email,
        COALESCE(ow.address, '') AS owner_wallet,
        COALESCE(a.owner_since_at, NOW()) AS owner_since_at,
        COALESCE(a.owner_changes, 0) AS owner_changes,
        COALESCE(am.governance_type, 'private') AS gobernance_type,
        COALESCE(pr.profiles, '{}'::jsonb) AS profiles,
        am.searchable_metadata,
        am.supported_trust,
        am.skills,
        am.capabilities AS capabilites,
        am.tags,
        am.oasf_skills,
        am.oasf_domains,
        am.technical_tools,
        am.technical_prompts,
        am.technical_capabilities,
        COALESCE(sd.services_json, '[]'::jsonb) AS services,
        COALESCE(svc.has_x402_support, false) AS has_x402,
        COALESCE(wtx.total_nonce_current, 0) AS nonce_current,
        COALESCE(wtx.total_balance_current, 0) AS balance_current,
        jsonb_build_object(
            'nonce_delta_7days', COALESCE(wtx.total_nonce_delta_7days, 0),
            'nonce_delta_15days', COALESCE(wtx.total_nonce_delta_15days, 0),
            'nonce_delta_1month', COALESCE(wtx.total_nonce_delta_1month, 0),
            'nonce_delta_2month', COALESCE(wtx.total_nonce_delta_2month, 0),
            'nonce_delta_3month', COALESCE(wtx.total_nonce_delta_3month, 0),
            'nonce_delta_6month', COALESCE(wtx.total_nonce_delta_6month, 0),
            'nonce_delta_9month', COALESCE(wtx.total_nonce_delta_9month, 0),
            'nonce_delta_12month', COALESCE(wtx.total_nonce_delta_12month, 0)
        ) AS nonce_history,
        jsonb_build_object(
            'balance_delta_7days', COALESCE(wtx.total_balance_delta_7days, 0),
            'balance_delta_15days', COALESCE(wtx.total_balance_delta_15days, 0),
            'balance_delta_1month', COALESCE(wtx.total_balance_delta_1month, 0),
            'balance_delta_2month', COALESCE(wtx.total_balance_delta_2month, 0),
            'balance_delta_3month', COALESCE(wtx.total_balance_delta_3month, 0),
            'balance_delta_6month', COALESCE(wtx.total_balance_delta_6month, 0),
            'balance_delta_9month', COALESCE(wtx.total_balance_delta_9month, 0),
            'balance_delta_12month', COALESCE(wtx.total_balance_delta_12month, 0)
        ) AS balance_history,
        COALESCE(cm.has_comments, false) AS has_comments,
        jsonb_build_object(
            'comment_count', COALESCE(cm.comments_total_count, 0),
            'comment_valid_count', COALESCE(cm.comments_valid_count, 0),
            'comment_revoke_count', COALESCE(cm.comments_revoke_count, 0),
            'first_comment_record_at', cm.first_comment_record_at,
            'last_comment_record_at', cm.last_comment_record_at
        ) AS comments_summary,
        COALESCE(att.has_attestations, false) AS has_attestations,
        jsonb_build_object(
            'attestations_total_count', COALESCE(att.attestations_total_count, 0),
            'attestations_valid_count', COALESCE(att.attestations_valid_count, 0),
            'attestations_revoke_count', COALESCE(att.attestations_revoke_count, 0),
            'attestation_spam_count', COALESCE(att.attestation_spam_count, 0),
            'attestation_score_avg', att.attestation_score_avg,
            'first_attestation_record_at', att.first_attestation_record_at,
            'last_attestation_record_at', att.last_attestation_record_at
        ) AS attestations_summary,
        COALESCE(ea.has_external_audit, false) AS has_external_audit,
        jsonb_build_object(
            'external_source_valid_count', COALESCE(ea.external_source_valid_count, 0),
            'first_external_audit_record_at', ea.first_external_audit_record_at,
            'external_source_data', ea.external_audit_data,
            'external_source_count', COALESCE(ea.external_source_count, 0),
            'external_source_score', ea.external_source_score,
            'last_external_audit_record_at', ea.last_external_audit_record_at
        ) AS external_audit_summary,
        COALESCE(idt.has_identity_analysis, false) AS has_identity_analysis,
        jsonb_build_object(
            'identity_score', idt.last_identity_analysis->>'identity_score',
            'identity_stage', idt.last_identity_analysis->>'identity_stage',
            'last_identity_record_at', idt.last_identity_analysis->>'created_at',
            'last_identity_record_updated_at', idt.last_identity_analysis_at
        ) AS identity_analysis_summary,
        COALESCE(ex.has_on_chain_executions, false) AS has_on_chain_executions,
        jsonb_build_object(
            'on_chain_executions_count', COALESCE(ex.on_chain_executions_count, 0),
            'on_chain_executions_data', ex.on_chain_executions_data,
            'last_on_chain_execution_record_at', ex.last_on_chain_execution_record_at,
            'on_chain_execution_valid_count', COALESCE(ex.on_chain_executions_valid_count, 0),
            'first_on_chain_execution_recorded_at', ex.first_on_chain_execution_recorded_at
        ) AS on_chain_execution_summary,
        COALESCE(fb.has_on_chain_feedbacks, false) AS has_on_chain_feedbacks,
        jsonb_build_object(
            'on_chain_feedbacks_count', COALESCE(fb.on_chain_feedbacks_count, 0),
            'on_chain_feedback_data', fb.on_chain_feedback_data,
            'first_on_chain_feedbacks_recorded_at', fb.first_on_chain_feedbacks_recorded_at,
            'on_chain_feedbacks_valid_count', COALESCE(fb.on_chain_feedbacks_valid_count, 0),
            'last_on_chain_feedback_record_at', fb.last_on_chain_feedback_record_at
        ) AS on_chain_feedback_summary,
        COALESCE(pa.has_protocol_activity, false) AS has_protocol_activity,
        jsonb_build_object(
            'protocol_activity_count', COALESCE(pa.protocol_activity_count, 0),
            'protocol_activity_score', pa.protocol_activity_score,
            'protocol_activity_data', pa.protocol_activity_data,
            'last_protocol_activity_record_at', pa.last_protocol_activity_record_at,
            'protocol_activity_valid_payment_count', COALESCE(pa.protocol_activity_valid_payment_count, 0),
            'protocol_activity_valid_count', COALESCE(pa.protocol_activity_valid_count, 0),
            'first_protocol_activity_record_at', pa.first_protocol_activity_record_at
        ) AS protocol_activity_summary,
        NOW() AS created_at,
        NOW() AS updated_at,
        am.skill_filters AS skills_filters,
        am.tags_filters,
        am.capabilities_filters,
        am.oasf_domains_filters,
        COALESCE(wtx.transactional_wallets_details, '[]'::jsonb) AS transactional_wallets,
        ec.short_name AS chain_name,
        wreg.address AS wallet_chain_register,
        COALESCE(sd.services_filter_json, '[]'::jsonb) AS services_filters,
        a.metadata_richness_score,
        a.metadata_richness_information,
        COALESCE(wrn.warnings_data, '[]'::jsonb) AS agent_warnings,
        COALESCE(owd.owner_wallet_details, '[]'::jsonb) AS owner_wallet_details,
        a.validation_realness_status AS realness_status,
        a.validation_realness_score AS realness_score
    FROM target_agents ta
    JOIN erc_8004.agents a ON a.id = ta.agent_id
    JOIN erc_8004.chains ec ON ec.id = a.chain_id
    LEFT JOIN erc_8004.wallets ow ON ow.id = a.owner_wallet_id
    LEFT JOIN erc_8004.wallets wreg ON wreg.id = a.on_chain_registration_wallet_id
    LEFT JOIN erc_8004.agent_metadata am ON am.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_services_detailed sd ON sd.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_services svc ON svc.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_wallet_tx wtx ON wtx.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_profiles pr ON pr.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_owner_wallets owd ON owd.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_warning wrn ON wrn.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_comments cm ON cm.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_attestations att ON att.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_external_audits ea ON ea.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_identity_analysis idt ON idt.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_on_chain_executions ex ON ex.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_on_chain_feedbacks fb ON fb.agent_id = ta.agent_id
    LEFT JOIN erc_8004.agent_summary_protocol_activity pa ON pa.agent_id = ta.agent_id

    ON CONFLICT (agent_id) DO UPDATE SET
        chain_id = EXCLUDED.chain_id,
        on_chain_id = EXCLUDED.on_chain_id,
        on_chain_created_at = EXCLUDED.on_chain_created_at,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        web = EXCLUDED.web,
        email = EXCLUDED.email,
        owner_wallet = EXCLUDED.owner_wallet,
        owner_since_at = EXCLUDED.owner_since_at,
        owner_changes = EXCLUDED.owner_changes,
        gobernance_type = EXCLUDED.gobernance_type,
        profiles = EXCLUDED.profiles,
        searchable_metadata = EXCLUDED.searchable_metadata,
        supported_trust = EXCLUDED.supported_trust,
        skills = EXCLUDED.skills,
        capabilites = EXCLUDED.capabilites,
        tags = EXCLUDED.tags,
        oasf_skills = EXCLUDED.oasf_skills,
        oasf_domains = EXCLUDED.oasf_domains,
        technical_tools = EXCLUDED.technical_tools,
        technical_prompts = EXCLUDED.technical_prompts,
        technical_capabilities = EXCLUDED.technical_capabilities,
        services = EXCLUDED.services,
        has_x402 = EXCLUDED.has_x402,
        nonce_current = EXCLUDED.nonce_current,
        balance_current = EXCLUDED.balance_current,
        nonce_history = EXCLUDED.nonce_history,
        balance_history = EXCLUDED.balance_history,
        has_comments = EXCLUDED.has_comments,
        comments_summary = EXCLUDED.comments_summary,
        has_attestations = EXCLUDED.has_attestations,
        attestations_summary = EXCLUDED.attestations_summary,
        has_external_audit = EXCLUDED.has_external_audit,
        external_audit_summary = EXCLUDED.external_audit_summary,
        has_identity_analysis = EXCLUDED.has_identity_analysis,
        identity_analysis_summary = EXCLUDED.identity_analysis_summary,
        has_on_chain_executions = EXCLUDED.has_on_chain_executions,
        on_chain_execution_summary = EXCLUDED.on_chain_execution_summary,
        has_on_chain_feedbacks = EXCLUDED.has_on_chain_feedbacks,
        on_chain_feedback_summary = EXCLUDED.on_chain_feedback_summary,
        has_protocol_activity = EXCLUDED.has_protocol_activity,
        protocol_activity_summary = EXCLUDED.protocol_activity_summary,
        updated_at = NOW(),
        skills_filters = EXCLUDED.skills_filters,
        tags_filters = EXCLUDED.tags_filters,
        capabilities_filters = EXCLUDED.capabilities_filters,
        oasf_domains_filters = EXCLUDED.oasf_domains_filters,
        transactional_wallets = EXCLUDED.transactional_wallets,
        chain_name = EXCLUDED.chain_name,
        wallet_chain_register = EXCLUDED.wallet_chain_register,
        services_filters = EXCLUDED.services_filters,
        metadata_richness_score = EXCLUDED.metadata_richness_score,
        metadata_richness_information = EXCLUDED.metadata_richness_information,
        agent_warnings = EXCLUDED.agent_warnings,
        owner_wallet_details = EXCLUDED.owner_wallet_details,
        realness_status = EXCLUDED.realness_status,
        realness_score = EXCLUDED.realness_score;

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    RETURN jsonb_build_object('status', 'success', 'processed', v_processed_count);
END;
$$;

COMMENT ON FUNCTION web_dashboard.web_dashboard_agents_import_data(integer) IS
  'Importa agentes del dashboard leyendo MVs erc_8004.agent_summary_* (batch diario).';
