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
import type { PillarSummaryChartPoint } from '@/lib/indexHumiPillarSummary';

export type AgentHumiPillarSummaryBarChartProps = {
  points: PillarSummaryChartPoint[];
  accentColor: string;
  isDark: boolean;
  locale: string;
};

type ChartRow = PillarSummaryChartPoint;

const BAR_RADIUS: [number, number, number, number] = [6, 6, 0, 0];
const Y_DOMAIN_MAX = 10;

function formatScore(v: number, locale: string): string {
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
  accentColor,
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

  const chartData: ChartRow[] = useMemo(() => points, [points]);

  if (chartData.length === 0) {
    return null;
  }

  const barSize = 44;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 24, right: 8, left: 0, bottom: 8 }} barGap={-barSize}>
          <defs>
            {chartData.map((row, i) => (
              <linearGradient
                key={row.blockId}
                id={`${baseId}-grad-${i}`}
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop offset="0%" stopColor={mixHexWithWhite(accentColor, 0.35)} stopOpacity={0.55} />
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
            filter={`url(#${baseId}-shadow)`}
            isAnimationActive={!reduceMotion}
            animationDuration={reduceMotion ? 0 : 600}
            animationEasing="ease-out"
            activeBar={{
              fill: accentColor,
              fillOpacity: 1,
              stroke: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
              strokeWidth: 1,
              radius: BAR_RADIUS,
            }}
          >
            {chartData.map((row, i) => (
              <Cell key={row.blockId} fill={`url(#${baseId}-grad-${i})`} />
            ))}
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
