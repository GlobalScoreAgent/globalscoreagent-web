import { apiJsonResponse } from '@/lib/api/route-config';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import { fetchProfileApiCreditsForUser } from '@/lib/gsa/profile-api-credits';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  try {
    const credits = await fetchProfileApiCreditsForUser(auth.supabase, auth.user.id);

    return apiJsonResponse({
      success: true,
      credits,
    });
  } catch (err) {
    console.error('[dashboard/api-credits]', err);
    return apiJsonResponse(
      {
        success: false,
        error: err instanceof Error ? err.message : 'api_credits_fetch_failed',
      },
      { status: 500 },
    );
  }
}
