-- Optimizado: jsonb_object_agg para distribuciones HUMI/WAMI; nonce_summary limitado a 24 meses.
-- Test: SELECT web_dashboard.web_dashboard_general_stadistics_calculate();

CREATE OR REPLACE FUNCTION web_dashboard.web_dashboard_general_stadistics_calculate()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, web_dashboard, erc_8004, index_humi, index_wami
AS $$
DECLARE
    last_calc_date date;
    v_total_agents integer;
    v_total_agents_active integer;
    v_total_agents_with_feedbacks integer;
    v_wallet_monitored integer;
    v_feedback_entities integer;
    v_humi_index_distribution jsonb;
    v_calculated_at timestamp with time zone := now();
    v_today_record_id bigint;
    v_agent_nonce jsonb;
    v_agent_metadata_richness jsonb;
    v_chain_stats jsonb;
    v_wami_index_distribution jsonb;
BEGIN
    SELECT id, date(calculated_at)
    INTO v_today_record_id, last_calc_date
    FROM web_dashboard.main_stadistics
    WHERE date(calculated_at) = current_date
    ORDER BY calculated_at DESC
    LIMIT 1;

    SELECT COUNT(*)
    INTO v_total_agents
    FROM erc_8004.agents;

    SELECT COUNT(DISTINCT agent_id)
    INTO v_total_agents_active
    FROM erc_8004.registrations
    WHERE is_registration_active = true;

    SELECT COUNT(DISTINCT r.agent_id)
    INTO v_total_agents_with_feedbacks
    FROM erc_8004.registration_feedbacks rf
    JOIN erc_8004.registrations r ON rf.registration_id = r.id
    WHERE rf.is_revoked = false;

    SELECT COUNT(DISTINCT wallet_id)
    INTO v_wallet_monitored
    FROM erc_8004.registration_wallet_tx
    WHERE status = 'verified';

    SELECT COUNT(*)
    INTO v_feedback_entities
    FROM erc_8004.agent_feedback_entities;

    -- humi_index_distribution: jsonb_object_agg en una pasada
    SELECT COALESCE(
        jsonb_object_agg(maturity_level, cnt),
        '{}'::jsonb
    )
    INTO v_humi_index_distribution
    FROM (
        SELECT maturity_level, COUNT(*) AS cnt
        FROM index_humi.index_humi_agent
        GROUP BY maturity_level
    ) humi_stats;

    -- wami_index_distribution: jsonb_object_agg en una pasada
    SELECT COALESCE(
        jsonb_object_agg(madutiry_level, cnt),
        '{}'::jsonb
    )
    INTO v_wami_index_distribution
    FROM (
        SELECT madutiry_level, COUNT(*) AS cnt
        FROM index_wami.index_wami
        GROUP BY madutiry_level
    ) wami_stats;

    -- agent_nonce: últimos 24 meses para evitar JSON gigante
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', date,
            'total_nonce', total_nonce
        )
        ORDER BY date DESC
    )
    INTO v_agent_nonce
    FROM erc_8004.nonce_summary
    WHERE date >= CURRENT_DATE - INTERVAL '24 months';

    SELECT COALESCE(
        jsonb_object_agg(COALESCE(metadata_category, 'Unknown'), cnt),
        '{}'::jsonb
    )
    INTO v_agent_metadata_richness
    FROM (
        SELECT metadata_category, COUNT(*) AS cnt
        FROM erc_8004.agents
        GROUP BY metadata_category
    ) richness_stats;

    SELECT jsonb_agg(
        jsonb_build_object(
            'chain_id',          c.chain_id,
            'name',              c.name,
            'owner_total',       cs.owner_total,
            'agent_total',       cs.agent_total,
            'agent_active',      cs.agent_active,
            'agent_with_feedback', cs.agent_with_feedback
        )
        ORDER BY c.chain_id
    )
    INTO v_chain_stats
    FROM erc_8004.chains c
    JOIN erc_8004.chain_stats cs ON c.id = cs.chain_id;

    IF v_today_record_id IS NOT NULL THEN
        UPDATE web_dashboard.main_stadistics
        SET
            total_agents                = v_total_agents,
            total_agents_active         = v_total_agents_active,
            total_agents_with_feedbacks = v_total_agents_with_feedbacks,
            wallet_monitored            = v_wallet_monitored,
            feedback_entities           = v_feedback_entities,
            humi_index_distribution     = COALESCE(v_humi_index_distribution, '{}'::jsonb),
            calculated_at               = v_calculated_at,
            agent_nonce                 = COALESCE(v_agent_nonce, '[]'::jsonb),
            agent_metadata_richness     = COALESCE(v_agent_metadata_richness, '{}'::jsonb),
            chain_stats                 = COALESCE(v_chain_stats, '[]'::jsonb),
            wami_index_distribution     = COALESCE(v_wami_index_distribution, '{}'::jsonb)
        WHERE id = v_today_record_id;

        RAISE NOTICE '✅ Estadísticas generales ACTUALIZADAS exitosamente para hoy (%).', current_date;
    ELSE
        INSERT INTO web_dashboard.main_stadistics (
            total_agents,
            total_agents_active,
            total_agents_with_feedbacks,
            wallet_monitored,
            feedback_entities,
            humi_index_distribution,
            calculated_at,
            agent_nonce,
            agent_metadata_richness,
            chain_stats,
            wami_index_distribution
        ) VALUES (
            v_total_agents,
            v_total_agents_active,
            v_total_agents_with_feedbacks,
            v_wallet_monitored,
            v_feedback_entities,
            COALESCE(v_humi_index_distribution, '{}'::jsonb),
            v_calculated_at,
            COALESCE(v_agent_nonce, '[]'::jsonb),
            COALESCE(v_agent_metadata_richness, '{}'::jsonb),
            COALESCE(v_chain_stats, '[]'::jsonb),
            COALESCE(v_wami_index_distribution, '{}'::jsonb)
        );

        RAISE NOTICE '✅ Estadísticas generales INSERTADAS exitosamente para hoy (%).', current_date;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ Error al calcular/actualizar estadísticas generales: %', SQLERRM;
END;
$$;
