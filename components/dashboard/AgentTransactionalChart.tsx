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
import type { DeltaChartPoint } from '@/lib/agentDeltaSeries';

type SeriesKind = 'nonce' | 'balance';

export type AgentTransactionalChartProps = {
  data: DeltaChartPoint[];
  series: SeriesKind;
  isDark: boolean;
  locale: string;
  emptyMessage: string;
};

function formatYTick(v: number, series: SeriesKind, locale: string): string {
  if (!Number.isFinite(v)) return '';
  if (series === 'nonce') {
    return Math.round(v).toLocaleString(locale, { maximumFractionDigits: 0 });
  }
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(v);
}

function formatTooltipValue(v: number, series: SeriesKind, locale: string): string {
  if (!Number.isFinite(v)) return '—';
  if (series === 'nonce') {
    return Math.round(v).toLocaleString(locale, { maximumFractionDigits: 0 });
  }
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(v);
}

function ChartTooltip({
  active,
  label,
  payload,
  series,
  locale,
  isDark,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: number }> | undefined;
  series: SeriesKind;
  locale: string;
  isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  if (v === undefined || v === null || !Number.isFinite(Number(v))) return null;
  const val = formatTooltipValue(Number(v), series, locale);
  const labelText =
    label !== undefined && label !== null && String(label) !== '' ? String(label) : null;
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm ${
        isDark
          ? 'border-zinc-600/80 bg-zinc-900/95 text-zinc-100'
          : 'border-zinc-200/90 bg-white/95 text-zinc-900 shadow-zinc-900/10'
      }`}
    >
      {labelText ? (
        <div className={`mb-1 text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {labelText}
        </div>
      ) : null}
      <div className="font-semibold tabular-nums">{val}</div>
    </div>
  );
}

export function AgentTransactionalChart({
  data,
  series,
  isDark,
  locale,
  emptyMessage,
}: AgentTransactionalChartProps) {
  const gradId = useId().replace(/:/g, '');
  const lineColor = isDark ? '#34d399' : '#059669';
  const lineColorSoft = isDark ? '#6ee7b7' : '#10b981';
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';
  const gridStroke = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const yTickFormatter = useMemo(
    () => (v: number) => formatYTick(v, series, locale),
    [series, locale]
  );

  if (data.length === 0) {
    return (
      <div
        className={`flex h-full items-center justify-center text-sm ${isDark ? 'text-gray-500' : 'text-zinc-500'}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 16, right: 8, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
            <stop offset="55%" stopColor={lineColorSoft} stopOpacity={0.12} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={gridStroke}
          strokeOpacity={1}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: tickFill, fontSize: 11 }}
          stroke={axisStroke}
          tickLine={{ stroke: axisStroke }}
          axisLine={{ stroke: axisStroke }}
          interval={0}
          height={36}
        />
        <YAxis
          tick={{ fill: tickFill, fontSize: 11 }}
          stroke={axisStroke}
          tickLine={{ stroke: axisStroke }}
          axisLine={{ stroke: axisStroke }}
          width={52}
          tickFormatter={yTickFormatter}
        />
        <Tooltip
          cursor={{
            stroke: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            strokeWidth: 1,
          }}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              label={props.label}
              payload={props.payload as unknown as Array<{ value?: number }> | undefined}
              series={series}
              locale={locale}
              isDark={isDark}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2.75}
          fill={`url(#${gradId})`}
          activeDot={{
            r: 6,
            stroke: isDark ? '#18181b' : '#fafafa',
            strokeWidth: 2,
            fill: lineColor,
          }}
          dot={{
            r: 3.5,
            fill: lineColor,
            stroke: isDark ? '#18181b' : '#ffffff',
            strokeWidth: 1.5,
          }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
