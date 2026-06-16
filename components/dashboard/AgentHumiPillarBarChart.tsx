'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { barGradientStart } from '@/lib/chartBarGradient';
import { getPillarScoreBandColor } from '@/lib/indexHumiScoreColors';

export type PillarChartPoint = {
  id: string;
  label: string;
  value: number | null;
};

export type AgentHumiPillarBarChartProps = {
  points: PillarChartPoint[];
  selectedPillarId: string | null;
  onPillarSelect: (id: string) => void;
  isDark: boolean;
  locale: string;
  emptyMessage: string;
  maxScoreLabel: string;
  notAvailableLabel: string;
  orientation?: 'horizontal' | 'vertical';
  interactive?: boolean;
};

type ChartRow = {
  pillarId: string;
  label: string;
  value: number;
  displayValue: number | null;
  barColor: string;
  index: number;
};

const HORIZONTAL_BAR_RADIUS: [number, number, number, number] = [0, 8, 8, 0];
const VERTICAL_BAR_RADIUS: [number, number, number, number] = [8, 8, 0, 0];

function formatScore(v: number | null, locale: string): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return v.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function pillarTrackFill(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
}

function ChartTooltip({
  active,
  label,
  payload,
  locale,
  isDark,
  maxScoreLabel,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: ChartRow }> | undefined;
  locale: string;
  isDark: boolean;
  maxScoreLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  const val = formatScore(row.displayValue, locale);
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
      <div className="font-semibold tabular-nums">
        {val} {maxScoreLabel}
      </div>
    </div>
  );
}

export function AgentHumiPillarBarChart({
  points,
  selectedPillarId,
  onPillarSelect,
  isDark,
  locale,
  emptyMessage,
  maxScoreLabel,
  notAvailableLabel,
  orientation = 'horizontal',
  interactive = true,
}: AgentHumiPillarBarChartProps) {
  const baseId = useId().replace(/:/g, '');
  const [reduceMotion, setReduceMotion] = useState(false);
  const isHorizontal = orientation === 'horizontal';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';
  const gridStroke = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const trackFill = pillarTrackFill(isDark);
  const labelFill = isDark ? '#e4e4e7' : '#3f3f46';
  const barRadius = isHorizontal ? HORIZONTAL_BAR_RADIUS : VERTICAL_BAR_RADIUS;

  const chartData: ChartRow[] = useMemo(
    () =>
      points.map((p, index) => ({
        pillarId: p.id,
        label: p.label,
        value: p.value ?? 0,
        displayValue: p.value,
        barColor: getPillarScoreBandColor(p.value),
        index,
      })),
    [points],
  );

  if (!points.some((p) => p.value !== null && Number.isFinite(p.value))) {
    return (
      <div
        className={`flex h-full items-center justify-center text-sm ${isDark ? 'text-gray-500' : 'text-zinc-500'}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          data={chartData}
          margin={
            isHorizontal
              ? { top: 8, right: 44, left: 4, bottom: 4 }
              : { top: 8, right: 8, left: 4, bottom: 32 }
          }
        >
          <defs>
            {chartData.map((row) => (
              <linearGradient
                key={row.index}
                id={`${baseId}-grad-${row.index}`}
                x1="0"
                y1="0"
                x2={isHorizontal ? '1' : '0'}
                y2={isHorizontal ? '0' : '1'}
              >
                <stop
                  offset="0%"
                  stopColor={barGradientStart(row.barColor, 0.42 - row.index * 0.04)}
                  stopOpacity={0.55}
                />
                <stop offset="55%" stopColor={row.barColor} stopOpacity={0.88} />
                <stop offset="100%" stopColor={row.barColor} stopOpacity={1} />
              </linearGradient>
            ))}
            {chartData.map((row) => (
              <filter
                key={`shadow-${row.index}`}
                id={`${baseId}-shadow-${row.index}`}
                x="-8%"
                y="-20%"
                width="116%"
                height="140%"
              >
                <feDropShadow
                  dx={0}
                  dy={1}
                  stdDeviation={2}
                  floodColor={row.barColor}
                  floodOpacity={isDark ? 0.35 : 0.22}
                />
              </filter>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={!isHorizontal}
            vertical={isHorizontal}
            stroke={gridStroke}
            strokeOpacity={1}
          />
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                domain={[0, 25]}
                ticks={[0, 5, 10, 15, 20, 25]}
                tick={{ fill: tickFill, fontSize: 10 }}
                stroke={axisStroke}
                tickLine={{ stroke: axisStroke }}
                axisLine={{ stroke: axisStroke }}
                height={28}
                tickMargin={4}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={108}
                tick={{ fill: tickFill, fontSize: 11 }}
                stroke={axisStroke}
                tickLine={false}
                axisLine={{ stroke: axisStroke }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey="label"
                tick={{ fill: tickFill, fontSize: 10 }}
                stroke={axisStroke}
                tickLine={false}
                axisLine={{ stroke: axisStroke }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={48}
              />
              <YAxis
                type="number"
                domain={[0, 25]}
                ticks={[0, 5, 10, 15, 20, 25]}
                tick={{ fill: tickFill, fontSize: 10 }}
                stroke={axisStroke}
                tickLine={{ stroke: axisStroke }}
                axisLine={{ stroke: axisStroke }}
                width={32}
              />
            </>
          )}
          <Tooltip
            cursor={{
              fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }}
            content={(props) => (
              <ChartTooltip
                active={props.active}
                label={props.label}
                payload={props.payload as unknown as Array<{ payload?: ChartRow }> | undefined}
                locale={locale}
                isDark={isDark}
                maxScoreLabel={maxScoreLabel}
              />
            )}
          />
          <Bar
            dataKey="value"
            radius={barRadius}
            maxBarSize={isHorizontal ? 16 : 40}
            background={{ fill: trackFill, radius: 8 }}
            isAnimationActive={!reduceMotion}
            animationDuration={reduceMotion ? 0 : 600}
            animationEasing="ease-out"
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={
              interactive
                ? (barData) => {
                    const row = (barData as { payload?: ChartRow })?.payload;
                    if (row?.pillarId) onPillarSelect(row.pillarId);
                  }
                : undefined
            }
          >
            {chartData.map((row) => {
              const isSelected = selectedPillarId === row.pillarId;
              const dimmed =
                interactive && selectedPillarId !== null && selectedPillarId !== row.pillarId;
              return (
                <Cell
                  key={row.index}
                  fill={`url(#${baseId}-grad-${row.index})`}
                  fillOpacity={dimmed ? 0.4 : 1}
                  stroke={isSelected ? (isDark ? '#fafafa' : '#18181b') : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                  filter={`url(#${baseId}-shadow-${row.index})`}
                />
              );
            })}
            <LabelList
              dataKey="displayValue"
              position={isHorizontal ? 'right' : 'top'}
              offset={isHorizontal ? 8 : 4}
              fill={labelFill}
              fontSize={11}
              fontWeight={600}
              formatter={(v) => {
                const n = typeof v === 'number' ? v : Number(v);
                if (!Number.isFinite(n)) {
                  return notAvailableLabel;
                }
                return formatScore(n, locale);
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
