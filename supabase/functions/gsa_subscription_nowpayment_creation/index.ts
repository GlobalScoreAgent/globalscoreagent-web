import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isGithubNoreplyEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized.includes('users.noreply.github.com') ||
    normalized.includes('noreply.github.com')
  );
}

function isUsableCustomerEmail(email: string | null | undefined): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed || !EMAIL_PATTERN.test(trimmed)) return false;
  if (isGithubNoreplyEmail(trimmed)) return false;
  return true;
}

function resolveCustomerEmail(
  authEmail: string | null | undefined,
  profileEmail: string | null | undefined,
): string | null {
  if (isUsableCustomerEmail(authEmail)) {
    return authEmail!.trim();
  }
  if (isUsableCustomerEmail(profileEmail)) {
    return profileEmail!.trim();
  }
  return null;
}

async function fetchNowPaymentsJwt(apiKey: string, email: string, password: string): Promise<string> {
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
    console.error('NOWPayments auth failed:', {
      status: authResponse.status,
      code: authData?.code,
      message: authData?.message,
    });
    throw new Error(
      typeof authData?.message === 'string'
        ? authData.message
        : 'NOWPayments authentication failed',
    );
  }

  return authData.token;
}

function getResultRecord(data: Record<string, unknown>): Record<string, unknown> | null {
  const result = data.result;

  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (first && typeof first === 'object') {
      return first as Record<string, unknown>;
    }
  }

  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }

  return null;
}

function extractPaymentUrl(data: Record<string, unknown>): string | null {
  const resultRecord = getResultRecord(data);
  const candidates = [
    data.payment_url,
    data.invoice_url,
    resultRecord?.payment_url,
    resultRecord?.invoice_url,
    resultRecord?.pay_url,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function extractSubscriptionId(data: Record<string, unknown>): string | number | null {
  const resultRecord = getResultRecord(data);
  const candidates = [data.id, resultRecord?.id];

  for (const value of candidates) {
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
  }

  return null;
}

function extractSubscriptionStatus(data: Record<string, unknown>): string | null {
  const resultRecord = getResultRecord(data);
  const status = resultRecord?.status ?? data.status;
  return typeof status === 'string' ? status : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subscription_id, subscription_dashboard_type_id } = await req.json();

    if (!subscription_id || !subscription_dashboard_type_id) {
      return jsonResponse({ success: false, error: 'Faltan parámetros requeridos' }, 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Usuario no autenticado' }, 401);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return jsonResponse({ success: false, error: 'Usuario no autenticado' }, 401);
    }

    const { data: subscription, error: subError } = await supabaseClient
      .schema('gsa')
      .from('subscriptions')
      .select('id, profile_id, platform_subscription_id')
      .eq('id', subscription_id)
      .single();

    if (subError || !subscription) {
      return jsonResponse({ success: false, error: 'Suscripción no encontrada' }, 404);
    }

    const { data: profile, error: profileError } = await supabaseClient
      .schema('gsa')
      .from('profiles')
      .select('id, email_address')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.id !== subscription.profile_id) {
      return jsonResponse(
        { success: false, error: 'No tienes permiso sobre esta suscripción' },
        403,
      );
    }

    const customerEmail = resolveCustomerEmail(user.email, profile.email_address);
    if (!customerEmail) {
      return jsonResponse(
        {
          success: false,
          error_code: 'missing_customer_email',
          error: 'No hay un email de contacto válido para NOWPayments',
          message_es:
            'Añade un correo de contacto válido en Perfil (o inicia sesión con un proveedor que comparta tu email) antes de contratar.',
          message_en:
            'Add a valid contact email in Profile (or sign in with a provider that shares your email) before subscribing.',
        },
        400,
      );
    }

    if (subscription.platform_subscription_id) {
      return jsonResponse(
        {
          success: false,
          error: 'Esta suscripción ya tiene una suscripción activa en NOWPayments',
        },
        400,
      );
    }

    const { data: plan, error: planError } = await supabaseClient
      .schema('gsa')
      .from('subscription_dashboard_type')
      .select('provider_cripto_id, name')
      .eq('id', subscription_dashboard_type_id)
      .single();

    if (planError || !plan?.provider_cripto_id) {
      return jsonResponse(
        { success: false, error: 'Plan no encontrado o sin ID de NOWPayments' },
        404,
      );
    }

    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    const nowpaymentsEmail = Deno.env.get('NOWPAYMENTS_EMAIL');
    const nowpaymentsPassword = Deno.env.get('NOWPAYMENTS_PASSWORD');

    if (!nowpaymentsApiKey || !nowpaymentsEmail || !nowpaymentsPassword) {
      return jsonResponse(
        {
          success: false,
          error:
            'NOWPayments no configurado (NOWPAYMENTS_API_KEY, NOWPAYMENTS_EMAIL, NOWPAYMENTS_PASSWORD)',
        },
        500,
      );
    }

    const jwtToken = await fetchNowPaymentsJwt(
      nowpaymentsApiKey,
      nowpaymentsEmail,
      nowpaymentsPassword,
    );

    const checkoutOrderId = `gsa-sub-${subscription_id}`;

    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': nowpaymentsApiKey,
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        subscription_plan_id: plan.provider_cripto_id,
        email: customerEmail,
        order_id: checkoutOrderId,
      }),
    });

    const nowpaymentsData = (await nowpaymentsResponse.json()) as Record<string, unknown>;

    const paymentUrl = extractPaymentUrl(nowpaymentsData);
    const nowpaymentsSubscriptionId = extractSubscriptionId(nowpaymentsData);
    const subscriptionStatus = extractSubscriptionStatus(nowpaymentsData);

    if (nowpaymentsSubscriptionId == null) {
      console.error('Error en NOWPayments:', nowpaymentsData);
      return jsonResponse(
        {
          success: false,
          error:
            typeof nowpaymentsData.message === 'string'
              ? nowpaymentsData.message
              : 'Error al crear la suscripción en NOWPayments',
          details: nowpaymentsData,
        },
        nowpaymentsResponse.ok ? 400 : nowpaymentsResponse.status,
      );
    }

    const { error: updateError } = await supabaseClient
      .schema('gsa')
      .from('subscriptions')
      .update({
        platform_subscription_id: nowpaymentsSubscriptionId,
        platform_subscription_data: {
          ...nowpaymentsData,
          gsa_pending_subscription_dashboard_type_id: subscription_dashboard_type_id,
          gsa_checkout_order_id: checkoutOrderId,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription_id);

    if (updateError) {
      console.error('Error actualizando suscripción:', updateError);
      return jsonResponse({ success: false, error: 'Error al guardar la suscripción' }, 500);
    }

    return jsonResponse({
      success: true,
      payment_url: paymentUrl ?? undefined,
      nowpayments_subscription_id: nowpaymentsSubscriptionId,
      subscription_status: subscriptionStatus ?? undefined,
      customer_email: customerEmail,
      email_sent: paymentUrl == null,
      message_es:
        paymentUrl == null
          ? `Suscripción creada (${subscriptionStatus ?? 'WAITING_PAY'}). Revisa ${customerEmail} para el enlace de pago de NOWPayments.`
          : undefined,
      message_en:
        paymentUrl == null
          ? `Subscription created (${subscriptionStatus ?? 'WAITING_PAY'}). Check ${customerEmail} for the NOWPayments payment link.`
          : undefined,
    });
  } catch (error) {
    console.error('Error en Edge Function:', error);
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ success: false, error: message }, 500);
  }
});
