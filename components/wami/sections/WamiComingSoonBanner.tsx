'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';

export default function WamiComingSoonBanner() {
  const { language } = useLanguage();
  const { comingSoon } = wamiCopy;

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
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-400">
            {comingSoon.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-amber-400">•</span>
                {pick(language, feature)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
