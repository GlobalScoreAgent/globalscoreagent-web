// app/api/erc8004/total-agents/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(agent_total_count), 0) as total_agents
      FROM web_page.erc_8004_statistics
    `);

    const total = parseInt(result.rows[0].total_agents) || 0;

    return NextResponse.json({
      success: true,
      total
    });
  } catch (error) {
    console.error('Error fetching total agents:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar total de agentes' 
    }, { status: 500 });
  }
}