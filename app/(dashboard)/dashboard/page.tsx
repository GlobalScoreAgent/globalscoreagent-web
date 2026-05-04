// app/(dashboard)/dashboard/page.tsx
// Versión final corregida - Tres cards + carrete full-width debajo

'use client';

import { useLanguage } from './components/LanguageContext';
import AnimatedCounter from './components/AnimatedCounter';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import CertificationsReel from './components/CertificationsReel';

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

// Componente de Network Cards - TARJETAS CUADRADAS MÁS PEQUEÑAS
function NetworkCards({ isDark, t, chainStats }: any) {
  const baseNetworks = [
    {
      name: 'BNB',
      fullName: 'BNB Chain',
      logoFile: 'BNB_logo.png',
      color: '#F3BA2F',
      stats: {
        totalAgents: 1350,
        totalOwners: 890,
        activeAgents: 756,
        withFeedbacks: 423
      }
    },
    {
      name: 'Base',
      fullName: 'Base',
      logoFile: 'Base_logo.png',
      color: '#0052FF',
      stats: {
        totalAgents: 980,
        totalOwners: 654,
        activeAgents: 587,
        withFeedbacks: 312
      }
    },
    {
      name: 'ETH',
      fullName: 'Ethereum',
      logoFile: 'ETH_logo.png',
      color: '#627EEA',
      stats: {
        totalAgents: 2150,
        totalOwners: 1420,
        activeAgents: 1289,
        withFeedbacks: 756
      }
    },
    {
      name: 'ARB',
      fullName: 'Arbitrum One',
      logoFile: 'Arbitrum_logo.png',
      color: '#28A0F0',
      stats: {
        totalAgents: 320,
        totalOwners: 198,
        activeAgents: 145,
        withFeedbacks: 89
      }
    },
    {
      name: 'POL',
      fullName: 'Polygon',
      logoFile: 'Polygon_logo.png',
      color: '#8247E5',
      stats: {
        totalAgents: 445,
        totalOwners: 267,
        activeAgents: 201,
        withFeedbacks: 134
      }
    }
  ];

  // Función para actualizar estadísticas de redes con datos reales
  const updateNetworksWithRealData = (networks: any[], chainStats: any[]) => {
    if (!chainStats || !Array.isArray(chainStats)) return networks;

    // Mapeo de chain_id a nombre de red en el componente
    const chainMapping: { [key: number]: string } = {
      56: 'BNB',      // BNB Chain
      8453: 'Base',   // Base Mainnet
      1: 'ETH',       // Ethereum Mainnet
      42161: 'ARB',   // Arbitrum-One
      137: 'POL'      // Polygon Mainnet
    };

    return networks.map(network => {
      const chainData = chainStats.find(chain =>
        chainMapping[chain.chain_id] === network.name
      );

      if (chainData) {
        return {
          ...network,
          stats: {
            totalAgents: chainData.agent_total || 0,
            totalOwners: chainData.owner_total || 0,
            activeAgents: chainData.agent_active || 0,
            withFeedbacks: chainData.agent_with_feedback || 0
          }
        };
      }

      return network; // Mantener datos por defecto si no hay datos
    });
  };

  const networks = updateNetworksWithRealData(baseNetworks, chainStats);

  const mainNetworks = networks.slice(0, 3);
  const sideNetworks = networks.slice(3);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna izquierda - 3 tarjetas horizontales (compactas) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {mainNetworks.map((network, index) => (
            <motion.div
              key={network.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`rounded-2xl p-5 transition-all hover:scale-[1.02] hover:-translate-y-1 relative overflow-hidden backdrop-blur-sm ${
                isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'
              }`}
              style={{
                background: isDark
                  ? `linear-gradient(135deg, ${network.color}15 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, ${network.color}10 100%)`
                  : `linear-gradient(135deg, ${network.color}20 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, ${network.color}15 100%)`,
                boxShadow: isDark
                  ? `0 12px 40px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${network.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : `0 12px 40px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px ${network.color}35, inset 0 1px 0 rgba(255,255,255,0.6)`
              }}
            >
              {/* Elementos decorativos sutiles */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${network.color} 0%, transparent 70%)`,
                  transform: 'translate(16px, -16px)'
                }}
              />

              {/* Líneas decorativas */}
              <div className="absolute top-4 left-4 right-4 h-px opacity-10" style={{
                background: `linear-gradient(90deg, transparent 0%, ${network.color}30 20%, ${network.color}50 50%, ${network.color}30 80%, transparent 100%)`
              }} />
              <div className="absolute bottom-4 left-4 right-4 h-px opacity-5" style={{
                background: `linear-gradient(90deg, transparent 0%, ${network.color}20 30%, ${network.color}10 70%, transparent 100%)`
              }} />
              <div className="flex items-center gap-5">
                {/* Logo con efecto de relieve y glow */}
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-xl"
                    style={{
                      background: `radial-gradient(circle, ${network.color}20 0%, transparent 70%)`,
                      boxShadow: `0 0 25px ${network.color}35, inset 0 3px 8px rgba(255,255,255,0.2)`
                    }}
                  >
                    <img
                      src={`/${network.logoFile}`}
                      alt={`${network.fullName} logo`}
                      className="w-10 h-10 object-contain drop-shadow-md"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {network.fullName}
                  </h3>
                  <div className="flex gap-3 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.agentsLabel}:</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`} suppressHydrationWarning>{network.stats.totalAgents.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.ownersLabel}:</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`} suppressHydrationWarning>{network.stats.totalOwners.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.activeLabel}:</span>
                      <span className="font-bold text-green-500" suppressHydrationWarning>{network.stats.activeAgents.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.feedbacksLabel}:</span>
                      <span className="font-bold text-blue-500" suppressHydrationWarning>{network.stats.withFeedbacks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Columna derecha - 2 tarjetas verticales con altura igual a las horizontales */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          {sideNetworks.map((network, index) => (
            <motion.div
              key={network.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (index + 3) * 0.1 }}
              className={`rounded-3xl p-4 transition-all hover:scale-[1.02] hover:-translate-y-1 flex-1 relative overflow-hidden backdrop-blur-sm ${
                isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'
              }`}
              style={{
                background: isDark
                  ? `linear-gradient(135deg, ${network.color}15 0%, rgba(39,39,42,0.85) 30%, rgba(39,39,42,0.95) 70%, ${network.color}10 100%)`
                  : `linear-gradient(135deg, ${network.color}20 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 70%, ${network.color}15 100%)`,
                boxShadow: isDark
                  ? `0 12px 40px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px ${network.color}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : `0 12px 40px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px ${network.color}35, inset 0 1px 0 rgba(255,255,255,0.6)`
              }}
            >
              {/* Elemento decorativo sutil */}
              <div
                className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${network.color} 0%, transparent 70%)`,
                  transform: 'translate(12px, -12px)'
                }}
              />

              {/* Línea divisoria sutil */}
              <div
                className="absolute top-16 left-4 right-4 h-px opacity-20"
                style={{ background: `linear-gradient(90deg, transparent 0%, ${network.color}40 50%, transparent 100%)` }}
              />
              <div className="flex items-center gap-3 h-full">
                {/* Logo y título a la izquierda */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="relative mb-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{
                        background: `radial-gradient(circle, ${network.color}25 0%, transparent 70%)`,
                        boxShadow: `0 0 25px ${network.color}35, inset 0 3px 6px rgba(255,255,255,0.2)`
                      }}
                    >
                      <img
                        src={`/${network.logoFile}`}
                        alt={`${network.fullName} logo`}
                        className="w-8 h-8 object-contain drop-shadow-md"
                      />
                    </div>
                  </div>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {network.fullName}
                  </h3>
                </div>

                {/* Estadísticas en dos columnas a la derecha */}
                <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-2">
                    <div className="flex flex-col items-center text-center">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.agentsLabel}</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{network.stats.totalAgents}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.ownersLabel}</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{network.stats.totalOwners}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col items-center text-center">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.activeLabel}</span>
                      <span className="font-bold text-green-500">{network.stats.activeAgents}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{t.feedbacksLabel}</span>
                      <span className="font-bold text-blue-500">{network.stats.withFeedbacks}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, theme } = useLanguage();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchStats = async () => {
      const { data } = await supabase
        .schema('web_dashboard')
        .from('main_stadistics')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setStats(data);
    };

    fetchStats();
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

  // Función para actualizar estadísticas de redes con datos reales
  const updateNetworksWithRealData = (networks: any[], chainStats: any[]) => {
    if (!chainStats || !Array.isArray(chainStats)) return networks;

    // Mapeo de chain_id a nombre de red en el componente
    const chainMapping: { [key: number]: string } = {
      56: 'BNB',      // BNB Chain
      8453: 'Base',   // Base Mainnet
      1: 'ETH',       // Ethereum Mainnet
      42161: 'ARB',   // Arbitrum-One
      137: 'POL'      // Polygon Mainnet
    };

    return networks.map(network => {
      const chainData = chainStats.find(chain =>
        chainMapping[chain.chain_id] === network.name
      );

      if (chainData) {
        return {
          ...network,
          stats: {
            totalAgents: chainData.agent_total || 0,
            totalOwners: chainData.owner_total || 0,
            activeAgents: chainData.agent_active || 0,
            withFeedbacks: chainData.agent_with_feedback || 0
          }
        };
      }

      return network; // Mantener datos por defecto si no hay datos
    });
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

  const totalHumi = Object.values(currentStats.humi_index_distribution).reduce((a: number, b: any) => a + (b || 0), 0);

  // Componente del gráfico circular para metadata distribution - LEYENDA INMEDIATAMENTE DEBAJO
  const MetadataDistributionChart = memo(({ currentStats, isDark, t }: any) => {
    const metadataData = [
      {
        label: t.metadataElite,
        percentage: currentStats.agent_metadata_distribution?.Elite?.percentage || 0,
        count: currentStats.agent_metadata_distribution?.Elite?.count || 0,
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
        glowColor: 'rgba(168, 85, 247, 0.6)',
        description: 'Metadata excepcional',
        rangeValue: 95 // Valor promedio del rango 90-100
      },
      {
        label: t.metadataExcellent,
        percentage: currentStats.agent_metadata_distribution?.Excelente?.percentage || 0,
        count: currentStats.agent_metadata_distribution?.Excelente?.count || 0,
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
        glowColor: 'rgba(59, 130, 246, 0.6)',
        description: 'Metadata muy buena',
        rangeValue: 80 // Valor promedio del rango 70-90
      },
      {
        label: t.metadataGood,
        percentage: currentStats.agent_metadata_distribution?.Bueno?.percentage || 0,
        count: currentStats.agent_metadata_distribution?.Bueno?.count || 0,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        glowColor: 'rgba(16, 185, 129, 0.6)',
        description: 'Metadata buena',
        rangeValue: 60 // Valor promedio del rango 50-70
      },
      {
        label: t.metadataRegular,
        percentage: currentStats.agent_metadata_distribution?.Regular?.percentage || 0,
        count: currentStats.agent_metadata_distribution?.Regular?.count || 0,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        glowColor: 'rgba(245, 158, 11, 0.6)',
        description: 'Metadata regular',
        rangeValue: 40 // Valor promedio del rango 30-50
      },
      {
        label: t.metadataLow,
        percentage: currentStats.agent_metadata_distribution?.Baja?.percentage || 0,
        count: currentStats.agent_metadata_distribution?.Baja?.count || 0,
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        glowColor: 'rgba(249, 115, 22, 0.6)',
        description: 'Metadata baja',
        rangeValue: 20 // Valor promedio del rango 10-30
      },
      {
        label: t.metadataPoor,
        percentage: currentStats.agent_metadata_distribution?.Mala?.percentage || 0,
        count: currentStats.agent_metadata_distribution?.Mala?.count || 0,
        color: '#dc2626',
        gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
        glowColor: 'rgba(220, 38, 38, 0.6)',
        description: 'Metadata mala',
        rangeValue: 5 // Valor promedio del rango 0-10
      },
    ];

    // Calcular promedio ponderado de metadata
    const totalAgents = metadataData.reduce((sum, item) => sum + item.count, 0);
    const weightedAverage = totalAgents > 0
      ? metadataData.reduce((sum, item) => sum + (item.rangeValue * item.count), 0) / totalAgents
      : 0;

    const radius = 100;
    const centerX = 137.5;
    const centerY = 137.5;
    let currentAngle = -90;

    return (
      <div className="flex flex-col items-center w-full">
        {/* Cuadrado de título Metadata Richness */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${isDark ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20' : 'bg-purple-400/20 text-purple-600 border border-purple-400/30'}`}>
            {t.metadataRichnessTitle}
          </div>
        </div>
        {/* Gráfico circular */}
        <div className="relative w-[275px] h-[275px]">
          <svg width="275" height="275" className="drop-shadow-2xl">
            {metadataData.filter(item => item.percentage > 0).map((item, index) => {
              const rawAngle = (item.percentage / 100) * 360;
              // Ángulo mínimo de 2 grados para que los segmentos muy pequeños se vean
              const angle = Math.max(rawAngle, 2);
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              currentAngle = endAngle;

              return (
                <g key={index}>
                  <motion.path
                    d={pathData}
                    fill={`url(#gradient-${index})`}
                    stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                    strokeWidth="3"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.5, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="hover:drop-shadow-2xl transition-all duration-500 cursor-pointer group"
                    style={{
                      filter: `drop-shadow(0 0 25px ${item.glowColor}70) drop-shadow(0 0 50px ${item.glowColor}40) drop-shadow(0 0 80px ${item.glowColor}20)`,
                      transformOrigin: `${centerX}px ${centerY}px`
                    }}
                  />
                  <title>{`${item.count.toLocaleString()} ${t.agentsTooltip}`}</title>
                </g>
              );
            })}

            <defs>
              {metadataData.map((item, index) => (
                <radialGradient key={index} id={`gradient-${index}`} cx="40%" cy="35%">
                  <stop offset="0%" stopColor={item.color} stopOpacity="1" />
                  <stop offset="50%" stopColor={item.color} stopOpacity="0.8" />
                  <stop offset="80%" stopColor={item.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={item.color} stopOpacity="0.3" />
                </radialGradient>
              ))}
            </defs>

            <circle cx={centerX} cy={centerY} r="45" fill={isDark ? 'rgba(39,39,42,0.95)' : 'rgba(255,255,255,0.95)'} stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth="3" />
            <circle cx={centerX} cy={centerY} r="35" fill="none" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} strokeWidth="1" strokeDasharray="2,2" />

            {/* Texto del promedio en el centro */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className={`text-lg font-bold ${isDark ? 'fill-zinc-200' : 'fill-zinc-800'}`}
            >
              {weightedAverage.toFixed(1)}
            </text>
            <text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'fill-zinc-400' : 'fill-zinc-600'}`}
            >
              {t.averageLabel}
            </text>
          </svg>
        </div>

        {/* Leyenda INMEDIATAMENTE debajo del gráfico */}
        <div className="w-full mt-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {metadataData.map((item, index) => {
              let displayPercentage;
              if (item.percentage < 0.01) {
                displayPercentage = '<0.01%';
              } else if (item.percentage < 0.1) {
                displayPercentage = item.percentage.toFixed(3) + '%';
              } else if (item.percentage < 1) {
                displayPercentage = item.percentage.toFixed(2) + '%';
              } else {
                displayPercentage = Math.round(item.percentage) + '%';
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-default"
                >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <div>
                            <div className="flex items-baseline gap-1">
                            <span className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{displayPercentage}</span>
                              <span className={`text-xs uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-medium`}>{item.label}</span>
                            </div>
                          </div>
                        </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  });

  // Componente del gráfico de línea para Nonce Generation Trend
  const NonceTrendChart = memo(({ isDark, t, agentNonce }: any) => {
    // Función para transformar datos de agent_nonce al formato de la gráfica
    const transformNonceData = (rawData: any[]) => {
      if (!rawData || !Array.isArray(rawData)) return [];

      // Crear mapa de fechas con datos reales
      const realDataMap = new Map();
      rawData.forEach(item => {
        realDataMap.set(item.date, item.total_nonce || 0);
      });

      // Generar 30 días hacia atrás desde hoy
      const result = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const nonces = realDataMap.get(dateStr) || 0;
        let change = "0%";

        // Calcular cambio porcentual
        if (result.length > 0) {
          const prevNonces = result[result.length - 1].nonces;
          if (prevNonces === 0 && nonces > 0) {
            change = "+∞%";
          } else if (prevNonces > 0 && nonces === 0) {
            change = "-100%";
          } else if (prevNonces > 0) {
            const percentChange = ((nonces - prevNonces) / prevNonces) * 100;
            change = (percentChange >= 0 ? "+" : "") + percentChange.toFixed(1) + "%";
          }
        }

        result.push({
          date: dateStr,
          nonces: nonces,
          change: change
        });
      }

      return result;
    };

    const nonceData = transformNonceData(agentNonce);

    const width = 600;
    const height = 240;
    const paddingLeft = 45;
    const paddingRight = 23;
    const paddingTop = 18;
    const paddingBottom = 42;
    const chartWidth = width - (paddingLeft + paddingRight);
    const chartHeight = height - (paddingTop + paddingBottom);

    // Encontrar valores min/max para escalar
    const maxNonces = Math.max(...nonceData.map(d => d.nonces));
    const minNonces = Math.min(...nonceData.map(d => d.nonces));

    // Función para escalar valores al rango del gráfico
    const scaleY = (value: number) => chartHeight - ((value - minNonces) / (maxNonces - minNonces)) * chartHeight + paddingTop;
    const scaleX = (index: number) => (index / (nonceData.length - 1)) * chartWidth + paddingLeft;

    // Crear el path de la línea
    const linePath = nonceData.map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.nonces);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Crear el área bajo la línea
    const areaPath = linePath + ` L ${scaleX(nonceData.length - 1)} ${height - paddingBottom} L ${scaleX(0)} ${height - paddingBottom} Z`;

    return (
      <div className="w-full h-full flex flex-col relative">
        {/* Cuadrado de título Agent Nonce - Esquina superior izquierda */}
        <div className="absolute top-0 left-4 z-20">
          <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${isDark ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' : 'bg-blue-400/20 text-blue-600 border border-blue-400/30'}`}>
            {t.agentNonceTitle}
          </div>
        </div>

        {/* Cuadrado Last 30 Days - Esquina inferior derecha */}
        <div className="absolute bottom-1 right-4 z-20">
          <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${isDark ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-emerald-400/20 text-emerald-600 border border-emerald-400/30'}`}>
            {t.last30DaysTitle}
          </div>
        </div>

        {/* Cuadrado de información del último punto - Esquina superior derecha */}
        {nonceData.length > 0 && (
          <div className="absolute top-0 right-4 z-20">
            <div className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider ${isDark ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-emerald-400/20 text-emerald-600 border border-emerald-400/30'}`}>
              {t.totalLabel}: {nonceData[nonceData.length - 1].nonces.toLocaleString()} {t.nonceLabel}
              {nonceData.length > 1 && nonceData[nonceData.length - 2].nonces > 0 && (
                <> ({nonceData[nonceData.length - 1].change})</>
              )}
            </div>
          </div>
        )}

        {/* Gráfico SVG */}
        <div className="flex-1 relative">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* Área bajo la línea con gradiente */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>

            {/* Área de fondo */}
            <motion.path
              d={areaPath}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            {/* Línea principal */}
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              style={{
                filter: `drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))`
              }}
            />

            {/* Puntos de datos */}
            {nonceData.map((point, index) => {
              const x = scaleX(index);
              const y = scaleY(point.nonces);
              const isLastPoint = index === nonceData.length - 1;

              return (
                <g key={index}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isLastPoint ? "6" : "4"}
                    fill={isLastPoint ? "#ef4444" : "#3b82f6"}
                    stroke={isDark ? "#ffffff" : "#ffffff"}
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.02 }}
                    style={{
                      filter: `drop-shadow(0 0 6px ${isLastPoint ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)'})`
                    }}
                  />
                  <title>{point.nonces.toLocaleString()} {t.noncesTooltip}</title>
                </g>
              );
            })}

            {/* Ejes */}
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={height - paddingBottom}
              stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
              strokeWidth="1"
            />

            {/* Etiquetas de eje Y */}
            {[0, 1, 2, 3, 4].map((tick) => {
              const value = minNonces + (tick * (maxNonces - minNonces) / 4);
              const y = chartHeight - (tick * chartHeight / 4) + paddingTop;
              return (
                <g key={tick}>
                  <line
                    x1={paddingLeft - 5}
                    y1={y}
                    x2={paddingLeft}
                    y2={y}
                    stroke={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className={`text-[9px] ${isDark ? 'fill-zinc-400' : 'fill-zinc-600'}`}
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Etiquetas de eje X (días) */}
            {nonceData.length > 0 && [0, 7, 14, 21, 29].filter(index => index < nonceData.length && nonceData[index]).map((index) => {
              const x = scaleX(index);
              const point = nonceData[index];
              if (!point || !point.date) return null;
              const date = new Date(point.date);
              const day = date.getDate();
              return (
                <text
                  key={index}
                  x={x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  className={`text-[9px] ${isDark ? 'fill-zinc-400' : 'fill-zinc-600'}`}
                >
                  {day}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  });

  const HUMI_DATA = [
    {
      label: '80-100',
      percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["80-100"] / totalHumi) * 100 : 0,
      count: currentStats.humi_index_distribution["80-100"] || 0,
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
      glowColor: 'rgba(34, 197, 94, 0.6)',
      description: t.humiElite,
      title: 'Elite'
    },
    {
      label: '60-80',
      percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["60-80"] / totalHumi) * 100 : 0,
      count: currentStats.humi_index_distribution["60-80"] || 0,
      color: '#84cc16',
      gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 50%, #4d7c0f 100%)',
      glowColor: 'rgba(132, 204, 22, 0.6)',
      description: t.humiHighPerformance,
      title: 'High Performance'
    },
    {
      label: '30-60',
      percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["30-60"] / totalHumi) * 100 : 0,
      count: currentStats.humi_index_distribution["30-60"] || 0,
      color: '#eab308',
      gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)',
      glowColor: 'rgba(234, 179, 8, 0.6)',
      description: t.humiStable,
      title: 'Stable'
    },
    {
      label: '10-30',
      percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["10-30"] / totalHumi) * 100 : 0,
      count: currentStats.humi_index_distribution["10-30"] || 0,
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
      glowColor: 'rgba(249, 115, 22, 0.6)',
      description: t.humiModerateRisk,
      title: 'Moderate Risk'
    },
    {
      label: '0-10',
      percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["0-10"] / totalHumi) * 100 : 0,
      count: currentStats.humi_index_distribution["0-10"] || 0,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
      glowColor: 'rgba(220, 38, 38, 0.6)',
      description: t.humiCritical,
      title: 'Critical'
    },
  ];

  return (
    <div className={`min-h-full ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="max-w-screen-2xl mx-auto">
        {/* Estadísticas Principales + Network Cards - GRID 12 COLUMNAS + items-stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-stretch">
          {/* Carta principal de estadísticas */}
          <div className="lg:col-span-5">
            <StatsNavigator currentStats={currentStats} isDark={isDark} t={t} />
          </div>

          {/* Network Cards - Cinco cadenas */}
          <div className="lg:col-span-7">
            <NetworkCards isDark={isDark} t={t} chainStats={stats?.chain_stats} />
          </div>
        </div>

         {/* HUMI Distribution + Agent Metadata Distribution + Nonce Trend */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-stretch">
           {/* Card HUMI Premium - Más delgado */}
           <div className={`lg:col-span-2 rounded-3xl p-4 transition-all hover:scale-[1.02] relative overflow-hidden backdrop-blur-sm ${isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'}`}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(39,39,42,0.9) 0%, rgba(63,63,70,0.85) 30%, rgba(39,39,42,0.95) 70%, rgba(59,130,246,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 30%, rgba(255,255,255,0.98) 70%, rgba(59,130,246,0.06) 100%)',
              boxShadow: isDark
                ? '0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)'
                : '0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05)'
            }}
          >
            {/* Elementos decorativos premium */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.1) 50%, transparent 70%)',
                transform: 'translate(20px, -20px)'
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-32 h-32 opacity-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(245,158,11,0.08) 50%, transparent 70%)',
                transform: 'translate(-16px, 16px)'
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-24 h-24 opacity-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)'
              }}
            />

            {/* Patrón de puntos sutil */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.8) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />

            {/* Líneas decorativas */}
            <div className="absolute top-4 left-4 right-4 h-px opacity-10" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.4) 20%, rgba(59,130,246,0.6) 50%, rgba(59,130,246,0.4) 80%, transparent 100%)'
            }} />
            <div className="absolute bottom-4 left-4 right-4 h-px opacity-5" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 30%, rgba(16,185,129,0.2) 70%, transparent 100%)'
            }} />
            {/* Cuadrado de título HUMI Index */}
            <div className="absolute top-4 left-4 z-10">
              <div className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wider text-center ${isDark ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-amber-400/20 text-amber-600 border border-amber-400/30'}`}>
                <div>{t.humiIndexTitle}</div>
                <div>HUMI</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className={`relative w-12 h-48 rounded-full border-[3px] overflow-hidden flex flex-col transition-all duration-300 hover:scale-105 ${isDark ? 'bg-zinc-800/60 border-zinc-600 shadow-2xl' : 'bg-zinc-200/60 border-zinc-400 shadow-xl'}`}
                style={{
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(39,39,42,0.8) 0%, rgba(63,63,70,0.6) 50%, rgba(39,39,42,0.9) 100%)'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.7) 50%, rgba(255,255,255,0.95) 100%)',
                  boxShadow: isDark
                    ? 'inset 0 4px 20px rgba(0,0,0,0.6), inset 0 -4px 20px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.1)'
                    : 'inset 0 4px 20px rgba(0,0,0,0.2), inset 0 -4px 20px rgba(255,255,255,0.8), 0 8px 32px rgba(0,0,0,0.15), 0 0 0 2px rgba(0,0,0,0.1)'
                }}
              >
                {HUMI_DATA.filter(item => item.percentage > 0).map((item, index) => {
                  const visualHeight = Math.max(item.percentage, 5);
                  return (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${visualHeight}%` }}
                      transition={{ duration: 1.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="relative w-full group overflow-hidden cursor-pointer"
                      style={{
                        background: item.gradient,
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.2), 0 0 15px ${item.glowColor}`
                      }}
                      title={`${item.count.toLocaleString()} ${t.agentsTooltip}`}
                    >
                      {/* Efectos de profundidad y textura */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/40" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

                      {/* Efecto de relieve superior */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/60 to-transparent" />

                      {/* Efecto de glow en hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${item.glowColor} 0%, transparent 50%)`,
                          boxShadow: `inset 0 0 20px ${item.glowColor}`
                        }}
                      />
                    </motion.div>
                  );
                })}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10" />
                <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-white/10 blur-[1px]" />
              </div>

              {/* Leyendas movidas fuera del grid, debajo del gráfico */}
              <div className="w-full mt-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {HUMI_DATA.map((item, index) => {
                    const displayPercentage = item.percentage < 1
                      ? item.percentage.toFixed(1) + '%'
                      : Math.round(item.percentage) + '%';

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group cursor-default"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <div className="flex flex-col items-start">
                            <span className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{displayPercentage}</span>
                            <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-medium leading-tight`}>{item.description}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card Agent Metadata Distribution */}
          <div className={`lg:col-span-3 rounded-3xl p-4 transition-all hover:scale-[1.02] relative overflow-hidden backdrop-blur-sm ${isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'}`}

            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(39,39,42,0.9) 0%, rgba(63,63,70,0.85) 30%, rgba(39,39,42,0.95) 70%, rgba(168,85,247,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 30%, rgba(255,255,255,0.98) 70%, rgba(168,85,247,0.06) 100%)',
              boxShadow: isDark
                ? '0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)'
                : '0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05)'
            }}
          >
            {/* Elementos decorativos premium */}
            <div
              className="absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(59,130,246,0.1) 50%, transparent 70%)',
                transform: 'translate(20px, -20px)'
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-32 h-32 opacity-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(16,185,129,0.08) 50%, transparent 70%)',
                transform: 'translate(-16px, 16px)'
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-24 h-24 opacity-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)'
              }}
            />

            {/* Patrón de puntos sutil */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.8) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />

            {/* Líneas decorativas */}
            <div className="absolute top-4 left-4 right-4 h-px opacity-10" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.4) 20%, rgba(168,85,247,0.6) 50%, rgba(168,85,247,0.4) 80%, transparent 100%)'
            }} />
            <div className="absolute bottom-4 left-4 right-4 h-px opacity-5" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 30%, rgba(59,130,246,0.2) 70%, transparent 100%)'
            }} />
            <MetadataDistributionChart currentStats={currentStats} isDark={isDark} t={t} />
          </div>

          {/* Carrete de próximas certificaciones - Menos ancho */}
          <div className={`lg:col-span-7 rounded-3xl p-4 overflow-hidden transition-all hover:scale-[1.02] relative backdrop-blur-sm ${isDark ? 'bg-zinc-900/80 border border-zinc-700/50' : 'bg-white/80 border border-zinc-200/50'}`}
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(39,39,42,0.9) 0%, rgba(63,63,70,0.85) 30%, rgba(39,39,42,0.95) 70%, rgba(139,92,246,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 30%, rgba(255,255,255,0.98) 70%, rgba(139,92,246,0.06) 100%)',
              boxShadow: isDark
                ? '0 16px 48px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)'
                : '0 16px 48px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.05)'
            }}
          >
            {/* Elementos decorativos premium */}
            <div
              className="absolute top-0 left-0 w-40 h-40 opacity-5 rounded-full z-10"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)',
                transform: 'translate(-20px, -20px)'
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-32 h-32 opacity-4 rounded-full z-10"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 50%, transparent 70%)',
                transform: 'translate(16px, 16px)'
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-24 h-24 opacity-3 rounded-full z-10"
              style={{
                background: 'radial-gradient(circle, rgba(250,204,21,0.1) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)'
              }}
            />

            {/* Patrón de puntos sutil */}
            <div className="absolute inset-0 opacity-[0.02] z-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.8) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />

            {/* Líneas decorativas */}
            <div className="absolute top-4 left-4 right-4 h-px opacity-10 z-0" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.4) 20%, rgba(139,92,246,0.6) 50%, rgba(139,92,246,0.4) 80%, transparent 100%)'
            }} />
            <div className="absolute bottom-4 left-4 right-4 h-px opacity-5 z-0" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 30%, rgba(16,185,129,0.2) 70%, transparent 100%)'
            }} />
            <NonceTrendChart isDark={isDark} t={t} agentNonce={stats?.agent_nonce} />
          </div>
        </div>
      </div>
    </div>
  );
}