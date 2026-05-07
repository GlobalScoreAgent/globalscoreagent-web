'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronDown, Info, ArrowUpRight, CalendarDays, Hash, Wrench, Zap, FileText, User, Bot, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import { useDashboardStats } from '../components/DashboardLayoutClient';
import { createClient } from '@/utils/supabase/client';

// Componente Image con fallback automático
function AgentImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc('/agent_directory_default.jpg');
    }
  };

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      unoptimized
    />
  );
}



function getScoreImage(score: number): string {
  if (score >= 60) return '/index_humi_score_dorado.png';
  if (score >= 30) return '/index_humi_score_naranja.png';
  return '/index_humi_score_rojo.png';
}

function isAdvancedFilter(filterKey: string): boolean {
  return ['searchOasfDomains', 'searchTags', 'searchSkills', 'searchCapabilities', 'searchNetwork'].includes(filterKey);
}

function getSubFilterOptions(): { key: string; label: string }[] {
  return [
    { key: 'all', label: 'All' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];
}

function getNetworkOptions(chains: any[]): { key: string; label: string }[] {
  const options = [{ key: 'all', label: 'Todas las redes' }];
  chains.forEach(chain => {
    options.push({ key: chain.id.toString(), label: chain.short_name });
  });
  return options;
}

function getAdvancedFilterOptions(filterType: string, advancedFilters: Record<string, any>): { key: string; label: string }[] {
  // Mapear los tipos de filtro del frontend a los de la base de datos
  const filterMapping: Record<string, string> = {
    'searchOasfDomains': 'OASF Domains',
    'searchTags': 'Tags',
    'searchSkills': 'Skills',
    'searchCapabilities': 'Capabilities'
  };

  const dbFilterType = filterMapping[filterType] || filterType.replace('search', '');
  const values = advancedFilters[dbFilterType] || [];

  // Si es un array simple de strings
  if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'string') {
    const options: { key: string; label: string }[] = [];
    values.forEach(value => {
      options.push({ key: value, label: value });
    });
    return options;
  }

  // Si es un array de objetos complejos, devolver las categorías
  if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'object') {
    const options = [];
    values.forEach(category => {
      if (category.category_label) {
        options.push({ key: category.category_key, label: category.category_label });
      }
    });
    return options;
  }

  return [{ key: 'all', label: 'Todos' }];
}

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

function getSubCategoryOptions(filterType: string, selectedCategory: string, advancedFilters: Record<string, any>): { key: string; label: string }[] {
  const filterMapping: Record<string, string> = {
    'searchOasfDomains': 'OASF Domains',
    'searchTags': 'Tags',
    'searchSkills': 'Skills',
    'searchCapabilities': 'Capabilities'
  };

  const dbFilterType = filterMapping[filterType] || filterType.replace('search', '');
  const values = advancedFilters[dbFilterType] || [];

  if (!Array.isArray(values) || !isComplexFilter(filterType, advancedFilters)) {
    return [];
  }

  const category = values.find(cat => cat.category_key === selectedCategory);
  if (!category || !category.items) {
    return [];
  }

  const options: { key: string; label: string }[] = [];
  category.items.forEach(item => {
    if (item.value_label) {
      options.push({ key: item.value_key, label: item.value_label });
    }
  });
  return options;
}

function getSortOptions(): { key: string; label: string }[] {
  return [
    { key: 'name', label: 'sortName' },
    { key: 'created_at', label: 'sortCreatedDate' },
    { key: 'current_humi_score', label: 'sortHumiScore' },
  ];
}

// Función para determinar qué función RPC llamar basado en ordenamiento
function getFilterFunction(sortBy: string, sortDirection: 'asc' | 'desc'): string {
  const mapping: Record<string, string> = {
    'name_asc': 'filter_agents_by_name_asc',
    'name_desc': 'filter_agents_by_name_desc',
    'created_at_asc': 'filter_agents_by_created_at_asc',
    'created_at_desc': 'filter_agents_by_created_at_desc',
    'current_humi_score_asc': 'filter_agents_by_humi_score_asc',
    'current_humi_score_desc': 'filter_agents_by_humi_score_desc'
  };
  return mapping[`${sortBy}_${sortDirection}`] || 'filter_agents_by_created_at_desc';
}

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

