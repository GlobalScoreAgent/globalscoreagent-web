import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mezqyworblseixaypftg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey!, {
  auth: { persistSession: false }
});

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('index_humi.index_humi_summary')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "✅ Conexión con Supabase exitosa",
      total_records: count || 0
    });
  } catch (error: any) {
    console.error("Error Supabase:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.hint || "Revisa que la tabla exista"
    }, { status: 500 });
  }
}