'use client';

import Link from 'next/link';
import { BadgeCheck, CheckCircle2, Fingerprint, Star } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '../shared/SectionSurface';
import GlassCard from '../shared/GlassCard';

const REGISTRY_ICONS = [Fingerprint, Star, BadgeCheck] as const;

export default function Erc8004Section() {
  const { language } = useLanguage();
  const { erc8004 } = marketingCopy;

  return (
    <SectionSurface id="erc-8004" tone="darker">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, erc8004.title)}
        </h2>
        <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-zinc-400">
          {pick(language, erc8004.subtitle)}
        </p>

        <blockquote className="mx-auto mb-10 max-w-3xl border-l-2 border-gold/40 pl-5 text-base italic leading-relaxed text-zinc-300 md:text-lg">
          {pick(language, erc8004.trustQuote)}
        </blockquote>

        <ul className="mx-auto mb-12 grid max-w-3xl gap-3 sm:grid-cols-1">
          {erc8004.capabilities.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-300 md:text-base">
              <CheckCircle2 className="mt-0.5 shrink-0 text-gold" size={20} />
              <span>{pick(language, item)}</span>
            </li>
          ))}
        </ul>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {erc8004.registries.map((registry, i) => {
            const Icon = REGISTRY_ICONS[i] ?? Fingerprint;
            return (
              <GlassCard key={i} variant="elevated" className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Icon className="shrink-0 text-gold" size={22} />
                  <h3 className="text-sm font-semibold text-white">
                    {pick(language, registry.name)}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {pick(language, registry.description)}
                </p>
              </GlassCard>
            );
          })}
        </div>

        <p className="mx-auto mb-8 max-w-3xl text-center text-base leading-relaxed text-zinc-400">
          {pick(language, erc8004.gsaBridge)}
        </p>

        <div className="text-center">
          <Link
            href="/docs/erc-8004"
            className="inline-block rounded-2xl border border-gold/30 bg-gold/10 px-8 py-3 text-sm font-semibold text-amber-200 transition-colors hover:border-gold/50 hover:bg-gold/15 md:text-base"
          >
            {pick(language, erc8004.cta)}
          </Link>
        </div>
      </div>
    </SectionSurface>
  );
}
