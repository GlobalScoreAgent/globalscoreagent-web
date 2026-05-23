'use client';

import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { HUMI_BACKGROUND_SRC } from '@/content/marketing/media';
import SectionSurface from '../shared/SectionSurface';

export default function MissionSection() {
  const { language } = useLanguage();
  const { mission } = marketingCopy;

  return (
    <SectionSurface id="mission" tone="darker" backgroundVideo={HUMI_BACKGROUND_SRC}>
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-10 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, mission.title)}
        </h2>
        <ul className="space-y-4">
          {mission.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-zinc-300">
              <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={20} />
              <span>{pick(language, item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionSurface>
  );
}
