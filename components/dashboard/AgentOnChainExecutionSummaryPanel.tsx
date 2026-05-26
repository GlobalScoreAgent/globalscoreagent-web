'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentOnChainExecutionCarousel } from '@/components/dashboard/AgentOnChainExecutionCarousel';
import {
  buildCarouselRows,
  executionValidRate,
  formatExecutionRatePct,
  type OnChainExecutionSummary,
} from '@/lib/agentOnChainExecutionSummary';
import { cn } from '@/lib/utils';

type Props = {
  summary: OnChainExecutionSummary;
  isDark: boolean;
  t: Translations;
  formatDate: (iso: string | null | undefined) => string;
  resetKey?: string;
};

export function AgentOnChainExecutionSummaryPanel({
  summary,
  isDark,
  t,
  formatDate,
  resetKey,
}: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const valueClass = isDark ? 'text-zinc-200' : 'text-zinc-900';

  const carouselRows = useMemo(() => buildCarouselRows(summary), [summary]);
  const ratePct = executionValidRate(
    summary.on_chain_execution_valid_count,
    summary.on_chain_executions_count,
  );
  const rateLabel = formatExecutionRatePct(ratePct);

  return (
    <div className="space-y-5">
      <AgentOnChainExecutionCarousel
        rows={carouselRows}
        isDark={isDark}
        t={t}
        resetKey={resetKey}
        formatDate={formatDate}
      />

      <div
        className={cn(
          'space-y-3 border-t pt-4 text-center',
          isDark ? 'border-zinc-700/40' : 'border-zinc-200/80',
        )}
      >
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailOnChainExecutionTotal}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
            {summary.on_chain_executions_count.toLocaleString()}
          </p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailOnChainExecutionRate}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>{rateLabel}</p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailOnChainExecutionLastRecord}
          </p>
          <p className={cn('mt-1 text-sm', valueClass)}>
            {formatDate(summary.last_on_chain_execution_record_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
