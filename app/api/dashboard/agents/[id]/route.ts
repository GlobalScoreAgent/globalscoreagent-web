import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const agentId = params.id;

    if (!agentId) {
      return NextResponse.json(
        { error: 'ID de agente requerido' },
        { status: 400 }
      );
    }

    // Load additional fields for the specific agent
    const { data, error } = await supabase
      .schema('web_dashboard')
      .from('agents')
      .select(`
        owner_wallet,
        transactional_wallets,
        tags_filters,
        skills_filters,
        capabilities_filters,
        oasf_domains_filters,
        oasf_skills,
        technical_tools,
        technical_prompts,
        technical_capabilities,
        services,
        has_x402,
        supported_trust,
        searchable_metadata,
        nonce_current,
        balance_current
      `)
      .eq('id', agentId)
      .single();

    if (error) {
      console.error('Database error loading additional fields:', error);
      return NextResponse.json(
        { error: 'Error al cargar datos adicionales del agente', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Agente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}