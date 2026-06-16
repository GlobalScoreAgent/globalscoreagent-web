import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce(
      (result, key) => {
        const value = obj[key];
        result[key] =
          value && typeof value === 'object' && !Array.isArray(value)
            ? sortObject(value as Record<string, unknown>)
            : value;
        return result;
      },
      {} as Record<string, unknown>,
    );
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifyIpnSignature(
  payload: Record<string, unknown>,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature?.trim() || !secret.trim()) return false;

  const sorted = sortObject(payload);
  const message = JSON.stringify(sorted);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret.trim()),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(computed.toLowerCase(), signature.trim().toLowerCase());
}

function normalizeId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value));
  return null;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNowpaymentsResultRecord(
  platformSubscriptionData: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!platformSubscriptionData) return null;
  const result = platformSubscriptionData.result;
  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (first && typeof first === 'object') return first as Record<string, unknown>;
  }
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }
  return null;
}

function extractNowpaymentsPlanIdFromPlatformData(
  platformSubscriptionData: Record<string, unknown> | null,
): string | null {
  const resultRecord = getNowpaymentsResultRecord(platformSubscriptionData);
  return normalizeId(resultRecord?.subscription_plan_id);
}


async function findPlatformSubscriptionIdByLocalSubscriptionId(
  supabase: ReturnType<typeof createClient>,
  localSubscriptionId: string,
): Promise<string | null> {
  if (!/^\d+$/.test(localSubscriptionId)) return null;

  const { data, error } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select('platform_subscription_id')
    .eq('id', Number(localSubscriptionId))
    .not('platform_subscription_id', 'is', null)
    .maybeSingle();

  if (error) {
    console.error('Error buscando suscripción local por order_id:', error.message);
    return null;
  }

  return normalizeId(data?.platform_subscription_id);
}

async function findPlatformSubscriptionIdByCheckoutOrderId(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
): Promise<string | null> {
  const gsaSubMatch = orderId.match(/^gsa-sub-(\d+)$/);
  if (gsaSubMatch) {
    return findPlatformSubscriptionIdByLocalSubscriptionId(supabase, gsaSubMatch[1]);
  }

  const { data, error } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select('platform_subscription_id')
    .contains('platform_subscription_data', { gsa_checkout_order_id: orderId })
    .maybeSingle();

  if (error) {
    console.error('Error buscando gsa_checkout_order_id:', error.message);
    return null;
  }

  return normalizeId(data?.platform_subscription_id);
}

async function subscriptionExistsForPlatformId(
  supabase: ReturnType<typeof createClient>,
  platformSubscriptionId: string,
): Promise<boolean> {
  const { data: byString } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select('id')
    .eq('platform_subscription_id', platformSubscriptionId)
    .maybeSingle();

  if (byString) return true;

  if (/^\d+$/.test(platformSubscriptionId)) {
    const { data: byNumber } = await supabase
      .schema('gsa')
      .from('subscriptions')
      .select('id')
      .eq('platform_subscription_id', Number(platformSubscriptionId))
      .maybeSingle();
    return !!byNumber;
  }

  return false;
}


