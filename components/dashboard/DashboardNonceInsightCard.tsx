'use client';

import { useId, useMemo, useRef } from 'react';
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
import { buildNonceDailySeries, getLatestNonceFromRaw } from '@/lib/dashboardNonceSeries';
import { cn } from '@/lib/utils';

function formatDateKeyLabel(dateKey: string, locale?: string): string {
  const [y, m, d] = dateKey.split('-').map((part) => Number(part));
  if (!y || !m || !d) return dateKey;
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAxisDateLabel(dateKey: string, locale?: string): string {
  const [y, m, d] = dateKey.split('-').map((part) => Number(part));
  if (!y || !m || !d) return dateKey;
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

/** Compact Y ticks for large nonce totals (prefer M over noisy k). */
function formatNonceYAxisTick(v: number, seriesMax: number): string {
  if (!Number.isFinite(v)) return '';
  const n = Math.round(v);
  if (n === 0) return '0';
  if (seriesMax >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (seriesMax >= 1_000) {
    const k = n / 1_000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return n.toLocaleString();
}

type Props = {
  isDark: boolean;
  t: Translations;
  agentNonce: unknown;
  compact?: boolean;
  className?: string;
  locale?: string;
};

export function DashboardNonceInsightCard({
  isDark,
  t,
  agentNonce,
  compact = false,
  className,
  locale,
}: Props) {
  const gradientId = useId().replace(/:/g, '');
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  const nonceSeries = useMemo(() => buildNonceDailySeries(agentNonce), [agentNonce]);
  const latestNonce = useMemo(() => getLatestNonceFromRaw(agentNonce), [agentNonce]);
  const latestSeriesPoint = useMemo(() => {
    if (!latestNonce) return null;
    return nonceSeries.find((p) => p.date === latestNonce.date) ?? null;
  }, [latestNonce, nonceSeries]);

  const nonceMax = useMemo(
    () =>
      nonceSeries.reduce((m, d) => (typeof d.nonces === 'number' ? Math.max(m, d.nonces) : m), 0),
    [nonceSeries],
  );
  const chartWrapRef = useRef<HTMLDivElement>(null);

  const titleBadgeClass = cn(
    'rounded-lg border font-bold tracking-wider',
    compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
    isDark ? 'border-blue-400/20 bg-blue-400/10 text-blue-400' : 'border-blue-400/30 bg-blue-400/20 text-blue-600',
  );

  const totalBadgeClass = cn(
    'rounded-lg border font-semibold leading-snug',
    compact ? 'px-1.5 py-0.5 text-[10px] text-right' : 'px-2 py-1 text-[11px] break-words',
    isDark ? 'border-emerald-400/15 bg-emerald-400/5 text-emerald-300' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-700',
  );

  const totalBadgeContent = latestNonce ? (
    <>
      {t.totalLabel}: {latestNonce.nonces.toLocaleString(locale)} {t.nonceLabel}
      {latestSeriesPoint?.change && latestSeriesPoint.change !== '0%' ? (
        <> ({latestSeriesPoint.change})</>
      ) : null}
    </>
  ) : null;

  const titleBadge = (
    <div className={cn('w-fit max-w-full', compact && 'min-w-0 max-w-[58%]')}>
      <div className={titleBadgeClass}>{t.dashboardInsightEcosystemBadge}</div>
    </div>
  );

  const totalBadge =
    latestNonce && totalBadgeContent ? (
      <div className={cn('w-fit max-w-full', compact && 'min-w-0 max-w-[42%] shrink-0 text-right')}>
        <div className={totalBadgeClass}>{totalBadgeContent}</div>
      </div>
    ) : null;

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="transactional"
      accentHex="#38bdf8"
      className={cn('h-full min-h-0 max-h-full w-full min-w-0 flex-1', className)}
      contentClassName={cn(
        'flex h-full min-h-0 flex-col gap-0',
        compact ? 'p-2 pt-8' : 'p-3 sm:p-4',
      )}
    >
      {compact ? (
        <div className="absolute inset-x-4 top-2 z-10 flex items-start justify-between gap-2">
          {titleBadge}
          {totalBadge}
        </div>
      ) : (
        <div className="mb-2 flex min-w-0 flex-col gap-2">
          {titleBadge}
          {totalBadge}
        </div>
      )}

      <div ref={chartWrapRef} className="relative min-h-[11rem] flex-1">
        {nonceSeries.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={compact ? 160 : 176}>
              <AreaChart
                data={nonceSeries}
                margin={{ top: 2, right: 4, left: 0, bottom: 0 }}
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
                  interval="preserveStartEnd"
                  minTickGap={28}
                  tickFormatter={(d: string) => formatAxisDateLabel(d, locale)}
                  stroke={axisStroke}
                  tick={{ fill: tickFill, fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  stroke={axisStroke}
                  tick={{ fill: tickFill, fontSize: 10 }}
                  width={54}
                  tickMargin={4}
                  tickCount={5}
                  allowDecimals={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatNonceYAxisTick(v, nonceMax)}
                  domain={[0, (max: number) => Math.max(1, Math.ceil(max * 1.05))]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#fff',
                    border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(label) => formatDateKeyLabel(String(label), locale)}
                  formatter={(value: unknown) => [
                    typeof value === 'number' && Number.isFinite(value)
                      ? value.toLocaleString(locale)
                      : '—',
                    t.nonceLabel,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="nonces"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  connectNulls={false}
                  dot={{ r: 2, fill: '#60a5fa', strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
        ) : (
          <div className={`flex h-full items-center justify-center text-sm ${muted}`}>—</div>
        )}
      </div>
    </AgentDetailCard>
  );
}
