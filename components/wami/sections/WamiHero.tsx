'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import WamiKpiOverlay from '@/components/wami/WamiKpiOverlay';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';
import { WAMI_HERO_VIDEO_SRC } from '@/content/marketing/media';

export default function WamiHero() {
  const { language } = useLanguage();
  const { hero } = wamiCopy;

  return (
    <section
      id="wami-hero"
      className="relative min-h-screen scroll-mt-16 overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
        aria-hidden
      >
        <source src={WAMI_HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      <WamiKpiOverlay className="absolute right-3 top-20 z-20 sm:right-5 sm:top-20 md:right-8 md:top-[4.5rem]" />

      <div className="absolute bottom-6 left-4 z-10 max-w-md sm:bottom-8 sm:left-6 sm:max-w-xl md:bottom-12 md:left-10 lg:max-w-2xl [&_a]:[text-shadow:0_1px_4px_rgba(0,0,0,0.85)] [&_h1]:[text-shadow:0_2px_16px_rgba(0,0,0,0.75),0_1px_4px_rgba(0,0,0,0.9)] [&_p]:[text-shadow:0_1px_6px_rgba(0,0,0,0.85),0_2px_12px_rgba(0,0,0,0.55)]">
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {pick(language, hero.title)}
        </h1>
        <p className="mb-3 text-base leading-relaxed text-zinc-200/90 sm:text-lg md:text-xl">
          {pick(language, hero.subtitle)}
        </p>
        <p className="mb-4 text-xs text-zinc-400 sm:text-sm">
          {pick(language, hero.kpiContext)}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href="#pillars"
            className="inline-flex text-sm font-medium text-gold transition-colors hover:text-amber-300"
          >
            {pick(language, hero.explorePillars)} →
          </Link>
          <Link
            href="/"
            className="inline-flex text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            ← {pick(language, hero.backToPortal)}
          </Link>
        </div>
      </div>
    </section>
  );
}
