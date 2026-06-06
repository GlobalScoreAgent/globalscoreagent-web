-- Orquestador secuencial del pipeline Index WAMI.
-- A partir de las 06:00 activa UN solo job cron a la vez, en orden:
--   pillar: origins → quality → activity → multichain
--   final:  index_wami_calculate
-- Cuando un paso no tiene pendientes, pasa al siguiente. Antes de las 06:00 todo queda apagado.
--
-- Recomendado: cron del orquestador cada 5 min (ej. '*/5 * * * *') desde las 06:00.
-- Test: SELECT index_wami.hourly_process();

CREATE OR REPLACE FUNCTION index_wami.hourly_process()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, vault, net, pg_temp
AS $$
DECLARE
    v_current_hour                     integer;
    v_pipeline_start_hour              constant integer := 6;

    v_pillar_origins_pending           boolean := false;
    v_pillar_quality_pending           boolean := false;
    v_pillar_activity_pending          boolean := false;
    v_pillar_multichain_pending        boolean := false;
    v_index_wami_pending               boolean := false;

    v_job_id                           bigint;
    v_active_job                       text := NULL;

    v_pipeline_jobs                    constant text[] := ARRAY[
        'index_wami_pillar_origins_legitimacy_calculate',
        'index_wami_pillar_quality_calculate',
        'index_wami_pillar_activity_behavior_calculate',
        'index_wami_pillar_multi_chain_presence_maturity_calculate',
        'index_wami_index_wami_calculate'
    ];
BEGIN
    v_current_hour := EXTRACT(HOUR FROM NOW())::integer;

    RAISE NOTICE '=== Index WAMI Sequential Orchestrator === Hora: %', v_current_hour;

    FOR v_job_id IN
        SELECT c.jobid
        FROM cron.job c
        WHERE c.jobname = ANY (v_pipeline_jobs)
    LOOP
        PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, false);
    END LOOP;

    IF v_current_hour < v_pipeline_start_hour THEN
        RAISE NOTICE 'Pipeline inactivo (antes de %:00, import chain en curso)', v_pipeline_start_hour;
        RETURN format(
            'INDEX_WAMI_IDLE [Hora %s] → Esperando %s:00 | Jobs apagados',
            v_current_hour,
            v_pipeline_start_hour
        );
    END IF;

    RAISE NOTICE 'Pipeline secuencial activo (>= %:00)', v_pipeline_start_hour;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN index_wami.pillar_origins_legitimacy pwo
               ON wtd.wallet_id = pwo.wallet_id AND wtd.chain_id = pwo.chain_id
        WHERE pwo.wallet_id IS NULL OR pwo.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_origins_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN index_wami.pillar_quality pq
               ON wtd.wallet_id = pq.wallet_id AND wtd.chain_id = pq.chain_id
        WHERE pq.wallet_id IS NULL OR pq.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_quality_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN index_wami.pillar_activity_behavior pab
               ON wtd.wallet_id = pab.wallet_id AND wtd.chain_id = pab.chain_id
        WHERE pab.wallet_id IS NULL OR pab.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_activity_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN index_wami.pillar_multi_chain_presence_maturity pmc
               ON wtd.wallet_id = pmc.wallet_id AND wtd.chain_id = pmc.chain_id
        WHERE pmc.wallet_id IS NULL OR pmc.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_pillar_multichain_pending;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.wallet_transactional_details wtd
        LEFT JOIN index_wami.index_wami iw
               ON wtd.wallet_id = iw.wallet_id AND wtd.chain_id = iw.chain_id
        WHERE iw.wallet_id IS NULL OR iw.calculated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_index_wami_pending;

    IF v_pillar_origins_pending THEN
        v_active_job := 'index_wami_pillar_origins_legitimacy_calculate';
    ELSIF v_pillar_quality_pending THEN
        v_active_job := 'index_wami_pillar_quality_calculate';
    ELSIF v_pillar_activity_pending THEN
        v_active_job := 'index_wami_pillar_activity_behavior_calculate';
    ELSIF v_pillar_multichain_pending THEN
        v_active_job := 'index_wami_pillar_multi_chain_presence_maturity_calculate';
    ELSIF v_index_wami_pending THEN
        v_active_job := 'index_wami_index_wami_calculate';
    END IF;

    IF v_active_job IS NOT NULL THEN
        SELECT jobid INTO v_job_id
        FROM cron.job
        WHERE jobname = v_active_job;

        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
            RAISE NOTICE 'Job activo: %', v_active_job;
        ELSE
            RAISE WARNING 'Job no encontrado en cron.job: %', v_active_job;
        END IF;
    ELSE
        RAISE NOTICE 'Pipeline completo para hoy — todos los jobs permanecen apagados';
    END IF;

    RAISE NOTICE '=== Index WAMI Summary (Hora %) === Activo: % | Pillar O/Q/A/M: %/%/%/% | Final: %',
        v_current_hour,
        COALESCE(v_active_job, 'none'),
        v_pillar_origins_pending, v_pillar_quality_pending,
        v_pillar_activity_pending, v_pillar_multichain_pending,
        v_index_wami_pending;

    RETURN format(
        'INDEX_WAMI_SEQ [Hora %s] → Activo:%s | Pillar O/Q/A/M: %s/%s/%s/%s | Final:%s',
        v_current_hour,
        COALESCE(v_active_job, 'complete'),
        v_pillar_origins_pending, v_pillar_quality_pending,
        v_pillar_activity_pending, v_pillar_multichain_pending,
        v_index_wami_pending
    );
END;
$$;