async function fetchInvoiceDetails(invoiceId: string): Promise<Record<string, unknown> | null> {
  const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
  if (!apiKey) return null;

  const response = await fetch(`https://api.nowpayments.io/v1/invoice/${invoiceId}`, {
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    console.error('NOWPayments GET invoice unavailable:', response.status, invoiceId);
    return null;
  }

  return (await response.json()) as Record<string, unknown>;
}

async function fetchPaymentsByInvoiceId(invoiceId: string): Promise<Record<string, unknown>[]> {
  const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
  if (!apiKey) return [];

  const url = new URL('https://api.nowpayments.io/v1/payment/');
  url.searchParams.set('invoiceId', invoiceId);
  url.searchParams.set('limit', '10');

  const response = await fetch(url.toString(), {
    headers: { 'x-api-key': apiKey },
  });

  if (!response.ok) {
    console.error('NOWPayments GET payments by invoice unavailable:', response.status, invoiceId);
    return [];
  }

  const body = (await response.json()) as Record<string, unknown>;
  const data = body.data;
  if (Array.isArray(data)) {
    return data.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
  }
  return [];
}

async function fetchNowPaymentsJwt(
  apiKey: string,
  email: string,
  password: string,
): Promise<string | null> {
  const authResponse = await fetch('https://api.nowpayments.io/v1/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authResponse.json();
  if (!authResponse.ok || typeof authData?.token !== 'string' || !authData.token) {
    console.error('NOWPayments auth failed for subscription payments lookup');
    return null;
  }
  return authData.token;
}

function paymentListIncludesId(payments: unknown[], paymentId: string): boolean {
  for (const entry of payments) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const candidates = [row.payment_id, row.id, row.paymentId];
    for (const value of candidates) {
      if (normalizeId(value) === paymentId) return true;
    }
  }
  return false;
}

async function fetchSubscriptionPaymentsFromApi(
  platformSubscriptionId: string,
): Promise<unknown[]> {
  const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
  const email = Deno.env.get('NOWPAYMENTS_EMAIL');
  const password = Deno.env.get('NOWPAYMENTS_PASSWORD');
  if (!apiKey || !email || !password) return [];

  const jwt = await fetchNowPaymentsJwt(apiKey, email, password);
  if (!jwt) return [];

  const response = await fetch(
    `https://api.nowpayments.io/v1/subscriptions/${platformSubscriptionId}/payments`,
    {
      headers: {
        'x-api-key': apiKey,
        Authorization: `Bearer ${jwt}`,
      },
    },
  );

  if (!response.ok) {
    console.error(
      'NOWPayments GET subscription payments unavailable:',
      response.status,
      platformSubscriptionId,
    );
    return [];
  }

  const body = await response.json();
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (Array.isArray(record.result)) return record.result;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
}

async function findPlatformSubscriptionIdByStoredInvoiceId(
  supabase: ReturnType<typeof createClient>,
  invoiceId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select('platform_subscription_id')
    .contains('platform_subscription_data', { gsa_platform_invoice_id: invoiceId })
    .maybeSingle();

  if (error) {
    console.error('Error buscando invoice almacenado:', error.message);
    return null;
  }

  return normalizeId(data?.platform_subscription_id);
}

async function findPlatformSubscriptionIdBySubscriptionPayments(
  supabase: ReturnType<typeof createClient>,
  paymentId: string,
): Promise<string | null> {
  const { data: candidates, error } = await supabase
    .schema('gsa')
    .from('subscriptions')
    .select('id, platform_subscription_id')
    .not('platform_subscription_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(25);

  if (error || !candidates?.length) return null;

  for (const candidate of candidates) {
    const platformSubId = normalizeId(candidate.platform_subscription_id);
    if (!platformSubId) continue;

    const { data: finishedPayment } = await supabase
      .schema('gsa')
      .from('subscription_payments')
      .select('id')
      .eq('subscription_id', candidate.id)
      .eq('platform_payment_id', paymentId)
      .eq('status', 'finished')
      .maybeSingle();

    if (finishedPayment) {
      return platformSubId;
    }

    const payments = await fetchSubscriptionPaymentsFromApi(platformSubId);
    if (paymentListIncludesId(payments, paymentId)) {
      return platformSubId;
    }
  }

  return null;
}

async function resolveVerifiedPlatformSubscriptionId(
  supabase: ReturnType<typeof createClient>,
  candidates: string[],
): Promise<string | null> {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (await subscriptionExistsForPlatformId(supabase, candidate)) {
      return candidate;
    }
  }
  return null;
}

async function resolveNowpaymentsSubscriptionId(
  payload: Record<string, unknown>,
  paymentId: string,
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  // Official NOWPayments payment IPN (Postman docs): payment_id, payment_status, invoice_id,
  // order_id (often null), purchase_id (~ payment_id). No subscription_id field.
  const payloadOrderId = normalizeId(payload.order_id);
  const payloadInvoiceId = normalizeId(payload.invoice_id);

  if (payloadInvoiceId) {
    const fromStoredInvoice = await findPlatformSubscriptionIdByStoredInvoiceId(
      supabase,
      payloadInvoiceId,
    );
    if (
      fromStoredInvoice &&
      (await subscriptionExistsForPlatformId(supabase, fromStoredInvoice))
    ) {
      return fromStoredInvoice;
    }

    const invoiceDetails = await fetchInvoiceDetails(payloadInvoiceId);

    if (invoiceDetails) {
      const invoiceOrderId = normalizeId(invoiceDetails.order_id);
      if (invoiceOrderId) {
        const fromInvoiceOrderPlatform = await resolveVerifiedPlatformSubscriptionId(supabase, [
          invoiceOrderId,
        ]);
        if (fromInvoiceOrderPlatform) return fromInvoiceOrderPlatform;

        const fromInvoiceOrderCheckout = await findPlatformSubscriptionIdByCheckoutOrderId(
          supabase,
          invoiceOrderId,
        );
        if (
          fromInvoiceOrderCheckout &&
          (await subscriptionExistsForPlatformId(supabase, fromInvoiceOrderCheckout))
        ) {
          return fromInvoiceOrderCheckout;
        }
      }
    }

    const paymentsForInvoice = await fetchPaymentsByInvoiceId(payloadInvoiceId);

    for (const row of paymentsForInvoice) {
      const rowOrderId = normalizeId(row.order_id);
      if (!rowOrderId) continue;

      const fromRowPlatform = await resolveVerifiedPlatformSubscriptionId(supabase, [rowOrderId]);
      if (fromRowPlatform) return fromRowPlatform;

      const fromRowCheckout = await findPlatformSubscriptionIdByCheckoutOrderId(supabase, rowOrderId);
      if (
        fromRowCheckout &&
        (await subscriptionExistsForPlatformId(supabase, fromRowCheckout))
      ) {
        return fromRowCheckout;
      }
    }
  }

  if (payloadOrderId) {
    const fromOrderPlatform = await resolveVerifiedPlatformSubscriptionId(supabase, [
      payloadOrderId,
    ]);
    if (fromOrderPlatform) return fromOrderPlatform;

    const fromCheckoutOrder = await findPlatformSubscriptionIdByCheckoutOrderId(
      supabase,
      payloadOrderId,
    );
    if (
      fromCheckoutOrder &&
      (await subscriptionExistsForPlatformId(supabase, fromCheckoutOrder))
    ) {
      return fromCheckoutOrder;
    }
  }

  const fromSubscriptionPayments = await findPlatformSubscriptionIdBySubscriptionPayments(
    supabase,
    paymentId,
  );
  if (fromSubscriptionPayments) return fromSubscriptionPayments;

  console.error('No verified platform_subscription_id for IPN payment', {
    paymentId,
    payloadOrderId,
    payloadInvoiceId,
  });
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const rawBody = await req.text();
    let payload: Record<string, unknown>;

    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      console.error('Invalid JSON body');
      return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
    }

    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET') ?? '';
    const signature = req.headers.get('x-nowpayments-sig');

    if (!ipnSecret) {
      console.error('NOWPAYMENTS_IPN_SECRET not configured');
      return jsonResponse({ success: false, error: 'IPN not configured' }, 500);
    }

    const signatureValid = await verifyIpnSignature(payload, signature, ipnSecret);
    if (!signatureValid) {
      console.error('Invalid IPN signature');
      return jsonResponse({ success: false, error: 'Invalid signature' }, 403);
    }

    const paymentStatus =
      typeof payload.payment_status === 'string'
        ? payload.payment_status.toLowerCase()
        : typeof payload.status === 'string'
          ? payload.status.toLowerCase()
          : null;

    if (paymentStatus !== 'finished') {
      return jsonResponse({ success: true, message: 'Evento ignorado' });
    }

    const paymentId = normalizeId(payload.payment_id);
    if (!paymentId) {
      console.error('IPN finished without payment_id');
      return jsonResponse({ success: true, message: 'Evento ignorado: payment_id ausente' });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const nowpaymentsSubscriptionId = await resolveNowpaymentsSubscriptionId(
      payload,
      paymentId,
      supabase,
    );

    if (!nowpaymentsSubscriptionId) {
      console.error('No se pudo resolver subscription_id', {
        paymentId,
        payloadKeys: Object.keys(payload),
      });
      return jsonResponse({ success: true, message: 'Evento ignorado: subscription_id no resuelto' });
    }

    const { data: platform, error: platformError } = await supabase
      .schema('gsa')
      .from('platforms')
      .select('id')
      .eq('name', 'NOWPayments')
      .eq('is_active', true)
      .maybeSingle();

    if (platformError || !platform) {
      console.error('Plataforma NOWPayments no encontrada:', platformError?.message);
      return jsonResponse({ success: true, message: 'Plataforma no configurada' });
    }

    let subscription: {
      id: number;
      current_period_end: string | null;
      status: string;
      platform_subscription_data: Record<string, unknown> | null;
    } | null = null;

    const { data: subByString, error: subError } = await supabase
      .schema('gsa')
      .from('subscriptions')
      .select('id, current_period_end, status, platform_subscription_data')
      .eq('platform_subscription_id', nowpaymentsSubscriptionId)
      .maybeSingle();

    if (subError) {
      console.error('Error buscando suscripción:', subError.message);
      return jsonResponse({ success: false, error: 'Database error' }, 500);
    }

    subscription = subByString;

    if (!subscription && /^\d+$/.test(nowpaymentsSubscriptionId)) {
      const { data: subByNumber, error: subNumError } = await supabase
        .schema('gsa')
        .from('subscriptions')
        .select('id, current_period_end, status, platform_subscription_data')
        .eq('platform_subscription_id', Number(nowpaymentsSubscriptionId))
        .maybeSingle();

      if (subNumError) {
        console.error('Error buscando suscripción (numeric):', subNumError.message);
        return jsonResponse({ success: false, error: 'Database error' }, 500);
      }

      subscription = subByNumber;
    }

    if (!subscription) {
      console.error('Suscripción no encontrada para:', nowpaymentsSubscriptionId);
      return jsonResponse({ success: true, message: 'Suscripción no encontrada' });
    }

    const subscriptionPlanId =
      normalizeId(payload.subscription_plan_id) ??
      extractNowpaymentsPlanIdFromPlatformData(subscription.platform_subscription_data);
    let newSubscriptionTypeId: number | null = null;
    let daysValid = 30;

    const pendingTypeIdRaw = subscription.platform_subscription_data
      ?.gsa_pending_subscription_dashboard_type_id;
    const pendingTypeId =
      typeof pendingTypeIdRaw === 'number'
        ? pendingTypeIdRaw
        : typeof pendingTypeIdRaw === 'string'
          ? Number(pendingTypeIdRaw)
          : null;

    if (subscriptionPlanId) {
      const { data: planType, error: planTypeError } = await supabase
        .schema('gsa')
        .from('subscription_dashboard_type')
        .select('id, days_valid')
        .eq('provider_cripto_id', subscriptionPlanId)
        .maybeSingle();

      if (planTypeError) {
        console.error('Error buscando plan:', planTypeError.message);
        return jsonResponse({ success: false, error: 'Database error' }, 500);
      }

      if (planType) {
        newSubscriptionTypeId = planType.id;
        if (typeof planType.days_valid === 'number' && planType.days_valid > 0) {
          daysValid = planType.days_valid;
        }
      }
    } else if (pendingTypeId != null && Number.isFinite(pendingTypeId) && pendingTypeId > 0) {
      const { data: pendingPlan, error: pendingPlanError } = await supabase
        .schema('gsa')
        .from('subscription_dashboard_type')
        .select('id, days_valid')
        .eq('id', pendingTypeId)
        .maybeSingle();

      if (pendingPlanError) {
        console.error('Error buscando plan pendiente:', pendingPlanError.message);
        return jsonResponse({ success: false, error: 'Database error' }, 500);
      }

      if (pendingPlan) {
        newSubscriptionTypeId = pendingPlan.id;
        if (typeof pendingPlan.days_valid === 'number' && pendingPlan.days_valid > 0) {
          daysValid = pendingPlan.days_valid;
        }
      }
    }

    const { data: existingPayment, error: existingPaymentError } = await supabase
      .schema('gsa')
      .from('subscription_payments')
      .select('id')
      .eq('platform_id', platform.id)
      .eq('platform_payment_id', paymentId)
      .maybeSingle();

    if (existingPaymentError) {
      console.error('Error comprobando pago existente:', existingPaymentError.message);
      return jsonResponse({ success: false, error: 'Database error' }, 500);
    }

    const nowIso = new Date().toISOString();

    if (!existingPayment) {
      const grossAmount =
        typeof payload.price_amount === 'number'
          ? payload.price_amount
          : Number(payload.price_amount) || 0;
      const netAmount =
        typeof payload.outcome_amount === 'number'
          ? payload.outcome_amount
          : Number(payload.outcome_amount) || 0;
      const currency =
        typeof payload.price_currency === 'string' && payload.price_currency.trim()
          ? payload.price_currency.trim().toUpperCase()
          : 'USD';

      const { error: insertError } = await supabase.schema('gsa').from('subscription_payments').insert({
        subscription_id: subscription.id,
        platform_id: platform.id,
        platform_payment_id: paymentId,
        status: paymentStatus,
        gross_amount: grossAmount,
        net_amount: netAmount,
        currency,
        created_at: nowIso,
        updated_at: nowIso,
        data: payload,
      });

      if (insertError) {
        console.error('Error insertando subscription_payment:', insertError.message);
        return jsonResponse({ success: false, error: 'Failed to record payment' }, 500);
      }
    }

    const now = new Date();
    let currentPeriodStart = now;
    let currentPeriodEnd = addDays(now, daysValid);

    if (
      subscription.status === 'active' &&
      typeof subscription.current_period_end === 'string'
    ) {
      const existingEnd = new Date(subscription.current_period_end);
      if (!Number.isNaN(existingEnd.getTime()) && existingEnd > now) {
        currentPeriodStart = existingEnd;
        currentPeriodEnd = addDays(existingEnd, daysValid);
      }
    }

    const payloadInvoiceId = normalizeId(payload.invoice_id);
    const existingPlatformData =
      subscription.platform_subscription_data &&
      typeof subscription.platform_subscription_data === 'object' &&
      !Array.isArray(subscription.platform_subscription_data)
        ? (subscription.platform_subscription_data as Record<string, unknown>)
        : {};

    const updateData: Record<string, unknown> = {
      status: 'active',
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      updated_at: nowIso,
      platform_subscription_data: {
        ...existingPlatformData,
        ...(payloadInvoiceId ? { gsa_platform_invoice_id: payloadInvoiceId } : {}),
      },
    };

    if (newSubscriptionTypeId != null) {
      updateData.subscription_dashboard_type = newSubscriptionTypeId;
    }

    const { error: updateError } = await supabase
      .schema('gsa')
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error actualizando suscripción:', updateError.message);
      return jsonResponse({ success: false, error: 'Failed to update subscription' }, 500);
    }

    console.log(`Pago confirmado. Suscripción ${subscription.id} actualizada.`);

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error en gsa_nowpayments_webhook:', error);
    return jsonResponse({ success: false, error: 'Internal error' }, 500);
  }
});
