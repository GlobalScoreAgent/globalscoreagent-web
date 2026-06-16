-- Orquestador secuencial Web Dashboard (desde medianoche).
-- Fase 1: chains_import.
-- Fase 2: agents_import (erc_8004 → web_dashboard.agents).
-- Fase 3 (paralelo): index_humi_import + index_wami_import (requieren web_dashboard.agents).
-- Antes de las 00:00 no modifica jobs. Recomendado: cron cada 3-5 min desde 00:00.
-- Test: SELECT web_dashboard.web_dashboard_daily_process();

CREATE OR REPLACE FUNCTION web_dashboard.web_dashboard_daily_process()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, vault, net, pg_temp
AS $$
DECLARE
    v_current_hour                     integer;
    v_pipeline_start_hour              constant integer := 0;

    v_web_agents_pending               boolean := false;
    v_web_index_humi_pending           boolean := false;
    v_web_chains_pending               boolean := false;
    v_web_index_wami_pending           boolean := false;

    v_job_id                           bigint;
    v_active_stage                     text := 'idle';

    v_pipeline_jobs                    constant text[] := ARRAY[
        'web_dashboard_chains_import_data',
        'web_dashboard_agents_import_data',
        'web_dashboard_index_humi_import_data',
        'web_dashboard_index_wami_import_data'
    ];
BEGIN
    v_current_hour := EXTRACT(HOUR FROM NOW())::integer;

    RAISE NOTICE '=== Web Dashboard Sequential Orchestrator === Hora: % (activo desde %:00)',
        v_current_hour, v_pipeline_start_hour;

    FOR v_job_id IN
        SELECT c.jobid
        FROM cron.job c
        WHERE c.jobname = ANY (v_pipeline_jobs)
    LOOP
        PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, false);
    END LOOP;

    RAISE NOTICE 'Ventana activa (>= %:00). Revisando pendientes...', v_pipeline_start_hour;

    -- Pendientes: agents (erc_8004 → web_dashboard.agents)
    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        LEFT JOIN web_dashboard.agents wa ON wa.agent_id = a.id
        WHERE wa.agent_id IS NULL
           OR wa.updated_at < CURRENT_DATE::timestamptz
        LIMIT 1
    ) INTO v_web_agents_pending;

    -- Pendientes: index humi (requiere fila en web_dashboard.agents)
    SELECT EXISTS (
        SELECT 1
        FROM web_dashboard.agents wa
        INNER JOIN index_humi.index_humi_agent iha ON wa.agent_id = iha.agent_id
        LEFT JOIN web_dashboard.index_humi wh ON wa.id = wh.agent_id
        WHERE wh.agent_id IS NULL
           OR wh.updated_at < iha.calculated_at
        LIMIT 1
    ) INTO v_web_index_humi_pending;

    -- Pendientes: chains
    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.chains c
        LEFT JOIN web_dashboard.chains wc ON wc.chain_id = c.chain_id::text
        WHERE (wc.updated_at IS NULL OR wc.updated_at < NOW() - INTERVAL '24 hours')
          AND c.is_active = TRUE
        LIMIT 1
    ) INTO v_web_chains_pending;

    -- Pendientes: index wami
    SELECT EXISTS (
        SELECT 1
        FROM web_dashboard.agents wa
        INNER JOIN erc_8004.registrations r ON r.agent_id = wa.agent_id
        INNER JOIN erc_8004.registration_wallet_tx rwtx ON rwtx.registration_id = r.id
        LEFT JOIN index_wami.index_wami iw ON iw.wallet_id = rwtx.wallet_id
                                        AND iw.chain_id = rwtx.chain_id
        LEFT JOIN web_dashboard.index_wami wdi ON wdi.agent_id = wa.agent_id
        WHERE wdi.agent_id IS NULL
           OR wdi.updated_at < iw.calculated_at
        LIMIT 1
    ) INTO v_web_index_wami_pending;

    -- Fase 1: chains
    IF v_web_chains_pending THEN
        v_active_stage := 'chains_import';

        SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'web_dashboard_chains_import_data';
        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
            RAISE NOTICE 'Fase 1: web_dashboard_chains_import_data ACTIVADO';
        END IF;

    -- Fase 2: agents (base para imports de índices)
    ELSIF v_web_agents_pending THEN
        v_active_stage := 'agents_import';

        SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'web_dashboard_agents_import_data';
        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
            RAISE NOTICE 'Fase 2: web_dashboard_agents_import_data ACTIVADO';
        END IF;

    -- Fase 3: humi + wami en paralelo
    ELSIF v_web_index_humi_pending OR v_web_index_wami_pending THEN
        v_active_stage := 'index_humi_wami_parallel';

        SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'web_dashboard_index_humi_import_data';
        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
        END IF;

        SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'web_dashboard_index_wami_import_data';
        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, true);
        END IF;

        RAISE NOTICE 'Fase 3: index_humi (%) + index_wami (%) activos en paralelo',
            v_web_index_humi_pending, v_web_index_wami_pending;

    ELSE
        v_active_stage := 'complete';
        RAISE NOTICE 'Pipeline Web Dashboard completo — todos los jobs apagados';
    END IF;

    RAISE NOTICE '=== Web Dashboard Summary (Hora %) === Etapa: % | Agents:% | IndexHumi:% | Chains:% | IndexWami:%',
        v_current_hour,
        v_active_stage,
        v_web_agents_pending,
        v_web_index_humi_pending,
        v_web_chains_pending,
        v_web_index_wami_pending;

    RETURN format(
        'WEB_DASHBOARD_SEQ [Hora %s] → Etapa:%s | Agents:%s | IndexHumi:%s | Chains:%s | IndexWami:%s',
        v_current_hour,
        v_active_stage,
        v_web_agents_pending,
        v_web_index_humi_pending,
        v_web_chains_pending,
        v_web_index_wami_pending
    );
END;
$$;
