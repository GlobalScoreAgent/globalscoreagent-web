'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

/** horizontal = wide stacked bar (chains); vertical = stacked columns (overview insight card). */
export type StackedBarOrientation = 'horizontal' | 'vertical';

function compactTick(v: number, useCompact: boolean): string {
  if (!Number.isFinite(v)) return '';
  if (useCompact && v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (useCompact && v >= 100_000) return `${Math.round(v / 1_000)}k`;
  return Math.round(v).toLocaleString();
}

export function StackedDistributionBar({
  title,
  rowKeys,
  row,
  colors,
  labelForKey,
  isDark,
  orientation = 'horizontal',
  className,
}: {
  title: string;
  rowKeys: string[];
  row: Record<string, number | string>;
  colors: (k: string) => string;
  labelForKey: (k: string) => string;
  isDark: boolean;
  orientation?: StackedBarOrientation;
  className?: string;
}) {
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';

  if (rowKeys.length === 0) return null;

  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  if (total <= 0) return null;

  const useCompactYTick = total >= 100_000;

  type TooltipPayloadItem = { dataKey?: string | number; value?: number };

  const tooltipContent = (props: { payload?: readonly TooltipPayloadItem[] }) => {
    const { payload } = props;
    if (!payload?.length) return null;
    return (
      <div
        className={`max-w-[min(100vw-2rem,22rem)] rounded-lg border px-2 py-1.5 text-xs shadow-md ${
          isDark ? 'border-zinc-600 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'
        }`}
      >
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="tabular-nums break-words">
            <span className="opacity-80">{labelForKey(String(p.dataKey))}: </span>
            <span className="font-semibold">{Number(p.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('space-y-1', className)}>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
        {title}
      </p>
      <div className={orientation === 'vertical' ? 'h-40 w-full' : 'h-14 w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          {orientation === 'horizontal' ? (
            <BarChart layout="vertical" data={[row]} margin={{ top: 2, right: 64, left: 4, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
              <XAxis type="number" stroke={axisStroke} tick={{ fill: tickFill, fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={1} hide />
              <Tooltip
                allowEscapeViewBox={{ x: true, y: true }}
                animationDuration={0}
                wrapperStyle={{ zIndex: 50 }}
                content={tooltipContent as never}
              />
              {rowKeys.map((k) => (
                <Bar key={k} dataKey={k} stackId="stack" fill={colors(k)} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          ) : (
            <BarChart layout="horizontal" data={[row]} margin={{ top: 6, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
              <XAxis type="category" dataKey="name" hide />
              <YAxis
                type="number"
                stroke={axisStroke}
                tick={{ fill: tickFill, fontSize: 10 }}
                width={44}
                domain={[0, 'auto']}
                tickFormatter={(v: number) => compactTick(v, useCompactYTick)}
              />
              <Tooltip
                allowEscapeViewBox={{ x: true, y: true }}
                animationDuration={0}
                wrapperStyle={{ zIndex: 50 }}
                content={tooltipContent as never}
              />
              {rowKeys.map((k) => (
                <Bar key={k} dataKey={k} stackId="stack" fill={colors(k)} radius={[0, 0, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
