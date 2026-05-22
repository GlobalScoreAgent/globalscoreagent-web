import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { apiJsonResponse } from '@/lib/api/route-config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiJsonResponse(
      { success: false, error: 'Supabase no configurado' },
      { status: 503 }
    );
  }

  try {
    const { email, source = 'waitlist-page' } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiJsonResponse({ success: false, error: 'Email inválido' }, { status: 400 });
    }

    const ipAddress =
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const emailClean = email.toLowerCase().trim();

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

    return apiJsonResponse({
      success: true,
      message: '¡Gracias! Te mantendremos informado.',
    });
  } catch (error: unknown) {
    console.error('Waitlist error:', error);
    const err = error as { code?: string; message?: string };

    if (err.code === '23505' || err.message?.includes('duplicate')) {
      return apiJsonResponse({
        success: true,
        message: 'Este email ya estaba registrado.',
      });
    }

    return apiJsonResponse(
      {
        success: false,
        error: 'Error al registrar. Inténtalo de nuevo.',
      },
      { status: 500 }
    );
  }
}
