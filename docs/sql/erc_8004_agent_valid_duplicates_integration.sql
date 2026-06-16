-- Integración cron: wrapper + scheduler + worker semanal.
-- Corrige llamada a función inexistente y worker que no ejecutaba el batch.
--
-- Orden de despliegue:
--   1. erc_8004_agents_md5_backfill.sql          (columnas md5 pobladas)
--   2. erc_8004_agent_profile_process.sql        (writers mantienen md5)
--   3. erc_8004_duplicates_performance_indexes.sql
--   4. erc_8004_agent_duplicates_processed.sql
--   5. este archivo

-- Alias para compatibilidad con jobs cron existentes
CREATE OR REPLACE FUNCTION erc_8004.agent_valid_duplicates(p_limit integer)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO erc_8004, public
AS $$
    SELECT erc_8004.agent_duplicates_processed(p_limit);
$$;


CREATE OR REPLACE FUNCTION erc_8004.agent_valid_duplicates_scheduler()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO erc_8004, public
AS $$
DECLARE
    v_pending bigint;
    v_job_id  bigint;
BEGIN
    SELECT COUNT(*)
    INTO v_pending
    FROM erc_8004.agents
    WHERE duplicate_calculate_at IS NULL
       OR duplicate_calculate_at < (NOW() - INTERVAL '7 days');

    RAISE NOTICE 'Scheduler Duplicates → Registros pendientes: %', v_pending;

    -- Limpiar job legacy con nombre distinto
    PERFORM cron.unschedule('agent-valid-duplicates-weekly');

    IF v_pending > 0 THEN
        SELECT jobid INTO v_job_id
        FROM cron.job
        WHERE jobname = 'agent_valid_duplicates';

        IF v_job_id IS NULL THEN
            PERFORM cron.schedule(
                'agent_valid_duplicates',
                '*/2 * * * *',
                'SELECT erc_8004.agent_valid_duplicates(250);'
            );
        ELSE
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
        END IF;

        RAISE NOTICE 'Job "agent_valid_duplicates" ACTIVADO (hay % pendientes)', v_pending;
        RETURN format('ACTIVADO - %s pendientes', v_pending);
    ELSE
        SELECT jobid INTO v_job_id
        FROM cron.job
        WHERE jobname = 'agent_valid_duplicates';

        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, false);
        END IF;

        RAISE NOTICE 'No hay pendientes. Job "agent_valid_duplicates" desactivado.';
        RETURN 'SIN TRABAJO - Job desactivado';
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION erc_8004.agent_valid_duplicates_weekly()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO erc_8004, public, vault, net, pg_temp
AS $$
DECLARE
    v_pending_before bigint;
    v_remaining        bigint;
    v_batch_size       int := 250;
    v_result           jsonb;
    v_job_id           bigint;
BEGIN
    SELECT COUNT(*)
    INTO v_pending_before
    FROM erc_8004.agents
    WHERE duplicate_calculate_at IS NULL
       OR duplicate_calculate_at < (NOW() - INTERVAL '7 days');

    RAISE NOTICE '=== Duplicates Worker === Pendientes: % | Batch: %', v_pending_before, v_batch_size;

    IF v_pending_before = 0 THEN
        SELECT jobid INTO v_job_id
        FROM cron.job
        WHERE jobname = 'agent_valid_duplicates';

        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, false);
            RAISE NOTICE 'No hay pendientes → Job DESACTIVADO (alter_job active=false)';
        END IF;

        RETURN 'SIN TRABAJO - Job desactivado temporalmente';
    END IF;

    SELECT jobid INTO v_job_id
    FROM cron.job
    WHERE jobname = 'agent_valid_duplicates';

    IF v_job_id IS NOT NULL THEN
        PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
    END IF;

    SELECT erc_8004.agent_duplicates_processed(v_batch_size)
    INTO v_result;

    v_remaining := COALESCE((v_result->>'remaining')::bigint, 0);

    RAISE NOTICE 'Batch procesado: %', v_result;

    RETURN format(
        'PROCESADO - %s registros | Pendientes restantes: %s',
        COALESCE((v_result->>'records_updated')::int, 0),
        v_remaining
    );
END;
$$;
