'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { Bilingual } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '@/components/marketing/shared/GlassCard';
import { kpiCardPadding, kpiLabel, kpiValue } from '@/components/marketing/shared/kpiTypography';

type DecimalKpiCardProps = {
  label: Bilingual;
  value: number;
  decimals?: number;
};

export default function DecimalKpiCard({ label, value, decimals = 2 }: DecimalKpiCardProps) {
  const { language } = useLanguage();
  const formatted = value.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: decimals,
  });

  return (
    <GlassCard variant="hero" className={kpiCardPadding}>
      <p className={`mb-0.5 ${kpiLabel}`}>{pick(language, label)}</p>
      <p className={kpiValue}>{formatted}</p>
    </GlassCard>
  );
}
