import { apiJsonResponse } from '@/lib/api/route-config';
import {
  requireDashboardUser,
  type DashboardAuthResult,
} from '@/lib/auth/require-dashboard-user';
import { hasActiveSubscription } from '@/lib/gsa/subscription-status';

/** Auth + active subscription. Returns 403 subscription_inactive when Disable / expired. */
export async function requireActiveDashboardUser(): Promise<DashboardAuthResult> {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth;

  try {
    const active = await hasActiveSubscription(auth.supabase, auth.user.id);
    if (!active) {
      return {
        ok: false,
        response: apiJsonResponse(
          { success: false, error: 'subscription_inactive' },
          { status: 403 },
        ),
      };
    }
  } catch (err) {
    console.error('[requireActiveDashboardUser]', err);
    return {
      ok: false,
      response: apiJsonResponse(
        {
          success: false,
          error: err instanceof Error ? err.message : 'subscription_check_failed',
        },
        { status: 500 },
      ),
    };
  }

  return auth;
}
