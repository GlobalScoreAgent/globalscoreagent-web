'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { publicApiCopy } from '@/content/public-api/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';
import PublicApiSearchPlayground from '@/components/public-api/playgrounds/PublicApiSearchPlayground';
import PublicApiMaturityPlayground from '@/components/public-api/playgrounds/PublicApiMaturityPlayground';

export default function PublicApiPageClient() {
  const { language } = useLanguage();
  const copy = publicApiCopy;
  const langQuery = language === 'en' ? '?lang=en' : '';

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SectionSurface id="public-api-hero" tone="dark">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <h1 className="mb-4 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {pick(language, copy.hero.title)}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-zinc-400 md:text-xl">
            {pick(language, copy.hero.subtitle)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {Object.values(copy.hero.badges).map((badge) => (
              <span
                key={badge.en}
                className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold"
              >
                {pick(language, badge)}
              </span>
            ))}
          </div>
        </div>
      </SectionSurface>

      <SectionSurface id="public-api-search" tone="darker">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <GlassCard variant="elevated" className="mb-8">
            <p className="mb-2 font-mono text-sm text-gold">{copy.search.endpoint}</p>
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {pick(language, copy.search.title)}
            </h2>
            <p className="mb-4 text-zinc-400">{pick(language, copy.search.description)}</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              {copy.search.bullets.map((bullet) => (
                <li key={bullet.en} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{pick(language, bullet)}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard variant="default" className="mb-8">
            <h3 className="mb-3 text-xl font-semibold text-white">
              {pick(language, copy.search.responseGuide.title)}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-zinc-400">
              {pick(language, copy.search.responseGuide.intro)}
            </p>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold/80">
              {pick(language, copy.search.responseGuide.agentFieldsTitle)}
            </p>
            <ul className="mb-6 space-y-2 text-sm text-zinc-400">
              {copy.search.responseGuide.agentFields.map((field) => (
                <li key={field.en} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{pick(language, field)}</span>
                </li>
              ))}
            </ul>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold/80">
              {pick(language, copy.search.responseGuide.paginationTitle)}
            </p>
            <ul className="mb-6 space-y-2 text-sm text-zinc-400">
              {copy.search.responseGuide.paginationFields.map((field) => (
                <li key={field.en} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{pick(language, field)}</span>
                </li>
              ))}
            </ul>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gold/80">
              {pick(language, copy.search.responseGuide.docsTitle)}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h4 className="mb-2 font-semibold text-white">
                  {pick(language, copy.search.responseGuide.erc8004.title)}
                </h4>
                <p className="mb-3 text-sm text-zinc-400">
                  {pick(language, copy.search.responseGuide.erc8004.description)}
                </p>
                <Link
                  href={`/docs/erc-8004${langQuery}`}
                  className="text-sm text-gold transition-colors hover:text-amber-300"
                >
                  {pick(language, copy.search.responseGuide.erc8004.link)} →
                </Link>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h4 className="mb-2 font-semibold text-white">
                  {pick(language, copy.search.responseGuide.apiDocs.title)}
                </h4>
                <p className="mb-3 text-sm text-zinc-400">
                  {pick(language, copy.search.responseGuide.apiDocs.description)}
                </p>
                <Link
                  href={`/docs/public-api-free-tier${langQuery}`}
                  className="text-sm text-gold transition-colors hover:text-amber-300"
                >
                  {pick(language, copy.search.responseGuide.apiDocs.link)} →
                </Link>
              </div>
            </div>
          </GlassCard>

          <PublicApiSearchPlayground />
        </div>
      </SectionSurface>

      <SectionSurface id="public-api-maturity" tone="dark">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <GlassCard variant="elevated" className="mb-8">
            <p className="mb-2 font-mono text-sm text-gold">{copy.maturity.endpoint}</p>
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {pick(language, copy.maturity.title)}
            </h2>
            <p className="mb-4 text-zinc-400">{pick(language, copy.maturity.description)}</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              {copy.maturity.bullets.map((bullet) => (
                <li key={bullet.en} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{pick(language, bullet)}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard variant="default" className="mb-8">
            <h3 className="mb-3 text-xl font-semibold text-white">
              {pick(language, copy.maturity.responseGuide.title)}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-zinc-400">
              {pick(language, copy.maturity.responseGuide.intro)}
            </p>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold/80">
              {pick(language, copy.maturity.responseGuide.fieldsTitle)}
            </p>
            <ul className="mb-6 space-y-2 text-sm text-zinc-400">
              {copy.maturity.responseGuide.fields.map((field) => (
                <li key={field.en} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{pick(language, field)}</span>
                </li>
              ))}
            </ul>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gold/80">
              {pick(language, copy.maturity.responseGuide.indicesTitle)}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h4 className="mb-2 font-semibold text-white">
                  {pick(language, copy.maturity.responseGuide.humi.title)}
                </h4>
                <p className="mb-3 text-sm text-zinc-400">
                  {pick(language, copy.maturity.responseGuide.humi.description)}
                </p>
                <Link
                  href={`/docs/index-humi${langQuery}`}
                  className="text-sm text-gold transition-colors hover:text-amber-300"
                >
                  {pick(language, copy.maturity.responseGuide.humi.link)} →
                </Link>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h4 className="mb-2 font-semibold text-white">
                  {pick(language, copy.maturity.responseGuide.wami.title)}
                </h4>
                <p className="mb-3 text-sm text-zinc-400">
                  {pick(language, copy.maturity.responseGuide.wami.description)}
                </p>
                <Link
                  href={`/docs/index-wami${langQuery}`}
                  className="text-sm text-gold transition-colors hover:text-amber-300"
                >
                  {pick(language, copy.maturity.responseGuide.wami.link)} →
                </Link>
              </div>
            </div>
          </GlassCard>

          <PublicApiMaturityPlayground />
        </div>
      </SectionSurface>

      <SectionSurface id="public-api-docs-cta" tone="gold">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {pick(language, copy.docsCta.title)}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-zinc-400">
            {pick(language, copy.docsCta.description)}
          </p>
          <Link
            href={`/docs/public-api-free-tier${langQuery}`}
            className="inline-block rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-2.5 text-sm font-semibold text-black"
          >
            {pick(language, copy.docsCta.link)} →
          </Link>
          <p className="mx-auto mt-6 max-w-xl text-sm text-zinc-500">
            {pick(language, copy.docsCta.paidNote)}
          </p>
        </div>
      </SectionSurface>
    </main>
  );
}
