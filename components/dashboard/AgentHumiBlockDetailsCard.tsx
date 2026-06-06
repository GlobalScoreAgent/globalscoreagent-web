'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import { getHumiBusinessDescription } from '@/lib/indexHumiBusinessDescriptions';
import type { HumiPillarId } from '@/lib/indexHumiPillars';
import type { PillarSummaryBlockId, PillarSummaryItem } from '@/lib/indexHumiPillarSummary';
import { formatPillarSummaryReasonShort } from '@/lib/indexHumiReasonSummary';
import {
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
} from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Lang = 'es' | 'en';

export type BlockDetailsRow = {
  item: PillarSummaryItem;
  businessDescription: string;
  reasonSummary: string;
};

type Props = {
  selectedPillarId: HumiPillarId | null;
  selectedBlockId: PillarSummaryBlockId | null;
  pillarLabel: string | null;
  blockLabel: string | null;
  rows: BlockDetailsRow[];
  blockTotalScore: number | null;
  blockMaxScore: number | null;
  blockScoreColor: string;
  isDark: boolean;
  locale: string;
  lang: Lang;
  t: Translations;
};

function formatPoints(value: number, locale: string, notAvailable: string): string {
  if (!Number.isFinite(value)) return notAvailable;
  return value.toLocaleString(locale, { maximumFractionDigits: 2 });
}

export function AgentHumiBlockDetailsCard({
  selectedPillarId,
  selectedBlockId,
  pillarLabel,
  blockLabel,
  rows,
  blockTotalScore,
  blockMaxScore,
  blockScoreColor,
  isDark,
  locale,
  t,
}: Props) {
  const cardInlay = dashboardCardInlayClass(isDark);
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const border = isDark ? 'border-zinc-700/60' : 'border-zinc-200';
  const headBg = isDark ? 'bg-zinc-800/60' : 'bg-zinc-50';
  const rowHover = isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50';

  const hasPillar = selectedPillarId !== null;
  const hasBlock = selectedBlockId !== null;
  const showTotalRow =
    rows.length > 0 && blockTotalScore !== null && blockMaxScore !== null;

  return (
    <>
      <div className="mb-4">
        <h2 className={cn('text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
          {t.agentHumiBlockDetailsTitle}
        </h2>
        {hasPillar && pillarLabel && hasBlock && blockLabel ? (
          <p className={cn('mt-1 text-sm font-medium', muted)}>
            {pillarLabel} · {blockLabel}
          </p>
        ) : null}
      </div>

      <div className={cn('overflow-hidden rounded-2xl border', border, cardInlay)}>
        {!hasPillar ? (
          <div className={cn('flex min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {t.agentHumiBlockDetailsSelectPillar}
          </div>
        ) : !hasBlock ? (
          <div className={cn('flex min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {t.agentHumiBlockDetailsSelectBlock}
          </div>
        ) : rows.length === 0 ? (
          <div className={cn('flex min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {t.agentHumiBlockDetailsNoItems}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className={cn('border-b text-xs font-semibold uppercase tracking-wide', border, headBg, muted)}>
                  <th className="px-4 py-3">{t.agentHumiBlockDetailsColItem}</th>
                  <th className="px-4 py-3">{t.agentHumiBlockDetailsColBusiness}</th>
                  <th className="px-4 py-3">{t.agentHumiBlockDetailsColReason}</th>
                  <th className="px-4 py-3 text-right tabular-nums">{t.agentHumiBlockDetailsColScore}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.item.name}-${index}`}
                    className={cn('border-b transition-colors', border, rowHover)}
                  >
                    <td
                      className={cn(
                        'px-4 py-3 align-top font-medium',
                        dashboardFormBodyClass(isDark),
                      )}
                    >
                      {row.item.name}
                    </td>
                    <td className={cn('px-4 py-3 align-top', isDark ? 'text-zinc-300' : 'text-zinc-700')}>
                      {row.businessDescription}
                    </td>
                    <td className={cn('px-4 py-3 align-top', muted)}>{row.reasonSummary}</td>
                    <td
                      className="px-4 py-3 align-top text-right font-semibold tabular-nums"
                      style={{ color: blockScoreColor }}
                    >
                      {formatPoints(row.item.points, locale, t.notAvailable)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {showTotalRow ? (
                <tfoot>
                  <tr
                    className={cn(
                      'border-t-2 font-semibold',
                      border,
                      headBg,
                      isDark ? 'text-zinc-100' : 'text-zinc-900',
                    )}
                  >
                    <td colSpan={3} className="px-4 py-3">
                      {t.agentHumiBlockDetailsTotalLabel}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: blockScoreColor }}>
                      {formatPoints(blockTotalScore, locale, t.notAvailable)}
                      <span className="font-normal opacity-80">
                        {' '}
                        / {formatPoints(blockMaxScore, locale, t.notAvailable)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export function buildBlockDetailsRows(
  items: PillarSummaryItem[],
  pillarId: HumiPillarId,
  blockId: PillarSummaryBlockId,
  lang: Lang,
  t: Translations,
): BlockDetailsRow[] {
  return items.map((item) => ({
    item,
    businessDescription: getHumiBusinessDescription(
      pillarId,
      blockId,
      item.name,
      lang,
      t.agentHumiBlockDetailsGenericDescription,
    ),
    reasonSummary: formatPillarSummaryReasonShort(
      item.reason,
      lang,
      t.agentHumiBlockDetailsReasonEmpty,
    ),
  }));
}
