'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import { getHumiBusinessDescription } from '@/lib/indexHumiBusinessDescriptions';
import { getWamiBusinessDescription } from '@/lib/indexWamiBusinessDescriptions';
import type { HumiPillarId } from '@/lib/indexHumiPillars';
import type { WamiPillarId } from '@/lib/indexWamiPillars';
import type { PillarSummaryBlockId, PillarSummaryItem } from '@/lib/indexHumiPillarSummary';
import {
  formatPillarSummaryItemDetails,
  formatPillarSummaryReasonShort,
} from '@/lib/indexHumiReasonSummary';
import type { IndexDetailCopy } from '@/lib/indexDetailCopy';
import { getHumiIndexDetailCopy } from '@/lib/indexDetailCopy';
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
  itemDetails: string;
};

type Props = {
  selectedPillarId: string | null;
  selectedBlockId: PillarSummaryBlockId | null;
  pillarLabel: string | null;
  blockLabel: string | null;
  rows: BlockDetailsRow[];
  blockTotalScore: number | null;
  blockMaxScore: number | null;
  blockScoreColor: string;
  isDark: boolean;
  locale: string;
  notAvailableLabel: string;
  t?: Translations;
  copy?: IndexDetailCopy;
  subtitleExtra?: string | null;
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
  notAvailableLabel,
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
  const hasBlock = selectedBlockId !== null;
  const showTotalRow =
    rows.length > 0 && blockTotalScore !== null && blockMaxScore !== null;

  const subtitleParts: string[] = [];
  if (subtitleExtra) subtitleParts.push(subtitleExtra);
  if (hasPillar && pillarLabel) subtitleParts.push(pillarLabel);
  if (hasBlock && blockLabel) subtitleParts.push(blockLabel);

  return (
    <>
      <div className="mb-4">
        <h2 className={cn('text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
          {c.blockDetailsTitle}
        </h2>
        {subtitleParts.length > 0 ? (
          <p className={cn('mt-1 text-sm font-medium', muted)}>{subtitleParts.join(' · ')}</p>
        ) : null}
      </div>

      <div className={cn('overflow-hidden rounded-2xl border', border, cardInlay)}>
        {!hasPillar ? (
          <div className={cn('flex min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {c.blockDetailsSelectPillar}
          </div>
        ) : !hasBlock ? (
          <div className={cn('flex min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {c.blockDetailsSelectBlock}
          </div>
        ) : rows.length === 0 ? (
          <div className={cn('flex min-h-[12rem] items-center justify-center px-6 py-10 text-center text-sm', muted)}>
            {c.blockDetailsNoItems}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className={cn('border-b text-xs font-semibold uppercase tracking-wide', border, headBg, muted)}>
                  <th className="px-4 py-3">{c.blockDetailsColItem}</th>
                  <th className="px-4 py-3">{c.blockDetailsColBusiness}</th>
                  <th className="px-4 py-3">{c.blockDetailsColReason}</th>
                  <th className="px-4 py-3">{c.blockDetailsColItemDetails}</th>
                  <th className="px-4 py-3 text-right tabular-nums">{c.blockDetailsColScore}</th>
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
                    <td className={cn('px-4 py-3 align-top', muted)}>{row.itemDetails}</td>
                    <td
                      className="px-4 py-3 align-top text-right font-semibold tabular-nums"
                      style={{ color: blockScoreColor }}
                    >
                      {formatPoints(row.item.points, locale, notAvailableLabel)}
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
                    <td colSpan={4} className="px-4 py-3">
                      {c.blockDetailsTotalLabel}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: blockScoreColor }}>
                      {formatPoints(blockTotalScore, locale, notAvailableLabel)}
                      <span className="font-normal opacity-80">
                        {' '}
                        / {formatPoints(blockMaxScore, locale, notAvailableLabel)}
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
  const copy = getHumiIndexDetailCopy(t);
  return items.map((item) => ({
    item,
    businessDescription: getHumiBusinessDescription(
      pillarId,
      blockId,
      item.name,
      lang,
      copy.blockDetailsGenericDescription,
    ),
    reasonSummary: formatPillarSummaryReasonShort(
      item.reason,
      lang,
      copy.blockDetailsReasonEmpty,
    ),
    itemDetails: formatPillarSummaryItemDetails(
      item.reason,
      lang,
      copy.blockDetailsItemDetailsEmpty,
    ),
  }));
}

export function buildWamiBlockDetailsRows(
  items: PillarSummaryItem[],
  pillarId: WamiPillarId,
  blockId: PillarSummaryBlockId,
  lang: Lang,
  copy: IndexDetailCopy,
): BlockDetailsRow[] {
  return items.map((item) => ({
    item,
    businessDescription: getWamiBusinessDescription(
      pillarId,
      blockId,
      item.name,
      lang,
      copy.blockDetailsGenericDescription,
    ),
    reasonSummary: formatPillarSummaryReasonShort(
      item.reason,
      lang,
      copy.blockDetailsReasonEmpty,
    ),
    itemDetails: formatPillarSummaryItemDetails(
      item.reason,
      lang,
      copy.blockDetailsItemDetailsEmpty,
    ),
  }));
}
