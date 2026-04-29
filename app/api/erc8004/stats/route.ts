// app/api/erc8004/stats/route.ts
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
        statistics_date::text AS date,
        agent_count AS count
      FROM web_page.erc_8004_agent_statistics
      ORDER BY statistics_date ASC 
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching ERC-8004 stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar estadísticas de agentes' 
    }, { status: 500 });
  }
}