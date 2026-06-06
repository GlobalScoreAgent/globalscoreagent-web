import { apiJsonResponse } from '@/lib/api/route-config';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import { fetchSubscriptionsForUser } from '@/lib/gsa/subscriptions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  try {
    const { active, history, registration_source } = await fetchSubscriptionsForUser(
      auth.supabase,
      auth.user.id,
    );

    return apiJsonResponse({
      success: true,
      active,
      history,
      registration_source,
    });
  } catch (err) {
    console.error('[dashboard/subscriptions]', err);
    return apiJsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : 'subscriptions_fetch_failed',
      },
      { status: 500 },
    );
  }
}
