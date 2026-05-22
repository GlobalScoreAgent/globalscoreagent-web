'use client';

import { useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiKpiLabels } from '@/content/humi/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import { useIsTruncated } from '@/lib/hooks/useIsTruncated';
import GlassCard from '@/components/marketing/shared/GlassCard';
import KpiInfoTooltip from '@/components/marketing/shared/KpiInfoTooltip';
import {
  kpiAgentName,
  kpiCardPadding,
  kpiLabel,
  kpiSubtext,
  kpiValue,
} from '@/components/marketing/shared/kpiTypography';

type BestAgentKpiCardProps = {
  name: string;
  score: number;
};

export default function BestAgentKpiCard({ name, score }: BestAgentKpiCardProps) {
  const { language } = useLanguage();
  const nameRef = useRef<HTMLParagraphElement>(null);
  const isTruncated = useIsTruncated(nameRef, [name]);
  const scoreFormatted = score.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const fullNameBilingual = { es: name, en: name };

  return (
    <GlassCard variant="hero" className={`col-span-2 ${kpiCardPadding}`}>
      <p className={`mb-0.5 ${kpiLabel}`}>{pick(language, humiKpiLabels.bestAgent)}</p>
      <div className="flex items-start justify-between gap-1">
        <p
          ref={nameRef}
          className={kpiAgentName}
          title={isTruncated ? name : undefined}
        >
          {name}
        </p>
        {isTruncated ? (
          <KpiInfoTooltip
            content={fullNameBilingual}
            ariaLabel={humiKpiLabels.bestAgentNameTooltipLabel}
          />
        ) : null}
      </div>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className={`${kpiValue} text-gold`}>{scoreFormatted}</span>
        <span className={`${kpiSubtext} font-medium uppercase tracking-wide text-zinc-400`}>
          {pick(language, humiKpiLabels.humiScoreSuffix)}
        </span>
      </p>
    </GlassCard>
  );
}
