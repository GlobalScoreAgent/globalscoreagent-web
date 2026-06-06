-- Optimizado: batch sin JOIN multichain, dups por name_md5/description_md5, ORDER BY.
-- wallet_tx se limpia en todas las registrations del agente si cambia status.
-- Test: EXPLAIN ANALYZE SELECT erc_8004.agent_realness_processed(10);

CREATE OR REPLACE FUNCTION erc_8004.agent_realness_processed(p_batch_size integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO erc_8004, public
AS $$
DECLARE
    v_processed      int := 0;
    v_errors         int := 0;

    v_total_score                       numeric;
    v_reason                            jsonb;
    v_status                            text;
    v_prev_score                        numeric;
    v_prev_validation_realness_status   text;

    v_name_clean     text;
    v_desc_clean     text;
    v_is_name_dup    boolean;
    v_is_desc_dup    boolean;
    v_has_reg_bool   boolean;
    v_source         text;

    v_agent_rec      RECORD;
BEGIN
    FOR v_agent_rec IN
        WITH agents_to_process AS (
            SELECT
                a.id,
                a.name,
                a.description,
                a.image_url,
                a.validation_realness_score,
                a.validation_realness_status,
                COALESCE(
                    a.name_md5,
                    CASE
                        WHEN a.name IS NOT NULL THEN md5(lower(trim(a.name)))
                        ELSE NULL
                    END
                ) AS name_md5,
                COALESCE(
                    a.description_md5,
                    md5(trim(COALESCE(a.description, '')))
                ) AS description_md5
            FROM erc_8004.agents a
            WHERE a.is_pending_realness_process = true
            ORDER BY a.validation_realness_calculated_at ASC NULLS FIRST, a.id
            LIMIT p_batch_size
            FOR UPDATE OF a SKIP LOCKED
        ),
        name_dups AS (
            SELECT
                name_md5,
                COUNT(*) > 1 AS is_duplicate
            FROM erc_8004.agents
            WHERE name_md5 IN (
                SELECT DISTINCT name_md5
                FROM agents_to_process
                WHERE name_md5 IS NOT NULL
            )
            GROUP BY name_md5
        ),
        desc_dups AS (
            SELECT
                description_md5,
                COUNT(*) > 1 AS is_duplicate
            FROM erc_8004.agents
            WHERE description IS NOT NULL
              AND description_md5 IN (
                SELECT DISTINCT description_md5
                FROM agents_to_process
                WHERE description IS NOT NULL
              )
            GROUP BY description_md5
        ),
        best_profile AS (
            SELECT
                agent_id,
                source,
                ROW_NUMBER() OVER (
                    PARTITION BY agent_id
                    ORDER BY
                        CASE source
                            WHEN 'feedback_did' THEN 1
                            WHEN 'agent_uri_did' THEN 2
                            ELSE 3
                        END
                ) AS rn
            FROM erc_8004.agent_profiles
            WHERE agent_id IN (SELECT id FROM agents_to_process)
              AND source IN ('feedback_did', 'feedback', 'agent_uri_did', 'agent_uri')
        )
        SELECT
            atp.id,
            atp.name,
            atp.description,
            atp.image_url,
            atp.validation_realness_score,
            atp.validation_realness_status,
            COALESCE(nd.is_duplicate, false) AS is_name_dup,
            COALESCE(dd.is_duplicate, false) AS is_desc_dup,
            bp.source AS best_profile_source,
            EXISTS (
                SELECT 1
                FROM erc_8004.registrations r
                WHERE r.agent_id = atp.id
                  AND r.is_registration_active = true
            ) AS has_active_registration
        FROM agents_to_process atp
        LEFT JOIN name_dups nd ON nd.name_md5 = atp.name_md5
        LEFT JOIN desc_dups dd ON dd.description_md5 = atp.description_md5
        LEFT JOIN best_profile bp ON bp.agent_id = atp.id AND bp.rn = 1
    LOOP
        BEGIN
            v_total_score := 0;
            v_reason := '{}'::jsonb;
            v_name_clean := lower(trim(coalesce(v_agent_rec.name, '')));
            v_desc_clean := trim(coalesce(v_agent_rec.description, ''));
            v_prev_score := coalesce(v_agent_rec.validation_realness_score, 0);
            v_prev_validation_realness_status := v_agent_rec.validation_realness_status;

            v_is_name_dup := v_agent_rec.is_name_dup;
            v_is_desc_dup := v_agent_rec.is_desc_dup;
            v_source      := v_agent_rec.best_profile_source;
            v_has_reg_bool := v_agent_rec.has_active_registration;

            -- 1. VALIDACION DEL NOMBRE (Max 30 pts)
            DECLARE
                n_score integer := 0;
                n_msg   text := 'ok';
            BEGIN
                IF v_name_clean = '' OR v_name_clean = 'unnamed agent' THEN
                    n_score := 0; n_msg := 'empty or unnamed placeholder';
                ELSIF v_name_clean IN ('test-agent', 'test_agent', 'testagent', 'demo-agent', 'placeholder')
                   OR v_name_clean ~ '^test[-_ ]'
                   OR v_name_clean ~ '^demo[-_ ]'
                   OR v_name_clean ~ '^example[-_ ]'
                   OR v_name_clean ~ '^temp[-_ ]'
                   OR v_name_clean ~ '\<(dummy|fake|spam|placeholder)\>' THEN
                    n_score := 0; n_msg := 'suspicious prefix or exact dummy name';
                ELSIF v_name_clean ~ 'test' OR v_name_clean ~ 'testing' THEN
                    IF v_name_clean ~ '^(ai|advanced|smart|secure|professional|enterprise|open|multi|chain|crypto|blockchain) .*test'
                       OR v_name_clean ~ '(test(ing|er| framework| suite| tool| lab| env| bot| agent| protocol| oracle))$'
                       OR v_name_clean ~ 'ai testing' THEN
                        n_score := 17; n_msg := 'contains "test" but in legitimate context';
                    ELSE
                        n_score := 10; n_msg := 'contains "test/testing" without clear purpose';
                    END IF;
                ELSE
                    IF length(v_name_clean) >= 3 THEN n_score := 20; ELSE n_score := 5; n_msg := 'name too short'; END IF;
                END IF;

                IF NOT v_is_name_dup AND n_score > 0 THEN
                    n_score := n_score + 10;
                ELSIF v_is_name_dup THEN
                    n_msg := n_msg || ' (duplicate name found)';
                END IF;

                v_total_score := v_total_score + n_score;
                v_reason := v_reason || jsonb_build_object('name', jsonb_build_object('score', n_score, 'reason', n_msg));
            END;

            -- 2. VALIDACION DE DESCRIPCION (Max 25 pts)
            DECLARE
                d_score integer := 0;
                d_msg   text := 'ok';
                d_is_repetitive boolean;
            BEGIN
                SELECT (
                    length(v_desc_clean) > 50 AND
                    (length(v_desc_clean) - length(replace(lower(v_desc_clean), v_name_clean, ''))) / nullif(length(v_name_clean), 0) > 3
                ) INTO d_is_repetitive;

                IF v_desc_clean = '' OR length(v_desc_clean) < 10 THEN
                    d_score := 0; d_msg := 'too short or empty';
                ELSIF d_is_repetitive THEN
                    d_score := 5; d_msg := 'repetitive spam patterns';
                ELSE
                    IF length(v_desc_clean) > 40 THEN d_score := 15; ELSE d_score := 8; END IF;
                    IF NOT v_is_desc_dup THEN d_score := d_score + 10;
                    ELSE d_msg := 'duplicate description found in other agents';
                    END IF;
                END IF;

                v_total_score := v_total_score + d_score;
                v_reason := v_reason || jsonb_build_object('description', jsonb_build_object('score', d_score, 'reason', d_msg));
            END;

            -- 3. VALIDACION DE PERFIL EXTERNO (Max 30 pts)
            DECLARE
                p_score integer := 0;
                p_msg   text;
            BEGIN
                IF v_source IS NOT NULL THEN
                    p_score := 30; p_msg := 'external authoritative profile: ' || v_source;
                ELSE
                    p_score := 0; p_msg := 'no external profile metadata';
                END IF;

                v_total_score := v_total_score + p_score;
                v_reason := v_reason || jsonb_build_object('profile', jsonb_build_object('score', p_score, 'reason', p_msg));
            END;

            -- 4. IMAGEN Y REGISTRATION
            DECLARE
                img_score integer := 0;
                reg_score integer := 0;
                img_msg text := 'ok';
            BEGIN
                IF v_agent_rec.image_url IS NOT NULL
                   AND trim(v_agent_rec.image_url) <> ''
                   AND v_agent_rec.image_url ~* '^https?://'
                   AND v_agent_rec.image_url NOT ILIKE '%placeholder%' THEN
                    img_score := 5;
                ELSE
                    img_msg := 'missing or invalid image url';
                END IF;

                reg_score := CASE WHEN v_has_reg_bool THEN 10 ELSE 0 END;

                v_total_score := v_total_score + img_score + reg_score;
                v_reason := v_reason || jsonb_build_object(
                    'image', jsonb_build_object('score', img_score, 'reason', img_msg),
                    'registration', jsonb_build_object('score', reg_score)
                );
            END;

            v_status := CASE
                WHEN v_total_score >= 80 THEN 'valid'
                WHEN v_total_score >= 55 THEN 'insufficient_info'
                WHEN (v_reason->'name'->>'reason') LIKE '%suspicious%'
                  OR (v_reason->'description'->>'reason') = 'repetitive spam patterns'
                  THEN 'dummy'
                WHEN v_is_desc_dup AND v_is_name_dup THEN 'dummy'
                ELSE 'test'
            END;

            UPDATE erc_8004.agents SET
                validation_realness_score = round(v_total_score, 2),
                validation_realness_status = v_status,
                validation_realness_reason = v_reason,
                validation_realness_calculated_at = now(),
                is_pending_realness_process = false
            WHERE id = v_agent_rec.id;

            INSERT INTO erc_8004.agent_realness (
                agent_id,
                name_score, name_reason,
                description_score, description_reason,
                metadata_score, metadata_reason,
                active_registration_score, active_registration,
                image_score, image_reason,
                previous_score, score,
                calculate_at, status
            ) VALUES (
                v_agent_rec.id,
                (v_reason->'name'->>'score')::numeric, (v_reason->'name'->>'reason'),
                (v_reason->'description'->>'score')::numeric, (v_reason->'description'->>'reason'),
                (v_reason->'profile'->>'score')::numeric, (v_reason->'profile'->>'reason'),
                (v_reason->'registration'->>'score')::numeric, v_has_reg_bool,
                (v_reason->'image'->>'score')::numeric, (v_reason->'image'->>'reason'),
                v_prev_score, round(v_total_score, 2),
                now(), v_status
            );

            IF v_prev_validation_realness_status IS DISTINCT FROM v_status THEN
                UPDATE erc_8004.registration_wallet_tx
                SET status = NULL
                WHERE registration_id IN (
                    SELECT r.id
                    FROM erc_8004.registrations r
                    WHERE r.agent_id = v_agent_rec.id
                );
            END IF;

            v_processed := v_processed + 1;

        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors + 1;
            RAISE WARNING 'Error en realness para agente %: %', v_agent_rec.id, SQLERRM;
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'status', 'success',
        'processed', v_processed,
        'errors', v_errors
    );
END;
$$;
