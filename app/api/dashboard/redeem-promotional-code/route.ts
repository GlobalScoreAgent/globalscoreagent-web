import { apiJsonResponse } from '@/lib/api/route-config';
import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';
import { getProfileByUserId } from '@/lib/gsa/profile-preferences';
import {
  callPromotionalCodeRedeem,
  normalizePromotionalCode,
} from '@/lib/gsa/promotional-code-redeem';

export const dynamic = 'force-dynamic';

type RedeemPromotionalCodeBody = {
  code?: unknown;
};

export async function POST(request: Request) {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth.response;

  let body: RedeemPromotionalCodeBody = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw) as RedeemPromotionalCodeBody;
  } catch {
    return apiJsonResponse({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const code = normalizePromotionalCode(body.code);
  if (!code) {
    return apiJsonResponse({ success: false, error: 'Invalid promotional code' }, { status: 400 });
  }

  try {
    const profile = await getProfileByUserId(auth.supabase, auth.user.id);
    if (!profile) {
      return apiJsonResponse({ success: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const result = await callPromotionalCodeRedeem(auth.supabase, code, profile.id);

    if (!result.success) {
      return apiJsonResponse(
        {
          success: false,
          error_code: result.error_code,
          message_es: result.message_es,
          message_en: result.message_en,
        },
        { status: 400 },
      );
    }

    return apiJsonResponse({
      success: true,
      message_es: result.message_es,
      message_en: result.message_en,
    });
  } catch (err) {
    return apiJsonResponse(
      { success: false, error: err instanceof Error ? err.message : 'promotional_code_redeem_failed' },
      { status: 500 },
    );
  }
}
