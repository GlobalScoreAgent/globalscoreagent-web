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
  infoContent: Bilingual;
  count: number;
  avg: number | null;
  labels: DistributionKpiCardLabels;
  scoreRange?: Bilingual;
};

function formatAvg(value: number, language: 'es' | 'en'): string {
  return value.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

export default function DistributionKpiCard({
  band,
  infoContent,
  count,
  avg,
  labels,
  scoreRange,
}: DistributionKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={kpiCardPadding}>
      <div className="mb-1">
        <p className={kpiLabel}>{pick(language, labels.categoryHeader)}</p>
        <div className="mt-0.5 flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p className={`flex flex-wrap items-baseline gap-x-1.5 ${kpiBandName}`}>
              <span>{pick(language, band)}</span>
              {scoreRange ? (
                <span className="font-normal text-zinc-500">{pick(language, scoreRange)}</span>
              ) : null}
            </p>
          </div>
          <KpiInfoTooltip content={infoContent} ariaLabel={labels.scoreRangeInfoLabel} />
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
          <p className={kpiValueSecondary}>
            {avg === null ? '—' : formatAvg(avg, language)}
          </p>
          <p className={`mt-0.5 ${kpiSubtext}`}>{pick(language, labels.avgSubtitle)}</p>
        </div>
      </div>
    </GlassCard>
  );
}
