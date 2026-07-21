'use client';

import { Activity, GitBranch, Layers, PieChart } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';

const icons = {
  origins: GitBranch,
  activity: Activity,
  multichain: Layers,
  portfolio: PieChart,
} as const;

export default function WalcertCertificatesSection() {
  const { language } = useLanguage();
  const { certificates } = walcertCopy;

  return (
    <SectionSurface id="certificates" tone="darker">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, certificates.title)}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-base text-zinc-400">
          {pick(language, certificates.intro)}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.types.map((cert) => {
            const Icon = icons[cert.id];
            return (
              <GlassCard key={cert.id} variant="elevated">
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="text-gold" size={24} />
                  <h3 className="text-lg font-semibold text-white">
                    {pick(language, cert.title)}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {pick(language, cert.summary)}
                </p>
                <p className="mt-3 text-xs text-zinc-500">
                  {pick(language, cert.dataSource)}
                </p>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </SectionSurface>
  );
}
