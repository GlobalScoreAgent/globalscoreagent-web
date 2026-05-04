import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = {
    name: "Trading Oracle Agent",
    description: "Agente autónomo especializado en ejecución de estrategias DeFi con análisis en tiempo real y oráculos integrados.",
    image_url: "https://picsum.photos/id/1015/600/600",
    owner_wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    chain: "Base",
    current_humi_stars: 4,
    skills: ["DeFi", "Trading", "Oracle", "Risk Management"],
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/agents" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8">
          <ArrowLeft className="w-5 h-5" /> ← Volver al Directorio de Agentes
        </a>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="flex gap-6">
              <div className="relative w-48 h-48 rounded-3xl overflow-hidden border border-gray-700">
                <Image 
                  src={agent.image_url} 
                  alt={agent.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-5xl font-bold">{agent.name}</h1>
                <div className="text-6xl font-bold text-emerald-400 mt-4">
                  {agent.current_humi_stars}★
                </div>
                <p className="mt-6 text-xl text-gray-300 max-w-md">{agent.description}</p>
              </div>
            </div>
          </div>

          <div className="w-80 bg-[#1a1a1a] p-6 rounded-3xl h-fit">
            <h3 className="font-semibold mb-4">Info rápida</h3>
            <p className="font-mono text-sm break-all text-emerald-400">{agent.owner_wallet}</p>
            <p className="mt-4">Chain: <span className="font-medium">{agent.chain}</span></p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {agent.skills.map((skill) => (
              <span key={skill} className="px-5 py-2 bg-gray-900 rounded-3xl text-sm">{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}