'use client';

import { useId, useMemo, useCallback } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { humanizeChainKey } from '@/lib/agentWalletActivity';

type SeriesKind = 'nonce' | 'balance';

export type TransactionalChartRow = {
  label: string;
  value?: number;
  [key: string]: string | number | undefined;
};

export type AgentTransactionalChartProps = {
  data: TransactionalChartRow[];
  series: SeriesKind;
  isDark: boolean;
  locale: string;
  emptyMessage: string;
  /** Short caption for the delta badge (e.g. "vs anterior") — single-series only */
  vsPreviousLabel: string;
  /** When set (length > 0), render multi-line chart (nonce or balance) */
  multiSeriesKeys?: string[];
  /** Optional display labels for multi-series keys (legend/tooltip) */
  multiSeriesLabels?: Record<string, string>;
  /** Appended to balance values (e.g. native gas ticker ETH) */
  valueSuffix?: string | null;
};

const MULTI_COLORS = [
  '#34d399',
  '#38bdf8',
  '#a78bfa',
  '#fbbf24',
  '#f472b6',
  '#fb923c',
  '#2dd4bf',
  '#818cf8',
];

function formatYTick(
  v: number,
  series: SeriesKind,
  locale: string,
  suffix?: string | null,
): string {
  if (!Number.isFinite(v)) return '';
  if (series === 'nonce') {
    return Math.round(v).toLocaleString(locale, { maximumFractionDigits: 0 });
  }
  const n = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(v);
  const s = typeof suffix === 'string' ? suffix.trim() : '';
  return s ? `${n} ${s}` : n;
}