// Función para construir los parámetros dinámicos para la función RPC
function getFilterParams(
  selectedSpecificFilter: string,
  selectedCategory: string,
  selectedSubFilter: string,
  advancedFilters: Record<string, any>,
  searchTerm: string,
  searchType: string,
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
    params.p_search_type = searchType;
  }

  return params;
}

function sortAgents(agents: any[], sortBy: string, direction: 'asc' | 'desc' = 'desc') {
  return [...agents].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'humi_score':
        comparison = a.humi_score - b.humi_score;
        break;
      case 'nonce':
        comparison = a.nonce - b.nonce;
        break;
      case 'balance':
        comparison = a.balance - b.balance;
        break;
      default:
        return 0;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
}

// Función para normalizar nombres de cadenas
function normalizeChainName(chainName: string): string {
  const normalizedName = chainName.toLowerCase().trim();

  const nameMapping: Record<string, string> = {
    'ethereum': 'Ethereum',
    'ethereum mainnet': 'Ethereum',
    'base': 'Base',
    'base mainnet': 'Base',
    'bnb': 'BNB',
    'bnb smart chain': 'BNB',
    'bnb chain': 'BNB',
    'arbitrum': 'Arbitrum',
    'arbitrum one': 'Arbitrum',
    'arbitrum-one': 'Arbitrum',
    'polygon': 'Polygon',
    'polygon mainnet': 'Polygon',
    'matic': 'Polygon',
  };

  return nameMapping[normalizedName] || chainName;
}

// Función para obtener colores específicos de cada cadena
function getChainColor(chainName: string): string {
  const normalizedName = chainName.toLowerCase().trim();

  const colorMapping: Record<string, string> = {
    'ethereum': '#627EEA',    // Azul característico de Ethereum
    'base': '#0052FF',        // Azul característico de Base
    'bnb': '#F3BA2F',         // Amarillo característico de BNB
    'arbitrum': '#28A0F0',    // Azul característico de Arbitrum
    'polygon': '#8247E5',     // Morado característico de Polygon
  };

  return colorMapping[normalizedName] || '#6B7280'; // Gris por defecto
}

// Función para obtener colores del HUMI score según el filtro
function getHumiScoreColor(humiFilter: string): string {
  const colorMapping: Record<string, string> = {
    'Elite': '#22c55e',           // Verde para Elite
    'High Performance': '#84cc16', // Verde lima para High Performance
    'Stable': '#eab308',          // Amarillo para Stable
    'Moderate Risk': '#f97316',   // Naranja para Moderate Risk
    'Critical': '#dc2626'         // Rojo para Critical
  };

  return colorMapping[humiFilter] || '#6B7280'; // Gris por defecto
}

// Función para obtener texto internacionalizable del HUMI score
function getHumiScoreText(humiFilter: string, t: any): string {
  const textMapping: Record<string, string> = {
    'Elite': t.humiElite,
    'High Performance': t.humiHighPerformance,
    'Stable': t.humiStable,
    'Moderate Risk': t.humiModerateRisk,
    'Critical': t.humiCritical
  };

  return textMapping[humiFilter] || humiFilter;
}

// Componente para mostrar badge de chain con color específico
function ChainBadge({ chainName }: { chainName: string }) {
  const normalizedName = normalizeChainName(chainName);
  const backgroundColor = getChainColor(chainName);

  return (
    <div
      className="px-3 py-1 rounded-lg text-sm font-medium text-white shadow-lg"
      style={{ backgroundColor }}
    >
      {normalizedName}
    </div>
  );
}

