import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileIdByUserId } from '@/lib/gsa/subscription-summary';

/** True when the user has an active subscription that is permanent or not ended. */
export async function hasActiveSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const profileId = await getProfileIdByUserId(supabase, userId);
  if (profileId == null) return false;

  const { data, error } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select('current_period_end')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const now = Date.now();
  return (data ?? []).some(({ current_period_end }) => {
    if (current_period_end == null) return true;
    const periodEnd = Date.parse(current_period_end);
    return Number.isFinite(periodEnd) && periodEnd > now;
  });
}
