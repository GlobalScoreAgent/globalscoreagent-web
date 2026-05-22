-- Ejecutar en Supabase SQL Editor (además de RLS y políticas SELECT)
-- Sin estos GRANT, la API devuelve "permission denied" aunque veas datos en Table Editor.

GRANT USAGE ON SCHEMA web_page TO anon, authenticated, service_role;

GRANT SELECT ON web_page.web_page_statistics TO anon, authenticated, service_role;

-- Rol interno de PostgREST en Supabase (necesario para API REST)
GRANT USAGE ON SCHEMA web_page TO authenticator;
GRANT SELECT ON web_page.web_page_statistics TO authenticator;

-- Opcional: todas las tablas del schema web_page
-- GRANT SELECT ON ALL TABLES IN SCHEMA web_page TO anon, authenticated, service_role, authenticator;
