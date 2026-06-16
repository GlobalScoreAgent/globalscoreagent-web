'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import type { RoadmapFeature } from '@/lib/web-page/roadmap-features';
import RoadmapCard from './RoadmapCard';
import RoadmapConnector from './RoadmapConnector';

type RoadmapDesktopCarouselProps = {
  features: RoadmapFeature[];
  language: 'es' | 'en';
};

export default function RoadmapDesktopCarousel({
  features,
  language,
}: RoadmapDesktopCarouselProps) {
  const { roadmap } = marketingCopy;
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, features.length - 1));
    slideRefs.current[clamped]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',
    });
    setActiveIndex(clamped);
  }, [features.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || features.length === 0) return;

    const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = slides.indexOf(entry.target as HTMLDivElement);
          if (idx >= 0 && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = idx;
          }
        }
        if (bestIndex >= 0) {
          setActiveIndex(bestIndex);
        }
      },
      { root: track, threshold: [0.5, 0.75, 1] },
    );

    for (const slide of slides) {
      observer.observe(slide);
    }

    return () => observer.disconnect();
  }, [features]);

  if (features.length === 0) return null;

  return (
    <div className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex - 1)}
        disabled={activeIndex === 0}
        aria-label={pick(language, roadmap.prev)}
        className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 bg-black/50 text-amber-200 backdrop-blur-md transition-colors hover:border-gold/50 hover:bg-black/70 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        className="mx-12 overflow-x-auto scroll-smooth [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex items-stretch gap-0 pb-2">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="flex shrink-0 snap-start items-center"
            >
              <RoadmapCard feature={feature} language={language} />
              {index < features.length - 1 && <RoadmapConnector orientation="horizontal" />}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex + 1)}
        disabled={activeIndex >= features.length - 1}
        aria-label={pick(language, roadmap.next)}
        className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gold/30 bg-black/50 text-amber-200 backdrop-blur-md transition-colors hover:border-gold/50 hover:bg-black/70 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`${index + 1} / ${features.length}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? 'w-6 bg-amber-400'
                : 'w-2 bg-zinc-600 hover:bg-zinc-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
