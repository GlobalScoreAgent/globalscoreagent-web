-- GSA schema: required for PostgREST / Supabase client .schema('gsa')
-- Run in Supabase Dashboard → SQL Editor after exposing schema "gsa" in API settings.
--
-- Symptom without USAGE: "permission denied for schema gsa"

GRANT USAGE ON SCHEMA gsa TO authenticated;
GRANT USAGE ON SCHEMA gsa TO service_role;

-- RPC (if not already applied from migration dump)
GRANT EXECUTE ON FUNCTION gsa.user_login_process(uuid, text, text) TO authenticated;

-- Table access used by user_login_process (SECURITY DEFINER still needs caller schema USAGE)
GRANT SELECT, INSERT, UPDATE ON TABLE gsa.profiles TO authenticated;
GRANT SELECT ON TABLE gsa.subscription_dashboard_type TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE gsa.subscriptions TO authenticated;

-- Sequences for INSERT ... RETURNING (identity columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gsa TO authenticated;

-- RLS: plan names for subscription summary in dashboard top nav
CREATE POLICY "authenticated read subscription dashboard types"
  ON gsa.subscription_dashboard_type
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS: allow authenticated users to update their own profile/preferences
CREATE POLICY "authenticated update own profile"
  ON gsa.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
