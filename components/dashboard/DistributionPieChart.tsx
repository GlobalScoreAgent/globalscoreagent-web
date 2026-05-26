'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

type Props = {
  rowKeys: string[];
  row: Record<string, number | string>;
  colors: (k: string) => string;
  labelForKey: (k: string) => string;
  isDark: boolean;
  fillHeight?: boolean;
  sideLegendWithValues?: boolean;
  innerRadius?: number | string;
  outerRadius?: number | string;
  className?: string;
};

type PieDatum = {
  key: string;
  value: number;
  label: string;
  color: string;
  pct: number;
};

const MIN_SLICE_LABEL_PCT = 4;

function formatPct(pct: number): string {
  if (pct >= 10) return `${Math.round(pct)}%`;
  return `${pct.toFixed(1)}%`;
}

export function DistributionPieChart({
  rowKeys,
  row,
  colors,
  labelForKey,
  isDark,
  fillHeight = false,
  sideLegendWithValues = false,
  innerRadius = '38%',
  outerRadius = '78%',
  className,
}: Props) {
  const legendMuted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const legendValue = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const labelFill = isDark ? '#fafafa' : '#18181b';

  const segments = useMemo((): PieDatum[] => {
    const values = rowKeys.map((k) => Number(row[k]) || 0);
    const total = values.reduce((s, v) => s + v, 0);
    if (total <= 0) return [];

    return rowKeys
      .map((k, i) => {
        const value = values[i] ?? 0;
        if (value <= 0) return null;
        return {
          key: k,
          value,
          label: labelForKey(k),
          color: colors(k),
          pct: (value / total) * 100,
        };
      })
      .filter((d): d is PieDatum => d != null);
  }, [rowKeys, row, colors, labelForKey]);

  const legendSwatch = (color: string) => (
    <span
      className="mt-0.5 h-2 w-2 shrink-0 rounded-sm"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );

  if (segments.length === 0) return null;

  const showSliceLabels = !sideLegendWithValues;

  const sliceLabel = showSliceLabels
    ? (props: {
        percent?: number;
        cx?: number;
        cy?: number;
        midAngle?: number;
        outerRadius?: number;
      }) => {
        const pctFraction = Number(props.percent ?? 0);
        const pct = pctFraction * 100;
        if (pct < MIN_SLICE_LABEL_PCT) return null;
        const cx = Number(props.cx ?? 0);
        const cy = Number(props.cy ?? 0);
        const midAngle = Number(props.midAngle ?? 0);
        const sliceOuterRadius = Number(props.outerRadius ?? 0);
        const rad = (-midAngle * Math.PI) / 180;
        const x = cx + sliceOuterRadius * 0.62 * Math.cos(rad);
        const y = cy + sliceOuterRadius * 0.62 * Math.sin(rad);
        return (
          <text
            x={x}
            y={y}
            fill={labelFill}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={600}
          >
            {formatPct(pct)}
          </text>
        );
      }
    : false;

  const pieChart = (
    <div
      className={cn(
        'h-full min-h-[11rem] w-full min-w-0 sm:min-h-[12rem]',
        fillHeight && 'min-h-0 flex-1',
      )}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={176}>
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={1}
            stroke={isDark ? '#27272a' : '#fafafa'}
            strokeWidth={1}
            isAnimationActive={false}
            labelLine={false}
            label={sliceLabel}
          >
            {segments.map((seg) => (
              <Cell key={seg.key} fill={seg.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const sideLegendList = sideLegendWithValues ? (
    <ul
      className="w-[7.5rem] shrink-0 space-y-1.5 overflow-y-auto overscroll-contain sm:w-32"
      aria-label="Chart legend"
    >
      {segments.map((seg) => (
        <li key={seg.key} className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-start gap-1.5">
            {legendSwatch(seg.color)}
            <span className={`truncate text-[10px] leading-tight ${legendMuted}`}>{seg.label}</span>
          </span>
          <span className={`pl-3.5 text-[10px] font-semibold tabular-nums ${legendValue}`}>
            {seg.value.toLocaleString()} · {formatPct(seg.pct)}
          </span>
        </li>
      ))}
    </ul>
  ) : null;

  if (sideLegendWithValues) {
    return (
      <div className={cn('flex w-full gap-3 sm:items-stretch', fillHeight && 'min-h-0 flex-1', className)}>
        <div
          className={cn(
            'min-h-[11rem] min-w-0 flex-1 sm:min-h-[12rem]',
            fillHeight ? 'flex h-full min-h-0 flex-col' : 'h-[11rem] sm:h-[12rem]',
          )}
        >
          {pieChart}
        </div>
        {sideLegendList}
      </div>
    );
  }

  return <div className={className}>{pieChart}</div>;
}
