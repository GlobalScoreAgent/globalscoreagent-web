// app/(dashboard)/dashboard/components/DashboardLayoutClient.tsx
// Componente cliente para el layout del dashboard con títulos dinámicos

'use client';

import { usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNav from './DashboardTopNav';
import { LanguageProvider } from './LanguageContext';

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

  return (
    <div className="flex h-screen text-white overflow-hidden dark:bg-zinc-950 bg-zinc-100">
      <LanguageProvider>
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
      </LanguageProvider>
    </div>
  );
}