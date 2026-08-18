'use client';

import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertDevErc8257Section() {
  const { language } = useLanguage();
  const { erc8257 } = walcertDevelopersCopy;

  return (
    <SectionSurface id="erc8257" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
          {pick(language, erc8257.title)}
        </h2>
        <p className="mb-8 text-zinc-400">{pick(language, erc8257.intro)}</p>
        <dl className="mb-6 grid gap-3 sm:grid-cols-2">
          {erc8257.facts.map((fact) => (
            <div
              key={pick(language, fact.label)}
              className="rounded-xl border border-zinc-800/80 bg-black/25 px-4 py-3"
            >
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                {pick(language, fact.label)}
              </dt>
              <dd className="mt-1 text-sm text-zinc-200">{pick(language, fact.value)}</dd>
            </div>
          ))}
        </dl>
        <ul className="mb-6 space-y-2">
          {erc8257.rows.map((row) => (
            <li
              key={row.slug}
              className="flex flex-col gap-1 rounded-xl border border-zinc-800/80 bg-black/25 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-mono text-sm text-gold">{row.slug}</span>
              <span className="text-sm text-zinc-300">{pick(language, row.ids)}</span>
            </li>
          ))}
        </ul>
        <a
          href={erc8257.manifestHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gold transition-colors hover:text-amber-300"
        >
          {pick(language, erc8257.manifestLabel)}
          <ExternalLink size={14} className="shrink-0 opacity-70" />
        </a>
        <p className="text-sm text-zinc-500">{pick(language, erc8257.note)}</p>
      </div>
    </SectionSurface>
  );
}
