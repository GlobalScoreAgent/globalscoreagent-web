// app/api/humi/market-index/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mezqyworblseixaypftg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!, {
  auth: { persistSession: false }
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .schema('web_page')
      .from('index_humi_agent_distribution')
      .select(`
        register_date,
        best_agent_avg_score,
        agent_1_star_count,
        agent_1_star_avg_score,
        agent_2_star_count,
        agent_2_star_avg_score,
        agent_3_star_count,
        agent_3_star_avg_score,
        agent_4_star_count,
        agent_4_star_avg_score,
        agent_5_star_count,
        agent_5_star_avg_score
      `)
      .order('register_date', { ascending: true })
      .limit(30);

    if (error) throw error;

    // Renombramos las columnas aquí en JavaScript (más seguro)
    const formattedData = data?.map(row => ({
      date: row.register_date,
      average: row.best_agent_avg_score,
      "1-star-count": row.agent_1_star_count,
      "1-star-avg": row.agent_1_star_avg_score,
      "2-star-count": row.agent_2_star_count,
      "2-star-avg": row.agent_2_star_avg_score,
      "3-star-count": row.agent_3_star_count,
      "3-star-avg": row.agent_3_star_avg_score,
      "4-star-count": row.agent_4_star_count,
      "4-star-avg": row.agent_4_star_avg_score,
      "5-star-count": row.agent_5_star_count,
      "5-star-avg": row.agent_5_star_avg_score,
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedData
    });
  } catch (error: any) {
    console.error('Error fetching market index:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar datos del índice HUMI',
      details: error.message 
    }, { status: 500 });
  }
}