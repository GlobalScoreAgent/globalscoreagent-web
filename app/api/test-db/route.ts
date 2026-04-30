import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Forzar IPv4 (esto resuelve muchos ENOTFOUND en Vercel)
  options: '-c sslmode=require',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    client.release();

    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa a Supabase",
      time: result.rows[0].time,
      postgres_version: result.rows[0].version,
    });
  } catch (error: any) {
    console.error("Error detallado:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      hint: "Revisa la conexión o si el proyecto Supabase está activo"
    }, { status: 500 });
  }
}