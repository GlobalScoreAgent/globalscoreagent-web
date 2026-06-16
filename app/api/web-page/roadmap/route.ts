import { apiJsonResponse } from '@/lib/api/route-config';
import { getSupabaseReadClient } from '@/lib/supabase/read';
import { fetchRoadmapFeatures } from '@/lib/web-page/roadmap-features';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabaseReadClient();
  if (!supabase) {
    return apiJsonResponse({ success: true, features: [] });
  }

  try {
    const features = await fetchRoadmapFeatures(supabase);
    return apiJsonResponse({ success: true, features });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'roadmap_fetch_failed';
    console.warn('[web-page/roadmap]', message);
    return apiJsonResponse({ success: true, features: [] });
  }
}
