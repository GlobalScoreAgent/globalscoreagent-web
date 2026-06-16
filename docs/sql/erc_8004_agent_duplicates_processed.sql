-- Optimizado v2: agregación group-first por uri_raw_md5 / name_md5+description_md5.
-- Evita N×M join agents×batch; no expande grupos >101 miembros (solo count exacto).
-- Requiere columnas md5 backfilled + índices en erc_8004_duplicates_performance_indexes.sql
-- Test: EXPLAIN ANALYZE SELECT erc_8004.agent_duplicates_processed(150);

CREATE OR REPLACE FUNCTION erc_8004.agent_duplicates_processed(p_limit integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO erc_8004, public
AS $$
DECLARE
    v_processed_count integer;
    v_remaining       bigint;
    v_has_more        boolean;
    v_job_id          bigint;
    v_unnamed_name_md5 constant text := md5('unnamed agent');
    v_max_list_ids     constant integer := 100;
    v_max_expand_group constant integer := 101;
BEGIN
    CREATE TEMP TABLE temp_dup_batch ON COMMIT DROP AS
    SELECT
        a.id AS agent_id,
        a.uri_raw_md5,
        a.name_md5,
        a.description_md5,
        trim(COALESCE(a.description, '')) AS desc_clean
    FROM erc_8004.agents a
    WHERE a.duplicate_calculate_at IS NULL
       OR a.duplicate_calculate_at < (NOW() - INTERVAL '7 days')
    ORDER BY a.duplicate_calculate_at ASC NULLS FIRST
    LIMIT p_limit;

    CREATE INDEX temp_dup_batch_uri ON temp_dup_batch (uri_raw_md5)
        WHERE uri_raw_md5 IS NOT NULL;
    CREATE INDEX temp_dup_batch_meta ON temp_dup_batch (name_md5, description_md5);

    -- Grupos URI: un solo scan indexado por hashes del batch
    CREATE TEMP TABLE temp_uri_groups ON COMMIT DROP AS
    SELECT
        a.uri_raw_md5,
        count(*)::integer AS member_count,
        CASE
            WHEN count(*) <= v_max_expand_group THEN array_agg(a.id ORDER BY a.id)
        END AS member_ids
    FROM erc_8004.agents a
    WHERE a.uri_raw_md5 IS NOT NULL
      AND a.uri_raw_md5 IN (
          SELECT DISTINCT b.uri_raw_md5
          FROM temp_dup_batch b
          WHERE b.uri_raw_md5 IS NOT NULL
      )
    GROUP BY a.uri_raw_md5
    HAVING count(*) > 1;

    CREATE INDEX temp_uri_groups_hash ON temp_uri_groups (uri_raw_md5);

    -- Grupos metadata
    CREATE TEMP TABLE temp_meta_groups ON COMMIT DROP AS
    SELECT
        a.name_md5,
        a.description_md5,
        count(*)::integer AS member_count,
        CASE
            WHEN count(*) <= v_max_expand_group THEN array_agg(a.id ORDER BY a.id)
        END AS member_ids
    FROM erc_8004.agents a
    WHERE a.name_md5 IS NOT NULL
      AND a.name_md5 <> v_unnamed_name_md5
      AND a.description IS NOT NULL
      AND length(trim(a.description)) > 10
      AND (a.name_md5, a.description_md5) IN (
          SELECT DISTINCT b.name_md5, b.description_md5
          FROM temp_dup_batch b
          WHERE b.name_md5 IS NOT NULL
            AND b.name_md5 <> v_unnamed_name_md5
            AND length(b.desc_clean) > 10
      )
    GROUP BY a.name_md5, a.description_md5
    HAVING count(*) > 1;

    CREATE INDEX temp_meta_groups_hash ON temp_meta_groups (name_md5, description_md5);

    -- Solo expandir grupos pequeños (≤101) para listar IDs
    CREATE TEMP TABLE temp_dup_matches ON COMMIT DROP AS
    SELECT DISTINCT t.agent_id, u.dup_id
    FROM temp_dup_batch t
    JOIN temp_uri_groups g ON g.uri_raw_md5 = t.uri_raw_md5
    CROSS JOIN LATERAL unnest(g.member_ids) AS u(dup_id)
    WHERE g.member_ids IS NOT NULL
      AND u.dup_id <> t.agent_id

    UNION

    SELECT DISTINCT t.agent_id, m.dup_id
    FROM temp_dup_batch t
    JOIN temp_meta_groups g
      ON g.name_md5 = t.name_md5
     AND g.description_md5 = t.description_md5
    CROSS JOIN LATERAL unnest(g.member_ids) AS m(dup_id)
    WHERE g.member_ids IS NOT NULL
      AND m.dup_id <> t.agent_id
      AND t.name_md5 IS NOT NULL
      AND t.name_md5 <> v_unnamed_name_md5
      AND length(t.desc_clean) > 10;

    CREATE INDEX temp_dup_matches_agent ON temp_dup_matches (agent_id);

    -- Agentes con algún grupo grande → count exacto sin materializar miles de IDs
    CREATE TEMP TABLE temp_dup_exact ON COMMIT DROP AS
    SELECT
        t.agent_id,
        count(DISTINCT a2.id)::integer AS total_count
    FROM temp_dup_batch t
    JOIN erc_8004.agents a2 ON a2.id <> t.agent_id
    LEFT JOIN temp_uri_groups ug ON ug.uri_raw_md5 = t.uri_raw_md5
    LEFT JOIN temp_meta_groups mg
      ON mg.name_md5 = t.name_md5
     AND mg.description_md5 = t.description_md5
     AND t.name_md5 IS NOT NULL
     AND t.name_md5 <> v_unnamed_name_md5
     AND length(t.desc_clean) > 10
    WHERE (
        COALESCE(ug.member_count, 0) > v_max_expand_group
        OR COALESCE(mg.member_count, 0) > v_max_expand_group
    )
    AND (
        (t.uri_raw_md5 IS NOT NULL AND a2.uri_raw_md5 = t.uri_raw_md5)
        OR (
            t.name_md5 IS NOT NULL
            AND t.name_md5 <> v_unnamed_name_md5
            AND length(t.desc_clean) > 10
            AND a2.name_md5 = t.name_md5
            AND a2.description_md5 = t.description_md5
        )
    )
    GROUP BY t.agent_id;

    CREATE TEMP TABLE temp_dup_summary ON COMMIT DROP AS
    WITH small_agg AS (
        SELECT
            agent_id,
            count(DISTINCT dup_id)::integer AS total_count,
            jsonb_agg(DISTINCT dup_id ORDER BY dup_id) AS safe_ids
        FROM temp_dup_matches
        GROUP BY agent_id
    )
    SELECT
        b.agent_id,
        COALESCE(e.total_count, s.total_count, 0) AS total_count,
        CASE
            WHEN COALESCE(e.total_count, s.total_count, 0) > v_max_list_ids
                THEN jsonb_build_array('too_many_to_list')
            WHEN e.agent_id IS NOT NULL
                THEN '[]'::jsonb
            ELSE COALESCE(s.safe_ids, '[]'::jsonb)
        END AS safe_ids
    FROM temp_dup_batch b
    LEFT JOIN small_agg s ON s.agent_id = b.agent_id
    LEFT JOIN temp_dup_exact e ON e.agent_id = b.agent_id;

    UPDATE erc_8004.agents a
    SET
        duplicate_information = jsonb_build_object(
            'count', COALESCE(s.total_count, 0),
            'duplicate_agent_ids', COALESCE(s.safe_ids, '[]'::jsonb)
        ),
        has_duplicates = (COALESCE(s.total_count, 0) > 0),
        duplicate_calculate_at = NOW()
    FROM temp_dup_batch t
    LEFT JOIN temp_dup_summary s ON s.agent_id = t.agent_id
    WHERE a.id = t.agent_id;

    GET DIAGNOSTICS v_processed_count = ROW_COUNT;

    SELECT EXISTS (
        SELECT 1
        FROM erc_8004.agents a
        WHERE a.duplicate_calculate_at IS NULL
           OR a.duplicate_calculate_at < (NOW() - INTERVAL '7 days')
        LIMIT 1
    ) INTO v_has_more;

    IF v_has_more THEN
        SELECT count(*)::bigint
        INTO v_remaining
        FROM (
            SELECT 1
            FROM erc_8004.agents a
            WHERE a.duplicate_calculate_at IS NULL
               OR a.duplicate_calculate_at < (NOW() - INTERVAL '7 days')
            LIMIT 10001
        ) capped;
        IF v_remaining >= 10001 THEN
            v_remaining := NULL;
        END IF;
    ELSE
        v_remaining := 0;
    END IF;

    IF NOT v_has_more THEN
        SELECT jobid INTO v_job_id
        FROM cron.job
        WHERE jobname = 'agent_valid_duplicates';

        IF v_job_id IS NOT NULL THEN
            PERFORM cron.alter_job(v_job_id, NULL, NULL, NULL, NULL, false);
            RAISE NOTICE 'Todos los duplicados procesados → Job "agent_valid_duplicates" DESACTIVADO';
        END IF;

        PERFORM cron.unschedule('agent-valid-duplicates-weekly');
    END IF;

    RETURN jsonb_build_object(
        'status', 'success',
        'records_updated', v_processed_count,
        'remaining', v_remaining,
        'has_more', v_has_more,
        'timestamp', NOW()
    );
END;
$$;
