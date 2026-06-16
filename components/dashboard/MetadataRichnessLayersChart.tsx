'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  MetadataRichnessTreemap,
  METADATA_REMAINING_RAW_KEY,
  METADATA_REMAINING_SLUG,
  type MetadataTreemapDatum,
} from '@/components/dashboard/MetadataRichnessTreemap';
import {
  MetadataRichnessItemLegend,
  type MetadataRichnessLegendItem,
} from '@/components/dashboard/MetadataRichnessItemLegend';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { RichnessExplanationLang } from '@/lib/metadataRichnessExplanations';
import {
  humanizeRichnessDetailKey,
  metadataLayerMaxPoints,
  type ParsedMetadataRichness,
  type ParsedRichnessLayer,
  type RichnessLayerKey,
} from '@/lib/metadataRichness';
import { cn } from '@/lib/utils';

const SEGMENT_PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#f43f5e',
];

const REMAINING_FILL = { dark: '#52525b', light: '#d4d4d8' };

function layerTitleKey(layerKey: RichnessLayerKey): keyof Translations {
  switch (layerKey) {
    case 'basic':
      return 'agentDetailMetadataLayerBasic';
    case 'intermediate':
      return 'agentDetailMetadataLayerIntermediate';
    case 'advanced':
      return 'agentDetailMetadataLayerAdvanced';
    default:
      return 'agentDetailMetadataLayerBasic';
  }
}

function layerRangeLabelKey(layerKey: RichnessLayerKey): keyof Translations {
  switch (layerKey) {
    case 'basic':
      return 'agentDetailMetadataLayerRangeBasic';
    case 'intermediate':
      return 'agentDetailMetadataLayerRangeIntermediate';
    case 'advanced':
      return 'agentDetailMetadataLayerRangeAdvanced';
    default:
      return 'agentDetailMetadataLayerRangeBasic';
  }
}

function buildLayerTreemap(
  layer: ParsedRichnessLayer,
  cap: number,
  isDark: boolean,
  remainingLabel: string,
): {
  treemapData: MetadataTreemapDatum[];
  legendItems: MetadataRichnessLegendItem[];
} | null {
  const sorted = [...layer.detailEntries].sort((a, b) => b.value - a.value);
  if (sorted.length === 0) return null;

  const remaining = Math.max(0, cap - layer.layerScore);
  let colorIndex = 0;

  const legendItems: MetadataRichnessLegendItem[] = sorted.map((entry) => {
    const color =
      entry.value > 0
        ? SEGMENT_PALETTE[colorIndex++ % SEGMENT_PALETTE.length]
        : isDark
          ? '#3f3f46'
          : '#e4e4e7';
    return {
      slug: entry.slug,
      rawKey: entry.rawKey,
      label: humanizeRichnessDetailKey(entry.rawKey),
      value: entry.value,
      color,
    };
  });

  const treemapData: MetadataTreemapDatum[] = sorted
    .filter((entry) => entry.value > 0)
    .map((entry) => {
      const legend = legendItems.find((l) => l.slug === entry.slug)!;
      return {
        name: legend.label,
        value: entry.value,
        fill: legend.color,
        slug: entry.slug,
        rawKey: entry.rawKey,
        isRemaining: false,
      };
    });

  if (remaining > 0) {
    const remainingColor = isDark ? REMAINING_FILL.dark : REMAINING_FILL.light;
    treemapData.push({
      name: remainingLabel,
      value: remaining,
      fill: remainingColor,
      slug: METADATA_REMAINING_SLUG,
      rawKey: METADATA_REMAINING_RAW_KEY,
      isRemaining: true,
    });
    legendItems.push({
      slug: METADATA_REMAINING_SLUG,
      rawKey: METADATA_REMAINING_RAW_KEY,
      label: remainingLabel,
      value: remaining,
      color: remainingColor,
      isRemaining: true,
    });
  }

  const treemapTotal = treemapData.reduce((s, n) => s + n.value, 0);
  if (treemapTotal <= 0) return null;

  return { treemapData, legendItems };
}

export function MetadataRichnessLayersChart({
  parsed,
  isDark,
  t,
  lang,
  resetKey,
}: {
  parsed: ParsedMetadataRichness;
  isDark: boolean;
  t: Translations;
  lang: RichnessExplanationLang;
  resetKey?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mutedSmall = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const remainingLabel = t.agentDetailMetadataLayerRemaining;

  const slides = useMemo(
    () =>
      parsed.layers.map((layer) => {
        const cap = metadataLayerMaxPoints(layer.layerKey);
        const built = buildLayerTreemap(layer, cap, isDark, remainingLabel);
        return { layer, cap, built };
      }),
    [parsed.layers, isDark, remainingLabel],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey, slides.length]);

  const safeIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const activeSlide = slides[safeIndex];
  const canNavigate = slides.length > 1;

  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((i) => (i + 1) % slides.length);
  };

  const navBtnClass = cn(
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
    isDark
      ? 'border-zinc-600 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40'
      : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40',
  );

  if (!activeSlide) return null;

  const { layer, built } = activeSlide;
  const title = t[layerTitleKey(layer.layerKey)];
  const cap = metadataLayerMaxPoints(layer.layerKey);

  const scoreLine = (
    <div className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-0.5">
        <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
          {title}
        </p>
        <p className={`text-[11px] tabular-nums ${mutedSmall}`}>
          {t[layerRangeLabelKey(layer.layerKey)]}
        </p>
      </div>
      <span
        className={`shrink-0 tabular-nums text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
      >
        {layer.layerScore.toLocaleString()} / {cap}
      </span>
    </div>
  );

  let chartBody;

  if (!built) {
    chartBody = (
      <p className={`text-xs ${mutedSmall}`}>{t.agentDetailMetadataLayerNoBreakdown}</p>
    );
  } else {
    chartBody = (
      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-2">
        <MetadataRichnessTreemap data={built.treemapData} isDark={isDark} />
        <MetadataRichnessItemLegend
          items={built.legendItems}
          isDark={isDark}
          lang={lang}
          t={t}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {scoreLine}

      <div className="mb-2 flex shrink-0 items-center justify-between gap-1">
        <button
          type="button"
          className={navBtnClass}
          onClick={goPrev}
          disabled={!canNavigate}
          aria-label={t.agentDetailMetadataLayerPrev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <span
          className={`min-w-0 flex-1 truncate text-center text-[11px] font-semibold tabular-nums ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
        >
          {safeIndex + 1} / {slides.length}
        </span>
        <button
          type="button"
          className={navBtnClass}
          onClick={goNext}
          disabled={!canNavigate}
          aria-label={t.agentDetailMetadataLayerNext}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">{chartBody}</div>

      {canNavigate ? (
        <div className="mt-3 flex shrink-0 justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.layer.layerKey}
              type="button"
              aria-label={`${t[layerTitleKey(slide.layer.layerKey)]} (${i + 1}/${slides.length})`}
              aria-current={i === safeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === safeIndex
                  ? isDark
                    ? 'bg-sky-400'
                    : 'bg-sky-600'
                  : isDark
                    ? 'bg-zinc-600 hover:bg-zinc-500'
                    : 'bg-zinc-300 hover:bg-zinc-400',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
