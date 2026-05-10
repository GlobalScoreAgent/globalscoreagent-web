'use client';

import { useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { StackedDistributionBar } from '@/components/dashboard/StackedDistributionBar';
import { buildNonceDailySeries } from '@/lib/dashboardNonceSeries';

type OverviewStats = {
  humi_index_distribution: Record<string, number>;
  agent_metadata_distribution: Record<
    string,
    { count: number; percentage: number } | undefined
  >;
};

const GLOBAL_HUMI_ORDER = [
  { rangeKey: '0-10', slug: 'r0_10', color: '#dc2626', labelKey: 'humiCritical' as const },
  { rangeKey: '10-30', slug: 'r10_30', color: '#f97316', labelKey: 'humiModerateRisk' as const },
  { rangeKey: '30-60', slug: 'r30_60', color: '#eab308', labelKey: 'humiStable' as const },
  { rangeKey: '60-80', slug: 'r60_80', color: '#84cc16', labelKey: 'humiHighPerformance' as const },
  { rangeKey: '80-100', slug: 'r80_100', color: '#22c55e', labelKey: 'humiElite' as const },
];

const GLOBAL_META_ORDER = [
  { dbKey: 'Mala', slug: 'mala', color: '#dc2626', labelKey: 'metadataPoor' as const },
  { dbKey: 'Baja', slug: 'baja', color: '#f97316', labelKey: 'metadataLow' as const },
  { dbKey: 'Regular', slug: 'regular', color: '#f59e0b', labelKey: 'metadataRegular' as const },
  { dbKey: 'Bueno', slug: 'bueno', color: '#10b981', labelKey: 'metadataGood' as const },
  { dbKey: 'Excelente', slug: 'excelente', color: '#3b82f6', labelKey: 'metadataExcellent' as const },
  { dbKey: 'Elite', slug: 'elite', color: '#a855f7', labelKey: 'metadataElite' as const },
];

function formatNonceYAxisTick(v: number, useCompact: boolean): string {
  if (!Number.isFinite(v)) return '';
  if (useCompact && v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (useCompact && v >= 100_000) return `${Math.round(v / 1_000)}k`;
  return Math.round(v).toLocaleString();
}

export function DashboardOverviewInsightCard({
  isDark,
  t,
  currentStats,
  agentNonce,
}: {
  isDark: boolean;
  t: Translations;
  currentStats: OverviewStats;
  agentNonce: unknown;
}) {
  const gradientId = useId().replace(/:/g, '');
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';

  const nonceSeries = useMemo(() => buildNonceDailySeries(agentNonce), [agentNonce]);

  const nonceMax = useMemo(() => nonceSeries.reduce((m, d) => Math.max(m, d.nonces), 0), [nonceSeries]);

  const compactNonceYTick = nonceMax >= 100_000;

  const nonceTicks = useMemo(() => {
    const idx = [0, 7, 14, 21, 29];
    return idx.filter((i) => i < nonceSeries.length).map((i) => nonceSeries[i].date);
  }, [nonceSeries]);

  const lastPoint = nonceSeries.length > 0 ? nonceSeries[nonceSeries.length - 1] : null;

  const humiStack = useMemo(() => {
    const dist = currentStats.humi_index_distribution ?? {};
    const row: Record<string, number | string> = { name: 'humi' };
    const rowKeys: string[] = [];
    for (const seg of GLOBAL_HUMI_ORDER) {
      row[seg.slug] = Number(dist[seg.rangeKey]) || 0;
      rowKeys.push(seg.slug);
    }
    const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
    return { row, rowKeys, total };
  }, [currentStats.humi_index_distribution]);

  const metaStack = useMemo(() => {
    const md = currentStats.agent_metadata_distribution ?? {};
    const row: Record<string, number | string> = { name: 'meta' };
    const rowKeys: string[] = [];
    for (const seg of GLOBAL_META_ORDER) {
      const c = md[seg.dbKey]?.count;
      row[seg.slug] = c ?? 0;
      rowKeys.push(seg.slug);
    }
    const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
    return { row, rowKeys, total };
  }, [currentStats.agent_metadata_distribution]);

  const humiLabelForKey = (slug: string) => {
    const seg = GLOBAL_HUMI_ORDER.find((s) => s.slug === slug);
    return seg ? `${seg.rangeKey} · ${t[seg.labelKey]}` : slug;
  };

  const metaLabelForKey = (slug: string) => {
    const seg = GLOBAL_META_ORDER.find((s) => s.slug === slug);
    return seg ? t[seg.labelKey] : slug;
  };

  const humiColor = (slug: string) => GLOBAL_HUMI_ORDER.find((s) => s.slug === slug)?.color ?? '#71717a';
  const metaColor = (slug: string) => GLOBAL_META_ORDER.find((s) => s.slug === slug)?.color ?? '#71717a';

  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="transactional"
      accentHex="#38bdf8"
      className="min-h-0 w-full min-w-0 flex-1"
      contentClassName="flex flex-col gap-4 p-4 pt-14 sm:p-5 sm:pt-14"
    >
      <div className="absolute left-4 top-4 z-10">
        <div
          className={`rounded-lg border px-3 py-1 text-xs font-bold tracking-wider ${
            isDark ? 'border-blue-400/20 bg-blue-400/10 text-blue-400' : 'border-blue-400/30 bg-blue-400/20 text-blue-600'
          }`}
        >
          {t.agentNonceTitle}
        </div>
      </div>
      <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-1 text-right">
        <div
          className={`rounded-lg border px-3 py-1 text-xs font-bold tracking-wider ${
            isDark ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400' : 'border-emerald-400/30 bg-emerald-400/20 text-emerald-600'
          }`}
        >
          {t.last30DaysTitle}
        </div>
        {lastPoint ? (
          <div
            className={`hidden max-w-[14rem] rounded-lg border px-2 py-1 text-[11px] font-semibold leading-snug sm:block ${
              isDark ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-300' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-700'
            }`}
          >
            {t.totalLabel}: {lastPoint.nonces.toLocaleString()} {t.nonceLabel}
            {nonceSeries.length > 1 && nonceSeries[nonceSeries.length - 2].nonces > 0 ? (
              <> ({lastPoint.change})</>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
        <div className="h-44 min-h-0 w-full shrink-0 lg:min-w-0 lg:flex-1">
          {nonceSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={nonceSeries}
                margin={{ top: 8, right: 8, left: 12, bottom: 4 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={isDark ? 0.45 : 0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  type="category"
                  ticks={nonceTicks}
                  tickFormatter={(d: string) => String(new Date(d).getDate())}
                  stroke={axisStroke}
                  tick={{ fill: tickFill, fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  stroke={axisStroke}
                  tick={{ fill: tickFill, fontSize: 10 }}
                  width={56}
                  tickFormatter={(v: number) => formatNonceYAxisTick(v, compactNonceYTick)}
                  domain={[0, (max: number) => Math.max(1, Math.ceil(max * 1.05))]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#fff',
                    border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => {
                    try {
                      return new Date(String(label)).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    } catch {
                      return String(label);
                    }
                  }}
                  formatter={(value: unknown) => [
                    typeof value === 'number' ? value.toLocaleString() : '—',
                    t.nonceLabel,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="nonces"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={{ r: 2, fill: '#60a5fa', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex h-full items-center justify-center text-sm ${muted}`}>—</div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 border-t border-zinc-500/15 pt-3 lg:w-[220px] lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0 xl:w-[240px]">
          {humiStack.total > 0 ? (
            <StackedDistributionBar
              title={t.humiDistributionTitle}
              rowKeys={humiStack.rowKeys}
              row={humiStack.row}
              colors={humiColor}
              labelForKey={humiLabelForKey}
              isDark={isDark}
              orientation="vertical"
            />
          ) : (
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.humiDistributionTitle}</p>
          )}

          {metaStack.total > 0 ? (
            <StackedDistributionBar
              title={t.metadataRichnessTitle}
              rowKeys={metaStack.rowKeys}
              row={metaStack.row}
              colors={metaColor}
              labelForKey={metaLabelForKey}
              isDark={isDark}
              orientation="vertical"
            />
          ) : (
            <p className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>{t.metadataRichnessTitle}</p>
          )}
        </div>
      </div>
    </AgentDetailCard>
  );
}
