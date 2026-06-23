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

/** horizontal = wide stacked bar; vertical = stacked columns. */
export type StackedBarOrientation = 'horizontal' | 'vertical';

/** default = overview card columns; rail = thin columns for chain card sidebar */
export type StackedBarDensity = 'default' | 'rail';

/** default = Recharts default; rail-inward = shift tooltip left (chain rail, avoids horizontal overflow). */
export type StackedBarTooltipPlacement = 'default' | 'rail-inward';

function compactTick(v: number, useCompact: boolean): string {
  if (!Number.isFinite(v)) return '';
  if (useCompact && v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (useCompact && v >= 100_000) return `${Math.round(v / 1_000)}k`;
  return Math.round(v).toLocaleString();
}

function formatLegendPct(value: number, total: number): string {
  if (total <= 0) return '0%';
  const pct = (value / total) * 100;
  if (pct >= 10) return `${Math.round(pct)}%`;
  return `${pct.toFixed(1)}%`;
}

export function StackedDistributionBar({
  title,
  rowKeys,
  row,
  colors,
  labelForKey,
  isDark,
  orientation = 'horizontal',
  density = 'default',
  fillHeight = false,
  xDomainMax,
  horizontalMarginBottom,
  yDomainMax,
  showTooltip = true,
  tooltipPlacement = 'default',
  onStackedSegmentHover,
  sideLegend = false,
  sideLegendWithValues = false,
  bottomLegend = false,
  verticalBarSize,
  horizontalBarSize = 40,
  hideTitle = false,
  legendDensity = 'default',
  className,
}: {
  title: string;
  rowKeys: string[];
  row: Record<string, number | string>;
  colors: (k: string) => string;
  labelForKey: (k: string) => string;
  isDark: boolean;
  orientation?: StackedBarOrientation;
  density?: StackedBarDensity;
  /** When vertical, grow to fill parent flex height (chain rail). */
  fillHeight?: boolean;
  /** When orientation is horizontal (wide stacked bar), fix X axis max (e.g. layer cap). */
  xDomainMax?: number;
  /** Extra bottom margin for horizontal bar chart (tooltip / ticks). */
  horizontalMarginBottom?: number;
  /** When orientation is vertical (stacked columns), fix Y axis max (e.g. layer cap). */
  yDomainMax?: number;
  /** When false, skip floating Tooltip (e.g. richness detail panel uses hover callbacks instead). */
  showTooltip?: boolean;
  /** Rail sidebar: place tooltip inward (left) so it does not widen the card. */
  tooltipPlacement?: StackedBarTooltipPlacement;
  /** Fires when pointer enters a segment; clear when pointer leaves the chart (wrapper). */
  onStackedSegmentHover?: (payload: { dataKey: string; value: number } | null) => void;
  /** Vertical stacked column only: color swatch list beside the chart (e.g. metadata richness). */
  sideLegend?: boolean;
  /** With sideLegend: show count beside each label. */
  sideLegendWithValues?: boolean;
  /** Vertical stacked column only: label + value list below the chart. */
  bottomLegend?: boolean;
  /** Vertical orientation: fixed column width in px (thinner bar). Overrides rail barSize when set. */
  verticalBarSize?: number;
  /** Horizontal orientation: stacked bar thickness in px. */
  horizontalBarSize?: number;
  /** When true, omit the title row (parent renders metric label). */
  hideTitle?: boolean;
  /** Side legend text sizing (matches DistributionPieChart comfortable mode). */
  legendDensity?: 'default' | 'comfortable' | 'compact';
  className?: string;
}) {
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';

  if (rowKeys.length === 0) return null;

  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  if (total <= 0) return null;

  const useCompactYTick = total >= 100_000;
  const isRail = density === 'rail';
  const comfortableLegend = legendDensity === 'comfortable';
  const compactLegend = legendDensity === 'compact';
  const barSize = isRail ? 14 : undefined;
  /** Width of each stacked column in vertical layout (richness uses explicit px). */
  const verticalStackBarSize = verticalBarSize ?? (isRail ? 14 : undefined);
  const yAxisW = isRail ? 30 : 44;
  const vertMargins = isRail
    ? { top: 4, right: 2, left: 0, bottom: 4 }
    : { top: 6, right: 12, left: 4, bottom: 4 };

  const horizontalMargins = {
    top: 2,
    right: 64,
    left: 4,
    bottom: horizontalMarginBottom ?? 2,
  };

  type TooltipPayloadItem = { dataKey?: string | number; value?: number };

  const useRailInwardTooltip =
    tooltipPlacement === 'rail-inward' && orientation === 'vertical' && isRail;

  const railTooltipPosition = useRailInwardTooltip
    ? (props: { coordinate?: { x?: number; y?: number } }) => {
        const x = props.coordinate?.x ?? 0;
        const y = props.coordinate?.y ?? 0;
        return { x: Math.max(4, x - 168), y: Math.max(4, y - 8) };
      }
    : undefined;

  const tooltipContent = (props: { payload?: readonly TooltipPayloadItem[] }) => {
    const { payload } = props;
    if (!payload?.length) return null;
    return (
      <div
        className={`rounded-lg border px-2 py-1.5 text-xs shadow-md ${
          useRailInwardTooltip ? 'max-w-[10rem]' : 'max-w-[min(100vw-2rem,22rem)]'
        } ${isDark ? 'border-zinc-600 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}
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

  /** Wide horizontal stacked bar: default h-14; extra bottom margin / fixed X domain need more SVG height or the plot collapses. */
  const horizontalChartTall =
    orientation === 'horizontal' &&
    (xDomainMax != null || (horizontalMarginBottom ?? 0) > 8 || sideLegend);

  const chartShell =
    orientation === 'vertical'
      ? fillHeight
        ? 'min-h-[9rem] flex-1 w-full'
        : 'h-40 w-full'
      : horizontalChartTall
        ? sideLegend
          ? 'h-24 w-full sm:h-28'
          : 'h-32 w-full sm:h-36'
        : 'h-14 w-full';

  const horizontalResponsiveMinHeight = sideLegend ? 112 : 96;
  /** Vertical fillHeight uses flex-1; minHeight keeps Recharts from collapsing when parent height is flex-derived. */
  const verticalResponsiveMinHeight = fillHeight ? 144 : undefined;

  const emitSegmentEnter = (dataKey: string) => {
    if (!onStackedSegmentHover) return;
    const v = Number(row[dataKey]);
    onStackedSegmentHover({
      dataKey,
      value: Number.isFinite(v) ? v : 0,
    });
  };

  const chartInner = (
    <>
      {orientation === 'horizontal' ? (
        <BarChart layout="vertical" data={[row]} margin={horizontalMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
          <XAxis
            type="number"
            stroke={axisStroke}
            tick={{ fill: tickFill, fontSize: 10 }}
            domain={xDomainMax != null && Number.isFinite(xDomainMax) ? [0, xDomainMax] : undefined}
          />
          <YAxis type="category" dataKey="name" width={1} hide />
          {showTooltip ? (
            <Tooltip
              allowEscapeViewBox={{ x: true, y: true }}
              animationDuration={0}
              position={railTooltipPosition as never}
              wrapperStyle={{ zIndex: 50, overflow: 'visible' }}
              content={tooltipContent as never}
            />
          ) : null}
          {rowKeys.map((k) => (
            <Bar
              key={k}
              dataKey={k}
              stackId="stack"
              fill={colors(k)}
              radius={[0, 0, 0, 0]}
              barSize={horizontalBarSize}
              onMouseEnter={onStackedSegmentHover ? () => emitSegmentEnter(k) : undefined}
            />
          ))}
        </BarChart>
      ) : (
        <BarChart layout="horizontal" data={[row]} margin={vertMargins}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
          <XAxis type="category" dataKey="name" hide />
          <YAxis
            type="number"
            stroke={axisStroke}
            tick={{ fill: tickFill, fontSize: isRail ? 8 : 10 }}
            width={yAxisW}
            domain={
              yDomainMax != null && Number.isFinite(yDomainMax)
                ? [0, yDomainMax]
                : [0, 'auto']
            }
            tickFormatter={(v: number) => compactTick(v, useCompactYTick)}
          />
          {showTooltip ? (
            <Tooltip
              allowEscapeViewBox={{ x: true, y: true }}
              animationDuration={0}
              position={railTooltipPosition as never}
              wrapperStyle={{ zIndex: 50, overflow: 'visible' }}
              content={tooltipContent as never}
            />
          ) : null}
          {rowKeys.map((k) => (
            <Bar
              key={k}
              dataKey={k}
              stackId="stack"
              fill={colors(k)}
              radius={[0, 0, 0, 0]}
              barSize={verticalStackBarSize}
              onMouseEnter={onStackedSegmentHover ? () => emitSegmentEnter(k) : undefined}
            />
          ))}
        </BarChart>
      )}
    </>
  );

  const chartResponsive = (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minHeight={
        orientation === 'horizontal'
          ? horizontalResponsiveMinHeight
          : verticalResponsiveMinHeight
      }
    >
      {chartInner}
    </ResponsiveContainer>
  );

  const chartWithPointer = (
    <div className="h-full min-h-0 w-full">
      {onStackedSegmentHover ? (
        <div className="h-full w-full" onPointerLeave={() => onStackedSegmentHover(null)}>
          {chartResponsive}
        </div>
      ) : (
        chartResponsive
      )}
    </div>
  );

  const legendMuted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const legendValue = isDark ? 'text-zinc-200' : 'text-zinc-800';

  const legendSwatch = (k: string) => (
    <span
      className={cn(
        'mt-0.5 shrink-0 rounded-sm',
        comfortableLegend ? 'h-3 w-3' : 'h-2 w-2',
      )}
      style={{ backgroundColor: colors(k) }}
      aria-hidden
    />
  );

  const legendLabelClass = cn(
    'truncate leading-tight',
    compactLegend ? 'text-[10px]' : comfortableLegend ? 'text-sm' : 'text-[10px]',
    legendMuted,
  );
  const legendValueClass = cn(
    'font-semibold tabular-nums',
    compactLegend
      ? 'pl-3 text-[10px]'
      : comfortableLegend
        ? 'pl-4 text-sm'
        : 'pl-3.5 text-[10px]',
    legendValue,
  );
  const legendListWidthClass =
    orientation === 'horizontal'
      ? compactLegend
        ? 'w-32 self-center space-y-1 sm:w-36'
        : comfortableLegend
          ? 'w-40 self-center space-y-2 sm:w-44'
          : 'w-36 self-center sm:w-40'
      : compactLegend
        ? 'w-32 max-h-full sm:w-36'
        : comfortableLegend
          ? 'w-40 max-h-full sm:w-44'
          : 'w-[7.5rem] max-h-full sm:w-32';

  const sideLegendList = sideLegend ? (
    <ul
      className={cn(
        'shrink-0 overflow-y-auto overscroll-contain',
        compactLegend ? 'space-y-1' : 'space-y-1.5',
        legendListWidthClass,
        !sideLegendWithValues && orientation === 'vertical' && 'max-w-[45%]',
      )}
      aria-label="Chart legend"
    >
      {rowKeys.map((k) => {
        if (sideLegendWithValues) {
          const v = Number(row[k]);
          const valueText = Number.isFinite(v) ? v.toLocaleString() : '—';
          const pctText = Number.isFinite(v) ? formatLegendPct(v, total) : '—';
          return (
            <li key={k} className="flex min-w-0 flex-col gap-0.5">
              <span className="flex min-w-0 items-start gap-1.5">
                {legendSwatch(k)}
                <span className={legendLabelClass}>{labelForKey(k)}</span>
              </span>
              <span className={legendValueClass}>
                {valueText} · {pctText}
              </span>
            </li>
          );
        }
        return (
          <li key={k} className="flex gap-1.5">
            {legendSwatch(k)}
            <span
              className={cn(
                'break-words leading-tight',
                compactLegend ? 'text-[10px]' : comfortableLegend ? 'text-sm' : 'text-[10px]',
                legendMuted,
              )}
            >
              {labelForKey(k)}
            </span>
          </li>
        );
      })}
    </ul>
  ) : null;

  const bottomLegendList =
    bottomLegend && orientation === 'vertical' ? (
      <ul
        className="mt-1.5 max-h-[6.5rem] shrink-0 space-y-1 overflow-y-auto overscroll-contain"
        aria-label="Chart legend"
      >
        {rowKeys.map((k) => {
          const v = Number(row[k]);
          const valueText = Number.isFinite(v) ? v.toLocaleString() : '—';
          return (
            <li key={k} className="flex min-w-0 items-start justify-between gap-2">
              <span className="flex min-w-0 flex-1 items-start gap-1.5">
                {legendSwatch(k)}
                <span className={`truncate text-[10px] leading-tight ${legendMuted}`}>{labelForKey(k)}</span>
              </span>
              <span className={`shrink-0 text-[10px] font-semibold tabular-nums ${legendValue}`}>{valueText}</span>
            </li>
          );
        })}
      </ul>
    ) : null;

  const showSideLegend = sideLegend;
  const showVerticalBottomLegend = bottomLegend && orientation === 'vertical';

  const chartBlock = (
    <div
      className={cn(chartShell, !showSideLegend && useRailInwardTooltip && 'overflow-visible')}
    >
      {chartWithPointer}
    </div>
  );

  return (
    <div
      className={cn(
        'space-y-1',
        fillHeight && orientation === 'vertical' && 'flex min-h-0 flex-1 flex-col',
        orientation === 'horizontal' && 'flex w-full flex-1 flex-col',
        className,
      )}
    >
      {!hideTitle ? (
        <p
          className={cn(
            'shrink-0 font-semibold uppercase tracking-wide text-zinc-500',
            isRail ? 'text-[9px] leading-tight text-center' : 'text-[11px]',
          )}
        >
          {title}
        </p>
      ) : null}
      {showSideLegend ? (
        <div
          className={cn(
            'flex w-full gap-3 sm:gap-4',
            orientation === 'horizontal'
              ? 'flex-col md:flex-row md:items-center'
              : 'sm:flex-row sm:items-stretch',
            fillHeight && orientation === 'vertical' && 'min-h-0 flex-1',
          )}
        >
          <div className={cn(chartShell, 'min-w-0 flex-1', fillHeight && orientation === 'vertical' && 'min-h-0')}>
            {chartWithPointer}
          </div>
          {sideLegendList ? (
            <div className={cn('w-full shrink-0 md:w-32 lg:w-44', orientation === 'horizontal' && 'md:max-w-[11rem]')}>
              {sideLegendList}
            </div>
          ) : null}
        </div>
      ) : showVerticalBottomLegend ? (
        <>
          {chartBlock}
          {bottomLegendList}
        </>
      ) : (
        chartBlock
      )}
    </div>
  );
}
