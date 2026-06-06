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
import { buildNonceDailySeries } from '@/lib/dashboardNonceSeries';
import { cn } from '@/lib/utils';

function formatNonceYAxisTick(v: number, useCompact: boolean): string {
  if (!Number.isFinite(v)) return '';
  if (useCompact && v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (useCompact && v >= 100_000) return `${Math.round(v / 1_000)}k`;
  return Math.round(v).toLocaleString();
}

type Props = {
  isDark: boolean;
  t: Translations;
  agentNonce: unknown;
  className?: string;
};

export function DashboardNonceInsightCard({ isDark, t, agentNonce, className }: Props) {
  const gradientId = useId().replace(/:/g, '');
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';

  const nonceSeries = useMemo(() => buildNonceDailySeries(agentNonce), [agentNonce]);
  const nonceMax = useMemo(() => nonceSeries.reduce((m, d) => Math.max(m, d.nonces), 0), [nonceSeries]);
  const compactNonceYTick = nonceMax >= 100_000;
  const nonceTicks = useMemo(() => {
    const idx = [0, 7, 14, 21, 29];
    return idx.filter((i) => i < nonceSeries.length).map((i) => nonceSeries[i].date);
  }, [nonceSeries]);
  const lastPoint = nonceSeries.length > 0 ? nonceSeries[nonceSeries.length - 1] : null;

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="transactional"
      accentHex="#38bdf8"
      className={cn('min-h-0 h-full w-full min-w-0 flex-1', className)}
      contentClassName="flex h-full min-h-[280px] flex-col gap-2 p-4 pt-14 sm:p-5 sm:pt-14"
    >
      <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)]">
        <div
          className={`rounded-lg border px-3 py-1 text-xs font-bold tracking-wider ${
            isDark ? 'border-blue-400/20 bg-blue-400/10 text-blue-400' : 'border-blue-400/30 bg-blue-400/20 text-blue-600'
          }`}
        >
          {t.dashboardInsightEcosystemBadge}
        </div>
      </div>

      <div className="flex min-h-8 shrink-0 items-start justify-end">
        {lastPoint ? (
          <div
            className={`max-w-full shrink-0 rounded-lg border px-2 py-1 text-right text-[11px] font-semibold leading-snug ${
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

      <div className="relative min-h-[10rem] w-full flex-1">
        {nonceSeries.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <AreaChart
              data={nonceSeries}
              margin={{ top: 8, right: 4, left: 4, bottom: 4 }}
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
    </AgentDetailCard>
  );
}
