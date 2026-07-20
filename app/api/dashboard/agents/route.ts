import { NextRequest, NextResponse } from 'next/server';
import { requireActiveDashboardUser } from '@/lib/auth/require-active-subscription';
import { isSimpleFilterValues, mergeAiCategoriesFilter } from '@/lib/dashboardFilters';
import {
  applyNotCalculatedMaturityFilter,
  isNotCalculateFilterValue,
  normalizeAgentHumiMaturity,
  normalizeAgentHumiScore,
} from '@/lib/agentHumiDisplay';
import { parseAgentWarnings } from '@/lib/agentWarnings';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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
  tagsFilter?: string;
  skillsFilter?: string;
  capabilitiesFilter?: string;
  oasfDomainsFilter?: string;
  advancedFilterName?: string;
  advancedFilterKey?: string;
  advancedFilterValue?: string;
  advancedFilterTagRawValues?: string[];
  sortBy?: 'on_chain_created_at' | 'created_at' | 'name' | 'nonce_current' | 'balance_current' | 'current_humi_score';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  totalAgents?: number;
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, '\\$&');
}

function isBooleanLikeFilter(values: any): boolean {
  if (!Array.isArray(values) || values.length === 0) return false;
  return values.every((item) => {
    if (typeof item !== 'string') return false;
    const normalized = item.trim().toLowerCase();
    return normalized === 'true' || normalized === 'false';
  });
}

