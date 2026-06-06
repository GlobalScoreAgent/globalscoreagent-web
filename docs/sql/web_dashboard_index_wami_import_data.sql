-- 1) temp_wami_agents: pendiente si no hay fila en index_wami o updated_at > 1 día (sin joins erc_8004).
-- 2) temp_wami_base: una lectura registrations/rwtx/iw/iwt solo para ese lote.
-- 3) temp_wami_agent_agg: una agregación → index_wami + agents.
-- Test: SELECT web_dashboard.web_dashboard_index_wami_import_data(5);

CREATE OR REPLACE FUNCTION web_dashboard.web_dashboard_index_wami_import_data(p_limit integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    CREATE TEMP TABLE temp_wami_agents (
        web_agent_id BIGINT NOT NULL,
        agent_id     BIGINT NOT NULL
    ) ON COMMIT DROP;

    INSERT INTO temp_wami_agents (web_agent_id, agent_id)
    SELECT
        wa.id AS web_agent_id,
        wa.agent_id
    FROM web_dashboard.agents wa
    LEFT JOIN web_dashboard.index_wami wdi ON wdi.agent_id = wa.id
    WHERE wdi.agent_id IS NULL
       OR wdi.updated_at < NOW() - INTERVAL '1 day'
    ORDER BY wdi.updated_at ASC NULLS FIRST, wa.id
    LIMIT p_limit;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    IF v_count = 0 THEN
        RETURN 0;
    END IF;

    CREATE TEMP TABLE temp_wami_base (
        agent_id                                   BIGINT NOT NULL,
        web_agent_id                               BIGINT NOT NULL,
        wallet_id                                  BIGINT NOT NULL,
        chain_id                                   INTEGER NOT NULL,
        wallet_address                             TEXT NOT NULL,
        wami_score                                 NUMERIC,
        maturity_level                             TEXT,
        pillar_origins_legitimacy_score            NUMERIC,
        pillar_portfolio_quality_score             NUMERIC,
        pillar_activity_behavior_score             NUMERIC,
        pillar_multi_chain_presence_maturity_score NUMERIC,
        pillar_origins_legitimacy_reason           JSONB,
        pillar_portfolio_quality_reason            JSONB,
        pillar_activity_behavior_reason            JSONB,
        pillar_multi_chain_presence_maturity_reason JSONB,
        wami_score_last_30_days                    JSONB,
        wami_score_tracking                        JSONB,
        pillar_origins_legitimacy_last_30_days     JSONB,
        pillar_portfolio_quality_last_30_days      JSONB,
        pillar_activity_behavior_last_30_days      JSONB,
        pillar_multi_chain_presence_maturity_last_30_days JSONB,
        pillar_origins_legitimacy_tracking         JSONB,
        pillar_portfolio_quality_tracking          JSONB,
        pillar_activity_behavior_tracking          JSONB,
        pillar_multi_chain_presence_maturity_tracking JSONB,
        calculated_at                              TIMESTAMPTZ
    ) ON COMMIT DROP;

    INSERT INTO temp_wami_base
    SELECT
        p.agent_id,
        p.web_agent_id,
        rwtx.wallet_id,
        rwtx.chain_id,
        w.address AS wallet_address,
        iw.index_wami_score,
        iw.madutiry_level AS maturity_level,
        iw.pillar_origins_legitimacy_score,
        iw.pillar_portfolio_quality_score,
        iw.pillar_activity_behavior_score,
        iw.pillar_multi_chain_presence_maturity_score,
        iw.pillar_origins_legitimacy_reason,
        iw.pillar_portfolio_quality_reason,
        iw.pillar_activity_behavior_reason,
        iw.pillar_multi_chain_presence_maturity_reason,
        iwt.wami_score_last_30_days,
        iwt.wami_score_tracking,
        iwt.pillar_origins_legitimacy_score_last_30_days,
        iwt.pillar_portfolio_quality_score_last_30_days,
        iwt.pillar_activity_behavior_score_last_30_days,
        iwt.pillar_multi_chain_presence_maturity_score_last_30_days,
        iwt.pillar_origins_legitimacy_score_tracking,
        iwt.pillar_portfolio_quality_score_tracking,
        iwt.pillar_activity_behavior_score_tracking,
        iwt.pillar_multi_chain_presence_maturity_score_tracking,
        iw.calculated_at
    FROM temp_wami_agents p
    INNER JOIN erc_8004.registrations r ON r.agent_id = p.agent_id
    INNER JOIN erc_8004.registration_wallet_tx rwtx ON rwtx.registration_id = r.id
    INNER JOIN erc_8004.wallets w ON w.id = rwtx.wallet_id
    LEFT JOIN index_wami.index_wami iw
        ON iw.wallet_id = rwtx.wallet_id
       AND iw.chain_id = rwtx.chain_id
    LEFT JOIN index_wami.index_wami_tracking iwt
        ON iwt.wallet_id = rwtx.wallet_id
       AND iwt.chain_id = rwtx.chain_id;

    CREATE TEMP TABLE temp_wami_agent_agg ON COMMIT DROP AS
    SELECT
        web_agent_id,
        ROUND(AVG(wami_score), 2) AS wami_score,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', wami_score_last_30_days))
            FILTER (WHERE wami_score_last_30_days IS NOT NULL) AS wami_score_last_30_days,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', wami_score_tracking))
            FILTER (WHERE wami_score_tracking IS NOT NULL) AS wami_score_tracking,
        ROUND(AVG(pillar_origins_legitimacy_score), 2) AS pillar_origins_legitimacy_score,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'summary', pillar_origins_legitimacy_reason))
            AS pillar_origins_legitimacy_summary,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_origins_legitimacy_last_30_days))
            FILTER (WHERE pillar_origins_legitimacy_last_30_days IS NOT NULL) AS pillar_origins_legitimacy_last_30_days,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_origins_legitimacy_tracking))
            FILTER (WHERE pillar_origins_legitimacy_tracking IS NOT NULL) AS pillar_origins_legitimacy_tracking,
        ROUND(AVG(pillar_portfolio_quality_score), 2) AS pillar_portfolio_quality_score,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'summary', pillar_portfolio_quality_reason))
            AS pillar_portfolio_quality_summary,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_portfolio_quality_last_30_days))
            FILTER (WHERE pillar_portfolio_quality_last_30_days IS NOT NULL) AS pillar_portfolio_quality_last_30_days,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_portfolio_quality_tracking))
            FILTER (WHERE pillar_portfolio_quality_tracking IS NOT NULL) AS pillar_portfolio_quality_tracking,
        ROUND(AVG(pillar_activity_behavior_score), 2) AS pillar_activity_behavior_score,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'summary', pillar_activity_behavior_reason))
            AS pillar_activity_behavior_summary,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_activity_behavior_last_30_days))
            FILTER (WHERE pillar_activity_behavior_last_30_days IS NOT NULL) AS pillar_activity_behavior_last_30_days,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_activity_behavior_tracking))
            FILTER (WHERE pillar_activity_behavior_tracking IS NOT NULL) AS pillar_activity_behavior_tracking,
        ROUND(AVG(pillar_multi_chain_presence_maturity_score), 2) AS pillar_multi_chain_presence_maturity_score,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'summary', pillar_multi_chain_presence_maturity_reason))
            AS pillar_multi_chain_presence_maturity_summary,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_multi_chain_presence_maturity_last_30_days))
            FILTER (WHERE pillar_multi_chain_presence_maturity_last_30_days IS NOT NULL) AS pillar_multi_chain_presence_maturity_last_30_days,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'data', pillar_multi_chain_presence_maturity_tracking))
            FILTER (WHERE pillar_multi_chain_presence_maturity_tracking IS NOT NULL) AS pillar_multi_chain_presence_maturity_tracking,
        MAX(calculated_at) AS wami_score_calculated_at,
        CASE
            WHEN ROUND(AVG(wami_score), 2) >= 90 THEN 'Elite'
            WHEN ROUND(AVG(wami_score), 2) >= 80 THEN 'Very Stable'
            WHEN ROUND(AVG(wami_score), 2) >= 65 THEN 'Stable'
            WHEN ROUND(AVG(wami_score), 2) >= 50 THEN 'Developing'
            ELSE 'Unstable'
        END AS maturity_level,
        jsonb_agg(DISTINCT jsonb_build_object('wallet_address', wallet_address)) AS wallets,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'score', wami_score)) AS wami_score_data,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'score', pillar_origins_legitimacy_score))
            AS pillar_origins_legitimacy_score_data,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'score', pillar_portfolio_quality_score))
            AS pillar_portfolio_quality_score_data,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'score', pillar_activity_behavior_score))
            AS pillar_activity_behavior_score_data,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'score', pillar_multi_chain_presence_maturity_score))
            AS pillar_multi_chain_presence_maturity_score_data,
        jsonb_agg(jsonb_build_object('wallet_address', wallet_address, 'maturity_level', maturity_level))
            AS maturity_level_data
    FROM temp_wami_base
    GROUP BY web_agent_id;

    INSERT INTO web_dashboard.index_wami (
        agent_id,
        wami_score,
        wami_score_last_30_days,
        wami_score_tracking,
        pillar_origins_legitimacy_score,
        pillar_origins_legitimacy_summary,
        pillar_origins_legitimacy_last_30_days,
        pillar_origins_legitimacy_tracking,
        pillar_portfolio_quality_score,
        pillar_portfolio_quality_summary,
        pillar_portfolio_quality_last_30_days,
        pillar_portfolio_quality_tracking,
        pillar_activity_behavior_score,
        pillar_activity_behavior_summary,
        pillar_activity_behavior_last_30_days,
        pillar_activity_behavior_tracking,
        pillar_multi_chain_presence_maturity_score,
        pillar_multi_chain_presence_maturity_summary,
        pillar_multi_chain_presence_maturity_last_30_days,
        pillar_multi_chain_presence_maturity_tracking,
        wami_score_calculated_at,
        maturity_level,
        wallets,
        wami_score_data,
        pillar_origins_legitimacy_score_data,
        pillar_portfolio_quality_score_data,
        pillar_activity_behavior_score_data,
        pillar_multi_chain_presence_maturity_score_data,
        maturity_level_data,
        created_at,
        updated_at
    )
    SELECT
        web_agent_id,
        wami_score,
        wami_score_last_30_days,
        wami_score_tracking,
        pillar_origins_legitimacy_score,
        pillar_origins_legitimacy_summary,
        pillar_origins_legitimacy_last_30_days,
        pillar_origins_legitimacy_tracking,
        pillar_portfolio_quality_score,
        pillar_portfolio_quality_summary,
        pillar_portfolio_quality_last_30_days,
        pillar_portfolio_quality_tracking,
        pillar_activity_behavior_score,
        pillar_activity_behavior_summary,
        pillar_activity_behavior_last_30_days,
        pillar_activity_behavior_tracking,
        pillar_multi_chain_presence_maturity_score,
        pillar_multi_chain_presence_maturity_summary,
        pillar_multi_chain_presence_maturity_last_30_days,
        pillar_multi_chain_presence_maturity_tracking,
        wami_score_calculated_at,
        maturity_level,
        wallets,
        wami_score_data,
        pillar_origins_legitimacy_score_data,
        pillar_portfolio_quality_score_data,
        pillar_activity_behavior_score_data,
        pillar_multi_chain_presence_maturity_score_data,
        maturity_level_data,
        NOW(),
        NOW()
    FROM temp_wami_agent_agg
    ON CONFLICT (agent_id) DO UPDATE SET
        wami_score = EXCLUDED.wami_score,
        wami_score_last_30_days = EXCLUDED.wami_score_last_30_days,
        wami_score_tracking = EXCLUDED.wami_score_tracking,
        pillar_origins_legitimacy_score = EXCLUDED.pillar_origins_legitimacy_score,
        pillar_origins_legitimacy_summary = EXCLUDED.pillar_origins_legitimacy_summary,
        pillar_origins_legitimacy_last_30_days = EXCLUDED.pillar_origins_legitimacy_last_30_days,
        pillar_origins_legitimacy_tracking = EXCLUDED.pillar_origins_legitimacy_tracking,
        pillar_portfolio_quality_score = EXCLUDED.pillar_portfolio_quality_score,
        pillar_portfolio_quality_summary = EXCLUDED.pillar_portfolio_quality_summary,
        pillar_portfolio_quality_last_30_days = EXCLUDED.pillar_portfolio_quality_last_30_days,
        pillar_portfolio_quality_tracking = EXCLUDED.pillar_portfolio_quality_tracking,
        pillar_activity_behavior_score = EXCLUDED.pillar_activity_behavior_score,
        pillar_activity_behavior_summary = EXCLUDED.pillar_activity_behavior_summary,
        pillar_activity_behavior_last_30_days = EXCLUDED.pillar_activity_behavior_last_30_days,
        pillar_activity_behavior_tracking = EXCLUDED.pillar_activity_behavior_tracking,
        pillar_multi_chain_presence_maturity_score = EXCLUDED.pillar_multi_chain_presence_maturity_score,
        pillar_multi_chain_presence_maturity_summary = EXCLUDED.pillar_multi_chain_presence_maturity_summary,
        pillar_multi_chain_presence_maturity_last_30_days = EXCLUDED.pillar_multi_chain_presence_maturity_last_30_days,
        pillar_multi_chain_presence_maturity_tracking = EXCLUDED.pillar_multi_chain_presence_maturity_tracking,
        wami_score_calculated_at = EXCLUDED.wami_score_calculated_at,
        maturity_level = EXCLUDED.maturity_level,
        wallets = EXCLUDED.wallets,
        wami_score_data = EXCLUDED.wami_score_data,
        pillar_origins_legitimacy_score_data = EXCLUDED.pillar_origins_legitimacy_score_data,
        pillar_portfolio_quality_score_data = EXCLUDED.pillar_portfolio_quality_score_data,
        pillar_activity_behavior_score_data = EXCLUDED.pillar_activity_behavior_score_data,
        pillar_multi_chain_presence_maturity_score_data = EXCLUDED.pillar_multi_chain_presence_maturity_score_data,
        maturity_level_data = EXCLUDED.maturity_level_data,
        updated_at = NOW();

    UPDATE web_dashboard.agents a
    SET
        current_wami_score = t.wami_score,
        wami_madurity_level = t.maturity_level,
        wallet_wami_score_details = t.wami_score_data,
        index_wami_calculated_at = NOW()
    FROM temp_wami_agent_agg t
    WHERE a.id = t.web_agent_id;

    RAISE NOTICE 'web_dashboard_index_wami_import_data: % agentes procesados.', v_count;

    RETURN v_count;
END;
$$;
