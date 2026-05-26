'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentHumiPillarBarChart } from '@/components/dashboard/AgentHumiPillarBarChart';
import { dashboardCardInlayClass } from '@/lib/dashboardCardInlay';
import type { HumiPillarChartPoint, HumiPillarId } from '@/lib/indexHumiPillars';
import { cn } from '@/lib/utils';

type Props = {
  points: HumiPillarChartPoint[];
  selectedPillarId: HumiPillarId | null;
  onPillarSelect: (id: HumiPillarId) => void;
  accentColor: string;
  isDark: boolean;
  locale: string;
  t: Translations;
};

export function AgentHumiPillarScoresCard({
  points,
  selectedPillarId,
  onPillarSelect,
  accentColor,
  isDark,
  locale,
  t,
}: Props) {
  const cardInlay = dashboardCardInlayClass(isDark);

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold">{t.agentHumiPillarsTitle}</h2>
      <div className={cn('min-h-[18rem] h-72 p-4', cardInlay)}>
        <AgentHumiPillarBarChart
          points={points}
          selectedPillarId={selectedPillarId}
          onPillarSelect={onPillarSelect}
          accentColor={accentColor}
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
