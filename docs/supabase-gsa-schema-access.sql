-- GSA schema: required for PostgREST / Supabase client .schema('gsa')
-- Run in Supabase Dashboard → SQL Editor after exposing schema "gsa" in API settings.
--
-- Symptom without USAGE: "permission denied for schema gsa"

GRANT USAGE ON SCHEMA gsa TO authenticated;
GRANT USAGE ON SCHEMA gsa TO service_role;

-- RPC (if not already applied from migration dump)
GRANT EXECUTE ON FUNCTION gsa.user_login_process(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION gsa.user_logout_process(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION gsa.user_logout_process(bigint) TO service_role;
GRANT EXECUTE ON FUNCTION gsa.promotional_code_redime(text, bigint) TO authenticated;

-- Table access used by user_login_process (SECURITY DEFINER still needs caller schema USAGE)
GRANT SELECT, INSERT, UPDATE ON TABLE gsa.profiles TO authenticated;
GRANT SELECT ON TABLE gsa.subscription_dashboard_type TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE gsa.subscriptions TO authenticated;
GRANT SELECT ON TABLE gsa.profile_api_credits TO authenticated;
GRANT SELECT ON TABLE gsa.credit_types TO authenticated;
GRANT SELECT, INSERT ON TABLE gsa.feedbacks TO authenticated;
GRANT SELECT ON TABLE gsa.feedback_types TO authenticated;

-- Sequences for INSERT ... RETURNING (identity columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gsa TO authenticated;

-- RLS: plan catalog (is_visible) and active types for subscription embeds
CREATE POLICY "authenticated read subscription dashboard types"
  ON gsa.subscription_dashboard_type
  FOR SELECT
  TO authenticated
  USING (is_visible = true OR is_active = true);

-- RLS: allow authenticated users to update their own profile/preferences
CREATE POLICY "authenticated update own profile"
  ON gsa.profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: profile API credits (enable RLS on table first if not already enabled)
-- ALTER TABLE gsa.profile_api_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read own profile api credits"
  ON gsa.profile_api_credits
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM gsa.profiles WHERE user_id = auth.uid()
    )
  );

-- RLS: credit type lookup for embedded reads
-- ALTER TABLE gsa.credit_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read credit types"
  ON gsa.credit_types
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS: feedbacks (enable RLS on tables first if not already enabled)
-- ALTER TABLE gsa.feedbacks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gsa.feedback_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read own feedbacks"
  ON gsa.feedbacks
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM gsa.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated insert own feedbacks"
  ON gsa.feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM gsa.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated read active feedback types"
  ON gsa.feedback_types
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS: own subscriptions (read + NOWPayments checkout update)
-- ALTER TABLE gsa.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read own subscriptions"
  ON gsa.subscriptions
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM gsa.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated update own subscriptions"
  ON gsa.subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM gsa.profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM gsa.profiles WHERE user_id = auth.uid()
    )
  );
