-- Orquestador secuencial del pipeline Index HUMI.
-- A partir de las 06:00 activa UN solo job cron a la vez, en orden:
--   populate: measure → usage → information (sin agent_history)
--   pillar:   measure → usage → history → information
--   final:    index_humi_calculate
-- Test: SELECT index_humi.index_humi_populate_data_hourly();

CREATE OR REPLACE FUNCTION index_humi.index_humi_populate_data_hourly()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, vault, net, pg_temp
AS $$
DECLARE
    v_current_hour                     integer;
    v_pipeline_start_hour              constant integer := 6;

    v_agent_measures_pending           boolean := false;
    v_agent_usage_pending              boolean := false;
    v_agent_information_pending        boolean := false;

    v_pillar_measure_pending           boolean := false;
    v_pillar_usage_pending             boolean := false;
    v_pillar_history_pending           boolean := false;
    v_pillar_information_pending       boolean := false;

    v_index_humi_pending               boolean := false;

    v_job_id                           bigint;
    v_active_job                       text := NULL;

    v_pipeline_jobs                    constant text[] := ARRAY[
        'agent_measure_populate_data',
        'agent_usage_populate_data',
        'agent_information_populate_data',
        'agent_pillar_measure_calculate',
        'agent_pillar_usage_calculate',
        'agent_pillar_history_calculate',
        'agent_pillar_information_calculate',
        'agent_index_humi_calculate'
    ];
BEGIN
    v_current_hour := EXTRACT(HOUR FROM NOW())::integer;

    RAISE NOTICE '=== Index Humi Sequential Orchestrator === Hora: %', v_current_hour;

    FOR v_job_id IN
        SELECT c.jobid
        FROM cron.job c
        WHERE c.jobname = ANY (v_pipeline_jobs)
    LOOP
        PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, false);
    END LOOP;

    IF v_current_hour < v_pipeline_start_hour THEN
        RETURN format(
            'INDEX_HUMI_IDLE [Hora %s] → Esperando %s:00 | Jobs apagados',
            v_current_hour,
            v_pipeline_start_hour
        );
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        LEFT JOIN index_humi.agent_measures am ON a.id = am.agent_id
        WHERE am.agent_id IS NULL OR am.updated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_agent_measures_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        LEFT JOIN index_humi.agent_usage au ON a.id = au.agent_id
        WHERE au.agent_id IS NULL OR au.updated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_agent_usage_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        JOIN erc_8004.registrations r ON r.agent_id = a.id
        JOIN erc_8004.wallets w ON a.owner_wallet_id = w.id
        JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
        LEFT JOIN index_humi.agent_information ai ON a.id = ai.agent_id
        WHERE ap.source = 'definitive'
          AND (ai.agent_id IS NULL OR ai.updated_at < CURRENT_DATE::timestamptz)
        LIMIT 1
    ) INTO v_agent_information_pending;

    SELECT EXISTS (
        SELECT 1
        FROM index_humi.agent_measures am
        LEFT JOIN index_humi.pillar_agent_measure pam ON am.id = pam.agent_measure_id
        WHERE pam.agent_measure_id IS NULL OR pam.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_measure_pending;

    SELECT EXISTS (
        SELECT 1
        FROM index_humi.agent_usage au
        LEFT JOIN index_humi.pillar_agent_usage pau ON au.id = pau.agent_usage_id
        WHERE pau.agent_usage_id IS NULL OR pau.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_usage_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
        LEFT JOIN index_humi.pillar_history ph ON a.id = ph.agent_id
        WHERE ap.source = 'definitive'
          AND a.owner_wallet_id IS NOT NULL
          AND (ph.agent_id IS NULL OR ph.calculated_at < CURRENT_DATE::timestamptz)
        LIMIT 1
    ) INTO v_pillar_history_pending;

    SELECT EXISTS (
        SELECT 1
        FROM index_humi.agent_information ai
        LEFT JOIN index_humi.pillar_agent_information pai ON ai.id = pai.agent_information_id
        WHERE pai.agent_information_id IS NULL OR pai.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_information_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        LEFT JOIN index_humi.index_humi_agent iha ON a.id = iha.agent_id
        WHERE iha.agent_id IS NULL OR iha.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_index_humi_pending;

    IF v_agent_measures_pending THEN
        v_active_job := 'agent_measure_populate_data';
    ELSIF v_agent_usage_pending THEN
        v_active_job := 'agent_usage_populate_data';
    ELSIF v_agent_information_pending THEN
        v_active_job := 'agent_information_populate_data';
    ELSIF v_pillar_measure_pending THEN
        v_active_job := 'agent_pillar_measure_calculate';
    ELSIF v_pillar_usage_pending THEN
        v_active_job := 'agent_pillar_usage_calculate';
    ELSIF v_pillar_history_pending THEN
        v_active_job := 'agent_pillar_history_calculate';
    ELSIF v_pillar_information_pending THEN
        v_active_job := 'agent_pillar_information_calculate';
    ELSIF v_index_humi_pending THEN
        v_active_job := 'agent_index_humi_calculate';
    END IF;

    IF v_active_job IS NOT NULL THEN
        SELECT jobid INTO v_job_id
        FROM cron.job
        WHERE jobname = v_active_job;

        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
        END IF;
    END IF;

    RETURN format(
        'INDEX_HUMI_SEQ [Hora %s] → Activo:%s | Populate M/U/I:%s/%s/%s | Pillar M/U/H/I:%s/%s/%s/%s | Final:%s',
        v_current_hour,
        COALESCE(v_active_job, 'complete'),
        v_agent_measures_pending, v_agent_usage_pending, v_agent_information_pending,
        v_pillar_measure_pending, v_pillar_usage_pending, v_pillar_history_pending, v_pillar_information_pending,
        v_index_humi_pending
    );
END;
$$;
