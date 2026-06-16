-- web_page schema: required for marketing KPI API (/api/web-page/statistics)
-- and roadmap section (/api/web-page/roadmap).
-- Run in Supabase Dashboard → SQL Editor after exposing schema "web_page" in API settings.
--
-- IMPORTANT: getSupabaseReadClient() prefers SUPABASE_SERVICE_ROLE_KEY when set.
-- You MUST grant service_role (not only anon/authenticated) or server reads fail with:
--   "permission denied for table web_page.features" (or schema web_page)
--
-- Symptom without USAGE: "permission denied for schema web_page"
-- Symptom without SELECT: empty response or 404 from /api/web-page/statistics

GRANT USAGE ON SCHEMA web_page TO anon;
GRANT USAGE ON SCHEMA web_page TO authenticated;
GRANT USAGE ON SCHEMA web_page TO service_role;

GRANT SELECT ON TABLE web_page.global_score_agent_summary TO anon;
GRANT SELECT ON TABLE web_page.global_score_agent_summary TO authenticated;
GRANT SELECT ON TABLE web_page.global_score_agent_summary TO service_role;

GRANT SELECT ON TABLE web_page.features TO anon;
GRANT SELECT ON TABLE web_page.features TO authenticated;
GRANT SELECT ON TABLE web_page.features TO service_role;
GRANT SELECT ON TABLE web_page.feature_types TO anon;
GRANT SELECT ON TABLE web_page.feature_types TO authenticated;
GRANT SELECT ON TABLE web_page.feature_types TO service_role;

ALTER TABLE web_page.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_page.feature_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read active features" ON web_page.features;
CREATE POLICY "anon read active features"
  ON web_page.features FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "authenticated read active features" ON web_page.features;
CREATE POLICY "authenticated read active features"
  ON web_page.features FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "anon read feature types" ON web_page.feature_types;
CREATE POLICY "anon read feature types"
  ON web_page.feature_types FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "authenticated read feature types" ON web_page.feature_types;
CREATE POLICY "authenticated read feature types"
  ON web_page.feature_types FOR SELECT TO authenticated USING (true);
