'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import GlassCard from '@/components/marketing/shared/GlassCard';

export default function DashboardDetailsBanner() {
  const { language } = useLanguage();
  const { dashboardBanner } = pricingCopy;

  return (
    <GlassCard variant="elevated" className="border border-gold/40 ring-1 ring-gold/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-base leading-relaxed text-zinc-200 md:text-lg">
          {pick(language, dashboardBanner.message)}
        </p>
        <Link
          href={buildAuthLoginUrl('/dashboard')}
          className="shrink-0 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-3 text-center text-base font-semibold text-black transition-colors hover:from-amber-300 hover:to-yellow-300 md:text-lg"
        >
          {pick(language, dashboardBanner.cta)}
        </Link>
      </div>
    </GlassCard>
  );
}
