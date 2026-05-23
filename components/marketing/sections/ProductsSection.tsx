'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '../shared/SectionSurface';
import IndexProductCard from './IndexProductCard';

export default function ProductsSection() {
  const { language } = useLanguage();
  const { products } = marketingCopy;

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
      </div>
    </SectionSurface>
  );
}
