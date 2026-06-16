import type { SupabaseClient } from '@supabase/supabase-js';

export type PromotionalCodeRedeemResult = {
  success: boolean;
  error_code?: string;
  message_es: string;
  message_en: string;
};

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

export function normalizePromotionalCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parsePromotionalCodeRedeemResult(raw: unknown): PromotionalCodeRedeemResult | null {
  let row = raw;

  if (typeof raw === 'string') {
    try {
      row = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  if (!row || typeof row !== 'object') return null;

  const data = row as Record<string, unknown>;
  const messageEs = typeof data.message_es === 'string' ? data.message_es : '';
  const messageEn = typeof data.message_en === 'string' ? data.message_en : '';

  return {
    success: data.success === true,
    error_code: typeof data.error_code === 'string' ? data.error_code : undefined,
    message_es: messageEs,
    message_en: messageEn,
  };
}

export async function callPromotionalCodeRedeem(
  supabase: SupabaseClient,
  code: string,
  profileId: number,
): Promise<PromotionalCodeRedeemResult> {
  const normalizedCode = normalizePromotionalCode(code);
  const normalizedProfileId = positiveInt(profileId);

  if (!normalizedCode) {
    throw new Error('Invalid promotional code');
  }

  if (normalizedProfileId == null) {
    throw new Error('Invalid profile_id');
  }

  const { data, error } = await supabase.schema('gsa').rpc('promotional_code_redime', {
    p_code: normalizedCode,
    p_profile_id: normalizedProfileId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const parsed = parsePromotionalCodeRedeemResult(data);
  if (!parsed) {
    throw new Error('Invalid response from promotional_code_redime');
  }

  return parsed;
}
