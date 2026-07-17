'use client';

import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { WARNING_STAT_TKEY } from '@/lib/dashboardChains';
import {
  AGENT_WARNING_HELP_TKEY,
  type AgentWarningEntry,
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

export function AgentDetailWarningsBadges({ warnings, isDark, t, className }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center justify-center gap-2',
        className,
      )}
    >
      {warnings.map((warning) => (
        <div key={warning.type} className="inline-flex max-w-full items-center gap-1.5">
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
            placement="top"
            tooltipClassName="max-w-[16rem] whitespace-normal"
          />
        </div>
      ))}
    </div>
  );
}
