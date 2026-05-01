// app/(dashboard)/dashboard/layout.tsx
// Layout del dashboard con soporte completo para tema claro/oscuro

import { Metadata } from 'next';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardTopNav from './components/DashboardTopNav';
import { LanguageProvider } from './components/LanguageContext';

export const metadata: Metadata = {
  title: 'Dashboard | Global Score Agent',
  description: 'Panel de control - Monitorea agentes ERC-8004 y sus scores HUMI',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen text-white overflow-hidden dark:bg-zinc-950 bg-zinc-100">
      <LanguageProvider>
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Área principal */}
        <div className="flex-1 flex flex-col">
          <DashboardTopNav 
            user={{ email: 'demo@globalscoreagent.com' }} 
            profile={{ display_name: 'Usuario Demo', avatar_url: null }} 
            pageTitleKey="dashboardOverviewTitle"   // ← clave que agregamos en LanguageContext
          />

          {/* Contenido - aquí va la página principal */}
          <main className="flex-1 overflow-auto p-8 dark:bg-zinc-950 bg-zinc-100">
            {children}
          </main>
        </div>
      </LanguageProvider>
    </div>
  );
}