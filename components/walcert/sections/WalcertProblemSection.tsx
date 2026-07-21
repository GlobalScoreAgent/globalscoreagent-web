'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertProblemSection() {
  const { language } = useLanguage();
  const { problem } = walcertCopy;

  return (
    <SectionSurface id="problem" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-6 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, problem.title)}
        </h2>
        <p className="mb-8 text-center text-base leading-relaxed text-zinc-400 md:text-lg">
          {pick(language, problem.intro)}
        </p>
        <ul className="space-y-4">
          {problem.points.map((point, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-2xl border border-zinc-800/80 bg-black/30 px-5 py-4 text-sm leading-relaxed text-zinc-300"
            >
              <span className="shrink-0 text-gold">•</span>
              <span>{pick(language, point)}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionSurface>
  );
}
