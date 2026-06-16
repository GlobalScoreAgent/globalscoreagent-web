-- Dashboard read access for authenticated users (run in Supabase SQL Editor)
-- Prerequisite: expose schema "web_dashboard" in Dashboard > Project Settings > API > Exposed schemas

-- 1) Schema usage (required in addition to RLS policies)
GRANT USAGE ON SCHEMA web_dashboard TO authenticated;
GRANT USAGE ON SCHEMA web_dashboard TO anon;

-- 2) Table SELECT (adjust if you rely only on RLS policies)
GRANT SELECT ON ALL TABLES IN SCHEMA web_dashboard TO authenticated;

-- 3) RLS policies (enable RLS on each table first in Table Editor)
ALTER TABLE web_dashboard.main_stadistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_dashboard.chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_dashboard.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_dashboard.agent_advanced_filters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated read main_stadistics" ON web_dashboard.main_stadistics;
CREATE POLICY "authenticated read main_stadistics"
  ON web_dashboard.main_stadistics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated read chains" ON web_dashboard.chains;
CREATE POLICY "authenticated read chains"
  ON web_dashboard.chains FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated read agents" ON web_dashboard.agents;
CREATE POLICY "authenticated read agents"
  ON web_dashboard.agents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated read agent_advanced_filters" ON web_dashboard.agent_advanced_filters;
CREATE POLICY "authenticated read agent_advanced_filters"
  ON web_dashboard.agent_advanced_filters FOR SELECT TO authenticated USING (true);

ALTER TABLE web_dashboard.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated read active dashboard news" ON web_dashboard.news;
CREATE POLICY "authenticated read active dashboard news"
  ON web_dashboard.news FOR SELECT TO authenticated USING (true);
