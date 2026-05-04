'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';

interface Agent {
  id: number;
  agent_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  owner_wallet: string;
  humi_score: number | null;
  chain: string;
  skills: string[];
  capabilities: string[];
  supported_trust: string[];
  pillar_history: number;
  pillar_usage: number;
  pillar_measure: number;
  pillar_information: number;
}

const sampleAgents: Agent[] = [
  {
    id: 1,
    agent_id: 111111,
    name: "Trading Oracle Agent",
    description: "Agente autónomo que ejecuta estrategias DeFi con análisis en tiempo real.",
    image_url: "https://picsum.photos/id/1015/400/300",
    owner_wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    humi_score: 94,
    chain: "Base",
    skills: ["DeFi", "Trading", "Oracle"],
    capabilities: ["x402", "MCP"],
    supported_trust: ["ERC-8004", "DID"],
    pillar_history: 23,
    pillar_usage: 22,
    pillar_measure: 21,
    pillar_information: 24,
  },
  {
    id: 2,
    agent_id: 222222,
    name: "HUMI Analyzer",
    description: "Analiza y puntúa agentes según el índice HUMI en tiempo real.",
    image_url: "https://picsum.photos/id/201/400/300",
    owner_wallet: "0x8aA...f3e",
    humi_score: 87,
    chain: "Arbitrum",
    skills: ["Analytics", "Scoring"],
    capabilities: ["API", "Web"],
    supported_trust: ["ERC-8004"],
    pillar_history: 20,
    pillar_usage: 19,
    pillar_measure: 24,
    pillar_information: 22,
  },
  {
    id: 3,
    agent_id: 333333,
    name: "NFT Minting Agent",
    description: "Gestor inteligente de colecciones NFT con verificación automática.",
    image_url: "https://picsum.photos/id/237/400/300",
    owner_wallet: "0x1a2b...cdef",
    humi_score: 91,
    chain: "Ethereum",
    skills: ["NFT", "Minting"],
    capabilities: ["Web3"],
    supported_trust: ["ERC-8004"],
    pillar_history: 22,
    pillar_usage: 21,
    pillar_measure: 23,
    pillar_information: 25,
  },
];

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const searchTypes = [
    'General', 'Nombre', 'Descripción', 'Wallet', 'Owner Wallet',
    'Supported Trust', 'Skills', 'Capabilities', 'Tags', 'OASF Domains'
  ];

  const filteredAgents = sampleAgents.filter(agent => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    if (searchType === 'general') {
      return (
        agent.name.toLowerCase().includes(term) ||
        (agent.description?.toLowerCase().includes(term) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-[#111111] text-white">
      {/* Sidebar de navegación */}
      <div className="w-64 border-r border-gray-800 bg-[#1a1a1a] flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight">GlobalScore</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-800">📊 Dashboard</a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-800">🤖 Agentes</a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-800">📈 HUMI Index</a>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 px-8 flex items-center justify-between bg-[#111111]">
          <h2 className="text-3xl font-semibold">Directorio de Agentes</h2>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-3xl border border-gray-700"
          >
            {isFilterOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            <span className="text-sm font-medium">{isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
          </button>
        </header>

        {isFilterOpen && (
          <div className="border-b border-gray-800 bg-[#1a1a1a] p-6">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center bg-gray-900 rounded-3xl border border-gray-700 focus-within:border-emerald-500 transition">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="bg-transparent border-0 text-sm px-6 py-4 outline-none text-gray-300"
                >
                  {searchTypes.map((type) => (
                    <option key={type} value={type.toLowerCase().replace(/\s+/g, '')}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Buscar agentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-4 outline-none text-lg placeholder-gray-500"
                />
                <button className="mr-4 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-3xl flex items-center gap-2">
                  <Search className="w-5 h-5" /> Buscar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de agentes */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.agent_id}`}
                className="group bg-[#1a1a1a] border border-gray-800 rounded-3xl overflow-hidden hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="relative h-48">
                  <Image 
                    src={agent.image_url || ''} 
                    alt={agent.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 right-4 bg-black/80 text-emerald-400 px-4 py-1 rounded-2xl text-xl font-bold">
                    {agent.humi_score}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{agent.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{agent.chain}</span>
                    <span className="font-mono text-gray-400 truncate max-w-[140px]">{agent.owner_wallet}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}