function formatTooltipValue(
  v: number,
  series: SeriesKind,
  locale: string,
  suffix?: string | null,
): string {
  if (!Number.isFinite(v)) return '—';
  if (series === 'nonce') {
    return Math.round(v).toLocaleString(locale, { maximumFractionDigits: 0 });
  }
  const n = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(v);
  const s = typeof suffix === 'string' ? suffix.trim() : '';
  return s ? `${n} ${s}` : n;
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
  valueSuffix,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: number; name?: string; color?: string }> | undefined;
  series: SeriesKind;
  locale: string;
  isDark: boolean;
  valueSuffix?: string | null;
}) {
  if (!active || !payload?.length) return null;
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
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const v = entry.value;
          if (v === undefined || v === null || !Number.isFinite(Number(v))) return null;
          return (
            <div key={`${entry.name ?? i}`} className="flex items-center gap-2">
              {entry.color ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
              ) : null}
              {entry.name && payload.length > 1 ? (
                <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {entry.name}
                </span>
              ) : null}
              <span className="font-semibold tabular-nums">
                {formatTooltipValue(Number(v), series, locale, valueSuffix)}
              </span>
            </div>
          );
        })}
      </div>
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
  multiSeriesKeys,
  multiSeriesLabels,
  valueSuffix,
}: AgentTransactionalChartProps) {
  const gradId = useId().replace(/:/g, '');
  const lineColor = isDark ? '#34d399' : '#059669';
  const lineColorSoft = isDark ? '#6ee7b7' : '#10b981';
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';
  const gridStroke = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const isMulti =
    Array.isArray(multiSeriesKeys) && multiSeriesKeys.length > 0;

  const yTickFormatter = useMemo(
    () => (v: number) => formatYTick(v, series, locale, valueSuffix),
    [series, locale, valueSuffix],
  );

  const deltaBadge = useMemo(() => {
    if (isMulti || data.length < 2) return null;
    const prev = data[data.length - 2]?.value;
    const curr = data[data.length - 1]?.value;
    if (
      prev === undefined ||
      curr === undefined ||
      !Number.isFinite(Number(prev)) ||
      !Number.isFinite(Number(curr))
    ) {
      return null;
    }
    const delta = Number(curr) - Number(prev);
    let pct: number | null = null;
    if (Number(prev) !== 0) {
      pct = (delta / Math.abs(Number(prev))) * 100;
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
  }, [data, series, locale, isMulti]);

  const badgeTone = useMemo(() => {
    if (!deltaBadge) {
      return isDark
        ? 'border-zinc-600 bg-zinc-800/90 text-zinc-400'
        : 'border-zinc-200 bg-zinc-100 text-zinc-600';
    }
    if (deltaBadge.sign === 'up') {
      return isDark
        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
        : 'border-emerald-500/35 bg-emerald-50 text-emerald-800';
    }
    if (deltaBadge.sign === 'down') {
      return isDark
        ? 'border-rose-500/40 bg-rose-500/12 text-rose-300'
        : 'border-rose-400/40 bg-rose-50 text-rose-800';
    }
    return isDark
      ? 'border-zinc-600 bg-zinc-800/90 text-zinc-400'
      : 'border-zinc-200 bg-zinc-100 text-zinc-600';
  }, [deltaBadge, isDark]);

  const renderAreaDot = useCallback(
    (props: { cx?: number; cy?: number; index?: number; r?: number }) => {
      const { cx, cy, index, r = 3.5 } = props;
      if (cx === undefined || cy === undefined || index === undefined) return null;

      const dotStroke = isDark ? '#18181b' : '#ffffff';
      const isLast = index === data.length - 1;

      if (!isLast || !deltaBadge) {
        return (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={lineColor}
            stroke={dotStroke}
            strokeWidth={1.5}
          />
        );
      }

      const BADGE_W = 120;
      const BADGE_H = 52;
      const gap = 8;
      let bx = cx - BADGE_W / 2;
      bx = Math.max(2, bx);
      const by = cy - r - gap - BADGE_H;

      const ariaLabel = `${vsPreviousLabel}: ${deltaBadge.deltaText}, ${deltaBadge.pctText ?? '—'}`;

      return (
        <g>
          <foreignObject
            x={bx}
            y={by}
            width={BADGE_W}
            height={BADGE_H}
            pointerEvents="none"
          >
            <div
              title={vsPreviousLabel}
              role="status"
              aria-label={ariaLabel}
              className={`box-border flex h-full w-full flex-col justify-center rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug shadow-sm backdrop-blur-sm pointer-events-none ${badgeTone}`}
            >
              <div className="font-semibold tabular-nums">{deltaBadge.deltaText}</div>
              <div className="mt-0.5 font-medium tabular-nums opacity-95">
                {deltaBadge.pctText !== null ? `(${deltaBadge.pctText})` : '(—)'}
              </div>
            </div>
          </foreignObject>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={lineColor}
            stroke={dotStroke}
            strokeWidth={1.5}
          />
        </g>
      );
    },
    [data.length, deltaBadge, badgeTone, lineColor, isDark, vsPreviousLabel],
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

  const chartMarginTop = !isMulti && deltaBadge ? 52 : 16;
  const xInterval = data.length > 12 ? Math.ceil(data.length / 8) - 1 : 0;

  if (isMulti && multiSeriesKeys) {
    return (
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 16, right: 20, left: 4, bottom: 28 }}
          >
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
              interval={xInterval}
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
                  payload={
                    props.payload as unknown as
                      | Array<{ value?: number; name?: string; color?: string }>
                      | undefined
                  }
                  series={series}
                  locale={locale}
                  isDark={isDark}
                  valueSuffix={valueSuffix}
                />
              )}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              formatter={(value) =>
                multiSeriesLabels?.[String(value)] ??
                humanizeChainKey(String(value))
              }
            />
            {multiSeriesKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={multiSeriesLabels?.[key] ?? key}
                stroke={MULTI_COLORS[i % MULTI_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: chartMarginTop, right: 20, left: 4, bottom: 28 }}
        >
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
            interval={xInterval}
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
                valueSuffix={valueSuffix}
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
            dot={renderAreaDot as React.ComponentProps<typeof Area>['dot']}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
