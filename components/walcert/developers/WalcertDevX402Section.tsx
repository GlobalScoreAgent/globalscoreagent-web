'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertDevX402Section() {
  const { language } = useLanguage();
  const { x402 } = walcertDevelopersCopy;

  return (
    <SectionSurface id="x402" tone="darker">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
          {pick(language, x402.title)}
        </h2>
        <p className="mb-8 text-zinc-400">{pick(language, x402.intro)}</p>
        <ol className="mb-8 space-y-4">
          {x402.steps.map((step, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-2xl border border-zinc-800/80 bg-black/30 px-5 py-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-zinc-300">
                {pick(language, step)}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-zinc-500">{pick(language, x402.note)}</p>
      </div>
    </SectionSurface>
  );
}
