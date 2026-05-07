import { NextRequest, NextResponse } from 'next/server';
import { createClient, executeWithExtendedTimeout } from '@/utils/supabase/server';

// Función eliminada - ya no se usan RPC functions

// Función para obtener tag_raw_values de filtros complejos
function getTagRawValuesForFilter(
  filterType: string,
  selectedCategory: string,
  selectedSubFilter: string,
  advancedFilters: Record<string, any>
): string[] | null {
  const filterMapping: Record<string, string> = {
    'searchOasfDomains': 'OASF Domains',
    'searchTags': 'Tags',
    'searchSkills': 'Skills',
    'searchCapabilities': 'Capabilities'
  };

  const dbFilterType = filterMapping[filterType] || filterType.replace('search', '');
  const values = advancedFilters[dbFilterType] || [];

  if (!Array.isArray(values) || !isComplexFilter(filterType, advancedFilters)) {
    return null;
  }

  const category = values.find((cat: any) => cat.category_key === selectedCategory);
  if (!category || !category.items) {
    return null;
  }

  const item = category.items.find((item: any) => item.value_key === selectedSubFilter);
  if (!item || !item.tag_raw_values) {
    return null;
  }

  return item.tag_raw_values;
}

// Función para determinar si es filtro complejo
function isComplexFilter(filterType: string, advancedFilters: Record<string, any>): boolean {
  const filterMapping: Record<string, string> = {
    'searchOasfDomains': 'OASF Domains',
    'searchTags': 'Tags',
    'searchSkills': 'Skills',
    'searchCapabilities': 'Capabilities'
  };

  const dbFilterType = filterMapping[filterType] || filterType.replace('search', '');
  const values = advancedFilters[dbFilterType] || [];

  return Array.isArray(values) && values.length > 0 && typeof values[0] === 'object';
}

// Función para determinar si es filtro simple
function isSimpleFilter(values: any): boolean {
  // Filtro simple: array de strings simples como ["True", "False"]
  return Array.isArray(values) &&
         values.length > 0 &&
         typeof values[0] === 'string' &&
         !values[0]?.hasOwnProperty?.('category_key');
}

// Función para construir los parámetros dinámicos para la función RPC
function getFilterParams(
  selectedSpecificFilter: string,
  selectedCategory: string,
  selectedSubFilter: string,
  advancedFilters: Record<string, any>,
  searchTerm: string,
  searchType: string,
  selectedOpenFilter: string,
  sortBy: string,
  sortDirection: 'asc' | 'desc',
  page: number,
  limit: number,
  chainId?: number,
  humiFilter?: string
) {
  const params: Record<string, any> = {
    p_limit: limit,
    p_cursor: null // Por ahora no implementamos cursor
  };

  // Determinar si es filtro simple o complejo
  const isComplex = isComplexFilter(selectedSpecificFilter, advancedFilters);

  if (isComplex) {
    // Filtro complejo: enviar tag_raw_values al parámetro correspondiente
    const tagRawValues = getTagRawValuesForFilter(
      selectedSpecificFilter,
      selectedCategory,
      selectedSubFilter,
      advancedFilters
    );

    if (tagRawValues) {
      // Mapear filter_key a parámetro de función
      const filterKey = advancedFilters._filterKeys?.[selectedSpecificFilter.replace('search', '')] || selectedSpecificFilter.replace('search', '').toLowerCase();
      const paramMapping: Record<string, string> = {
        'tags': 'p_tags_filter',
        'skills': 'p_skills_filter',
        'capabilities': 'p_capabilities_filter',
        'oasf-domains': 'p_oasf_domains_filter',
        'services': 'p_services_filter',
        'technical-tools': 'p_technical_tools_filter',
        'technical-prompts': 'p_technical_prompts_filter',
        'technical-capabilities': 'p_technical_capabilities_filter',
        'oasf-skills': 'p_oasf_skills_filter'
      };

      const paramName = paramMapping[filterKey];
      if (paramName) {
        params[paramName] = JSON.stringify(tagRawValues);
      }
    }
  } else {
    // Filtro simple: usar p_search_term y p_search_type
    if (selectedSubFilter && selectedSubFilter !== 'all') {
      params.p_search_term = selectedSubFilter;
      params.p_search_type = advancedFilters._filterKeys?.[selectedSpecificFilter.replace('search', '')] || selectedSpecificFilter.replace('search', '').toLowerCase();
    }
  }

  // Agregar parámetros comunes
  if (chainId !== undefined) {
    params.p_chain_id = chainId;
  }

  if (humiFilter && humiFilter !== 'all') {
    params.p_humi_filter = humiFilter;
  }

  if (searchTerm && searchTerm.trim()) {
    params.p_search_term = searchTerm;
    params.p_search_type = selectedOpenFilter;
  }

  return params;
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
  sortBy?: 'on_chain_created_at' | 'name' | 'nonce_current' | 'balance_current' | 'current_humi_score';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  totalAgents?: number;
}

