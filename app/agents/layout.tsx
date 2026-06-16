'use client';

import PublicAgentLanguageSync from '@/components/agents/PublicAgentLanguageSync';
import { RecentAgentsProvider } from '@/app/(dashboard)/dashboard/components/AgentRecentNavigationContext';
import { DashboardTitleOverrideProvider } from '@/app/(dashboard)/dashboard/components/DashboardTitleOverrideContext';
import { LanguageProvider } from '@/app/(dashboard)/dashboard/components/LanguageContext';

export default function PublicAgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PublicAgentLanguageSync>
        <DashboardTitleOverrideProvider>
          <RecentAgentsProvider>{children}</RecentAgentsProvider>
        </DashboardTitleOverrideProvider>
      </PublicAgentLanguageSync>
    </LanguageProvider>
  );
}
