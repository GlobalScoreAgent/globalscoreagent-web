// app/(dashboard)/dashboard/components/DashboardLayoutClient.tsx
// Componente cliente para el layout del dashboard con títulos dinámicos

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNav from './DashboardTopNav';
import { LanguageProvider } from './LanguageContext';
import { RecentAgentsProvider } from './AgentRecentNavigationContext';

// Contexto para compartir datos estadísticos del dashboard
interface DashboardStats {
  totalAgents: number;
  chainStats: any[];
  agentNonce: number;
}

const DashboardStatsContext = createContext<DashboardStats | null>(null);

export const useDashboardStats = () => {
  const context = useContext(DashboardStatsContext);
  if (!context) {
    throw new Error('useDashboardStats must be used within DashboardLayoutClient');
  }
  return context;
};

function getPageTitleKey(pathname: string): string {
  if (pathname.startsWith('/dashboard/agents')) {
    return 'agentsDirectory';
  }
  return 'dashboardOverviewTitle';
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitleKey = getPageTitleKey(pathname);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas del dashboard al montar
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);

        // Obtener estadísticas de cadenas
        const chainsResponse = await fetch('/api/erc8004/chains');
        const chainsData = await chainsResponse.json();

        if (!chainsResponse.ok) {
          console.error('Error loading chains stats:', chainsData);
          return;
        }

        // Calcular total de agentes de todas las cadenas
        const totalAgents = chainsData.data?.reduce((sum: number, chain: any) => sum + (chain.agent_total_count || 0), 0) || 0;

        // Para agentNonce, usamos un valor por defecto o podríamos obtenerlo de otra API
        const agentNonce = 0; // TODO: Obtener de la API correspondiente

        setStats({
          totalAgents,
          chainStats: chainsData.data || [],
          agentNonce
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  // Mostrar loading mientras se cargan las estadísticas
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-zinc-950 bg-zinc-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardStatsContext.Provider value={stats}>
      <div className="flex h-screen text-white overflow-hidden dark:bg-zinc-950 bg-zinc-100">
        <LanguageProvider>
          <RecentAgentsProvider>
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Área principal */}
            <div className="flex-1 flex flex-col">
              <DashboardTopNav
                user={{ email: 'demo@globalscoreagent.com' }}
                profile={{ display_name: 'Usuario Demo', avatar_url: undefined }}
                pageTitleKey={pageTitleKey}
              />

              {/* Contenido - aquí va la página principal */}
              <main className="flex-1 overflow-auto p-8 dark:bg-zinc-950 bg-zinc-100">
                {children}
              </main>
            </div>
          </RecentAgentsProvider>
        </LanguageProvider>
      </div>
    </DashboardStatsContext.Provider>
  );
}
