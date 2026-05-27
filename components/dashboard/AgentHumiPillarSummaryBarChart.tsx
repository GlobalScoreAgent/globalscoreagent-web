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
import { getBlockPercentBandColor } from '@/lib/indexHumiScoreColors';
import type { PillarSummaryBlockId, PillarSummaryChartPoint } from '@/lib/indexHumiPillarSummary';

export type AgentHumiPillarSummaryBarChartProps = {
  points: PillarSummaryChartPoint[];
  selectedBlockId?: PillarSummaryBlockId | null;
  onBlockSelect?: (id: PillarSummaryBlockId) => void;
  isDark: boolean;
  locale: string;
};

type ChartRow = PillarSummaryChartPoint & { barColor: string; index: number };

const BAR_RADIUS: [number, number, number, number] = [6, 6, 0, 0];
const Y_DOMAIN_MAX = 10;

function formatScore(v: number, locale: string): string {
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
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: ChartRow }> | undefined;
  locale: string;
  isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const row = payload.find((p) => p.payload && 'value' in p.payload)?.payload ?? payload[0]?.payload;
  if (!row) return null;
  const val = formatScore(row.value, locale);
  const max = formatScore(row.max, locale);
  const labelText =
    label !== undefined && label !== null && String(label) !== '' ? String(label) : row.label;
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm ${
        isDark
          ? 'border-zinc-600/80 bg-zinc-900/95 text-zinc-100'
          : 'border-zinc-200/90 bg-white/95 text-zinc-900 shadow-zinc-900/10'
      }`}
    >
      <div className={`mb-1 text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {labelText}
      </div>
      <div className="font-semibold tabular-nums">
        {val} / {max}
      </div>
    </div>
  );
}

export function AgentHumiPillarSummaryBarChart({
  points,
  selectedBlockId = null,
  onBlockSelect,
  isDark,
  locale,
}: AgentHumiPillarSummaryBarChartProps) {
  const baseId = useId().replace(/:/g, '');
  const [reduceMotion, setReduceMotion] = useState(false);

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

  const chartData: ChartRow[] = useMemo(
    () =>
      points.map((row, index) => ({
        ...row,
        barColor: getBlockPercentBandColor(row.value, row.max),
        index,
      })),
    [points],
  );

  if (chartData.length === 0) {
    return null;
  }

  const barSize = 44;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 24, right: 8, left: 0, bottom: 8 }} barGap={-barSize}>
          <defs>
            {chartData.map((row) => (
              <linearGradient
                key={row.blockId}
                id={`${baseId}-grad-${row.index}`}
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop offset="0%" stopColor={barGradientStart(row.barColor, 0.35)} stopOpacity={0.55} />
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
            domain={[0, Y_DOMAIN_MAX]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: tickFill, fontSize: 11 }}
            stroke={axisStroke}
            tickLine={{ stroke: axisStroke }}
            axisLine={{ stroke: axisStroke }}
            width={32}
            tickFormatter={(v) => String(Math.round(Number(v)))}
          />
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
              />
            )}
          />
          <Bar
            dataKey="max"
            radius={BAR_RADIUS}
            barSize={barSize}
            fill={trackFill}
            isAnimationActive={!reduceMotion}
            animationDuration={reduceMotion ? 0 : 600}
          />
          <Bar
            dataKey="value"
            radius={BAR_RADIUS}
            barSize={barSize}
            isAnimationActive={!reduceMotion}
            animationDuration={reduceMotion ? 0 : 600}
            animationEasing="ease-out"
            style={onBlockSelect ? { cursor: 'pointer' } : undefined}
            onClick={
              onBlockSelect
                ? (barData) => {
                    const row = (barData as { payload?: ChartRow })?.payload;
                    if (row?.blockId) onBlockSelect(row.blockId);
                  }
                : undefined
            }
          >
            {chartData.map((row) => {
              const isSelected = selectedBlockId === row.blockId;
              const dimmed =
                selectedBlockId !== null && selectedBlockId !== row.blockId;
              return (
                <Cell
                  key={row.blockId}
                  fill={`url(#${baseId}-grad-${row.index})`}
                  fillOpacity={dimmed ? 0.4 : 1}
                  stroke={isSelected ? (isDark ? '#fafafa' : '#18181b') : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                  filter={`url(#${baseId}-shadow-${row.index})`}
                />
              );
            })}
            <LabelList
              dataKey="value"
              position="top"
              offset={6}
              fill={labelFill}
              fontSize={11}
              fontWeight={600}
              formatter={(v: number) => formatScore(Number(v), locale)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
