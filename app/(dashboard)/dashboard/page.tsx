// app/(dashboard)/dashboard/page.tsx
// Versión final que te gustaba + estrellas estilizadas premium (dorado con brillo)

'use client';

import { useLanguage } from './components/LanguageContext';
import AnimatedCounter from './components/AnimatedCounter';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';

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

  // Mapeo del JSON a estrellas con estilo premium
  const humiData = [
    { stars: 5, count: currentStats.humi_index_distribution["80-100"] || 0, color: 'text-amber-400' },
    { stars: 4, count: currentStats.humi_index_distribution["60-80"] || 0, color: 'text-amber-300' },
    { stars: 3, count: currentStats.humi_index_distribution["30-60"] || 0, color: 'text-yellow-400' },
    { stars: 2, count: currentStats.humi_index_distribution["10-30"] || 0, color: 'text-orange-400' },
    { stars: 1, count: currentStats.humi_index_distribution["0-10"] || 0, color: 'text-red-400' },
  ];
  
  return (
    <div className={`min-h-full ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
      <div className="max-w-screen-2xl mx-auto">
        {/* Primera fila - Sello grande con número en el centro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">   
              <img 
                src="/dashboard_seal_template.png" 
                alt="Registrados" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-5xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]`}>
                  <AnimatedCounter end={currentStats.total_agents} />
                </p>
              </div>
            </div>
            <p className={`mt-8 text-amber-400 text-2xl font-semibold tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
              {t.registeredAgents}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              <img 
                src="/dashboard_seal_template.png" 
                alt="Activos" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-5xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]`}>
                  <AnimatedCounter end={currentStats.total_agents_active} />
                </p>
              </div>
            </div>
            <p className={`mt-8 text-amber-400 text-2xl font-semibold tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
              {t.activeAgents}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              <img 
                src="/dashboard_seal_template.png" 
                alt="Feedbacks" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-5xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]`}>
                  <AnimatedCounter end={currentStats.total_agents_with_feedbacks} />
                </p>
              </div>
            </div>
            <p className={`mt-8 text-amber-400 text-2xl font-semibold tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
              {t.agentsWithFeedback}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
              <img 
                src="/dashboard_seal_template.png" 
                alt="Wallets" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className={`text-5xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]`}>
                  <AnimatedCounter end={currentStats.wallet_monitored} />
                </p>
              </div>
            </div>
            <p className={`mt-8 text-amber-400 text-xl font-semibold tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-500'}`}>
              {t.monitoredWallets}
            </p>
          </div>
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* === NUEVA CARD: Distribución Índice HUMI === */}
          <div className={`rounded-3xl p-8 transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t.humiDistributionTitle}
            </h2>

            <div className="space-y-1">
              {humiData.map((row, index) => (
                <div key={index} className="flex items-center gap-6">
                  {/* Estrellas estilizadas premium */}
                  <div className={`flex text-4xl drop-shadow-md ${row.color}`}>
                    {'★'.repeat(row.stars)}
                  </div>
                  {/* Cantidad */}
                  <div className="flex-1 text-right">
                    <span className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {row.count.toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CEROW - Imagen y texto más grandes */}
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

          {/* CEREX - Imagen y texto más grandes */}
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