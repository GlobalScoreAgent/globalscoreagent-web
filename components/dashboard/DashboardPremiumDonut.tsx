'use client';

import { useId, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export type PremiumDonutSegment = {
  key: string;
  name: string;
  value: number;
  color: string;
};

type Props = {
  segments: PremiumDonutSegment[];
  isDark: boolean;
  locale: string;
  totalLabel: string;
  segmentsLabel: string;
  emptyMessage?: string;
  className?: string;
};

function PieTooltip({
  active,
  payload,
  isDark,
  locale,
  total,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: number; payload?: PremiumDonutSegment }>;
  isDark: boolean;
  locale: string;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const value = entry?.value;
  if (value === undefined || !Number.isFinite(value)) return null;
  const name = entry.payload?.name ?? entry.name ?? '';
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const shareLabel = locale.toLowerCase().startsWith('es') ? 'del total' : 'of total';
  return (
    <div
      className={`min-w-36 rounded-2xl border px-3.5 py-3 text-sm shadow-2xl ${
        isDark
          ? 'border-emerald-400/30 bg-zinc-950 text-zinc-100'
          : 'border-emerald-600/20 bg-white text-zinc-900'
      }`}
    >
      <div className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {name}
      </div>
      <div className="mt-1 text-lg font-bold tabular-nums">
        {Math.round(value).toLocaleString(locale, { maximumFractionDigits: 0 })}
      </div>
      <div
        className={cn(
          'mt-0.5 text-xs tabular-nums',
          isDark ? 'text-emerald-300' : 'text-emerald-700',
        )}
      >
        {percentage.toLocaleString(locale, { maximumFractionDigits: 1 })}% {shareLabel}
      </div>
    </div>
  );
}

export function DashboardPremiumDonut({
  segments,
  isDark,
  locale,
  totalLabel,
  segmentsLabel,
  emptyMessage = '—',
  className,
}: Props) {
  const gradientId = useId().replace(/:/g, '');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const pieData = useMemo(
    () => [...segments].filter((s) => s.value > 0).sort((a, b) => b.value - a.value),
    [segments],
  );

  const total = useMemo(() => pieData.reduce((sum, s) => sum + s.value, 0), [pieData]);

  if (pieData.length === 0 || total <= 0) {
    return (
      <div
        className={cn(
          'flex h-full items-center justify-center text-sm',
          isDark ? 'text-gray-500' : 'text-zinc-500',
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-3',
        className,
      )}
    >
      <div
        className={cn(
          'relative min-h-0 w-full flex-1 overflow-hidden rounded-2xl border',
          isDark
            ? 'border-emerald-400/10 bg-gradient-to-br from-emerald-500/[0.07] via-zinc-950/20 to-sky-500/[0.05]'
            : 'border-emerald-600/10 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/70',
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {pieData.map((slice) => (
                <linearGradient
                  key={slice.key}
                  id={`${gradientId}-${slice.key}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={slice.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={slice.color} stopOpacity={0.62} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="53%"
              outerRadius="78%"
              cornerRadius={7}
              paddingAngle={3}
              stroke={isDark ? '#18181b' : '#ffffff'}
              strokeWidth={2}
            >
              {pieData.map((slice) => (
                <Cell
                  key={slice.key}
                  fill={`url(#${gradientId}-${slice.key})`}
                  className="outline-none"
                  opacity={hoveredKey === null || hoveredKey === slice.key ? 1 : 0.42}
                  style={{
                    cursor: 'default',
                    filter:
                      hoveredKey === slice.key
                        ? `drop-shadow(0 0 6px ${slice.color}66)`
                        : undefined,
                    transition: 'opacity 180ms ease, filter 180ms ease',
                  }}
                  onMouseEnter={() => setHoveredKey(slice.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              ))}
            </Pie>
            <Tooltip
              content={(props) => (
                <PieTooltip
                  active={props.active}
                  payload={
                    props.payload as unknown as
                      | ReadonlyArray<{
                          name?: string;
                          value?: number;
                          payload?: PremiumDonutSegment;
                        }>
                      | undefined
                  }
                  isDark={isDark}
                  locale={locale}
                  total={total}
                />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-150',
            hoveredKey !== null ? 'opacity-0' : 'opacity-100',
          )}
        >
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.14em]',
              isDark ? 'text-zinc-500' : 'text-zinc-500',
            )}
          >
            {totalLabel}
          </span>
          <span
            className={cn(
              'mt-1 max-w-28 truncate text-2xl font-bold tabular-nums',
              isDark ? 'text-zinc-50' : 'text-zinc-900',
            )}
            title={Math.round(total).toLocaleString(locale)}
          >
            {new Intl.NumberFormat(locale, {
              notation: total >= 10_000 ? 'compact' : 'standard',
              maximumFractionDigits: total >= 10_000 ? 1 : 0,
            }).format(total)}
          </span>
          <span
            className={cn(
              'mt-0.5 text-[10px]',
              isDark ? 'text-emerald-400/80' : 'text-emerald-700',
            )}
          >
            {pieData.length} {segmentsLabel}
          </span>
        </div>
      </div>

      <ul className="flex w-full shrink-0 flex-wrap justify-center gap-x-3 gap-y-1.5">
        {pieData.map((slice) => {
          const pct = total > 0 ? (slice.value / total) * 100 : 0;
          return (
            <li key={slice.key}>
              <div
                onMouseEnter={() => setHoveredKey(slice.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2 py-1 transition-all',
                  hoveredKey === slice.key
                    ? isDark
                      ? 'border-emerald-400/25 bg-emerald-400/[0.08]'
                      : 'border-emerald-600/20 bg-emerald-50'
                    : isDark
                      ? 'border-zinc-700/40 bg-zinc-950/25'
                      : 'border-zinc-200/70 bg-white/60',
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                <span className="truncate text-[11px] font-medium leading-tight">
                  {slice.name}
                </span>
                <span
                  className={cn(
                    'text-[10px] tabular-nums',
                    isDark ? 'text-zinc-500' : 'text-zinc-500',
                  )}
                >
                  {Math.round(slice.value).toLocaleString(locale)}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold tabular-nums',
                    isDark ? 'text-emerald-300' : 'text-emerald-700',
                  )}
                >
                  {pct.toLocaleString(locale, { maximumFractionDigits: 1 })}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
