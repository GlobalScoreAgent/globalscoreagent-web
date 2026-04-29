// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'waitlist-page' } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const query = `
      INSERT INTO web_page.waitlist (register_at, email, source, ip_address)
      VALUES (now(), $1, $2, $3)
      ON CONFLICT (email) 
      DO NOTHING
      RETURNING id;
    `;

    const result = await pool.query(query, [email.toLowerCase().trim(), source, ipAddress]);

    if (result.rowCount === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Este email ya estaba registrado.' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: '¡Gracias! Te mantendremos informado.' 
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al registrar. Inténtalo de nuevo.' 
    }, { status: 500 });
  }
}