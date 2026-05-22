'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import { PORTAL_HERO_VIDEO_SRC } from '@/content/marketing/media';
import KpiOverlay from './KpiOverlay';

export default function PortalHero() {
  const { language } = useLanguage();

  return (
    <section
      id="overview"
      className="relative min-h-screen scroll-mt-16 overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
      >
        <source src={PORTAL_HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      {/* KPIs — esquina superior derecha */}
      <KpiOverlay className="absolute right-3 top-20 z-20 sm:right-5 sm:top-20 md:right-8 md:top-[4.5rem]" />

      {/* Copy — esquina inferior izquierda */}
      <div className="absolute bottom-6 left-4 z-10 max-w-md sm:bottom-8 sm:left-6 sm:max-w-xl md:bottom-12 md:left-10 lg:max-w-2xl [&_h1]:[text-shadow:0_2px_16px_rgba(0,0,0,0.75),0_1px_4px_rgba(0,0,0,0.9)] [&_p]:[text-shadow:0_1px_6px_rgba(0,0,0,0.85),0_2px_12px_rgba(0,0,0,0.55)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {pick(language, marketingCopy.hero.eyebrow)}
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {pick(language, marketingCopy.hero.h1)}
        </h1>
        <p className="mb-3 text-base leading-relaxed text-zinc-200/90 sm:text-lg md:text-xl">
          {pick(language, marketingCopy.hero.subtitle)}
        </p>
        <p className="mb-2 text-xs text-zinc-400 sm:text-sm">
          {pick(language, marketingCopy.hero.kpiContext)}
        </p>
        <p className="text-xs text-zinc-400 sm:text-sm">
          {pick(language, marketingCopy.hero.microcopy)}
        </p>
      </div>
    </section>
  );
}
