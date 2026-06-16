'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiPillarBarChart } from '@/components/dashboard/AgentHumiPillarBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { WamiPillarChartPoint, WamiPillarId } from '@/lib/indexWamiPillars';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  points: WamiPillarChartPoint[];
  selectedPillarId: WamiPillarId | null;
  onPillarSelect: (id: WamiPillarId) => void;
  walletSubtitle: string | null;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentWamiWalletPillarScoresCard({
  points,
  selectedPillarId,
  onPillarSelect,
  walletSubtitle,
  isDark,
  locale,
  t,
}: Props) {
  const cardInlay = dashboardCardInlayClass(isDark);
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <>
      <div className="mb-4">
        <h2 className={cn('text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
          {t.agentWamiWalletPillarsTitle}
        </h2>
        {walletSubtitle ? (
          <p className={cn('mt-1 text-sm font-medium', muted)}>{walletSubtitle}</p>
        ) : null}
      </div>
      <div className={cn('min-h-[14rem] h-56 p-4', cardInlay)}>
        <AgentHumiPillarBarChart
          points={points}
          selectedPillarId={selectedPillarId}
          onPillarSelect={(id) => onPillarSelect(id as WamiPillarId)}
          isDark={isDark}
          locale={locale}
          emptyMessage={t.agentWamiPillarsEmpty}
          maxScoreLabel={t.agentWamiPillarMax}
          notAvailableLabel={t.notAvailable}
        />
      </div>
    </>
  );
}
