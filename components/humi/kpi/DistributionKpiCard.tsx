'use client';

import { humiKpiLabels } from '@/content/humi/kpi-labels';
import SharedDistributionKpiCard from '@/components/marketing/shared/DistributionKpiCard';
import type { Bilingual } from '@/content/marketing/i18n';

const humiDistributionLabels = {
  categoryHeader: humiKpiLabels.distributionCategoryHeader,
  countSubtitle: humiKpiLabels.distributionAgentsSubtitle,
  avgSubtitle: humiKpiLabels.distributionAvgSubtitle,
  scoreRangeInfoLabel: humiKpiLabels.scoreRangeInfoLabel,
};

type DistributionKpiCardProps = {
  band: Bilingual;
  scoreRange: Bilingual;
  userDescription: Bilingual;
  count: number;
  avg: number | null;
};

export default function DistributionKpiCard(props: DistributionKpiCardProps) {
  const { userDescription, ...rest } = props;
  return (
    <SharedDistributionKpiCard
      {...rest}
      infoContent={userDescription}
      labels={humiDistributionLabels}
    />
  );
}
