'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronDown, Info, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import { createClient } from '@/utils/supabase/client';



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

function getAdvancedFilterOptions(filterType: string, advancedFilters: Record<string, string[]>): { key: string; label: string }[] {
  // Mapear los tipos de filtro del frontend a los de la base de datos
  const filterMapping: Record<string, string> = {
    'searchOasfDomains': 'OASF Domains',
    'searchTags': 'Tags',
    'searchSkills': 'Skills & Capabilities',
    'searchCapabilities': 'Skills & Capabilities'
  };

  const dbFilterType = filterMapping[filterType] || filterType;
  const values = advancedFilters[dbFilterType] || [];
  const options = [{ key: 'all', label: 'Todos' }];
  values.forEach(value => {
    options.push({ key: value, label: value });
  });
  return options;
}

function getSortOptions(): { key: string; label: string }[] {
  return [
    { key: 'name', label: 'sortName' },
    { key: 'created_at', label: 'sortCreatedDate' },
    { key: 'humi_score', label: 'sortHumiScore' },
    { key: 'nonce', label: 'sortNonce' },
    { key: 'balance', label: 'sortBalance' },
  ];
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

export default function AgentsPage() {
  const { t, theme } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpenFilter, setSelectedOpenFilter] = useState('searchGeneral');
  const [selectedSpecificFilter, setSelectedSpecificFilter] = useState('searchNetwork');
  const [selectedSubFilter, setSelectedSubFilter] = useState('all');
  const [subFilterSearch, setSubFilterSearch] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isOpenDropdownOpen, setIsOpenDropdownOpen] = useState(false);
  const [isSpecificDropdownOpen, setIsSpecificDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaginationDropdownOpen, setIsPaginationDropdownOpen] = useState(false);

  // Estados para datos de base de datos
  const [chains, setChains] = useState<any[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string[]>>({});
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // Cargar datos de base de datos al montar
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
          .select('filter, values');

        if (error) {
          console.error('Error loading advanced filters:', error);
          setAdvancedFilters({});
        } else {
          // Procesar los datos para crear el objeto de filtros
          const filters: Record<string, string[]> = {};
          (data || []).forEach((item: any) => {
            try {
              let values: string[];

              // Si ya es un array, usarlo directamente
              if (Array.isArray(item.values)) {
                values = item.values;
              }
              // Si es un string, intentar parsearlo
              else if (typeof item.values === 'string') {
                const cleanString = item.values.trim();

                // Si parece un JSON array válido, parsearlo
                if (cleanString.startsWith('[') && cleanString.endsWith(']')) {
                  values = JSON.parse(cleanString);
                }
                // Si no es JSON pero parece una lista separada por comas
                else if (cleanString.includes(',')) {
                  values = cleanString.split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
                }
                // Si es un solo valor, convertirlo a array
                else {
                  values = [cleanString];
                }
              } else {
                values = [];
              }

              if (Array.isArray(values)) {
                filters[item.filter] = values;
              }
            } catch (parseError) {
              console.error('Error parsing filter values for', item.filter, ':', parseError);
              console.log('Raw value:', item.values);
              // En caso de error, intentar usar el valor como array vacío
              filters[item.filter] = [];
            }
          });
          setAdvancedFilters(filters);
        }
      } catch (error) {
        console.error('Error loading advanced filters:', error);
        setAdvancedFilters({});
      }
    };

    const loadInitialAgents = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. Cargar chains primero (si no están cacheadas)
        let chainsData = chains;
        if (chains.length === 0) {
          const { data: newChainsData, error: chainsError } = await supabase
            .schema('web_dashboard')
            .from('chains')
            .select('id, short_name');

          if (chainsError) {
            console.error('Error loading chains:', chainsError);
          } else if (newChainsData) {
            chainsData = newChainsData;
            setChains(newChainsData); // Cachear para futuras consultas
          }
        }

        // 2. Cargar agentes con filtros de calidad
        const { data: agentsData, error: agentsError } = await supabase
          .schema('web_dashboard')
          .from('agents')
          .select('id, chain_id, name, description, image_url, current_humi_score, on_chain_created_at')
          .gt('current_humi_score', 0)  // Solo agentes con HUMI score > 0
          .neq('name', 'Unnamed Agent')  // Excluir agentes sin nombre válido
          .order('on_chain_created_at', { ascending: false })
          .limit(20);

        if (agentsError) {
          console.error('Error loading agents:', agentsError);
          setAgents([]);
          return;
        }

        // 3. Mapear agentes con chains resueltas
        const mappedAgents = (agentsData || []).map((agent: any) => ({
          agent_id: agent.id,
          chain: chainsData.find(c => c.id === agent.chain_id)?.short_name || 'Unknown',
          on_chain_id: null, // No cargado inicialmente
          created_at: agent.on_chain_created_at,
          name: agent.name,
          description: agent.description,
          image_url: agent.image_url || '/agent_directory_default.jpg',
          owner_wallet: null, // No cargado inicialmente
          searchable_metadata: null, // No cargado inicialmente
          supported_trust: null, // No cargado inicialmente
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
          transactional_wallets: null, // No cargado inicialmente
          humi_score: agent.current_humi_score
        }));

        setAgents(mappedAgents);
      } catch (error) {
        console.error('Error loading agents:', error);
        setError('Error al cargar agentes');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    loadChains();
    loadAdvancedFilters();
    loadInitialAgents();
  }, []);

  // Opciones de búsqueda abierta (solo texto)
  const openSearchOptions = [
    { key: 'searchGeneral', label: t.searchGeneral },
    { key: 'searchName', label: t.searchName },
    { key: 'searchDescription', label: t.searchDescription },
    { key: 'searchWallet', label: t.searchWallet },
    { key: 'searchWalletOwner', label: t.searchWalletOwner },
    { key: 'searchMetadata', label: t.searchMetadata },
    { key: 'searchSupportedTrust', label: t.searchSupportedTrust },
    { key: 'searchOasfSkills', label: t.searchOasfSkills },
    { key: 'searchTechnicalTools', label: t.searchTechnicalTools },
    { key: 'searchTechnicalPrompts', label: t.searchTechnicalPrompts },
    { key: 'searchTechnicalCapabilities', label: t.searchTechnicalCapabilities },
    { key: 'searchServices', label: t.searchServices },
  ];

  // Opciones de filtros específicos (con sub-dropdown)
  const specificFilterOptions = [
    { key: 'searchNetwork', label: t.searchNetwork },
    { key: 'searchTags', label: t.searchTags },
    { key: 'searchSkills', label: t.searchSkills },
    { key: 'searchCapabilities', label: t.searchCapabilities },
    { key: 'searchOasfDomains', label: t.searchOasfDomains },
  ];

  // Filtrar agentes (por ahora solo búsqueda básica, luego implementaremos filtros avanzados)
  const filteredAgents = agents.filter((agent: any) => {
    // Filtro de búsqueda por texto (siempre activo)
    const matchesSearch = searchTerm === '' ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro específico por red cuando se selecciona "Buscar por red"
    let matchesSpecificFilter = true;
    if (selectedSpecificFilter === 'searchNetwork' && selectedSubFilter !== 'all') {
      // Encontrar el nombre de la cadena correspondiente al ID seleccionado
      const selectedChain = chains.find(chain => chain.id.toString() === selectedSubFilter);
      matchesSpecificFilter = selectedChain ? agent.chain === selectedChain.short_name : false;
    }

    return matchesSearch && matchesSpecificFilter;
  });

  // Aplicar ordenamiento
  const sortedAgents = sortAgents(filteredAgents, selectedSort, sortDirection);

  // Paginación
  const totalPages = Math.ceil(sortedAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgents = sortedAgents.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Obtener opciones filtradas para el sub-dropdown con búsqueda
  const getFilteredSubOptions = () => {
    const allOptions = selectedSpecificFilter === 'searchNetwork'
      ? getNetworkOptions(chains)
      : getAdvancedFilterOptions(selectedSpecificFilter, advancedFilters);

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
          <div className="relative">
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
            <div className="relative">
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
                setSelectedSpecificFilter('searchNetwork');
                setSelectedSubFilter('all');
                setSubFilterSearch('');
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
          <div className="relative">
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

          {/* Campo de búsqueda inteligente para sub-filtros */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Buscar ${specificFilterOptions.find(option => option.key === selectedSpecificFilter)?.label.toLowerCase() || 'opciones'}...`}
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
              className={`px-4 py-3 rounded-xl border outline-none transition-colors min-w-[200px] ${
                theme === 'dark'
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
                    onClick={() => handleSubFilterSelect(option.key, option.label)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {paginatedAgents.map((agent, index) => (
            <motion.div
              key={agent.agent_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                onClick={() => toggleFlip(agent.agent_id)}
                className={`group relative rounded-3xl overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-64 ${
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
                      <Image
                        src={agent.image_url}
                        alt={agent.name}
                        fill
                        className="object-contain object-center"
                        unoptimized
                      />

                      {/* HUMI Score Status - Esquina superior derecha */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {agent.humi_score || 'N/A'}
                        </div>
                      </div>

                      {/* Chain Name - Esquina superior izquierda */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          theme === 'dark' ? 'bg-zinc-800/80 text-zinc-300' : 'bg-white/80 text-zinc-700'
                        }`}>
                          {agent.chain}
                        </div>
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
                      <div className="space-y-3 text-sm pr-2">
                        {/* Descripción truncada */}
                        <div className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                          <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>📝</span>
                          <span className="ml-2">
                            {agent.description ? agent.description.substring(0, 80) + (agent.description.length > 80 ? '...' : '') : 'Sin descripción'}
                          </span>
                        </div>

                        {/* Fecha de creación */}
                        <div className="flex items-center gap-2">
                          <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>📅</span>
                          <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                            {agent.created_at ? new Date(agent.created_at).toLocaleDateString('es-ES') : 'N/A'}
                          </span>
                        </div>

                        {/* Wallets en la misma línea */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>👤</span>
                            <span className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} font-mono text-xs`}>
                              {agent.owner_wallet ? `${agent.owner_wallet.substring(0, 6)}...${agent.owner_wallet.substring(agent.owner_wallet.length - 4)}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>🤖</span>
                            <span className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} font-mono text-xs`}>
                              {agent.transactional_wallets ? `${agent.transactional_wallets.substring(0, 6)}...${agent.transactional_wallets.substring(agent.transactional_wallets.length - 4)}` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Nonce */}
                        <div className="flex items-center gap-2">
                          <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>🔢</span>
                          <span className={theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}>
                            Nonce: {agent.nonce || 'N/A'}
                          </span>
                        </div>

                        {/* Tags principales */}
                        <div className="flex items-start gap-2">
                          <span className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`}>🏷️</span>
                          <div className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} text-xs`}>
                            <span className="mr-1">Tags:</span>
                            {agent.tags_filters && Array.isArray(agent.tags_filters) && agent.tags_filters.length > 0
                              ? agent.tags_filters.slice(0, 3).join(', ')
                              : t.noTags
                            }
                          </div>
                        </div>

                        {/* Skills principales */}
                        <div className="flex items-start gap-2">
                          <span className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} mt-0.5`}>⚡</span>
                          <div className={`${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'} text-xs`}>
                            <span className="mr-1">Skills:</span>
                            {agent.skills_filters && Array.isArray(agent.skills_filters) && agent.skills_filters.length > 0
                              ? agent.skills_filters.slice(0, 2).join(', ')
                              : t.noSkills
                            }
                          </div>
                        </div>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
