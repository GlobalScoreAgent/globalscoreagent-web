'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiCopy } from '@/content/humi/copy';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { TOP10_AGENTS_LIST_PATH, appendPublicLangParam } from '@/lib/dashboardAgentLookup';

export default function HumiComingSoonBanner() {
  const { language } = useLanguage();
  const { comingSoon } = humiCopy;
  const promo = marketingCopy.top10AgentsPromo;
  const top10Href = appendPublicLangParam(TOP10_AGENTS_LIST_PATH, language);

  return (
    <section className="border-t border-gold/10 bg-black py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-zinc-900 to-black p-10 text-center md:p-14">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {pick(language, comingSoon.title)}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
            {pick(language, comingSoon.description)}
          </p>
          <div className="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-400">
            {comingSoon.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                {pick(language, feature)}
              </div>
            ))}
          </div>
          <p className="mb-6 text-sm text-zinc-400">{pick(language, promo.hintComingSoon)}</p>
          <Link
            href={top10Href}
            className="inline-flex rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-10 py-4 text-base font-semibold text-black shadow-[0_0_32px_-8px_rgba(212,175,55,0.65)] transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95 md:text-lg"
          >
            {pick(language, promo.cta)} →
          </Link>
        </div>
      </div>
    </section>
  );
}
