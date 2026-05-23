'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';

export default function WamiCtaSection() {
  const { language } = useLanguage();
  const { cta } = wamiCopy;

  return (
    <section className="border-t border-zinc-800 bg-zinc-950 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-semibold text-white">{pick(language, cta.title)}</h2>
        <p className="mb-8 text-zinc-400">{pick(language, cta.description)}</p>
        <Link
          href="/waitlist"
          className="inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-10 py-4 text-lg font-semibold text-black transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95"
        >
          {pick(language, cta.button)}
        </Link>
      </div>
    </section>
  );
}
