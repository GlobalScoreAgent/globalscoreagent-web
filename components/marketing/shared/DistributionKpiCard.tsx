'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { Bilingual } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '@/components/marketing/shared/GlassCard';
import AnimatedCounter from '@/components/marketing/shared/AnimatedCounter';
import KpiInfoTooltip from '@/components/marketing/shared/KpiInfoTooltip';
import {
  kpiBandName,
  kpiCardPadding,
  kpiLabel,
  kpiSubtext,
  kpiValue,
  kpiValueSecondary,
} from '@/components/marketing/shared/kpiTypography';

export type DistributionKpiCardLabels = {
  categoryHeader: Bilingual;
  countSubtitle: Bilingual;
  avgSubtitle: Bilingual;
  scoreRangeInfoLabel: Bilingual;
};

type DistributionKpiCardProps = {
  band: Bilingual;
  scoreRange: Bilingual;
  count: number;
  avg: number;
  labels: DistributionKpiCardLabels;
};

function formatAvg(value: number, language: 'es' | 'en'): string {
  return value.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

export default function DistributionKpiCard({
  band,
  scoreRange,
  count,
  avg,
  labels,
}: DistributionKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={kpiCardPadding}>
      <div className="mb-1">
        <p className={kpiLabel}>{pick(language, labels.categoryHeader)}</p>
        <div className="mt-0.5 flex items-start justify-between gap-1">
          <p className={`min-w-0 flex-1 break-words ${kpiBandName}`}>{pick(language, band)}</p>
          <KpiInfoTooltip content={scoreRange} ariaLabel={labels.scoreRangeInfoLabel} />
        </div>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-x-2">
        <div className="min-w-0">
          <p className={kpiValue}>
            <AnimatedCounter target={count} />
          </p>
          <p className={`mt-0.5 ${kpiSubtext}`}>{pick(language, labels.countSubtitle)}</p>
        </div>
        <div className="min-w-0 text-right">
          <p className={kpiValueSecondary}>{formatAvg(avg, language)}</p>
          <p className={`mt-0.5 ${kpiSubtext}`}>{pick(language, labels.avgSubtitle)}</p>
        </div>
      </div>
    </GlassCard>
  );
}
