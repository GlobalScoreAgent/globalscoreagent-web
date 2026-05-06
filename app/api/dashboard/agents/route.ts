import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Interface para los parámetros de filtro
interface FilterParams {
  searchTerm?: string;
  searchType?: 'general' | 'name' | 'description' | 'owner_wallet' | 'wallet' | 'metadata';
  chainId?: number | null;
  sortBy?: 'on_chain_created_at' | 'name' | 'nonce_current' | 'balance_current' | 'current_humi_score';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  totalAgents?: number;
}

export async function GET(request: NextRequest) {
  console.log('🔍 API Route called with URL:', request.url);

  try {
    console.log('🔍 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created successfully');

    // Parsear parámetros de la URL
    const { searchParams } = new URL(request.url);
    const filters: FilterParams = {
      searchTerm: searchParams.get('searchTerm') || '',
      searchType: searchParams.get('searchType') as FilterParams['searchType'] || 'general',
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : null,
      sortBy: searchParams.get('sortBy') as FilterParams['sortBy'] || 'current_humi_score',
      sortDirection: searchParams.get('sortDirection') as FilterParams['sortDirection'] || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      totalAgents: searchParams.get('totalAgents') ? parseInt(searchParams.get('totalAgents')!) : undefined,
    };

    // Validar parámetros
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 10));

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Construir la consulta base - versión simplificada para testing
    let query = supabase
      .schema('web_dashboard')
      .from('agents')
      .select(`
        id,
        chain_name,
        name,
        description,
        image_url,
        current_humi_score,
        on_chain_created_at
      `);

    // Aplicar filtros de calidad (igual que en la implementación actual)
    query = query.gt('current_humi_score', 0);
    query = query.neq('name', 'Unnamed Agent');

    // Aplicar filtro de cadena si se especifica
    if (filters.chainId !== null) {
      query = query.eq('chain_id', filters.chainId);
    }

    // Aplicar filtros de búsqueda
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();

      switch (filters.searchType) {
        case 'name':
          query = query.ilike('name', `%${searchTerm}%`);
          break;
        case 'description':
          query = query.ilike('description', `%${searchTerm}%`);
          break;
        case 'owner_wallet':
          query = query.ilike('owner_wallet', `%${searchTerm}%`);
          break;
        case 'wallet':
          query = query.ilike('transactional_wallets', `%${searchTerm}%`);
          break;
        case 'metadata':
          query = query.ilike('searchable_metadata', `%${searchTerm}%`);
          break;
        case 'general':
        default:
          // Búsqueda general en múltiples campos
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,owner_wallet.ilike.%${searchTerm}%,transactional_wallets.ilike.%${searchTerm}%,searchable_metadata.ilike.%${searchTerm}%`);
          break;
      }
    }

    // Aplicar ordenamiento
    const sortDirection = filters.sortDirection === 'asc';
    switch (filters.sortBy) {
      case 'name':
        query = query.order('name', { ascending: sortDirection });
        break;
      case 'nonce_current':
        query = query.order('nonce_current', { ascending: sortDirection });
        break;
      case 'balance_current':
        query = query.order('balance_current', { ascending: sortDirection });
        break;
      case 'current_humi_score':
        query = query.order('current_humi_score', { ascending: sortDirection });
        break;
      case 'on_chain_created_at':
      default:
        query = query.order('on_chain_created_at', { ascending: sortDirection });
        break;
    }

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    // Ejecutar la consulta
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: error.message },
        { status: 500 }
      );
    }

    // Mapear agentes usando chain_name directamente de la tabla agents
    const mappedAgents = (data || []).map((agent: any) => {
      console.log('Debug agent:', { id: agent.id, chain_name: agent.chain_name, hasChainName: !!agent.chain_name });
      return {
        agent_id: agent.id,
        chain: agent.chain_name,
        on_chain_id: null, // No cargado inicialmente
        created_at: agent.on_chain_created_at,
        name: agent.name,
        description: agent.description,
        image_url: agent.image_url || '/agent_directory_default.jpg',
        owner_wallet: agent.owner_wallet,
        searchable_metadata: agent.searchable_metadata,
        supported_trust: agent.supported_trust,
        skills_filters: null, // No cargado inicialmente
        capabilities_filters: null, // No cargado inicialmente
        tags_filters: null, // No cargado inicialmente
        oasf_domains_filters: null, // No cargado inicialmente
        oasf_skills: null, // No cargado inicialmente
        technical_tools: null, // No cargado inicialmente
        technical_prompts: null, // No cargado inicialmente
        technical_capabilities: null, // No cargado inicialmente
        services: null, // No cargado inicialmente
        has_x402: null, // No cargado inicialmente
        transactional_wallets: agent.transactional_wallets,
        humi_score: agent.current_humi_score,
        nonce_current: agent.nonce_current,
        balance_current: agent.balance_current
      };
    });

    // Usar totalAgents del cliente si está disponible, sino usar count de la consulta
    const totalCount = filters.totalAgents || count || 0;

    return NextResponse.json({
      data: mappedAgents,
      count: count || 0,
      totalCount: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
