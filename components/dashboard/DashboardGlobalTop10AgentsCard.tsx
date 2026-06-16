'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { ChainTopAgentsList } from '@/components/dashboard/ChainTopAgentsList';
import type { Best10AgentHumiRow } from '@/lib/dashboardChains';
import { cn } from '@/lib/utils';

type Props = {
  isDark: boolean;
  t: Translations;
  lang: 'es' | 'en';
  agents: Best10AgentHumiRow[];
  compact?: boolean;
  className?: string;
};

export function DashboardGlobalTop10AgentsCard({
  isDark,
  t,
  lang,
  agents,
  compact = false,
  className,
}: Props) {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="metadata"
      accentHex="#a855f7"
      className={cn('min-h-0 max-h-full w-full min-w-0 flex-1', className)}
      contentClassName={cn(
        'flex max-h-full min-h-0 flex-col gap-1',
        compact ? 'p-2 pt-8' : 'p-3 pt-12 sm:p-4 sm:pt-12',
      )}
    >
      <div className={cn('absolute left-4 z-10 max-w-[calc(100%-2rem)]', compact ? 'top-2' : 'top-4')}>
        <div
          className={cn(
            'rounded-lg border font-bold tracking-wider',
            compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
            isDark
              ? 'border-violet-400/20 bg-violet-400/10 text-violet-300'
              : 'border-violet-400/30 bg-violet-400/15 text-violet-700',
          )}
        >
          {t.dashboardOverviewTop10Badge}
        </div>
      </div>

      <ChainTopAgentsList
        agents={agents}
        isDark={isDark}
        t={t}
        locale={locale}
        showTitle={false}
        density={compact ? 'overview' : 'default'}
        className="min-h-0 max-h-full flex-1 overflow-hidden border-0 bg-transparent p-0"
      />
    </AgentDetailCard>
  );
}
