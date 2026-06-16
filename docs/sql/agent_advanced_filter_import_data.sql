-- Optimizado: un solo scan de web_dashboard.agents, una pasada JSONB.
-- Test: SELECT web_dashboard.agent_advanced_filter_import_data();

CREATE OR REPLACE FUNCTION web_dashboard.agent_advanced_filter_import_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = web_dashboard, public
AS $$
DECLARE
  v_rows_processed integer := 0;
BEGIN
  WITH expanded AS (
    SELECT 'OASF Domains'::text AS filter, jsonb_array_elements_text(oasf_domains_filters) AS val
    FROM web_dashboard.agents
    WHERE oasf_domains_filters IS NOT NULL
      AND oasf_domains_filters <> '[]'::jsonb

    UNION ALL

    SELECT 'Tags', jsonb_array_elements_text(tags_filters)
    FROM web_dashboard.agents
    WHERE tags_filters IS NOT NULL
      AND tags_filters <> '[]'::jsonb

    UNION ALL

    SELECT 'Skills & Capabilities', jsonb_array_elements_text(skills_filters)
    FROM web_dashboard.agents
    WHERE skills_filters IS NOT NULL
      AND skills_filters <> '[]'::jsonb

    UNION ALL

    SELECT 'Skills & Capabilities', jsonb_array_elements_text(capabilities_filters)
    FROM web_dashboard.agents
    WHERE capabilities_filters IS NOT NULL
      AND capabilities_filters <> '[]'::jsonb
  )
  INSERT INTO web_dashboard.agent_advanced_filters (filter, values)
  SELECT
    filter,
    COALESCE(jsonb_agg(DISTINCT val ORDER BY val), '[]'::jsonb)
  FROM expanded
  GROUP BY filter
  ON CONFLICT (filter) DO UPDATE SET
    values = EXCLUDED.values;

  GET DIAGNOSTICS v_rows_processed = ROW_COUNT;

  RAISE NOTICE 'web_dashboard.agent_advanced_filter_import_data() completado. Filas procesadas: %', v_rows_processed;
  RETURN v_rows_processed;
END;
$$;

COMMENT ON FUNCTION web_dashboard.agent_advanced_filter_import_data() IS
  'Importa filtros avanzados desde web_dashboard.agents en una sola pasada.';
