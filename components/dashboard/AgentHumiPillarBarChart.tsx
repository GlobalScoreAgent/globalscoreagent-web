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
import type { HumiPillarChartPoint, HumiPillarId } from '@/lib/indexHumiPillars';
import { hasAnyPillarScore } from '@/lib/indexHumiPillars';

export type AgentHumiPillarBarChartProps = {
  points: HumiPillarChartPoint[];
  selectedPillarId: HumiPillarId | null;
  onPillarSelect: (id: HumiPillarId) => void;
  accentColor: string;
  isDark: boolean;
  locale: string;
  emptyMessage: string;
  maxScoreLabel: string;
  notAvailableLabel: string;
};

type ChartRow = {
  pillarId: HumiPillarId;
  label: string;
  value: number;
  displayValue: number | null;
  index: number;
};

const BAR_RADIUS: [number, number, number, number] = [0, 8, 8, 0];

function formatScore(v: number | null, locale: string): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return v.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function pillarTrackFill(isDark: boolean): string {
  return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
}

function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace('#', '');
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? { r, g, b } : null;
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? { r, g, b } : null;
  }
  return null;
}

function mixHexWithWhite(hex: string, whiteMix: number): string {
  const rgb = parseHexColor(hex);
  if (!rgb) return hex;
  const t = Math.min(1, Math.max(0, whiteMix));
  const r = Math.round(rgb.r + (255 - rgb.r) * t);
  const g = Math.round(rgb.g + (255 - rgb.g) * t);
  const b = Math.round(rgb.b + (255 - rgb.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function pillarGradientStart(accentColor: string, index: number): string {
  return mixHexWithWhite(accentColor, 0.42 - index * 0.04);
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
  accentColor,
  isDark,
  locale,
  emptyMessage,
  maxScoreLabel,
  notAvailableLabel,
}: AgentHumiPillarBarChartProps) {
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
      points.map((p, index) => ({
        pillarId: p.id,
        label: p.label,
        value: p.value ?? 0,
        displayValue: p.value,
        index,
      })),
    [points],
  );

  if (!hasAnyPillarScore(points)) {
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
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 44, left: 4, bottom: 4 }}
        >
          <defs>
            {chartData.map((row) => (
              <linearGradient
                key={row.index}
                id={`${baseId}-grad-${row.index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor={pillarGradientStart(accentColor, row.index)}
                  stopOpacity={0.55}
                />
                <stop offset="55%" stopColor={accentColor} stopOpacity={0.88} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={1} />
              </linearGradient>
            ))}
            <filter id={`${baseId}-shadow`} x="-8%" y="-20%" width="116%" height="140%">
              <feDropShadow
                dx={0}
                dy={1}
                stdDeviation={2}
                floodColor={accentColor}
                floodOpacity={isDark ? 0.35 : 0.22}
              />
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke={gridStroke}
            strokeOpacity={1}
          />
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
            radius={BAR_RADIUS}
            maxBarSize={16}
            background={{ fill: trackFill, radius: BAR_RADIUS }}
            filter={`url(#${baseId}-shadow)`}
            isAnimationActive={!reduceMotion}
            animationDuration={reduceMotion ? 0 : 600}
            animationEasing="ease-out"
            style={{ cursor: 'pointer' }}
            activeBar={{
              fill: accentColor,
              fillOpacity: 1,
              stroke: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
              strokeWidth: 1,
              radius: BAR_RADIUS,
            }}
            onClick={(barData) => {
              const row = (barData as { payload?: ChartRow })?.payload;
              if (row?.pillarId) onPillarSelect(row.pillarId);
            }}
          >
            {chartData.map((row) => {
              const isSelected = selectedPillarId === row.pillarId;
              const dimmed =
                selectedPillarId !== null && selectedPillarId !== row.pillarId;
              return (
                <Cell
                  key={row.index}
                  fill={`url(#${baseId}-grad-${row.index})`}
                  fillOpacity={dimmed ? 0.4 : 1}
                  stroke={isSelected ? (isDark ? '#fafafa' : '#18181b') : 'transparent'}
                  strokeWidth={isSelected ? 2 : 0}
                />
              );
            })}
            <LabelList
              dataKey="displayValue"
              position="right"
              offset={8}
              fill={labelFill}
              fontSize={11}
              fontWeight={600}
              formatter={(v: number | null) => {
                if (v === null || v === undefined || !Number.isFinite(Number(v))) {
                  return notAvailableLabel;
                }
                return formatScore(Number(v), locale);
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
