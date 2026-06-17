'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import PricingGlassCard from './PricingGlassCard';

export default function CreditPackagesPricingGrid() {
  const { language } = useLanguage();
  const { rows, columns } = pricingCopy.sections.creditPackages;

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {rows.map((row, index) => (
        <PricingGlassCard key={index}>
          <h3 className="mb-4 text-xl font-semibold text-white">{row.package}</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {pick(language, columns.price)}
              </dt>
              <dd className="mt-1 text-xl font-semibold text-gold">{row.price}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {pick(language, columns.credits)}
              </dt>
              <dd className="mt-1 font-medium text-white">{row.credits}</dd>
            </div>
          </dl>
        </PricingGlassCard>
      ))}
    </div>
  );
}
