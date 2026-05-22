'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiKpiLabels } from '@/content/wami/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '@/components/marketing/shared/GlassCard';
import AnimatedCounter from '@/components/marketing/shared/AnimatedCounter';
import {
  kpiCardPadding,
  kpiLabel,
  kpiValue,
} from '@/components/marketing/shared/kpiTypography';

type WalletsAnalysedKpiCardProps = {
  walletAnalysed: number;
};

export default function WalletsAnalysedKpiCard({ walletAnalysed }: WalletsAnalysedKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={`${kpiCardPadding} flex h-full min-h-0 flex-col`}>
      <p className={`${kpiLabel} mb-2 text-center`}>{pick(language, wamiKpiLabels.walletsAnalysed)}</p>
      <div className="flex flex-1 items-center justify-center">
        <p className={`${kpiValue} text-center`}>
          <AnimatedCounter target={walletAnalysed} />
        </p>
      </div>
    </GlassCard>
  );
}
