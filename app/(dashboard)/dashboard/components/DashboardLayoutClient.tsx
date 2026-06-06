// app/(dashboard)/dashboard/components/DashboardLayoutClient.tsx
// Componente cliente para el layout del dashboard con títulos dinámicos

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { DashboardSessionUser } from '../layout';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNav from './DashboardTopNav';
import { DashboardLoginProvider, useDashboardLogin } from './DashboardLoginContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { RecentAgentsProvider } from './AgentRecentNavigationContext';
import { DashboardTitleOverrideProvider } from './DashboardTitleOverrideContext';
import {
  hasHydratedDashboardPreferences,
  markDashboardPreferencesHydrated,
} from '@/lib/gsa/dashboard-preferences-hydration';

function getPageTitleKey(pathname: string): string {
  if (pathname === '/dashboard/agents' || pathname === '/dashboard/agents/') {
    return 'agentsDirectory';
  }

  if (pathname.startsWith('/dashboard/agents/')) {
    return 'agentOverviewTitle';
  }

  if (pathname === '/dashboard/perfil' || pathname === '/dashboard/perfil/') {
    return 'profile';
  }

  if (pathname === '/dashboard/subscripciones' || pathname === '/dashboard/subscripciones/') {
    return 'subscriptionsPageTitle';
  }

  if (pathname === '/dashboard/api' || pathname === '/dashboard/api/') {
    return 'apiPageTitle';
  }

  return 'dashboardOverviewTitle';
}

function DashboardPreferencesHydrator() {
  const { loginReady } = useDashboardLogin();
  const { applyPersistedPreferences } = useLanguage();
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!loginReady) return;
    if (hasHydratedRef.current || hasHydratedDashboardPreferences()) return;

    let cancelled = false;

    const hydrate = async () => {
      try {
        const res = await fetch('/api/dashboard/profile', { credentials: 'include' });
        const data = (await res.json()) as {
          success: boolean;
          profile?: { preferences?: { language?: 'es' | 'en'; theme?: 'dark' | 'light' } };
        };

        if (!cancelled && res.ok && data.success && data.profile?.preferences) {
          applyPersistedPreferences(data.profile.preferences);
          markDashboardPreferencesHydrated();
          hasHydratedRef.current = true;
        }
      } catch {
        // Ignore hydration errors, fallback remains localStorage defaults
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [loginReady, applyPersistedPreferences]);

  return null;
}

function DashboardLayoutInner({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardSessionUser;
}) {
  const pathname = usePathname();
  const pageTitleKey = getPageTitleKey(pathname);
  const { loginReady, loginError } = useDashboardLogin();

  if (!loginReady) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-zinc-950 bg-zinc-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (loginError) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-zinc-950 bg-zinc-100 px-4">
        <p className="text-center text-red-500">{loginError}</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <DashboardPreferencesHydrator />
      <div className="flex h-screen text-white overflow-hidden dark:bg-zinc-950 bg-zinc-100">
        <RecentAgentsProvider>
          <DashboardSidebar />

          <div className="flex-1 flex flex-col">
            <DashboardTitleOverrideProvider>
              <DashboardTopNav
                user={{ email: user.email }}
                profile={{ display_name: user.display_name, avatar_url: user.avatar_url }}
                pageTitleKey={pageTitleKey}
              />

              <main className="flex-1 overflow-auto p-8 dark:bg-zinc-950 bg-zinc-100">
                {children}
              </main>
            </DashboardTitleOverrideProvider>
          </div>
        </RecentAgentsProvider>
      </div>
    </LanguageProvider>
  );
}

export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardSessionUser;
}) {
  return (
    <DashboardLoginProvider>
      <DashboardLayoutInner user={user}>{children}</DashboardLayoutInner>
    </DashboardLoginProvider>
  );
}
