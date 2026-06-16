import { apiJsonResponse } from '@/lib/api/route-config';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import { fetchActiveDashboardNews } from '@/lib/web-dashboard/dashboard-news';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  try {
    const news = await fetchActiveDashboardNews(auth.supabase);

    return apiJsonResponse({
      success: true,
      news,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'dashboard_news_fetch_failed';
    console.warn('[dashboard/news]', message);

    return apiJsonResponse({
      success: true,
      news: [],
    });
  }
}
