'use client';

import { useMemo } from 'react';
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

export function AgentFeedbackRadarChart({
  axes,
  isDark,
  t,
  emptyMessage,
}: AgentFeedbackRadarChartProps) {
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
  const fill = isDark ? '#34d399' : '#10b981';
  const gridStroke = isDark ? 'rgba(161,161,170,0.35)' : 'rgba(161,161,170,0.55)';
  const tickFill = isDark ? '#a1a1aa' : '#52525b';
  const radiusStroke = isDark ? 'rgba(161,161,170,0.25)' : 'rgba(161,161,170,0.4)';

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

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="52%" outerRadius="72%" data={data}>
          <PolarGrid stroke={gridStroke} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: tickFill, fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, domainMax]}
            tick={{ fill: tickFill, fontSize: 10 }}
            axisLine={{ stroke: radiusStroke }}
            tickCount={5}
          />
          <Radar
            name={t.agentDetailFeedbackData}
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={fill}
            fillOpacity={isDark ? 0.28 : 0.22}
            dot={{ r: 3, fill: stroke, strokeWidth: 0 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              border: isDark ? '1px solid #3f3f46' : '1px solid #e4e4e7',
              borderRadius: '0.75rem',
              fontSize: '12px',
            }}
            labelStyle={{ color: isDark ? '#fafafa' : '#18181b' }}
            formatter={(value) => {
              if (value === undefined || value === null) return '—';
              const n = typeof value === 'number' ? value : Number(value);
              if (!Number.isFinite(n)) return '—';
              return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
