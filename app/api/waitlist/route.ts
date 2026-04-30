// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mezqyworblseixaypftg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!, {
  auth: { persistSession: false }
});

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'waitlist-page' } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') 
                   || req.headers.get('x-real-ip') 
                   || 'unknown';

    const emailClean = email.toLowerCase().trim();

    // Insert con upsert (ON CONFLICT DO NOTHING)
    const { error } = await supabase
      .from('web_page.waitlist')
      .upsert({
        email: emailClean,
        source,
        ip_address: ipAddress,
        register_at: new Date().toISOString()
      }, { 
        onConflict: 'email',
        ignoreDuplicates: true 
      });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: '¡Gracias! Te mantendremos informado.' 
    });

  } catch (error: any) {
    console.error('Waitlist error:', error);

    // Si es error de duplicado, respondemos amigablemente
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Este email ya estaba registrado.' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Error al registrar. Inténtalo de nuevo.' 
    }, { status: 500 });
  }
}