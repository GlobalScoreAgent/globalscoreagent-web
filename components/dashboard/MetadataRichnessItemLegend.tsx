'use client';

import { DashboardInfoTooltip } from '@/components/dashboard/DashboardInfoTooltip';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { RichnessExplanationLang } from '@/lib/metadataRichnessExplanations';
import { getRichnessItemExplanation } from '@/lib/metadataRichnessExplanations';
import { METADATA_REMAINING_RAW_KEY } from '@/components/dashboard/MetadataRichnessTreemap';
import { cn } from '@/lib/utils';

export type MetadataRichnessLegendItem = {
  slug: string;
  rawKey: string;
  label: string;
  value: number;
  color: string;
  isRemaining?: boolean;
};

type Props = {
  items: MetadataRichnessLegendItem[];
  isDark: boolean;
  lang: RichnessExplanationLang;
  t: Translations;
};

export function MetadataRichnessItemLegend({ items, isDark, lang, t }: Props) {
  if (items.length === 0) return null;

  const legendMuted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const legendValue = isDark ? 'text-zinc-200' : 'text-zinc-800';

  return (
    <ul
      className="mt-2 grid shrink-0 grid-cols-1 gap-1.5 sm:grid-cols-2"
      aria-label="Chart legend"
    >
      {items.map((item) => {
        const explanation = item.isRemaining
          ? t.agentDetailMetadataLayerRemainingHelp
          : getRichnessItemExplanation(item.rawKey, lang) ??
            t.agentDetailMetadataItemExplanationFallback;

        return (
          <li
            key={item.slug}
            className={cn(
              'flex min-w-0 items-start justify-between gap-2 rounded-lg border px-2 py-1.5',
              isDark ? 'border-zinc-700/50 bg-zinc-950/30' : 'border-zinc-200/80 bg-white/60',
            )}
          >
            <span className="flex min-w-0 flex-1 items-start gap-1.5">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className={`min-w-0 truncate text-[10px] leading-tight ${legendMuted}`}>
                {item.label}
              </span>
              <DashboardInfoTooltip
                content={explanation}
                ariaLabel={t.agentDetailMetadataItemInfoAriaLabel}
                isDark={isDark}
                placement="top"
                tooltipClassName="max-w-[16rem] whitespace-normal normal-case"
              />
            </span>
            <span className={`shrink-0 text-[10px] font-semibold tabular-nums ${legendValue}`}>
              {item.value.toLocaleString()}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
