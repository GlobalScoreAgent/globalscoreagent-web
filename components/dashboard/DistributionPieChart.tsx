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
  legendDensity?: 'default' | 'comfortable' | 'compact';
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
  legendDensity = 'default',
  innerRadius = '38%',
  outerRadius = '78%',
  className,
}: Props) {
  const comfortable = legendDensity === 'comfortable';
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
      className={cn(
        'mt-0.5 shrink-0 rounded-sm',
        comfortable ? 'h-3 w-3' : 'h-2.5 w-2.5',
      )}
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

  const pieMinHeight =
    sideLegendWithValues && comfortable ? 256 : sideLegendWithValues ? 224 : 176;

  const pieChart = (
    <div
      className={cn(
        'h-full w-full min-w-0',
        sideLegendWithValues && comfortable
          ? 'min-h-[16rem] sm:min-h-[18rem]'
          : sideLegendWithValues
            ? 'min-h-[14rem] sm:min-h-[16rem]'
            : 'min-h-[11rem] sm:min-h-[12rem]',
        fillHeight && 'min-h-0 flex-1',
      )}
    >
      <ResponsiveContainer width="100%" height="100%" minHeight={pieMinHeight}>
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
      className={cn(
        'shrink-0 self-center space-y-2 overflow-y-auto overscroll-contain',
        comfortable ? 'w-40 sm:w-44' : 'w-36 sm:w-40',
      )}
      aria-label="Chart legend"
    >
      {segments.map((seg) => (
        <li key={seg.key} className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-start gap-1.5">
            {legendSwatch(seg.color)}
            <span
              className={cn(
                'truncate leading-tight',
                comfortable ? 'text-sm' : 'text-xs',
                legendMuted,
              )}
            >
              {seg.label}
            </span>
          </span>
          <span
            className={cn(
              'pl-4 font-semibold tabular-nums',
              comfortable ? 'text-sm' : 'text-xs',
              legendValue,
            )}
          >
            {seg.value.toLocaleString()} · {formatPct(seg.pct)}
          </span>
        </li>
      ))}
    </ul>
  ) : null;

  if (sideLegendWithValues) {
    return (
      <div
        className={cn(
          'flex w-full gap-4',
          comfortable
            ? 'h-full min-h-0 items-center justify-center'
            : 'items-center justify-center',
          fillHeight && 'min-h-0 flex-1',
          className,
        )}
      >
        <div
          className={cn(
            'min-w-0 flex-1',
            comfortable
              ? 'mx-auto max-w-[min(100%,14rem)]'
              : undefined,
            comfortable
              ? fillHeight
                ? 'flex h-full min-h-[16rem] flex-col sm:min-h-[18rem]'
                : 'h-[16rem] sm:h-[18rem]'
              : fillHeight
                ? 'flex h-full min-h-0 flex-col'
                : 'h-[14rem] sm:h-[16rem]',
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
