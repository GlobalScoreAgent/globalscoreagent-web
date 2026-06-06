-- MV web_page.global_score_agent_summary: reemplaza web_page.calculate_statistics() leyendo solo MVs upstream.
-- Prerrequisito: REFRESH de erc_8004_summary_stadistics, erc_8004_summary_wallets,
--   index_humi.summary_humi_index, index_wami.summary_wami_index.
-- HUMI/WAMI: lee agent_analysed, avg_top_100_score, best_agent, humi_distribution / wami_distribution.
-- Si summary_*_index expone maturity_distribution, total_agents_analysed, avg_top_100, best_agent_name/score,
-- sustituir los campos equivalentes en humi_page_kpi por lectura directa de esas columnas.
--
-- Refresh (orden):
--   REFRESH MATERIALIZED VIEW erc_8004.erc_8004_summary_stadistics;
--   REFRESH MATERIALIZED VIEW erc_8004.erc_8004_summary_wallets;
--   REFRESH MATERIALIZED VIEW index_humi.summary_humi_index;
--   REFRESH MATERIALIZED VIEW index_wami.summary_wami_index;
--   REFRESH MATERIALIZED VIEW CONCURRENTLY web_page.global_score_agent_summary;
--
-- Validación:
--   SELECT main_page_kpi, humi_page_kpi, wami_page_kpi FROM web_page.global_score_agent_summary;
--
-- Test: comparar humi_page_kpi / wami_page_kpi con la última fila de web_page.web_page_statistics.

DROP MATERIALIZED VIEW IF EXISTS web_page.global_score_agent_summary;

CREATE MATERIALIZED VIEW web_page.global_score_agent_summary AS
SELECT
    jsonb_build_object(
        'active_chains', COALESCE((
            SELECT array_agg(c.short_name ORDER BY c.short_name)
            FROM erc_8004.chains c
            WHERE c.is_active = true
        ), ARRAY[]::text[]),
        'global_totals', (
            SELECT jsonb_build_object(
                'owner_total', s.owner_total,
                'agent_total', s.agent_total,
                'agent_active', s.agent_active,
                'agent_with_feedback', s.agents_with_feedback,
                'feedback_total', s.feedback_total,
                'feedback_new', s.feedback_new,
                'agent_new', s.agent_new
            )
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ),
        'top_new_agents', (
            SELECT jsonb_build_object(
                'chain_name', s.top_new_agents->>'short_name',
                'value', COALESCE((s.top_new_agents->>'value')::numeric, 0)
            )
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ),
        'top_new_feedbacks', (
            SELECT jsonb_build_object(
                'chain_name', s.top_new_feedbacks->>'short_name',
                'value', COALESCE((s.top_new_feedbacks->>'value')::numeric, 0)
            )
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ),
        'top_total_agents', (
            SELECT jsonb_build_object(
                'chain_name', s.top_total_agents->>'short_name',
                'value', COALESCE((s.top_total_agents->>'value')::numeric, 0)
            )
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ),
        'top_total_owners', (
            SELECT jsonb_build_object(
                'chain_name', s.top_total_owners->>'short_name',
                'value', COALESCE((s.top_total_owners->>'value')::numeric, 0)
            )
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ),
        'top_total_feedbacks', (
            SELECT jsonb_build_object(
                'chain_name', s.top_total_feedbacks->>'short_name',
                'value', COALESCE((s.top_total_feedbacks->>'value')::numeric, 0)
            )
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ),
        'last_updated', COALESCE((
            SELECT s.stats_at
            FROM erc_8004.erc_8004_summary_stadistics s
            ORDER BY s.stats_at DESC NULLS LAST
            LIMIT 1
        ), now())
    ) AS main_page_kpi,

    (
        SELECT jsonb_build_object(
            'total_agents_analysed', h.agent_analysed,
            'avg_top_100', h.avg_top_100_score,
            'best_agent', h.best_agent->>'name',
            'best_agent_score', (h.best_agent->>'index_humi_score')::numeric,
            'distribution', (
                SELECT jsonb_object_agg(
                    lvl.level_key,
                    jsonb_build_object(
                        'count', COALESCE((h.humi_distribution->lvl.level_key->>'count')::int, 0),
                        'avg', COALESCE(
                            (h.humi_distribution->lvl.level_key->>'avg')::numeric,
                            (h.humi_distribution->lvl.level_key->>'avg_score')::numeric
                        )
                    )
                )
                FROM (
                    SELECT unnest(ARRAY[
                        'Unstable', 'Developing', 'Stable', 'Very Stable', 'Elite'
                    ]::text[]) AS level_key
                ) lvl
            ),
            'last_updated', h.calculated_at
        )
        FROM index_humi.summary_humi_index h
        ORDER BY h.calculated_at DESC NULLS LAST
        LIMIT 1
    ) AS humi_page_kpi,

    (
        SELECT jsonb_build_object(
            'distribution', (
                SELECT jsonb_object_agg(
                    lvl.level_key,
                    jsonb_build_object(
                        'count', COALESCE((w.wami_distribution->lvl.level_key->>'count')::int, 0),
                        'avg', COALESCE(
                            (w.wami_distribution->lvl.level_key->>'avg')::numeric,
                            (w.wami_distribution->lvl.level_key->>'avg_score')::numeric
                        )
                    )
                )
                FROM (
                    SELECT unnest(ARRAY[
                        'Unstable', 'Developing', 'Stable', 'Very Stable', 'Elite'
                    ]::text[]) AS level_key
                ) lvl
            ),
            'wallet_analysed', wal.total_wallets,
            'nonce_total', wal.total_nonce_current,
            'nonce_delta', wal.total_nonce_delta,
            'wallet_categories', COALESCE(wal.wallet_category_distribution, '{}'::jsonb),
            'wallet_link_agent_valid', COALESCE((wal.status_distribution->>'valid')::numeric, 0),
            'wallet_link_agent_not_valid', COALESCE((wal.status_distribution->>'invalid')::numeric, 0),
            'last_updated', GREATEST(w.calculated_at, wal.calculated_at)
        )
        FROM index_wami.summary_wami_index w
        CROSS JOIN LATERAL (
            SELECT wal_inner.*
            FROM erc_8004.erc_8004_summary_wallets wal_inner
            ORDER BY wal_inner.calculated_at DESC NULLS LAST
            LIMIT 1
        ) wal
        ORDER BY w.calculated_at DESC NULLS LAST
        LIMIT 1
    ) AS wami_page_kpi,

    now() AS calculated_at;

CREATE UNIQUE INDEX idx_global_score_agent_summary_calculated_at
    ON web_page.global_score_agent_summary (calculated_at);

GRANT SELECT ON TABLE web_page.global_score_agent_summary TO anon;
GRANT SELECT ON TABLE web_page.global_score_agent_summary TO authenticated;
GRANT SELECT ON TABLE web_page.global_score_agent_summary TO service_role;
GRANT SELECT ON TABLE web_page.global_score_agent_summary TO authenticator;
