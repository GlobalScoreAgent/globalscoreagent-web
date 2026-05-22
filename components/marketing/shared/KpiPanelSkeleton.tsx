import { kpiGridGap } from './kpiTypography';
import { HOME_SKELETON_SLOTS, kpiMobileWrapperClass } from '@/components/marketing/home/kpi-layout';

/** WAMI grid: 2 normal, wide, 5 distribution, wide (matches WamiKpiOverlay). */
const WAMI_SKELETON_WIDE = [false, false, true, false, false, false, false, false, true] as const;

type SkeletonSlot = { wide: boolean; key?: string };

type KpiPanelSkeletonProps = {
  className?: string;
  /**
   * firstWide: first cell col-span-2, then (cardCount - 1) normal cells (HUMI).
   * home: portal main KPI grid (13 cells, 4 hidden on mobile).
   * wami: fixed 9-cell pattern aligned with WamiKpiOverlay.
   */
  layout?: 'firstWide' | 'home' | 'wami';
  /** Total grid cells when layout is firstWide. Ignored for home/wami. Default 8 for HUMI. */
  cardCount?: number;
};

function SkeletonCard({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-white/10 bg-black/15 p-2 backdrop-blur-md ${
        wide ? 'col-span-2' : ''
      }`}
    >
      <div className="mb-1.5 h-2 w-2/3 rounded bg-zinc-700/80" />
      <div className="mb-1 h-3 w-full rounded bg-zinc-700/60" />
      <div className="h-5 w-1/2 rounded bg-zinc-600/70" />
    </div>
  );
}

export default function KpiPanelSkeleton({
  className = '',
  layout = 'firstWide',
  cardCount = 8,
}: KpiPanelSkeletonProps) {
  const slots: SkeletonSlot[] =
    layout === 'wami'
      ? WAMI_SKELETON_WIDE.map((wide): SkeletonSlot => ({ wide }))
      : layout === 'home'
        ? HOME_SKELETON_SLOTS
        : [
            { wide: true },
            ...Array.from(
              { length: Math.max(0, cardCount - 1) },
              (): SkeletonSlot => ({ wide: false })
            ),
          ];

  return (
    <div
      className={`flex w-56 max-h-[40vh] flex-col sm:max-h-[calc(100vh-5.5rem)] sm:w-72 md:w-80 ${className}`}
      aria-busy="true"
      aria-hidden
    >
      <div className="mb-1.5 h-2.5 w-32 shrink-0 animate-pulse self-end rounded bg-zinc-700/80" />
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className={`grid grid-cols-2 ${kpiGridGap}`}>
          {slots.map((slot, i) => (
            <div
              key={slot.key ?? `slot-${i}`}
              className={slot.key ? kpiMobileWrapperClass(slot.key) : undefined}
            >
              <SkeletonCard wide={slot.wide} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
