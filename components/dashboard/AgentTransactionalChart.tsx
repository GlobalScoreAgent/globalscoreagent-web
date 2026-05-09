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
  /** Short caption for the delta badge (e.g. "vs anterior") */
  vsPreviousLabel: string;
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

function formatSignedDelta(delta: number, series: SeriesKind, locale: string): string {
  if (!Number.isFinite(delta)) return '—';
  if (series === 'nonce') {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      signDisplay: 'exceptZero',
    }).format(Math.round(delta));
  }
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
    signDisplay: 'exceptZero',
  }).format(delta);
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
  vsPreviousLabel,
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

  const deltaBadge = useMemo(() => {
    if (data.length < 2) return null;
    const prev = data[data.length - 2]?.value;
    const curr = data[data.length - 1]?.value;
    if (
      prev === undefined ||
      curr === undefined ||
      !Number.isFinite(prev) ||
      !Number.isFinite(curr)
    ) {
      return null;
    }
    const delta = curr - prev;
    let pct: number | null = null;
    if (prev !== 0) {
      pct = (delta / Math.abs(prev)) * 100;
    }
    const deltaText = formatSignedDelta(delta, series, locale);
    const pctText =
      pct !== null && Number.isFinite(pct)
        ? new Intl.NumberFormat(locale, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
            signDisplay: 'exceptZero',
          }).format(pct) + '%'
        : null;
    const sign = delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
    return { deltaText, pctText, sign };
  }, [data, series, locale]);

  if (data.length === 0) {
    return (
      <div
        className={`flex h-full items-center justify-center text-sm ${isDark ? 'text-gray-500' : 'text-zinc-500'}`}
      >
        {emptyMessage}
      </div>
    );
  }

  const badgeTone =
    deltaBadge?.sign === 'up'
      ? isDark
        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
        : 'border-emerald-500/35 bg-emerald-50 text-emerald-800'
      : deltaBadge?.sign === 'down'
        ? isDark
          ? 'border-rose-500/40 bg-rose-500/12 text-rose-300'
          : 'border-rose-400/40 bg-rose-50 text-rose-800'
        : isDark
          ? 'border-zinc-600 bg-zinc-800/90 text-zinc-400'
          : 'border-zinc-200 bg-zinc-100 text-zinc-600';

  return (
    <div className="relative h-full w-full">
      {deltaBadge ? (
        <div
          className={`absolute right-2 top-2 z-10 max-w-[11rem] rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug shadow-sm backdrop-blur-sm ${badgeTone}`}
          title={vsPreviousLabel}
          role="status"
          aria-label={`${vsPreviousLabel}: ${deltaBadge.deltaText}, ${deltaBadge.pctText ?? '—'}`}
        >
          <div className="font-semibold tabular-nums">{deltaBadge.deltaText}</div>
          <div className="mt-0.5 font-medium tabular-nums opacity-95">
            {deltaBadge.pctText !== null ? `(${deltaBadge.pctText})` : '(—)'}
          </div>
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 20, left: 4, bottom: 28 }}>
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
            height={42}
            tickMargin={6}
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
    </div>
  );
}
