-- MV web_dashboard.chains: reemplaza tabla + web_dashboard.chains_import_data()
-- Una fila por cadena activa (erc_8004.chains), ensamblando MVs upstream.
--
-- Prerrequisito REFRESH (orden):
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_stats;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_tracking_last_30_days;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_tracking_last12_months;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_wallet_activity_last_30_days;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_on_chain_activity_last_30_days;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_metadata_category;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_agent_services;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_warnings;
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_agent_audits;
--   REFRESH MATERIALIZED VIEW index_humi.chain_summary_humi_index;
--   REFRESH MATERIALIZED VIEW index_wami.chain_summary_wami_index;
--   REFRESH MATERIALIZED VIEW CONCURRENTLY web_dashboard.chains;
--
-- Validación:
--   SELECT chain_id, name, statistics_agent_last_30_days, agent_stats_information
--   FROM web_dashboard.chains ORDER BY name;
--
--   SELECT chain_id,
--          agent_stats_information->>'total_agents' AS mv_total,
--          legacy.agent_stats_information->>'total_agents' AS legacy_total
--   FROM web_dashboard.chains mv
--   JOIN web_dashboard.chains_table_legacy legacy USING (chain_id)
--   LIMIT 5;
--
--   SELECT chain_id,
--          agent_stats_information ? 'pct_high_humi' AS has_pct_high_humi,
--          on_chain_stats_information ? 'total_protocol_activity_30d' AS has_protocol_30d
--   FROM web_dashboard.chains;
--   -- ambos deben ser false

DROP MATERIALIZED VIEW IF EXISTS web_dashboard.chains;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'web_dashboard'
          AND c.relname = 'chains'
          AND c.relkind = 'r'
    ) THEN
        ALTER TABLE web_dashboard.chains RENAME TO chains_table_legacy;
    END IF;
END $$;

