'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentProtocolActivityCarousel } from '@/components/dashboard/AgentProtocolActivityCarousel';
import {
  buildCarouselRows,
  formatProtocolActivityScore,
  formatProtocolRatePct,
  globalPaymentRate,
  globalValidRate,
  type ProtocolActivitySummary,
} from '@/lib/agentProtocolActivitySummary';
import { cn } from '@/lib/utils';

type Props = {
  summary: ProtocolActivitySummary;
  isDark: boolean;
  t: Translations;
  formatDate: (iso: string | null | undefined) => string;
  resetKey?: string;
};

export function AgentProtocolActivitySummaryPanel({
  summary,
  isDark,
  t,
  formatDate,
  resetKey,
}: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const valueClass = isDark ? 'text-zinc-200' : 'text-zinc-900';

  const carouselRows = useMemo(() => buildCarouselRows(summary), [summary]);
  const globalValidLabel = formatProtocolRatePct(
    globalValidRate(summary.protocol_activity_valid_count, summary.protocol_activity_count),
  );
  const globalPaymentLabel = formatProtocolRatePct(
    globalPaymentRate(
      summary.protocol_activity_valid_payment_count,
      summary.protocol_activity_count,
    ),
  );

  return (
    <div className="space-y-5">
      <AgentProtocolActivityCarousel
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
            {t.agentDetailProtocolActivityTotal}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
            {summary.protocol_activity_count.toLocaleString()}
          </p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailProtocolActivityGlobalScore}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
            {formatProtocolActivityScore(summary.protocol_activity_score)}
          </p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailProtocolActivityGlobalValidRate}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
            {globalValidLabel}
          </p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailProtocolActivityGlobalPaymentRate}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
            {globalPaymentLabel}
          </p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailProtocolActivityLastRecord}
          </p>
          <p className={cn('mt-1 text-sm', valueClass)}>
            {formatDate(summary.last_protocol_activity_record_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
