import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isSimpleFilterValues } from '@/lib/dashboardFilters';

// Función para determinar si es filtro simple
function isSimpleFilter(values: any): boolean {
  return isSimpleFilterValues(values);
}


// Interface para los parámetros de filtro
interface FilterParams {
  searchTerm?: string;
  searchType?: 'general' | 'name' | 'description' | 'owner_wallet' | 'wallet' | 'metadata';
  selectedOpenFilter?: string;
  chainId?: number | null;
  humiFilter?: string;
  tagsFilter?: string;
  skillsFilter?: string;
  capabilitiesFilter?: string;
  oasfDomainsFilter?: string;
  advancedFilterName?: string;
  advancedFilterKey?: string;
  advancedFilterValue?: string;
  advancedFilterTagRawValues?: string[];
  sortBy?: 'on_chain_created_at' | 'name' | 'nonce_current' | 'balance_current' | 'current_humi_score';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  totalAgents?: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parsear parámetros de la URL
    const { searchParams } = new URL(request.url);
    const filters: FilterParams = {
      searchTerm: searchParams.get('searchTerm') || '',
      searchType: searchParams.get('searchType') as FilterParams['searchType'] || 'general',
      selectedOpenFilter: searchParams.get('selectedOpenFilter') || 'searchGeneral',
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : null,
      humiFilter: searchParams.get('humiFilter') || undefined,
      tagsFilter: searchParams.get('tagsFilter') || undefined,
      skillsFilter: searchParams.get('skillsFilter') || undefined,
      capabilitiesFilter: searchParams.get('capabilitiesFilter') || undefined,
      oasfDomainsFilter: searchParams.get('oasfDomainsFilter') || undefined,
      advancedFilterName: searchParams.get('advancedFilterName') || undefined,
      advancedFilterKey: searchParams.get('advancedFilterKey') || undefined,
      advancedFilterValue: searchParams.get('advancedFilterValue') || undefined,
      advancedFilterTagRawValues: searchParams.get('advancedFilterTagRawValues')
        ? JSON.parse(searchParams.get('advancedFilterTagRawValues') || '[]')
        : undefined,
      sortBy: searchParams.get('sortBy') as FilterParams['sortBy'] || 'current_humi_score',
      sortDirection: searchParams.get('sortDirection') as FilterParams['sortDirection'] || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      totalAgents: searchParams.get('totalAgents') ? parseInt(searchParams.get('totalAgents')!) : undefined,
    };

    // Validar parámetros - límite dinámico basado en selección del usuario
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 10));

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Ya no se usan RPC functions - método directo

    // Cargar filtros avanzados para determinar parámetros dinámicos
    const { data: advancedFiltersData, error: advancedFiltersError } = await supabase
      .schema('web_dashboard')
      .from('agent_advanced_filters')
      .select('filter, values, filter_key');

    let advancedFilters: Record<string, any> = {};
    if (!advancedFiltersError && advancedFiltersData) {
      advancedFiltersData.forEach((item: any) => {
        advancedFilters[item.filter] = Array.isArray(item.values) ? item.values : [];
        advancedFilters._filterKeys = advancedFilters._filterKeys || {};
        advancedFilters._filterKeys[item.filter] = item.filter_key;
      });
    }

    let query = supabase
      .schema('web_dashboard')
      .from('agents')
      .select(`
        id,
        chain_name,
        name,
        description,
        image_url,
        humi_score_filter,
        on_chain_created_at,
        on_chain_id,
        wallet_chain_register,
        owner_wallet,
        nonce_current,
        skills,
        capabilites,
        skills_filters,
        capabilities_filters,
        tags_filters,
        oasf_domains_filters,
        current_humi_score,
        balance_current
      `);

    // No aplicar filtros de calidad - mostrar todos los agentes

    // Aplicar filtro de cadena si se especifica
    if (filters.chainId !== null) {
      query = query.eq('chain_id', filters.chainId);
    }

    // Aplicar filtro de Index HUMI si se especifica
    if (filters.humiFilter && filters.humiFilter !== 'all') {
      query = query.eq('humi_score_filter', filters.humiFilter);
    }

    // Aplicar filtros dinámicos desde la base de datos usando contrato explícito
    if (filters.advancedFilterName && filters.advancedFilterKey) {
      const filterValues = advancedFilters[filters.advancedFilterName];
      const columnName = filters.advancedFilterKey;

      if (Array.isArray(filters.advancedFilterTagRawValues) && filters.advancedFilterTagRawValues.length > 0) {
        query = (query as any).overlaps(columnName, filters.advancedFilterTagRawValues);
      } else if (filters.advancedFilterValue && filters.advancedFilterValue !== 'all' && isSimpleFilter(filterValues)) {
        query = query.ilike(`${columnName}::text`, `%${filters.advancedFilterValue}%`);
      }
    }

    // Aplicar filtros de búsqueda usando los keys del openSearchOptions
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();

      switch (filters.selectedOpenFilter) {
        case 'searchName':
          query = query.ilike('name', `%${searchTerm}%`);
          break;
        case 'searchWallet':
          query = query.ilike('wallet_chain_register', `%${searchTerm}%`);
          break;
        case 'searchWalletOwner':
          query = query.ilike('owner_wallet', `%${searchTerm}%`);
          break;
        case 'searchAgentIdentifier':
          if (/^\d+$/.test(searchTerm)) {
            query = query.eq('on_chain_id', Number(searchTerm));
          } else {
            query = query.ilike('on_chain_id::text', `%${searchTerm}%`);
          }
          break;
        case 'searchGeneral':
        default:
          // Búsqueda general: combinar resultados de múltiples consultas
          // Primero buscar en name y description
          const textQuery = supabase
            .schema('web_dashboard')
            .from('agents')
            .select('id')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .limit(1000);

          // Luego buscar en searchable_metadata (JSONB)
          const metadataQuery = supabase
            .schema('web_dashboard')
            .from('agents')
            .select('id')
            .ilike('searchable_metadata::text', `%${searchTerm}%`)
            .limit(1000);

          // Ejecutar ambas consultas para obtener IDs
          const [textResults, metadataResults] = await Promise.all([
            textQuery,
            metadataQuery
          ]);

          // Combinar IDs únicos
          const textIds = (textResults.data || []).map((r: any) => r.id);
          const metadataIds = (metadataResults.data || []).map((r: any) => r.id);
          const allIds = Array.from(new Set([...textIds, ...metadataIds]));

          if (allIds.length > 0) {
            query = query.in('id', allIds);
          } else {
            // Si no hay resultados, usar una condición que nunca se cumpla
            query = query.eq('id', -1);
          }
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
    const mappedAgents = (data || []).map((agent: any) => ({
      agent_id: agent.id,
      chain: agent.chain_name,
      on_chain_id: agent.on_chain_id,
      created_at: agent.on_chain_created_at,
      name: agent.name,
      description: agent.description,
      image_url: agent.image_url || '/agent_directory_default.jpg',
      owner_wallet: agent.owner_wallet,
      wallet_chain_register: agent.wallet_chain_register,
      skills: agent.skills,
      capabilities: agent.capabilites,
      skills_filters: agent.skills_filters,
      capabilities_filters: agent.capabilities_filters,
      tags_filters: agent.tags_filters,
      oasf_domains_filters: agent.oasf_domains_filters,
      current_humi_score: agent.current_humi_score,
      humi_score_filter: agent.humi_score_filter,
      nonce_current: agent.nonce_current,
      balance_current: agent.balance_current
    }));

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
