'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { pricingCopy } from '@/content/pricing/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';
import DashboardDetailsBanner from './DashboardDetailsBanner';
import PricingMoreDetails from './PricingMoreDetails';
import DashboardPlansPricingGrid from './DashboardPlansPricingGrid';
import CreditPackagesPricingGrid from './CreditPackagesPricingGrid';
import ReportTypePricingMatrix from './ReportTypePricingMatrix';

export default function PricingPageClient() {
  const { language } = useLanguage();
  const copy = pricingCopy;
  const { sections } = copy;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SectionSurface id="pricing-hero" tone="dark">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {pick(language, copy.hero.title)}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-zinc-400 md:text-xl">
            {pick(language, copy.hero.subtitle)}
          </p>
          <DashboardDetailsBanner />
        </div>
      </SectionSurface>

      <SectionSurface id="dashboard-plans" tone="darker">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            {pick(language, sections.dashboardPlans.title)}
          </h2>
          <DashboardPlansPricingGrid />
          <ul className="mt-8 space-y-2 text-sm text-zinc-400 md:text-base">
            {sections.dashboardPlans.notes.map((note, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-gold">•</span>
                <span>{pick(language, note)}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionSurface>

      <SectionSurface id="api-pricing" tone="dark">
        <div className="mx-auto max-w-7xl space-y-12 px-6 py-14">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {pick(language, sections.apiAccess.title)}
          </h2>

          <GlassCard variant="elevated" className="border border-gold/40 ring-1 ring-gold/20">
            <p className="text-base text-zinc-200 md:text-lg">
              {pick(language, sections.apiAccess.comingSoonNotice)}
            </p>
          </GlassCard>

          <div className="pointer-events-none space-y-12 opacity-60">
            <div>
              <h3 className="mb-2 text-2xl font-semibold text-white md:text-3xl">
                {pick(language, sections.creditPackages.title)}
              </h3>
              <p className="mb-6 text-base text-zinc-400 md:text-lg">
                {pick(language, sections.creditPackages.intro)}
              </p>
              <CreditPackagesPricingGrid />
            </div>

            <div>
              <h3 className="mb-6 text-2xl font-semibold text-white md:text-3xl">
                {pick(language, sections.reportTypeByPlan.title)}
              </h3>
              <ReportTypePricingMatrix />
              <ul className="mt-6 space-y-2 text-sm text-zinc-400 md:text-base">
                {sections.reportTypeByPlan.notes.map((note, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-gold">•</span>
                    <span>{pick(language, note)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionSurface>

      <SectionSurface id="why-model" tone="darker">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            {pick(language, sections.whyModel.title)}
          </h2>
          <ul className="space-y-4 text-base text-zinc-300 md:text-lg">
            {sections.whyModel.items.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-gold">•</span>
                <span>{pick(language, item)}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionSurface>

      <SectionSurface id="pricing-details" tone="dark">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <PricingMoreDetails />
        </div>
      </SectionSurface>

      <SectionSurface id="pricing-cta" tone="darker">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            {pick(language, copy.cta.title)}
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={buildAuthLoginUrl('/dashboard')}
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-8 py-3.5 text-base font-semibold text-black transition-colors hover:from-amber-300 hover:to-yellow-300 md:text-lg"
            >
              {pick(language, copy.cta.trial)}
            </Link>
            <a
              href={copy.cta.contactHref}
              className="rounded-2xl border border-gold/40 px-8 py-3.5 text-base font-medium text-gold transition-colors hover:bg-gold/10 md:text-lg"
            >
              {pick(language, copy.cta.contact)}
            </a>
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-sm text-zinc-500 md:text-base">
            {pick(language, copy.footerNote)}
          </p>
        </div>
      </SectionSurface>
    </main>
  );
}
