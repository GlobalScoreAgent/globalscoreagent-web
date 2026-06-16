-- Optimizado: PERCENT_RANK sobre cohorte completa; chain_id via agregación previa; sin ::DATE.
-- Test: SELECT index_wami.wallet_cohort_percentiles_refresh(50);

CREATE OR REPLACE FUNCTION index_wami.wallet_cohort_percentiles_refresh(p_limit integer DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processed bigint := 0;
    v_start timestamptz := now();
BEGIN
    RAISE NOTICE '=== Wallet Cohort Percentiles Refresh === Iniciando cálculo incremental';

    WITH wallets_to_process AS (
        SELECT w.id AS wallet_id
        FROM erc_8004.wallets w
        LEFT JOIN (
            SELECT wallet_id, MAX(calculated_at) AS last_calculated
            FROM index_wami.wallet_cohort_percentiles
            GROUP BY wallet_id
        ) p ON w.id = p.wallet_id
        WHERE w.agent_transactional_count > 0
          AND (p.wallet_id IS NULL OR p.last_calculated < CURRENT_DATE::timestamptz)
        ORDER BY p.last_calculated ASC NULLS FIRST
        LIMIT p_limit
    ),
    wallet_chain AS (
        SELECT
            wr.wallet_id,
            COALESCE(
                wc.chain_id,
                pp.min_chain_id,
                pr.min_chain_id,
                0
            ) AS chain_id
        FROM wallets_to_process wr
        LEFT JOIN walcert.wallet_cross_chain wc ON wr.wallet_id = wc.wallet_id
        LEFT JOIN (
            SELECT wallet_id, MIN(chain_id) AS min_chain_id
            FROM walcert.wallet_portafolio
            GROUP BY wallet_id
        ) pp ON wr.wallet_id = pp.wallet_id
        LEFT JOIN (
            SELECT wallet_id, MIN(chain_id) AS min_chain_id
            FROM walcert.wallet_recent_flows
            GROUP BY wallet_id
        ) pr ON wr.wallet_id = pr.wallet_id
    ),
    affected_cohorts AS (
        SELECT DISTINCT
            CASE
                WHEN COALESCE(wc2.activity_span_days, 0) < 8 THEN 'new'
                WHEN COALESCE(wc2.activity_span_days, 0) < 31 THEN 'young'
                WHEN COALESCE(wc2.activity_span_days, 0) < 91 THEN 'growing'
                WHEN COALESCE(wc2.activity_span_days, 0) < 366 THEN 'mature'
                ELSE 'established'
            END AS age_bucket,
            COALESCE(c.subdomain_cex, 'other') AS main_chain_slug
        FROM wallets_to_process wtp
        JOIN wallet_chain wch ON wch.wallet_id = wtp.wallet_id
        LEFT JOIN walcert.wallet_cross_chain wc2 ON wtp.wallet_id = wc2.wallet_id
        LEFT JOIN erc_8004.chains c ON wch.chain_id = c.id
    ),
    cohort_wallets AS (
        SELECT w.id AS wallet_id
        FROM erc_8004.wallets w
        INNER JOIN walcert.wallet_cross_chain wc ON w.id = wc.wallet_id
        INNER JOIN erc_8004.chains c ON wc.chain_id = c.id
        INNER JOIN affected_cohorts ac ON ac.main_chain_slug = COALESCE(c.subdomain_cex, 'other')
            AND ac.age_bucket = CASE
                WHEN COALESCE(wc.activity_span_days, 0) < 8 THEN 'new'
                WHEN COALESCE(wc.activity_span_days, 0) < 31 THEN 'young'
                WHEN COALESCE(wc.activity_span_days, 0) < 91 THEN 'growing'
                WHEN COALESCE(wc.activity_span_days, 0) < 366 THEN 'mature'
                ELSE 'established'
            END
        WHERE w.agent_transactional_count > 0
    ),
    wallet_data AS (
        SELECT
            cw.wallet_id,
            COALESCE(wc.chain_id, 0) AS chain_id,
            CASE
                WHEN COALESCE(wc.activity_span_days, 0) < 8 THEN 'new'
                WHEN COALESCE(wc.activity_span_days, 0) < 31 THEN 'young'
                WHEN COALESCE(wc.activity_span_days, 0) < 91 THEN 'growing'
                WHEN COALESCE(wc.activity_span_days, 0) < 366 THEN 'mature'
                ELSE 'established'
            END AS age_bucket,
            COALESCE(c.subdomain_cex, 'other') AS main_chain_slug,
            f.suspected_mixing_score,
            f.inflow_diversity_ratio,
            p.total_portfolio_value_usd,
            p.liquid_ratio_pct,
            r.unique_tokens AS unique_tokens_count,
            r.wash_trading_score,
            r.unique_counterparties,
            r.healthy_interaction_ratio,
            wc.activity_span_days,
            wc.number_of_active_chains
        FROM cohort_wallets cw
        LEFT JOIN walcert.wallet_cross_chain wc ON cw.wallet_id = wc.wallet_id
        LEFT JOIN erc_8004.chains c ON wc.chain_id = c.id
        LEFT JOIN walcert.wallet_fund_origins f
               ON cw.wallet_id = f.wallet_id AND f.chain_id = wc.chain_id
        LEFT JOIN walcert.wallet_portafolio p
               ON cw.wallet_id = p.wallet_id AND p.chain_id = wc.chain_id
        LEFT JOIN walcert.wallet_recent_flows r
               ON cw.wallet_id = r.wallet_id AND r.chain_id = wc.chain_id
    ),
    metrics AS (
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'suspected_mixing_score' AS metric_name, suspected_mixing_score AS raw_value
        FROM wallet_data WHERE suspected_mixing_score IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'inflow_diversity_ratio', inflow_diversity_ratio FROM wallet_data WHERE inflow_diversity_ratio IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'total_portfolio_value_usd', total_portfolio_value_usd FROM wallet_data WHERE total_portfolio_value_usd IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'liquid_ratio_pct', liquid_ratio_pct FROM wallet_data WHERE liquid_ratio_pct IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'unique_tokens_count', unique_tokens_count FROM wallet_data WHERE unique_tokens_count IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'wash_trading_score', wash_trading_score FROM wallet_data WHERE wash_trading_score IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'unique_counterparties', unique_counterparties FROM wallet_data WHERE unique_counterparties IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'healthy_interaction_ratio', healthy_interaction_ratio FROM wallet_data WHERE healthy_interaction_ratio IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'activity_span_days', activity_span_days FROM wallet_data WHERE activity_span_days IS NOT NULL
        UNION ALL
        SELECT wallet_id, chain_id, age_bucket, main_chain_slug, 'number_of_active_chains', number_of_active_chains FROM wallet_data WHERE number_of_active_chains IS NOT NULL
    ),
    percentiles AS (
        SELECT
            m.wallet_id,
            m.chain_id,
            m.age_bucket,
            m.main_chain_slug,
            m.metric_name,
            m.raw_value,
            PERCENT_RANK() OVER (
                PARTITION BY m.age_bucket, m.main_chain_slug, m.metric_name
                ORDER BY m.raw_value
            ) * 100 AS percentile
        FROM metrics m
    ),
    to_upsert AS (
        SELECT p.*
        FROM percentiles p
        INNER JOIN wallets_to_process wtp ON wtp.wallet_id = p.wallet_id
    )
    INSERT INTO index_wami.wallet_cohort_percentiles (
        wallet_id, chain_id, age_bucket, main_chain_slug,
        metric_name, raw_value, percentile,
        calculated_at, version, calculated_by
    )
    SELECT
        wallet_id, chain_id, age_bucket, main_chain_slug,
        metric_name, raw_value, percentile,
        now(), 1, 'system'
    FROM to_upsert
    ON CONFLICT (wallet_id, metric_name, age_bucket, main_chain_slug) DO UPDATE SET
        raw_value = EXCLUDED.raw_value,
        percentile = EXCLUDED.percentile,
        calculated_at = EXCLUDED.calculated_at,
        version = index_wami.wallet_cohort_percentiles.version + 1,
        calculated_by = 'system';

    GET DIAGNOSTICS v_processed = ROW_COUNT;

    RAISE NOTICE '=== Wallet Cohort Percentiles Refresh === Finalizado: % registros en %',
        v_processed, (now() - v_start);

    RETURN format('WALLET_COHORT_PERCENTILES_REFRESH → %s registros actualizados', v_processed);
END;
$$;