CREATE MATERIALIZED VIEW web_dashboard.chains AS
SELECT
    c.chain_id::text AS chain_id,
    c.name,
    COALESCE(c.short_name, '') AS short_name,
    COALESCE(c.explorer_url, '') AS explorer_url,
    c.logo_file_name,

    jsonb_build_object(
        'total_agents', COALESCE(tr.agent_total_last_day, 0),
        'active_agents', COALESCE(tr.agent_active_last_day, 0),
        'pct_active', ROUND(
            100.0 * COALESCE(tr.agent_active_last_day, 0)
            / NULLIF(COALESCE(tr.agent_total_last_day, 0), 0),
            2
        ),
        'new_agents_30d', COALESCE(tr.agent_new_last_30_days, 0),
        'pct_with_wallet_activity', ROUND(
            100.0 * COALESCE(wa.agents_with_recent_wallet_activity, 0)
            / NULLIF(COALESCE(tr.agent_total_last_day, 0), 0),
            2
        ),
        'pct_with_onchain_activity', ROUND(
            100.0 * COALESCE(oc.agents_with_on_chain_activity_last_30_days, 0)
            / NULLIF(COALESCE(tr.agent_total_last_day, 0), 0),
            2
        )
    ) AS statistics_agent_last_30_days,

    COALESCE(tr12.monthly_tracking, '[]'::jsonb) AS statistics_agent_monthly,

    h.avg_humi_score,
    COALESCE(h.humi_distribution, '{}'::jsonb) AS humi_distribution,
    h.pillars_avg AS pillars_score_distribution,
    COALESCE(meta.metadata_category_distribution, '{}'::jsonb) AS metadata_distribution,

    jsonb_build_object(
        'total_agents', COALESCE(st.agent_total, 0),
        'active_agents', COALESCE(st.agent_active, 0),
        'agents_with_feedback', COALESCE(st.agents_with_feedback, 0)
    ) AS agent_stats_information,

    jsonb_build_object(
        'total_owners', COALESCE(st.owner_total, 0),
        'avg_agents_per_owner', ROUND(
            COALESCE(st.agent_total, 0)::numeric / NULLIF(COALESCE(st.owner_total, 0), 0),
            2
        )
    ) AS owner_stats_information,

    jsonb_build_object(
        'total_executions_30d', COALESCE(oc.total_on_chain_activities_last_30_days, 0),
        'total_with_payments_30d', COALESCE(oc.total_paid_protocol_activities_last_30_days, 0)
    ) AS on_chain_stats_information,

    jsonb_build_object(
        'agents_with_x402_support', COALESCE(sv.agents_with_x402_support, 0),
        'agents_with_mcp_support', COALESCE(sv.agents_with_mcp_support, 0),
        'agents_with_a2a_support', COALESCE(sv.agents_with_a2a_support, 0)
    ) AS technical_data_information,

    jsonb_build_object(
        'duplication_metadata', COALESCE(wr.duplication_metadata_count, 0),
        'multi_agent_wallet', COALESCE(wr.multi_agent_wallet_count, 0),
        'dummy_metadata', COALESCE(wr.dummy_metadata_count, 0),
        'attestations_spam', COALESCE(wr.attestations_spam_count, 0),
        'external_audit_warning', COALESCE(wr.external_audit_warning_count, 0),
        'high_revocations', COALESCE(wr.high_revocations_count, 0),
        'owner_inactive_agents', COALESCE(wr.owner_inactive_agents_count, 0),
        'high_ownership_churn', COALESCE(wr.high_ownership_churn_count, 0),
        'transactional_wallet_same_as_owner', COALESCE(wr.transactional_same_as_owner_count, 0),
        'lower_realness', COALESCE(wr.lower_realness_count, 0),
        'lower_metadata_richness', COALESCE(wr.lower_metadata_richness_count, 0)
    ) AS warning_stats_information,

    jsonb_build_object(
        'agents_with_external_audit', COALESCE(aud.agents_with_external_audit, 0),
        'total_external_audit_valid_count', COALESCE(aud.total_external_audit_valid_count, 0),
        'avg_external_audit_score', aud.avg_external_audit_score
    ) AS external_audits_information,

    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'agent_id', (elem->>'agent_id')::bigint,
                'name', COALESCE(elem->>'name', 'Unnamed Agent'),
                'humi_score', ROUND((elem->>'index_humi_score')::numeric, 2)
            )
            ORDER BY (elem->>'index_humi_score')::numeric DESC NULLS LAST
        )
        FROM jsonb_array_elements(COALESCE(h.top_10_agents, '[]'::jsonb)) AS elem
    ), '[]'::jsonb) AS best_10_agents_humi,

    COALESCE(
        wi.wami_distribution,
        jsonb_build_object(
            'Unstable', 0,
            'Developing', 0,
            'Stable', 0,
            'Very Stable', 0,
            'Elite', 0
        )
    ) AS wami_distribution,

    wi.pillars_avg AS wami_pillars_score_distribution,

    GREATEST(
        st.calculated_at,
        tr.calculated_at,
        tr12.calculated_at,
        wa.calculated_at,
        oc.calculated_at,
        meta.calculated_at,
        sv.calculated_at,
        wr.calculated_at,
        aud.calculated_at,
        h.calculated_at,
        wi.calculated_at
    ) AS updated_at

FROM erc_8004.chains c
LEFT JOIN erc_8004.chain_summary_stats st ON st.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_tracking_last_30_days tr ON tr.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_tracking_last12_months tr12 ON tr12.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_wallet_activity_last_30_days wa ON wa.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_on_chain_activity_last_30_days oc ON oc.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_metadata_category meta ON meta.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_agent_services sv ON sv.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_warnings wr ON wr.chain_id = c.id
LEFT JOIN erc_8004.chain_summary_agent_audits aud ON aud.chain_id = c.id
LEFT JOIN index_humi.chain_summary_humi_index h ON h.chain_id = c.id
LEFT JOIN index_wami.chain_summary_wami_index wi ON wi.chain_id = c.id
WHERE c.is_active = true;

CREATE UNIQUE INDEX idx_web_dashboard_chains_chain_id
    ON web_dashboard.chains (chain_id);

GRANT SELECT ON TABLE web_dashboard.chains TO anon;
GRANT SELECT ON TABLE web_dashboard.chains TO authenticated;
GRANT SELECT ON TABLE web_dashboard.chains TO service_role;
