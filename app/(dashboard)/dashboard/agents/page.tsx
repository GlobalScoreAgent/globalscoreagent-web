'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import { createClient } from '@/utils/supabase/client';
import {
  getAdvancedFilterOptions,
  getSubCategoryOptions,
  getTagRawValuesForSelection,
  isComplexFilter,
  mergeAiCategoriesFilter,
} from '@/lib/dashboardFilters';
import { normalizeChainName, getChainColor } from '@/lib/agentChains';
import { AgentsDirectorySearching } from '@/components/dashboard/AgentsDirectorySearching';
import { DashboardSubscriptionGate } from '@/components/dashboard/DashboardSubscriptionGate';
import { SubscriptionInactiveNotice } from '@/components/dashboard/SubscriptionInactiveNotice';
import { getHumiMaturityColor } from '@/lib/agentHumiDisplay';
import {
  getRealnessStatusColor,
  getRealnessStatusLabel,
  parseRealnessStatus,
} from '@/lib/agentRealnessDisplay';
import { handleDashboardUnauthorized } from '@/lib/auth/handle-dashboard-unauthorized';

function formatAgentHumiScore(score: unknown): string {
  const n = score != null && Number.isFinite(Number(score)) ? Number(score) : 0;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

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


const AGENTS_LIST_FILTERS_KEY = 'gsa:agentsDirectoryFilters';
const AGENTS_LIST_FILTERS_VERSION = 1;

type AgentsListFiltersSnapshot = {
  v: number;
  searchTerm: string;
  selectedOpenFilter: string;
  selectedSpecificFilter: string;
  selectedSubFilter: string;
  subFilterSearch: string;
  selectedCategory: string;
  categorySearch: string;
  selectedSort: string;
  sortDirection: 'asc' | 'desc';
  showAdvancedFilters: boolean;
};

type AppliedSearchQuery = {
  searchTerm: string;
  selectedOpenFilter: string;
  selectedSpecificFilter: string;
  selectedCategory: string;
  selectedSubFilter: string;
};

const DEFAULT_APPLIED_QUERY: AppliedSearchQuery = {
  searchTerm: '',
  selectedOpenFilter: 'searchGeneral',
  selectedSpecificFilter: 'searchChains',
  selectedCategory: 'all',
  selectedSubFilter: 'all',
};

export default function AgentsPage() {
  return (
    <DashboardSubscriptionGate>
      <AgentsDirectoryPageInner />
    </DashboardSubscriptionGate>
  );
}

function AgentsDirectoryPageInner() {
  const PAGE_SIZE = 10;
  const { t, theme } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpenFilter, setSelectedOpenFilter] = useState('searchGeneral');
  const [selectedSpecificFilter, setSelectedSpecificFilter] = useState('searchChains');
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const didRunInitialHydrationRef = useRef(false);
  const agentsFetchAbortRef = useRef<AbortController | null>(null);
  const appendFetchAbortRef = useRef<AbortController | null>(null);
  const agentsFetchRequestIdRef = useRef(0);
  const skipSortEffectOnceRef = useRef(false);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const listFetchSettledRef = useRef(false);
  const agentsCountRef = useRef(0);
  const hasMoreRef = useRef(true);
  const [filtersConfigLoaded, setFiltersConfigLoaded] = useState(false);
  const [listStateReady, setListStateReady] = useState(false);
  const [appliedQuery, setAppliedQuery] = useState<AppliedSearchQuery>(DEFAULT_APPLIED_QUERY);

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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** True only after the latest non-append fetch settles (success or error). Prevents empty-state flash. */
  const [listFetchSettled, setListFetchSettled] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchLoadingKey, setSearchLoadingKey] = useState(0);
  const [subscriptionInactive, setSubscriptionInactive] = useState(false);

  loadingRef.current = loading;
  loadingMoreRef.current = loadingMore;
  listFetchSettledRef.current = listFetchSettled;
  agentsCountRef.current = agents.length;
  hasMoreRef.current = hasMore;

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
  }, options?: {
    append?: boolean;
    overrideUi?: {
      selectedOpenFilter: string;
      selectedSpecificFilter: string;
      selectedCategory: string;
      selectedSubFilter: string;
    };
  }) => {
    const append = options?.append || false;

    if (append) {
      // Never append while a primary fetch is in flight or the list is empty/unsettled.
      if (loadingRef.current || !listFetchSettledRef.current || agentsCountRef.current === 0) {
        return;
      }
      appendFetchAbortRef.current?.abort();
    } else {
      agentsFetchAbortRef.current?.abort();
      appendFetchAbortRef.current?.abort();
    }

    // Append must not bump the primary requestId (or primary success gets discarded).
    const requestId = append ? agentsFetchRequestIdRef.current : ++agentsFetchRequestIdRef.current;
    const controller = new AbortController();
    if (append) {
      appendFetchAbortRef.current = controller;
    } else {
      agentsFetchAbortRef.current = controller;
    }

    try {
      if (!append) {
        // Keep prior agents until the response arrives so we never flash the empty state.
        setSearchLoadingKey((k) => k + 1);
        setListFetchSettled(false);
        setLoading(true);
        setLoadingMore(false);
        setSubscriptionInactive(false);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const selOpen = options?.overrideUi?.selectedOpenFilter ?? selectedOpenFilter;
      const selSpec = options?.overrideUi?.selectedSpecificFilter ?? selectedSpecificFilter;
      const selCat = options?.overrideUi?.selectedCategory ?? selectedCategory;
      const selSub = options?.overrideUi?.selectedSubFilter ?? selectedSubFilter;

      const params = new URLSearchParams({
        searchTerm: filters.searchTerm,
        searchType: filters.searchType,
        selectedOpenFilter: selOpen,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      if (filters.chainId !== undefined) {
        params.set('chainId', filters.chainId.toString());
      }

      if (filters.humiFilter !== undefined) {
        params.set('humiFilter', filters.humiFilter);
      }

      const selectedFilterName = selSpec.replace('search', '');
      const selectedFilterKey = advancedFilters._filterKeys?.[selectedFilterName];
      const complexFilter = isComplexFilter(selSpec, advancedFilters);
      const tagRawValues = complexFilter
        ? getTagRawValuesForSelection(
            selSpec,
            selCat,
            selSub,
            advancedFilters
          )
        : [];

      const hasAdvancedValue =
        (complexFilter && tagRawValues.length > 0) ||
        (!complexFilter && selSub !== 'all');

      // Only send advanced filter params when a real selection is applied.
      // Sending key-only (e.g. restored Skills/Chains with sub=all) still hits the
      // unfiltered 330k-row path and was timing out on cold entry.
      if (hasAdvancedValue && selectedFilterName && selectedFilterKey) {
        params.set('advancedFilterName', selectedFilterName);
        params.set('advancedFilterKey', selectedFilterKey);
      }

      if (complexFilter && tagRawValues.length > 0) {
        params.set('advancedFilterTagRawValues', JSON.stringify(tagRawValues));
      } else if (!complexFilter && selSub !== 'all') {
        params.set('advancedFilterValue', selSub);
      }

      const url = `/api/dashboard/agents?${params}`;
      const response = await fetch(url, { signal: controller.signal, credentials: 'include' });
      const data = await response.json().catch(() => ({}));

      if (!append && requestId !== agentsFetchRequestIdRef.current) return;
      if (append && appendFetchAbortRef.current !== controller) return;

      if (response.status === 401) {
        await handleDashboardUnauthorized('/dashboard/agents');
        return;
      }

      if (response.status === 403 && data?.error === 'subscription_inactive') {
        setSubscriptionInactive(true);
        setAgents([]);
        setTotalCount(0);
        setHasMore(false);
        if (!append) setListFetchSettled(true);
        return;
      }

      if (!response.ok) {
        const code = typeof data?.error === 'string' ? data.error : '';
        if (response.status >= 500) {
          throw new Error(t.searchLoadErrorServer);
        }
        throw new Error(code || t.searchLoadErrorGeneric);
      }

      const incomingAgents = data.data || [];
      const incomingTotal =
        typeof data.totalCount === 'number' && Number.isFinite(data.totalCount)
          ? data.totalCount
          : null;

      setAgents((prev) => {
        if (!append) return incomingAgents;
        const seen = new Set(prev.map((agent: any) => agent.id));
        const uniqueIncoming = incomingAgents.filter((agent: any) => !seen.has(agent.id));
        return [...prev, ...uniqueIncoming];
      });

      if (incomingTotal != null) {
        setTotalCount(incomingTotal);
      } else if (!append) {
        setTotalCount(0);
      }
      // Length-based hasMore is resilient to estimated counts and avoids early stop.
      setHasMore(incomingAgents.length >= filters.limit);
      if (!append) setListFetchSettled(true);
    } catch (error) {
      if (
        controller.signal.aborted ||
        (!append && requestId !== agentsFetchRequestIdRef.current) ||
        (append && appendFetchAbortRef.current !== controller)
      ) {
        return;
      }
      console.error('Error fetching agents:', error);
      setError(error instanceof Error ? error.message : t.searchLoadErrorGeneric);
      if (!append) {
        setAgents([]);
        setTotalCount(0);
        setListFetchSettled(true);
        setHasMore(false);
      }
      if (append) setHasMore(false);
    } finally {
      if (append) {
        if (appendFetchAbortRef.current === controller) {
          setLoadingMore(false);
        }
      } else if (requestId === agentsFetchRequestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const buildListFetchArgs = (
    query: AppliedSearchQuery,
    sortBy: string,
    direction: 'asc' | 'desc',
    page: number,
  ) => ({
    searchTerm: query.searchTerm,
    searchType: query.selectedOpenFilter.replace('search', '').toLowerCase(),
    chainId: undefined as number | undefined,
    humiFilter: undefined as string | undefined,
    tagsFilter:
      query.selectedSpecificFilter === 'searchTags' && query.selectedSubFilter !== 'all'
        ? query.selectedSubFilter
        : undefined,
    skillsFilter:
      query.selectedSpecificFilter === 'searchSkills' && query.selectedSubFilter !== 'all'
        ? query.selectedSubFilter
        : undefined,
    capabilitiesFilter:
      query.selectedSpecificFilter === 'searchCapabilities' && query.selectedSubFilter !== 'all'
        ? query.selectedSubFilter
        : undefined,
    oasfDomainsFilter:
      query.selectedSpecificFilter === 'searchOasfDomains' && query.selectedSubFilter !== 'all'
        ? query.selectedSubFilter
        : undefined,
    sortBy,
    sortDirection: direction,
    page,
    limit: PAGE_SIZE,
  });

  const runSearch = (queryOverride?: AppliedSearchQuery) => {
    const next: AppliedSearchQuery = queryOverride ?? {
      searchTerm,
      selectedOpenFilter,
      selectedSpecificFilter,
      selectedCategory,
      selectedSubFilter,
    };
    setAppliedQuery(next);
    setCurrentPage(1);
    setHasMore(true);
    void fetchAgents(buildListFetchArgs(next, selectedSort, sortDirection, 1), {
      overrideUi: {
        selectedOpenFilter: next.selectedOpenFilter,
        selectedSpecificFilter: next.selectedSpecificFilter,
        selectedCategory: next.selectedCategory,
        selectedSubFilter: next.selectedSubFilter,
      },
    });
  };

  // Cargar datos iniciales al montar
  useEffect(() => {
    const loadAdvancedFilters = async () => {
      try {
        const supabase = createClient();
        const [{ data, error }, { data: aiCategoriesData, error: aiCategoriesError }] =
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

          // Canonicalize Chains catalog values to match agents.chain_name casing
          if (Array.isArray(filters.Chains)) {
            filters.Chains = filters.Chains.map((value: unknown) => {
              if (typeof value !== 'string') return value;
              const trimmed = value.trim();
              if (trimmed.toLowerCase() === 'arbitrum') return 'arbitrum';
              return trimmed;
            });
          }

          // Drop filters without a usable DB column key
          for (const key of Object.keys(filterKeys)) {
            if (!filterKeys[key]) {
              delete filterKeys[key];
              delete filters[key];
            }
          }

          if (aiCategoriesError) {
            console.error('Error loading AI categories:', aiCategoriesError);
          }

          const categoryNames = (aiCategoriesData || [])
            .map((row: { category_name?: string | null }) => row.category_name)
            .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);

          const merged = mergeAiCategoriesFilter(filters, filterKeys, categoryNames);
          setAdvancedFilters({ ...merged.filters, _filterKeys: merged.filterKeys });
        }
      } catch (error) {
        console.error('Error loading advanced filters:', error);
        setAdvancedFilters({});
      } finally {
        setFiltersConfigLoaded(true);
      }
    };

    loadAdvancedFilters();
  }, []);

  useEffect(() => {
    if (!filtersConfigLoaded || didRunInitialHydrationRef.current) return;
    didRunInitialHydrationRef.current = true;

    const keys = Object.keys(advancedFilters).filter((k) => !k.startsWith('_'));
    const fallbackSpecific =
      keys.includes('Chains') ? 'searchChains' : keys.length > 0 ? `search${keys[0]}` : 'searchChains';

    const validSpecificKeys = new Set(keys.map((k) => `search${k}`));

    let snapshot: AgentsListFiltersSnapshot | null = null;
    try {
      const raw = sessionStorage.getItem(AGENTS_LIST_FILTERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AgentsListFiltersSnapshot>;
        if (parsed?.v === AGENTS_LIST_FILTERS_VERSION) {
          snapshot = parsed as AgentsListFiltersSnapshot;
        }
      }
    } catch {
      /* ignore */
    }

    const restoredSpecific = snapshot?.selectedSpecificFilter ?? '';
    const specificOk = validSpecificKeys.has(restoredSpecific)
      ? restoredSpecific
      : fallbackSpecific;

    const categoryOptions = getAdvancedFilterOptions(specificOk, advancedFilters);
    const validCategoryKeys = new Set(categoryOptions.map((o) => o.key));
    let restoredCategory = snapshot?.selectedCategory ?? 'all';
    if (restoredCategory !== 'all' && !validCategoryKeys.has(restoredCategory)) {
      restoredCategory = 'all';
    }

    const subOptions = getSubCategoryOptions(specificOk, restoredCategory, advancedFilters);
    const validSubKeys = new Set(subOptions.map((o) => o.key));
    // Simple filters store the selection in selectedSubFilter using category keys
    const simpleOptions = !isComplexFilter(specificOk, advancedFilters) ? categoryOptions : [];
    const validSimpleKeys = new Set(simpleOptions.map((o) => o.key));
    let restoredSub = snapshot?.selectedSubFilter ?? 'all';
    if (
      restoredSub !== 'all' &&
      !validSubKeys.has(restoredSub) &&
      !validSimpleKeys.has(restoredSub)
    ) {
      restoredSub = 'all';
    }
    if (restoredCategory === 'all' && isComplexFilter(specificOk, advancedFilters)) {
      restoredSub = 'all';
    }

    const restored = snapshot
      ? {
          searchTerm: snapshot.searchTerm ?? '',
          selectedOpenFilter: snapshot.selectedOpenFilter ?? 'searchGeneral',
          selectedSpecificFilter: specificOk,
          selectedSubFilter: restoredSub,
          subFilterSearch: snapshot.subFilterSearch ?? '',
          selectedCategory: restoredCategory,
          categorySearch: snapshot.categorySearch ?? '',
          selectedSort: snapshot.selectedSort ?? 'current_humi_score',
          sortDirection:
            snapshot.sortDirection === 'asc' ? ('asc' as const) : ('desc' as const),
          showAdvancedFilters: Boolean(snapshot.showAdvancedFilters),
        }
      : null;

    if (restored) {
      // Skip the sort effect once so restore + initial fetch don't double-request.
      skipSortEffectOnceRef.current = true;
      const nextApplied: AppliedSearchQuery = {
        searchTerm: restored.searchTerm,
        selectedOpenFilter: restored.selectedOpenFilter,
        selectedSpecificFilter: restored.selectedSpecificFilter,
        selectedCategory: restored.selectedCategory,
        selectedSubFilter: restored.selectedSubFilter,
      };
      setSearchTerm(restored.searchTerm);
      setSelectedOpenFilter(restored.selectedOpenFilter);
      setSelectedSpecificFilter(restored.selectedSpecificFilter);
      setSelectedSubFilter(restored.selectedSubFilter);
      setSubFilterSearch(restored.subFilterSearch);
      setSelectedCategory(restored.selectedCategory);
      setCategorySearch(restored.categorySearch);
      setSelectedSort(restored.selectedSort);
      setSortDirection(restored.sortDirection);
      setShowAdvancedFilters(restored.showAdvancedFilters);
      setAppliedQuery(nextApplied);
      setCurrentPage(1);
      setHasMore(true);

      void fetchAgents(
        buildListFetchArgs(nextApplied, restored.selectedSort, restored.sortDirection, 1),
        {
          overrideUi: {
            selectedOpenFilter: nextApplied.selectedOpenFilter,
            selectedSpecificFilter: nextApplied.selectedSpecificFilter,
            selectedCategory: nextApplied.selectedCategory,
            selectedSubFilter: nextApplied.selectedSubFilter,
          },
        }
      );
    } else {
      setAppliedQuery(DEFAULT_APPLIED_QUERY);
      void fetchAgents(
        buildListFetchArgs(DEFAULT_APPLIED_QUERY, selectedSort, sortDirection, 1)
      );
    }

    setListStateReady(true);
  }, [filtersConfigLoaded, advancedFilters]);

  useEffect(() => {
    if (!listStateReady) return;

    const timeoutId = window.setTimeout(() => {
      const snap: AgentsListFiltersSnapshot = {
        v: AGENTS_LIST_FILTERS_VERSION,
        searchTerm,
        selectedOpenFilter,
        selectedSpecificFilter,
        selectedSubFilter,
        subFilterSearch,
        selectedCategory,
        categorySearch,
        selectedSort,
        sortDirection,
        showAdvancedFilters,
      };
      try {
        sessionStorage.setItem(AGENTS_LIST_FILTERS_KEY, JSON.stringify(snap));
      } catch {
        /* ignore */
      }
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [
    listStateReady,
    searchTerm,
    selectedOpenFilter,
    selectedSpecificFilter,
    selectedSubFilter,
    subFilterSearch,
    selectedCategory,
    categorySearch,
    selectedSort,
    sortDirection,
    showAdvancedFilters,
  ]);

  // Ordenar se aplica al instante sobre la última búsqueda confirmada
  useEffect(() => {
    if (!listStateReady) return;
    if (skipSortEffectOnceRef.current) {
      skipSortEffectOnceRef.current = false;
      return;
    }

    setCurrentPage(1);
    setHasMore(true);
    void fetchAgents(
      buildListFetchArgs(appliedQuery, selectedSort, sortDirection, 1),
      {
        overrideUi: {
          selectedOpenFilter: appliedQuery.selectedOpenFilter,
          selectedSpecificFilter: appliedQuery.selectedSpecificFilter,
          selectedCategory: appliedQuery.selectedCategory,
          selectedSubFilter: appliedQuery.selectedSubFilter,
        },
      }
    );
  }, [selectedSort, sortDirection]);

  useEffect(() => {
    if (currentPage <= 1 || !hasMore) return;
    if (loading || loadingMore || !listFetchSettled || agents.length === 0) return;

    void fetchAgents(
      buildListFetchArgs(appliedQuery, selectedSort, sortDirection, currentPage),
      {
        append: true,
        overrideUi: {
          selectedOpenFilter: appliedQuery.selectedOpenFilter,
          selectedSpecificFilter: appliedQuery.selectedSpecificFilter,
          selectedCategory: appliedQuery.selectedCategory,
          selectedSubFilter: appliedQuery.selectedSubFilter,
        },
      }
    );
  }, [currentPage]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        if (
          loadingRef.current ||
          loadingMoreRef.current ||
          !hasMoreRef.current ||
          !listFetchSettledRef.current ||
          agentsCountRef.current === 0
        ) {
          return;
        }
        setCurrentPage((prev) => prev + 1);
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, listFetchSettled, agents.length]);

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
    .filter(
      (filterKey) =>
        !filterKey.startsWith('_') && Boolean(advancedFilters._filterKeys?.[filterKey]),
    )
    .map((filterKey) => ({
      key: `search${filterKey}`,
      label: filterKey === 'Chains' ? t.searchNetwork : filterKey,
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
    const fallbackSpecific = specificFilterOptions[0]?.key || 'searchChains';
    setSearchTerm('');
    setSelectedOpenFilter('searchGeneral');
    setSelectedSpecificFilter(fallbackSpecific);
    setSelectedSubFilter('all');
    setSubFilterSearch('');
    setSelectedCategory('all');
    setCategorySearch('');
    runSearch({
      searchTerm: '',
      selectedOpenFilter: 'searchGeneral',
      selectedSpecificFilter: fallbackSpecific,
      selectedCategory: 'all',
      selectedSubFilter: 'all',
    });
  };

  const currentSearchTypeLabel =
    openSearchOptions.find((option) => option.key === selectedOpenFilter)?.label || t.searchGeneral;
  const appliedSearchTypeLabel =
    openSearchOptions.find((option) => option.key === appliedQuery.selectedOpenFilter)?.label ||
    t.searchGeneral;
  const currentSpecificFilterLabel =
    specificFilterOptions.find((option) => option.key === selectedSpecificFilter)?.label || '';
  const appliedSpecificFilterLabel =
    specificFilterOptions.find((option) => option.key === appliedQuery.selectedSpecificFilter)?.label ||
    '';
  const appliedCategoryLabel =
    getAdvancedFilterOptions(appliedQuery.selectedSpecificFilter, advancedFilters).find(
      (option) => option.key === appliedQuery.selectedCategory
    )?.label || '';
  const appliedSubCategoryLabel =
    getSubCategoryOptions(
      appliedQuery.selectedSpecificFilter,
      appliedQuery.selectedCategory,
      advancedFilters
    ).find((option) => option.key === appliedQuery.selectedSubFilter)?.label || '';
  const hasSpecificFilter =
    appliedQuery.selectedSubFilter !== 'all' &&
    (appliedQuery.selectedSubFilter || appliedQuery.selectedCategory !== 'all');
  const activeFilterCount = [
    appliedQuery.searchTerm.trim().length > 0,
    appliedQuery.selectedOpenFilter !== 'searchGeneral' && !appliedQuery.searchTerm.trim(),
    hasSpecificFilter,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {subscriptionInactive ? (
        <SubscriptionInactiveNotice />
      ) : (
      <>
      <div className={`p-5 rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-zinc-200'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full sm:w-auto sm:min-w-[190px]" onMouseEnter={() => clearDropdownTimer('open')} onMouseLeave={() => startDropdownTimer('open')}>
            <button
              onClick={() => setIsOpenDropdownOpen(!isOpenDropdownOpen)}
              className={`flex w-full items-center gap-2 px-4 py-3 rounded-xl border transition-colors sm:min-w-[190px] ${
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

          <div className="relative w-full min-w-0 flex-1 sm:min-w-[260px]">
            <Search size={18} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runSearch();
                }
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-400 focus:border-emerald-500'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-500 focus:border-emerald-500'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => runSearch()}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors sm:w-auto ${
              theme === 'dark'
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            <Search size={16} />
            {t.searchAction}
          </button>

          <div className="relative w-full sm:w-auto sm:min-w-[190px]" onMouseEnter={() => clearDropdownTimer('sort')} onMouseLeave={() => startDropdownTimer('sort')}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className={`flex w-full items-center gap-2 px-4 py-3 rounded-xl border transition-colors sm:min-w-[190px] ${
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
            {loading
              ? `— / — ${t.resultsLabel}`
              : `${agents.length.toLocaleString()} / ${totalCount.toLocaleString()} ${t.resultsLabel}`}
            {' · '}
            {activeFilterCount} {t.activeFiltersLabel}
          </span>
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
          {appliedQuery.searchTerm.trim() && (
            <button
              onClick={() => {
                setSearchTerm('');
                runSearch({
                  ...appliedQuery,
                  searchTerm: '',
                });
              }}
              className={`px-3 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'}`}
            >
              {t.searchChipLabel}: {appliedSearchTypeLabel} = {appliedQuery.searchTerm} ×
            </button>
          )}
          {appliedQuery.selectedOpenFilter !== 'searchGeneral' && !appliedQuery.searchTerm.trim() && (
            <button
              onClick={() => {
                setSelectedOpenFilter('searchGeneral');
                runSearch({
                  ...appliedQuery,
                  selectedOpenFilter: 'searchGeneral',
                });
              }}
              className={`px-3 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'}`}
            >
              {t.searchTypeChipLabel}: {appliedSearchTypeLabel} ×
            </button>
          )}
          {hasSpecificFilter && (
            <button
              onClick={() => {
                setSelectedSubFilter('all');
                setSubFilterSearch('');
                setSelectedCategory('all');
                setCategorySearch('');
                runSearch({
                  ...appliedQuery,
                  selectedSubFilter: 'all',
                  selectedCategory: 'all',
                });
              }}
              className={`px-3 py-1 rounded-full text-xs border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'}`}
            >
              {appliedSpecificFilterLabel}: {appliedCategoryLabel || '-'}{' '}
              {appliedSubCategoryLabel ? `> ${appliedSubCategoryLabel}` : ''} ×
            </button>
          )}
        </div>
      </div>



      {/* Mostrar mensaje de carga */}
      {loading && (
        <div className="flex justify-center py-8">
          <AgentsDirectorySearching
            key={searchLoadingKey}
            label={t.searchLoadingAgents}
            isDark={theme === 'dark'}
          />
        </div>
      )}

      {/* Mostrar mensaje de error */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </div>
          <button
            onClick={() => runSearch()}
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
      {!loading && !loadingMore && !error && listFetchSettled && agents.length === 0 && (
        <div className="text-center py-12">
          <div className={`text-lg ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t.noAgentsFound}
          </div>
        </div>
      )}

      {/* Grid de agentes */}
      {!loading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
            >
              <div
                className={`group relative overflow-hidden rounded-3xl transition-all min-h-[9.5rem] ${
                  theme === 'dark'
                    ? 'bg-zinc-900/80 border border-zinc-700/50'
                    : 'bg-white/80 border border-zinc-200/50'
                }`}
                style={{
                  background: theme === 'dark'
                    ? `linear-gradient(135deg, #facc1515 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, #facc1510 100%)`
                    : `linear-gradient(135deg, #facc1520 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, #facc1515 100%)`,
                  boxShadow: theme === 'dark'
                    ? `0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px #facc1535, inset 0 1px 0 rgba(255,255,255,0.1)`
                    : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px #facc1540, inset 0 1px 0 rgba(255,255,255,0.6)`,
                }}
              >
                <div
                  className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full opacity-5"
                  style={{
                    background: `radial-gradient(circle, #facc15 0%, transparent 70%)`,
                    transform: 'translate(20px, -20px)',
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle, #facc15 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}
                />

                <Link href={`/dashboard/agents/${agent.id}`}>
                  <div className="absolute right-0 top-0 bottom-0 z-20 flex w-4 cursor-pointer items-center justify-center rounded-r-3xl bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-60 transition-opacity hover:opacity-100">
                    <span className="text-lg font-bold text-white opacity-80">+</span>
                  </div>
                </Link>

                <div className="relative z-10 flex gap-3 py-3 pl-3 pr-6 sm:gap-4 sm:pl-4">
                  <div className="flex w-[38%] min-w-0 max-w-[9.5rem] shrink-0 flex-col">
                    <h3
                      className={`mb-2 truncate text-center text-sm font-semibold sm:text-base ${
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      }`}
                      title={agent.name}
                    >
                      {agent.name}
                    </h3>

                    <div className="relative mx-auto aspect-square w-full max-w-[7.5rem] flex-1 min-h-[5.5rem]">
                      <AgentImage
                        src={agent.image_url}
                        alt={agent.name}
                        fill
                        className="object-contain object-center"
                      />
                    </div>

                    <div
                      className={`mt-2 flex min-h-8 flex-wrap items-center justify-center gap-1.5 rounded-xl border px-2 py-1 text-[10px] sm:text-[11px] ${
                        theme === 'dark'
                          ? 'bg-zinc-900/70 border-zinc-700 text-zinc-200'
                          : 'bg-white/85 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: getChainColor(agent.chain) }}
                        />
                        <span className="truncate">{normalizeChainName(agent.chain)}</span>
                      </span>
                      <span className="opacity-50">·</span>
                      {(() => {
                        const realness = parseRealnessStatus(agent.realness_status);
                        const realnessLabel = getRealnessStatusLabel(realness, t) || t.notAvailable;
                        return (
                          <span
                            className="inline-flex min-w-0 items-center gap-1.5"
                            title={realnessLabel}
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: getRealnessStatusColor(realness) }}
                            />
                            <span className="truncate">{realnessLabel}</span>
                          </span>
                        );
                      })()}
                      <span className="opacity-50">·</span>
                      <span
                        className="inline-flex min-w-0 items-center gap-1 truncate font-semibold tabular-nums"
                        style={{
                          color: getHumiMaturityColor(agent.humi_madurity_level, null),
                        }}
                      >
                        <span className="shrink-0 text-[10px] font-medium opacity-80">
                          {t.humiScoreShort}:
                        </span>
                        <span className="truncate">
                          {formatAgentHumiScore(agent.current_humi_score)}
                        </span>
                      </span>
                      {agent.is_dummy === true && (
                        <>
                          <span className="opacity-50">·</span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                            <span className="truncate">{t.dummyLabel}</span>
                          </span>
                        </>
                      )}
                      {agent.has_duplicate_agent === true && (
                        <>
                          <span className="opacity-50">·</span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                            <span className="truncate">{t.duplicateLabel}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5 pr-1">
                    <p
                      className={`line-clamp-4 text-xs leading-snug sm:text-sm ${
                        theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                      }`}
                      title={agent.description || t.noDescription}
                    >
                      {agent.description?.trim() || t.noDescription}
                    </p>

                    <div className="mt-auto space-y-1.5">
                      <div>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                          }`}
                        >
                          {t.agentsDirectoryAiCategoryLabel}
                        </p>
                        <p
                          className={`line-clamp-2 text-xs font-medium sm:text-sm ${
                            theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'
                          }`}
                          title={agent.ai_category_primary || undefined}
                        >
                          {agent.ai_category_primary?.trim() || t.notAvailable}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide ${
                            theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                          }`}
                        >
                          {t.agentsDirectoryAiAnalysisLabel}
                        </p>
                        <p
                          className={`line-clamp-3 text-xs leading-snug sm:text-sm ${
                            theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
                          }`}
                          title={agent.ai_category_purpose || undefined}
                        >
                          {agent.ai_category_purpose?.trim() || t.notAvailable}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {t.searchUpdatingResults}
          </p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-10" />
      </>
      )}
    </div>
  );
}
