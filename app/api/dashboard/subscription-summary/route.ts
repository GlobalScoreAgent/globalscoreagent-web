import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import { apiJsonResponse } from '@/lib/api/route-config';
import { fetchSubscriptionSummaryForUser } from '@/lib/gsa/subscription-summary';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  try {
    const subscription = await fetchSubscriptionSummaryForUser(
      auth.supabase,
      auth.user.id,
    );

    if (!subscription) {
      return apiJsonResponse({ success: true, subscription: null });
    }

    return apiJsonResponse({
      success: true,
      subscription,
      plan_name: subscription.plan_name,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
    });
  } catch (err) {
    console.error('[dashboard/subscription-summary]', err);
    return apiJsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : 'subscription_summary_failed',
      },
      { status: 500 },
    );
  }
}
