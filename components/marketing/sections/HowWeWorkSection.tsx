'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { INFRASTRUCTURE_DIAGRAM_SRC } from '@/content/marketing/media';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '../shared/SectionSurface';
import GlassCard from '../shared/GlassCard';

export default function HowWeWorkSection() {
  const { language } = useLanguage();
  const { howWeWork } = marketingCopy;

  return (
    <SectionSurface id="how-we-work" tone="darker">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, howWeWork.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          {pick(language, howWeWork.subtitle)}
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {howWeWork.steps.map((step, i) => (
            <GlassCard key={i} variant="elevated">
              <span className="mb-3 inline-block font-mono text-sm text-gold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {pick(language, step.title)}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {pick(language, step.description)}
              </p>
            </GlassCard>
          ))}
        </div>
        <figure className="mx-auto mt-12 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-gold/20 bg-black/30 p-2 ring-1 ring-inset ring-white/5 backdrop-blur-sm">
            <img
              src={INFRASTRUCTURE_DIAGRAM_SRC}
              alt={pick(language, howWeWork.infrastructureAlt)}
              className="h-auto w-full rounded-xl object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </figure>
      </div>
    </SectionSurface>
  );
}
