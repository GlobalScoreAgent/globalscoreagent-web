'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';

const sampleAgents = [
  { agent_id: 111111, name: "Trading Oracle Agent", description: "Agente autónomo que ejecuta estrategias DeFi avanzadas con análisis predictivo", image_url: "https://picsum.photos/id/1015/400/300", humi_score: 94, chain: "Base", created_at: "2024-01-15T10:30:00Z", nonce: 1247, balance: 2.45 },
  { agent_id: 222222, name: "HUMI Analyzer", description: "Analiza y puntúa agentes según el índice HUMI en tiempo real", image_url: "https://picsum.photos/id/201/400/300", humi_score: 50, chain: "Arbitrum", created_at: "2024-02-20T14:15:00Z", nonce: 892, balance: 1.23 },
  { agent_id: 333333, name: "NFT Minting Agent", description: "Gestor inteligente de colecciones NFT con optimización automática", image_url: "https://picsum.photos/id/237/400/300", humi_score: 20, chain: "Ethereum", created_at: "2024-03-10T09:45:00Z", nonce: 456, balance: 0.78 },
  { agent_id: 444444, name: "DeFi Yield Optimizer", description: "Maximiza rendimientos en protocolos DeFi con rebalanceo automático", image_url: "https://picsum.photos/id/1018/400/300", humi_score: 87, chain: "Base", created_at: "2024-01-28T16:20:00Z", nonce: 2156, balance: 5.67 },
  { agent_id: 555555, name: "Liquidity Manager", description: "Gestiona liquidez en AMMs con estrategias avanzadas de market making", image_url: "https://picsum.photos/id/1025/400/300", humi_score: 91, chain: "Ethereum", created_at: "2024-02-05T11:30:00Z", nonce: 1876, balance: 3.89 },
  { agent_id: 666666, name: "Risk Assessment AI", description: "Evalúa riesgos de contratos inteligentes con análisis profundo", image_url: "https://picsum.photos/id/1035/400/300", humi_score: 78, chain: "Polygon", created_at: "2024-03-22T13:10:00Z", nonce: 1234, balance: 2.12 },
  { agent_id: 777777, name: "Cross-Chain Bridge", description: "Facilita transferencias seguras entre diferentes blockchains", image_url: "https://picsum.photos/id/1040/400/300", humi_score: 65, chain: "Arbitrum", created_at: "2024-01-12T08:45:00Z", nonce: 987, balance: 1.56 },
  { agent_id: 888888, name: "Smart Contract Auditor", description: "Audita automáticamente contratos inteligentes en busca de vulnerabilidades", image_url: "https://picsum.photos/id/1045/400/300", humi_score: 82, chain: "Base", created_at: "2024-02-18T15:25:00Z", nonce: 1654, balance: 4.23 },
  { agent_id: 999999, name: "Token Launch Assistant", description: "Ayuda en el lanzamiento de nuevos tokens con distribución justa", image_url: "https://picsum.photos/id/1050/400/300", humi_score: 45, chain: "BNB", created_at: "2024-03-05T12:00:00Z", nonce: 743, balance: 0.95 },
  { agent_id: 101010, name: "Governance Delegate", description: "Participa activamente en la gobernanza de protocolos DeFi", image_url: "https://picsum.photos/id/1055/400/300", humi_score: 73, chain: "Ethereum", created_at: "2024-01-30T17:15:00Z", nonce: 1123, balance: 2.78 },
  { agent_id: 1111111, name: "Yield Farming Bot", description: "Automatiza estrategias de yield farming con rebalanceo dinámico", image_url: "https://picsum.photos/id/1060/400/300", humi_score: 88, chain: "Polygon", created_at: "2024-02-25T10:50:00Z", nonce: 1987, balance: 6.34 },
  { agent_id: 121212, name: "DEX Arbitrage Engine", description: "Ejecuta arbitraje automático entre diferentes exchanges descentralizados", image_url: "https://picsum.photos/id/1065/400/300", humi_score: 55, chain: "Arbitrum", created_at: "2024-03-15T14:30:00Z", nonce: 856, balance: 1.67 },
  { agent_id: 131313, name: "Portfolio Rebalancer", description: "Mantiene la asignación óptima de portafolios cripto automáticamente", image_url: "https://picsum.photos/id/1070/400/300", humi_score: 79, chain: "Base", created_at: "2024-01-08T09:20:00Z", nonce: 1345, balance: 3.45 },
  { agent_id: 141414, name: "Staking Optimizer", description: "Encuentra las mejores oportunidades de staking con rendimientos calculados", image_url: "https://picsum.photos/id/1075/400/300", humi_score: 92, chain: "Ethereum", created_at: "2024-02-12T16:40:00Z", nonce: 2234, balance: 7.89 },
  { agent_id: 151515, name: "Flash Loan Executor", description: "Ejecuta operaciones complejas con flash loans de manera segura", image_url: "https://picsum.photos/id/1080/400/300", humi_score: 38, chain: "BNB", created_at: "2024-03-28T11:15:00Z", nonce: 567, balance: 0.34 },
  { agent_id: 161616, name: "MEV Protector", description: "Protege transacciones contra frontrunning y sandwich attacks", image_url: "https://picsum.photos/id/1085/400/300", humi_score: 85, chain: "Arbitrum", created_at: "2024-01-22T13:55:00Z", nonce: 1789, balance: 4.56 },
  { agent_id: 171717, name: "Liquidity Mining Bot", description: "Participa automáticamente en programas de liquidity mining", image_url: "https://picsum.photos/id/1090/400/300", humi_score: 67, chain: "Polygon", created_at: "2024-02-08T15:10:00Z", nonce: 1098, balance: 2.34 },
  { agent_id: 181818, name: "Options Trading AI", description: "Opera opciones financieras con estrategias de volatilidad", image_url: "https://picsum.photos/id/1095/400/300", humi_score: 71, chain: "Base", created_at: "2024-03-02T10:25:00Z", nonce: 1456, balance: 3.12 },
  { agent_id: 191919, name: "DAO Voting Assistant", description: "Ayuda a miembros de DAO a tomar decisiones informadas", image_url: "https://picsum.photos/id/1100/400/300", humi_score: 59, chain: "Ethereum", created_at: "2024-01-18T12:35:00Z", nonce: 923, balance: 1.89 },
  { agent_id: 202020, name: "Synthetic Asset Creator", description: "Genera activos sintéticos con colateralización automática", image_url: "https://picsum.photos/id/1105/400/300", humi_score: 76, chain: "Arbitrum", created_at: "2024-02-28T14:50:00Z", nonce: 1278, balance: 2.67 },
  { agent_id: 212121, name: "Insurance Protocol Agent", description: "Gestiona pólizas de seguro paramétrico para DeFi", image_url: "https://picsum.photos/id/1110/400/300", humi_score: 43, chain: "BNB", created_at: "2024-03-12T16:05:00Z", nonce: 654, balance: 0.78 },
  { agent_id: 2222222, name: "Prediction Market Bot", description: "Opera en mercados de predicción con análisis de datos", image_url: "https://picsum.photos/id/1115/400/300", humi_score: 89, chain: "Polygon", created_at: "2024-01-05T11:40:00Z", nonce: 2034, balance: 5.43 },
  { agent_id: 232323, name: "Decentralized Exchange", description: "Proporciona liquidez y ejecución de órdenes peer-to-peer", image_url: "https://picsum.photos/id/1120/400/300", humi_score: 95, chain: "Base", created_at: "2024-02-14T09:30:00Z", nonce: 2456, balance: 8.90 },
  { agent_id: 242424, name: "Stablecoin Arbitrage", description: "Mantiene paridad entre stablecoins con arbitraje automático", image_url: "https://picsum.photos/id/1125/400/300", humi_score: 52, chain: "Ethereum", created_at: "2024-03-20T17:45:00Z", nonce: 789, balance: 1.45 },
  { agent_id: 252525, name: "NFT Marketplace Agent", description: "Facilita compraventa de NFTs con precios dinámicos", image_url: "https://picsum.photos/id/1130/400/300", humi_score: 81, chain: "Arbitrum", created_at: "2024-01-25T13:20:00Z", nonce: 1567, balance: 3.78 },
];

