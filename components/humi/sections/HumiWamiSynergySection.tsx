'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiCopy } from '@/content/humi/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function HumiWamiSynergySection() {
  const { language } = useLanguage();
  const { wamiSynergy } = humiCopy;

  return (
    <SectionSurface id="wami-synergy" tone="gold">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          {pick(language, wamiSynergy.title)}
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-zinc-400">
          {pick(language, wamiSynergy.body)}
        </p>
        <Link
          href="/wami"
          className="inline-flex rounded-2xl border border-gold/40 px-8 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
        >
          {pick(language, wamiSynergy.cta)} →
        </Link>
      </div>
    </SectionSurface>
  );
}
