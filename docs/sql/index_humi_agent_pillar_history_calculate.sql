-- MVs erc_8004.owner_summary_* + pillar_history + pillar_history_tracking (sin agent_history).
-- Test: SELECT index_humi.agent_pillar_history_calculate(10);

CREATE OR REPLACE FUNCTION index_humi.agent_pillar_history_calculate(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO index_humi, erc_8004, public
AS $$
DECLARE
    v_processed integer := 0;
    w               record;

    -- ====================== NUEVOS SCORES SEGÚN ESTRUCTURA VERTICAL ======================
    -- Bloque Básica (10 pts)
    v_owner_wallet_active_score       numeric := 0;
    v_owner_wallet_active_reason      jsonb;
    v_agent_owner_stability_score     numeric := 0;
    v_agent_owner_stability_reason    jsonb;

    -- Bloque Intermedia (9 pts)
    v_owner_antiquity_score           numeric := 0;
    v_owner_antiquity_reason          jsonb;
    v_portafolio_agent_active_score   numeric := 0;
    v_portafolio_agent_active_reason  jsonb;
    v_portafolio_basic_external_audits_score numeric := 0;
    v_portafolio_basic_external_audits_reason jsonb;
    v_portafolio_warnings_score       numeric := 0;
    v_portafolio_warnings_reason      jsonb;

    -- Bloque Avanzada (6 pts)
    v_portafolio_quality_agent_score          numeric := 0;
    v_portafolio_quality_agent_reason         jsonb;
    v_portafolio_advanced_external_audits_score numeric := 0;
    v_portafolio_advanced_external_audits_reason jsonb;
    v_portafolio_general_activity_score         numeric := 0;
    v_portafolio_general_activity_reason        jsonb;

    -- Bloques resumen
    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0;

    v_new_version        text := '1';

    -- NUEVO: Análisis narrativo del pilar (lenguaje de negocio)
    v_pillar_summary     jsonb;

    -- Auxiliares
    v_total_agents       numeric := 0;
    v_active_agents      numeric := 0;
    v_chain_count        integer := 0;
    v_warnings_count     numeric := 0;

BEGIN
    CREATE TEMP TABLE temp_target_agents (
        agent_id bigint PRIMARY KEY,
        owner_id bigint,
        owner_since_at timestamptz,
        owner_changes integer,
        on_chain_created_at timestamptz
    ) ON COMMIT DROP;

    INSERT INTO temp_target_agents (agent_id, owner_id, owner_since_at, owner_changes, on_chain_created_at)
    SELECT
        a.id,
        a.owner_wallet_id,
        a.owner_since_at,
        a.owner_changes,
        a.on_chain_created_at
    FROM erc_8004.agents a
    JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
    LEFT JOIN index_humi.pillar_history ph ON a.id = ph.agent_id
    WHERE ap.source = 'definitive'
      AND (ph.agent_id IS NULL OR ph.calculated_at < CURRENT_DATE::timestamptz)
      AND a.owner_wallet_id IS NOT NULL
    ORDER BY ph.calculated_at ASC NULLS FIRST
    LIMIT p_limit;

    SELECT COUNT(*)::integer INTO v_processed FROM temp_target_agents;

    INSERT INTO index_humi.pillar_history_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ta.agent_id, '[]'::jsonb, '[]'::jsonb
    FROM temp_target_agents ta
    ON CONFLICT (agent_id) DO NOTHING;

    WITH current_state AS (
        SELECT
            ta.agent_id,
            ph.pillar_score AS old_pillar_score,
            ph.block_basic_score AS old_block_basic_score,
            ph.block_intermediate_score AS old_block_intermediate_score,
            ph.block_advanced_score AS old_block_advanced_score,
            ph.calculated_at AS old_calculated_at,
            COALESCE(pht.pillar_score_last_30_days, '[]'::jsonb) AS old_last_30_days,
            COALESCE(pht.pillar_score_monthly, '[]'::jsonb) AS old_monthly
        FROM temp_target_agents ta
        LEFT JOIN index_humi.pillar_history ph ON ph.agent_id = ta.agent_id
        LEFT JOIN index_humi.pillar_history_tracking pht ON pht.agent_id = ta.agent_id
    ),
    archive AS (
        SELECT
            cs.agent_id,
            to_char(COALESCE(cs.old_calculated_at::date, CURRENT_DATE), 'YYYY-MM') AS current_month,
            cs.old_pillar_score,
            cs.old_block_basic_score,
            cs.old_block_intermediate_score,
            cs.old_block_advanced_score,
            cs.old_calculated_at,
            cs.old_last_30_days,
            cs.old_monthly
        FROM current_state cs
        WHERE cs.old_calculated_at IS NOT NULL
    ),
    computed_tracking AS (
        SELECT
            a.*,
            (
                SELECT jsonb_agg(elem ORDER BY (elem->>'date')::timestamptz DESC)
                FROM (
                    SELECT jsonb_build_object(
                        'date', a.old_calculated_at,
                        'pillar_score', a.old_pillar_score,
                        'block_basic_score', a.old_block_basic_score,
                        'block_intermediate_score', a.old_block_intermediate_score,
                        'block_advanced_score', a.old_block_advanced_score
                    ) AS elem
                    UNION ALL
                    SELECT elem
                    FROM jsonb_array_elements(COALESCE(a.old_last_30_days, '[]'::jsonb)) elem
                    WHERE (elem->>'date')::date >= (CURRENT_DATE - INTERVAL '30 days')
                      AND (elem->>'date')::date < COALESCE(a.old_calculated_at::date, CURRENT_DATE)
                ) sub
            ) AS new_last_30_days,
            COALESCE((
                SELECT jsonb_agg(
                    CASE
                        WHEN (elem->>'date') = a.current_month THEN
                            jsonb_build_object(
                                'date', a.current_month,
                                'avg_score',
                                CASE
                                    WHEN (elem->>'avg_score') IS NOT NULL
                                    THEN ((elem->>'avg_score')::numeric + COALESCE(a.old_pillar_score, 0)) / 2.0
                                    ELSE COALESCE(a.old_pillar_score, 0)
                                END
                            )
                        ELSE elem
                    END
                    ORDER BY (elem->>'date')
                )
                FROM jsonb_array_elements(COALESCE(a.old_monthly, '[]'::jsonb)) elem
            ), jsonb_build_array(jsonb_build_object('date', a.current_month, 'avg_score', COALESCE(a.old_pillar_score, 0)))) AS new_monthly
        FROM archive a
    )
    INSERT INTO index_humi.pillar_history_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ct.agent_id, ct.new_last_30_days, ct.new_monthly
    FROM computed_tracking ct
    ON CONFLICT (agent_id) DO UPDATE SET
        pillar_score_last_30_days = EXCLUDED.pillar_score_last_30_days,
        pillar_score_monthly = EXCLUDED.pillar_score_monthly;

    FOR w IN
        SELECT
            ta.agent_id,
            ta.owner_id,
            ow.wallet_created_at,
            ow.owner_chains,
            ta.owner_since_at,
            ta.owner_changes,
            ta.on_chain_created_at,
            COALESCE(osa.total_agents, 0) AS owner_portafolio_agent_total,
            COALESCE(osa.active_agents, 0) AS owner_portafolio_agent_active_total,
            COALESCE(osa.metadata_category_distribution, '{}'::jsonb) AS owner_portafolio_agent_metadata_richness,
            jsonb_build_object(
                'total_agents_analyzed', COALESCE(oww.total_agents_analyzed, 0),
                'duplication_metadata_count', COALESCE(oww.duplication_metadata_count, 0),
                'multi_agent_wallet_count', COALESCE(oww.multi_agent_wallet_count, 0),
                'dummy_metadata_count', COALESCE(oww.dummy_metadata_count, 0),
                'attestations_spam_count', COALESCE(oww.attestations_spam_count, 0),
                'external_audit_warning_count', COALESCE(oww.external_audit_warning_count, 0),
                'high_revocations_count', COALESCE(oww.high_revocations_count, 0),
                'owner_inactive_agents_count', COALESCE(oww.owner_inactive_agents_count, 0),
                'high_ownership_churn_count', COALESCE(oww.high_ownership_churn_count, 0),
                'transactional_same_as_owner_count', COALESCE(oww.transactional_same_as_owner_count, 0),
                'lower_realness_count', COALESCE(oww.lower_realness_count, 0),
                'lower_metadata_richness_count', COALESCE(oww.lower_metadata_richness_count, 0),
                'total_agents_with_warnings', COALESCE(oww.total_agents_with_warnings, 0)
            ) AS owner_portafolio_agent_warnings,
            jsonb_build_object(
                'total_valid_audits', COALESCE(oea.total_valid_audits, 0),
                'agents_with_poor_score', COALESCE(oea.agents_with_poor_score, 0),
                'agents_with_deficient_score', COALESCE(oea.agents_with_deficient_score, 0),
                'agents_with_normal_score', COALESCE(oea.agents_with_normal_score, 0),
                'agents_with_good_score', COALESCE(oea.agents_with_good_score, 0),
                'agents_with_excellent_score', COALESCE(oea.agents_with_excelent_score, 0)
            ) AS owner_portafolio_agent_external_audits,
            jsonb_build_object(
                'total_valid_attestations', COALESCE(oat.total_valid_attestations, 0),
                'agents_with_poor_score', COALESCE(oat.agents_with_poor_score, 0),
                'agents_with_deficient_score', COALESCE(oat.agents_with_deficient_score, 0),
                'agents_with_normal_score', COALESCE(oat.agents_with_normal_score, 0),
                'agents_with_good_score', COALESCE(oat.agents_with_good_score, 0),
                'agents_with_excellent_score', COALESCE(oat.agents_with_excellent_score, 0)
            ) AS owner_portafolio_agent_attestations,
            jsonb_build_object(
                'total_agents_with_execution_data', COALESCE(oex.total_agents_with_execution_data, 0),
                'agents_with_no_executions', COALESCE(oex.agents_with_no_executions, 0),
                'agents_with_executions', COALESCE(oex.agents_with_executions, 0),
                'average_executions_per_agent', COALESCE(oex.average_executions_per_agent, 0),
                'total_executions_count', COALESCE(oex.total_executions_count, 0)
            ) AS owner_portafolio_agent_on_chain_executions,
            jsonb_build_object(
                'total_protocol_activities', COALESCE(opa.total_protocol_activities, 0),
                'agents_with_poor_score', COALESCE(opa.agents_with_poor_score, 0),
                'agents_with_deficient_score', COALESCE(opa.agents_with_deficient_score, 0),
                'agents_with_normal_score', COALESCE(opa.agents_with_normal_score, 0),
                'agents_with_good_score', COALESCE(opa.agents_with_good_score, 0),
                'agents_with_excellent_score', COALESCE(opa.agents_with_excellent_score, 0)
            ) AS owner_portafolio_agent_activity_protocols,
            jsonb_build_object(
                'agents_with_services', COALESCE(os.agents_with_services, 0),
                'agents_with_no_services', COALESCE(os.agents_with_no_services, 0),
                'agents_with_one_service', COALESCE(os.agents_with_one_service, 0),
                'agents_with_two_services', COALESCE(os.agents_with_two_services, 0),
                'agents_with_three_services', COALESCE(os.agents_with_three_services, 0),
                'agents_with_four_services', COALESCE(os.agents_with_four_services, 0),
                'agents_with_five_or_more_services', COALESCE(os.agents_with_five_or_more_services, 0),
                'agents_with_specialized_services', COALESCE(os.agents_with_specialized_services, 0),
                'agents_with_x402_support', COALESCE(os.agents_with_x402_support, 0)
            ) AS owner_portafolio_agents_metadata_services,
            (
                jsonb_typeof(ow.owner_chains) = 'array'
                AND EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(ow.owner_chains) elem
                    WHERE elem->>'wallet_type' = 'active'
                )
            ) AS owner_has_active_wallet_in_chain_info
        FROM temp_target_agents ta
        LEFT JOIN erc_8004.owner_summary_wallets ow ON ow.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agents osa ON osa.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agent_warnings oww ON oww.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agent_external_audits oea ON oea.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agent_attestations oat ON oat.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agent_executions oex ON oex.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agent_protocol_activity opa ON opa.owner_wallet_id = ta.owner_id
        LEFT JOIN erc_8004.owner_summary_agent_services os ON os.owner_wallet_id = ta.owner_id
    LOOP

        -- ====================== BLOQUE BÁSICA (10 pts) ======================
        -- Item 1: Owner Wallet Activa (5.0 pts)
        DECLARE
            v_has_active_wallet boolean := COALESCE(w.owner_has_active_wallet_in_chain_info, false);
        BEGIN
            IF v_has_active_wallet OR COALESCE(w.owner_portafolio_agent_active_total, 0) > 0 THEN
                v_owner_wallet_active_score := 5.0;
                v_owner_wallet_active_reason := jsonb_build_object(
                    'has_active_wallet_in_chain_info', v_has_active_wallet,
                    'active_agents_in_portfolio', COALESCE(w.owner_portafolio_agent_active_total, 0),
                    'reason_eng', 'Owner wallet is confirmed active or supports active agents in portfolio, demonstrating real participation and operational legitimacy.',
                    'reason_esp', 'La wallet del owner está confirmada como activa o soporta agentes activos en el portafolio, demostrando participación real y legitimidad operativa.'
                );
            ELSE
                v_owner_wallet_active_score := 0;
                v_owner_wallet_active_reason := jsonb_build_object(
                    'reason_eng', 'No active wallet or active agents in portfolio detected, indicating potential low owner engagement or inactivity risk.',
                    'reason_esp', 'No se detecta wallet activa ni agentes activos en el portafolio, indicando posible bajo engagement del owner o riesgo de inactividad.'
                );
            END IF;
        END;

        -- Item 2: Estabilidad de Ownership en este agente (5.0 pts)
        DECLARE
            v_agent_age_months integer := 0;
        BEGIN
            IF w.on_chain_created_at IS NOT NULL THEN
                v_agent_age_months := EXTRACT(EPOCH FROM (CURRENT_DATE - w.on_chain_created_at))::int / (30 * 86400);
            END IF;

            IF v_agent_age_months < 6 THEN
                v_agent_owner_stability_score := CASE WHEN COALESCE(w.owner_changes, 1) = 1 THEN 5.0 ELSE 0.0 END;
                v_agent_owner_stability_reason := jsonb_build_object(
                    'agent_age_months', v_agent_age_months,
                    'owner_changes', COALESCE(w.owner_changes, 0),
                    'reason_eng', CASE WHEN v_agent_owner_stability_score = 5.0 
                                       THEN 'Owner stability is excellent for a young agent (<6 months) with no ownership changes, showing strong commitment.'
                                       ELSE 'Owner changes detected in a young agent, increasing perceived instability risk.'
                                  END,
                    'reason_esp', CASE WHEN v_agent_owner_stability_score = 5.0 
                                       THEN 'La estabilidad del owner es excelente para un agente joven (<6 meses) sin cambios de propiedad, mostrando fuerte compromiso.'
                                       ELSE 'Se detectaron cambios de owner en un agente joven, aumentando el riesgo percibido de inestabilidad.'
                                  END
                );
            ELSE
                v_agent_owner_stability_score := CASE WHEN COALESCE(w.owner_changes, 0) <= 2 THEN 5.0 ELSE 0.0 END;
                v_agent_owner_stability_reason := jsonb_build_object(
                    'agent_age_months', v_agent_age_months,
                    'owner_changes', COALESCE(w.owner_changes, 0),
                    'reason_eng', CASE WHEN v_agent_owner_stability_score = 5.0 
                                       THEN 'Excellent ownership stability for a mature agent (≥6 months) with minimal changes, reflecting high trust and continuity.'
                                       ELSE 'Multiple ownership changes detected in a mature agent, raising concerns about stability and long-term commitment.'
                                  END,
                    'reason_esp', CASE WHEN v_agent_owner_stability_score = 5.0 
                                       THEN 'Excelente estabilidad de propiedad para un agente maduro (≥6 meses) con cambios mínimos, reflejando alta confianza y continuidad.'
                                       ELSE 'Múltiples cambios de propiedad detectados en un agente maduro, generando preocupación sobre estabilidad y compromiso a largo plazo.'
                                  END
                );
            END IF;
        END;

        v_block_basic := v_owner_wallet_active_score + v_agent_owner_stability_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================
        -- 1. Agentes Activos del Portafolio
        v_total_agents  := COALESCE(w.owner_portafolio_agent_total, 0);
        v_active_agents := COALESCE(w.owner_portafolio_agent_active_total, 0);

        IF v_total_agents > 0 THEN
            DECLARE
                v_active_pct numeric := (v_active_agents / v_total_agents) * 100;
            BEGIN
                IF v_active_pct >= 80 THEN
                    v_portafolio_agent_active_score := 3.0;
                    v_portafolio_agent_active_reason := jsonb_build_object(
                        'percentage_active', round(v_active_pct, 2),
                        'reason_eng', 'Excellent portfolio health with ≥80% active agents, demonstrating strong owner management and operational consistency.',
                        'reason_esp', 'Salud del portafolio excelente con ≥80% de agentes activos, demostrando fuerte gestión del owner y consistencia operativa.'
                    );
                ELSIF v_active_pct >= 50 THEN
                    v_portafolio_agent_active_score := 1.5;
                    v_portafolio_agent_active_reason := jsonb_build_object(
                        'percentage_active', round(v_active_pct, 2),
                        'reason_eng', 'Moderate portfolio health (50–79% active agents), indicating acceptable but improvable owner engagement.',
                        'reason_esp', 'Salud del portafolio moderada (50–79% agentes activos), indicando engagement del owner aceptable pero mejorable.'
                    );
                ELSE
                    v_portafolio_agent_active_score := 0;
                    v_portafolio_agent_active_reason := jsonb_build_object(
                        'percentage_active', round(v_active_pct, 2),
                        'reason_eng', 'Low portfolio health (<50% active agents), signaling potential owner inactivity or portfolio neglect risk.',
                        'reason_esp', 'Baja salud del portafolio (<50% agentes activos), señalando posible inactividad del owner o riesgo de abandono del portafolio.'
                    );
                END IF;
            END;
        ELSE
            v_portafolio_agent_active_score := 0;
            v_portafolio_agent_active_reason := jsonb_build_object(
                'reason_eng', 'No agents in portfolio, making active portfolio analysis not applicable.',
                'reason_esp', 'No hay agentes en el portafolio, por lo que el análisis de portafolio activo no aplica.'
            );
        END IF;

        -- 2. Auditoría Externa Mínima
        DECLARE
            v_total_audited bigint := COALESCE((w.owner_portafolio_agent_external_audits->>'total_valid_audits')::bigint, 0);
        BEGIN
            IF v_total_audited >= 1 THEN
                v_portafolio_basic_external_audits_score := 1.5;
                v_portafolio_basic_external_audits_reason := jsonb_build_object(
                    'total_audited_agents', v_total_audited,
                    'reason_eng', 'At least one external audit present in the owner’s portfolio, providing strong external validation and credibility.',
                    'reason_esp', 'Al menos una auditoría externa presente en el portafolio del owner, proporcionando fuerte validación y credibilidad externa.'
                );
            ELSE
                v_portafolio_basic_external_audits_score := 0;
                v_portafolio_basic_external_audits_reason := jsonb_build_object(
                    'total_audited_agents', 0,
                    'reason_eng', 'No external audits found in the portfolio, missing an important layer of third-party validation.',
                    'reason_esp', 'No se encontraron auditorías externas en el portafolio, faltando una capa importante de validación de terceros.'
                );
            END IF;
        END;

        -- 3. Sin Warnings Externas
        DECLARE
            v_total_warnings numeric := COALESCE((w.owner_portafolio_agent_warnings->>'total_agents_with_warnings')::numeric, 0);
            v_warnings_pct   numeric := 0;
        BEGIN

            IF v_total_agents > 0 THEN
                v_warnings_pct := (v_total_warnings / v_total_agents) * 100;
                IF v_warnings_pct <= 10 THEN
                    v_portafolio_warnings_score := 1.5;
                    v_portafolio_warnings_reason := jsonb_build_object(
                        'warnings_pct', round(v_warnings_pct, 2),
                        'reason_eng', 'Clean portfolio with very low warnings (≤10%), indicating excellent owner hygiene and low risk profile.',
                        'reason_esp', 'Portafolio limpio con muy pocas advertencias (≤10%), indicando excelente higiene del owner y bajo perfil de riesgo.'
                    );
                ELSE
                    v_portafolio_warnings_score := 0;
                    v_portafolio_warnings_reason := jsonb_build_object(
                        'warnings_pct', round(v_warnings_pct, 2),
                        'reason_eng', 'Elevated warnings in portfolio (>10%), increasing perceived risk and potential compliance concerns.',
                        'reason_esp', 'Advertencias elevadas en el portafolio (>10%), aumentando el riesgo percibido y posibles preocupaciones de cumplimiento.'
                    );
                END IF;
            ELSE
                v_portafolio_warnings_score := 0;
                v_portafolio_warnings_reason := jsonb_build_object(
                    'reason_eng', 'No agents in portfolio for warnings analysis.',
                    'reason_esp', 'No hay agentes en el portafolio para análisis de advertencias.'
                );
            END IF;
        END;

        -- 4. Antigüedad Avanzada del Owner
        IF w.wallet_created_at IS NULL THEN
            v_owner_antiquity_score := 0;
            v_owner_antiquity_reason := jsonb_build_object(
                'reason_eng', 'No first transaction date available, preventing antiquity assessment.',
                'reason_esp', 'No hay fecha de primera transacción disponible, imposibilitando la evaluación de antigüedad.'
            );
        ELSE
            v_owner_antiquity_score := CASE
                WHEN w.wallet_created_at >= CURRENT_DATE - INTERVAL '6 months' THEN 1.0
                WHEN w.wallet_created_at >= CURRENT_DATE - INTERVAL '1 year'  THEN 2.0
                WHEN w.wallet_created_at >= CURRENT_DATE - INTERVAL '2 years' THEN 3.0
                ELSE 3.0 END;
            v_owner_antiquity_reason := jsonb_build_object(
                'days_since_first_tx', EXTRACT(DAY FROM CURRENT_DATE - w.wallet_created_at)::int,
                'reason_eng', CASE 
                    WHEN v_owner_antiquity_score = 3.0 THEN 'Owner demonstrates strong antiquity (>2 years), reflecting deep ecosystem experience and high credibility.'
                    WHEN v_owner_antiquity_score = 2.0 THEN 'Owner shows good antiquity (1-2 years), indicating solid experience and moderate maturity.'
                    ELSE 'Owner is relatively new (<1 year), limiting perceived long-term commitment.'
                END,
                'reason_esp', CASE 
                    WHEN v_owner_antiquity_score = 3.0 THEN 'El owner demuestra fuerte antigüedad (>2 años), reflejando profunda experiencia en el ecosistema y alta credibilidad.'
                    WHEN v_owner_antiquity_score = 2.0 THEN 'El owner muestra buena antigüedad (1-2 años), indicando experiencia sólida y madurez moderada.'
                    ELSE 'El owner es relativamente nuevo (<1 año), limitando el compromiso percibido a largo plazo.'
                END
            );
        END IF;

        v_block_intermediate := v_owner_antiquity_score + 
                                v_portafolio_agent_active_score + 
                                v_portafolio_basic_external_audits_score + 
                                v_portafolio_warnings_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================

        -- 1. Metadata Buena + Verificación de Servicios
        DECLARE
            v_metadata_richness_avg numeric := 0;
            v_metadata_good_count numeric := 0;
            v_metadata_pct numeric := 0;
            v_services_with_at_least_one numeric := 0;
            v_services_pct numeric := 0;
            v_metadata_score numeric := 0;
            v_services_score numeric := 0;
        BEGIN
            IF jsonb_typeof(w.owner_portafolio_agent_metadata_richness) = 'object' AND v_total_agents > 0 THEN
                v_metadata_good_count :=
                    COALESCE((w.owner_portafolio_agent_metadata_richness->>'Strong')::numeric, 0) +
                    COALESCE((w.owner_portafolio_agent_metadata_richness->>'Excellent')::numeric, 0);
                v_metadata_pct := (v_metadata_good_count / v_total_agents) * 100;
                v_metadata_richness_avg := v_metadata_pct;
                v_metadata_score := LEAST(0.75, (v_metadata_pct / 100.0) * 0.75);
            END IF;

            IF jsonb_typeof(w.owner_portafolio_agents_metadata_services) = 'object' THEN
                v_services_with_at_least_one :=
                    COALESCE((w.owner_portafolio_agents_metadata_services->>'agents_with_one_service')::numeric, 0) +
                    COALESCE((w.owner_portafolio_agents_metadata_services->>'agents_with_two_services')::numeric, 0) +
                    COALESCE((w.owner_portafolio_agents_metadata_services->>'agents_with_three_services')::numeric, 0) +
                    COALESCE((w.owner_portafolio_agents_metadata_services->>'agents_with_four_services')::numeric, 0) +
                    COALESCE((w.owner_portafolio_agents_metadata_services->>'agents_with_five_or_more_services')::numeric, 0) +
                    COALESCE((w.owner_portafolio_agents_metadata_services->>'agents_with_specialized_services')::numeric, 0);

                IF v_total_agents > 0 THEN
                    v_services_pct := (v_services_with_at_least_one / v_total_agents) * 100;
                    v_services_score := CASE WHEN v_services_pct >= 50 THEN 0.75 ELSE 0 END;
                END IF;
            END IF;

            v_portafolio_quality_agent_score := v_metadata_score + v_services_score;
            v_portafolio_quality_agent_reason := jsonb_build_object(
                'metadata_avg_score', round(v_metadata_richness_avg, 2),
                'services_with_at_least_one', v_services_with_at_least_one,
                'services_pct', round(v_services_pct, 2),
                'reason_eng', CASE 
                    WHEN v_portafolio_quality_agent_score = 1.5 THEN 'Excellent combination of high metadata richness and widespread services across portfolio, reflecting professional technical quality.'
                    WHEN v_portafolio_quality_agent_score > 0 THEN 'Moderate technical quality in portfolio with some metadata richness and services usage.'
                    ELSE 'Limited technical quality in portfolio (low metadata richness and services adoption), reducing perceived sophistication.'
                END,
                'reason_esp', CASE 
                    WHEN v_portafolio_quality_agent_score = 1.5 THEN 'Excelente combinación de alta riqueza de metadatos y servicios extendidos en el portafolio, reflejando calidad técnica profesional.'
                    WHEN v_portafolio_quality_agent_score > 0 THEN 'Calidad técnica moderada en el portafolio con algo de riqueza de metadatos y uso de servicios.'
                    ELSE 'Calidad técnica limitada en el portafolio (baja riqueza de metadatos y adopción de servicios), reduciendo la sofisticación percibida.'
                END
            );
        END;

        -- 2. Auditorías Externas Avanzada
        DECLARE
            v_total_audited bigint := COALESCE((w.owner_portafolio_agent_external_audits->>'total_valid_audits')::bigint, 0);
            v_good_excellent bigint :=
                COALESCE((w.owner_portafolio_agent_external_audits->>'agents_with_good_score')::bigint, 0) +
                COALESCE((w.owner_portafolio_agent_external_audits->>'agents_with_excellent_score')::bigint, 0);
            v_total_analyzed bigint := v_total_audited;
            v_coverage_pct numeric := 0;
            v_quality_pct numeric := 0;
        BEGIN

            v_coverage_pct := CASE WHEN v_active_agents > 0 THEN (v_total_audited::numeric / v_active_agents) * 100 ELSE 0 END;
            v_quality_pct := CASE WHEN v_total_analyzed > 0 THEN (v_good_excellent::numeric / v_total_analyzed) * 100 ELSE 0 END;

            IF v_coverage_pct >= 100 AND v_quality_pct >= 70 THEN
                v_portafolio_advanced_external_audits_score := 2.0;
                v_portafolio_advanced_external_audits_reason := jsonb_build_object(
                    'coverage_pct', round(v_coverage_pct, 2),
                    'quality_pct', round(v_quality_pct, 2),
                    'reason_eng', '100% audit coverage with high quality (≥70% good/excellent), representing best-in-class external validation across the entire portfolio.',
                    'reason_esp', 'Cobertura de auditorías del 100% con alta calidad (≥70% bueno/excelente), representando validación externa de clase mundial en todo el portafolio.'
                );
            ELSIF v_coverage_pct >= 50 AND v_quality_pct >= 50 THEN
                v_portafolio_advanced_external_audits_score := 1.0;
                v_portafolio_advanced_external_audits_reason := jsonb_build_object(
                    'coverage_pct', round(v_coverage_pct, 2),
                    'quality_pct', round(v_quality_pct, 2),
                    'reason_eng', 'Moderate audit coverage (≥50%) with acceptable quality, providing solid but not elite external validation.',
                    'reason_esp', 'Cobertura de auditorías moderada (≥50%) con calidad aceptable, proporcionando validación externa sólida pero no de élite.'
                );
            ELSE
                v_portafolio_advanced_external_audits_score := 0;
                v_portafolio_advanced_external_audits_reason := jsonb_build_object(
                    'coverage_pct', round(v_coverage_pct, 2),
                    'quality_pct', round(v_quality_pct, 2),
                    'reason_eng', 'Insufficient audit coverage or quality in portfolio, limiting external credibility and increasing perceived risk.',
                    'reason_esp', 'Cobertura o calidad de auditorías insuficiente en el portafolio, limitando la credibilidad externa y aumentando el riesgo percibido.'
                );
            END IF;
        END;

        -- 3. Actividad General del Portafolio
        DECLARE
            v_total_activity bigint :=
                COALESCE((w.owner_portafolio_agent_attestations->>'total_valid_attestations')::bigint, 0)
                + COALESCE((w.owner_portafolio_agent_on_chain_executions->>'agents_with_executions')::bigint, 0)
                + COALESCE((w.owner_portafolio_agent_activity_protocols->>'total_protocol_activities')::bigint, 0);
            v_good_excellent_activity bigint :=
                COALESCE((w.owner_portafolio_agent_attestations->>'agents_with_good_score')::bigint, 0) +
                COALESCE((w.owner_portafolio_agent_attestations->>'agents_with_excellent_score')::bigint, 0);
            v_activity_pct numeric := 0;
            v_quality_pct numeric := 0;
        BEGIN

            IF v_active_agents > 0 THEN
                v_activity_pct := (v_total_activity::numeric / v_active_agents) * 100;
                v_quality_pct := CASE WHEN v_total_activity > 0 THEN (v_good_excellent_activity::numeric / v_total_activity) * 100 ELSE 0 END;

                IF v_activity_pct >= 100 AND v_quality_pct >= 70 THEN
                    v_portafolio_general_activity_score := 2.5;
                    v_portafolio_general_activity_reason := jsonb_build_object(
                        'activity_pct', round(v_activity_pct, 2),
                        'quality_pct', round(v_quality_pct, 2),
                        'reason_eng', 'Exceptional portfolio-wide activity with full coverage and high quality, demonstrating strong sustained engagement.',
                        'reason_esp', 'Actividad excepcional a nivel de portafolio con cobertura completa y alta calidad, demostrando fuerte engagement sostenido.'
                    );
                ELSIF v_activity_pct >= 50 AND v_quality_pct >= 50 THEN
                    v_portafolio_general_activity_score := 1.25;
                    v_portafolio_general_activity_reason := jsonb_build_object(
                        'activity_pct', round(v_activity_pct, 2),
                        'quality_pct', round(v_quality_pct, 2),
                        'reason_eng', 'Moderate portfolio activity with acceptable coverage and quality.',
                        'reason_esp', 'Actividad moderada del portafolio con cobertura y calidad aceptables.'
                    );
                ELSE
                    v_portafolio_general_activity_score := 0;
                    v_portafolio_general_activity_reason := jsonb_build_object(
                        'activity_pct', round(v_activity_pct, 2),
                        'quality_pct', round(v_quality_pct, 2),
                        'reason_eng', 'Low portfolio activity or poor quality, indicating limited owner engagement across the portfolio.',
                        'reason_esp', 'Baja actividad del portafolio o baja calidad, indicando engagement limitado del owner en todo el portafolio.'
                    );
                END IF;
            END IF;
        END;

        v_block_advanced := v_portafolio_quality_agent_score + v_portafolio_advanced_external_audits_score + v_portafolio_general_activity_score;

        -- ====================== TOTAL ======================
        v_total_score := v_block_basic + v_block_intermediate + v_block_advanced;

                -- ====================== ANÁLISIS NARRATIVO DEL PILAR HISTORY (LENGUAJE DE NEGOCIO) ======================
        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'The agent has excellent historical maturity and strong ownership credibility.'
                    WHEN v_total_score >= 18.5 THEN 'The agent shows solid historical foundations with good portfolio health.'
                    WHEN v_total_score >= 15.0 THEN 'The agent has acceptable history but with noticeable weaknesses in stability or portfolio quality.'
                    WHEN v_total_score >= 11.0 THEN 'The agent has weak historical profile. Multiple concerns affect long-term trust.'
                    ELSE 'The agent exhibits very weak historical maturity. Significant red flags in ownership and portfolio.'
                END,

            'overall_assessment_esp', 
                CASE 
                    WHEN v_total_score >= 22.0 THEN 'El agente tiene una excelente madurez histórica y fuerte credibilidad de propiedad.'
                    WHEN v_total_score >= 18.5 THEN 'El agente muestra fundamentos históricos sólidos con buena salud de portafolio.'
                    WHEN v_total_score >= 15.0 THEN 'El agente tiene historia aceptable pero con debilidades notables en estabilidad o calidad de portafolio.'
                    WHEN v_total_score >= 11.0 THEN 'El agente tiene un perfil histórico débil. Múltiples preocupaciones afectan la confianza a largo plazo.'
                    ELSE 'El agente presenta una madurez histórica muy débil. Existen alertas rojas importantes en propiedad y portafolio.'
                END,

            'business_interpretation_eng', 
                'This History pillar evaluates the owner''s longevity, wallet stability, and the overall quality of their agent portfolio. ' ||
                CASE 
                    WHEN v_agent_owner_stability_score = 0 THEN 'Ownership instability stands out as a critical issue. '
                    WHEN v_portafolio_warnings_score = 0 THEN 'High warnings in the portfolio are raising risk flags. '
                    WHEN v_portafolio_quality_agent_score = 0 THEN 'Technical quality across the portfolio is concerning. '
                    ELSE 'The owner demonstrates reasonable historical commitment. '
                END ||
                'Overall, the current level suggests ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'high risk for long-term partnerships.'
                    WHEN v_total_score < 15.0 THEN 'moderate to high risk due to stability issues.'
                    WHEN v_total_score < 18.5 THEN 'moderate risk with room for improvement.'
                    ELSE 'strong historical credibility and low risk.'
                END,

            'business_interpretation_esp', 
                'Este pilar History evalúa la longevidad del owner, la estabilidad de su wallet y la calidad general de su portafolio de agentes. ' ||
                CASE 
                    WHEN v_agent_owner_stability_score = 0 THEN 'La inestabilidad de propiedad destaca como un problema crítico. '
                    WHEN v_portafolio_warnings_score = 0 THEN 'Altas advertencias en el portafolio están generando alertas de riesgo. '
                    WHEN v_portafolio_quality_agent_score = 0 THEN 'La calidad técnica del portafolio es preocupante. '
                    ELSE 'El owner demuestra un compromiso histórico razonable. '
                END ||
                'En general, el nivel actual sugiere ' || 
                CASE 
                    WHEN v_total_score < 11.0 THEN 'alto riesgo para partnerships a largo plazo.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado a alto por problemas de estabilidad.'
                    WHEN v_total_score < 18.5 THEN 'riesgo moderado con espacio para mejorar.'
                    ELSE 'fuerte credibilidad histórica y bajo riesgo.'
                END,

            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_owner_antiquity_score >= 2.0 THEN 'Proven owner longevity and ecosystem experience' END),
                        (CASE WHEN v_portafolio_agent_active_score = 3.0 THEN 'Healthy active portfolio with strong management' END),
                        (CASE WHEN v_portafolio_advanced_external_audits_score = 2.0 THEN 'Excellent external audit coverage across portfolio' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_owner_antiquity_score >= 2.0 THEN 'Antigüedad probada del owner y experiencia en el ecosistema' END),
                        (CASE WHEN v_portafolio_agent_active_score = 3.0 THEN 'Portafolio activo saludable con buena gestión' END),
                        (CASE WHEN v_portafolio_advanced_external_audits_score = 2.0 THEN 'Excelente cobertura de auditorías externas en el portafolio' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_agent_owner_stability_score = 0 THEN 'Frequent ownership changes detected' END),
                        (CASE WHEN v_portafolio_warnings_score = 0 THEN 'High number of warnings in the portfolio' END),
                        (CASE WHEN v_portafolio_quality_agent_score = 0 THEN 'Low technical quality and services adoption in portfolio' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES 
                        (CASE WHEN v_agent_owner_stability_score = 0 THEN 'Múltiples cambios de propiedad detectados' END),
                        (CASE WHEN v_portafolio_warnings_score = 0 THEN 'Alto número de advertencias en el portafolio' END),
                        (CASE WHEN v_portafolio_quality_agent_score = 0 THEN 'Baja calidad técnica y adopción de servicios en el portafolio' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),

            'recommendation_eng', 
                CASE 
                    WHEN v_agent_owner_stability_score = 0 THEN 'Priority action: Stabilize ownership by minimizing future owner changes and clearly communicating long-term commitment to the ecosystem.'
                    WHEN v_portafolio_warnings_score = 0 THEN 'Focus on cleaning the portfolio by addressing warnings, especially possible bots and spam attestations.'
                    WHEN v_portafolio_quality_agent_score = 0 THEN 'Improve technical quality across the portfolio by enhancing metadata richness and adding more services to owned agents.'
                    WHEN v_portafolio_advanced_external_audits_score = 0 THEN 'Increase external audit coverage across the portfolio to build stronger third-party credibility.'
                    ELSE 'Continue maintaining strong portfolio health and consider expanding high-quality external audits and paid activity.'
                END,

            'recommendation_esp', 
                CASE 
                    WHEN v_agent_owner_stability_score = 0 THEN 'Acción prioritaria: Estabilizar la propiedad minimizando cambios futuros de owner y comunicando claramente el compromiso a largo plazo.'
                    WHEN v_portafolio_warnings_score = 0 THEN 'Enfocarse en limpiar el portafolio resolviendo advertencias, especialmente posibles bots y attestations spam.'
                    WHEN v_portafolio_quality_agent_score = 0 THEN 'Mejorar la calidad técnica del portafolio aumentando la riqueza de metadatos y añadiendo más servicios a los agentes del owner.'
                    WHEN v_portafolio_advanced_external_audits_score = 0 THEN 'Aumentar la cobertura de auditorías externas en el portafolio para construir mayor credibilidad de terceros.'
                    ELSE 'Continuar manteniendo una buena salud del portafolio y considerar expandir auditorías externas de calidad y actividad pagada.'
                END,

            'last_calculated', now()
        );

        -- ====================== UPSERT ======================
        INSERT INTO index_humi.pillar_history (
            agent_id,
            owner_wallet_active_score, owner_wallet_active_reason,
            agent_owner_stability_score, agent_owner_stability_reason,
            owner_antiquity_score, owner_antiquity_reason,
            portafolio_agent_active_score, portafolio_agent_active_reason,
            portafolio_basic_external_audits_score, portafolio_basic_external_audits_reason,
            portafolio_warnings_score, portafolio_warnings_reason,
            portafolio_quality_agent_score, portafolio_quality_agent_reason,
            portafolio_advanced_external_audits_score, portafolio_advanced_external_audits_reason,
            portafolio_general_activity_score, portafolio_general_activity_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary, calculated_at, version, change_reason, calculated_by
        )
        VALUES (
            w.agent_id,
            v_owner_wallet_active_score, v_owner_wallet_active_reason,
            v_agent_owner_stability_score, v_agent_owner_stability_reason,
            v_owner_antiquity_score, v_owner_antiquity_reason,
            v_portafolio_agent_active_score, v_portafolio_agent_active_reason,
            v_portafolio_basic_external_audits_score, v_portafolio_basic_external_audits_reason,
            v_portafolio_warnings_score, v_portafolio_warnings_reason,
            v_portafolio_quality_agent_score, v_portafolio_quality_agent_reason,
            v_portafolio_advanced_external_audits_score, v_portafolio_advanced_external_audits_reason,
            v_portafolio_general_activity_score, v_portafolio_general_activity_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary, now(), v_new_version,
            'recalculation - owner_summary MVs + pillar_history', 'system'
        )
        ON CONFLICT (agent_id) DO UPDATE SET
            owner_wallet_active_score = EXCLUDED.owner_wallet_active_score,
            owner_wallet_active_reason = EXCLUDED.owner_wallet_active_reason,
            agent_owner_stability_score = EXCLUDED.agent_owner_stability_score,
            agent_owner_stability_reason = EXCLUDED.agent_owner_stability_reason,
            owner_antiquity_score = EXCLUDED.owner_antiquity_score,
            owner_antiquity_reason = EXCLUDED.owner_antiquity_reason,
            portafolio_agent_active_score = EXCLUDED.portafolio_agent_active_score,
            portafolio_agent_active_reason = EXCLUDED.portafolio_agent_active_reason,
            portafolio_basic_external_audits_score = EXCLUDED.portafolio_basic_external_audits_score,
            portafolio_basic_external_audits_reason = EXCLUDED.portafolio_basic_external_audits_reason,
            portafolio_warnings_score = EXCLUDED.portafolio_warnings_score,
            portafolio_warnings_reason = EXCLUDED.portafolio_warnings_reason,
            portafolio_quality_agent_score = EXCLUDED.portafolio_quality_agent_score,
            portafolio_quality_agent_reason = EXCLUDED.portafolio_quality_agent_reason,
            portafolio_advanced_external_audits_score = EXCLUDED.portafolio_advanced_external_audits_score,
            portafolio_advanced_external_audits_reason = EXCLUDED.portafolio_advanced_external_audits_reason,
            portafolio_general_activity_score = EXCLUDED.portafolio_general_activity_score,
            portafolio_general_activity_reason = EXCLUDED.portafolio_general_activity_reason,
            block_basic_score = EXCLUDED.block_basic_score,
            block_intermediate_score = EXCLUDED.block_intermediate_score,
            block_advanced_score = EXCLUDED.block_advanced_score,
            pillar_score = EXCLUDED.pillar_score,
            calculated_at = EXCLUDED.calculated_at,
            version = EXCLUDED.version,
            pillar_summary = EXCLUDED.pillar_summary,
            change_reason = EXCLUDED.change_reason,
            calculated_by = EXCLUDED.calculated_by;

    END LOOP;

    RETURN v_processed;
$$;
