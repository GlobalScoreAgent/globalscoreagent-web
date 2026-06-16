-- Optimizado: humi_score_category en UPSERT; filtro pending preciso (wh.updated_at < iha.calculated_at).
-- Test: SELECT web_dashboard.web_dashboard_index_humi_import_data(10);

CREATE OR REPLACE FUNCTION web_dashboard.web_dashboard_index_humi_import_data(p_limit integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    CREATE TEMP TABLE temp_humi_base (
        web_agent_id BIGINT NOT NULL,
        agent_id BIGINT NOT NULL,
        index_humi_score NUMERIC,
        pillar_history_score NUMERIC,
        pillar_history_reason JSONB,
        pillar_usage_score NUMERIC,
        pillar_usage_reason JSONB,
        pillar_measure_score NUMERIC,
        pillar_measure_reason JSONB,
        pillar_information_score NUMERIC,
        pillar_information_reason JSONB,
        calculated_at TIMESTAMPTZ,
        maturity_level TEXT,
        humi_score_category TEXT
    ) ON COMMIT DROP;

    INSERT INTO temp_humi_base
    SELECT
        wa.id AS web_agent_id,
        iha.agent_id,
        iha.index_humi_score,
        iha.pillar_history_score,
        iha.pillar_history_reason,
        iha.pillar_usage_score,
        iha.pillar_usage_reason,
        iha.pillar_measure_score,
        iha.pillar_measure_reason,
        iha.pillar_information_score,
        iha.pillar_information_reason,
        iha.calculated_at,
        iha.maturity_level,
        CASE
            WHEN iha.index_humi_score BETWEEN 81 AND 100 THEN 'Elite'
            WHEN iha.index_humi_score BETWEEN 61 AND 80 THEN 'High Performance'
            WHEN iha.index_humi_score BETWEEN 31 AND 60 THEN 'Stable'
            WHEN iha.index_humi_score BETWEEN 11 AND 30 THEN 'Moderate Risk'
            WHEN iha.index_humi_score BETWEEN 0 AND 10 THEN 'Critical'
            ELSE 'Not Calculated'
        END AS humi_score_category
    FROM index_humi.index_humi_agent iha
    INNER JOIN web_dashboard.agents wa ON wa.agent_id = iha.agent_id
    LEFT JOIN web_dashboard.index_humi wh ON wh.agent_id = wa.id
    WHERE wh.agent_id IS NULL
       OR wh.updated_at < iha.calculated_at
    ORDER BY wh.updated_at ASC NULLS FIRST, iha.calculated_at DESC
    LIMIT p_limit;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    CREATE TEMP TABLE temp_humi_candidates (
        web_agent_id BIGINT NOT NULL,
        index_humi_score NUMERIC,
        pillar_history_score NUMERIC,
        pillar_history_reason JSONB,
        pillar_usage_score NUMERIC,
        pillar_usage_reason JSONB,
        pillar_measure_score NUMERIC,
        pillar_measure_reason JSONB,
        pillar_information_score NUMERIC,
        pillar_information_reason JSONB,
        calculated_at TIMESTAMPTZ,
        maturity_level TEXT,
        humi_score_category TEXT,
        humi_score_last_30_days JSONB,
        humi_score_tracking JSONB,
        pillar_history_score_last_30_days JSONB,
        pillar_history_score_tracking JSONB,
        pillar_usage_score_last_30_days JSONB,
        pillar_usage_score_tracking JSONB,
        pillar_measure_score_last_30_days JSONB,
        pillar_measure_score_tracking JSONB,
        pillar_information_score_last_30_days JSONB,
        pillar_information_score_tracking JSONB
    ) ON COMMIT DROP;

    INSERT INTO temp_humi_candidates
    SELECT
        b.web_agent_id,
        b.index_humi_score,
        b.pillar_history_score,
        b.pillar_history_reason,
        b.pillar_usage_score,
        b.pillar_usage_reason,
        b.pillar_measure_score,
        b.pillar_measure_reason,
        b.pillar_information_score,
        b.pillar_information_reason,
        b.calculated_at,
        b.maturity_level,
        b.humi_score_category,
        iht.humi_score_last_30_days,
        iht.humi_score_tracking,
        pht.pillar_score_last_30_days,
        pht.pillar_score_monthly,
        iht.pillar_usage_score_last_30_days,
        iht.pillar_usage_score_tracking,
        iht.pillar_measure_score_last_30_days,
        iht.pillar_measure_score_tracking,
        iht.pillar_information_score_last_30_days,
        iht.pillar_information_score_tracking
    FROM temp_humi_base b
    INNER JOIN index_humi.index_humi_tracking iht ON iht.agent_id = b.agent_id
    LEFT JOIN index_humi.pillar_history_tracking pht ON pht.agent_id = b.agent_id;

    INSERT INTO web_dashboard.index_humi (
        agent_id, humi_score, humi_score_last_30_days, humi_score_tracking,
        pillar_history_score, pillar_history_summary, pillar_history_score_last_30_days, pillar_history_score_tracking,
        pillar_usage_score, pillar_usage_summary, pillar_usage_score_last_30_days, pillar_usage_score_tracking,
        pillar_measure_score, pillar_measure_summary, pillar_measure_score_last_30_days, pillar_measure_score_tracking,
        pillar_information_score, pillar_information_summary, pillar_information_score_last_30_days, pillar_information_score_tracking,
        created_at, updated_at, current_humi_score_calculated_at, madurity_level, humi_score_category
    )
    SELECT
        web_agent_id, index_humi_score, humi_score_last_30_days, humi_score_tracking,
        pillar_history_score, pillar_history_reason, pillar_history_score_last_30_days, pillar_history_score_tracking,
        pillar_usage_score, pillar_usage_reason, pillar_usage_score_last_30_days, pillar_usage_score_tracking,
        pillar_measure_score, pillar_measure_reason, pillar_measure_score_last_30_days, pillar_measure_score_tracking,
        pillar_information_score, pillar_information_reason, pillar_information_score_last_30_days, pillar_information_score_tracking,
        NOW(), NOW(), calculated_at, maturity_level, humi_score_category
    FROM temp_humi_candidates
    ON CONFLICT (agent_id) DO UPDATE SET
        humi_score = EXCLUDED.humi_score,
        humi_score_last_30_days = EXCLUDED.humi_score_last_30_days,
        humi_score_tracking = EXCLUDED.humi_score_tracking,
        pillar_history_score = EXCLUDED.pillar_history_score,
        pillar_history_summary = EXCLUDED.pillar_history_summary,
        pillar_history_score_last_30_days = EXCLUDED.pillar_history_score_last_30_days,
        pillar_history_score_tracking = EXCLUDED.pillar_history_score_tracking,
        pillar_usage_score = EXCLUDED.pillar_usage_score,
        pillar_usage_summary = EXCLUDED.pillar_usage_summary,
        pillar_usage_score_last_30_days = EXCLUDED.pillar_usage_score_last_30_days,
        pillar_usage_score_tracking = EXCLUDED.pillar_usage_score_tracking,
        pillar_measure_score = EXCLUDED.pillar_measure_score,
        pillar_measure_summary = EXCLUDED.pillar_measure_summary,
        pillar_measure_score_last_30_days = EXCLUDED.pillar_measure_score_last_30_days,
        pillar_measure_score_tracking = EXCLUDED.pillar_measure_score_tracking,
        pillar_information_score = EXCLUDED.pillar_information_score,
        pillar_information_summary = EXCLUDED.pillar_information_summary,
        pillar_information_score_last_30_days = EXCLUDED.pillar_information_score_last_30_days,
        pillar_information_score_tracking = EXCLUDED.pillar_information_score_tracking,
        current_humi_score_calculated_at = EXCLUDED.current_humi_score_calculated_at,
        madurity_level = EXCLUDED.madurity_level,
        humi_score_category = EXCLUDED.humi_score_category,
        updated_at = NOW();

    UPDATE web_dashboard.agents a
    SET
        current_humi_score = t.index_humi_score,
        humi_madurity_level = t.maturity_level,
        humi_score_filter = t.humi_score_category,
        index_humi_calculated_at = NOW()
    FROM temp_humi_candidates t
    WHERE a.id = t.web_agent_id;

    RAISE NOTICE 'web_dashboard_index_humi_import_data: % registros procesados (dos temp tables).', v_count;

    RETURN v_count;
END;
$$;
