'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { mainKpiLabels } from '@/content/marketing/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '../../shared/GlassCard';
import KpiInfoTooltip from '../../shared/KpiInfoTooltip';
import { kpiCardPadding, kpiChip, kpiLabel, kpiSubtext } from '../../shared/kpiTypography';

type ChainsKpiCardProps = {
  chains: string[];
  showEmptyMessage?: boolean;
};

export default function ChainsKpiCard({ chains, showEmptyMessage = false }: ChainsKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={`col-span-2 ${kpiCardPadding}`}>
      <div className="mb-1 flex items-start justify-between gap-1">
        <p className={kpiLabel}>{pick(language, mainKpiLabels.chainsMonitored)}</p>
        <KpiInfoTooltip
          content={mainKpiLabels.chainsMonitoredTooltip}
          ariaLabel={mainKpiLabels.chainsInfoLabel}
        />
      </div>
      {chains.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {chains.map((chain) => (
            <span key={chain} className={kpiChip}>
              {chain}
            </span>
          ))}
        </div>
      ) : (
        <p className={kpiSubtext}>
          {showEmptyMessage ? pick(language, mainKpiLabels.chainsEmpty) : '—'}
        </p>
      )}
    </GlassCard>
  );
}