function parseBooleanValue(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

function jsonbContainsStringArrayPayload(rawValue: string): string {
  // payload para JSONB array de strings (cs = @>)
  // Ejemplo: columnName cs '["api"]'
  return JSON.stringify([rawValue]);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireActiveDashboardUser();
    if (!auth.ok) return auth.response;
    const supabase = auth.supabase;

    // Parsear parámetros de la URL
    const { searchParams } = new URL(request.url);
    const filters: FilterParams = {
      searchTerm: searchParams.get('searchTerm') || '',
      searchType: searchParams.get('searchType') as FilterParams['searchType'] || 'general',
      selectedOpenFilter: searchParams.get('selectedOpenFilter') || 'searchGeneral',
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : null,
      tagsFilter: searchParams.get('tagsFilter') || undefined,
      skillsFilter: searchParams.get('skillsFilter') || undefined,
      capabilitiesFilter: searchParams.get('capabilitiesFilter') || undefined,
      oasfDomainsFilter: searchParams.get('oasfDomainsFilter') || undefined,
      advancedFilterName: searchParams.get('advancedFilterName') || undefined,
      advancedFilterKey: searchParams.get('advancedFilterKey') || undefined,
      advancedFilterValue: searchParams.get('advancedFilterValue') || undefined,
      advancedFilterTagRawValues: (() => {
        const raw = searchParams.get('advancedFilterTagRawValues');
        if (!raw) return undefined;
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : undefined;
        } catch {
          return undefined;
        }
      })(),
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
    const [{ data: advancedFiltersData, error: advancedFiltersError }, { data: aiCategoriesData }] =
      await Promise.all([
        supabase
          .schema('web_dashboard')
          .from('agent_advanced_filters')
          .select('filter, values, filter_key'),
        supabase
          .schema('web_dashboard')
          .from('agent_ai_categories')
          .select('category_name')
          .eq('is_active', true)
          .order('category_name', { ascending: true }),
      ]);

    let advancedFilters: Record<string, any> = {};
    if (!advancedFiltersError && advancedFiltersData) {
      const filters: Record<string, any> = {};
      const filterKeys: Record<string, string> = {};
      advancedFiltersData.forEach((item: any) => {
        filters[item.filter] = Array.isArray(item.values) ? item.values : [];
        filterKeys[item.filter] = item.filter_key;
      });

      const categoryNames = (aiCategoriesData || [])
        .map((row: { category_name?: string | null }) => row.category_name)
        .filter((name: unknown): name is string => typeof name === 'string' && name.trim().length > 0);

      const merged = mergeAiCategoriesFilter(filters, filterKeys, categoryNames);
      advancedFilters = { ...merged.filters, _filterKeys: merged.filterKeys };
    }

    const hasTagRawValuesEarly =
      Array.isArray(filters.advancedFilterTagRawValues) &&
      filters.advancedFilterTagRawValues.length > 0;
    const hasSimpleValueEarly =
      !!filters.advancedFilterValue && filters.advancedFilterValue !== 'all';
    const hasSearchTerm = !!(filters.searchTerm && filters.searchTerm.trim());
    const hasChainIdFilter = filters.chainId !== null && filters.chainId !== undefined;
    const hasAdvancedSelection =
      !!(filters.advancedFilterName && filters.advancedFilterKey) &&
      (hasTagRawValuesEarly || hasSimpleValueEarly);
    // Unfiltered 330k-row exact counts + sort often hit statement_timeout under load.
    const countMode: 'exact' | 'estimated' =
      hasSearchTerm || hasChainIdFilter || hasAdvancedSelection ? 'exact' : 'estimated';

    let query = supabase
      .schema('web_dashboard')
      .from('agents')
      .select(
        `
        id,
        agent_id,
        chain_name,
        name,
        description,
        image_url,
        humi_madurity_level,
        on_chain_created_at,
        on_chain_id,
        wallet_chain_register,
        owner_wallet,
        skills,
        capabilites,
        skills_filters,
        capabilities_filters,
        tags_filters,
        oasf_domains_filters,
        agent_warnings,
        current_humi_score,
        ai_category_primary,
        ai_category_purpose,
        realness_status
      `,
        { count: countMode },
      );

    // No aplicar filtros de calidad - mostrar todos los agentes

    // Aplicar filtro de cadena si se especifica
    if (filters.chainId !== null) {
      query = query.eq('chain_id', filters.chainId);
    }

    // Aplicar filtros dinámicos desde la base de datos usando contrato explícito
    if (filters.advancedFilterName && filters.advancedFilterKey) {
      const filterValues = advancedFilters[filters.advancedFilterName];
      const columnName = filters.advancedFilterKey;

      const hasTagRawValues =
        Array.isArray(filters.advancedFilterTagRawValues) && filters.advancedFilterTagRawValues.length > 0;
      const hasSimpleValue =
        !!filters.advancedFilterValue && filters.advancedFilterValue !== 'all';

      // Booleans: siempre eq (evita rama jsonb/cs si agent_advanced_filters envía tag_raw_values por error)
      if (hasSimpleValue && isSimpleFilter(filterValues) && isBooleanLikeFilter(filterValues)) {
        const parsed = parseBooleanValue(filters.advancedFilterValue!);
        if (parsed === null) {
          query = query.eq('id', -1);
        } else {
          query = query.eq(columnName, parsed);
        }
      } else if (hasTagRawValues) {
        // Any-match sobre jsonb (cs = @>) usando el mismo contrato que otros filtros complejos:
        // - columnName = advancedFilterKey (p. ej. services_filters)
        // - tag_raw_values = strings que se comparan contra el array jsonb de strings de la columna
        const idBuckets = await Promise.all(
          filters.advancedFilterTagRawValues!.map(async (rawValue) => {
            const containsPayload = jsonbContainsStringArrayPayload(rawValue);

            const { data } = await supabase
              .schema('web_dashboard')
              .from('agents')
              .select('id')
              .filter(columnName, 'cs', containsPayload)
              .limit(2000);

            return (data || []).map((row: any) => row.id);
          })
        );

        const matchedIds = Array.from(new Set(idBuckets.flat()));
        if (matchedIds.length > 0) {
          query = query.in('id', matchedIds);
        } else {
          query = query.eq('id', -1);
        }
      } else if (hasSimpleValue && isSimpleFilter(filterValues)) {
        const trimmedValue = filters.advancedFilterValue!.trim();
        if (columnName === 'humi_madurity_level' && isNotCalculateFilterValue(trimmedValue)) {
          // IS NULL only — btree skips NULLs; .or() forces seq scan + sort on ~165k rows.
          // Partial indexes: db/indexes_web_dashboard_agents_humi_madurity_level.sql
          query = applyNotCalculatedMaturityFilter(query);
        } else if (columnName === 'chain_name') {
          // Prefer chain_id (btree idx_agents_chain_name) over chain_name ILIKE/eq:
          // filtering 330k+ rows by chain_name + exact count times out (~8s statement limit).
          // erc_8004.chains is only granted to service_role today — use admin for the tiny lookup.
          const needle = trimmedValue.toLowerCase();
          const chainsClient = getSupabaseAdmin() ?? supabase;
          const { data: chainRows } = await chainsClient
            .schema('erc_8004')
            .from('chains')
            .select('id, short_name, name');

          const matched = (chainRows || []).find((row: { id?: number; short_name?: string | null; name?: string | null }) => {
            const short = (row.short_name || '').trim().toLowerCase();
            const name = (row.name || '').trim().toLowerCase();
            return short === needle || name === needle;
          });

          if (matched?.id != null) {
            query = query.eq('chain_id', matched.id);
          } else {
            // Fallback: exact match only (still may be slow without index; avoid ILIKE).
            query = query.eq(columnName, trimmedValue);
          }
        } else {
          query = query.eq(columnName, trimmedValue);
        }
      }
    }

    // Aplicar filtros de búsqueda usando los keys del openSearchOptions
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();

      switch (filters.selectedOpenFilter) {
        case 'searchName':
          query = query.ilike('name', `%${escapeLike(searchTerm)}%`);
          break;
        case 'searchWallet':
          query = query.ilike('wallet_chain_register', `%${escapeLike(searchTerm)}%`);
          break;
        case 'searchWalletOwner':
          query = query.ilike('owner_wallet', `%${escapeLike(searchTerm)}%`);
          break;
        case 'searchAgentIdentifier':
          if (/^\d+$/.test(searchTerm)) {
            query = query.eq('on_chain_id', searchTerm);
          } else {
            query = query.ilike('on_chain_id', `%${escapeLike(searchTerm)}%`);
          }
          break;
        case 'searchGeneral':
        default: {
          const escaped = escapeLike(searchTerm);
          // Búsqueda general: combinar resultados de múltiples consultas
          // Primero buscar en name y description
          const textQuery = supabase
            .schema('web_dashboard')
            .from('agents')
            .select('id')
            .or(`name.ilike.%${escaped}%,description.ilike.%${escaped}%`)
            .limit(1000);

          // Luego buscar en searchable_metadata (JSONB)
          const metadataQuery = supabase
            .schema('web_dashboard')
            .from('agents')
            .select('id')
            .ilike('searchable_metadata::text', `%${escaped}%`)
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
    }

    // Aplicar ordenamiento
    // nonce_current / balance_current ya no existen en web_dashboard.agents — fallback a HUMI
    const sortDirection = filters.sortDirection === 'asc';
    switch (filters.sortBy) {
      case 'name':
        query = query.order('name', { ascending: sortDirection });
        break;
      case 'nonce_current':
      case 'balance_current':
      case 'current_humi_score':
        query = query.order('current_humi_score', {
          ascending: sortDirection,
          nullsFirst: false,
        });
        break;
      case 'on_chain_created_at':
      case 'created_at':
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
      const warnings = parseAgentWarnings(agent.agent_warnings);
      const hasDuplicateWarning = warnings.some((w) => w.type === 'duplication_metadata');
      const hasDummyWarning = warnings.some((w) => w.type === 'dummy_metadata');

      return {
      id: agent.id,
      agent_id: agent.agent_id,
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
      is_dummy: hasDummyWarning,
      has_duplicate_agent: hasDuplicateWarning,
      current_humi_score: normalizeAgentHumiScore(agent.current_humi_score),
      humi_madurity_level: normalizeAgentHumiMaturity(agent.humi_madurity_level),
      ai_category_primary: agent.ai_category_primary ?? null,
      ai_category_purpose: agent.ai_category_purpose ?? null,
      realness_status: agent.realness_status ?? null,
      // Columnas eliminadas del esquema agents; UI muestra N/A hasta reintroducir fuente
      nonce_current: null,
      balance_current: null,
    };
    });

    const totalCount = count ?? 0;

    return NextResponse.json({
      data: mappedAgents,
      count: totalCount,
      totalCount,
      countMode,
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
