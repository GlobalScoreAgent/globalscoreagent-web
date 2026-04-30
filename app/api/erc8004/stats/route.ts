// app/api/erc8004/stats/route.ts
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
      .from('web_page.erc_8004_agent_statistics')
      .select(`
        statistics_date as date,
        agent_count as count
      `)
      .order('statistics_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('Error fetching ERC-8004 stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar estadísticas de agentes',
      details: error.message 
    }, { status: 500 });
  }
}