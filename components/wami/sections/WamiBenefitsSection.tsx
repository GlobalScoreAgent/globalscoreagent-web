'use client';

import { Shield, Zap, Link2, Eye, TrendingUp, Globe, Briefcase } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';

const benefitIcons = [Zap, Shield, Link2, Eye, TrendingUp, Briefcase, Globe];

export default function WamiBenefitsSection() {
  const { language } = useLanguage();
  const { benefits } = wamiCopy;

  return (
    <SectionSurface id="benefits" tone="darker">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, benefits.title)}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item, i) => {
            const Icon = benefitIcons[i] ?? Shield;
            return (
              <GlassCard key={i} variant="elevated">
                <Icon className="mb-3 text-gold" size={24} />
                <p className="text-sm leading-relaxed text-zinc-300">{pick(language, item)}</p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </SectionSurface>
  );
}
