'use client';

import Link from 'next/link';
import { LayoutDashboard, Code2 } from 'lucide-react';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import ComingSoonBadge from '@/components/pricing/ComingSoonBadge';
import SectionSurface from '../shared/SectionSurface';
import GlassCard from '../shared/GlassCard';

export default function ToolsSection() {
  const { language } = useLanguage();
  const { tools } = marketingCopy;

  return (
    <SectionSurface id="tools" tone="gold">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, tools.title)}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard variant="elevated">
            <LayoutDashboard className="mb-4 text-gold" size={28} />
            <h3 className="mb-3 text-xl font-semibold text-white">
              {pick(language, tools.dashboard.title)}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              {pick(language, tools.dashboard.description)}
            </p>
            <Link
              href={buildAuthLoginUrl('/dashboard')}
              className="inline-block rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-2 text-sm font-semibold text-black"
            >
              {pick(language, tools.dashboard.cta)}
            </Link>
          </GlassCard>
          <GlassCard variant="elevated">
            <Code2 className="mb-4 text-gold" size={28} />
            <h3 className="mb-3 text-xl font-semibold text-white">
              {pick(language, tools.api.title)}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              {pick(language, tools.api.description)}
            </p>
            <ComingSoonBadge />
          </GlassCard>
        </div>
      </div>
    </SectionSurface>
  );
}
