'use client';

import { wamiKpiLabels } from '@/content/wami/kpi-labels';
import SharedDistributionKpiCard from '@/components/marketing/shared/DistributionKpiCard';
import type { Bilingual } from '@/content/marketing/i18n';

const wamiDistributionLabels = {
  categoryHeader: wamiKpiLabels.distributionCategoryHeader,
  countSubtitle: wamiKpiLabels.distributionWalletsSubtitle,
  avgSubtitle: wamiKpiLabels.distributionAvgSubtitle,
  scoreRangeInfoLabel: wamiKpiLabels.scoreRangeInfoLabel,
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
      labels={wamiDistributionLabels}
    />
  );
}
