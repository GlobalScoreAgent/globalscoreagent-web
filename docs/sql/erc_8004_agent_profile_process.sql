-- Optimizado: actualiza name_md5 / description_md5 / uri_raw_md5 al sincronizar agents.
-- Invalida duplicate_calculate_at si cambian name o description.
-- Test: SELECT erc_8004.agent_profile_process(5);

CREATE OR REPLACE FUNCTION erc_8004.agent_profile_process(p_limit_agents integer)
RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO erc_8004, public
    AS $$
DECLARE
    v_agent_rec      RECORD;
    v_processed_ags  integer := 0;
    v_errors_count   integer := 0;
    v_error_details  jsonb := '[]'::jsonb;
    v_final          RECORD;
    v_sub_item       jsonb;
    v_tech_category  text;
    v_perm_item      RECORD;

    -- Variables para unificaciÃ³n de servicios
    v_service_type_raw text;
    v_internal_type    text;

    -- Variables para Metadata Richness (Desglose para la nueva tabla)
    v_s_base_reg    numeric := 0;
    v_s_name        numeric := 0;
    v_s_desc        numeric := 0;
    v_s_img         numeric := 0;
    v_s_tags        numeric := 0;
    v_s_impl        numeric := 0;
    v_s_oasf_s      numeric := 0;
    v_s_oasf_d      numeric := 0;
    v_s_trust       numeric := 0;
    v_s_tech_caps   numeric := 0;
    v_s_perms       numeric := 0;
    v_s_x402_sup    numeric := 0;
    v_s_services    numeric := 0;
    v_s_tech        numeric := 0;
    v_s_skills      numeric := 0;
    v_s_caps        numeric := 0;
    v_s_verif       numeric := 0;
    v_s_has_x402    numeric := 0;
    v_s_staking     numeric := 0;
    v_s_payments    numeric := 0;
    v_s_gov_type    numeric := 0;
    v_s_gov_wallet  numeric := 0;
    v_s_t_prompts   numeric := 0;
    v_s_t_tools     numeric := 0;
    
    v_total_score   numeric := 0;
    v_richness_layers jsonb;

    -- NUEVO: Metadata Category
    v_metadata_category text;
