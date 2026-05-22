'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiKpiLabels } from '@/content/wami/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '@/components/marketing/shared/GlassCard';
import AnimatedCounter from '@/components/marketing/shared/AnimatedCounter';
import {
  kpiCardPadding,
  kpiLabel,
  kpiSubtext,
  kpiValue,
} from '@/components/marketing/shared/kpiTypography';

type WalletLinkKpiCardProps = {
  valid: number;
  notValid: number;
};

export default function WalletLinkKpiCard({ valid, notValid }: WalletLinkKpiCardProps) {
  const { language } = useLanguage();

  return (
    <GlassCard variant="hero" className={`col-span-2 ${kpiCardPadding}`}>
      <p className={`mb-1 ${kpiLabel}`}>{pick(language, wamiKpiLabels.walletLinkTitle)}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className={kpiValue}>
            <AnimatedCounter target={valid} />
          </p>
          <p className={`mt-0.5 ${kpiSubtext}`}>{pick(language, wamiKpiLabels.walletLinkValid)}</p>
        </div>
        <div>
          <p className={kpiValue}>
            <AnimatedCounter target={notValid} />
          </p>
          <p className={`mt-0.5 ${kpiSubtext}`}>
            {pick(language, wamiKpiLabels.walletLinkNotValid)}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
