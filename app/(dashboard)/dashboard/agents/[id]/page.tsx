import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      <a 
        href="/dashboard/agents" 
        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
      >
        <ArrowLeft size={20} /> Volver al Directorio de Agentes
      </a>

      <div className="flex gap-8">
        <div className="relative w-64 h-64 rounded-3xl overflow-hidden border border-gray-700 flex-shrink-0">
          <Image
            src="https://picsum.photos/id/1015/600/600"
            alt="Agent"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex-1">
          <h1 className="text-5xl font-bold">Trading Oracle Agent</h1>
          <div className="text-7xl font-bold text-emerald-400 mt-4">94★</div>
          <p className="mt-6 text-xl text-gray-300">
            Agente autónomo que ejecuta estrategias DeFi con análisis en tiempo real y oráculos integrados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {['History', 'Usage', 'Measure', 'Information'].map(p => (
          <div key={p} className="bg-[#1a1a1a] p-6 rounded-3xl">
            <div className="text-gray-400">{p}</div>
            <div className="text-4xl font-bold mt-2">23/25</div>
          </div>
        ))}
      </div>
    </div>
  );
}