function getScoreImage(score: number): string {
  if (score >= 60) return '/index_humi_score_dorado.png';
  if (score >= 30) return '/index_humi_score_naranja.png';
  return '/index_humi_score_rojo.png';
}

function isAdvancedFilter(filterKey: string): boolean {
  return ['searchOasfDomains', 'searchTags', 'searchSkills', 'searchCapabilities'].includes(filterKey);
}

function getSubFilterOptions(): { key: string; label: string }[] {
  return [
    { key: 'all', label: 'All' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];
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

function sortAgents(agents: any[], sortBy: string) {
  return [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created_at':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'humi_score':
        return b.humi_score - a.humi_score; // Descendente para scores
      case 'nonce':
        return b.nonce - a.nonce; // Descendente para nonce
      case 'balance':
        return b.balance - a.balance; // Descendente para balance
      default:
        return 0;
    }
  });
}

export default function AgentsPage() {
  const { t, theme } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('searchGeneral');
  const [selectedSubFilter, setSelectedSubFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaginationDropdownOpen, setIsPaginationDropdownOpen] = useState(false);

  const searchOptions = [
    { key: 'searchGeneral', label: t.searchGeneral },
    { key: 'searchNetwork', label: t.searchNetwork },
    { key: 'searchName', label: t.searchName },
    { key: 'searchDescription', label: t.searchDescription },
    { key: 'searchWallet', label: t.searchWallet },
    { key: 'searchWalletOwner', label: t.searchWalletOwner },
    { key: 'searchMetadata', label: t.searchMetadata },
    { key: 'searchSupportedTrust', label: t.searchSupportedTrust },
    { key: 'searchSkills', label: t.searchSkills },
    { key: 'searchCapabilities', label: t.searchCapabilities },
    { key: 'searchTags', label: t.searchTags },
    { key: 'searchOasfSkills', label: t.searchOasfSkills },
    { key: 'searchOasfDomains', label: t.searchOasfDomains },
    { key: 'searchTechnicalTools', label: t.searchTechnicalTools },
    { key: 'searchTechnicalPrompts', label: t.searchTechnicalPrompts },
    { key: 'searchTechnicalCapabilities', label: t.searchTechnicalCapabilities },
    { key: 'searchServices', label: t.searchServices },
  ];

  const filteredAgents = sampleAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aplicar ordenamiento
  const sortedAgents = sortAgents(filteredAgents, selectedSort);

  // Paginación
  const totalPages = Math.ceil(sortedAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAgents = sortedAgents.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);
    setSelectedSubFilter('all'); // Reset sub-filter when main filter changes
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-zinc-200'
      }`}>
        <div className="flex gap-3">
          {/* Dropdown de filtros principal */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[180px] ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">
                {searchOptions.find(option => option.key === selectedFilter)?.label}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-white border-zinc-300'
              }`}>
                {searchOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      handleFilterChange(option.key);
                      setIsDropdownOpen(false);
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

          {/* Segundo dropdown condicional */}
          {isAdvancedFilter(selectedFilter) && (
            <div className="relative">
              <button
                onClick={() => setIsSubDropdownOpen(!isSubDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors min-w-[140px] ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span className="text-sm">
                  {getSubFilterOptions().find(option => option.key === selectedSubFilter)?.label}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isSubDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSubDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-20 ${
                  theme === 'dark'
                    ? 'bg-zinc-800 border-zinc-700'
                    : 'bg-white border-zinc-300'
                }`}>
                  {getSubFilterOptions().map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSelectedSubFilter(option.key);
                        setIsSubDropdownOpen(false);
                        setCurrentPage(1); // Reset to first page
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
          )}

          {/* Campo de búsqueda */}
          <div className="flex-1 relative">
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

          {/* Dropdown de ordenamiento */}
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
          </div>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {paginatedAgents.map((agent, index) => (
          <motion.div
            key={agent.agent_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={`/dashboard/agents/${agent.agent_id}`}
              className={`group relative rounded-3xl overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-1 block ${
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
                  : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px #facc1540, inset 0 1px 0 rgba(255,255,255,0.6)`
              }}
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

              <div className="relative h-52">
                <Image
                  src={agent.image_url}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Imagen del score con texto superpuesto en esquina superior izquierda */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="relative">
                    <Image
                      src={getScoreImage(agent.humi_score)}
                      alt="HUMI Score"
                      width={85}
                      height={85}
                      className="drop-shadow-lg"
                    />
                    <span className={`absolute inset-0 flex items-center justify-center text-xl font-black ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    } drop-shadow-lg`}>
                      {agent.humi_score}
                    </span>
                  </div>
                </div>

                {/* Cuadro de red en esquina superior derecha */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    theme === 'dark' ? 'bg-zinc-800/80 text-zinc-300' : 'bg-white/80 text-zinc-700'
                  }`}>
                    {agent.chain}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                }`}>
                  {agent.name}
                </h3>
                <p className={`text-sm mt-2 line-clamp-2 ${
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {agent.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Selector de agentes por página y controles de paginación */}
      <div className="flex justify-between items-center mt-8">
        {/* Selector de agentes por página */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
            Mostrar:
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
            agentes por página
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
              Anterior
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
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
