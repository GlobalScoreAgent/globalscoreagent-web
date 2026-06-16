import type { SupabaseClient } from '@supabase/supabase-js';

export type NowPaymentCreationResult = {
  success: boolean;
  payment_url?: string;
  nowpayments_subscription_id?: string | number;
  subscription_status?: string;
  customer_email?: string;
  email_sent?: boolean;
  error_code?: string;
  message_es?: string;
  message_en?: string;
  error?: string;
  details?: unknown;
};

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function parseNowPaymentCreationResult(raw: unknown): NowPaymentCreationResult | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;
  const paymentUrl = typeof data.payment_url === 'string' ? data.payment_url.trim() : '';

  return {
    success: data.success === true,
    payment_url: paymentUrl || undefined,
    nowpayments_subscription_id:
      typeof data.nowpayments_subscription_id === 'string' ||
      typeof data.nowpayments_subscription_id === 'number'
        ? data.nowpayments_subscription_id
        : undefined,
    subscription_status:
      typeof data.subscription_status === 'string' ? data.subscription_status : undefined,
    customer_email:
      typeof data.customer_email === 'string' ? data.customer_email.trim() : undefined,
    email_sent: data.email_sent === true,
    error_code: typeof data.error_code === 'string' ? data.error_code : undefined,
    message_es: typeof data.message_es === 'string' ? data.message_es : undefined,
    message_en: typeof data.message_en === 'string' ? data.message_en : undefined,
    error: typeof data.error === 'string' ? data.error : undefined,
    details: data.details,
  };
}

function pickBilingualMessage(
  result: NowPaymentCreationResult,
  lang: 'es' | 'en',
): string | undefined {
  return lang === 'es' ? result.message_es : result.message_en;
}

export function formatNowPaymentCreationError(
  result: NowPaymentCreationResult,
  lang: 'es' | 'en',
  fallback: string,
): string {
  return pickBilingualMessage(result, lang) ?? result.error ?? fallback;
}

async function parseFunctionsInvokeError(error: unknown): Promise<NowPaymentCreationResult> {
  if (!error || typeof error !== 'object') {
    return { success: false, error: 'nowpayment_creation_failed' };
  }

  const err = error as { message?: string; context?: Response };
  let body: unknown = null;

  if (err.context && typeof err.context.json === 'function') {
    try {
      body = await err.context.json();
    } catch {
      body = null;
    }
  }

  const parsed = parseNowPaymentCreationResult(body);
  if (parsed) {
    return {
      ...parsed,
      success: false,
      error: parsed.error ?? err.message ?? 'nowpayment_creation_failed',
    };
  }

  return {
    success: false,
    error: err.message ?? 'nowpayment_creation_failed',
  };
}

export async function invokeSubscriptionNowPaymentCreation(
  supabase: SupabaseClient,
  subscriptionId: number,
  subscriptionDashboardTypeId: number,
): Promise<NowPaymentCreationResult> {
  const normalizedSubscriptionId = positiveInt(subscriptionId);
  const normalizedPlanId = positiveInt(subscriptionDashboardTypeId);

  if (normalizedSubscriptionId == null || normalizedPlanId == null) {
    return { success: false, error: 'Invalid subscription or plan id' };
  }

  const { data, error } = await supabase.functions.invoke('gsa_subscription_nowpayment_creation', {
    body: {
      subscription_id: normalizedSubscriptionId,
      subscription_dashboard_type_id: normalizedPlanId,
    },
  });

  if (error) {
    return parseFunctionsInvokeError(error);
  }

  const parsed = parseNowPaymentCreationResult(data);
  if (!parsed) {
    return { success: false, error: 'Invalid response from nowpayment creation' };
  }

  return parsed;
}
