'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '../shared/SectionSurface';
import GlassCard from '../shared/GlassCard';

export default function SubscriptionsSection() {
  const { language } = useLanguage();
  const teaser = pricingCopy.homeTeaser;

  return (
    <SectionSurface id="subscriptions" tone="darker">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          {pick(language, teaser.title)}
        </h2>
        <p className="mb-8 text-lg text-zinc-400 md:text-xl">{pick(language, teaser.body)}</p>
        <GlassCard variant="elevated" className="inline-block px-8 py-6">
          <Link
            href={teaser.ctaHref}
            className="inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-8 py-3.5 text-base font-semibold text-black transition-colors hover:from-amber-300 hover:to-yellow-300 md:text-lg"
          >
            {pick(language, teaser.cta)}
          </Link>
        </GlassCard>
      </div>
    </SectionSurface>
  );
}
