import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiJsonResponse } from '@/lib/api/route-config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiJsonResponse(
      { success: false, error: 'server_error' },
      { status: 503 }
    );
  }

  try {
    const { email, source = 'waitlist-page' } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiJsonResponse({ success: false, error: 'invalid_email' }, { status: 400 });
    }

    const ipAddress =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const emailClean = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .schema('web_page')
      .from('waitlist')
      .select('email')
      .eq('email', emailClean)
      .maybeSingle();

    if (existing) {
      return apiJsonResponse({ success: true, alreadyRegistered: true });
    }

    const { error } = await supabase
      .schema('web_page')
      .from('waitlist')
      .upsert(
        {
          email: emailClean,
          source,
          ip_address: ipAddress,
          register_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
          ignoreDuplicates: true,
        }
      );

    if (error) throw error;

    return apiJsonResponse({ success: true });
  } catch (error: unknown) {
    console.error('Waitlist error:', error);
    const err = error as { code?: string; message?: string };

    if (err.code === '23505' || err.message?.includes('duplicate')) {
      return apiJsonResponse({
        success: true,
        alreadyRegistered: true,
      });
    }

    return apiJsonResponse(
      {
        success: false,
        error: 'server_error',
      },
      { status: 500 }
    );
  }
}
