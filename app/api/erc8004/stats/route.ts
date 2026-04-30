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
      .schema('web_page')
      .from('erc_8004_agent_statistics')
      .select('statistics_date, agent_count')   // ← Sin alias aquí
      .order('statistics_date', { ascending: true });

    if (error) throw error;

    // Renombramos los campos aquí en JavaScript (más seguro)
    const formattedData = data?.map(row => ({
      date: row.statistics_date,
      count: row.agent_count
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedData
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