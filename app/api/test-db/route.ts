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
      .from('index_humi.index_humi_summary')
      .select('count(*)')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "✅ Conexión con Supabase JS Client OK",
      row_count: data?.[0]?.count || "unknown"
    });
  } catch (error: any) {
    console.error("Error Supabase:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  }
}