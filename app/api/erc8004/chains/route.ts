// app/api/erc8004/chains/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        chain_name,
        owner_total_count,
        agent_total_count,
        agent_active_count,
        agent_active_with_feedbacks
      FROM web_page.erc_8004_statistics
      WHERE agent_total_count > 0
      ORDER BY agent_total_count DESC;
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching chains stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar distribución de cadenas' 
    }, { status: 500 });
  }
}