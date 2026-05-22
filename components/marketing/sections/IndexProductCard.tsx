'use client';

import Link from 'next/link';
import { BarChart3, Wallet, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { marketingCopy } from '@/content/marketing/copy';
import { humiCopy } from '@/content/humi/copy';
import { wamiCopy } from '@/content/wami/copy';
import { pick } from '@/content/marketing/i18n';
import GlassCard from '../shared/GlassCard';

type IndexVariant = 'humi' | 'wami';

const config: Record<
  IndexVariant,
  { icon: LucideIcon; href: string; productKey: 'humi' | 'wami'; indexKey: 'humi' | 'wami' }
> = {
  humi: { icon: BarChart3, href: '/humi', productKey: 'humi', indexKey: 'humi' },
  wami: { icon: Wallet, href: '/wami', productKey: 'wami', indexKey: 'wami' },
};

const COMPACT_ROW_COUNT = 3;
const COMPACT_STANDOUT_COUNT = 3;

type IndexProductCardProps = {
  variant: IndexVariant;
};

export default function IndexProductCard({ variant }: IndexProductCardProps) {
  const { language } = useLanguage();
  const { icon: Icon, href, productKey, indexKey } = config[variant];
  const product = marketingCopy.products[productKey];
  const index = marketingCopy[indexKey];
  const comparison = variant === 'humi' ? humiCopy.comparison : wamiCopy.comparison;
  const compactRows = comparison.rows.slice(0, COMPACT_ROW_COUNT);
  const compactStandOut = comparison.standOut.slice(0, COMPACT_STANDOUT_COUNT);

  return (
    <GlassCard variant="elevated" className="flex flex-col">
      <Icon className="mb-4 text-gold" size={32} />
      <h3 className="mb-2 text-xl font-semibold text-white">{pick(language, product.name)}</h3>
      <p className="text-sm text-gold">{pick(language, product.subtitle)}</p>
      <p className="mt-1 text-sm text-gold/80">{pick(language, index.subtitle)}</p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400">
        {pick(language, product.description)}
      </p>
      <p className="mt-3 text-sm italic text-zinc-500">{pick(language, index.question)}</p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {index.pillars.map((pillar, i) => (
          <div
            key={i}
            className="rounded-xl border border-gold/15 bg-black/30 px-3 py-2.5 text-center"
          >
            <p className="text-xs font-semibold leading-snug text-white sm:text-sm">
              {pick(language, pillar)}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">25 pts</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-zinc-800/80 pt-6">
        <h4 className="mb-3 text-sm font-semibold text-gold">{pick(language, comparison.title)}</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="pb-2 pr-3 font-medium">{pick(language, comparison.tableHeaders.index)}</th>
                <th className="pb-2 font-medium">{pick(language, comparison.tableHeaders.advantage)}</th>
              </tr>
            </thead>
            <tbody>
              {compactRows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/60 last:border-0">
                  <td className="py-2 pr-3 align-top font-medium text-zinc-300">
                    {pick(language, row.name)}
                  </td>
                  <td className="py-2 align-top text-zinc-400">{pick(language, row.advantage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-2 mt-4 text-xs font-semibold text-zinc-300">
          {pick(language, comparison.standOutTitle)}
        </p>
        <ul className="space-y-1.5 text-xs text-zinc-400">
          {compactStandOut.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 text-gold">•</span>
              <span>{pick(language, item)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={href}
          className="inline-flex rounded-2xl border border-gold/40 px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
        >
          {pick(language, product.cta)} →
        </Link>
      </div>
    </GlassCard>
  );
}
