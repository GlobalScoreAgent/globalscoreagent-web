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
      .from('web_page.index_humi_agent_distribution')
      .select(`
        register_date,
        best_agent_avg_score as average,
        agent_1_star_count as "1-star-count",
        agent_1_star_avg_score as "1-star-avg",
        agent_2_star_count as "2-star-count",
        agent_2_star_avg_score as "2-star-avg",
        agent_3_star_count as "3-star-count",
        agent_3_star_avg_score as "3-star-avg",
        agent_4_star_count as "4-star-count",
        agent_4_star_avg_score as "4-star-avg",
        agent_5_star_count as "5-star-count",
        agent_5_star_avg_score as "5-star-avg"
      `)
      .order('register_date', { ascending: true })
      .limit(30);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || []
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