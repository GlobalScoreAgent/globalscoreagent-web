'use client';

import { Link2, PenLine } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';

const layerIcons = [PenLine, Link2];

export default function WalcertVerifiabilitySection() {
  const { language } = useLanguage();
  const { verifiability } = walcertCopy;

  return (
    <SectionSurface id="verifiability" tone="dark">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, verifiability.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-base text-zinc-400">
          {pick(language, verifiability.intro)}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {verifiability.layers.map((layer, i) => {
            const Icon = layerIcons[i] ?? PenLine;
            return (
              <GlassCard key={i} variant="elevated">
                <Icon className="mb-3 text-gold" size={24} />
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {pick(language, layer.title)}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {pick(language, layer.body)}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </SectionSurface>
  );
}
