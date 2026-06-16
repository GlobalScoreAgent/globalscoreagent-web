-- Optimizado: ON CONFLICT explícito en wallet_updates (requiere idx_wallet_updates_agent_address_type).
-- Test: SELECT erc_8004.agent_manifest_agent_profile_single(<agent_id>, '<json>'::jsonb, 'agent_uri', now());

CREATE OR REPLACE FUNCTION erc_8004.agent_manifest_agent_profile_single(
    p_agent_id bigint,
    p_json jsonb,
    p_source text,
    p_manifest_date timestamp with time zone
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_meta jsonb;
    v_extra_data jsonb;
    v_impl_info jsonb;
    v_oasf_skills jsonb;
    v_oasf_domains jsonb;
    v_gov_type text;
    v_gov_wallet text;

    v_wallets_found      text[] := '{}';
    v_w_temp             text;
    v_service_item       jsonb;

    v_main_json          jsonb;

    v_main_keys text[] := ARRAY[
        'id', 'created', '@context', 'controller', 'verificationMethod', 'service', 'services',
        'metadata', 'properties', 'skills', 'capabilities', 'tags', 'implementationInformation',
        'oasfSkills', 'oasfDomains', 'stakingIntegrations', 'stakingIntegration', 'didDocumentUrl',
        'governance', 'technology', 'paymentProtocols', 'paymentMethods', 'permissions', 'x402',
        'x402Support', 'x402support', 'x402Endpoints', 'developer', 'model', 'framework',
        'platform', 'version', 'code_repository', 'displayName', 'name', 'description',
        'image', 'image_url', 'avatar', 'supportedTrusts', 'supportedTrust', 'registrations',
        'active', 'type', 'wallet', 'agentWallet', 'walletAddress'
    ];
BEGIN
    IF p_json ? 'Data' AND jsonb_typeof(p_json->'Data') = 'object' THEN
        v_main_json := p_json->'Data';
    ELSE
        v_main_json := p_json;
    END IF;

    v_meta := COALESCE(v_main_json->'metadata', v_main_json->'properties', '{}'::jsonb);

    IF COALESCE((v_main_json->'governance'->>'enabled')::boolean, false) = true THEN
        v_gov_type := 'democratic';
        v_gov_wallet := v_main_json->'governance'->>'daoContract';
    ELSE
        v_gov_type := 'private';
        v_gov_wallet := NULL;
    END IF;

    v_oasf_skills := COALESCE(v_main_json->'oasfSkills', v_meta->'oasfSkills');
    v_oasf_domains := COALESCE(v_main_json->'oasfDomains', v_meta->'oasfDomains');

    IF v_oasf_skills IS NULL OR v_oasf_domains IS NULL THEN
        SELECT
            COALESCE(v_oasf_skills, (s->'skills')),
            COALESCE(v_oasf_domains, (s->'domains'))
        INTO v_oasf_skills, v_oasf_domains
        FROM jsonb_array_elements(COALESCE(v_main_json->'services', v_main_json->'service', '[]'::jsonb)) AS s
        WHERE s->>'name' ILIKE 'OASF' OR s->>'type' ILIKE '%OASF%'
        LIMIT 1;
    END IF;

    v_impl_info := jsonb_build_object(
        'developer', COALESCE(v_main_json->>'developer', v_meta->>'developer'),
        'model', COALESCE(v_main_json->>'model', v_meta->>'model'),
        'framework', COALESCE(v_main_json->>'framework', v_meta->>'framework', v_main_json->>'platform', v_meta->>'platform'),
        'version', COALESCE(v_main_json->>'version', v_meta->>'version'),
        'code_repository', COALESCE(v_main_json->>'code_repository', v_meta->>'code_repository')
    );

    SELECT jsonb_object_agg(key, value) INTO v_extra_data
    FROM jsonb_each(v_main_json) WHERE key <> ALL (v_main_keys);

    INSERT INTO erc_8004.agent_profiles (
        agent_id, source, name, description, image, owner,
        implementation_information, supported_trust, skills, capabilities, tags,
        oasf_skills, oasf_domains, staking_integration, payment_protocols,
        permissions, services, technologies, verification_methods,
        has_x402_support, x402_data, did_document_uri,
        governance_type, governance_wallet,
        has_extra_data, extra_data,
        source_updated_at, created_at, updated_at, is_processed
    )
    VALUES (
        p_agent_id,
        p_source,
        COALESCE(v_main_json->>'displayName', v_main_json->>'name', v_meta->>'displayName', v_meta->>'name'),
        COALESCE(v_main_json->>'description', v_meta->>'description'),
        COALESCE(v_main_json->>'image', v_main_json->>'logo', v_main_json->>'image_url', v_main_json->>'avatar',
                 v_meta->>'image', v_meta->>'logo', v_meta->>'image_url', v_meta->>'avatar'),
        v_main_json->>'controller',
        v_impl_info,
        COALESCE(v_main_json->'supportedTrusts', v_main_json->'supportedTrust', v_meta->'supportedTrusts', v_meta->'supportedTrust'),
        COALESCE(v_main_json->'skills', v_meta->'skills'),
        COALESCE(v_main_json->'capabilities', v_meta->'capabilities'),
        COALESCE(v_main_json->'tags', v_meta->'tags'),
        v_oasf_skills,
        v_oasf_domains,
        COALESCE(v_main_json->'stakingIntegrations', v_main_json->'stakingIntegration', v_meta->'stakingIntegrations', v_meta->'stakingIntegration'),
        COALESCE(v_main_json->'paymentProtocols', v_main_json->'paymentMethods'),
        v_main_json->'permissions',
        COALESCE(v_main_json->'service', v_main_json->'services'),
        v_main_json->'technology',
        v_main_json->'verificationMethod',
        COALESCE((v_main_json->>'x402Support')::boolean, (v_main_json->>'x402support')::boolean, false),
        v_main_json->'x402Endpoints',
        v_main_json->>'didDocumentUrl',
        v_gov_type,
        v_gov_wallet,
        (v_extra_data IS NOT NULL AND v_extra_data <> '{}'::jsonb),
        COALESCE(v_extra_data, '{}'::jsonb),
        p_manifest_date,
        NOW(), NOW(), false
    )
    ON CONFLICT (agent_id, source) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        image = EXCLUDED.image,
        owner = EXCLUDED.owner,
        implementation_information = EXCLUDED.implementation_information,
        skills = EXCLUDED.skills,
        capabilities = EXCLUDED.capabilities,
        tags = EXCLUDED.tags,
        oasf_skills = EXCLUDED.oasf_skills,
        oasf_domains = EXCLUDED.oasf_domains,
        staking_integration = EXCLUDED.staking_integration,
        payment_protocols = EXCLUDED.payment_protocols,
        permissions = EXCLUDED.permissions,
        services = EXCLUDED.services,
        technologies = EXCLUDED.technologies,
        verification_methods = EXCLUDED.verification_methods,
        has_x402_support = EXCLUDED.has_x402_support,
        x402_data = EXCLUDED.x402_data,
        did_document_uri = EXCLUDED.did_document_uri,
        governance_type = EXCLUDED.governance_type,
        governance_wallet = EXCLUDED.governance_wallet,
        has_extra_data = EXCLUDED.has_extra_data,
        extra_data = EXCLUDED.extra_data,
        source_updated_at = EXCLUDED.source_updated_at,
        is_processed = false,
        updated_at = NOW();

    v_w_temp := COALESCE(
        v_main_json ->> 'wallet',
        v_main_json ->> 'agentWallet',
        v_main_json ->> 'walletAddress',
        v_meta ->> 'agentWallet',
        v_meta ->> 'walletAddress'
    );

    IF v_w_temp ~ '0x[a-fA-F0-9]{40}' THEN
        v_w_temp := (regexp_matches(v_w_temp, '0x[a-fA-F0-9]{40}'))[1];
        v_wallets_found := array_append(v_wallets_found, v_w_temp);
    END IF;

    IF v_main_json ? 'service' OR v_main_json ? 'services' THEN
        FOR v_service_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_main_json->'service', v_main_json->'services')) LOOP
            IF LOWER(v_service_item ->> 'name') ~* 'wallet' THEN
                v_w_temp := NULLIF(TRIM(v_service_item ->> 'endpoint'), '');
                IF v_w_temp ~ '0x[a-fA-F0-9]{40}' THEN
                    v_w_temp := (regexp_matches(v_w_temp, '0x[a-fA-F0-9]{40}'))[1];
                    v_wallets_found := array_append(v_wallets_found, v_w_temp);
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_wallets_found, 1) > 0 THEN
        INSERT INTO erc_8004.wallet_updates (agent_id, wallet_address, type, status, created_at)
        SELECT DISTINCT p_agent_id, addr, 'uri', 'pending', NOW()
        FROM unnest(v_wallets_found) AS addr
        WHERE addr IS NOT NULL AND addr <> ''
        ON CONFLICT (agent_id, wallet_address, type) DO NOTHING;
    END IF;

    RETURN true;
END;
$$;
