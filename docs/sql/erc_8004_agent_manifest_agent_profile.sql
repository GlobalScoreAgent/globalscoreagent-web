-- Optimizado: temp batch + subconsultas registrations (sin JOIN multichain) + contadores corregidos.
-- Test: EXPLAIN ANALYZE SELECT erc_8004.agent_manifest_agent_profile(10);

CREATE OR REPLACE FUNCTION erc_8004.agent_manifest_agent_profile(p_limit_agents integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO erc_8004, public
AS $$
DECLARE
    w                record;
    v_manifest_rec   record;
    v_agents_touched integer := 0;
    v_manifests_processed integer := 0;
    v_errors         integer := 0;
    v_manifests_this_agent integer := 0;

    v_provider       text := 'erc-8004';
    v_provider_did   text := 'erc-8004-did';

    v_source         text;
    v_manifest_date  timestamp with time zone;
BEGIN
    CREATE TEMP TABLE temp_profile_agents ON COMMIT DROP AS
    SELECT agent_id
    FROM erc_8004.agent_manifest
    WHERE COALESCE(is_processed, false) = false
      AND COALESCE(is_processed_with_error, false) = false
      AND COALESCE(has_download_error, false) = false
      AND provider IN (v_provider, v_provider_did)
    GROUP BY agent_id
    ORDER BY MIN(updated_at) ASC NULLS FIRST
    LIMIT p_limit_agents;

    FOR w IN SELECT agent_id FROM temp_profile_agents LOOP
        v_manifests_this_agent := 0;

        BEGIN
            FOR v_manifest_rec IN
                SELECT
                    m.id,
                    m.data,
                    m.provider,
                    (
                        SELECT MIN(r.on_chain_created_at)
                        FROM erc_8004.registrations r
                        WHERE r.agent_id = m.agent_id
                    ) AS on_chain_created_at,
                    (
                        SELECT MAX(r.on_chain_updated_at)
                        FROM erc_8004.registrations r
                        WHERE r.agent_id = m.agent_id
                    ) AS on_chain_updated_at
                FROM erc_8004.agent_manifest m
                WHERE m.agent_id = w.agent_id
                  AND COALESCE(m.is_processed, false) = false
                  AND m.provider IN (v_provider, v_provider_did)
                ORDER BY CASE WHEN m.provider = v_provider THEN 1 ELSE 2 END ASC
                FOR UPDATE OF m SKIP LOCKED
            LOOP
                IF v_manifest_rec.provider = v_provider THEN
                    v_source := 'agent_uri';
                    v_manifest_date := COALESCE(
                        v_manifest_rec.on_chain_updated_at,
                        v_manifest_rec.on_chain_created_at
                    );
                ELSE
                    v_source := 'agent_uri_did';
                    v_manifest_date := NOW();
                END IF;

                PERFORM erc_8004.agent_manifest_agent_profile_single(
                    w.agent_id,
                    v_manifest_rec.data,
                    v_source,
                    v_manifest_date
                );

                UPDATE erc_8004.agent_manifest SET
                    is_processed = true,
                    is_processed_with_error = false,
                    processed_at = NOW(),
                    processed_error_message = NULL
                WHERE id = v_manifest_rec.id;

                v_manifests_processed := v_manifests_processed + 1;
                v_manifests_this_agent := v_manifests_this_agent + 1;
            END LOOP;

            IF v_manifests_this_agent > 0 THEN
                v_agents_touched := v_agents_touched + 1;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors + 1;

            UPDATE erc_8004.agent_manifest SET
                is_processed = false,
                is_processed_with_error = true,
                processed_error_message = 'Profile Orchestrator Error: ' || SQLERRM,
                processed_at = NOW()
            WHERE agent_id = w.agent_id
              AND COALESCE(is_processed, false) = false;
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'status', 'agent_profile_orchestration_finished',
        'agents_touched', v_agents_touched,
        'agents_completed', v_agents_touched,
        'total_manifests_processed', v_manifests_processed,
        'failed_agents', v_errors
    );
END;
$$;
