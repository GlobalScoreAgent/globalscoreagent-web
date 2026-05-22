'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '../shared/SectionSurface';
import GlassCard from '../shared/GlassCard';

function formatCalls(value: number, language: 'es' | 'en') {
  return value.toLocaleString(language === 'es' ? 'es-ES' : 'en-US');
}

export default function SubscriptionsSection() {
  const { language } = useLanguage();
  const { subscriptions } = marketingCopy;

  return (
    <SectionSurface id="subscriptions" tone="darker">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, subscriptions.title)}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {subscriptions.tiers.map((tier) => (
            <GlassCard
              key={tier.id}
              variant="elevated"
              className={`flex h-full flex-col ${'highlight' in tier && tier.highlight ? 'ring-1 ring-gold/50' : ''}`}
            >
              <h3 className="mb-2 text-2xl font-semibold text-white">{tier.name}</h3>
              <p className="mb-6 text-sm text-zinc-400">{pick(language, tier.tagline)}</p>

              {'enterprise' in tier && tier.enterprise ? (
                <p className="flex flex-1 items-center text-center text-sm leading-relaxed text-zinc-300">
                  {pick(language, tier.salesMessage)}
                </p>
              ) : 'callsPerMinute' in tier ? (
                <div className="flex-1 space-y-4 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>{pick(language, subscriptions.labels.callsPerMinute)}</span>
                    <span className="font-medium text-white">{tier.callsPerMinute}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>{pick(language, subscriptions.labels.monthlyCalls)}</span>
                    <span className="font-medium text-white">
                      {formatCalls(tier.monthlyCalls, language)}
                    </span>
                  </div>
                  <div className="space-y-3 pt-2">
                    {tier.features.map((feature, i) =>
                      feature.type === 'check' ? (
                        <div key={i} className="text-zinc-300">
                          <span className="font-medium text-emerald-400">✓</span>{' '}
                          {pick(language, feature.text)}
                        </div>
                      ) : (
                        <div key={i} className="pl-4 text-zinc-500">
                          • {pick(language, feature.text)}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              <Link
                href={tier.ctaHref}
                className={`mt-8 block w-full rounded-2xl py-3 text-center text-sm font-medium transition-colors ${
                  'ctaStyle' in tier && tier.ctaStyle === 'solid'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black hover:from-amber-300 hover:to-yellow-300'
                    : 'border border-gold/40 text-gold hover:bg-gold/10'
                }`}
              >
                {pick(language, tier.cta)}
              </Link>
            </GlassCard>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-zinc-500">
          {pick(language, subscriptions.disclaimer)}
        </p>
      </div>
    </SectionSurface>
  );
}
