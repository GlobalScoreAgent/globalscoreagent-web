'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';

const sampleAgents = [
  { agent_id: 111111, name: "Trading Oracle Agent", description: "Agente autónomo que ejecuta estrategias DeFi...", image_url: "https://picsum.photos/id/1015/400/300", humi_score: 94, chain: "Base" },
  { agent_id: 222222, name: "HUMI Analyzer", description: "Analiza y puntúa agentes según el índice HUMI...", image_url: "https://picsum.photos/id/201/400/300", humi_score: 87, chain: "Arbitrum" },
  { agent_id: 333333, name: "NFT Minting Agent", description: "Gestor inteligente de colecciones NFT...", image_url: "https://picsum.photos/id/237/400/300", humi_score: 91, chain: "Ethereum" },
];

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const filteredAgents = sampleAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Directorio de Agentes</h1>
        
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl"
        >
          {isFilterOpen ? <X size={18} /> : <Filter size={18} />}
          {isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      {isFilterOpen && (
        <div className="bg-[#1a1a1a] p-4 rounded-2xl">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 outline-none focus:border-emerald-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Link
            key={agent.agent_id}
            href={`/dashboard/agents/${agent.agent_id}`}
            className="group bg-[#1a1a1a] border border-gray-800 rounded-3xl overflow-hidden hover:border-emerald-500 transition-all"
          >
            <div className="relative h-52">
              <Image
                src={agent.image_url}
                alt={agent.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-4 right-4 bg-black/80 text-emerald-400 px-4 py-1 rounded-2xl text-2xl font-bold">
                {agent.humi_score}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold">{agent.name}</h3>
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">{agent.description}</p>
              <p className="text-xs text-gray-500 mt-4">{agent.chain}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}