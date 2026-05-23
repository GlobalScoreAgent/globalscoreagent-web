'use client';

import { useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { mainKpiLabels } from '@/content/marketing/kpi-labels';
import type { Bilingual } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';
import { useIsTruncated } from '@/lib/hooks/useIsTruncated';
import GlassCard from '../../shared/GlassCard';
import AnimatedCounter from '../../shared/AnimatedCounter';
import KpiInfoTooltip from '../../shared/KpiInfoTooltip';
import { kpiCardPadding, kpiLabel, kpiSubtext, kpiValue } from '../../shared/kpiTypography';

type TopKpiCardProps = {
  label: Bilingual;
  value: number | null;
  chainName: string | null;
  tooltip?: Bilingual;
};

export default function TopKpiCard({ label, value, chainName, tooltip }: TopKpiCardProps) {
  const { language } = useLanguage();
  const chainRef = useRef<HTMLParagraphElement>(null);
  const isChainTruncated = useIsTruncated(chainRef, [chainName]);

  return (
    <GlassCard variant="hero" className={kpiCardPadding}>
      <div className="mb-0.5 flex items-start justify-between gap-1">
        <p className={`min-w-0 flex-1 ${kpiLabel}`}>{pick(language, label)}</p>
        {tooltip ? (
          <KpiInfoTooltip content={tooltip} ariaLabel={mainKpiLabels.metricInfoLabel} />
        ) : null}
      </div>
      {value !== null ? (
        <>
          <p className={kpiValue}>
            <AnimatedCounter target={value} />
          </p>
          {chainName ? (
            <p
              ref={chainRef}
              className={`mt-0 truncate ${kpiSubtext} text-zinc-300`}
              title={isChainTruncated ? chainName : undefined}
            >
              {chainName}
              <span className="text-zinc-500">
                {' '}
                · {pick(language, mainKpiLabels.leadingChain)}
              </span>
            </p>
          ) : null}
        </>
      ) : (
        <p className={kpiSubtext}>—</p>
      )}
    </GlassCard>
  );
}
