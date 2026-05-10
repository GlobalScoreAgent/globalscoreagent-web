// app/(dashboard)/dashboard/page.tsx
// Versión final corregida - Tres cards + carrete full-width debajo

'use client';

import { useLanguage } from './components/LanguageContext';
import AnimatedCounter from './components/AnimatedCounter';
import { DashboardChainCards } from '@/components/dashboard/DashboardChainCards';
import { DashboardOverviewInsightCard } from '@/components/dashboard/DashboardOverviewInsightCard';
import type { DashboardChainRow } from '@/lib/dashboardChains';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Componente de navegación de estadísticas
function StatsNavigator({ currentStats, isDark, t }: any) {
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    {
      key: 'total_agents',
      label: t.registeredAgents,
      description: t.totalAgentsDescription,
      image: '/dashboard_registered_symbol.png',
      color: '#facc15'
    },
    {
      key: 'total_agents_active',
      label: t.activeAgents,
      description: t.activeAgentsDescription,
      image: '/dashboard_active_symbol.png',
      color: '#22c55e'
    },
    {
      key: 'total_agents_with_feedbacks',
      label: t.agentsWithFeedback,
      description: t.agentsWithFeedbackDescription,
      image: '/dashboard_feedback_symbol.png',
      color: '#3b82f6'
    },
    {
      key: 'wallet_monitored',
      label: t.monitoredWallets,
      description: t.monitoredWalletsDescription,
      image: '/dashboard_wallets_symbol.png',
      color: '#a855f7'
    }
  ];

  const current = stats[currentStat];

  return (
    <div className="flex flex-col items-center gap-8 h-full">
      {/* Carta principal más compacta (sin sello) */}
      <motion.div
        key={currentStat}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-3xl p-8 transition-all hover:scale-[1.02] hover:-translate-y-1 flex-1 flex flex-col relative overflow-hidden backdrop-blur-sm ${isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'}`}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${current.color}15 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, ${current.color}10 100%)`
            : `linear-gradient(135deg, ${current.color}20 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, ${current.color}15 100%)`,
          boxShadow: isDark
            ? `0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${current.color}35, inset 0 1px 0 rgba(255,255,255,0.1)`
            : `0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px ${current.color}40, inset 0 1px 0 rgba(255,255,255,0.6)`
        }}
      >
        {/* Elemento decorativo sutil */}
        <div
          className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
          style={{
            background: `radial-gradient(circle, ${current.color} 0%, transparent 70%)`,
            transform: 'translate(20px, -20px)'
          }}
        />

        {/* Patrón de puntos sutil */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle, ${current.color} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-9xl font-black ${isDark ? 'text-white' : 'text-zinc-900'}`} suppressHydrationWarning>
            <AnimatedCounter end={currentStats[current.key]} />
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
          <div className={`px-4 py-2 rounded-2xl text-sm font-medium ${isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-amber-400/20 text-amber-600'}`}>
            {t.erc8004Label}
          </div>
          <div className={`px-4 py-2 rounded-2xl text-sm font-medium ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
            {t.realTimeLabel}
          </div>
          <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-500/20 text-blue-600'}`}>
            {current.label}
          </div>
        </div>
      </motion.div>

      {/* Controles de navegación */}
      <div className="flex gap-4">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={() => setCurrentStat(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentStat === index
                ? 'bg-amber-400 scale-125 shadow-lg'
                : `bg-zinc-600 hover:bg-zinc-500 ${isDark ? 'hover:bg-zinc-400' : 'hover:bg-zinc-500'}`
            }`}
            style={{
              backgroundColor: currentStat === index ? stat.color : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const { t, theme, lang } = useLanguage();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<any>(null);
  const [dashboardChains, setDashboardChains] = useState<DashboardChainRow[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const [statsRes, chainsRes] = await Promise.all([
        supabase
          .schema('web_dashboard')
          .from('main_stadistics')
          .select('*')
          .order('calculated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .schema('web_dashboard')
          .from('chains')
          .select(
            'chain_id,name,short_name,logo_file_name,agent_stats_information,statistics_agent_last_30_days,statistics_agent_monthly,humi_distribution,metadata_distribution,owner_stats_information'
          )
          .order('name'),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (chainsRes.data) setDashboardChains(chainsRes.data as DashboardChainRow[]);
    };

    void load();
  }, []);

  const defaultStats = {
    total_agents: 1350,
    total_agents_active: 890,
    total_agents_with_feedbacks: 623,
    wallet_monitored: 2450,
    humi_index_distribution: {
      "0-10": 45,
      "10-30": 135,
      "30-60": 270,
      "60-80": 405,
      "80-100": 495,
    },
    agent_metadata_distribution: {
      "Mala": { count: 45, percentage: 3 },
      "Baja": { count: 105, percentage: 7 },
      "Regular": { count: 300, percentage: 20 },
      "Bueno": { count: 450, percentage: 30 },
      "Excelente": { count: 375, percentage: 25 },
      "Elite": { count: 225, percentage: 15 },
    },
  };

  // Función para transformar datos de metadata richness
  const transformMetadataData = (rawData: any) => {
    if (!rawData) return defaultStats.agent_metadata_distribution;

    const transformed: any = {};
    const total = Object.values(rawData).reduce((sum: number, value: any) => sum + (value || 0), 0);

    // Mapear nombres con rangos a nombres limpios
    const nameMapping: { [key: string]: string } = {
      'Mala (0-10)': 'Mala',
      'Baja (10-30)': 'Baja',
      'Regular (30-50)': 'Regular',
      'Buena (50-70)': 'Bueno',
      'Excelente (70-90)': 'Excelente',
      'Elite (90-100)': 'Elite'
    };

    Object.entries(rawData).forEach(([key, value]: [string, any]) => {
      const cleanName = nameMapping[key];
      if (cleanName) {
        transformed[cleanName] = {
          count: value || 0,
          percentage: total > 0 ? ((value || 0) / total) * 100 : 0
        };
      }
    });

    return transformed;
  };


  // Merge stats from database with default stats, ensuring all fields are present
  const currentStats = {
    ...defaultStats,
    ...stats,
    humi_index_distribution: {
      ...defaultStats.humi_index_distribution,
      ...(stats?.humi_index_distribution || {})
    },
    agent_metadata_distribution: transformMetadataData(stats?.agent_metadata_richness)
  };

  return (
    <div className={`min-h-full ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="max-w-screen-2xl mx-auto">
        {/* Estadísticas principales */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          <div className="flex min-h-0 min-w-0 lg:col-span-5">
            <StatsNavigator currentStats={currentStats} isDark={isDark} t={t} />
          </div>
          <div className="flex min-h-0 min-w-0 lg:col-span-7">
            <DashboardOverviewInsightCard
              isDark={isDark}
              t={t}
              currentStats={{
                humi_index_distribution: currentStats.humi_index_distribution,
                agent_metadata_distribution: currentStats.agent_metadata_distribution,
              }}
              agentNonce={stats?.agent_nonce}
            />
          </div>
        </div>

        {/* Chains dinámicas (web_dashboard.chains) */}
        <div className="mb-16">
          <DashboardChainCards chains={dashboardChains} isDark={isDark} t={t} lang={lang} />
        </div>

      </div>
    </div>
  );
}