'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getWalletCategoryLabel, wamiKpiLabels } from '@/content/wami/kpi-labels';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '@/components/marketing/shared/GlassCard';
import AnimatedCounter from '@/components/marketing/shared/AnimatedCounter';
import { kpiCardPadding, kpiLabel, kpiSubtext } from '@/components/marketing/shared/kpiTypography';

type WalletCategoriesKpiCardProps = {
  categories: Record<string, number>;
};

export default function WalletCategoriesKpiCard({ categories }: WalletCategoriesKpiCardProps) {
  const { language } = useLanguage();

  const sorted = useMemo(
    () =>
      Object.entries(categories)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count),
    [categories]
  );

  return (
    <GlassCard variant="hero" className={`col-span-2 ${kpiCardPadding}`}>
      <p className={`mb-1 ${kpiLabel}`}>{pick(language, wamiKpiLabels.walletCategoriesTitle)}</p>
      <ul className="space-y-1">
        {sorted.map(({ key, count }) => (
          <li
            key={key}
            className="flex items-center justify-between gap-2 border-b border-white/5 py-0.5 last:border-0"
          >
            <span className={`min-w-0 flex-1 truncate ${kpiSubtext} text-zinc-300`}>
              {getWalletCategoryLabel(key, language)}
            </span>
            <span className={`shrink-0 font-mono font-semibold text-white/90 ${kpiSubtext}`}>
              <AnimatedCounter target={count} />
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
