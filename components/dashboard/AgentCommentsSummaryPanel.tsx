'use client';

import { useMemo } from 'react';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { DistributionPieChart } from '@/components/dashboard/DistributionPieChart';
import {
  buildCommentsPieRow,
  commentsRatio,
  formatCommentsRatioPct,
  type CommentsPieKey,
  type CommentsSummary,
} from '@/lib/agentCommentsSummary';
import { cn } from '@/lib/utils';

type Props = {
  summary: CommentsSummary;
  isDark: boolean;
  t: Translations;
  formatDate: (iso: string | null | undefined) => string;
};

const PIE_COLORS: Record<CommentsPieKey, string> = {
  valid: '#10b981',
  revoke: '#f43f5e',
  other: '#71717a',
};

export function AgentCommentsSummaryPanel({ summary, isDark, t, formatDate }: Props) {
  const muted = isDark ? 'text-zinc-500' : 'text-zinc-600';
  const valueClass = isDark ? 'text-zinc-200' : 'text-zinc-900';

  const { rowKeys, row } = useMemo(() => buildCommentsPieRow(summary), [summary]);
  const ratioPct = commentsRatio(summary.comment_valid_count, summary.comment_count);
  const ratioLabel = formatCommentsRatioPct(ratioPct);

  const labelForKey = (k: CommentsPieKey) => {
    if (k === 'valid') return t.agentDetailCommentsPieValid;
    if (k === 'revoke') return t.agentDetailCommentsPieRevoked;
    return t.agentDetailCommentsPieOther;
  };

  const colors = (k: CommentsPieKey) => PIE_COLORS[k];

  return (
    <div className="space-y-5">
      <div className="h-[12rem] w-full min-h-[11rem] sm:h-[13rem]">
        {rowKeys.length > 0 && summary.comment_count > 0 ? (
          <DistributionPieChart
            rowKeys={rowKeys}
            row={row}
            colors={(k) => colors(k as CommentsPieKey)}
            labelForKey={(k) => labelForKey(k as CommentsPieKey)}
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
        {t.agentDetailCommentsTotal}:{' '}
        <span className={cn('font-semibold tabular-nums', valueClass)}>
          {summary.comment_count.toLocaleString()}
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
            {t.agentDetailCommentsRatio}
          </p>
          <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueClass)}>{ratioLabel}</p>
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>
            {t.agentDetailCommentsLastRecord}
          </p>
          <p className={cn('mt-1 text-sm', valueClass)}>
            {formatDate(summary.last_comment_record_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
