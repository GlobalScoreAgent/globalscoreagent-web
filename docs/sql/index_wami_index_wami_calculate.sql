-- Optimizado: sin ::DATE; final_score en CTE intermedia (evita repetir suma 4x).
-- Test: EXPLAIN ANALYZE SELECT index_wami.index_wami_calculate(10);

CREATE OR REPLACE FUNCTION index_wami.index_wami_calculate(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO index_wami, erc_8004, public
AS $$
DECLARE
    v_processed integer := 0;
BEGIN
    CREATE TEMP TABLE temp_wami_calc AS
    WITH wallets_to_process AS (
        SELECT wtd.wallet_id, wtd.chain_id
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN index_wami.index_wami iw
               ON wtd.wallet_id = iw.wallet_id AND wtd.chain_id = iw.chain_id
        WHERE iw.wallet_id IS NULL OR iw.calculated_at < CURRENT_DATE::timestamptz
        ORDER BY iw.calculated_at ASC NULLS FIRST
        LIMIT p_limit
    ),
    pillars AS (
        SELECT
            wtp.wallet_id,
            wtp.chain_id,
            po.pillar_score AS origins_score,
            jsonb_build_object(
                'block_basic_score', po.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'First Funds Quality', 'points', po.first_funds_quality_score, 'reason', po.first_funds_quality_reason),
                    jsonb_build_object('name', 'Mixing Risk', 'points', po.mixing_risk_score, 'reason', po.mixing_risk_reason)
                ),
                'block_intermediate_score', po.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Low CEX Reliance', 'points', po.low_cex_reliance_score, 'reason', po.low_cex_reliance_reason),
                    jsonb_build_object('name', 'Funding Diversity', 'points', po.funding_diversity_score, 'reason', po.funding_diversity_reason)
                ),
                'block_advanced_score', po.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'Low Inflow Concentration', 'points', po.low_inflow_concentration_score, 'reason', po.low_inflow_concentration_reason),
                    jsonb_build_object('name', 'Minimal Mixing Risk', 'points', po.minimal_mixing_risk_score, 'reason', po.minimal_mixing_risk_reason)
                ),
                'summary', po.pillar_summary
            ) AS origins_reason,
            pq.pillar_score AS quality_score,
            jsonb_build_object(
                'block_basic_score', pq.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Total Value Health', 'points', pq.total_value_health_score, 'reason', pq.total_value_health_reason),
                    jsonb_build_object('name', 'Liquid Assets Ratio', 'points', pq.liquid_assets_ratio_score, 'reason', pq.liquid_assets_ratio_reason)
                ),
                'block_intermediate_score', pq.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Token Diversification', 'points', pq.token_diversification_score, 'reason', pq.token_diversification_reason),
                    jsonb_build_object('name', 'Stable & Verified Assets', 'points', pq.stable_verified_assets_score, 'reason', pq.stable_verified_assets_reason)
                ),
                'block_advanced_score', pq.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'Low Risk Holdings', 'points', pq.low_risk_holdings_score, 'reason', pq.low_risk_holdings_reason),
                    jsonb_build_object('name', 'Sophisticated Composition', 'points', pq.sophisticated_composition_score, 'reason', pq.sophisticated_composition_reason)
                ),
                'summary', pq.pillar_summary
            ) AS quality_reason,
            pab.pillar_score AS activity_score,
            jsonb_build_object(
                'block_basic_score', pab.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Inflow / Outflow Balance', 'points', pab.inflow_outflow_balance_score, 'reason', pab.inflow_outflow_balance_reason),
                    jsonb_build_object('name', 'Unique Counterparties', 'points', pab.unique_counterparties_score, 'reason', pab.unique_counterparties_reason)
                ),
                'block_intermediate_score', pab.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Low Wash Trading', 'points', pab.low_wash_trading_score, 'reason', pab.low_wash_trading_reason),
                    jsonb_build_object('name', 'Low Suspicious Patterns', 'points', pab.low_suspicious_patterns_score, 'reason', pab.low_suspicious_patterns_reason)
                ),
                'block_advanced_score', pab.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'Low CEX Interaction', 'points', pab.low_cex_interaction_score, 'reason', pab.low_cex_interaction_reason),
                    jsonb_build_object('name', 'Healthy Interaction Ratio', 'points', pab.healthy_interaction_ratio_score, 'reason', pab.healthy_interaction_ratio_reason)
                ),
                'summary', pab.pillar_summary
            ) AS activity_reason,
            pmc.pillar_score AS maturity_score,
            jsonb_build_object(
                'block_basic_score', pmc.block_basic_score,
                'block_basic_items', jsonb_build_array(
                    jsonb_build_object('name', 'Activity Span Age', 'points', pmc.activity_span_age_score, 'reason', pmc.activity_span_age_reason),
                    jsonb_build_object('name', 'Multi Chain Presence', 'points', pmc.multi_chain_presence_score, 'reason', pmc.multi_chain_presence_reason)
                ),
                'block_intermediate_score', pmc.block_intermediate_score,
                'block_intermediate_items', jsonb_build_array(
                    jsonb_build_object('name', 'Cross Chain Balance', 'points', pmc.cross_chain_balance_score, 'reason', pmc.cross_chain_balance_reason),
                    jsonb_build_object('name', 'Sustained Engagement', 'points', pmc.sustained_engagement_score, 'reason', pmc.sustained_engagement_reason)
                ),
                'block_advanced_score', pmc.block_advanced_score,
                'block_advanced_items', jsonb_build_array(
                    jsonb_build_object('name', 'High Active Chains', 'points', pmc.high_active_chains_score, 'reason', pmc.high_active_chains_reason),
                    jsonb_build_object('name', 'Cross Chain Consistency', 'points', pmc.cross_chain_consistency_score, 'reason', pmc.cross_chain_consistency_reason)
                ),
                'summary', pmc.pillar_summary
            ) AS maturity_reason,
            iw.calculated_at AS old_calculated_at,
            iw.pillar_origins_legitimacy_score,
            iw.pillar_origins_legitimacy_reason,
            iw.pillar_portfolio_quality_score,
            iw.pillar_portfolio_quality_reason,
            iw.pillar_activity_behavior_score,
            iw.pillar_activity_behavior_reason,
            iw.pillar_multi_chain_presence_maturity_score,
            iw.pillar_multi_chain_presence_maturity_reason,
            iw.index_wami_score,
            iw.version
        FROM wallets_to_process wtp
        LEFT JOIN index_wami.index_wami iw ON wtp.wallet_id = iw.wallet_id AND wtp.chain_id = iw.chain_id
        LEFT JOIN index_wami.pillar_origins_legitimacy po ON wtp.wallet_id = po.wallet_id AND wtp.chain_id = po.chain_id
        LEFT JOIN index_wami.pillar_quality pq ON wtp.wallet_id = pq.wallet_id AND wtp.chain_id = pq.chain_id
        LEFT JOIN index_wami.pillar_activity_behavior pab ON wtp.wallet_id = pab.wallet_id AND wtp.chain_id = pab.chain_id
        LEFT JOIN index_wami.pillar_multi_chain_presence_maturity pmc ON wtp.wallet_id = pmc.wallet_id AND wtp.chain_id = pmc.chain_id
    ),
    scored AS (
        SELECT
            p.*,
            COALESCE(p.origins_score, 0) + COALESCE(p.quality_score, 0)
                + COALESCE(p.activity_score, 0) + COALESCE(p.maturity_score, 0) AS final_score
        FROM pillars p
    )
    SELECT
        s.wallet_id,
        s.chain_id,
        s.version,
        COALESCE(s.origins_score, 0) AS origins_score,
        COALESCE(s.origins_reason, '{}') AS origins_reason,
        COALESCE(s.quality_score, 0) AS quality_score,
        COALESCE(s.quality_reason, '{}') AS quality_reason,
        COALESCE(s.activity_score, 0) AS activity_score,
        COALESCE(s.activity_reason, '{}') AS activity_reason,
        COALESCE(s.maturity_score, 0) AS maturity_score,
        COALESCE(s.maturity_reason, '{}') AS maturity_reason,
        s.final_score,
        CASE
            WHEN s.final_score >= 90 THEN 'Elite'
            WHEN s.final_score >= 80 THEN 'Very Stable'
            WHEN s.final_score >= 65 THEN 'Stable'
            WHEN s.final_score >= 50 THEN 'Developing'
            ELSE 'Unstable'
        END AS maturity_level,
        (
            SELECT jsonb_agg(elem ORDER BY (elem->>'date')::date DESC)
            FROM (
                SELECT elem
                FROM jsonb_array_elements(COALESCE(it.wami_score_last_30_days, '[]'::jsonb)) elem
                WHERE elem->>'date' != CURRENT_DATE::text
                UNION ALL
                SELECT jsonb_build_object(
                    'date', COALESCE(s.old_calculated_at, NOW()),
                    'pillar_origins_legitimacy_score', s.pillar_origins_legitimacy_score,
                    'pillar_origins_legitimacy_reason', s.pillar_origins_legitimacy_reason,
                    'pillar_portfolio_quality_score', s.pillar_portfolio_quality_score,
                    'pillar_portfolio_quality_reason', s.pillar_portfolio_quality_reason,
                    'pillar_activity_behavior_score', s.pillar_activity_behavior_score,
                    'pillar_activity_behavior_reason', s.pillar_activity_behavior_reason,
                    'pillar_multi_chain_presence_maturity_score', s.pillar_multi_chain_presence_maturity_score,
                    'pillar_multi_chain_presence_maturity_reason', s.pillar_multi_chain_presence_maturity_reason,
                    'index_wami_score', s.index_wami_score
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
                     FROM jsonb_array_elements(COALESCE(it.wami_score_tracking, '[]'::jsonb)) elem
                     WHERE elem->>'date' != (SELECT month_str FROM current_month)),
                    '[]'::jsonb
                ) || jsonb_build_array(
                    jsonb_build_object(
                        'date', (SELECT month_str FROM current_month),
                        'index_wami_score', COALESCE(s.index_wami_score, 0)
                    )
                )
        ) AS new_monthly_tracking
    FROM scored s
    LEFT JOIN index_wami.index_wami_tracking it ON it.wallet_id = s.wallet_id AND it.chain_id = s.chain_id;

    INSERT INTO index_wami.index_wami (
        wallet_id, chain_id,
        pillar_origins_legitimacy_score, pillar_origins_legitimacy_reason,
        pillar_portfolio_quality_score, pillar_portfolio_quality_reason,
        pillar_activity_behavior_score, pillar_activity_behavior_reason,
        pillar_multi_chain_presence_maturity_score, pillar_multi_chain_presence_maturity_reason,
        index_wami_score, madutiry_level, calculated_at, version,
        change_reason, calculated_by
    )
    SELECT
        wallet_id, chain_id,
        origins_score, origins_reason,
        quality_score, quality_reason,
        activity_score, activity_reason,
        maturity_score, maturity_reason,
        final_score, maturity_level,
        NOW(), COALESCE(version, 0) + 1,
        'full_index_calculation', 'system'
    FROM temp_wami_calc
    ON CONFLICT (wallet_id, chain_id) DO UPDATE SET
        pillar_origins_legitimacy_score = EXCLUDED.pillar_origins_legitimacy_score,
        pillar_origins_legitimacy_reason = EXCLUDED.pillar_origins_legitimacy_reason,
        pillar_portfolio_quality_score = EXCLUDED.pillar_portfolio_quality_score,
        pillar_portfolio_quality_reason = EXCLUDED.pillar_portfolio_quality_reason,
        pillar_activity_behavior_score = EXCLUDED.pillar_activity_behavior_score,
        pillar_activity_behavior_reason = EXCLUDED.pillar_activity_behavior_reason,
        pillar_multi_chain_presence_maturity_score = EXCLUDED.pillar_multi_chain_presence_maturity_score,
        pillar_multi_chain_presence_maturity_reason = EXCLUDED.pillar_multi_chain_presence_maturity_reason,
        index_wami_score = EXCLUDED.index_wami_score,
        madutiry_level = EXCLUDED.madutiry_level,
        calculated_at = NOW(),
        version = EXCLUDED.version,
        change_reason = EXCLUDED.change_reason,
        calculated_by = EXCLUDED.calculated_by;

    INSERT INTO index_wami.index_wami_tracking (wallet_id, chain_id)
    SELECT wallet_id, chain_id FROM temp_wami_calc
    ON CONFLICT (wallet_id, chain_id) DO NOTHING;

    UPDATE index_wami.index_wami_tracking it
    SET
        wami_score_last_30_days = t.new_last_30_days,
        wami_score_tracking = t.new_monthly_tracking
    FROM temp_wami_calc t
    WHERE it.wallet_id = t.wallet_id AND it.chain_id = t.chain_id;

    GET DIAGNOSTICS v_processed = ROW_COUNT;
    DROP TABLE IF EXISTS temp_wami_calc;
    RETURN v_processed;
END;
$$;
