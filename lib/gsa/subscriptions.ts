import type { SupabaseClient } from '@supabase/supabase-js';
import { extractPlanName, getProfileIdByUserId } from '@/lib/gsa/subscription-summary';
import {
  parseRegistrationSource,
  type RegistrationSource,
} from '@/lib/gsa/dashboard-plan-catalog';

export type SubscriptionRecord = {
  id: number;
  plan_name: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  metadata_payment: Record<string, unknown>;
  registration_source: RegistrationSource | null;
};

type SubscriptionDetailRow = {
  id: number;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  metadata_payment: Record<string, unknown> | null;
  subscription_dashboard_type:
    | { name: string }
    | { name: string }[]
    | null;
};

const SUBSCRIPTION_DETAIL_SELECT =
  'id, status, current_period_start, current_period_end, created_at, metadata_payment, subscription_dashboard_type(name)';

function toRecord(row: SubscriptionDetailRow): SubscriptionRecord | null {
  const planName = extractPlanName(row.subscription_dashboard_type);
  if (!planName) return null;

  const metadataPayment =
    row.metadata_payment && typeof row.metadata_payment === 'object'
      ? row.metadata_payment
      : {};

  return {
    id: row.id,
    plan_name: planName,
    status: row.status,
    current_period_start: row.current_period_start,
    current_period_end: row.current_period_end,
    created_at: row.created_at,
    metadata_payment: metadataPayment,
    registration_source: parseRegistrationSource(metadataPayment),
  };
}

export async function fetchSubscriptionHistoryForProfile(
  supabase: SupabaseClient,
  profileId: number,
): Promise<SubscriptionRecord[]> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select(SUBSCRIPTION_DETAIL_SELECT)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => toRecord(row as SubscriptionDetailRow))
    .filter((row): row is SubscriptionRecord => row != null);
}

export async function fetchActiveSubscriptionForProfile(
  supabase: SupabaseClient,
  profileId: number,
): Promise<SubscriptionRecord | null> {
  const nowIso = new Date().toISOString();

  const { data: activeRows, error: activeError } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select(SUBSCRIPTION_DETAIL_SELECT)
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .gt('current_period_end', nowIso)
    .order('current_period_end', { ascending: false })
    .limit(1);

  if (activeError) {
    throw new Error(activeError.message);
  }

  const activeRow = activeRows?.[0] as SubscriptionDetailRow | undefined;
  if (activeRow) {
    const record = toRecord(activeRow);
    if (record) return record;
  }

  const { data: fallbackRows, error: fallbackError } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select(SUBSCRIPTION_DETAIL_SELECT)
    .eq('profile_id', profileId)
    .order('current_period_end', { ascending: false })
    .limit(1);

  if (fallbackError) {
    throw new Error(fallbackError.message);
  }

  const fallbackRow = fallbackRows?.[0] as SubscriptionDetailRow | undefined;
  if (!fallbackRow) return null;

  return toRecord(fallbackRow);
}

export function resolveRegistrationSource(
  active: SubscriptionRecord | null,
  history: SubscriptionRecord[],
): RegistrationSource | null {
  if (active?.registration_source) return active.registration_source;
  for (const row of history) {
    if (row.registration_source) return row.registration_source;
  }
  return null;
}

export async function fetchSubscriptionsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  active: SubscriptionRecord | null;
  history: SubscriptionRecord[];
  registration_source: RegistrationSource | null;
}> {
  const profileId = await getProfileIdByUserId(supabase, userId);
  if (profileId == null) {
    return { active: null, history: [], registration_source: null };
  }

  const [active, history] = await Promise.all([
    fetchActiveSubscriptionForProfile(supabase, profileId),
    fetchSubscriptionHistoryForProfile(supabase, profileId),
  ]);

  return {
    active,
    history,
    registration_source: resolveRegistrationSource(active, history),
  };
}
