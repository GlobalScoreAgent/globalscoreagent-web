-- Public agent profile APIs (/api/web-page/agents/*) read from web_dashboard tables.

-- Run in Supabase Dashboard → SQL Editor after exposing schema "web_dashboard" in API settings.

--

-- IMPORTANT: getSupabaseReadClient() prefers SUPABASE_SERVICE_ROLE_KEY when set.

-- You MUST grant service_role (not only anon/authenticated) or the public agent API fails with:

--   "permission denied for schema web_dashboard"

--

-- Prerequisite: Project Settings → API → Exposed schemas → include "web_dashboard"



GRANT USAGE ON SCHEMA web_dashboard TO anon;

GRANT USAGE ON SCHEMA web_dashboard TO authenticated;

GRANT USAGE ON SCHEMA web_dashboard TO service_role;



GRANT SELECT ON TABLE web_dashboard.agents TO anon;

GRANT SELECT ON TABLE web_dashboard.agents TO authenticated;

GRANT SELECT ON TABLE web_dashboard.agents TO service_role;



GRANT SELECT ON TABLE web_dashboard.index_humi TO anon;

GRANT SELECT ON TABLE web_dashboard.index_humi TO authenticated;

GRANT SELECT ON TABLE web_dashboard.index_humi TO service_role;



GRANT SELECT ON TABLE web_dashboard.index_wami TO anon;

GRANT SELECT ON TABLE web_dashboard.index_wami TO authenticated;

GRANT SELECT ON TABLE web_dashboard.index_wami TO service_role;



-- Chain logos (run the line that matches your project; comment out the other if it errors)

GRANT SELECT ON TABLE web_dashboard.chains_stadistics TO anon;

GRANT SELECT ON TABLE web_dashboard.chains_stadistics TO authenticated;

GRANT SELECT ON TABLE web_dashboard.chains_stadistics TO service_role;



-- GRANT SELECT ON TABLE web_dashboard.chains TO anon;

-- GRANT SELECT ON TABLE web_dashboard.chains TO authenticated;

-- GRANT SELECT ON TABLE web_dashboard.chains TO service_role;



-- If RLS is enabled, anon/authenticated may also need policies (service_role bypasses RLS):

-- CREATE POLICY "anon read agents" ON web_dashboard.agents FOR SELECT TO anon USING (true);

-- CREATE POLICY "anon read index_humi" ON web_dashboard.index_humi FOR SELECT TO anon USING (true);

-- CREATE POLICY "anon read index_wami" ON web_dashboard.index_wami FOR SELECT TO anon USING (true);

