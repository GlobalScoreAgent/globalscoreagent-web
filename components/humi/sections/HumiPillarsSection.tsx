'use client';

import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { humiCopy } from '@/content/humi/copy';
import { pick } from '@/content/marketing/i18n';
import { HUMI_BACKGROUND_SRC } from '@/content/marketing/media';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import HumiPillarFlipCard from '../HumiPillarFlipCard';

export default function HumiPillarsSection() {
  const { language } = useLanguage();
  const { pillars } = humiCopy;
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <SectionSurface id="pillars" tone="darker" backgroundVideo={HUMI_BACKGROUND_SRC}>
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, pillars.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          {pick(language, pillars.intro)}
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.list.map((pillar) => (
            <HumiPillarFlipCard
              key={pillar.id}
              pillar={pillar}
              isFlipped={flippedCards.has(pillar.id)}
              onFlip={() => toggleFlip(pillar.id)}
            />
          ))}
        </div>
      </div>
    </SectionSurface>
  );
}