export default function AgentsPage() {
  const { t, theme } = useLanguage();
  const dashboardStats = useDashboardStats();
  const totalAgents = dashboardStats?.totalAgents || 0;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpenFilter, setSelectedOpenFilter] = useState('searchGeneral');
  const [selectedSpecificFilter, setSelectedSpecificFilter] = useState('searchNetwork');
  const [selectedSubFilter, setSelectedSubFilter] = useState('all');
  const [subFilterSearch, setSubFilterSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedSort, setSelectedSort] = useState('current_humi_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isOpenDropdownOpen, setIsOpenDropdownOpen] = useState(false);
  const [isSpecificDropdownOpen, setIsSpecificDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaginationDropdownOpen, setIsPaginationDropdownOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Timers para auto-cierre de dropdowns
  const [openDropdownTimer, setOpenDropdownTimer] = useState<NodeJS.Timeout | null>(null);
  const [sortDropdownTimer, setSortDropdownTimer] = useState<NodeJS.Timeout | null>(null);
  const [specificDropdownTimer, setSpecificDropdownTimer] = useState<NodeJS.Timeout | null>(null);

  // Funciones para manejar auto-cierre de dropdowns
  const startDropdownTimer = (dropdownType: 'open' | 'sort' | 'specific') => {
    const timer = setTimeout(() => {
      switch (dropdownType) {
        case 'open':
          setIsOpenDropdownOpen(false);
          break;
        case 'sort':
          setIsSortDropdownOpen(false);
          break;
        case 'specific':
          setIsSpecificDropdownOpen(false);
          break;
      }
    }, 4000); // 4 segundos

    switch (dropdownType) {
      case 'open':
        setOpenDropdownTimer(timer);
        break;
      case 'sort':
        setSortDropdownTimer(timer);
        break;
      case 'specific':
        setSpecificDropdownTimer(timer);
        break;
    }
  };

  const clearDropdownTimer = (dropdownType: 'open' | 'sort' | 'specific') => {
    switch (dropdownType) {
      case 'open':
        if (openDropdownTimer) {
          clearTimeout(openDropdownTimer);
          setOpenDropdownTimer(null);
        }
        break;
      case 'sort':
        if (sortDropdownTimer) {
          clearTimeout(sortDropdownTimer);
          setSortDropdownTimer(null);
        }
        break;
      case 'specific':
        if (specificDropdownTimer) {
          clearTimeout(specificDropdownTimer);
          setSpecificDropdownTimer(null);
        }
        break;
    }
  };

  // Estados para datos de base de datos
  const [chains, setChains] = useState<any[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [agents, setAgents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(totalAgents || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // Función para obtener agentes desde la API
  const fetchAgents = async (filters: {
    searchTerm: string;
    searchType: string;
    chainId?: number;
    humiFilter?: string;
    tagsFilter?: string;
    skillsFilter?: string;
    capabilitiesFilter?: string;
    oasfDomainsFilter?: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    page: number;
    limit: number;
  }) => {
    console.log('🎯 Frontend: fetchAgents called with filters:', filters);

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        searchTerm: filters.searchTerm,
        searchType: filters.searchType,
        selectedOpenFilter: selectedOpenFilter,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        totalAgents: totalAgents?.toString() || '',
      });

      if (filters.chainId !== undefined) {
        params.set('chainId', filters.chainId.toString());
      }

      if (filters.humiFilter !== undefined) {
        params.set('humiFilter', filters.humiFilter);
      }

      const url = `/api/dashboard/agents?${params}`;
      console.log('🌐 Frontend: Making request to:', url);

      const response = await fetch(url);
      console.log('📡 Frontend: Response status:', response.status);

      const data = await response.json();
      console.log('📦 Frontend: Response data:', {
        count: data.count,
        totalCount: data.totalCount,
        agentsCount: data.data?.length,
        firstAgent: data.data?.[0] ? {
          id: data.data[0].agent_id,
          name: data.data[0].name,
          chain: data.data[0].chain
        } : null
      });

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar agentes');
      }

      setAgents(data.data || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('❌ Frontend: Error in fetchAgents:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar agentes');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales al montar
  useEffect(() => {
    const loadChains = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .schema('web_dashboard')
          .from('chains')
          .select('id, short_name');

        if (error) {
          console.error('Error loading chains:', error);
          setChains([]);
        } else {
          setChains(data || []);
        }
      } catch (error) {
        console.error('Error loading chains:', error);
        setChains([]);
      }
    };

    const loadAdvancedFilters = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .schema('web_dashboard')
          .from('agent_advanced_filters')
          .select('filter, values, filter_key');

        if (error) {
          console.error('Error loading advanced filters:', error);
          setAdvancedFilters({});
        } else {
          // Procesar los datos para crear el objeto de filtros
          const filters: Record<string, any> = {};
          const filterKeys: Record<string, string> = {};

          (data || []).forEach((item: { filter: string; values: any; filter_key: string }) => {
            try {
              let parsedValues: any;

              // Si ya es un array, usarlo directamente
              if (Array.isArray(item.values)) {
                parsedValues = item.values;
              }
              // Si es un string, intentar parsearlo
              else if (typeof item.values === 'string') {
                const cleanString = item.values.trim();

                // Si parece un JSON array válido, parsearlo
                if (cleanString.startsWith('[') && cleanString.endsWith(']')) {
                  parsedValues = JSON.parse(cleanString);
                }
                // Si no es JSON pero parece una lista separada por comas
                else if (cleanString.includes(',')) {
                  parsedValues = cleanString.split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
                }
                // Si es un solo valor, convertirlo a array
                else {
                  parsedValues = [cleanString];
                }
              } else {
                parsedValues = [];
              }

              filters[item.filter] = parsedValues;
              filterKeys[item.filter] = item.filter_key;
            } catch (parseError) {
              console.error('Error parsing filter values for', item.filter, ':', parseError);
              console.log('Raw value:', item.values);
              // En caso de error, intentar usar el valor como array vacío
              filters[item.filter] = [];
              filterKeys[item.filter] = item.filter_key || '';
            }
          });

          setAdvancedFilters({ ...filters, _filterKeys: filterKeys });
        }
      } catch (error) {
        console.error('Error loading advanced filters:', error);
        setAdvancedFilters({});
      }
    };

    // Cargar agentes iniciales
    fetchAgents({
      searchTerm: '',
      searchType: 'general',
      sortBy: selectedSort,
      sortDirection: sortDirection,
      page: 1,
      limit: itemsPerPage,
    });

    loadChains();
    loadAdvancedFilters();
  }, []);

  // useEffect unificado para manejar todos los cambios (paginación, filtros, búsqueda)
  useEffect(() => {
    // Evitar llamada inicial duplicada - solo en la carga inicial del componente
    if (isInitialLoad) {
      setIsInitialLoad(false); // Ya no es carga inicial
      return; // No hacer llamada
    }

    const timeoutId = setTimeout(() => {
      fetchAgents({
        searchTerm: searchTerm,
        searchType: selectedOpenFilter.replace('search', '').toLowerCase(),
        // TODO: Implementar lógica genérica para filtros desde base de datos
        chainId: undefined,
        humiFilter: undefined,
        tagsFilter: selectedSpecificFilter === 'searchTags' && selectedSubFilter !== 'all'
          ? selectedSubFilter
          : undefined,
        skillsFilter: selectedSpecificFilter === 'searchSkills' && selectedSubFilter !== 'all'
          ? selectedSubFilter
          : undefined,
        capabilitiesFilter: selectedSpecificFilter === 'searchCapabilities' && selectedSubFilter !== 'all'
          ? selectedSubFilter
          : undefined,
        oasfDomainsFilter: selectedSpecificFilter === 'searchOasfDomains' && selectedSubFilter !== 'all'
          ? selectedSubFilter
          : undefined,
        sortBy: selectedSort,
        sortDirection: sortDirection,
        page: currentPage,
        limit: itemsPerPage,
      });
    }, searchTerm ? 1000 : 0); // Solo debounce para búsqueda por texto

    return () => clearTimeout(timeoutId);
  }, [currentPage, itemsPerPage, searchTerm, selectedOpenFilter, selectedSpecificFilter, selectedSubFilter, selectedSort, sortDirection]);

  // Opciones de búsqueda abierta (solo texto)
  const openSearchOptions = [
    { key: 'searchGeneral', label: t.searchGeneral },
    { key: 'searchName', label: t.searchName },
    { key: 'searchWallet', label: t.searchWallet },
    { key: 'searchWalletOwner', label: t.searchWalletOwner },
    { key: 'searchAgentIdentifier', label: t.searchAgentIdentifier || 'Agent Identifier' },
  ];

  // Opciones de filtros específicos (con sub-dropdown) - dinámico desde DB
  const specificFilterOptions = [
    ...Object.keys(advancedFilters).map(filterKey => ({
      key: `search${filterKey}`,
      label: filterKey
    }))
  ];

  // Los agentes ya vienen filtrados del servidor, no necesitamos filtrado local
  const filteredAgents = agents;

  // Aplicar ordenamiento
  const sortedAgents = sortAgents(filteredAgents, selectedSort, sortDirection);

  // Paginación - ahora usa server-side data
  // Debug: verificar valores
  console.log('Debug - totalCount:', totalCount, 'itemsPerPage:', itemsPerPage);

  // Limitar totalPages a un máximo razonable para evitar UI rota
  const maxReasonablePages = 10000;
  const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage);
  const totalPages = Math.min(calculatedTotalPages, maxReasonablePages);

  console.log('Debug - calculatedTotalPages:', calculatedTotalPages, 'limitedTotalPages:', totalPages);

  const paginatedAgents = agents; // Los agentes ya vienen paginados del servidor

  // Función para generar páginas inteligentes (evita miles de botones)
  const getVisiblePages = () => {
    const maxVisiblePages = 10;
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica inteligente: primera, última, actual ± 2
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // Siempre incluir la primera página
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }

      // Páginas del medio
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Siempre incluir la última página
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Obtener opciones filtradas para el sub-dropdown con búsqueda
  const getFilteredSubOptions = () => {
    let allOptions;

    if (isComplexFilter(selectedSpecificFilter, advancedFilters)) {
      // Para filtros complejos, mostrar subcategorías de la categoría seleccionada
      allOptions = getSubCategoryOptions(selectedSpecificFilter, selectedCategory, advancedFilters);
    } else {
      // Para filtros simples, mostrar las opciones directas
      allOptions = getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters);
    }

    // Filtrar por texto de búsqueda
    const filtered = allOptions.filter(option =>
      option.label.toLowerCase().includes(subFilterSearch.toLowerCase())
    );

    // Limitar a máximo 12 resultados para no sobrecargar la UI
    return filtered.slice(0, 12);
  };

  const handleSpecificFilterChange = (filterKey: string) => {
    setSelectedSpecificFilter(filterKey);
    setSelectedSubFilter('all'); // Reset sub-filter when main filter changes
    setSubFilterSearch(''); // Reset search text
    setSelectedCategory('all'); // Reset category when main filter changes
    setCategorySearch(''); // Reset category search
    setCurrentPage(1); // Reset to first page
  };

  const handleCategorySelect = (categoryKey: string, categoryLabel: string) => {
    if (isComplexFilter(selectedSpecificFilter, advancedFilters)) {
      // Para filtros complejos: seleccionar categoría
      setSelectedCategory(categoryKey);
      setCategorySearch(categoryLabel); // Mostrar el label seleccionado en el input
      setIsCategoryDropdownOpen(false);
      // Reset sub-filter when category changes
      setSelectedSubFilter('all');
      setSubFilterSearch('');
    } else {
      // Para filtros simples: seleccionar opción directamente
      setSelectedCategory(categoryKey);
      setCategorySearch(categoryLabel); // Mostrar el label seleccionado en el input
      setIsCategoryDropdownOpen(false);
      // Aplicar el filtro simple seleccionado
      setSelectedSubFilter(categoryKey); // Usar selectedSubFilter para almacenar la selección simple
      setCurrentPage(1); // Reset to first page
    }
  };

  const handleSubCategorySelect = (optionKey: string, optionLabel: string) => {
    setSelectedSubFilter(optionKey);
    setSubFilterSearch(optionLabel); // Mostrar el label seleccionado en el input
    setIsSubDropdownOpen(false);
    setCurrentPage(1); // Reset to first page
  };

  const handleSubFilterSelect = (optionKey: string, optionLabel: string) => {
    setSelectedSubFilter(optionKey);
    setSubFilterSearch(optionLabel); // Mostrar el label seleccionado en el input
    setIsSubDropdownOpen(false);
    setCurrentPage(1); // Reset to first page
  };

  const toggleFlip = (agentId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
        // Aquí podríamos cargar campos adicionales si fuera necesario
        loadAdditionalFields(agentId);
      }
      return newSet;
    });
  };

  const loadAdditionalFields = async (agentId: string) => {
    // Por ahora no cargamos campos adicionales, pero la función está lista
    // para cuando implementemos lazy loading
  };

  return (
    <div className="space-y-6">
      {/* Contenedor unificado de búsqueda */}
      <div className={`p-4 rounded-2xl ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-zinc-200'
      }`}>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Dropdown de búsqueda abierta */}
          <div
            className="relative"
            onMouseEnter={() => clearDropdownTimer('open')}
            onMouseLeave={() => startDropdownTimer('open')}
          >
            <button
              onClick={() => setIsOpenDropdownOpen(!isOpenDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[180px] ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">
                {openSearchOptions.find(option => option.key === selectedOpenFilter)?.label}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isOpenDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpenDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-zinc-300'
              }`}>
                {openSearchOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSelectedOpenFilter(option.key);
                      setIsOpenDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                      theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Campo de búsqueda */}
          <div className="flex-1 relative min-w-[200px]">
            <Search size={18} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
            }`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Controles de ordenamiento */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium whitespace-nowrap ${
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              {t.sortLabel}
            </span>
            <div
              className="relative"
              onMouseEnter={() => clearDropdownTimer('sort')}
              onMouseLeave={() => startDropdownTimer('sort')}
            >
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[160px] ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span className="text-sm">
                  {t[getSortOptions().find(option => option.key === selectedSort)?.label as keyof typeof t]}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-white border-zinc-300'
                }`}>
                  {getSortOptions().map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSelectedSort(option.key);
                        setIsSortDropdownOpen(false);
                        setCurrentPage(1); // Reset to first page when sorting changes
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                        theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {t[option.label as keyof typeof t]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Ascendente/Descendente */}
            <button
              onClick={() => {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                setCurrentPage(1); // Reset to first page when direction changes
              }}
              className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-colors ${
                sortDirection === 'asc'
                  ? theme === 'dark'
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-emerald-500 border-emerald-400 text-white'
                  : theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
              title={sortDirection === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            >
              <span className="text-lg font-bold">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </button>

            {/* Botón limpiar filtros */}
            <button
              onClick={() => {
                setSelectedSpecificFilter(Object.keys(advancedFilters)[0] ? `search${Object.keys(advancedFilters)[0]}` : 'searchNetwork');
                setSelectedSubFilter('all');
                setSubFilterSearch('');
                setSelectedCategory('all');
                setCategorySearch('');
                setCurrentPage(1);
              }}
              className={`flex items-center justify-center px-3 py-2 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-red-600 hover:border-red-500 hover:text-white'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-red-500 hover:border-red-400 hover:text-white'
              }`}
              title={t.clearFiltersTooltip}
            >
              🗑️
            </button>
          </div>

          {/* Dropdown de filtros específicos */}
          <div
            className="relative"
            onMouseEnter={() => clearDropdownTimer('specific')}
            onMouseLeave={() => startDropdownTimer('specific')}
          >
            <button
              onClick={() => setIsSpecificDropdownOpen(!isSpecificDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[180px] ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">
                {specificFilterOptions.find(option => option.key === selectedSpecificFilter)?.label}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isSpecificDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSpecificDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-zinc-300'
              }`}>
                {specificFilterOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      handleSpecificFilterChange(option.key);
                      setIsSpecificDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                      theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown de categorías (siempre visible, habilitado solo para filtros complejos) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setIsCategoryDropdownOpen(true); // Abrir dropdown al escribir
              }}
              onFocus={() => setIsCategoryDropdownOpen(true)}
              onBlur={() => {
                // Cerrar dropdown después de un pequeño delay para permitir clicks
                setTimeout(() => setIsCategoryDropdownOpen(false), 200);
              }}
              disabled={false}
              className={`px-4 py-3 rounded-xl border outline-none transition-colors min-w-[200px] ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:border-emerald-500'
              }`}
            />

            {isCategoryDropdownOpen && getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters).length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-zinc-300'
              }`}>
                {getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters)
                  .filter(option => option.label.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map((option) => (
                    <button
                      key={option.key}
                      title={option.label} // Tooltip para texto completo
                      onClick={() => handleCategorySelect(option.key, option.label)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors truncate ${
                        theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Campo de búsqueda inteligente para sub-filtros (siempre visible) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar subcategorías..."
              value={subFilterSearch}
              onChange={(e) => {
                setSubFilterSearch(e.target.value);
                setIsSubDropdownOpen(true); // Abrir dropdown al escribir
              }}
              onFocus={() => setIsSubDropdownOpen(true)}
              onBlur={() => {
                // Cerrar dropdown después de un pequeño delay para permitir clicks
                setTimeout(() => setIsSubDropdownOpen(false), 200);
              }}
              disabled={!isComplexFilter(selectedSpecificFilter, advancedFilters)}
              className={`px-4 py-3 rounded-xl border outline-none transition-colors min-w-[200px] ${
                !isComplexFilter(selectedSpecificFilter, advancedFilters)
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500'
                    : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:border-emerald-500'
              }`}
            />

            {isSubDropdownOpen && getFilteredSubOptions().length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-zinc-300'
              }`}>
                {getFilteredSubOptions().map((option) => (
                  <button
                    key={option.key}
                    title={option.label} // Tooltip para texto completo
                    onClick={() => handleSubCategorySelect(option.key, option.label)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors truncate ${
                      theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Mostrar mensaje de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Cargando agentes...
          </div>
        </div>
      )}

      {/* Mostrar mensaje de error */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </div>
        </div>
      )}

      {/* Mostrar mensaje cuando no hay agentes */}
      {!loading && !error && agents.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            No se encontraron agentes con los parámetros de búsqueda seleccionados
          </div>
        </div>
      )}

      {/* Grid de agentes */}
      {!loading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {paginatedAgents.map((agent, index) => (
            <motion.div
              key={agent.agent_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                onClick={() => toggleFlip(agent.agent_id)}
              className={`group relative rounded-3xl overflow-hidden transition-all cursor-pointer h-64 ${
                  theme === 'dark'
                    ? 'bg-zinc-900/80 border border-zinc-700/50'
                    : 'bg-white/80 border border-zinc-200/50'
                }`}
                style={{
                  perspective: "1000px",
                  background: theme === 'dark'
                    ? `linear-gradient(135deg, #facc1515 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, #facc1510 100%)`
                    : `linear-gradient(135deg, #facc1520 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, #facc1515 100%)`,
                  boxShadow: theme === 'dark'
                    ? `0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px #facc1535, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px #facc1540, inset 0 1px 0 rgba(255,255,255,0.6)`
                }}
              >
                <motion.div
                  className="relative w-full h-full"
                  initial={false}
                  animate={{ rotateY: flippedCards.has(agent.agent_id) ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Cara Frontal */}
                  <div className="absolute inset-0 w-full h-full backface-hidden z-20">
                    {/* Elemento decorativo sutil */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
                      style={{
                        background: `radial-gradient(circle, #facc15 0%, transparent 70%)`,
                        transform: 'translate(20px, -20px)'
                      }}
                    />

                    {/* Patrón de puntos sutil */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                      backgroundImage: `radial-gradient(circle, #facc15 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }} />

                    <div className="relative h-52">
                      <AgentImage
                        src={agent.image_url}
                        alt={agent.name}
                        fill
                        className="object-contain object-center"
                      />

                      {/* HUMI Score Filter Badge - Esquina superior derecha */}
                      <div className="absolute top-4 right-4 z-10">
                        {(() => {
                          console.log('🔍 Debug HUMI Badge para agente:', agent.name, {
                            humi_score_filter: agent.humi_score_filter,
                            tipo: typeof agent.humi_score_filter,
                            esNull: agent.humi_score_filter === null,
                            esUndefined: agent.humi_score_filter === undefined,
                            esVacio: agent.humi_score_filter === '',
                            color: getHumiScoreColor(agent.humi_score_filter),
                            text: getHumiScoreText(agent.humi_score_filter, t)
                          });

                          return (
                            <div
                              className="px-3 py-1 rounded-lg text-sm font-medium text-white shadow-lg"
                              style={{ backgroundColor: getHumiScoreColor(agent.humi_score_filter) }}
                            >
                              {getHumiScoreText(agent.humi_score_filter, t)}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Chain Badge - Esquina superior izquierda */}
                      <div className="absolute top-4 left-4 z-10">
                        <ChainBadge chainName={agent.chain} />
                      </div>
                    </div>

                    <div className="p-6 pt-4">
                      <h3 className={`text-xl font-semibold text-center ${
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      }`}>
                        {agent.name}
                      </h3>
                    </div>
                  </div>

                  {/* Cara Trasera */}
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    {/* Elemento decorativo sutil */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
                      style={{
                        background: `radial-gradient(circle, #facc15 0%, transparent 70%)`,
                        transform: 'translate(20px, -20px)'
                      }}
                    />

                    {/* Patrón de puntos sutil */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                      backgroundImage: `radial-gradient(circle, #facc15 1px, transparent 1px)`,
                      backgroundSize: '20px 20px'
                    }} />

                    <div className={`w-full h-full bg-gradient-to-br ${
                      theme === 'dark'
                        ? 'from-zinc-900 to-zinc-800 border-zinc-700'
                        : 'from-white to-zinc-50 border-zinc-300'
                    } border rounded-3xl p-6 flex flex-col justify-center items-center relative`}
                    style={{
                      background: theme === 'dark'
                        ? `linear-gradient(135deg, #facc1515 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, #facc1510 100%)`
                        : `linear-gradient(135deg, #facc1520 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, #facc1515 100%)`,
                      boxShadow: theme === 'dark'
                        ? `0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px #facc1535, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px #facc1540, inset 0 1px 0 rgba(255,255,255,0.6)`
                    }}>

                      {/* Borde verde lateral derecho como indicador de navegación */}
                      <Link href={`/dashboard/agents/${agent.agent_id}`}>
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-3xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                          <span className="text-white font-bold text-lg opacity-80">+</span>
                        </div>
                      </Link>

                      {/* Información detallada */}
                      <div className="space-y-2 text-xs pr-2">
                        {/* Debug de datos */}
                        {(() => {
                          console.log('🔍 Debug Reverso - Datos del agente:', agent.name, {
                            wallet_chain_register: agent.wallet_chain_register,
                            owner_wallet: agent.owner_wallet,
                            current_humi_score: agent.current_humi_score,
                            nonce_current: agent.nonce_current,
                            skills: agent.skills,
                            capabilities: agent.capabilities,
                            skillsType: typeof agent.skills,
                            capabilitiesType: typeof agent.capabilities,
                            skillsKeys: agent.skills ? Object.keys(agent.skills) : null,
                            capabilitiesLength: agent.capabilities ? agent.capabilities.length : null
                          });
                          return null;
                        })()}

                        {/* Descripción */}
                        <div className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                          <FileText size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                          <span
                            className="ml-2"
                            title={agent.description || 'Sin descripción'}
                          >
                            {agent.description ? agent.description.substring(0, 80) + (agent.description.length > 80 ? '...' : '') : 'Sin descripción'}
                          </span>
                        </div>

                        {/* Fecha de creación + on_chain_id en la misma línea */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                              {agent.created_at ? new Date(agent.created_at).toLocaleDateString('es-ES') : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} font-mono text-xs`}>
                              ID: {agent.on_chain_id || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Wallets */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Bot size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span
                              className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} font-mono text-xs`}
                              title={agent.wallet_chain_register || 'N/A'}
                            >
                              Agent: {agent.wallet_chain_register ? `${agent.wallet_chain_register.substring(0, 8)}...${agent.wallet_chain_register.substring(agent.wallet_chain_register.length - 6)}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span
                              className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} font-mono text-xs`}
                              title={agent.owner_wallet || 'N/A'}
                            >
                              Owner: {agent.owner_wallet ? `${agent.owner_wallet.substring(0, 8)}...${agent.owner_wallet.substring(agent.owner_wallet.length - 6)}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Nonce + HUMI Score en la misma línea */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                              Nonce: {agent.nonce_current ? agent.nonce_current.toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                              HUMI: {agent.current_humi_score || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Skills (primeras 3 del array skills_filters) */}
                        {agent.skills_filters && Array.isArray(agent.skills_filters) && agent.skills_filters.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Wrench size={14} className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`} />
                            <div className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} text-xs`}>
                              <span className="mr-1">Skills:</span>
                              {agent.skills_filters.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        )}

                        {/* Capabilities (primeras 3 del array capabilities_filters) */}
                        {agent.capabilities_filters && Array.isArray(agent.capabilities_filters) && agent.capabilities_filters.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Zap size={14} className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`} />
                            <div className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} text-xs`}>
                              <span className="mr-1">Capabilities:</span>
                              {agent.capabilities_filters.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selector de agentes por página y controles de paginación */}
      <div className="flex justify-between items-center mt-8">
        {/* Selector de agentes por página */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {t.show}:
          </span>
          <div className="relative">
            <button
              onClick={() => setIsPaginationDropdownOpen(!isPaginationDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors min-w-[80px] ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">{itemsPerPage}</span>
              <ChevronDown size={14} className={`transition-transform ${isPaginationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPaginationDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-full border rounded-lg shadow-lg z-20 ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-zinc-300'
              }`}>
                {[5, 10, 15, 20, 25, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setItemsPerPage(num);
                      setIsPaginationDropdownOpen(false);
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                      theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t.agentsPerPage}
          </span>
        </div>

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {t.previous}
            </button>

            <div className="flex gap-1">
              {getVisiblePages().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      currentPage === page
                        ? theme === 'dark'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-emerald-500 border-emerald-400 text-white'
                        : theme === 'dark'
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                          : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span
                    key={`ellipsis-${index}`}
                    className={`px-2 py-2 text-sm ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    }`}
                  >
                    {page}
                  </span>
                )
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {t.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
