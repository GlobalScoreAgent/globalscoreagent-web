'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { TOP10_AGENTS_LIST_PATH, appendPublicLangParam } from '@/lib/dashboardAgentLookup';
import SectionSurface from '../shared/SectionSurface';
import IndexProductCard from './IndexProductCard';

export default function ProductsSection() {
  const { language } = useLanguage();
  const { products } = marketingCopy;
  const promo = marketingCopy.top10AgentsPromo;
  const top10Href = appendPublicLangParam(TOP10_AGENTS_LIST_PATH, language);

  return (
    <SectionSurface id="products" tone="gold">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, products.title)}
        </h2>
        <div className="mb-10 grid gap-8 lg:grid-cols-2 lg:gap-6">
          <IndexProductCard variant="humi" />
          <IndexProductCard variant="wami" />
        </div>
        <p className="rounded-2xl border border-gold/30 bg-gold/10 px-6 py-4 text-center text-lg font-medium text-amber-200 shadow-[0_0_30px_-10px_rgba(212,175,55,0.4)]">
          {pick(language, products.synergy)}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href={top10Href}
            className="inline-flex rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-10 py-4 text-base font-semibold text-black shadow-[0_0_32px_-8px_rgba(212,175,55,0.65)] transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95 md:text-lg"
          >
            {pick(language, promo.cta)} →
          </Link>
          <p className="text-sm text-zinc-400">{pick(language, promo.hintHome)}</p>
        </div>
      </div>
    </SectionSurface>
  );
}
