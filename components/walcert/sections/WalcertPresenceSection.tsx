'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';
import GlassCard from '@/components/marketing/shared/GlassCard';

export default function WalcertPresenceSection() {
  const { language } = useLanguage();
  const { presence } = walcertCopy;

  return (
    <SectionSurface id="presence" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          {pick(language, presence.title)}
        </h2>
        <p className="mb-10 text-center text-base leading-relaxed text-zinc-400 md:text-lg">
          {pick(language, presence.intro)}
        </p>
        <div className="space-y-6">
          {presence.items.map((item) => (
            <GlassCard key={item.id} variant="elevated" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={item.logo.src}
                    alt={pick(language, item.logo.alt)}
                    width={120}
                    height={36}
                    className="h-8 w-auto max-w-[140px] object-contain object-left sm:h-9"
                  />
                  <h3 className="text-lg font-semibold text-white">
                    {pick(language, item.title)}
                  </h3>
                </div>
                <time className="text-xs font-medium uppercase tracking-wide text-gold/80">
                  {pick(language, item.date)}
                </time>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-black/25 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {pick(language, item.about.title)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {pick(language, item.about.body)}
                </p>
                <a
                  href={item.about.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold transition-colors hover:text-amber-300"
                >
                  {pick(language, item.about.linkLabel)}
                  <ExternalLink size={14} className="shrink-0 opacity-70" />
                </a>
              </div>

              <p className="text-sm leading-relaxed text-zinc-400">
                {pick(language, item.body)}
              </p>
              <dl className="grid gap-3 sm:grid-cols-2">
                {item.facts.map((fact, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-800/80 bg-black/25 px-4 py-3"
                  >
                    <dt className="text-xs uppercase tracking-wide text-zinc-500">
                      {pick(language, fact.label)}
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-200">
                      {pick(language, fact.value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-4 pt-1">
                {item.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-gold transition-colors hover:text-amber-300"
                  >
                    {pick(language, link.label)}
                    <ExternalLink size={14} className="shrink-0 opacity-70" />
                  </a>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </SectionSurface>
  );
}
