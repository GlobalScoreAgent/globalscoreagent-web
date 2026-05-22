'use client';

import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '../shared/SectionSurface';
import GlassCard from '../shared/GlassCard';

export default function ProblemSection() {
  const { language } = useLanguage();
  const { problem } = marketingCopy;

  return (
    <SectionSurface id="problem" tone="dark">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, problem.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          {pick(language, problem.intro)}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {problem.items.map((item, i) => (
            <GlassCard key={i} variant="elevated" className="flex gap-4">
              <AlertCircle className="mt-0.5 shrink-0 text-gold" size={22} />
              <p className="text-sm leading-relaxed text-zinc-300">{pick(language, item)}</p>
            </GlassCard>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-3xl text-center text-lg text-zinc-400">
          {pick(language, problem.closing)}
        </p>
      </div>
    </SectionSurface>
  );
}
