-- Optimizado: batch set-based (sin loop FOR), audits/warnings pre-agregados por agente.
-- Test: SELECT web_dashboard.chains_import_data(3);

CREATE OR REPLACE FUNCTION web_dashboard.chains_import_data(p_limit_chains integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = web_dashboard, public, erc_8004, index_humi, index_wami
AS $$
DECLARE
  v_rows_processed integer := 0;
BEGIN
  WITH pending_chains AS (
    SELECT
      c.id,
      c.chain_id,
      c.name,
      c.short_name,
      c.explorer_url
    FROM erc_8004.chains c
    LEFT JOIN web_dashboard.chains wc ON wc.chain_id = c.chain_id::text
    WHERE (wc.updated_at IS NULL OR wc.updated_at < NOW() - INTERVAL '24 hours')
      AND c.is_active = TRUE
    ORDER BY wc.updated_at ASC NULLS FIRST
    LIMIT p_limit_chains
  ),
  chain_agents AS (
    SELECT DISTINCT
      pc.id AS chain_internal_id,
      r.agent_id,
      r.on_chain_registration_wallet_id
    FROM pending_chains pc
    INNER JOIN erc_8004.registrations r ON r.chain_id = pc.id
  ),
  audit_by_agent AS (
    SELECT
      aud.agent_id,
      COUNT(*) AS total_audits,
      ROUND(AVG(aud.external_audit_score), 2) AS avg_audit_score,
      MAX(CASE WHEN aud.external_audit_score IS NOT NULL THEN 1 ELSE 0 END) = 1 AS has_audit
    FROM erc_8004.agent_analysis_external_audit aud
    WHERE aud.agent_id IN (SELECT agent_id FROM chain_agents)
    GROUP BY aud.agent_id
  ),
  warnings_by_agent AS (
    SELECT
      aw.agent_id,
      bool_or(aw.warnings_data @> '[{"type":"duplication_metadata"}]'::jsonb) AS has_duplication_metadata,
      bool_or(aw.warnings_data @> '[{"type":"multi_agent_wallet"}]'::jsonb) AS has_multi_agent_wallet,
      bool_or(aw.warnings_data @> '[{"type":"dummy_metadata"}]'::jsonb) AS has_dummy_metadata,
      bool_or(aw.warnings_data @> '[{"type":"attestations_spam"}]'::jsonb) AS has_attestations_spam,
      bool_or(aw.warnings_data @> '[{"type":"external_audit_warning"}]'::jsonb) AS has_external_audit_warning,
      bool_or(aw.warnings_data @> '[{"type":"high_revocations"}]'::jsonb) AS has_high_revocations,
      bool_or(aw.warnings_data @> '[{"type":"owner_inactive_agents"}]'::jsonb) AS has_owner_inactive_agents,
      bool_or(aw.warnings_data @> '[{"type":"high_ownership_churn"}]'::jsonb) AS has_high_ownership_churn,
      bool_or(aw.warnings_data @> '[{"type":"transactional_wallet_same_as_owner"}]'::jsonb) AS has_transactional_wallet_same_as_owner,
      bool_or(aw.warnings_data @> '[{"type":"lower_realness"}]'::jsonb) AS has_lower_realness,
      bool_or(aw.warnings_data @> '[{"type":"lower_metadata_richness"}]'::jsonb) AS has_lower_metadata_richness
    FROM erc_8004.agent_warnings aw
    WHERE aw.agent_id IN (SELECT agent_id FROM chain_agents)
    GROUP BY aw.agent_id
  ),
  agent_enriched AS (
    SELECT
      ca.chain_internal_id,
      ca.agent_id,
      ca.on_chain_registration_wallet_id,
      au.nonce_delta_30_days,
      au.nonce_delta_15_days,
      au.nonce_delta_yesterday,
      au.attestations_delta_30_days,
      au.on_chain_executions_delta_30_days,
      au.on_chain_feedbacks_delta_30_day,
      au.protocol_activity_delta_30_days,
      au.protocol_activity_delta_30_days_with_payments,
      au.on_chain_executions_delta_30_days AS on_chain_exec_30d,
      ih.index_humi_score,
      ih.maturity_level,
      ih.pillar_history_score,
      ih.pillar_information_score,
      ih.pillar_measure_score,
      ih.pillar_usage_score,
      a.metadata_category,
      wa.has_x402,
      ai.mcp_endpoints,
      ai.a2a_endpoints,
      ab.total_audits,
      ab.avg_audit_score,
      ab.has_audit,
      wb.has_duplication_metadata,
      wb.has_multi_agent_wallet,
      wb.has_dummy_metadata,
      wb.has_attestations_spam,
      wb.has_external_audit_warning,
      wb.has_high_revocations,
      wb.has_owner_inactive_agents,
      wb.has_high_ownership_churn,
      wb.has_transactional_wallet_same_as_owner,
      wb.has_lower_realness,
      wb.has_lower_metadata_richness
    FROM chain_agents ca
    LEFT JOIN erc_8004.agent_usage au ON au.agent_id = ca.agent_id
    LEFT JOIN index_humi.index_humi_agent ih ON ih.agent_id = ca.agent_id
    LEFT JOIN erc_8004.agents a ON a.id = ca.agent_id
    LEFT JOIN web_dashboard.agents wa ON wa.agent_id = ca.agent_id
    LEFT JOIN index_humi.agent_information ai ON ai.agent_id = ca.agent_id
    LEFT JOIN audit_by_agent ab ON ab.agent_id = ca.agent_id
    LEFT JOIN warnings_by_agent wb ON wb.agent_id = ca.agent_id
  ),
  chain_metrics AS (
    SELECT
      ae.chain_internal_id,
      COUNT(DISTINCT ae.agent_id) AS agent_count,
      ROUND(AVG(ae.index_humi_score), 2) AS avg_humi_score,
      jsonb_build_object(
        'Unstable',   COUNT(*) FILTER (WHERE ae.maturity_level = 'Unstable'),
        'Developing', COUNT(*) FILTER (WHERE ae.maturity_level = 'Developing'),
        'Stable',     COUNT(*) FILTER (WHERE ae.maturity_level = 'Stable'),
        'Very Stable',COUNT(*) FILTER (WHERE ae.maturity_level = 'Very Stable'),
        'Elite',      COUNT(*) FILTER (WHERE ae.maturity_level = 'Elite')
      ) AS humi_distribution,
      jsonb_build_object(
        'history',     ROUND(AVG(ae.pillar_history_score), 2),
        'information', ROUND(AVG(ae.pillar_information_score), 2),
        'measure',     ROUND(AVG(ae.pillar_measure_score), 2),
        'usage',       ROUND(AVG(ae.pillar_usage_score), 2)
      ) AS pillars_score_distribution,
      jsonb_build_object(
        'Excellent', COUNT(*) FILTER (WHERE ae.metadata_category = 'Excellent'),
        'Strong',    COUNT(*) FILTER (WHERE ae.metadata_category = 'Strong'),
        'Moderate',  COUNT(*) FILTER (WHERE ae.metadata_category = 'Moderate'),
        'Limited',   COUNT(*) FILTER (WHERE ae.metadata_category = 'Limited')
      ) AS metadata_distribution,
      ROUND(
        100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.index_humi_score >= 65)
        / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2
      ) AS pct_high_humi,
      COUNT(DISTINCT ae.on_chain_registration_wallet_id) AS total_owners,
      ROUND(
        COUNT(DISTINCT ae.agent_id)::numeric
        / NULLIF(COUNT(DISTINCT ae.on_chain_registration_wallet_id), 0), 2
      ) AS avg_agents_per_owner,
      COALESCE(SUM(ae.on_chain_exec_30d), 0) AS total_executions_30d,
      COALESCE(SUM(ae.protocol_activity_delta_30_days), 0) AS total_protocol_activity_30d,
      COALESCE(SUM(ae.protocol_activity_delta_30_days_with_payments), 0) AS total_with_payments_30d,
      ROUND(
        100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_x402)
        / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2
      ) AS pct_x402,
      ROUND(
        100.0 * COUNT(DISTINCT ae.agent_id) FILTER (
          WHERE ae.mcp_endpoints IS NOT NULL OR ae.a2a_endpoints IS NOT NULL
        ) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2
      ) AS pct_mcp_a2a,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_duplication_metadata) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS duplication_metadata,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_multi_agent_wallet) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS multi_agent_wallet,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_dummy_metadata) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS dummy_metadata,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_attestations_spam) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS attestations_spam,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_external_audit_warning) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS external_audit_warning,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_high_revocations) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS high_revocations,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_owner_inactive_agents) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS owner_inactive_agents,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_high_ownership_churn) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS high_ownership_churn,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_transactional_wallet_same_as_owner) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS transactional_wallet_same_as_owner,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_lower_realness) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS lower_realness,
      ROUND(100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_lower_metadata_richness) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2) AS lower_metadata_richness,
      COALESCE(SUM(ae.total_audits), 0) AS total_audits,
      ROUND(AVG(ae.avg_audit_score), 2) AS avg_audit_score,
      ROUND(
        100.0 * COUNT(DISTINCT ae.agent_id) FILTER (WHERE ae.has_audit)
        / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2
      ) AS pct_with_audit,
      ROUND(
        100.0 * COUNT(DISTINCT ae.agent_id) FILTER (
          WHERE ae.nonce_delta_30_days > 0
             OR ae.nonce_delta_15_days > 0
             OR ae.nonce_delta_yesterday > 0
        ) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2
      ) AS pct_with_wallet_activity,
      ROUND(
        100.0 * COUNT(DISTINCT ae.agent_id) FILTER (
          WHERE COALESCE(ae.attestations_delta_30_days, 0)
              + COALESCE(ae.on_chain_executions_delta_30_days, 0)
              + COALESCE(ae.on_chain_feedbacks_delta_30_day, 0)
              + COALESCE(ae.protocol_activity_delta_30_days, 0) > 0
        ) / NULLIF(COUNT(DISTINCT ae.agent_id), 0), 2
      ) AS pct_with_onchain_activity
    FROM agent_enriched ae
    GROUP BY ae.chain_internal_id
  )
  INSERT INTO web_dashboard.chains (
    chain_id,
    name,
    short_name,
    explorer_url,
    statistics_agent_last_30_days,
    statistics_agent_monthly,
    avg_humi_score,
    humi_distribution,
    pillars_score_distribution,
    metadata_distribution,
    agent_stats_information,
    owner_stats_information,
    on_chain_stats_information,
    technical_data_information,
    warning_stats_information,
    external_audits_information,
    best_10_agents_humi,
    wami_distribution,
    created_at,
    updated_at
  )
  SELECT
    pc.chain_id::text,
    pc.name,
    COALESCE(pc.short_name, ''),
    COALESCE(pc.explorer_url, ''),
    jsonb_build_object(
      'total_agents',          COALESCE(latest.total_agents, 0),
      'active_agents',         COALESCE(latest.active_agents, 0),
      'pct_active',            ROUND(100.0 * COALESCE(latest.active_agents, 0) / NULLIF(COALESCE(latest.total_agents, 0), 0), 2),
      'new_agents_30d',        COALESCE(new_30d.new_agents_30d, 0),
      'pct_with_wallet_activity', COALESCE(cm.pct_with_wallet_activity, 0),
      'pct_with_onchain_activity', COALESCE(cm.pct_with_onchain_activity, 0)
    ),
    monthly.monthly_stats,
    cm.avg_humi_score,
    cm.humi_distribution,
    cm.pillars_score_distribution,
    cm.metadata_distribution,
    jsonb_build_object(
      'total_agents',         COALESCE(cs.agent_total, 0),
      'active_agents',        COALESCE(cs.agent_active, 0),
      'agents_with_feedback', COALESCE(cs.agent_with_feedback, 0),
      'pct_high_humi',        COALESCE(cm.pct_high_humi, 0)
    ),
    jsonb_build_object(
      'total_owners',         COALESCE(cm.total_owners, 0),
      'avg_agents_per_owner', COALESCE(cm.avg_agents_per_owner, 0)
    ),
    jsonb_build_object(
      'total_executions_30d',        COALESCE(cm.total_executions_30d, 0),
      'total_protocol_activity_30d', COALESCE(cm.total_protocol_activity_30d, 0),
      'total_with_payments_30d',     COALESCE(cm.total_with_payments_30d, 0)
    ),
    jsonb_build_object(
      'pct_x402',    COALESCE(cm.pct_x402, 0),
      'pct_mcp_a2a', COALESCE(cm.pct_mcp_a2a, 0)
    ),
    jsonb_build_object(
      'duplication_metadata',                COALESCE(cm.duplication_metadata, 0),
      'multi_agent_wallet',                  COALESCE(cm.multi_agent_wallet, 0),
      'dummy_metadata',                      COALESCE(cm.dummy_metadata, 0),
      'attestations_spam',                   COALESCE(cm.attestations_spam, 0),
      'external_audit_warning',              COALESCE(cm.external_audit_warning, 0),
      'high_revocations',                    COALESCE(cm.high_revocations, 0),
      'owner_inactive_agents',               COALESCE(cm.owner_inactive_agents, 0),
      'high_ownership_churn',                COALESCE(cm.high_ownership_churn, 0),
      'transactional_wallet_same_as_owner',  COALESCE(cm.transactional_wallet_same_as_owner, 0),
      'lower_realness',                      COALESCE(cm.lower_realness, 0),
      'lower_metadata_richness',             COALESCE(cm.lower_metadata_richness, 0)
    ),
    jsonb_build_object(
      'total_audits',    COALESCE(cm.total_audits, 0),
      'avg_audit_score', cm.avg_audit_score,
      'pct_with_audit',  COALESCE(cm.pct_with_audit, 0)
    ),
    COALESCE(best_humi.best_10, '[]'::jsonb),
    COALESCE(wami_dist.wami_distribution,
      jsonb_build_object('Unstable', 0, 'Developing', 0, 'Stable', 0, 'Very Stable', 0, 'Elite', 0)
    ),
    NOW(),
    NOW()
  FROM pending_chains pc
  LEFT JOIN chain_metrics cm ON cm.chain_internal_id = pc.id
  LEFT JOIN erc_8004.chain_stats cs ON cs.chain_id = pc.id
  LEFT JOIN LATERAL (
    SELECT agent_total AS total_agents, agent_active AS active_agents
    FROM erc_8004.chain_stats_tracking
    WHERE chain_id = pc.id
      AND stats_at >= NOW() - INTERVAL '30 days'
    ORDER BY stats_at DESC
    LIMIT 1
  ) latest ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(agent_new), 0) AS new_agents_30d
    FROM erc_8004.chain_stats_tracking
    WHERE chain_id = pc.id
      AND stats_at >= NOW() - INTERVAL '30 days'
  ) new_30d ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'month',         TO_CHAR(month_start, 'YYYY-MM'),
        'total_agents',  last_total,
        'active_agents', last_active,
        'new_agents',    monthly_new
      ) ORDER BY month_start
    ) AS monthly_stats
    FROM (
      SELECT
        date_trunc('month', stats_at) AS month_start,
        MAX(agent_total) AS last_total,
        MAX(agent_active) AS last_active,
        SUM(agent_new) AS monthly_new
      FROM erc_8004.chain_stats_tracking
      WHERE chain_id = pc.id
        AND stats_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1
    ) m
  ) monthly ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'agent_id',   agent_id,
        'name',       COALESCE(name, 'Unnamed Agent'),
        'humi_score', ROUND(index_humi_score, 2)
      ) ORDER BY index_humi_score DESC
    ) AS best_10
    FROM (
      SELECT eda.id AS agent_id, a2.name, ih2.index_humi_score
      FROM index_humi.index_humi_agent ih2
      JOIN erc_8004.agents a2 ON a2.id = ih2.agent_id
      JOIN erc_8004.registrations r2 ON r2.agent_id = a2.id
      JOIN web_dashboard.agents eda ON eda.agent_id = ih2.agent_id
      WHERE r2.chain_id = pc.id
      ORDER BY ih2.index_humi_score DESC
      LIMIT 10
    ) top_agents
  ) best_humi ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_build_object(
      'Unstable',    COUNT(*) FILTER (WHERE iw.madutiry_level = 'Unstable'),
      'Developing',  COUNT(*) FILTER (WHERE iw.madutiry_level = 'Developing'),
      'Stable',      COUNT(*) FILTER (WHERE iw.madutiry_level = 'Stable'),
      'Very Stable', COUNT(*) FILTER (WHERE iw.madutiry_level = 'Very Stable'),
      'Elite',       COUNT(*) FILTER (WHERE iw.madutiry_level = 'Elite')
    ) AS wami_distribution
    FROM index_wami.index_wami iw
    WHERE iw.chain_id = pc.id
  ) wami_dist ON true
  ON CONFLICT (chain_id) DO UPDATE SET
    name                          = EXCLUDED.name,
    short_name                    = EXCLUDED.short_name,
    explorer_url                  = EXCLUDED.explorer_url,
    statistics_agent_last_30_days = EXCLUDED.statistics_agent_last_30_days,
    statistics_agent_monthly      = EXCLUDED.statistics_agent_monthly,
    avg_humi_score                = EXCLUDED.avg_humi_score,
    humi_distribution             = EXCLUDED.humi_distribution,
    pillars_score_distribution    = EXCLUDED.pillars_score_distribution,
    metadata_distribution         = EXCLUDED.metadata_distribution,
    agent_stats_information       = EXCLUDED.agent_stats_information,
    owner_stats_information       = EXCLUDED.owner_stats_information,
    on_chain_stats_information    = EXCLUDED.on_chain_stats_information,
    technical_data_information    = EXCLUDED.technical_data_information,
    warning_stats_information     = EXCLUDED.warning_stats_information,
    external_audits_information   = EXCLUDED.external_audits_information,
    best_10_agents_humi           = EXCLUDED.best_10_agents_humi,
    wami_distribution             = EXCLUDED.wami_distribution,
    updated_at                    = NOW();

  GET DIAGNOSTICS v_rows_processed = ROW_COUNT;

  RAISE NOTICE 'web_dashboard.chains_import_data() completado. Chains procesadas: %', v_rows_processed;
  RETURN v_rows_processed;
END;
$$;

COMMENT ON FUNCTION web_dashboard.chains_import_data(integer) IS
  'Importa estadísticas de chains en batch set-based sin loop por cadena.';
