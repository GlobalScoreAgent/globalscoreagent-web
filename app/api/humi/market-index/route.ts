// app/api/humi/market-index/route.ts
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
        register_date::text AS date,
        best_agent_avg_score AS average,
        agent_1_star_count AS "1-star-count",
        agent_1_star_avg_score AS "1-star-avg",
        agent_2_star_count AS "2-star-count",
        agent_2_star_avg_score AS "2-star-avg",
        agent_3_star_count AS "3-star-count",
        agent_3_star_avg_score AS "3-star-avg",
        agent_4_star_count AS "4-star-count",
        agent_4_star_avg_score AS "4-star-avg",
        agent_5_star_count AS "5-star-count",
        agent_5_star_avg_score AS "5-star-avg"
      FROM web_page.index_humi_agent_distribution
      ORDER BY register_date ASC
      LIMIT 30
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching market index:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar datos del índice HUMI' 
    }, { status: 500 });
  }
}