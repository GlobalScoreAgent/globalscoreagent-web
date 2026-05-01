// app/(dashboard)/dashboard/page.tsx
// Versión final con nueva card HUMI premium + ajustes solicitados

'use client';

import { useLanguage } from './components/LanguageContext';
import AnimatedCounter from './components/AnimatedCounter';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  const currentStats = stats || {
    total_agents: 0,
    total_agents_active: 0,
    total_agents_with_feedbacks: 0,
    wallet_monitored: 0,
    humi_index_distribution: {
      "0-10": 0,
      "10-30": 0,
      "30-60": 0,
      "60-80": 0,
      "80-100": 0,
    },
  };

  const totalHumi = Object.values(currentStats.humi_index_distribution).reduce((a: number, b: number) => a + b, 0);

  const HUMI_DATA = [
    { label: '80-100', percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["80-100"] / totalHumi) * 100 : 0, count: currentStats.humi_index_distribution["80-100"] || 0, color: '#fef08a', description: t.humiElite },
    { label: '60-80',  percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["60-80"] / totalHumi) * 100 : 0, count: currentStats.humi_index_distribution["60-80"] || 0, color: '#facc15', description: t.humiHighPerformance },
    { label: '30-60',  percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["30-60"] / totalHumi) * 100 : 0, count: currentStats.humi_index_distribution["30-60"] || 0, color: '#eab308', description: t.humiStable },
    { label: '10-30',  percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["10-30"] / totalHumi) * 100 : 0, count: currentStats.humi_index_distribution["10-30"] || 0, color: '#f97316', description: t.humiModerateRisk },
    { label: '0-10',   percentage: totalHumi > 0 ? (currentStats.humi_index_distribution["0-10"] / totalHumi) * 100 : 0, count: currentStats.humi_index_distribution["0-10"] || 0, color: '#dc2626', description: t.humiCritical },
  ];

  return (
    <div className={`min-h-full ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="max-w-screen-2xl mx-auto">
        {/* Primera fila - Sellos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            { key: 'total_agents', label: t.registeredAgents },
            { key: 'total_agents_active', label: t.activeAgents },
            { key: 'total_agents_with_feedbacks', label: t.agentsWithFeedback },
            { key: 'wallet_monitored', label: t.monitoredWallets },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="relative w-64 h-64">   
                <img src="/dashboard_seal_template.png" alt={item.label} className="w-full h-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className={`text-5xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]`}>
                    <AnimatedCounter end={currentStats[item.key]} />
                  </p>
                </div>
              </div>
              <p className={`mt-8 text-amber-400 text-2xl font-semibold tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tres cards alineadas y más cortas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Nueva Card HUMI Premium */}
          <div className={`rounded-3xl p-6 transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className="mb-6 text-center">
              <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {t.humiDistributionTitle}
              </h2>
              <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>ERC-8004 Ecosystem</p>
            </div>

            <div className="flex items-end justify-between gap-10">
              {/* BARRA - Borde dinámico según tema */}
              <div className={`relative w-20 h-72 bg-zinc-800/50 rounded-full border-[6px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col
                ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
                
                {HUMI_DATA.filter(item => item.percentage > 0).map((item, index) => {
                  const visualHeight = Math.max(item.percentage, 5);
                  return (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${visualHeight}%` }}
                      transition={{ duration: 1.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="relative w-full group"
                      style={{ backgroundColor: item.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20" />
                    </motion.div>
                  );
                })}

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10" />
                <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-white/10 blur-[1px]" />
              </div>

              {/* Leyenda */}
              <div className="flex flex-col justify-center gap-5 flex-1">
                {HUMI_DATA.map((item, index) => {
                  const displayPercentage = item.percentage < 1 
                    ? item.percentage.toFixed(1) + '%' 
                    : Math.round(item.percentage) + '%';

                  return (
                    <div key={index} className="group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full transition-transform group-hover:scale-x-150" style={{ backgroundColor: item.color }} />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{displayPercentage}</span>
                            <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-medium`}>
                              {item.label}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                              ({item.count.toLocaleString('es-ES')} agentes)
                            </span>
                          </div>
                          <p className={`text-[10px] ${isDark ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-600'} transition-colors`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CEROW */}
          <div className={`rounded-3xl p-8 transition-colors relative ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className="absolute top-6 right-6 bg-amber-400 text-zinc-950 text-xs font-medium px-3 py-1 rounded-3xl">
              {t.comingSoon}
            </div>
            <div className="flex justify-center mb-8">
              <img src="/certificate-cerow.png" alt="CEROW" className="h-56 w-auto" />
            </div>
            <p className={`text-center font-semibold text-2xl ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t.cerowTitle}
            </p>
          </div>

          {/* CEREX */}
          <div className={`rounded-3xl p-8 transition-colors relative ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className="absolute top-6 right-6 bg-amber-400 text-zinc-950 text-xs font-medium px-3 py-1 rounded-3xl">
              {t.comingSoon}
            </div>
            <div className="flex justify-center mb-8">
              <img src="/certificate-cerex.png" alt="CEREX" className="h-56 w-auto" />
            </div>
            <p className={`text-center font-semibold text-2xl ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t.cerexTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}