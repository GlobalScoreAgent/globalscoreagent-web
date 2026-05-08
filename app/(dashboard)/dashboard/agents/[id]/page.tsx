"use client";

import Image from 'next/image';
import { ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

// ==================== MOCK DATA ====================
const mockAgent = {
  id: "1",
  name: "Trading Oracle Agent",
  description: "Agente autónomo que ejecuta estrategias DeFi con análisis en tiempo real y oráculos integrados.",
  image_url: "https://picsum.photos/id/1015/600/600",
  humi_score: 94,

  // On Chain Data
  chain_id: "base",
  chain_name: "Base",
  on_chain_id: "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f",
  wallet_chain_register: "0x1234567890abcdef1234567890abcdef12345678",
  on_chain_created_at: "2024-11-15T10:23:45Z",
  owner_wallet: "0xabcdef1234567890abcdef1234567890abcdef12",
  owner_since_at: "2024-11-15T10:23:45Z",
  owner_changes: 1,
  profiles: { twitter: "@tradingoracle", telegram: "t.me/tradingoracle" },
  transactional_wallets: [{ address: "0x...", chain: "base", nonce: 245, balance: "12.45" }],

  // Metadata
  has_x402: true,
  supported_trust: { "EAS": true, "Verifiable Credentials": true },
  skills: ["DeFi", "Trading", "Oracle"],
  capabilities: ["Autonomous Execution", "Real-time Analysis"],
  tags: ["defi", "oracle", "trading"],
  oasf_skills: ["market-analysis", "risk-management"],
  oasf_domains: ["finance", "blockchain"],
  technical_tools: ["ethers.js", "TheGraph"],
  technical_prompts: ["Analyze market sentiment"],
  technical_capabilities: ["on-chain execution"],
  services: [{ type: "MCP", endpoint: "https://api..." }],

  // Transactional
  nonce_current: 245,
  balance_current: "12.45",
  nonce_history: [
    { date: "2025-04-01", value: 180 },
    { date: "2025-04-15", value: 210 },
    { date: "2025-05-01", value: 245 },
  ],
  balance_history: [
    { date: "2025-04-01", value: 8.2 },
    { date: "2025-04-15", value: 10.8 },
    { date: "2025-05-01", value: 12.45 },
  ],

  // Feedback Data
  comments_summary: { total: 47, positive: 41, avg_score: 4.6 },
  attestations_summary: { total: 23, avg_score: 92 },
  external_audit_summary: { audits: 3, avg_score: 88, last_audit: "2025-03-20" },
  identity_analysis_summary: { stage: "Advanced", score: 96, soul_prompt_complexity: "High" },
  on_chain_execution_summary: { executions: 156, success_rate: "98%" },
  on_chain_feedback_summary: { feedbacks: 89, avg_score: 4.8 },
  protocol_activity_summary: { activities: 34, with_payments: 12, avg_score: 91 },
};

export default function AgentDetailPage() {
  const [activeMetadataTab, setActiveMetadataTab] = useState<keyof typeof mockAgent>('supported_trust');
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<keyof typeof mockAgent>('comments_summary');

  const metadataOptions = [
    'supported_trust', 'skills', 'capabilities', 'tags',
    'oasf_skills', 'oasf_domains', 'technical_tools',
    'technical_prompts', 'technical_capabilities', 'services'
  ] as const;

  const feedbackOptions = [
    'comments_summary', 'attestations_summary', 'external_audit_summary',
    'identity_analysis_summary', 'on_chain_execution_summary',
    'on_chain_feedback_summary', 'protocol_activity_summary'
  ] as const;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Puedes reemplazar esto por un toast más bonito después
    alert('✅ Copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <a 
          href="/dashboard/agents" 
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft size={20} /> Volver al Directorio de Agentes
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="relative w-80 h-80 rounded-3xl overflow-hidden border border-gray-700 flex-shrink-0 shadow-2xl">
            <Image
              src={mockAgent.image_url}
              alt={mockAgent.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 pt-4">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-bold tracking-tight">{mockAgent.name}</h1>
              <div className="px-4 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-full border border-emerald-500/30">
                {mockAgent.chain_name}
              </div>
            </div>

            <div className="flex items-baseline gap-4 mt-4">
              <div className="text-7xl font-bold text-emerald-400">{mockAgent.humi_score}★</div>
              <div className="text-2xl text-gray-400">Humi Score</div>
            </div>

            <p className="mt-6 text-xl text-gray-300 leading-relaxed max-w-3xl">
              {mockAgent.description}
            </p>

            <div className="flex gap-4 mt-8">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                🌐 Web
              </a>
              <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                ✉️ Email
              </a>
            </div>
          </div>
        </div>

        {/* PILLAR SCORES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'History', score: '23/25' },
            { label: 'Usage', score: '21/25' },
            { label: 'Measure', score: '24/25' },
            { label: 'Information', score: '22/25' },
          ].map((pillar) => (
            <div key={pillar.label} className="bg-[#1a1a1a] p-6 rounded-3xl border border-gray-800">
              <div className="text-gray-400 text-sm">{pillar.label}</div>
              <div className="text-4xl font-bold mt-2 text-white">{pillar.score}</div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ON CHAIN DATA */}
          <div className="xl:col-span-5 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">On Chain Data</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl">🔗</div>
                <div>
                  <div className="text-sm text-gray-400">Chain</div>
                  <div className="font-medium">{mockAgent.chain_name}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">On Chain ID</div>
                <div className="font-mono text-sm break-all flex items-center gap-2 mt-1">
                  {mockAgent.on_chain_id}
                  <button onClick={() => copyToClipboard(mockAgent.on_chain_id)} className="text-gray-400 hover:text-white">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-400">Created At</div>
                  <div className="mt-1">{formatDate(mockAgent.on_chain_created_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Owner Changes</div>
                  <div className="mt-1 font-medium">{mockAgent.owner_changes}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Owner Wallet</div>
                <div className="font-mono text-sm break-all flex items-center gap-2 mt-1">
                  {mockAgent.owner_wallet}
                  <button onClick={() => copyToClipboard(mockAgent.owner_wallet)} className="text-gray-400 hover:text-white">
                    <Copy size={16} />
                  </button>
                  <a href="#" className="text-emerald-400"><ExternalLink size={16} /></a>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400">Owner Since</div>
                <div className="mt-1">{formatDate(mockAgent.owner_since_at)}</div>
              </div>
            </div>
          </div>

          {/* METADATA INFORMATION */}
          <div className="xl:col-span-7 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Metadata Information</h2>
              <div className={`px-4 py-1.5 rounded-full text-sm font-medium ${mockAgent.has_x402 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {mockAgent.has_x402 ? '✅ x402 Enabled' : 'x402 Disabled'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
              {metadataOptions.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveMetadataTab(key)}
                  className={`px-5 py-2 rounded-2xl text-sm transition-all ${
                    activeMetadataTab === key 
                      ? 'bg-white text-black font-medium' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {key.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 overflow-auto max-h-[520px]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {JSON.stringify(mockAgent[activeMetadataTab], null, 2)}
              </pre>
            </div>
          </div>

          {/* TRANSACTIONAL DATA */}
          <div className="xl:col-span-7 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">Transactional Data</h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-sm text-gray-400">Nonce Actual</div>
                <div className="text-5xl font-bold mt-2">{mockAgent.nonce_current}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Balance Actual</div>
                <div className="text-5xl font-bold mt-2 text-emerald-400">{mockAgent.balance_current} ETH</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] p-6 rounded-2xl h-80 flex items-center justify-center border border-dashed border-gray-700">
                [Gráfico de Línea - Nonce History]
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-2xl h-80 flex items-center justify-center border border-dashed border-gray-700">
                [Gráfico de Línea - Balance History]
              </div>
            </div>
          </div>

          {/* FEEDBACK DATA */}
          <div className="xl:col-span-5 bg-[#111111] rounded-3xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6">Feedback Data</h2>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-4">
              {feedbackOptions.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFeedbackTab(key)}
                  className={`px-5 py-2 rounded-2xl text-sm transition-all ${
                    activeFeedbackTab === key 
                      ? 'bg-white text-black font-medium' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {key.replace('_summary', '').replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-700 overflow-auto max-h-[520px]">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {JSON.stringify(mockAgent[activeFeedbackTab], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}