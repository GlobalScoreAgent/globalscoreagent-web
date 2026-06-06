-- MV web_dashboard.global_stadistics: reemplaza web_dashboard.web_dashboard_general_stadistics_calculate()
-- leyendo MVs upstream (sin tablas base salvo agent_feedback_entities).
--
-- Prerrequisito REFRESH (orden):
--   REFRESH MATERIALIZED VIEW erc_8004.chain_summary_stats;
--   REFRESH MATERIALIZED VIEW erc_8004.erc_8004_summary_stadistics;
--   REFRESH MATERIALIZED VIEW erc_8004.erc_8004_summary_wallets;
--   REFRESH MATERIALIZED VIEW erc_8004.erc_8004_summary_nonce;
--   REFRESH MATERIALIZED VIEW erc_8004.erc_8004_summary_metadata_richness;
--   REFRESH MATERIALIZED VIEW index_humi.summary_humi_index;
--   REFRESH MATERIALIZED VIEW index_wami.summary_wami_index;
--   REFRESH MATERIALIZED VIEW CONCURRENTLY web_dashboard.global_stadistics;
--
-- Validación:
--   SELECT total_agents, top_10_agents, agent_nonce->0 AS primer_nonce FROM web_dashboard.global_stadistics;
--   -- agent_nonce[*] debe tener "date" y "total_nonce"
-- Comparar con: SELECT * FROM web_dashboard.main_stadistics ORDER BY calculated_at DESC LIMIT 1;

DROP MATERIALIZED VIEW IF EXISTS web_dashboard.main_stadistics_mv;
DROP MATERIALIZED VIEW IF EXISTS web_dashboard.global_stadistics;

CREATE MATERIALIZED VIEW web_dashboard.global_stadistics AS
SELECT
    COALESCE((
        SELECT s.agent_total::integer
        FROM erc_8004.erc_8004_summary_stadistics s
        ORDER BY s.stats_at DESC NULLS LAST
        LIMIT 1
    ), 0) AS total_agents,

    COALESCE((
        SELECT s.agent_active::integer
        FROM erc_8004.erc_8004_summary_stadistics s
        ORDER BY s.stats_at DESC NULLS LAST
        LIMIT 1
    ), 0) AS total_agents_active,

    COALESCE((
        SELECT s.agents_with_feedback::integer
        FROM erc_8004.erc_8004_summary_stadistics s
        ORDER BY s.stats_at DESC NULLS LAST
        LIMIT 1
    ), 0) AS total_agents_with_feedbacks,

    COALESCE((
        SELECT w.total_wallets::integer
        FROM erc_8004.erc_8004_summary_wallets w
        ORDER BY w.calculated_at DESC NULLS LAST
        LIMIT 1
    ), 0) AS wallet_monitored,

    COALESCE((
        SELECT COUNT(*)::integer
        FROM erc_8004.agent_feedback_entities
    ), 0) AS feedback_entities,

    COALESCE((
        SELECT (
            SELECT jsonb_build_object(
                'Unstable', COALESCE(
                    (h.humi_distribution->'Unstable'->>'count')::int,
                    (h.humi_distribution->>'Unstable')::int,
                    0
                ),
                'Developing', COALESCE(
                    (h.humi_distribution->'Developing'->>'count')::int,
                    (h.humi_distribution->>'Developing')::int,
                    0
                ),
                'Stable', COALESCE(
                    (h.humi_distribution->'Stable'->>'count')::int,
                    (h.humi_distribution->>'Stable')::int,
                    0
                ),
                'Very Stable', COALESCE(
                    (h.humi_distribution->'Very Stable'->>'count')::int,
                    (h.humi_distribution->>'Very Stable')::int,
                    0
                ),
                'Elite', COALESCE(
                    (h.humi_distribution->'Elite'->>'count')::int,
                    (h.humi_distribution->>'Elite')::int,
                    0
                )
            )
        )
        FROM index_humi.summary_humi_index h
        ORDER BY h.calculated_at DESC NULLS LAST
        LIMIT 1
    ), '{}'::jsonb) AS humi_index_distribution,

    COALESCE((
        SELECT h.top_10_agents
        FROM index_humi.summary_humi_index h
        ORDER BY h.calculated_at DESC NULLS LAST
        LIMIT 1
    ), '[]'::jsonb) AS top_10_agents,

    COALESCE((
        SELECT (
            SELECT jsonb_build_object(
                'Unstable', COALESCE(
                    (w.wami_distribution->'Unstable'->>'count')::int,
                    (w.wami_distribution->>'Unstable')::int,
                    0
                ),
                'Developing', COALESCE(
                    (w.wami_distribution->'Developing'->>'count')::int,
                    (w.wami_distribution->>'Developing')::int,
                    0
                ),
                'Stable', COALESCE(
                    (w.wami_distribution->'Stable'->>'count')::int,
                    (w.wami_distribution->>'Stable')::int,
                    0
                ),
                'Very Stable', COALESCE(
                    (w.wami_distribution->'Very Stable'->>'count')::int,
                    (w.wami_distribution->>'Very Stable')::int,
                    0
                ),
                'Elite', COALESCE(
                    (w.wami_distribution->'Elite'->>'count')::int,
                    (w.wami_distribution->>'Elite')::int,
                    0
                )
            )
        )
        FROM index_wami.summary_wami_index w
        ORDER BY w.calculated_at DESC NULLS LAST
        LIMIT 1
    ), '{}'::jsonb) AS wami_index_distribution,

    COALESCE((
        SELECT n.nonce_last_30_days
        FROM erc_8004.erc_8004_summary_nonce n
        ORDER BY n.calculated_at DESC NULLS LAST
        LIMIT 1
    ), '[]'::jsonb) AS agent_nonce,

    COALESCE((
        SELECT jsonb_object_agg(
            COALESCE(m.metadata_category, 'Unknown'),
            m.total_agents
        )
        FROM erc_8004.erc_8004_summary_metadata_richness m
    ), '{}'::jsonb) AS agent_metadata_richness,

    COALESCE((
        SELECT jsonb_agg(
            jsonb_build_object(
                'chain_id', c.chain_id,
                'name', css.chain_name,
                'owner_total', css.owner_total,
                'agent_total', css.agent_total,
                'agent_active', css.agent_active,
                'agent_with_feedback', css.agents_with_feedback
            )
            ORDER BY c.chain_id
        )
        FROM erc_8004.chain_summary_stats css
        JOIN erc_8004.chains c ON c.id = css.chain_id
        WHERE c.is_active = true
    ), '[]'::jsonb) AS chain_stats,

    now() AS calculated_at;

CREATE UNIQUE INDEX idx_global_stadistics_calculated_at
    ON web_dashboard.global_stadistics (calculated_at);

GRANT SELECT ON TABLE web_dashboard.global_stadistics TO anon;
GRANT SELECT ON TABLE web_dashboard.global_stadistics TO authenticated;
GRANT SELECT ON TABLE web_dashboard.global_stadistics TO service_role;
