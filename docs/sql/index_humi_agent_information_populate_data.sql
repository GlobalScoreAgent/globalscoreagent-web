-- Optimizado: sin ::DATE en filtros de updated_at.
-- Test: EXPLAIN ANALYZE SELECT index_humi.agent_information_populate_data(10);

CREATE OR REPLACE FUNCTION index_humi.agent_information_populate_data(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_processed_count integer;
BEGIN
    WITH target_agents AS (
        SELECT DISTINCT ON (a.id)
            a.id  AS agent_id,
            a.name,
            a.description,
            a.image_url,
            r.id  AS registration_id,
            r.chain_id,
            a.agent_uri_raw,
            w.address AS owner_address,
            1        AS source_id
        FROM erc_8004.agents a
        JOIN erc_8004.registrations r ON a.id = r.agent_id
        JOIN erc_8004.wallets w       ON a.owner_wallet_id = w.id
        JOIN erc_8004.agent_profiles ap ON a.id = ap.agent_id
        LEFT JOIN index_humi.agent_information ai ON a.id = ai.agent_id
        WHERE ap.source = 'definitive'
          AND (
            ai.agent_id IS NULL 
            OR ai.updated_at < CURRENT_DATE::timestamptz
          )
        ORDER BY a.id, ai.updated_at ASC NULLS FIRST
        LIMIT p_limit
    )
    INSERT INTO index_humi.agent_information (
        source_id, agent_id, registration_id, chain_id, name, description, image,
        profiles, mcp_endpoints, a2a_endpoints, programmatic_endpoints, contact_endpoints,
        technology_stacks, verification_methods, x402s,
        supported_trusts, skills, capabilities, oasf_skills, oasf_domains,
        technical_tools, technical_capabilities,
        created_at, updated_at
    )
    SELECT 
        t.source_id,
        t.agent_id,
        t.registration_id,
        t.chain_id,
        t.name,
        t.description,
        t.image_url,
        (SELECT jsonb_object_agg(sg, c)
         FROM (
             SELECT CASE
                        WHEN source IN ('chain', 'agent_uri', 'agent_uri_did', 'feedback', 'feedback_did')
                        THEN source
                        ELSE 'feedback_external_source'
                   END AS sg,
                   count(*) AS c
             FROM erc_8004.agent_profiles
             WHERE agent_id = t.agent_id
             GROUP BY 1
         ) s),
        (SELECT jsonb_agg(jsonb_build_object('type', type, 'endpoint', endpoint, 'version', version))
         FROM erc_8004.agent_metadata_services
         WHERE agent_id = t.agent_id AND internal_type = 'MCP (Model Context Protocol)'),
        (SELECT jsonb_agg(jsonb_build_object('type', type, 'endpoint', endpoint, 'version', version))
         FROM erc_8004.agent_metadata_services
         WHERE agent_id = t.agent_id AND internal_type = 'A2A (Agent-to-Agent)'),
        (SELECT jsonb_agg(jsonb_build_object('type', type, 'endpoint', endpoint, 'version', version))
         FROM erc_8004.agent_metadata_services
         WHERE agent_id = t.agent_id AND internal_type = 'API / Programmatic'),
        (SELECT jsonb_agg(jsonb_build_object('type', type, 'endpoint', endpoint, 'version', version))
         FROM erc_8004.agent_metadata_services
         WHERE agent_id = t.agent_id AND internal_type IN ('Web / Browser', 'Social / Messaging', 'Email')),
        (SELECT jsonb_agg(jsonb_build_object('category', category, 'implementation', implementation, 'operation_network', operation_networks, 'verification_engine', verification_engine))
         FROM erc_8004.agent_metadata_technology
         WHERE agent_id = t.agent_id),
        (SELECT jsonb_agg(jsonb_build_object('type', type, 'controler', controler))
         FROM erc_8004.agent_metadata_verification_methods
         WHERE agent_id = t.agent_id),
        (SELECT jsonb_agg(jsonb_build_object('type', type))
         FROM erc_8004.agent_metadata_x402
         WHERE agent_id = t.agent_id),
        am.supported_trust,
        am.skills,
        (
            SELECT jsonb_agg(DISTINCT val)
            FROM (
                SELECT jsonb_array_elements(am.capabilities) AS val
                WHERE jsonb_typeof(am.capabilities) = 'array'
                UNION ALL
                SELECT am.capabilities
                WHERE jsonb_typeof(am.capabilities) <> 'array'
                UNION ALL
                SELECT jsonb_array_elements(s.capabilities)
                FROM erc_8004.agent_metadata_services s
                WHERE s.agent_id = t.agent_id
                  AND s.endpoint IS NULL
                  AND jsonb_typeof(s.capabilities) = 'array'
                UNION ALL
                SELECT s.capabilities
                FROM erc_8004.agent_metadata_services s
                WHERE s.agent_id = t.agent_id
                  AND s.endpoint IS NULL
                  AND jsonb_typeof(s.capabilities) <> 'array'
                  AND s.capabilities IS NOT NULL
            ) sub
            WHERE val IS NOT NULL
        ),
        am.oasf_skills,
        am.oasf_domains,
        am.technical_tools,
        am.technical_capabilities,
        now(),
        now()
    FROM target_agents t
    JOIN erc_8004.agent_metadata am ON t.agent_id = am.agent_id
    ON CONFLICT (agent_id) DO UPDATE SET 
        name                    = EXCLUDED.name,
        description             = EXCLUDED.description,
        image                   = EXCLUDED.image,
        profiles                = EXCLUDED.profiles,
        mcp_endpoints           = EXCLUDED.mcp_endpoints,
        a2a_endpoints           = EXCLUDED.a2a_endpoints,
        programmatic_endpoints  = EXCLUDED.programmatic_endpoints,
        contact_endpoints       = EXCLUDED.contact_endpoints,
        technology_stacks       = EXCLUDED.technology_stacks,
        verification_methods    = EXCLUDED.verification_methods,
        x402s                   = EXCLUDED.x402s,
        supported_trusts        = EXCLUDED.supported_trusts,
        skills                  = EXCLUDED.skills,
        capabilities            = EXCLUDED.capabilities,
        oasf_skills             = EXCLUDED.oasf_skills,
        oasf_domains            = EXCLUDED.oasf_domains,
        technical_tools         = EXCLUDED.technical_tools,
        technical_capabilities  = EXCLUDED.technical_capabilities,
        updated_at              = now();

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;
    RETURN jsonb_build_object('status', 'success', 'records_processed', v_processed_count);
END;
$$;

