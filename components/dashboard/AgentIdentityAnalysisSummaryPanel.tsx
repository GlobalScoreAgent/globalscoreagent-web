'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  formatIdentityScore,
  humanizeIdentityStage,
  type IdentityAnalysisSummary,
} from '@/lib/agentIdentityAnalysisSummary';
import { cn } from '@/lib/utils';

type Props = {
  summary: IdentityAnalysisSummary;
  isDark: boolean;
  t: Translations;
  formatDate: (iso: string | null | undefined) => string;
};

export function AgentIdentityAnalysisSummaryPanel({
  summary,
  isDark,
  t,
  formatDate,
}: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const valueClass = isDark ? 'text-zinc-200' : 'text-zinc-900';

  const badgeClass = isDark
    ? 'border-sky-500/35 bg-sky-500/10 text-sky-200'
    : 'border-sky-400/50 bg-sky-50 text-sky-800';

  const stageLabel = humanizeIdentityStage(summary.identity_stage);

  return (
    <div className="space-y-3 text-center">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
          {t.agentDetailIdentityScore}
        </p>
        <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
          {formatIdentityScore(summary.identity_score)}
        </p>
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
          {t.agentDetailIdentityStage}
        </p>
        <div className="mt-2 flex justify-center">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              badgeClass,
            )}
          >
            {stageLabel}
          </span>
        </div>
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
          {t.agentDetailIdentityLastRecord}
        </p>
        <p className={cn('mt-1 text-sm', valueClass)}>
          {formatDate(summary.last_identity_record_at)}
        </p>
      </div>
    </div>
  );
}
