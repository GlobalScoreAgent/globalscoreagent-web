'use client';

import { useMemo } from 'react';
import { StackedDistributionBar } from '@/components/dashboard/StackedDistributionBar';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  humanizeRichnessDetailKey,
  type ParsedMetadataRichness,
  type ParsedRichnessLayer,
  type RichnessLayerKey,
} from '@/lib/metadataRichness';

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

function buildLayerBar(layer: ParsedRichnessLayer): {
  rowKeys: string[];
  row: Record<string, number | string>;
  slugToRaw: Map<string, string>;
} | null {
  const sorted = [...layer.detailEntries].sort((a, b) => b.value - a.value);
  if (sorted.length === 0) return null;
  const row: Record<string, number | string> = { name: layer.layerKey };
  const rowKeys: string[] = [];
  const slugToRaw = new Map<string, string>();
  for (const e of sorted) {
    row[e.slug] = e.value;
    rowKeys.push(e.slug);
    slugToRaw.set(e.slug, e.rawKey);
  }
  return { rowKeys, row, slugToRaw };
}

export function MetadataRichnessLayersChart({
  parsed,
  isDark,
  t,
}: {
  parsed: ParsedMetadataRichness;
  isDark: boolean;
  t: Translations;
}) {
  const layersBlocks = useMemo(() => {
    return parsed.layers.map((layer) => {
      const built = buildLayerBar(layer);
      return { layer, built };
    });
  }, [parsed.layers]);

  return (
    <div className="flex flex-col gap-8">
      {layersBlocks.map(({ layer, built }) => {
        const title = t[layerTitleKey(layer.layerKey)];
        const scoreLine = (
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{title}</p>
            <span className={`tabular-nums text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {layer.layerScore.toLocaleString()}
            </span>
          </div>
        );

        if (!built) {
          return (
            <div key={layer.layerKey}>
              {scoreLine}
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{t.agentDetailMetadataLayerNoBreakdown}</p>
            </div>
          );
        }

        const totalSeg = built.rowKeys.reduce((s, k) => s + (Number(built.row[k]) || 0), 0);
        if (totalSeg <= 0) {
          return (
            <div key={layer.layerKey}>
              {scoreLine}
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{t.agentDetailMetadataLayerNoBreakdown}</p>
            </div>
          );
        }

        const labelForKey = (slug: string) => {
          const raw = built.slugToRaw.get(slug);
          return raw ? humanizeRichnessDetailKey(raw) : slug;
        };

        const colors = (slug: string) => {
          const i = built.rowKeys.indexOf(slug);
          return SEGMENT_PALETTE[(i >= 0 ? i : 0) % SEGMENT_PALETTE.length];
        };

        return (
          <div key={layer.layerKey}>
            {scoreLine}
            <StackedDistributionBar
              title=""
              rowKeys={built.rowKeys}
              row={built.row}
              colors={colors}
              labelForKey={labelForKey}
              isDark={isDark}
              orientation="horizontal"
              className="[&>p:first-child]:hidden"
            />
          </div>
        );
      })}
    </div>
  );
}
