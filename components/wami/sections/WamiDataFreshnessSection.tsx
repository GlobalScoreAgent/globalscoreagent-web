'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';

export default function WamiDataFreshnessSection() {
  const { language } = useLanguage();
  const { freshness } = wamiCopy;

  return (
    <SectionSurface id="freshness" tone="dark">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-6 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, freshness.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          {pick(language, freshness.intro)}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard variant="elevated">
            <h3 className="mb-4 text-lg font-semibold text-gold">
              {pick(language, freshness.evaluatedTitle)}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {freshness.evaluated.map((item, i) => (
                <li key={i}>• {pick(language, item)}</li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard variant="elevated">
            <h3 className="mb-4 text-lg font-semibold text-gold">
              {pick(language, freshness.refreshedTitle)}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {freshness.refreshed.map((item, i) => (
                <li key={i}>• {pick(language, item)}</li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard variant="elevated">
            <h3 className="mb-4 text-lg font-semibold text-gold">
              {pick(language, freshness.approachTitle)}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              {freshness.approach.map((item, i) => (
                <li key={i}>• {pick(language, item)}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </SectionSurface>
  );
}
