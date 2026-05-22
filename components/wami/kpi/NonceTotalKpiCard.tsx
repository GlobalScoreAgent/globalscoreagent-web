'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiKpiLabels } from '@/content/wami/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '@/components/marketing/shared/GlassCard';
import AnimatedCounter from '@/components/marketing/shared/AnimatedCounter';
import KpiInfoTooltip from '@/components/marketing/shared/KpiInfoTooltip';
import {
  kpiCardPadding,
  kpiLabel,
  kpiSubtext,
  kpiValue,
  kpiValueSecondary,
} from '@/components/marketing/shared/kpiTypography';

type NonceTotalKpiCardProps = {
  nonceTotal: number;
  nonceDelta: number;
};

export default function NonceTotalKpiCard({ nonceTotal, nonceDelta }: NonceTotalKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={kpiCardPadding}>
      <p className={`mb-0.5 ${kpiLabel}`}>{pick(language, wamiKpiLabels.nonceTotal)}</p>
      <p className={kpiValue}>
        <AnimatedCounter target={nonceTotal} />
      </p>

      <div className="mt-1 border-t border-white/5 pt-1">
        <div className="flex items-start justify-between gap-1">
          <p className={kpiValueSecondary}>
            <AnimatedCounter target={nonceDelta} />
          </p>
          <KpiInfoTooltip
            content={wamiKpiLabels.nonceDeltaTooltip}
            ariaLabel={wamiKpiLabels.nonceDeltaInfoLabel}
          />
        </div>
        <p className={`mt-0.5 ${kpiSubtext}`}>{pick(language, wamiKpiLabels.nonceDeltaSubtitle)}</p>
      </div>
    </GlassCard>
  );
}
