'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { mainKpiLabels } from '@/content/marketing/kpi-labels';
import type { Bilingual } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '../../shared/GlassCard';
import AnimatedCounter from '../../shared/AnimatedCounter';
import KpiInfoTooltip from '../../shared/KpiInfoTooltip';
import { kpiCardPadding, kpiLabel, kpiSubtext, kpiValue } from '../../shared/kpiTypography';

type NumericKpiCardProps = {
  label: Bilingual;
  value: number | null;
  tooltip?: Bilingual;
};

export default function NumericKpiCard({ label, value, tooltip }: NumericKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={kpiCardPadding}>
      <div className="mb-0.5 flex items-start justify-between gap-1">
        <p className={`min-w-0 flex-1 ${kpiLabel}`}>{pick(language, label)}</p>
        {tooltip ? (
          <KpiInfoTooltip content={tooltip} ariaLabel={mainKpiLabels.metricInfoLabel} />
        ) : null}
      </div>
      {value !== null ? (
        <p className={kpiValue}>
          <AnimatedCounter target={value} />
        </p>
      ) : (
        <p className={kpiSubtext}>—</p>
      )}
    </GlassCard>
  );
}
