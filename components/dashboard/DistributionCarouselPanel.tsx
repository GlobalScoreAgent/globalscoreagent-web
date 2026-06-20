'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DistributionPieChart } from '@/components/dashboard/DistributionPieChart';
import {
  StackedDistributionBar,
  type StackedBarOrientation,
} from '@/components/dashboard/StackedDistributionBar';
import { cn } from '@/lib/utils';

export type DistributionCarouselSlide = {
  id: string;
  metricLabel: string;
  rowKeys: string[];
  row: Record<string, number | string>;
  colors: (k: string) => string;
  labelForKey: (k: string) => string;
};

export type DistributionLegendPlacement = 'bottom' | 'side';
export type DistributionChartVariant = 'stackedBar' | 'pie';

export type DistributionLegendDensity = 'default' | 'comfortable' | 'compact';

type Props = {
  slides: DistributionCarouselSlide[];
  panelTitle: string;
  prevLabel: string;
  nextLabel: string;
  isDark: boolean;
  legendPlacement?: DistributionLegendPlacement;
  legendDensity?: DistributionLegendDensity;
  chartVariant?: DistributionChartVariant;
  stackedBarOrientation?: StackedBarOrientation;
  showPanelTitle?: boolean;
  resetKey?: string;
  bordered?: boolean;
  className?: string;
  chartClassName?: string;
  pieInnerRadius?: number | string;
  pieOuterRadius?: number | string;
};

export function DistributionCarouselPanel({
  slides,
  panelTitle,
  prevLabel,
  nextLabel,
  isDark,
  legendPlacement = 'bottom',
  legendDensity = 'default',
  chartVariant = 'stackedBar',
  stackedBarOrientation = 'vertical',
  showPanelTitle = true,
  resetKey,
  bordered = true,
  className,
  chartClassName,
  pieInnerRadius,
  pieOuterRadius,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const prose = isDark ? 'text-white' : 'text-zinc-900';
  const shell = isDark ? 'border-zinc-700 bg-black/15' : 'border-zinc-200 bg-white/60';

  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey]);

  const safeIndex = slides.length === 0 ? 0 : activeIndex % slides.length;
  const activeSlide = slides[safeIndex];
  const canNavigate = slides.length > 1;

  const navLabel = useMemo(() => {
    if (!activeSlide) return '';
    return `${activeSlide.metricLabel} · ${safeIndex + 1}/${slides.length}`;
  }, [activeSlide, safeIndex, slides.length]);

  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((i) => (i + 1) % slides.length);
  };

  if (slides.length === 0 || !activeSlide) return null;

  const navBtnClass = cn(
    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
    isDark
      ? 'border-zinc-600 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40'
      : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40',
  );

  const useSideLegend = legendPlacement === 'side';
  const usePie = chartVariant === 'pie';
  const useHorizontalBar = !usePie && stackedBarOrientation === 'horizontal';

  return (
    <div
      className={cn(
        'flex min-h-[220px] w-full shrink-0 flex-col overflow-visible sm:min-h-[260px]',
        bordered && 'rounded-2xl border px-3 py-2',
        bordered && shell,
        className,
      )}
    >
      {showPanelTitle ? (
        <p className={`mb-2 shrink-0 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
          {panelTitle}
        </p>
      ) : null}

      <div className="mb-2 flex shrink-0 items-center justify-between gap-1">
        <button
          type="button"
          className={navBtnClass}
          onClick={goPrev}
          disabled={!canNavigate}
          aria-label={prevLabel}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <span className={`min-w-0 flex-1 truncate text-center text-[11px] font-semibold tabular-nums ${prose}`}>
          {navLabel}
        </span>
        <button
          type="button"
          className={navBtnClass}
          onClick={goNext}
          disabled={!canNavigate}
          aria-label={nextLabel}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-visible',
          useHorizontalBar ? 'w-full items-stretch' : 'w-full items-stretch justify-center',
          chartClassName,
        )}
      >
        {usePie ? (
          <DistributionPieChart
            key={activeSlide.id}
            rowKeys={activeSlide.rowKeys}
            row={activeSlide.row}
            colors={activeSlide.colors}
            labelForKey={activeSlide.labelForKey}
            isDark={isDark}
            fillHeight
            sideLegendWithValues={useSideLegend}
            legendDensity={legendDensity}
            innerRadius={pieInnerRadius}
            outerRadius={pieOuterRadius}
            className="min-h-0 w-full flex-1"
          />
        ) : (
          <StackedDistributionBar
            key={activeSlide.id}
            title={activeSlide.metricLabel}
            rowKeys={activeSlide.rowKeys}
            row={activeSlide.row}
            colors={activeSlide.colors}
            labelForKey={activeSlide.labelForKey}
            isDark={isDark}
            orientation={stackedBarOrientation}
            density="default"
            verticalBarSize={stackedBarOrientation === 'vertical' ? 40 : undefined}
            fillHeight={stackedBarOrientation === 'vertical'}
            hideTitle
            sideLegend={useSideLegend}
            sideLegendWithValues={useSideLegend}
            bottomLegend={!useSideLegend && stackedBarOrientation === 'vertical'}
            showTooltip={stackedBarOrientation === 'horizontal'}
            legendDensity={legendDensity}
            horizontalBarSize={40}
            className="min-h-0 w-full flex-1"
          />
        )}
      </div>
    </div>
  );
}
