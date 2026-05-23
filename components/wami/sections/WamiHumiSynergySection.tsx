'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WamiHumiSynergySection() {
  const { language } = useLanguage();
  const { humiSynergy } = wamiCopy;

  return (
    <SectionSurface id="humi-synergy" tone="gold">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          {pick(language, humiSynergy.title)}
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-zinc-400">
          {pick(language, humiSynergy.body)}
        </p>
        <Link
          href="/humi"
          className="inline-flex rounded-2xl border border-gold/40 px-8 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
        >
          {pick(language, humiSynergy.cta)} →
        </Link>
      </div>
    </SectionSurface>
  );
}
