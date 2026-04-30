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
      .from('erc_8004_statistics')
      .select(`
        chain_name,
        owner_total_count,
        agent_total_count,
        agent_active_count,
        agent_active_with_feedbacks
      `)
      .gt('agent_total_count', 0)
      .order('agent_total_count', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching chains stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al cargar distribución de cadenas',
      details: error.message 
    }, { status: 500 });
  }
}