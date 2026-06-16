'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { DistributionPieChart } from '@/components/dashboard/DistributionPieChart';
import {
  attestationsRate,
  buildAttestationsPieRow,
  formatAttestationScoreAvg,
  formatAttestationsRatePct,
  type AttestationsPieKey,
  type AttestationsSummary,
} from '@/lib/agentAttestationsSummary';
import { cn } from '@/lib/utils';

type Props = {
  summary: AttestationsSummary;
  isDark: boolean;
  t: Translations;
  formatDate: (iso: string | null | undefined) => string;
};

const PIE_COLORS: Record<AttestationsPieKey, string> = {
  valid: '#10b981',
  spam: '#f59e0b',
  revoke: '#f43f5e',
  other: '#71717a',
};

export function AgentAttestationsSummaryPanel({ summary, isDark, t, formatDate }: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const valueClass = isDark ? 'text-zinc-200' : 'text-zinc-900';

  const { rowKeys, row } = useMemo(() => buildAttestationsPieRow(summary), [summary]);
  const ratePct = attestationsRate(
    summary.attestations_valid_count,
    summary.attestations_total_count,
  );
  const rateLabel = formatAttestationsRatePct(ratePct);

  const labelForKey = (k: AttestationsPieKey) => {
    if (k === 'valid') return t.agentDetailAttestationsPieValid;
    if (k === 'spam') return t.agentDetailAttestationsPieSpam;
    if (k === 'revoke') return t.agentDetailAttestationsPieRevoked;
    return t.agentDetailAttestationsPieOther;
  };

  const colors = (k: AttestationsPieKey) => PIE_COLORS[k];

  return (
    <div className="space-y-5">
      <div className="h-[12rem] w-full min-h-[11rem] sm:h-[13rem]">
        {rowKeys.length > 0 && summary.attestations_total_count > 0 ? (
          <DistributionPieChart
            rowKeys={rowKeys}
            row={row}
            colors={(k) => colors(k as AttestationsPieKey)}
            labelForKey={(k) => labelForKey(k as AttestationsPieKey)}
            isDark={isDark}
            sideLegendWithValues
            innerRadius={0}
            className="h-full"
          />
        ) : (
          <p className={`py-8 text-center text-sm ${muted}`}>{t.agentDetailNoJsonToShow}</p>
        )}
      </div>

      <p className={cn('text-center text-sm', muted)}>
        {t.agentDetailAttestationsTotal}:{' '}
        <span className={cn('font-semibold tabular-nums', valueClass)}>
          {summary.attestations_total_count.toLocaleString()}
        </span>
      </p>

      <div
        className={cn(
          'space-y-3 border-t pt-4 text-center',
          isDark ? 'border-zinc-700/40' : 'border-zinc-200/80',
        )}
      >
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailAttestationsRate}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>{rateLabel}</p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailAttestationsScoreAvg}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>
            {formatAttestationScoreAvg(summary.attestation_score_avg)}
          </p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailAttestationsLastRecord}
          </p>
          <p className={cn('mt-1 text-sm', valueClass)}>
            {formatDate(summary.last_attestation_record_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