export async function GET(request: NextRequest) {
  console.log('� NUEVA VERSIÓN DEL CÓDIGO - FILTROS DINÁMICOS ACTIVADOS');
  console.log('�🔍 API Route called with URL:', request.url);

  try {
    console.log('🔍 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created successfully');

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
      sortBy: searchParams.get('sortBy') as FilterParams['sortBy'] || 'current_humi_score',
      sortDirection: searchParams.get('sortDirection') as FilterParams['sortDirection'] || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      totalAgents: searchParams.get('totalAgents') ? parseInt(searchParams.get('totalAgents')!) : undefined,
    };

    // Validar parámetros - límite dinámico basado en selección del usuario
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 10); // Sin límite máximo fijo

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

    console.log('📋 Query Parameters:', {
      searchTerm: filters.searchTerm,
      searchType: filters.selectedOpenFilter,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      page,
      limit
    });

    // Usar directamente el método normal de consulta que es más rápido y confiable
    console.log('🔄 Using optimized normal query method');

    // Método normal para consultas sin filtro de tags o cuando RPC falla
    console.log('🔍 Using normal query method');
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
        current_humi_score
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

    // Aplicar filtros dinámicos desde la base de datos
    Object.keys(advancedFilters).forEach(filterName => {
      // Solo procesar filtros reales, excluir keys internas
      if (filterName !== '_filterKeys' && !filterName.startsWith('_')) {
        // Crear nombre del parámetro dinámicamente (ej: 'Tags' -> 'tagsFilter')
        const paramName = filterName.toLowerCase().replace(/\s+/g, '') + 'Filter';
        const selectedValue = (filters as Record<string, any>)[paramName];

        if (selectedValue && selectedValue !== 'all') {
          console.log(`🎯 Aplicando filtro ${filterName}: ${selectedValue} en columna ${advancedFilters._filterKeys?.[filterName]}`);
          const columnName = advancedFilters._filterKeys?.[filterName];
          if (columnName) {
            const values = advancedFilters[filterName];
            if (isSimpleFilter(values)) {
              // Filtro simple: buscar como texto usando filter_key
              console.log(`📝 Filtro simple: buscando "${selectedValue}" en ${columnName}::text`);
              query = query.ilike(`${columnName}::text`, `%${selectedValue}%`);
            } else {
              // Filtro avanzado: usar contains para arrays
              console.log(`📝 Filtro avanzado: buscando "${selectedValue}" en array ${columnName}`);
              query = query.contains(columnName, [selectedValue]).neq(columnName, []);
            }
          }
        }
      }
    });

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
          query = query.ilike('on_chain_id', `%${searchTerm}%`);
          break;
        case 'searchGeneral':
        default:
          // Búsqueda general: combinar resultados de múltiples consultas
          // Primero buscar en name y description
          const textQuery = supabase
            .schema('web_dashboard')
            .from('agents')
            .select('id')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

          // Luego buscar en searchable_metadata (JSONB)
          const metadataQuery = supabase
            .schema('web_dashboard')
            .from('agents')
            .select('id')
            .ilike('searchable_metadata::text', `%${searchTerm}%`);

          // Ejecutar ambas consultas para obtener IDs
          const [textResults, metadataResults] = await Promise.all([
            textQuery,
            metadataQuery
          ]);

          // Combinar IDs únicos
          const textIds = (textResults.data || []).map((r: any) => r.id);
          const metadataIds = (metadataResults.data || []).map((r: any) => r.id);
          const allIds = [...new Set([...textIds, ...metadataIds])];

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
    const mappedAgents = (data || []).map((agent: any) => {
      console.log('Debug agent:', { id: agent.id, chain_name: agent.chain_name, hasChainName: !!agent.chain_name });
      return {
        agent_id: agent.id,
        chain: agent.chain_name,
        on_chain_id: agent.on_chain_id,
        created_at: agent.on_chain_created_at,
        name: agent.name,
        description: agent.description,
        image_url: agent.image_url || '/agent_directory_default.jpg',
        owner_wallet: agent.owner_wallet,
        searchable_metadata: agent.searchable_metadata,
        supported_trust: agent.supported_trust,
        skills_filters: agent.skills_filters,
        capabilities_filters: agent.capabilities_filters,
        tags_filters: agent.tags_filters,
        oasf_domains_filters: agent.oasf_domains_filters,
        oasf_skills: null, // No cargado inicialmente
        technical_tools: null, // No cargado inicialmente
        technical_prompts: null, // No cargado inicialmente
        technical_capabilities: null, // No cargado inicialmente
        services: null, // No cargado inicialmente
        has_x402: null, // No cargado inicialmente
        transactional_wallets: agent.transactional_wallets,
        wallet_chain_register: agent.wallet_chain_register,
        skills: agent.skills,
        capabilities: agent.capabilites,
        current_humi_score: agent.current_humi_score,
        humi_score_filter: agent.humi_score_filter,
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
