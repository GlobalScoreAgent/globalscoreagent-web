-- Grants and seed for gsa_nowpayments_webhook Edge Function (service_role client).
-- Run in Supabase Dashboard → SQL Editor after deploying the function.
-- Also set secret NOWPAYMENTS_IPN_SECRET (same value as IPN Secret in NOWPayments dashboard).

GRANT SELECT ON TABLE gsa.platforms TO service_role;
GRANT SELECT, INSERT ON TABLE gsa.subscription_payments TO service_role;
GRANT SELECT, UPDATE ON TABLE gsa.subscriptions TO service_role;
GRANT SELECT ON TABLE gsa.subscription_dashboard_type TO service_role;

-- Seed NOWPayments platform (skip if row already exists)
INSERT INTO gsa.platforms (name, is_active, type)
SELECT 'NOWPayments', true, 'payment'
WHERE NOT EXISTS (
  SELECT 1 FROM gsa.platforms WHERE name = 'NOWPayments'
);

-- Optional: prevent duplicate payment rows on IPN retries
-- CREATE UNIQUE INDEX IF NOT EXISTS subscription_payments_platform_payment_unique
--   ON gsa.subscription_payments (platform_id, platform_payment_id);
