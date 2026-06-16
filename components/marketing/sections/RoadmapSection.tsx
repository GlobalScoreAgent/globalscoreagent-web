'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { fetchApiNoStore } from '@/lib/api/client-fetch';
import type { RoadmapFeature } from '@/lib/web-page/roadmap-features';
import SectionSurface from '../shared/SectionSurface';
import RoadmapCard from './RoadmapCard';
import RoadmapConnector from './RoadmapConnector';
import RoadmapDesktopCarousel from './RoadmapDesktopCarousel';

type RoadmapApiResponse = {
  success: boolean;
  features?: RoadmapFeature[];
};

type RoadmapSectionProps = {
  initialFeatures: RoadmapFeature[];
};

export default function RoadmapSection({ initialFeatures }: RoadmapSectionProps) {
  const { language } = useLanguage();
  const { roadmap } = marketingCopy;
  const [features, setFeatures] = useState(initialFeatures);

  useEffect(() => {
    setFeatures(initialFeatures);
  }, [initialFeatures]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchApiNoStore('/api/web-page/roadmap');
        const data = (await res.json()) as RoadmapApiResponse;
        if (data.success && Array.isArray(data.features)) {
          setFeatures(data.features);
        }
      } catch {
        /* keep SSR / initial data */
      }
    })();
  }, []);

  return (
    <SectionSurface id="roadmap" tone="dark">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, roadmap.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-zinc-400">
          {pick(language, roadmap.subtitle)}
        </p>

        {features.length === 0 ? (
          <p className="text-center text-zinc-500">{pick(language, roadmap.empty)}</p>
        ) : (
          <>
            <div className="flex flex-col items-center lg:hidden">
              {features.map((feature, index) => (
                <div key={feature.id} className="flex w-full max-w-sm flex-col items-center">
                  <RoadmapCard feature={feature} language={language} />
                  {index < features.length - 1 && <RoadmapConnector orientation="vertical" />}
                </div>
              ))}
            </div>

            <RoadmapDesktopCarousel features={features} language={language} />
          </>
        )}
      </div>
    </SectionSurface>
  );
}
