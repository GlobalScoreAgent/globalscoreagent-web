'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiPillarBarChart } from '@/components/dashboard/AgentHumiPillarBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiPillarChartPoint, HumiPillarId } from '@/lib/indexHumiPillars';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  points: HumiPillarChartPoint[];
  selectedPillarId: HumiPillarId | null;
  onPillarSelect: (id: HumiPillarId) => void;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentHumiPillarScoresCard({
  points,
  selectedPillarId,
  onPillarSelect,
  isDark,
  locale,
  t,
}: Props) {
  const cardInlay = dashboardCardInlayClass(isDark);

  return (
    <>
      <h2 className={cn('mb-4 text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
        {t.agentHumiPillarsTitle}
      </h2>
      <div className={cn('min-h-[18rem] h-72 p-4', cardInlay)}>
        <AgentHumiPillarBarChart
          points={points}
          selectedPillarId={selectedPillarId}
          onPillarSelect={onPillarSelect}
          isDark={isDark}
          locale={locale}
          emptyMessage={t.agentHumiPillarsEmpty}
          maxScoreLabel={t.agentHumiPillarMax}
          notAvailableLabel={t.notAvailable}
        />
      </div>
    </>
  );
}
