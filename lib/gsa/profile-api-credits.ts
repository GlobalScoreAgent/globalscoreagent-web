import type { SupabaseClient } from '@supabase/supabase-js';
import { getProfileIdByUserId } from '@/lib/gsa/subscription-summary';

export type ProfileApiCredit = {
  id: number;
  credit_type_id: number;
  credit_type_name: string;
  credit_type_description: string;
  amount_credits_available: number;
  valid_from: string;
  valid_to: string | null;
};

type CreditTypeEmbed = {
  name: string;
  description: string;
};

type ProfileApiCreditRow = {
  id: number;
  credit_type_id: number;
  amount_credits_available: number;
  valid_from: string;
  valid_to: string | null;
  credit_types: CreditTypeEmbed | CreditTypeEmbed[] | null;
};

const CREDITS_SELECT =
  'id, credit_type_id, amount_credits_available, valid_from, valid_to, credit_types(name, description)';

function extractCreditType(
  field: ProfileApiCreditRow['credit_types'],
): { name: string; description: string } | null {
  if (!field) return null;
  const row = Array.isArray(field) ? field[0] : field;
  if (!row || typeof row.name !== 'string' || !row.name.trim()) return null;
  return {
    name: row.name.trim(),
    description: typeof row.description === 'string' ? row.description.trim() : '',
  };
}

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function mapRowToCredit(row: ProfileApiCreditRow): ProfileApiCredit | null {
  const creditType = extractCreditType(row.credit_types);
  const id = positiveInt(row.id);
  const creditTypeId = positiveInt(row.credit_type_id);
  const amount = typeof row.amount_credits_available === 'number'
    ? row.amount_credits_available
    : Number(row.amount_credits_available);

  if (
    id == null ||
    creditTypeId == null ||
    !creditType ||
    !Number.isFinite(amount) ||
    typeof row.valid_from !== 'string'
  ) {
    return null;
  }

  return {
    id,
    credit_type_id: creditTypeId,
    credit_type_name: creditType.name,
    credit_type_description: creditType.description,
    amount_credits_available: Math.trunc(amount),
    valid_from: row.valid_from,
    valid_to: typeof row.valid_to === 'string' ? row.valid_to : null,
  };
}

export async function fetchProfileApiCreditsForProfile(
  supabase: SupabaseClient,
  profileId: number,
): Promise<ProfileApiCredit[]> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('profiles_api_credits')
    .select(CREDITS_SELECT)
    .eq('profile_id', profileId)
    .order('valid_from', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((row) => mapRowToCredit(row as ProfileApiCreditRow))
    .filter((credit): credit is ProfileApiCredit => credit != null);
}

export async function fetchProfileApiCreditsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileApiCredit[]> {
  const profileId = await getProfileIdByUserId(supabase, userId);
  if (profileId == null) return [];
  return fetchProfileApiCreditsForProfile(supabase, profileId);
}
