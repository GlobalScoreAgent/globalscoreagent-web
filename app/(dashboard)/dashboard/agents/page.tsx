'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronDown, CalendarDays, Hash, Wrench, Zap, FileText, User, Bot, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import { useDashboardStats } from '../components/DashboardLayoutClient';
import { createClient } from '@/utils/supabase/client';
import {
  getAdvancedFilterOptions,
  getSubCategoryOptions,
  getTagRawValuesForSelection,
  isComplexFilter,
} from '@/lib/dashboardFilters';

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



function getSortOptions(): { key: string; label: string }[] {
  return [
    { key: 'name', label: 'sortName' },
    { key: 'created_at', label: 'sortCreatedDate' },
    { key: 'current_humi_score', label: 'sortHumiScore' },
  ];
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

export default function AgentsPage() {
  const PAGE_SIZE = 10;
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
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [agents, setAgents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(totalAgents || 0);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
  }, options?: { append?: boolean }) => {
    const append = options?.append || false;
    try {
      if (!append && agents.length > 0) {
        setIsRefetching(true);
      } else if (!append) {
        setLoading(true);
      }
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

      const selectedFilterName = selectedSpecificFilter.replace('search', '');
      const selectedFilterKey = advancedFilters._filterKeys?.[selectedFilterName];
      const complexFilter = isComplexFilter(selectedSpecificFilter, advancedFilters);
      const tagRawValues = complexFilter
        ? getTagRawValuesForSelection(
            selectedSpecificFilter,
            selectedCategory,
            selectedSubFilter,
            advancedFilters
          )
        : [];

      if (selectedFilterName && selectedFilterKey) {
        params.set('advancedFilterName', selectedFilterName);
        params.set('advancedFilterKey', selectedFilterKey);
      }

      if (complexFilter && tagRawValues.length > 0) {
        params.set('advancedFilterTagRawValues', JSON.stringify(tagRawValues));
      } else if (!complexFilter && selectedSubFilter !== 'all') {
        params.set('advancedFilterValue', selectedSubFilter);
      }

      const url = `/api/dashboard/agents?${params}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar agentes');
      }

      const incomingAgents = data.data || [];
      setAgents((prev) => {
        if (!append) return incomingAgents;
        const seen = new Set(prev.map((agent: any) => agent.agent_id));
        const uniqueIncoming = incomingAgents.filter((agent: any) => !seen.has(agent.agent_id));
        return [...prev, ...uniqueIncoming];
      });
      setTotalCount(data.totalCount || 0);
      setHasMore(incomingAgents.length === filters.limit);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar agentes');
      if (append) setHasMore(false);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  // Cargar datos iniciales al montar
  useEffect(() => {
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
      limit: PAGE_SIZE,
    });

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
        page: 1,
        limit: PAGE_SIZE,
      });
      setCurrentPage(1);
      setHasMore(true);
    }, searchTerm ? 600 : 0); // Debounce para búsqueda por texto

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedOpenFilter, selectedSpecificFilter, selectedSubFilter, selectedSort, sortDirection]);

  useEffect(() => {
    if (currentPage <= 1 || !hasMore) return;

    fetchAgents({
      searchTerm: searchTerm,
      searchType: selectedOpenFilter.replace('search', '').toLowerCase(),
      chainId: undefined,
      humiFilter: undefined,
      tagsFilter: undefined,
      skillsFilter: undefined,
      capabilitiesFilter: undefined,
      oasfDomainsFilter: undefined,
      sortBy: selectedSort,
      sortDirection: sortDirection,
      page: currentPage,
      limit: PAGE_SIZE,
    }, { append: true });
  }, [currentPage]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || isRefetching || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, isRefetching, hasMore]);

  // Opciones de búsqueda abierta (solo texto)
  const openSearchOptions = [
    { key: 'searchGeneral', label: t.searchGeneral },
    { key: 'searchName', label: t.searchName },
    { key: 'searchWallet', label: t.searchWallet },
    { key: 'searchWalletOwner', label: t.searchWalletOwner },
    { key: 'searchAgentIdentifier', label: t.searchAgentIdentifier },
  ];

  // Opciones de filtros específicos (con sub-dropdown) - dinámico desde DB
  const specificFilterOptions = Object.keys(advancedFilters)
    .filter(filterKey => !filterKey.startsWith('_'))
    .map(filterKey => ({
      key: `search${filterKey}`,
      label: filterKey
    }));

  const paginatedAgents = agents;

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

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedOpenFilter('searchGeneral');
    setSelectedSpecificFilter(
      specificFilterOptions[0]?.key || 'searchNetwork'
    );
    setSelectedSubFilter('all');
    setSubFilterSearch('');
    setSelectedCategory('all');
    setCategorySearch('');
    setCurrentPage(1);
    setHasMore(true);
  };

  const currentSearchTypeLabel =
    openSearchOptions.find((option) => option.key === selectedOpenFilter)?.label || t.searchGeneral;
  const currentSpecificFilterLabel =
    specificFilterOptions.find((option) => option.key === selectedSpecificFilter)?.label || '';
  const selectedCategoryLabel =
    getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters).find((option) => option.key === selectedCategory)?.label || '';
  const selectedSubCategoryLabel =
    getSubCategoryOptions(selectedSpecificFilter, selectedCategory, advancedFilters).find((option) => option.key === selectedSubFilter)?.label || '';
  const hasSpecificFilter = selectedSubFilter !== 'all' && (selectedSubFilter || selectedCategory !== 'all');
  const activeFilterCount = [
    searchTerm.trim().length > 0,
    selectedOpenFilter !== 'searchGeneral',
    hasSpecificFilter,
  ].filter(Boolean).length;

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
      <div className={`p-5 rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-zinc-200'}`}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative" onMouseEnter={() => clearDropdownTimer('open')} onMouseLeave={() => startDropdownTimer('open')}>
            <button
              onClick={() => setIsOpenDropdownOpen(!isOpenDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[190px] ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">{currentSearchTypeLabel}</span>
              <ChevronDown size={16} className={`transition-transform ${isOpenDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpenDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'
              }`}>
                {openSearchOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSelectedOpenFilter(option.key);
                      setIsOpenDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 relative min-w-[260px]">
            <Search size={18} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
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

          <div className="relative" onMouseEnter={() => clearDropdownTimer('sort')} onMouseLeave={() => startDropdownTimer('sort')}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[190px] ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">
                {t[getSortOptions().find(option => option.key === selectedSort)?.label as keyof typeof t]} ({sortDirection === 'asc' ? '↑' : '↓'})
              </span>
              <ChevronDown size={16} className={`transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'
              }`}>
                {getSortOptions().map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSelectedSort(option.key);
                      setIsSortDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {t[option.label as keyof typeof t]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              setCurrentPage(1);
            }}
            className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-colors ${
              theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
            }`}
            title={sortDirection === 'asc' ? t.sortAscending : t.sortDescending}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {showAdvancedFilters ? t.hideAdvancedFilter : t.addFilter}
          </button>
          <button
            onClick={clearAllFilters}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-red-600 hover:border-red-500 hover:text-white'
                : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-red-500 hover:border-red-400 hover:text-white'
            }`}
          >
            {t.clearAllFilters}
          </button>
          <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {totalCount.toLocaleString()} {t.resultsLabel} · {activeFilterCount} {t.activeFiltersLabel}
          </span>
          {isRefetching && (
            <span className={`text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {t.searchUpdatingResults}
            </span>
          )}
        </div>

        {showAdvancedFilters && (
          <div className={`rounded-xl border p-4 grid grid-cols-1 lg:grid-cols-3 gap-3 ${
            theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="relative" onMouseEnter={() => clearDropdownTimer('specific')} onMouseLeave={() => startDropdownTimer('specific')}>
              <button
                onClick={() => setIsSpecificDropdownOpen(!isSpecificDropdownOpen)}
                className={`flex items-center justify-between w-full gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700' : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span className="text-sm truncate">{currentSpecificFilterLabel || t.advancedFilterLabel}</span>
                <ChevronDown size={16} className={`transition-transform ${isSpecificDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSpecificDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                  theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'
                }`}>
                  {specificFilterOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        handleSpecificFilterChange(option.key);
                        setIsSpecificDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={isComplexFilter(selectedSpecificFilter, advancedFilters) ? t.searchCategoryPlaceholder : t.selectValuePlaceholder}
                value={categorySearch}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setIsCategoryDropdownOpen(true);
                }}
                onFocus={() => setIsCategoryDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500'
                    : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:border-emerald-500'
                }`}
              />
              {isCategoryDropdownOpen && getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters).length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                  theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'
                }`}>
                  {getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters)
                    .filter(option => option.label.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleCategorySelect(option.key, option.label)}
                        className={`w-full text-left px-4 py-2 text-sm truncate transition-colors ${
                          theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {isComplexFilter(selectedSpecificFilter, advancedFilters) ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchSubcategoryPlaceholder}
                  value={subFilterSearch}
                  onChange={(e) => {
                    setSubFilterSearch(e.target.value);
                    setIsSubDropdownOpen(true);
                  }}
                  onFocus={() => setIsSubDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsSubDropdownOpen(false), 200)}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
                    theme === 'dark'
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500'
                      : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:border-emerald-500'
                  }`}
                />
                {isSubDropdownOpen && getFilteredSubOptions().length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-300'
                  }`}>
                    {getFilteredSubOptions().map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleSubCategorySelect(option.key, option.label)}
                        className={`w-full text-left px-4 py-2 text-sm truncate transition-colors ${
                          theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-700' : 'text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`px-4 py-3 rounded-xl border text-sm ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-zinc-300 text-zinc-600'}`}>
                {t.simpleFilterHint}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {searchTerm.trim() && (
            <button
              onClick={() => setSearchTerm('')}
              className={`px-3 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'}`}
            >
              {t.searchChipLabel}: {currentSearchTypeLabel} = {searchTerm} ×
            </button>
          )}
          {selectedOpenFilter !== 'searchGeneral' && (
            <button
              onClick={() => setSelectedOpenFilter('searchGeneral')}
              className={`px-3 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'}`}
            >
              {t.searchTypeChipLabel}: {currentSearchTypeLabel} ×
            </button>
          )}
          {hasSpecificFilter && (
            <button
              onClick={() => {
                setSelectedSubFilter('all');
                setSubFilterSearch('');
                setSelectedCategory('all');
                setCategorySearch('');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'}`}
            >
              {currentSpecificFilterLabel}: {selectedCategoryLabel || '-'} {selectedSubCategoryLabel ? `> ${selectedSubCategoryLabel}` : ''} ×
            </button>
          )}
        </div>
      </div>



      {/* Mostrar mensaje de carga */}
      {loading && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {t.searchLoadingAgents}
          </div>
        </div>
      )}

      {/* Mostrar mensaje de error */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </div>
          <button
            onClick={() => {
              fetchAgents({
                searchTerm: searchTerm,
                searchType: selectedOpenFilter.replace('search', '').toLowerCase(),
                chainId: undefined,
                humiFilter: undefined,
                tagsFilter: undefined,
                skillsFilter: undefined,
                capabilitiesFilter: undefined,
                oasfDomainsFilter: undefined,
                sortBy: selectedSort,
                sortDirection: sortDirection,
                page: 1,
                limit: PAGE_SIZE,
              });
              setCurrentPage(1);
              setHasMore(true);
            }}
            className={`mt-4 px-4 py-2 rounded-lg border text-sm ${
              theme === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                : 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {t.searchRetry}
          </button>
        </div>
      )}

      {/* Mostrar mensaje cuando no hay agentes */}
      {!loading && !error && agents.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t.noAgentsFound}
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

                    <div className="relative flex h-full flex-col px-4 pt-4 pb-3">
                      <h3 className={`text-base font-semibold text-center mb-2 truncate ${
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      }`}>
                        {agent.name}
                      </h3>

                      <div className="relative flex-1 min-h-[120px]">
                      <AgentImage
                        src={agent.image_url}
                        alt={agent.name}
                        fill
                        className="object-contain object-center"
                      />
                      </div>

                      <div
                        className={`mt-2 min-h-8 rounded-xl border px-2 py-1 flex items-center justify-center gap-1.5 text-[11px] flex-wrap ${
                          theme === 'dark'
                            ? 'bg-zinc-900/70 border-zinc-700 text-zinc-200'
                            : 'bg-white/85 border-zinc-200 text-zinc-800'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: getChainColor(agent.chain) }}
                          />
                          <span className="truncate">{normalizeChainName(agent.chain)}</span>
                        </span>
                        <span className="opacity-50">·</span>
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: getHumiScoreColor(agent.humi_score_filter) }}
                          />
                          <span className="truncate">{getHumiScoreText(agent.humi_score_filter, t)}</span>
                        </span>
                        {agent.is_dummy === true && (
                          <>
                            <span className="opacity-50">·</span>
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <span className="h-2 w-2 rounded-full shrink-0 bg-amber-500" />
                              <span className="truncate">{t.dummyLabel}</span>
                            </span>
                          </>
                        )}
                        {agent.has_duplicate_agent === true && (
                          <>
                            <span className="opacity-50">·</span>
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <span className="h-2 w-2 rounded-full shrink-0 bg-rose-500" />
                              <span className="truncate">{t.duplicateLabel}</span>
                            </span>
                          </>
                        )}
                      </div>
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
                        {/* Descripción */}
                        <div className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                          <FileText size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                          <span
                            className="ml-2"
                            title={agent.description || t.noDescription}
                          >
                            {agent.description ? agent.description.substring(0, 80) + (agent.description.length > 80 ? '...' : '') : t.noDescription}
                          </span>
                        </div>

                        {/* Fecha de creación + on_chain_id en la misma línea */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                              {agent.created_at ? new Date(agent.created_at).toLocaleDateString('es-ES') : t.notAvailable}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} font-mono text-xs`}>
                              ID: {agent.on_chain_id || t.notAvailable}
                            </span>
                          </div>
                        </div>

                        {/* Wallets */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Bot size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span
                              className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} font-mono text-xs`}
                              title={agent.wallet_chain_register || t.notAvailable}
                            >
                              {t.agentLabel}: {agent.wallet_chain_register ? `${agent.wallet_chain_register.substring(0, 8)}...${agent.wallet_chain_register.substring(agent.wallet_chain_register.length - 6)}` : t.notAvailable}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span
                              className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} font-mono text-xs`}
                              title={agent.owner_wallet || t.notAvailable}
                            >
                              {t.ownerLabel}: {agent.owner_wallet ? `${agent.owner_wallet.substring(0, 8)}...${agent.owner_wallet.substring(agent.owner_wallet.length - 6)}` : t.notAvailable}
                            </span>
                          </div>
                        </div>

                        {/* Nonce + HUMI Score en la misma línea */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Hash size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                              {t.nonceValueLabel}: {agent.nonce_current ? agent.nonce_current.toLocaleString() : t.notAvailable}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={14} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} />
                            <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                              HUMI: {agent.current_humi_score || t.notAvailable}
                            </span>
                          </div>
                        </div>

                        {/* Skills (primeras 3 del array skills_filters) */}
                        {agent.skills_filters && Array.isArray(agent.skills_filters) && agent.skills_filters.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Wrench size={14} className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`} />
                            <div className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} text-xs`}>
                              <span className="mr-1">{t.skillsLabel}:</span>
                              {agent.skills_filters.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        )}

                        {/* Capabilities (primeras 3 del array capabilities_filters) */}
                        {agent.capabilities_filters && Array.isArray(agent.capabilities_filters) && agent.capabilities_filters.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Zap size={14} className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`} />
                            <div className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} text-xs`}>
                              <span className="mr-1">{t.capabilitiesLabel}:</span>
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

      <div ref={loadMoreRef} className="h-10" />
      {isRefetching && agents.length > 0 && (
        <div className="text-center pb-8">
          <span className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t.searchUpdatingResults}
          </span>
        </div>
      )}
    </div>
  );
}
