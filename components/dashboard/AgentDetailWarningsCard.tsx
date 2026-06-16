'use client';

import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { WARNING_STAT_TKEY } from '@/lib/dashboardChains';
import {
  AGENT_WARNING_HELP_TKEY,
  type AgentWarningEntry,
  worstAgentWarningSeverity,
} from '@/lib/agentWarnings';
import { cn } from '@/lib/utils';

type Props = {
  warnings: AgentWarningEntry[];
  isDark: boolean;
  t: Translations;
  className?: string;
};

function severityStyles(severity: AgentWarningEntry['severity'], isDark: boolean) {
  if (severity === 'high') {
    return isDark
      ? 'border-rose-500/35 bg-rose-500/10 text-rose-200'
      : 'border-rose-400/50 bg-rose-50 text-rose-800';
  }
  return isDark
    ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
    : 'border-amber-400/50 bg-amber-50 text-amber-900';
}

function accentForWorstSeverity(worst: ReturnType<typeof worstAgentWarningSeverity>): string {
  if (worst === 'high') return '#f43f5e';
  if (worst === 'medium') return '#f59e0b';
  return '#71717a';
}

export function AgentDetailWarningsCard({ warnings, isDark, t, className }: Props) {
  const worst = worstAgentWarningSeverity(warnings);
  const accent = accentForWorstSeverity(worst);
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-500';

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="chain"
      accentHex={accent}
      className={cn('min-w-0', className)}
      contentClassName="overflow-visible p-4"
    >
      <h3
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
      >
        {t.agentDetailWarningsTitle}
      </h3>

      {warnings.length === 0 ? (
        <p className={`text-sm ${muted}`}>{t.agentDetailWarningsEmpty}</p>
      ) : (
        <ul className="space-y-3 overflow-visible">
          {warnings.map((warning) => (
            <li key={warning.type} className="min-w-0 overflow-visible">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-snug',
                    severityStyles(warning.severity, isDark),
                  )}
                >
                  <span className="whitespace-normal break-words">
                    {t[WARNING_STAT_TKEY[warning.type]]}
                  </span>
                </span>
                <DashboardInfoTooltip
                  content={t[AGENT_WARNING_HELP_TKEY[warning.type]]}
                  ariaLabel={t.agentDetailWarningInfoAriaLabel}
                  isDark={isDark}
                  placement="left"
                  tooltipClassName="max-w-[16rem] whitespace-normal"
                />
              </div>
              <p className={`mt-1 break-words text-xs leading-snug ${muted}`}>{warning.message}</p>
            </li>
          ))}
        </ul>
      )}
    </AgentDetailCard>
  );
}
