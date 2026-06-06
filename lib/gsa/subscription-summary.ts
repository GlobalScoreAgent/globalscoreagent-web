import type { SupabaseClient } from '@supabase/supabase-js';

export type SubscriptionSummary = {
  plan_name: string;
  current_period_start: string;
  current_period_end: string;
};

type SubscriptionRow = {
  current_period_start: string | null;
  current_period_end: string | null;
  status: string;
  subscription_dashboard_type:
    | { name: string }
    | { name: string }[]
    | null;
};

export function extractPlanName(
  typeField: SubscriptionRow['subscription_dashboard_type'],
): string | null {
  if (!typeField) return null;
  const row = Array.isArray(typeField) ? typeField[0] : typeField;
  return typeof row?.name === 'string' && row.name.trim() ? row.name.trim() : null;
}

function toSummary(row: SubscriptionRow): SubscriptionSummary | null {
  const planName = extractPlanName(row.subscription_dashboard_type);
  if (!planName || !row.current_period_start || !row.current_period_end) {
    return null;
  }

  return {
    plan_name: planName,
    current_period_start: row.current_period_start,
    current_period_end: row.current_period_end,
  };
}

const SUBSCRIPTION_SELECT =
  'current_period_start, current_period_end, status, subscription_dashboard_type(name)';

export async function getProfileIdByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id;
}

export async function fetchSubscriptionSummaryForProfile(
  supabase: SupabaseClient,
  profileId: number,
): Promise<SubscriptionSummary | null> {
  const nowIso = new Date().toISOString();

  const { data: activeRows, error: activeError } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select(SUBSCRIPTION_SELECT)
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .gt('current_period_end', nowIso)
    .order('current_period_end', { ascending: false })
    .limit(1);

  if (activeError) {
    throw new Error(activeError.message);
  }

  const activeRow = activeRows?.[0] as SubscriptionRow | undefined;
  if (activeRow) {
    const summary = toSummary(activeRow);
    if (summary) return summary;
  }

  const { data: fallbackRows, error: fallbackError } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select(SUBSCRIPTION_SELECT)
    .eq('profile_id', profileId)
    .order('current_period_end', { ascending: false })
    .limit(1);

  if (fallbackError) {
    throw new Error(fallbackError.message);
  }

  const fallbackRow = fallbackRows?.[0] as SubscriptionRow | undefined;
  if (!fallbackRow) return null;

  return toSummary(fallbackRow);
}

export async function fetchSubscriptionSummaryForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionSummary | null> {
  const profileId = await getProfileIdByUserId(supabase, userId);
  if (profileId == null) return null;
  return fetchSubscriptionSummaryForProfile(supabase, profileId);
}
