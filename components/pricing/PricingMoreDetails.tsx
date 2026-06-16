'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import DocsMarkdown from '@/components/docs/DocsMarkdown';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import { pickBilingual } from '@/lib/gsa/dashboard-plan-catalog';
import { SUBSCRIPTION_PRICING_DETAIL_SECTIONS } from '@/lib/gsa/subscription-pricing-details';

export default function PricingMoreDetails() {
  const { language } = useLanguage();

  return (
    <section>
      <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
        {pick(language, pricingCopy.moreDetails)}
      </h2>
      <div className="space-y-4">
        {SUBSCRIPTION_PRICING_DETAIL_SECTIONS.map((section, index) => (
          <div
            key={index}
            className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-5"
          >
            <h3 className="text-base font-semibold text-white md:text-lg">
              {pickBilingual(section.title, language)}
            </h3>
            <DocsMarkdown markdown={pickBilingual(section.bodyMarkdown, language)} />
          </div>
        ))}
      </div>
    </section>
  );
}
