'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { Bilingual } from '@/content/marketing/i18n';
import { pick } from '@/content/marketing/i18n';
import GlassCard from './GlassCard';

export type StaticKpiStat = {
  label: Bilingual;
  value: string | Bilingual;
};

type StaticKpiOverlayProps = {
  stats: StaticKpiStat[];
  className?: string;
};

export default function StaticKpiOverlay({ stats, className = '' }: StaticKpiOverlayProps) {
  const { language } = useLanguage();

  return (
    <div
      className={`grid w-56 grid-cols-2 gap-2 sm:w-64 md:w-72 md:grid-cols-2 ${className}`}
    >
      {stats.map((stat, i) => {
        const displayValue =
          typeof stat.value === 'string' ? stat.value : pick(language, stat.value);

        return (
          <GlassCard key={i} variant="hero" className="!p-2.5 sm:!p-3">
            <p className="mb-0.5 text-[10px] font-medium uppercase tracking-widest text-gold/90 sm:text-xs">
              {pick(language, stat.label)}
            </p>
            <p className="font-mono text-xl font-bold text-white/95 sm:text-2xl">{displayValue}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
