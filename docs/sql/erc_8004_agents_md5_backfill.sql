-- Backfill de columnas md5 en erc_8004.agents (despliegue manual).
-- Ejecutar después de crear: name_md5, description_md5, uri_raw_md5.
--
-- Normalización (igual que agent_duplicates_processed):
--   name_md5        = md5(lower(trim(name)))           si name IS NOT NULL
--   description_md5 = md5(trim(COALESCE(description, '')))
--   uri_raw_md5     = md5(agent_uri_raw)              si URI no null/vacía

-- Pre-check: cuántas filas faltan por poblar
SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE name_md5 IS NULL AND name IS NOT NULL) AS pending_name,
    COUNT(*) FILTER (WHERE description_md5 IS NULL) AS pending_description,
    COUNT(*) FILTER (
        WHERE uri_raw_md5 IS NULL
          AND agent_uri_raw IS NOT NULL
          AND agent_uri_raw <> ''
    ) AS pending_uri
FROM erc_8004.agents;

-- Backfill completo (tablas medianas; una sola transacción)
UPDATE erc_8004.agents
SET
    name_md5 = CASE
        WHEN name IS NOT NULL THEN md5(lower(trim(name)))
        ELSE NULL
    END,
    description_md5 = md5(trim(COALESCE(description, ''))),
    uri_raw_md5 = CASE
        WHEN agent_uri_raw IS NOT NULL AND agent_uri_raw <> ''
        THEN md5(agent_uri_raw)
        ELSE NULL
    END
WHERE
    name_md5 IS DISTINCT FROM CASE
        WHEN name IS NOT NULL THEN md5(lower(trim(name)))
        ELSE NULL
    END
    OR description_md5 IS DISTINCT FROM md5(trim(COALESCE(description, '')))
    OR uri_raw_md5 IS DISTINCT FROM CASE
        WHEN agent_uri_raw IS NOT NULL AND agent_uri_raw <> ''
        THEN md5(agent_uri_raw)
        ELSE NULL
    END;

-- Post-check
SELECT
    COUNT(*) AS total,
    COUNT(name_md5) AS with_name_md5,
    COUNT(description_md5) AS with_description_md5,
    COUNT(uri_raw_md5) AS with_uri_raw_md5
FROM erc_8004.agents;

-- Muestra de verificación (5 filas)
SELECT
    id,
    left(name, 40) AS name_sample,
    name_md5,
    left(description, 40) AS desc_sample,
    description_md5,
    left(agent_uri_raw, 60) AS uri_sample,
    uri_raw_md5
FROM erc_8004.agents
WHERE name IS NOT NULL
   OR description IS NOT NULL
   OR agent_uri_raw IS NOT NULL
LIMIT 5;

-- =============================================================================
-- OPCIONAL: backfill por lotes (ejecutar varias veces hasta que actualice 0 filas)
-- =============================================================================
/*
UPDATE erc_8004.agents a
SET
    name_md5 = CASE
        WHEN a.name IS NOT NULL THEN md5(lower(trim(a.name)))
        ELSE NULL
    END,
    description_md5 = md5(trim(COALESCE(a.description, ''))),
    uri_raw_md5 = CASE
        WHEN a.agent_uri_raw IS NOT NULL AND a.agent_uri_raw <> ''
        THEN md5(a.agent_uri_raw)
        ELSE NULL
    END
WHERE a.id IN (
    SELECT id
    FROM erc_8004.agents
    WHERE name_md5 IS DISTINCT FROM CASE
              WHEN name IS NOT NULL THEN md5(lower(trim(name)))
              ELSE NULL
          END
       OR description_md5 IS DISTINCT FROM md5(trim(COALESCE(description, '')))
       OR uri_raw_md5 IS DISTINCT FROM CASE
              WHEN agent_uri_raw IS NOT NULL AND agent_uri_raw <> ''
              THEN md5(agent_uri_raw)
              ELSE NULL
          END
    LIMIT 5000
);
*/
