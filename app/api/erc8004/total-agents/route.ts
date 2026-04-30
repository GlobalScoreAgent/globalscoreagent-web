// app/api/erc8004/total-agents/route.ts
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
      .from('web_page.erc_8004_statistics')
      .select('agent_total_count')
      .single(); // Usamos single porque solo queremos el total

    if (error) throw error;

    const total = data ? 
      (data.agent_total_count || 0) : 0;

    return NextResponse.json({
      success: true,
      total
    });
  } catch (error: any) {
    console.error('Error fetching total agents:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar total de agentes',
      details: error.message 
    }, { status: 500 });
  }
}