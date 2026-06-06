-- Optimized: single JSON expansion per agent, set-based UPDATE (no row loop).
-- Uses concatenation instead of format() to avoid errors when JSON text contains "%".
-- Test: SELECT web_dashboard.generate_humi_executive_summary(1);

CREATE OR REPLACE FUNCTION web_dashboard.generate_humi_executive_summary(p_limit integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = web_dashboard, public
AS $$
DECLARE
  processed_count integer;
BEGIN
  WITH candidates AS (
    SELECT
      i.agent_id,
      a.id AS agents_table_id,
      a.name,
      i.humi_score,
      i.humi_score_category,
      i.current_humi_score_calculated_at,
      i.pillar_measure_summary,
      i.pillar_history_summary,
      i.pillar_usage_summary,
      i.pillar_information_summary,
      i.pillar_measure_score,
      i.pillar_history_score,
      i.pillar_usage_score,
      i.pillar_information_score
    FROM web_dashboard.index_humi i
    JOIN web_dashboard.agents a ON a.id = i.agent_id
    WHERE i.current_humi_score_calculated_at IS NOT NULL
      AND (
        a.executive_summary_humi_produced_at IS NULL
        OR a.executive_summary_humi_produced_at < NOW() - INTERVAL '1 day'
      )
    ORDER BY a.executive_summary_humi_produced_at ASC NULLS FIRST,
             i.current_humi_score_calculated_at DESC
    LIMIT p_limit
  ),
  all_items AS (
    SELECT
      c.agents_table_id,
      c.agent_id,
      p.pillar_name,
      p.pillar_score,
      item
    FROM candidates c
    CROSS JOIN LATERAL (
      VALUES
        ('Measure'::text, c.pillar_measure_summary, c.pillar_measure_score),
        ('History', c.pillar_history_summary, c.pillar_history_score),
        ('Usage', c.pillar_usage_summary, c.pillar_usage_score),
        ('Information', c.pillar_information_summary, c.pillar_information_score)
    ) AS p(pillar_name, summary, pillar_score)
    CROSS JOIN LATERAL jsonb_array_elements(
      COALESCE(p.summary->'block_basic_items', '[]'::jsonb)
      || COALESCE(p.summary->'block_intermediate_items', '[]'::jsonb)
      || COALESCE(p.summary->'block_advanced_items', '[]'::jsonb)
    ) AS item
  ),
  pillar_reasons AS (
    SELECT
      agents_table_id,
      pillar_name,
      MAX(pillar_score) AS pillar_score,
      string_agg(
        COALESCE(item->'reason'->>'reason', item->>'reason', 'ítem relevante'),
        '. '
      ) AS reasons
    FROM all_items
    GROUP BY agents_table_id, pillar_name
  ),
  pillar_text AS (
    SELECT
      agents_table_id,
      string_agg(
        E'\n\nEl **Pillar '
        || pillar_name
        || '** ('
        || to_char(pillar_score, 'FM999990.00')
        || '/25) '
        || CASE
          WHEN pillar_score >= 20 THEN 'destaca fuertemente'
          WHEN pillar_score >= 16 THEN 'es sólido'
          WHEN pillar_score >= 12 THEN 'es moderado'
          ELSE 'muestra oportunidades claras de mejora'
        END
        || E'. '
        || COALESCE(reasons, ''),
        '' ORDER BY CASE pillar_name
          WHEN 'Measure' THEN 1
          WHEN 'History' THEN 2
          WHEN 'Usage' THEN 3
          WHEN 'Information' THEN 4
          ELSE 5
        END
      ) AS pillar_text
    FROM pillar_reasons
    GROUP BY agents_table_id
  ),
  strengths AS (
    SELECT
      agents_table_id,
      string_agg(
        DISTINCT '• '
        || COALESCE(item->>'name', '')
        || ' en '
        || pillar_name
        || ' ('
        || to_char(COALESCE((item->>'points')::numeric, 0), 'FM999990.0')
        || ' pts)',
        E'\n'
      ) AS strengths
    FROM all_items
    GROUP BY agents_table_id
  ),
  weaknesses AS (
    SELECT
      agents_table_id,
      string_agg(
        DISTINCT '• '
        || COALESCE(item->>'name', '')
        || ' en '
        || pillar_name
        || ' ('
        || to_char(COALESCE((item->>'points')::numeric, 0), 'FM999990.0')
        || ' pts) – '
        || COALESCE(item->'reason'->>'reason', 'oportunidad de mejora'),
        E'\n'
      ) AS weaknesses
    FROM all_items
    GROUP BY agents_table_id
  ),
  recs AS (
    SELECT
      agents_table_id,
      string_agg(rec_line, E'\n') AS recs
    FROM (
      SELECT
        ai.agents_table_id,
        '→ Mejorar **'
        || COALESCE(ai.item->>'name', '')
        || '** en '
        || ai.pillar_name
        || ': '
        || COALESCE(ai.item->'reason'->>'reason', 'este aspecto') AS rec_line,
        row_number() OVER (
          PARTITION BY ai.agents_table_id
          ORDER BY COALESCE((ai.item->>'points')::numeric, 0) ASC NULLS LAST
        ) AS rn
      FROM all_items ai
      WHERE COALESCE((ai.item->>'points')::numeric, 0) < 1.8
    ) ranked
    WHERE rn <= 5
    GROUP BY agents_table_id
  ),
  summaries AS (
    SELECT
      c.agents_table_id,
      'El agente **'
      || c.name
      || '** registra un **HUMI de '
      || to_char(c.humi_score, 'FM999990.00')
      || '** ('
      || COALESCE(c.humi_score_category, 'Sin categoría')
      || ') calculado el '
      || to_char(c.current_humi_score_calculated_at::date, 'YYYY-MM-DD')
      || E'.\n\n'
      || COALESCE(pt.pillar_text, '')
      || E'\n\n**Fortalezas clave:**\n'
      || COALESCE(s.strengths, 'Ninguna destacada')
      || E'\n\n**Áreas de mejora prioritarias:**\n'
      || COALESCE(w.weaknesses, 'Ninguna identificada')
      || E'\n\n**Recomendaciones accionables:**\n'
      || COALESCE(r.recs, 'Mantener el nivel actual.') AS humi_summary
    FROM candidates c
    LEFT JOIN pillar_text pt ON pt.agents_table_id = c.agents_table_id
    LEFT JOIN strengths s ON s.agents_table_id = c.agents_table_id
    LEFT JOIN weaknesses w ON w.agents_table_id = c.agents_table_id
    LEFT JOIN recs r ON r.agents_table_id = c.agents_table_id
  )
  UPDATE web_dashboard.agents a
  SET
    executive_summary_humi = s.humi_summary,
    executive_summary_humi_produced_at = NOW(),
    updated_at = NOW()
  FROM summaries s
  WHERE a.id = s.agents_table_id;

  GET DIAGNOSTICS processed_count = ROW_COUNT;

  RAISE NOTICE 'Procesados % agentes', processed_count;
  RETURN processed_count;
END;
$$;

COMMENT ON FUNCTION web_dashboard.generate_humi_executive_summary(integer) IS
  'Generates HUMI executive summaries. Optimized set-based version (no format(); safe with % in JSON text).';
