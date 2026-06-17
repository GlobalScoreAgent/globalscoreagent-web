'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import PricingGlassCard from './PricingGlassCard';

export default function CreditConsumptionPricingGrid() {
  const { language } = useLanguage();
  const { rows, columns } = pricingCopy.sections.creditConsumption;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, index) => (
        <PricingGlassCard key={index}>
          <h3 className="mb-4 text-base font-medium leading-snug text-zinc-200 md:text-lg">
            {pick(language, row.reportType)}
          </h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {pick(language, columns.credits)}
          </p>
          <p className="mt-1 text-xl font-semibold text-gold md:text-2xl">{row.credits}</p>
        </PricingGlassCard>
      ))}
    </div>
  );
}
