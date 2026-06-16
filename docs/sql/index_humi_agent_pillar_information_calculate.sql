-- MVs erc_8004.agent_summary_* + pillar_information + pillar_information_tracking (sin agent_information).
-- Test: SELECT index_humi.agent_pillar_information_calculate(10);

CREATE OR REPLACE FUNCTION index_humi.agent_pillar_information_calculate(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO index_humi, erc_8004, public
AS $$
DECLARE
    v_processed integer := 0;
    w               record;

    v_name_clean text;

    -- Bloque Básica (10 pts)
    v_name_score                  numeric := 0;
    v_name_reason                 jsonb;
    v_description_score           numeric := 0;
    v_description_reason          jsonb;
    v_image_score                 numeric := 0;
    v_image_reason                jsonb;
    v_fuentes_basicas_score       numeric := 0;
    v_fuentes_basicas_reason      jsonb;

    -- Bloque Intermedia (9 pts)
    v_fuentes_externas_score      numeric := 0;
    v_fuentes_externas_reason     jsonb;
    v_web_email_score             numeric := 0;
    v_web_email_reason            jsonb;
    v_programmatic_score          numeric := 0;
    v_programmatic_reason         jsonb;
    v_supported_trust_score       numeric := 0;
    v_supported_trust_reason      jsonb;
    v_verification_score          numeric := 0;
    v_verification_reason         jsonb;
    v_technical_metadata_score    numeric := 0;
    v_technical_metadata_reason   jsonb;

    -- Bloque Avanzada (6 pts)
    v_mcp_score                   numeric := 0;
    v_mcp_reason                  jsonb;
    v_a2a_score                   numeric := 0;
    v_a2a_reason                  jsonb;
    v_advanced_technical_score    numeric := 0;
    v_advanced_technical_reason   jsonb;

    v_block_basic        numeric := 0;
    v_block_intermediate numeric := 0;
    v_block_advanced     numeric := 0;
    v_total_score        numeric := 0;

    v_tech_fields_count  integer := 0;
    v_pillar_summary     jsonb;
    v_new_version        text := '1';

BEGIN
    CREATE TEMP TABLE temp_target_agents (
        agent_id bigint PRIMARY KEY
    ) ON COMMIT DROP;

    INSERT INTO temp_target_agents (agent_id)
    SELECT a.id
    FROM erc_8004.agents a
    JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
    LEFT JOIN index_humi.pillar_information pi ON a.id = pi.agent_id
    WHERE ap.source = 'definitive'
      AND (pi.agent_id IS NULL OR pi.calculated_at < CURRENT_DATE::timestamptz)
    ORDER BY pi.calculated_at ASC NULLS FIRST
    LIMIT p_limit;

    SELECT COUNT(*)::integer INTO v_processed FROM temp_target_agents;

    INSERT INTO index_humi.pillar_information_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ta.agent_id, '[]'::jsonb, '[]'::jsonb
    FROM temp_target_agents ta
    ON CONFLICT (agent_id) DO NOTHING;

    WITH current_state AS (
        SELECT
            ta.agent_id,
            pi.pillar_score AS old_pillar_score,
            pi.block_basic_score AS old_block_basic_score,
            pi.block_intermediate_score AS old_block_intermediate_score,
            pi.block_advanced_score AS old_block_advanced_score,
            pi.calculated_at AS old_calculated_at,
            COALESCE(pit.pillar_score_last_30_days, '[]'::jsonb) AS old_last_30_days,
            COALESCE(pit.pillar_score_monthly, '[]'::jsonb) AS old_monthly
        FROM temp_target_agents ta
        LEFT JOIN index_humi.pillar_information pi ON pi.agent_id = ta.agent_id
        LEFT JOIN index_humi.pillar_information_tracking pit ON pit.agent_id = ta.agent_id
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
    INSERT INTO index_humi.pillar_information_tracking (agent_id, pillar_score_last_30_days, pillar_score_monthly)
    SELECT ct.agent_id, ct.new_last_30_days, ct.new_monthly
    FROM computed_tracking ct
    ON CONFLICT (agent_id) DO UPDATE SET
        pillar_score_last_30_days = EXCLUDED.pillar_score_last_30_days,
        pillar_score_monthly = EXCLUDED.pillar_score_monthly;

    FOR w IN
        SELECT
            ta.agent_id,
            a.name,
            a.description,
            a.image_url,
            COALESCE(ps.profiles, '{}'::jsonb) AS profiles,
            COALESCE(ssi.mcp_count, 0) AS mcp_count,
            COALESCE(ssi.a2a_count, 0) AS a2a_count,
            COALESCE(ssi.programmatic_count, 0) AS programmatic_count,
            ssd.web,
            ssd.email,
            COALESCE(s.services_breakdown, '{}'::jsonb) AS services_breakdown,
            COALESCE(vm.verification_methods_data, '[]'::jsonb) AS verification_methods,
            COALESCE(tch.technology_stacks_data, '[]'::jsonb) AS technology_stacks,
            COALESCE(s.technical_tools_data, '[]'::jsonb) AS technical_tools,
            COALESCE(s.technical_capabilites_data, '[]'::jsonb) AS technical_capabilities,
            COALESCE(x402.x402s, '[]'::jsonb) AS x402s
        FROM temp_target_agents ta
        JOIN erc_8004.agents a ON a.id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_services s ON s.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_services_information ssi ON ssi.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_services_detailed ssd ON ssd.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_verification_methods vm ON vm.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_metadata_technology tch ON tch.agent_id = ta.agent_id
        LEFT JOIN erc_8004.agent_summary_profiles ps ON ps.agent_id = ta.agent_id
        LEFT JOIN (
            SELECT
                agent_id,
                jsonb_agg(jsonb_build_object('type', type)) AS x402s
            FROM erc_8004.agent_metadata_x402
            GROUP BY agent_id
        ) x402 ON x402.agent_id = ta.agent_id
    LOOP

        -- ====================== BLOQUE BÁSICA (10 pts) ======================
        v_name_clean := lower(trim(regexp_replace(coalesce(w.name, ''), '[^a-zA-Z0-9\s]', '', 'g')));

        IF v_name_clean = '' OR v_name_clean = 'unnamed agent' THEN
            v_name_score := 0;
            v_name_reason := jsonb_build_object(
                'reason_eng', 'Empty or placeholder name detected, severely limiting the agent’s professional identity and trustworthiness.',
                'reason_esp', 'Nombre vacío o placeholder detectado, limitando severamente la identidad profesional y confiabilidad del agente.'
            );
        ELSIF v_name_clean IN ('test-agent','test_agent','testagent','demo-agent','placeholder')
           OR v_name_clean ~ '^test[-_ ]' OR v_name_clean ~ '^demo[-_ ]'
           OR v_name_clean ~ '^example[-_ ]' OR v_name_clean ~ '^temp[-_ ]'
           OR v_name_clean ~ '\<(dummy|fake|spam|placeholder)\>' THEN
            v_name_score := 0;
            v_name_reason := jsonb_build_object(
                'reason_eng', 'Suspicious or dummy name detected, indicating low credibility and potential test/spam behavior.',
                'reason_esp', 'Nombre sospechoso o dummy detectado, indicando baja credibilidad y posible comportamiento de prueba/spam.'
            );
        ELSE
            v_name_score := CASE WHEN length(v_name_clean) >= 3 THEN 3.0 ELSE 1.0 END;
            v_name_reason := jsonb_build_object(
                'reason_eng', 'Clean and professional name with sufficient length, contributing positively to the agent’s brand identity.',
                'reason_esp', 'Nombre limpio y profesional con longitud suficiente, contribuyendo positivamente a la identidad de marca del agente.'
            );
        END IF;

        DECLARE
            v_desc_clean text := trim(coalesce(w.description, ''));
            d_is_repetitive boolean;
        BEGIN
            SELECT (length(v_desc_clean) > 50 AND
                   (length(v_desc_clean) - length(replace(lower(v_desc_clean), v_name_clean, ''))) / nullif(length(v_name_clean), 0) > 3)
            INTO d_is_repetitive;

            IF v_desc_clean = '' OR length(v_desc_clean) < 10 THEN
                v_description_score := 0;
                v_description_reason := jsonb_build_object(
                    'reason_eng', 'Description is too short or empty, limiting the agent’s ability to communicate its purpose and value.',
                    'reason_esp', 'La descripción es demasiado corta o está vacía, limitando la capacidad del agente para comunicar su propósito y valor.'
                );
            ELSIF d_is_repetitive THEN
                v_description_score := 0.9;
                v_description_reason := jsonb_build_object(
                    'reason_eng', 'Repetitive or spammy description pattern detected, reducing perceived professionalism.',
                    'reason_esp', 'Patrón de descripción repetitiva o spam detectado, reduciendo la profesionalidad percibida.'
                );
            ELSE
                v_description_score := CASE
                    WHEN length(v_desc_clean) >= 80 THEN 3.0
                    WHEN length(v_desc_clean) >= 40 THEN 1.8
                    ELSE 0.9 END;
                v_description_reason := jsonb_build_object(
                    'reason_eng', 'Description provides meaningful context about the agent’s capabilities and purpose.',
                    'reason_esp', 'La descripción proporciona contexto significativo sobre las capacidades y propósito del agente.',
                    'length', length(v_desc_clean)
                );
            END IF;
        END;

        IF w.image_url IS NOT NULL AND w.image_url ~* '\.(png|jpg|jpeg|webp|svg|gif|bmp)$' THEN
            v_image_score := 1.5;
            v_image_reason := jsonb_build_object(
                'reason_eng', 'Valid professional image URL present, significantly enhancing the agent’s visual identity and perceived legitimacy.',
                'reason_esp', 'URL de imagen profesional válida presente, mejorando significativamente la identidad visual y legitimidad percibida del agente.'
            );
        ELSE
            v_image_score := 0;
            v_image_reason := jsonb_build_object(
                'reason_eng', 'No valid image or invalid URL, reducing the agent’s visual appeal and professional presentation.',
                'reason_esp', 'Sin imagen válida o URL inválida, reduciendo el atractivo visual y la presentación profesional del agente.'
            );
        END IF;

        IF (w.profiles->>'chain')::int >= 1 AND (w.profiles->>'agent_uri')::int >= 1 THEN
            v_fuentes_basicas_score := 2.5;
            v_fuentes_basicas_reason := jsonb_build_object(
                'reason_eng', 'Core official sources (chain registration + URI) are present, establishing strong foundational identity and discoverability.',
                'reason_esp', 'Fuentes oficiales principales (registro en chain + URI) presentes, estableciendo una identidad fundamental sólida y descubribilidad.'
            );
        ELSE
            v_fuentes_basicas_score := 0;
            v_fuentes_basicas_reason := jsonb_build_object(
                'reason_eng', 'Missing essential basic sources (chain or URI), weakening the agent’s official identity and traceability.',
                'reason_esp', 'Faltan fuentes básicas esenciales (chain o URI), debilitando la identidad oficial y trazabilidad del agente.'
            );
        END IF;

        v_block_basic := v_name_score + v_description_score + v_image_score + v_fuentes_basicas_score;

        -- ====================== BLOQUE INTERMEDIA (9 pts) ======================
        DECLARE
            p jsonb := coalesce(w.profiles, '{}'::jsonb);
            v_val_uri_did  integer := coalesce((p->>'agent_uri_did')::int, 0);
            v_val_feed_did integer := coalesce((p->>'feedback_did')::int, 0);
            v_val_feed     integer := coalesce((p->>'feedback')::int, 0);
            v_val_feed_ext integer := coalesce((p->>'feedback_external_source')::int, 0);
            v_ext_count    integer := v_val_uri_did + v_val_feed_did + v_val_feed + v_val_feed_ext;
        BEGIN
            IF v_ext_count >= 1 THEN
                v_fuentes_externas_score := v_ext_count * 0.75;
                v_fuentes_externas_reason := jsonb_build_object(
                    'ext_sources_count', v_ext_count,
                    'reason_eng', 'Multiple external sources detected, enhancing the agent’s credibility and external validation.',
                    'reason_esp', 'Múltiples fuentes externas detectadas, mejorando la credibilidad y validación externa del agente.'
                );
            ELSE
                v_fuentes_externas_score := 0;
                v_fuentes_externas_reason := jsonb_build_object(
                    'reason_eng', 'No external sources found, limiting external validation and trust signals.',
                    'reason_esp', 'No se encontraron fuentes externas, limitando la validación externa y las señales de confianza.'
                );
            END IF;
        END;

        v_web_email_score := CASE
            WHEN (w.web IS NOT NULL AND btrim(w.web) <> '')
              OR (w.email IS NOT NULL AND btrim(w.email) <> '') THEN 1.0
            ELSE 0
        END;
        v_web_email_reason := jsonb_build_object(
            'has_web_email', v_web_email_score > 0,
            'reason_eng', CASE WHEN v_web_email_score > 0 THEN 'Contact endpoints (web/email) present, enabling direct business communication and increasing accessibility.'
                          ELSE 'No contact endpoints (web/email) found, reducing accessibility and business trust.'
                     END,
            'reason_esp', CASE WHEN v_web_email_score > 0 THEN 'Endpoints de contacto (web/email) presentes, permitiendo comunicación directa de negocio y aumentando la accesibilidad.'
                          ELSE 'No se encontraron endpoints de contacto (web/email), reduciendo la accesibilidad y confianza empresarial.'
                     END
        );

        v_programmatic_score := CASE WHEN w.programmatic_count > 0 THEN 1.5 ELSE 0 END;
        v_programmatic_reason := jsonb_build_object(
            'has_programmatic', v_programmatic_score > 0,
            'reason_eng', CASE WHEN v_programmatic_score > 0 THEN 'Programmatic/API endpoints present, indicating advanced integration capability and developer-friendly design.'
                          ELSE 'No programmatic endpoints found, limiting technical integration potential.'
                     END,
            'reason_esp', CASE WHEN v_programmatic_score > 0 THEN 'Endpoints Programmatic/API presentes, indicando capacidad avanzada de integración y diseño amigable para desarrolladores.'
                          ELSE 'No se encontraron endpoints programáticos, limitando el potencial de integración técnica.'
                     END
        );

        v_supported_trust_score := CASE WHEN COALESCE((w.services_breakdown->>'supported_trust')::int, 0) > 0 THEN 1.0 ELSE 0 END;
        v_supported_trust_reason := jsonb_build_object(
            'has_supported_trust', v_supported_trust_score > 0,
            'reason_eng', CASE WHEN v_supported_trust_score > 0 THEN 'Explicit supported trust declarations present, strengthening perceived reliability and ecosystem alignment.'
                          ELSE 'No supported trust declarations found, missing an important trust signal.'
                     END,
            'reason_esp', CASE WHEN v_supported_trust_score > 0 THEN 'Declaraciones explícitas de trust soportado presentes, fortaleciendo la confiabilidad percibida y alineación con el ecosistema.'
                          ELSE 'No se encontraron declaraciones de trust soportado, faltando una señal importante de confianza.'
                     END
        );

        v_verification_score := CASE WHEN jsonb_typeof(w.verification_methods) = 'array' AND jsonb_array_length(w.verification_methods) > 0 THEN 1.0 ELSE 0 END;
        v_verification_reason := jsonb_build_object(
            'has_verification', v_verification_score > 0,
            'reason_eng', CASE WHEN v_verification_score > 0 THEN 'Verification methods present, providing strong proof of authenticity and increasing overall agent credibility.'
                          ELSE 'No verification methods found, reducing confidence in the agent’s authenticity.'
                     END,
            'reason_esp', CASE WHEN v_verification_score > 0 THEN 'Métodos de verificación presentes, proporcionando fuerte prueba de autenticidad y aumentando la credibilidad general del agente.'
                          ELSE 'No se encontraron métodos de verificación, reduciendo la confianza en la autenticidad del agente.'
                     END
        );

        v_tech_fields_count :=
            (CASE WHEN COALESCE((w.services_breakdown->>'skills')::int, 0) > 0 THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE((w.services_breakdown->>'capabilities')::int, 0) > 0 THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE((w.services_breakdown->>'oasf_skills')::int, 0) > 0 THEN 1 ELSE 0 END) +
            (CASE WHEN COALESCE((w.services_breakdown->>'oasf_domains')::int, 0) > 0 THEN 1 ELSE 0 END);

        v_technical_metadata_score := CASE
            WHEN v_tech_fields_count >= 2 THEN 1.5
            WHEN v_tech_fields_count = 1 THEN 1.0
            ELSE 0.0 END;

        v_technical_metadata_reason := jsonb_build_object(
            'fields_count', v_tech_fields_count,
            'reason_eng', CASE
                WHEN v_tech_fields_count >= 2 THEN 'Rich basic technical metadata across multiple fields, demonstrating clear technical capabilities.'
                WHEN v_tech_fields_count = 1 THEN 'Basic technical metadata present in one field, showing initial technical definition.'
                ELSE 'Minimal or no technical metadata, limiting understanding of the agent’s technical capabilities.'
            END,
            'reason_esp', CASE
                WHEN v_tech_fields_count >= 2 THEN 'Metadatos técnicos básicos ricos en múltiples campos, demostrando capacidades técnicas claras.'
                WHEN v_tech_fields_count = 1 THEN 'Metadatos técnicos básicos presentes en un campo, mostrando definición técnica inicial.'
                ELSE 'Metadatos técnicos mínimos o nulos, limitando la comprensión de las capacidades técnicas del agente.'
            END
        );

        v_block_intermediate := v_fuentes_externas_score + v_web_email_score + v_programmatic_score +
                                v_supported_trust_score + v_verification_score + v_technical_metadata_score;

        -- ====================== BLOQUE AVANZADA (6 pts) ======================
        v_mcp_score := CASE WHEN w.mcp_count > 0 THEN 2.0 ELSE 0 END;
        v_mcp_reason := jsonb_build_object(
            'has_mcp', v_mcp_score > 0,
            'reason_eng', CASE WHEN v_mcp_score > 0 THEN 'MCP endpoint present, enabling advanced machine-to-machine communication and modern protocol integration.'
                          ELSE 'No MCP endpoint found, missing advanced communication capability.'
                     END,
            'reason_esp', CASE WHEN v_mcp_score > 0 THEN 'Endpoint MCP presente, permitiendo comunicación máquina-a-máquina avanzada e integración de protocolos modernos.'
                          ELSE 'No se encontró endpoint MCP, faltando capacidad de comunicación avanzada.'
                     END
        );

        v_a2a_score := CASE WHEN w.a2a_count > 0 THEN 2.0 ELSE 0 END;
        v_a2a_reason := jsonb_build_object(
            'has_a2a', v_a2a_score > 0,
            'reason_eng', CASE WHEN v_a2a_score > 0 THEN 'A2A endpoint present, supporting advanced agent-to-agent collaboration and ecosystem interoperability.'
                          ELSE 'No A2A endpoint found, limiting agent-to-agent interaction potential.'
                     END,
            'reason_esp', CASE WHEN v_a2a_score > 0 THEN 'Endpoint A2A presente, soportando colaboración agente-a-agente avanzada e interoperabilidad en el ecosistema.'
                          ELSE 'No se encontró endpoint A2A, limitando el potencial de interacción agente-a-agente.'
                     END
        );

        DECLARE
            v_adv_count integer := 0;
        BEGIN
            v_adv_count := (CASE WHEN jsonb_typeof(w.technology_stacks) = 'array' AND jsonb_array_length(w.technology_stacks) > 0 THEN 1 ELSE 0 END) +
                           (CASE WHEN jsonb_typeof(w.x402s) = 'array' AND jsonb_array_length(w.x402s) > 0 THEN 1 ELSE 0 END) +
                           (CASE WHEN jsonb_typeof(w.technical_tools) = 'array' AND jsonb_array_length(w.technical_tools) > 0 THEN 1 ELSE 0 END) +
                           (CASE WHEN jsonb_typeof(w.technical_capabilities) = 'array' AND jsonb_array_length(w.technical_capabilities) > 0 THEN 1 ELSE 0 END);
            v_advanced_technical_score := CASE WHEN v_adv_count >= 2 THEN 2.0 ELSE 0 END;
            v_advanced_technical_reason := jsonb_build_object(
                'advanced_tech_count', v_adv_count,
                'reason_eng', CASE
                    WHEN v_adv_count >= 2 THEN 'Advanced technical setup with multiple professional components (tech stack, x402, tools, capabilities), indicating high maturity.'
                    ELSE 'Limited advanced technical configuration, reducing perceived sophistication.'
                END,
                'reason_esp', CASE
                    WHEN v_adv_count >= 2 THEN 'Configuración técnica avanzada con múltiples componentes profesionales (tech stack, x402, tools, capabilities), indicando alta madurez.'
                    ELSE 'Configuración técnica avanzada limitada, reduciendo la sofisticación percibida.'
                END
            );
        END;

        v_block_advanced := v_mcp_score + v_a2a_score + v_advanced_technical_score;
        v_total_score := v_block_basic + v_block_intermediate + v_block_advanced;

        v_pillar_summary := jsonb_build_object(
            'overall_assessment_eng',
                CASE
                    WHEN v_total_score >= 22.0 THEN 'The agent demonstrates excellent information maturity with strong, professional and verifiable identity.'
                    WHEN v_total_score >= 18.5 THEN 'The agent has solid information foundations with good external presence and technical definition.'
                    WHEN v_total_score >= 15.0 THEN 'The agent has acceptable information quality but shows clear gaps in communication and verification.'
                    WHEN v_total_score >= 11.0 THEN 'The agent has weak information profile. Several key identity and discoverability elements are missing.'
                    ELSE 'The agent exhibits very weak information quality. Fundamental identity and credibility signals are severely lacking.'
                END,
            'overall_assessment_esp',
                CASE
                    WHEN v_total_score >= 22.0 THEN 'El agente demuestra una excelente madurez de información con una identidad profesional fuerte y verificable.'
                    WHEN v_total_score >= 18.5 THEN 'El agente tiene fundamentos sólidos de información con buena presencia externa y definición técnica.'
                    WHEN v_total_score >= 15.0 THEN 'El agente tiene calidad de información aceptable pero presenta brechas claras en comunicación y verificación.'
                    WHEN v_total_score >= 11.0 THEN 'El agente tiene un perfil de información débil. Faltan varios elementos clave de identidad y descubribilidad.'
                    ELSE 'El agente presenta una calidad de información muy débil. Las señales fundamentales de identidad y credibilidad están severamente ausentes.'
                END,
            'business_interpretation_eng',
                'This Information pillar assesses how well the agent presents itself to the world — its name, description, visual identity, external sources, and technical accessibility. ' ||
                CASE
                    WHEN v_name_score = 0 OR v_description_score = 0 THEN 'Critical gaps in basic identity (name and description) severely limit professional perception. '
                    WHEN v_image_score = 0 THEN 'Missing professional image reduces visual credibility. '
                    WHEN v_fuentes_externas_score = 0 THEN 'Lack of external sources weakens third-party validation. '
                    WHEN v_verification_score = 0 THEN 'Absence of verification methods reduces trust. '
                    ELSE 'The agent maintains reasonable information completeness. '
                END ||
                'Overall, the current level suggests ' ||
                CASE
                    WHEN v_total_score < 11.0 THEN 'high risk of being perceived as unprofessional or incomplete.'
                    WHEN v_total_score < 15.0 THEN 'moderate risk with limited discoverability.'
                    WHEN v_total_score < 18.5 THEN 'acceptable but not competitive presentation.'
                    ELSE 'strong market presence and high credibility potential.'
                END,
            'business_interpretation_esp',
                'Este pilar Information evalúa qué tan bien se presenta el agente al mundo — su nombre, descripción, identidad visual, fuentes externas y accesibilidad técnica. ' ||
                CASE
                    WHEN v_name_score = 0 OR v_description_score = 0 THEN 'Brechas críticas en identidad básica (nombre y descripción) limitan severamente la percepción profesional. '
                    WHEN v_image_score = 0 THEN 'Falta de imagen profesional reduce la credibilidad visual. '
                    WHEN v_fuentes_externas_score = 0 THEN 'Falta de fuentes externas debilita la validación de terceros. '
                    WHEN v_verification_score = 0 THEN 'Ausencia de métodos de verificación reduce la confianza. '
                    ELSE 'El agente mantiene una completitud de información razonable. '
                END ||
                'En general, el nivel actual sugiere ' ||
                CASE
                    WHEN v_total_score < 11.0 THEN 'alto riesgo de ser percibido como poco profesional o incompleto.'
                    WHEN v_total_score < 15.0 THEN 'riesgo moderado con descubribilidad limitada.'
                    WHEN v_total_score < 18.5 THEN 'presentación aceptable pero no competitiva.'
                    ELSE 'fuerte presencia en el mercado y alto potencial de credibilidad.'
                END,
            'key_strengths_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_name_score = 3.0 THEN 'Professional and clear name' END),
                        (CASE WHEN v_description_score >= 1.8 THEN 'Rich and meaningful description' END),
                        (CASE WHEN v_mcp_score > 0 OR v_a2a_score > 0 THEN 'Advanced technical integration capabilities (MCP/A2A)' END),
                        (CASE WHEN v_verification_score > 0 THEN 'Verification methods present' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'key_strengths_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_name_score = 3.0 THEN 'Nombre profesional y claro' END),
                        (CASE WHEN v_description_score >= 1.8 THEN 'Descripción rica y significativa' END),
                        (CASE WHEN v_mcp_score > 0 OR v_a2a_score > 0 THEN 'Capacidades avanzadas de integración técnica (MCP/A2A)' END),
                        (CASE WHEN v_verification_score > 0 THEN 'Métodos de verificación presentes' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'main_concerns_eng', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_name_score = 0 THEN 'Missing or placeholder name' END),
                        (CASE WHEN v_description_score = 0 THEN 'Insufficient or empty description' END),
                        (CASE WHEN v_image_score = 0 THEN 'No professional image' END),
                        (CASE WHEN v_fuentes_externas_score = 0 THEN 'Lack of external validation sources' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'main_concerns_esp', (
                SELECT jsonb_agg(item) FROM (
                    VALUES
                        (CASE WHEN v_name_score = 0 THEN 'Nombre ausente o placeholder' END),
                        (CASE WHEN v_description_score = 0 THEN 'Descripción insuficiente o vacía' END),
                        (CASE WHEN v_image_score = 0 THEN 'Sin imagen profesional' END),
                        (CASE WHEN v_fuentes_externas_score = 0 THEN 'Falta de fuentes de validación externa' END)
                ) AS t(item) WHERE item IS NOT NULL
            ),
            'recommendation_eng',
                CASE
                    WHEN v_name_score = 0 OR v_description_score = 0 THEN 'Priority: Define a clear, professional name and write a comprehensive description that communicates the agent’s value proposition.'
                    WHEN v_image_score = 0 THEN 'Add a high-quality professional image to significantly improve visual identity and first impression.'
                    WHEN v_fuentes_externas_score = 0 THEN 'Incorporate external sources (URI, DID, feedback) to strengthen credibility through third-party validation.'
                    WHEN v_verification_score = 0 THEN 'Implement verification methods to increase trust and authenticity signals.'
                    ELSE 'Continue enhancing advanced technical endpoints (MCP/A2A) and technical metadata to reach elite information maturity.'
                END,
            'recommendation_esp',
                CASE
                    WHEN v_name_score = 0 OR v_description_score = 0 THEN 'Prioridad: Definir un nombre claro y profesional y escribir una descripción completa que comunique la propuesta de valor del agente.'
                    WHEN v_image_score = 0 THEN 'Agregar una imagen profesional de alta calidad para mejorar significativamente la identidad visual y la primera impresión.'
                    WHEN v_fuentes_externas_score = 0 THEN 'Incorporar fuentes externas (URI, DID, feedback) para fortalecer la credibilidad mediante validación de terceros.'
                    WHEN v_verification_score = 0 THEN 'Implementar métodos de verificación para aumentar las señales de confianza y autenticidad.'
                    ELSE 'Continuar mejorando endpoints técnicos avanzados (MCP/A2A) y metadatos técnicos para alcanzar madurez de información de élite.'
                END,
            'last_calculated', now()
        );

        INSERT INTO index_humi.pillar_information (
            agent_id,
            name_score, name_reason,
            description_score, description_reason,
            image_score, image_reason,
            profiles_score, profiles_reason,
            extended_profiles_score, extended_profiles_reason,
            basic_contact_score, basic_contact_reason,
            extended_contact_score, extended_contact_reason,
            supported_trust_score, supported_trust_reason,
            verification_methods_score, verification_methods_reason,
            basic_technical_metadata_score, basic_technical_metadata_reason,
            mcp_endpoint_score, mcp_endpoint_reason,
            a2a_endpoint_score, a2a_endpoint_reason,
            advanced_technical_metadata_score, advanced_technical_metadata_reason,
            block_basic_score, block_intermediate_score, block_advanced_score,
            pillar_score, pillar_summary,
            calculated_at, version, change_reason, calculated_by
        )
        VALUES (
            w.agent_id,
            v_name_score, v_name_reason,
            v_description_score, v_description_reason,
            v_image_score, v_image_reason,
            v_fuentes_basicas_score, v_fuentes_basicas_reason,
            v_fuentes_externas_score, v_fuentes_externas_reason,
            v_web_email_score, v_web_email_reason,
            v_programmatic_score, v_programmatic_reason,
            v_supported_trust_score, v_supported_trust_reason,
            v_verification_score, v_verification_reason,
            v_technical_metadata_score, v_technical_metadata_reason,
            v_mcp_score, v_mcp_reason,
            v_a2a_score, v_a2a_reason,
            v_advanced_technical_score, v_advanced_technical_reason,
            v_block_basic, v_block_intermediate, v_block_advanced,
            v_total_score, v_pillar_summary,
            now(), v_new_version,
            'recalculation - agent_summary MVs + pillar_information', 'system'
        )
        ON CONFLICT (agent_id) DO UPDATE SET
            name_score = EXCLUDED.name_score,
            name_reason = EXCLUDED.name_reason,
            description_score = EXCLUDED.description_score,
            description_reason = EXCLUDED.description_reason,
            image_score = EXCLUDED.image_score,
            image_reason = EXCLUDED.image_reason,
            profiles_score = EXCLUDED.profiles_score,
            profiles_reason = EXCLUDED.profiles_reason,
            extended_profiles_score = EXCLUDED.extended_profiles_score,
            extended_profiles_reason = EXCLUDED.extended_profiles_reason,
            basic_contact_score = EXCLUDED.basic_contact_score,
            basic_contact_reason = EXCLUDED.basic_contact_reason,
            extended_contact_score = EXCLUDED.extended_contact_score,
            extended_contact_reason = EXCLUDED.extended_contact_reason,
            supported_trust_score = EXCLUDED.supported_trust_score,
            supported_trust_reason = EXCLUDED.supported_trust_reason,
            verification_methods_score = EXCLUDED.verification_methods_score,
            verification_methods_reason = EXCLUDED.verification_methods_reason,
            basic_technical_metadata_score = EXCLUDED.basic_technical_metadata_score,
            basic_technical_metadata_reason = EXCLUDED.basic_technical_metadata_reason,
            mcp_endpoint_score = EXCLUDED.mcp_endpoint_score,
            mcp_endpoint_reason = EXCLUDED.mcp_endpoint_reason,
            a2a_endpoint_score = EXCLUDED.a2a_endpoint_score,
            a2a_endpoint_reason = EXCLUDED.a2a_endpoint_reason,
            advanced_technical_metadata_score = EXCLUDED.advanced_technical_metadata_score,
            advanced_technical_metadata_reason = EXCLUDED.advanced_technical_metadata_reason,
            block_basic_score = EXCLUDED.block_basic_score,
            block_intermediate_score = EXCLUDED.block_intermediate_score,
            block_advanced_score = EXCLUDED.block_advanced_score,
            pillar_score = EXCLUDED.pillar_score,
            calculated_at = EXCLUDED.calculated_at,
            version = EXCLUDED.version,
            change_reason = EXCLUDED.change_reason,
            pillar_summary = EXCLUDED.pillar_summary,
            calculated_by = EXCLUDED.calculated_by;

    END LOOP;

    RETURN v_processed;
END;
$$;
