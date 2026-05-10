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
import {
  useLanguage,
  type Translations,
} from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { FeedbackAxisSubjectKey, ParsedFeedbackAxis } from '@/lib/agentFeedbackAnalysis';

export type AgentFeedbackRadarChartProps = {
  axes: ParsedFeedbackAxis[];
  isDark: boolean;
  t: Translations;
  emptyMessage: string;
};

export type RadarDatum = {
  axisTick: string;
  axisIndex: number;
  subjectKey: FeedbackAxisSubjectKey;
  subject: string;
  value: number;
  fullMark: number;
};

type PolarAngleTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: unknown };
  textAnchor?: string;
  verticalAnchor?: string;
  fill?: string;
  isDark: boolean;
};

function FeedbackAxisNumberTick(props: PolarAngleTickProps) {
  const { x = 0, y = 0, payload, textAnchor = 'middle', verticalAnchor, isDark } = props;
  const v = payload?.value;
  const label = v !== undefined && v !== null ? String(v) : '';
  /** Bottom vertex tick sits tight to the grid; nudge down for even spacing. */
  const extraDy = verticalAnchor === 'end' ? 8 : 0;
  const textFill = isDark ? '#e4e4e7' : '#3f3f46';

  return (
    <text
      x={x}
      y={y}
      dy={extraDy}
      textAnchor={textAnchor as 'start' | 'middle' | 'end'}
      fill={textFill}
      fontSize={14}
      fontWeight={600}
      className="tabular-nums"
    >
      {label}
    </text>
  );
}

type RadarTooltipRows = Array<{
  value?: number;
  payload?: RadarDatum;
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
  const row = payload[0]?.payload;
  const subject = typeof row?.subject === 'string' ? row.subject : '';
  const axisIndex = typeof row?.axisIndex === 'number' ? row.axisIndex : null;
  const max =
    typeof row?.fullMark === 'number' && Number.isFinite(row.fullMark) ? row.fullMark : 100;
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

  const title =
    axisIndex !== null && subject ? `(${axisIndex}) ${subject}` : subject || '';

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm ${
        isDark
          ? 'border-zinc-600/80 bg-zinc-900/95 text-zinc-100'
          : 'border-zinc-200/90 bg-white/95 text-zinc-900 shadow-zinc-900/10'
      }`}
    >
      {title ? (
        <div className={`mb-1 max-w-[240px] text-xs font-medium leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {title}
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
  const { lang } = useLanguage();
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const uid = useId().replace(/:/g, '');
  const radFillId = `${uid}-radar-fill`;
  const glowFilterId = `${uid}-radar-glow`;

  const avgStrength = useMemo(() => {
    if (!axes.length) return null;
    const sum = axes.reduce((s, a) => s + a.value, 0);
    return sum / axes.length;
  }, [axes]);

  const data = useMemo<RadarDatum[]>(
    () =>
      axes.map((a, i) => ({
        axisTick: String(i + 1),
        axisIndex: i + 1,
        subjectKey: a.subjectKey,
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
  const legendAccent = isDark ? 'text-emerald-400' : 'text-emerald-600';

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

  const strengthTitle =
    avgStrength !== null
      ? t.agentDetailFeedbackRadarStrengthTitle
          .replace(
            '{avg}',
            avgStrength.toLocaleString(locale, { maximumFractionDigits: 2 })
          )
          .replace('{n}', String(data.length))
      : '';

  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 ${
        isDark
          ? 'border-white/[0.07] bg-gradient-to-br from-emerald-950/25 via-zinc-950/40 to-zinc-950/80'
          : 'border-zinc-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-zinc-50/95'
      }`}
    >
      {strengthTitle ? (
        <h3
          className={`mb-3 text-center text-sm font-semibold leading-snug sm:text-base ${
            isDark ? 'text-zinc-100' : 'text-zinc-900'
          }`}
        >
          {strengthTitle}
        </h3>
      ) : null}

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="86%"
            margin={{ top: 12, right: 14, bottom: 26, left: 14 }}
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
              dataKey="axisTick"
              stroke={tickFill}
              tick={(tickProps) => (
                <FeedbackAxisNumberTick
                  {...(tickProps as unknown as PolarAngleTickProps)}
                  isDark={isDark}
                />
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
        className={`mt-2 text-center text-xs tabular-nums ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}
      >
        {scaleCaption}
      </p>

      <div
        className={`mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 text-xs sm:grid-cols-2 ${
          isDark ? 'text-zinc-300' : 'text-zinc-700'
        }`}
      >
        {data.map((row) => {
          const vText = row.value.toLocaleString(undefined, { maximumFractionDigits: 2 });
          const maxText = row.fullMark.toLocaleString(undefined, { maximumFractionDigits: 0 });
          return (
            <div key={row.subjectKey} className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={`shrink-0 font-semibold tabular-nums ${legendAccent}`}>{row.axisIndex}.</span>
              <span className="min-w-0 flex-1 leading-snug">{row.subject}</span>
              <span
                className={`shrink-0 tabular-nums ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                title={`${vText} / ${maxText}`}
              >
                {vText}
                <span className="mx-0.5 opacity-70">/</span>
                {maxText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
