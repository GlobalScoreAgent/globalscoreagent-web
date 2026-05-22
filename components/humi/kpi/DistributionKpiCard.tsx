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
  count: number;
  avg: number;
};

export default function DistributionKpiCard(props: DistributionKpiCardProps) {
  return <SharedDistributionKpiCard {...props} labels={humiDistributionLabels} />;
}
