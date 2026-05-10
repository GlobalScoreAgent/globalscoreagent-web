'use client';

import { useId, useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { ParsedFeedbackAxis } from '@/lib/agentFeedbackAnalysis';

export type AgentFeedbackRadarChartProps = {
  axes: ParsedFeedbackAxis[];
  isDark: boolean;
  t: Translations;
  emptyMessage: string;
};

const FIRST_LINE_BREAK_AT = 22;

/** Split category labels into two lines near word boundaries for perimeter ticks. */
function splitLongAngleLabel(text: string): string[] {
  const t = text.trim();
  if (t.length <= FIRST_LINE_BREAK_AT) return [t];
  const spaceBreak = t.lastIndexOf(' ', FIRST_LINE_BREAK_AT);
  const cut = spaceBreak > 10 ? spaceBreak : FIRST_LINE_BREAK_AT;
  const line1 = t.slice(0, cut).trim();
  const line2 = (spaceBreak > 10 ? t.slice(spaceBreak + 1) : t.slice(cut)).trim();
  if (!line2) return [t];
  if (line2.length > 28) return [line1, `${line2.slice(0, 26)}…`];
  return [line1, line2];
}

type PolarAngleTickRenderProps = {
  x?: number;
  y?: number;
  payload?: { value?: unknown; coordinate?: number; index?: number };
  textAnchor?: string;
  verticalAnchor?: string;
  fill?: string;
  index?: number;
};

function FeedbackPolarAngleTick(props: PolarAngleTickRenderProps) {
  const { x = 0, y = 0, payload, textAnchor = 'middle', verticalAnchor = 'middle', fill } = props;
  const raw = payload?.value;
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  const lines = splitLongAngleLabel(text);

  if (lines.length === 1) {
    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor as 'start' | 'middle' | 'end'}
        fill={fill}
        fontSize={10}
        className="recharts-polar-angle-axis-tick-value"
      >
        {lines[0]}
      </text>
    );
  }

  const [a, b] = lines;
  let startDy: string;
  let secondDy: string;
  if (verticalAnchor === 'start') {
    startDy = '0em';
    secondDy = '1.15em';
  } else if (verticalAnchor === 'end') {
    startDy = '-1.15em';
    secondDy = '1.15em';
  } else {
    startDy = '-0.55em';
    secondDy = '1.1em';
  }

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor as 'start' | 'middle' | 'end'}
      fill={fill}
      fontSize={10}
      className="recharts-polar-angle-axis-tick-value"
    >
      <tspan x={x} dy={startDy}>
        {a}
      </tspan>
      <tspan x={x} dy={secondDy}>
        {b}
      </tspan>
    </text>
  );
}

type RadarTooltipRows = Array<{
  value?: number;
  payload?: { subject?: string; value?: number; fullMark?: number };
}>;

function FeedbackRadarTooltip({
  active,
  payload,
  isDark,
}: {
  active?: boolean;
  payload?: RadarTooltipRows;
  isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as {
    subject?: string;
    value?: number;
    fullMark?: number;
  };
  const subject = typeof row?.subject === 'string' ? row.subject : '';
  const max = typeof row?.fullMark === 'number' && Number.isFinite(row.fullMark) ? row.fullMark : 100;
  const raw = payload[0]?.value;
  const v =
    typeof raw === 'number'
      ? raw
      : raw !== undefined && raw !== null
        ? Number(raw)
        : NaN;
  const numText = Number.isFinite(v)
    ? v.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '—';

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm ${
        isDark
          ? 'border-zinc-600/80 bg-zinc-900/95 text-zinc-100'
          : 'border-zinc-200/90 bg-white/95 text-zinc-900 shadow-zinc-900/10'
      }`}
    >
      {subject ? (
        <div className={`mb-1 max-w-[220px] text-xs font-medium leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {subject}
        </div>
      ) : null}
      <div className="font-semibold tabular-nums">
        {numText}
        <span className={`ml-1 text-xs font-normal tabular-nums ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          / {max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}

export function AgentFeedbackRadarChart({
  axes,
  isDark,
  t,
  emptyMessage,
}: AgentFeedbackRadarChartProps) {
  const uid = useId().replace(/:/g, '');
  const radFillId = `${uid}-radar-fill`;
  const glowFilterId = `${uid}-radar-glow`;

  const data = useMemo(
    () =>
      axes.map((a) => ({
        subject: t[a.subjectKey],
        value: a.value,
        fullMark: a.fullMark,
      })),
    [axes, t]
  );

  const stroke = isDark ? '#34d399' : '#059669';
  const fillSoft = isDark ? '#6ee7b7' : '#10b981';
  const gridStroke = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)';
  const tickFill = isDark ? '#a1a1aa' : '#52525b';

  if (!data.length) {
    return (
      <p
        className={`flex min-h-[280px] items-center justify-center text-sm ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}
      >
        {emptyMessage}
      </p>
    );
  }

  const domainMax = Math.max(...data.map((d) => d.fullMark), 100);
  const scaleCaption = t.agentDetailFeedbackRadarScale.replace(
    '{max}',
    String(Math.round(domainMax))
  );

  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 ${
        isDark
          ? 'border-white/[0.07] bg-gradient-to-br from-emerald-950/25 via-zinc-950/40 to-zinc-950/80'
          : 'border-zinc-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-zinc-50/95'
      }`}
    >
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="58%"
            margin={{ top: 28, right: 48, bottom: 36, left: 48 }}
            data={data}
          >
            <defs>
              <radialGradient id={radFillId} cx="50%" cy="50%" r="70%">
                <stop offset="8%" stopColor={fillSoft} stopOpacity={isDark ? 0.45 : 0.38} />
                <stop offset="55%" stopColor={stroke} stopOpacity={isDark ? 0.18 : 0.14} />
                <stop offset="100%" stopColor={stroke} stopOpacity={isDark ? 0.04 : 0.03} />
              </radialGradient>
              <filter id={glowFilterId} x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur" />
                <feFlood floodColor={stroke} floodOpacity={isDark ? 0.35 : 0.28} result="color" />
                <feComposite in="color" in2="blur" operator="in" result="shadow" />
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <PolarGrid
              gridType="circle"
              stroke={gridStroke}
              strokeWidth={1}
              strokeDasharray="4 7"
              radialLines
            />

            <PolarAngleAxis
              dataKey="subject"
              stroke={tickFill}
              tick={(tickProps) => (
                <FeedbackPolarAngleTick {...(tickProps as PolarAngleTickRenderProps)} />
              )}
              tickLine={false}
            />

            <PolarRadiusAxis
              angle={90}
              type="number"
              domain={[0, domainMax]}
              axisLine={false}
              tick={false}
              tickLine={false}
            />

            <Radar
              name={t.agentDetailFeedbackData}
              dataKey="value"
              stroke={stroke}
              strokeWidth={2.5}
              fill={`url(#${radFillId})`}
              fillOpacity={1}
              filter={`url(#${glowFilterId})`}
              dot={{ r: 3.5, fill: stroke, stroke: isDark ? '#18181b' : '#ffffff', strokeWidth: 1.5 }}
            />

            <Tooltip
              cursor={{ strokeDasharray: '5 5', stroke: stroke, strokeOpacity: 0.35 }}
              content={(tooltipProps) => (
                <FeedbackRadarTooltip
                  active={tooltipProps.active}
                  payload={tooltipProps.payload as unknown as RadarTooltipRows | undefined}
                  isDark={isDark}
                />
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p
        className={`mt-3 text-center text-xs tabular-nums ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}
      >
        {scaleCaption}
      </p>
    </div>
  );
}
