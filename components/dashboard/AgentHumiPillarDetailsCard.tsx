'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { PillarExecutiveSummaryRow } from '@/lib/indexHumiPillarExecutiveSummary';
import type { IndexDetailCopy } from '@/lib/indexDetailCopy';
import { getHumiIndexDetailCopy } from '@/lib/indexDetailCopy';
import {
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
} from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  selectedPillarId: string | null;
  pillarLabel: string | null;
  rows: PillarExecutiveSummaryRow[];
  summaryMissing: boolean;
  isDark: boolean;
  t?: Translations;
  copy?: IndexDetailCopy;
  subtitleExtra?: string | null;
};

export function AgentHumiPillarDetailsCard({
  selectedPillarId,
  pillarLabel,
  rows,
  summaryMissing,
  isDark,
  t,
  copy,
  subtitleExtra,
}: Props) {
  const c = copy ?? getHumiIndexDetailCopy(t as Translations);
  const cardInlay = dashboardCardInlayClass(isDark);
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const border = isDark ? 'border-zinc-700/60' : 'border-zinc-200';
  const headBg = isDark ? 'bg-zinc-800/60' : 'bg-zinc-50';
  const rowHover = isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50';

  const hasPillar = selectedPillarId !== null;
  const subtitle =
    hasPillar && pillarLabel
      ? subtitleExtra
        ? `${subtitleExtra} · ${pillarLabel}`
        : pillarLabel
      : subtitleExtra;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 shrink-0">
        <h2 className={cn('text-2xl font-semibold', dashboardFormHeadingClass(isDark))}>
          {c.pillarDetailsTitle}
        </h2>
        {subtitle ? (
          <p className={cn('mt-1 text-sm font-medium', muted)}>{subtitle}</p>
        ) : null}
      </div>

      <div className={cn('min-h-0 flex-1 overflow-hidden rounded-2xl border', border, cardInlay)}>
        {!hasPillar ? (
          <div className={cn('flex h-full min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {c.pillarDetailsSelectPillar}
          </div>
        ) : summaryMissing || rows.length === 0 ? (
          <div className={cn('flex h-full min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {c.pillarDetailsNoData}
          </div>
        ) : (
          <div className="h-full overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className={cn('border-b text-xs font-semibold uppercase tracking-wide', border, headBg, muted)}>
                  <th className="w-[12rem] px-4 py-3">{c.pillarDetailsColInformation}</th>
                  <th className="px-4 py-3">{c.pillarDetailsColDescription}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={cn('border-b transition-colors', border, rowHover)}
                  >
                    <td
                      className={cn(
                        'px-4 py-3 align-top font-medium',
                        dashboardFormBodyClass(isDark),
                      )}
                    >
                      {row.label}
                    </td>
                    <td className={cn('px-4 py-3 align-top', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
