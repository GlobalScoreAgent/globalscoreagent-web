// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_registros,
        MAX(created_at)::text as ultima_fecha,
        MIN(humi_avg_score) as min_score,
        MAX(humi_avg_score) as max_score
      FROM index_humi.index_humi_summary
    `);

    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa a Supabase",
      total_registros: Number(row.total_registros),
      ultima_fecha: row.ultima_fecha,
      min_score: Number(row.min_score).toFixed(2),
      max_score: Number(row.max_score).toFixed(2),
    });

  } catch (error: any) {
    console.error('Error detallado en test-db:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      hint: "Revisa que la tabla exista y que DATABASE_URL sea correcta"
    }, { status: 500 });
  }
}