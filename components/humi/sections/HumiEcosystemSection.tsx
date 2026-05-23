'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiCopy } from '@/content/humi/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function HumiEcosystemSection() {
  const { language } = useLanguage();
  const { ecosystem } = humiCopy;

  return (
    <SectionSurface id="ecosystem" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-6 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, ecosystem.title)}
        </h2>
        <p className="mb-6 text-center text-lg leading-relaxed text-zinc-400">
          {pick(language, ecosystem.intro)}
        </p>
        <p className="mb-4 text-center text-sm text-gold/90">{pick(language, ecosystem.daily)}</p>
        <p className="mb-8 text-center text-sm text-zinc-500">{pick(language, ecosystem.universal)}</p>
        <ul className="space-y-3">
          {ecosystem.enables.map((item, i) => (
            <li key={i} className="flex gap-3 text-zinc-300">
              <span className="text-gold">•</span>
              <span>{pick(language, item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionSurface>
  );
}