BEGIN
    FOR v_agent_rec IN (
        SELECT DISTINCT agent_id FROM erc_8004.agent_profiles 
        WHERE is_processed = false AND source <> 'definitive'
        LIMIT p_limit_agents
    ) LOOP

        -- Reiniciar contadores para el nuevo agente
        v_s_name := 0; v_s_desc := 0; v_s_img := 0; v_s_tags := 0; 
        v_s_impl := 0; v_s_oasf_s := 0; v_s_oasf_d := 0; v_s_trust := 0;
        v_s_tech_caps := 0; v_s_perms := 0; v_s_x402_sup := 0; v_s_services := 0;
        v_s_tech := 0; v_s_skills := 0; v_s_caps := 0; v_s_verif := 0;
        v_s_has_x402 := 0; v_s_staking := 0; v_s_payments := 0; v_s_gov_type := 0;
        v_s_gov_wallet := 0; v_s_t_prompts := 0; v_s_t_tools := 0;

        BEGIN
            --- 1. CONSOLIDACIÃ“N DINÃMICA POR CAMPO
            WITH source_ranked AS (
                SELECT ap.*, COALESCE(ps.priority_level, 999) as prio
                FROM erc_8004.agent_profiles ap
                LEFT JOIN erc_8004.profiles_sources ps ON ap.source = ps.source
                WHERE ap.agent_id = v_agent_rec.agent_id AND ap.source <> 'definitive'
            ),
            authoritative AS (
                SELECT 
                    agent_id,
                    -- === AJUSTE SEGÃšN TU NUEVA INDICACIÃ“N: name permite "Unnamed Agent" ===
                    (array_agg(name ORDER BY prio ASC, source_updated_at DESC) 
                     FILTER (WHERE name IS NOT NULL 
                             AND TRIM(COALESCE(name, '')) <> '' ))[1] as f_name,
                    -- description e image: solo si tienen contenido real (sino queda NULL)
                    (array_agg(description ORDER BY prio ASC, source_updated_at DESC) 
                     FILTER (WHERE description IS NOT NULL 
                             AND TRIM(COALESCE(description, '')) <> '' 
                             AND LENGTH(TRIM(description)) >= 10))[1] as f_desc,
                    (array_agg(image ORDER BY prio ASC, source_updated_at DESC) 
                     FILTER (WHERE image IS NOT NULL 
                             AND TRIM(COALESCE(image, '')) <> ''))[1] as f_img,
                    (array_agg(governance_type ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE governance_type IS NOT NULL))[1] as f_gov_type,
                    (array_agg(governance_wallet ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE governance_wallet IS NOT NULL))[1] as f_gov_wallet,
                    (array_agg(has_x402_support ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE has_x402_support IS NOT NULL))[1] as f_has_x402,
                    (jsonb_agg(implementation_information ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE implementation_information IS NOT NULL))->0 as f_impl,
                    (jsonb_agg(skills ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE skills IS NOT NULL AND jsonb_typeof(skills) <> 'null'))->0 as f_skills,
                    (jsonb_agg(capabilities ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE capabilities IS NOT NULL))->0 as f_caps,
                    (jsonb_agg(tags ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE tags IS NOT NULL))->0 as f_tags,
                    (jsonb_agg(services ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE services IS NOT NULL))->0 as f_services,
                    (jsonb_agg(technologies ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE technologies IS NOT NULL))->0 as f_tech,
                    (jsonb_agg(x402_data ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE x402_data IS NOT NULL))->0 as f_x402_json,
                    (jsonb_agg(permissions ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE permissions IS NOT NULL))->0 as f_perms,
                    (jsonb_agg(supported_trust ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE supported_trust IS NOT NULL))->0 as f_trust,
                    (jsonb_agg(oasf_skills ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE oasf_skills IS NOT NULL))->0 as f_oasf_skills,
                    (jsonb_agg(oasf_domains ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE oasf_domains IS NOT NULL))->0 as f_oasf_domains,
                    (jsonb_agg(staking_integration ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE staking_integration IS NOT NULL))->0 as f_staking,
                    (jsonb_agg(payment_protocols ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE payment_protocols IS NOT NULL))->0 as f_payments,
                    (jsonb_agg(verification_methods ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE verification_methods IS NOT NULL))->0 as f_verif,
                    (jsonb_agg(technical_tools ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE technical_tools IS NOT NULL))->0 as f_tech_tools,
                    (jsonb_agg(technical_prompts ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE technical_prompts IS NOT NULL))->0 as f_tech_prompts,
                    (jsonb_agg(technical_capabilities ORDER BY prio ASC, source_updated_at DESC) FILTER (WHERE technical_capabilities IS NOT NULL))->0 as f_tech_caps
                FROM source_ranked GROUP BY agent_id
            )
            SELECT * INTO v_final FROM authoritative;

                        -- ====================== NUEVO CÃLCULO VERTICAL METADATA RICHNESS (0-100) ======================
            DECLARE
                -- Scores por fase
                v_basic_score        numeric := 0;   -- 0-40
                v_intermediate_score numeric := 0;   -- +30 â†’ total 40-70
                v_advanced_score     numeric := 0;   -- +30 â†’ total 70-100
                v_total_richness     numeric := 0;

                -- Scores individuales por Ã­tem (para guardar en la tabla)
                v_name_score         numeric := 0;
                v_description_score  numeric := 0;
                v_image_score        numeric := 0;
                v_tags_score         numeric := 0;
                v_bonus_description  numeric := 0;
                v_bonus_tags         numeric := 0;

                v_verification_methods_score numeric := 0;
                v_supported_trust_score      numeric := 0;
                v_services_score             numeric := 0;
                v_payments_score             numeric := 0;
                v_governance_score           numeric := 0;
                v_bonus_services_score       numeric := 0;
                v_bonus_x402                 numeric := 0;

                v_oasf_score                 numeric := 0;
                v_technical_tools_score      numeric := 0;
                v_technical_prompts_score    numeric := 0;
                v_technical_capabilities_score numeric := 0;
                v_bonus_technical_elements_score numeric := 0;
            BEGIN
                -- 1. Fase BÃ¡sica (0-40)
                v_name_score        := CASE WHEN v_final.f_name IS NOT NULL THEN 12 ELSE 0 END;
                v_description_score := CASE WHEN v_final.f_desc IS NOT NULL AND length(v_final.f_desc) >= 40 THEN 12 ELSE 0 END;
                v_image_score       := CASE WHEN v_final.f_img  IS NOT NULL THEN 8 ELSE 0 END;
                v_tags_score        := CASE WHEN v_final.f_tags IS NOT NULL AND jsonb_array_length(v_final.f_tags) > 0 THEN 8 ELSE 0 END;

                -- Bonos de calidad en BÃ¡sica
                IF v_final.f_desc IS NOT NULL AND length(v_final.f_desc) >= 80 THEN
                    v_bonus_description := 4;
                ELSIF v_final.f_desc IS NOT NULL AND length(v_final.f_desc) >= 40 THEN
                    v_bonus_description := 2;
                END IF;

                IF v_final.f_tags IS NOT NULL AND jsonb_array_length(v_final.f_tags) >= 3 THEN
                    v_bonus_tags := 2;
                END IF;

                v_basic_score := v_name_score + v_description_score + v_image_score + v_tags_score + v_bonus_description + v_bonus_tags;

                -- 2. Fase Intermedia (+30 pts)
                v_verification_methods_score := CASE WHEN v_final.f_verif IS NOT NULL THEN 6 ELSE 0 END;
                v_supported_trust_score      := CASE WHEN v_final.f_trust IS NOT NULL THEN 5 ELSE 0 END;
                v_services_score             := CASE WHEN v_final.f_services IS NOT NULL THEN 6 ELSE 0 END;
                v_payments_score             := CASE WHEN v_final.f_payments IS NOT NULL OR v_final.f_has_x402 THEN 5 ELSE 0 END;
                v_governance_score           := CASE WHEN v_final.f_gov_type IS NOT NULL OR v_final.f_gov_wallet IS NOT NULL THEN 4 ELSE 0 END;

                -- Bonus en Intermedia
                IF v_final.f_services IS NOT NULL AND jsonb_array_length(v_final.f_services) >= 2 THEN
                    v_bonus_services_score := 4;
                END IF;
                IF v_final.f_has_x402 THEN
                    v_bonus_x402 := 2;
                END IF;

                v_intermediate_score := v_verification_methods_score + v_supported_trust_score + v_services_score +
                                        v_payments_score + v_governance_score + v_bonus_services_score + v_bonus_x402;

                -- 3. Fase Avanzada (+30 pts)
                v_oasf_score                 := CASE WHEN v_final.f_oasf_skills IS NOT NULL OR v_final.f_oasf_domains IS NOT NULL THEN 8 ELSE 0 END;
                v_technical_tools_score      := CASE WHEN v_final.f_tech_tools IS NOT NULL THEN 7 ELSE 0 END;
                v_technical_prompts_score    := CASE WHEN v_final.f_tech_prompts IS NOT NULL THEN 7 ELSE 0 END;
                v_technical_capabilities_score := CASE WHEN v_final.f_tech_caps IS NOT NULL THEN 8 ELSE 0 END;

                -- Bonus en Avanzada
                IF v_final.f_tech_tools IS NOT NULL AND jsonb_array_length(v_final.f_tech_tools) >= 2 THEN
                    v_bonus_technical_elements_score := 4;
                END IF;

                v_advanced_score := v_oasf_score + v_technical_tools_score + v_technical_prompts_score +
                                    v_technical_capabilities_score + v_bonus_technical_elements_score;

                -- Total final
                v_total_richness := LEAST(v_basic_score + v_intermediate_score + v_advanced_score, 100);

                -- ====================== NUEVO: metadata_category ======================
                v_metadata_category := CASE
                    WHEN v_total_richness >= 85 THEN 'Excellent / Production-Ready'
                    WHEN v_total_richness >= 70 THEN 'Strong / Well-Developed'
                    WHEN v_total_richness >= 50 THEN 'Moderate / Basic'
                    ELSE 'Limited / Incomplete'
                END;

                -- JSON de razÃ³n (desglose completo)
                v_richness_layers := jsonb_build_object(
                    'basic_score',        round(v_basic_score, 2),
                    'intermediate_score', round(v_intermediate_score, 2),
                    'advanced_score',     round(v_advanced_score, 2),
                    'total_score',        round(v_total_richness, 2),
                    'basic_details', jsonb_build_object(
                        'name', v_name_score,
                        'description', v_description_score,
                        'image', v_image_score,
                        'tags', v_tags_score,
                        'bonus_description', v_bonus_description,
                        'bonus_tags', v_bonus_tags
                    ),
                    'intermediate_details', jsonb_build_object(
                        'verification_methods', v_verification_methods_score,
                        'supported_trust', v_supported_trust_score,
                        'services', v_services_score,
                        'payments', v_payments_score,
                        'governance', v_governance_score,
                        'bonus_services', v_bonus_services_score,
                        'bonus_x402', v_bonus_x402
                    ),
                    'advanced_details', jsonb_build_object(
                        'oasf', v_oasf_score,
                        'technical_tools', v_technical_tools_score,
                        'technical_prompts', v_technical_prompts_score,
                        'technical_capabilities', v_technical_capabilities_score,
                        'bonus_technical_elements', v_bonus_technical_elements_score
                    )
                );

                -- ====================== INSERT EN LA NUEVA TABLA agent_richness ======================
                INSERT INTO erc_8004.agent_richness (
                    agent_id, calculate_at,
                    name_score, description_score, image_score, tags_score,
                    bonus_description, bonus_tags,
                    verification_methods_score, supported_trust_score,
                    services_score, payments_score, governance_score,
                    bonus_services_score, bonus_x402,
                    oasf_score, technical_tools_score, technical_prompts_score, technical_capabilities_score,
                    bonus_technical_elements_score,
                    block_basic_score, block_intermediate_score, block_advanced_score,
                    richness_score, richness_reason
                ) VALUES (
                    v_agent_rec.agent_id, NOW(),
                    v_name_score, v_description_score, v_image_score, v_tags_score,
                    v_bonus_description, v_bonus_tags,
                    v_verification_methods_score, v_supported_trust_score,
                    v_services_score, v_payments_score, v_governance_score,
                    v_bonus_services_score, v_bonus_x402,
                    v_oasf_score, v_technical_tools_score, v_technical_prompts_score, v_technical_capabilities_score,
                    v_bonus_technical_elements_score,
                    round(v_basic_score, 2), round(v_intermediate_score, 2), round(v_advanced_score, 2),
                    v_total_richness, v_richness_layers
                );

                -- 2. ACTUALIZAR TABLA AGENTS (mantener compatibilidad)
                UPDATE erc_8004.agents SET 
                    name = COALESCE(v_final.f_name, name), 
                    description = COALESCE(v_final.f_desc, description), 
                    image_url = COALESCE(v_final.f_img, image_url),
                    name_md5 = CASE
                        WHEN COALESCE(v_final.f_name, name) IS NOT NULL
                        THEN md5(lower(trim(COALESCE(v_final.f_name, name))))
                        ELSE NULL
                    END,
                    description_md5 = md5(trim(COALESCE(COALESCE(v_final.f_desc, description), ''))),
                    uri_raw_md5 = CASE
                        WHEN agent_uri_raw IS NOT NULL AND agent_uri_raw <> ''
                        THEN md5(agent_uri_raw)
                        ELSE NULL
                    END,
                    metadata_richness_score = v_total_richness,
                    metadata_richness_information = jsonb_build_object(
                        'total_score', v_total_richness, 
                        'calculated_at', NOW(), 
                        'layers', v_richness_layers
                    ),
                    is_pending_realness_process = true, 
                    metadata_category = v_metadata_category,
                    duplicate_calculate_at = CASE
                        WHEN COALESCE(v_final.f_name, name) IS DISTINCT FROM name
                          OR COALESCE(v_final.f_desc, description) IS DISTINCT FROM description
                        THEN NULL
                        ELSE duplicate_calculate_at
                    END,
                    has_duplicates = CASE
                        WHEN COALESCE(v_final.f_name, name) IS DISTINCT FROM name
                          OR COALESCE(v_final.f_desc, description) IS DISTINCT FROM description
                        THEN NULL
                        ELSE has_duplicates
                    END,
                    duplicate_information = CASE
                        WHEN COALESCE(v_final.f_name, name) IS DISTINCT FROM name
                          OR COALESCE(v_final.f_desc, description) IS DISTINCT FROM description
                        THEN NULL
                        ELSE duplicate_information
                    END,
                    last_updated_at = NOW() 
                WHERE id = v_agent_rec.agent_id;

            END;
            
            -- 3. UPSERT AGENT_METADATA
            INSERT INTO erc_8004.agent_metadata (
                agent_id, implementation_information, skills, capabilities, tags,
                oasf_skills, oasf_domains, supported_trust, staking_integrations,
                governance_type, governance_wallet, has_extra_data,
                technical_tools, technical_prompts, technical_capabilities
            ) VALUES (
                v_agent_rec.agent_id, v_final.f_impl, v_final.f_skills, v_final.f_caps, v_final.f_tags,
                v_final.f_oasf_skills, v_final.f_oasf_domains, v_final.f_trust, v_final.f_staking,
                v_final.f_gov_type, v_final.f_gov_wallet, false,
                v_final.f_tech_tools, v_final.f_tech_prompts, v_final.f_tech_caps
            ) ON CONFLICT (agent_id) DO UPDATE SET 
                implementation_information = EXCLUDED.implementation_information,
                skills = EXCLUDED.skills, capabilities = EXCLUDED.capabilities, tags = EXCLUDED.tags,
                oasf_skills = EXCLUDED.oasf_skills, oasf_domains = EXCLUDED.oasf_domains,
                supported_trust = EXCLUDED.supported_trust, staking_integrations = EXCLUDED.staking_integrations,
                governance_type = EXCLUDED.governance_type, governance_wallet = EXCLUDED.governance_wallet,
                technical_tools = EXCLUDED.technical_tools,
                technical_prompts = EXCLUDED.technical_prompts,
                technical_capabilities = EXCLUDED.technical_capabilities;

            -- 4. INSERT PERFIL DEFINITIVO
            INSERT INTO erc_8004.agent_profiles (
                agent_id, source, name, description, image,
                implementation_information, skills, capabilities, tags, services, technologies,
                governance_type, governance_wallet, has_x402_support, x402_data,
                supported_trust, oasf_skills, oasf_domains, staking_integration, payment_protocols, verification_methods,
                technical_tools, technical_prompts, technical_capabilities,
                is_processed, source_updated_at, created_at, updated_at
            ) VALUES (
                v_agent_rec.agent_id, 'definitive', v_final.f_name, v_final.f_desc, v_final.f_img,
                v_final.f_impl, v_final.f_skills, v_final.f_caps, v_final.f_tags, v_final.f_services, v_final.f_tech,
                v_final.f_gov_type, v_final.f_gov_wallet, v_final.f_has_x402, v_final.f_x402_json,
                v_final.f_trust, v_final.f_oasf_skills, v_final.f_oasf_domains, v_final.f_staking, v_final.f_payments, v_final.f_verif,
                v_final.f_tech_tools, v_final.f_tech_prompts, v_final.f_tech_caps,
                true, NOW(), NOW(), NOW()
            ) ON CONFLICT (agent_id, source) DO UPDATE SET 
                name = EXCLUDED.name, description = EXCLUDED.description, image = EXCLUDED.image,
                implementation_information = EXCLUDED.implementation_information,
                skills = EXCLUDED.skills, capabilities = EXCLUDED.capabilities, tags = EXCLUDED.tags,
                services = EXCLUDED.services, technologies = EXCLUDED.technologies,
                governance_type = EXCLUDED.governance_type, governance_wallet = EXCLUDED.governance_wallet,
                has_x402_support = EXCLUDED.has_x402_support, x402_data = EXCLUDED.x402_data,
                supported_trust = EXCLUDED.supported_trust, oasf_skills = EXCLUDED.oasf_skills,
                oasf_domains = EXCLUDED.oasf_domains, staking_integration = EXCLUDED.staking_integration,
                payment_protocols = EXCLUDED.payment_protocols, verification_methods = EXCLUDED.verification_methods,
                technical_tools = EXCLUDED.technical_tools,
                technical_prompts = EXCLUDED.technical_prompts,
                technical_capabilities = EXCLUDED.technical_capabilities,
                updated_at = NOW();

            -- 5. REPARTIR A TABLAS SATÃ‰LITE
            DELETE FROM erc_8004.agent_metadata_services WHERE agent_id = v_agent_rec.agent_id;
            IF v_final.f_services IS NOT NULL THEN
                FOR v_sub_item IN SELECT * FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_final.f_services) = 'array' THEN v_final.f_services ELSE jsonb_build_array(v_final.f_services) END) LOOP
                    IF jsonb_typeof(v_sub_item) = 'object' THEN
                        v_service_type_raw := COALESCE(v_sub_item->>'type', v_sub_item->>'name', 'unknown');
                    ELSIF jsonb_typeof(v_sub_item) = 'string' THEN
                        v_service_type_raw := v_sub_item #>> '{}';
                    ELSE
                        v_service_type_raw := 'unknown';
                    END IF;
                    v_internal_type := NULL;
                    IF (COALESCE(v_sub_item->>'serviceEndpoint', v_sub_item->>'endpoint') IS NOT NULL AND COALESCE(v_sub_item->>'serviceEndpoint', v_sub_item->>'endpoint') <> '') THEN
                        v_internal_type := CASE
                            WHEN v_service_type_raw ILIKE '%mcp%' THEN 'MCP (Model Context Protocol)'
                            WHEN v_service_type_raw ILIKE ANY (ARRAY['%a2a%', '%agent-to-agent%']) THEN 'A2A (Agent-to-Agent)'
                            WHEN v_service_type_raw ILIKE ANY (ARRAY['%x402%', '%pay-bill%']) THEN 'x402 / Payment'
                            WHEN v_service_type_raw ILIKE '%email%' THEN 'Email'
                            WHEN v_service_type_raw ILIKE ANY (ARRAY['%telegram%', '%discord%', '%twitter%', '%farcaster%', '%xmpp%', '%nostr%', '%xmtp%']) THEN 'Social / Messaging'
                            WHEN v_service_type_raw IN ('x', 'X') THEN 'Social / Messaging'
                            WHEN v_service_type_raw ILIKE ANY (ARRAY['%api%', '%rest-api%', '%openapi%', '%json-rpc%']) THEN 'API / Programmatic'
                            WHEN v_service_type_raw ILIKE ANY (ARRAY['%web%', '%website%', '%web-ui%', '%dashboard%', '%http%', '%https%']) THEN 'Web / Browser'
                            WHEN v_service_type_raw ILIKE ANY (ARRAY['%tool%', '%skill%', '%toolExecute%']) THEN 'Tool / Skill'
                            ELSE 'Other / Specialized'
                        END;
                    END IF;
                    IF jsonb_typeof(v_sub_item) = 'object' THEN
                        INSERT INTO erc_8004.agent_metadata_services (agent_id, type, endpoint, capabilities, tools, version, internal_type) 
                        VALUES (v_agent_rec.agent_id, v_service_type_raw, COALESCE(v_sub_item->>'serviceEndpoint', v_sub_item->>'endpoint'), v_sub_item->'capabilities', v_sub_item->'tools', v_sub_item->>'version', v_internal_type);
                    ELSE
                        INSERT INTO erc_8004.agent_metadata_services (agent_id, type, capabilities, internal_type) 
                        VALUES (v_agent_rec.agent_id, v_service_type_raw, jsonb_build_array(v_sub_item), v_internal_type);
                    END IF;
                END LOOP;
            END IF;

            DELETE FROM erc_8004.agent_metadata_technology WHERE agent_id = v_agent_rec.agent_id;
            IF v_final.f_tech IS NOT NULL THEN
                FOR v_sub_item IN SELECT * FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_final.f_tech) = 'array' THEN v_final.f_tech ELSE jsonb_build_array(v_final.f_tech) END) LOOP
                    v_tech_category := CASE WHEN (v_sub_item ? 'zkCircuits') THEN 'ZK' WHEN (v_sub_item->>'implementation' ILIKE '%TEE%') THEN 'TEE' ELSE COALESCE(v_sub_item->>'category', 'Standard') END;
                    INSERT INTO erc_8004.agent_metadata_technology (agent_id, category, implementation, operation_networks, verification_engine) 
                    VALUES (v_agent_rec.agent_id, v_tech_category, COALESCE(v_sub_item->>'zkCircuits', v_sub_item->>'implementation'), v_sub_item->'blockchains', COALESCE(v_sub_item->>'proofSystem', v_sub_item->>'verification_engine'));
                END LOOP;
            END IF;

            DELETE FROM erc_8004.agent_metadata_payment_protocols WHERE agent_id = v_agent_rec.agent_id;
            IF v_final.f_payments IS NOT NULL THEN
                FOR v_sub_item IN SELECT * FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_final.f_payments) = 'array' THEN v_final.f_payments ELSE jsonb_build_array(v_final.f_payments) END) LOOP
                    IF jsonb_typeof(v_sub_item) = 'object' THEN
                        INSERT INTO erc_8004.agent_metadata_payment_protocols (agent_id, type, chain, supported_tokens) 
                        VALUES (v_agent_rec.agent_id, COALESCE(v_sub_item->>'type', v_sub_item->>'protocol', 'unknown'), COALESCE(v_sub_item->>'chain', v_sub_item->>'chainName', 'unknown'), COALESCE(v_sub_item->'token', v_sub_item->'supported_tokens', '[]'::jsonb));
                    END IF;
                END LOOP;
            END IF;

            DELETE FROM erc_8004.agent_metadata_verification_methods WHERE agent_id = v_agent_rec.agent_id;
            IF v_final.f_verif IS NOT NULL THEN
                FOR v_sub_item IN SELECT * FROM jsonb_array_elements(CASE WHEN jsonb_typeof(v_final.f_verif) = 'array' THEN v_final.f_verif ELSE jsonb_build_array(v_final.f_verif) END) LOOP
                    IF jsonb_typeof(v_sub_item) = 'object' THEN
                        INSERT INTO erc_8004.agent_metadata_verification_methods (agent_id, type, controler) 
                        VALUES (v_agent_rec.agent_id, COALESCE(v_sub_item->>'type', v_sub_item->>'method', 'unknown'), COALESCE(v_sub_item->>'controller', v_sub_item->>'controler', 'unknown'));
                    END IF;
                END LOOP;
            END IF;

            DELETE FROM erc_8004.agent_metadata_x402 WHERE agent_id = v_agent_rec.agent_id;
            IF COALESCE(v_final.f_has_x402, false) = true THEN
                IF v_final.f_x402_json IS NOT NULL AND v_final.f_x402_json ? 'tools' THEN
                    FOR v_perm_item IN SELECT key, value FROM jsonb_each(v_final.f_x402_json->'tools') LOOP
                        INSERT INTO erc_8004.agent_metadata_x402 (agent_id, type, tool, url, chain)
                        SELECT v_agent_rec.agent_id, 'specific', v_perm_item.key, net.url, net.chain_name
                        FROM jsonb_each_text(v_perm_item.value) AS net(chain_name, url);
                    END LOOP;
                ELSE
                    INSERT INTO erc_8004.agent_metadata_x402 (agent_id, type) VALUES (v_agent_rec.agent_id, 'general');
                END IF;
            END IF;

            -- 6. FINALIZAR PROCESAMIENTO
            UPDATE erc_8004.agent_profiles SET is_processed = true, processed_at = NOW() WHERE agent_id = v_agent_rec.agent_id;
            v_processed_ags := v_processed_ags + 1;

        EXCEPTION WHEN OTHERS THEN
            v_errors_count := v_errors_count + 1;
            v_error_details := v_error_details || jsonb_build_object('agent_id', v_agent_rec.agent_id, 'error', SQLERRM, 'code', SQLSTATE);
        END;
    END LOOP;

    RETURN jsonb_build_object('status', 'complete_metadata_sync_finished', 'agents_processed', v_processed_ags, 'errors_count', v_errors_count, 'errors_list', v_error_details);
END;
$$;
