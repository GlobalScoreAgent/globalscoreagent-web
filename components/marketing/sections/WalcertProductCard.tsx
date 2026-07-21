'use client';

import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';
import GlassCard from '../shared/GlassCard';

export default function WalcertProductCard() {
  const { language } = useLanguage();
  const { card, certificates } = walcertCopy;
  const dashboardHref = buildAuthLoginUrl('/dashboard/walcert');

  return (
    <GlassCard variant="elevated" className="flex flex-col">
      <BadgeCheck className="mb-4 text-gold" size={32} />
      <h3 className="mb-2 text-xl font-semibold text-white">
        {pick(language, card.name)}
      </h3>
      <p className="text-sm text-gold">{pick(language, card.subtitle)}</p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400">
        {pick(language, card.description)}
      </p>
      <p className="mt-3 text-sm italic text-zinc-500">
        {pick(language, card.question)}
      </p>

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {pick(language, card.certLabel)}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {certificates.types.map((cert) => (
            <div
              key={cert.id}
              className="rounded-xl border border-gold/15 bg-black/30 px-3 py-2.5 text-center"
            >
              <p className="text-xs font-semibold leading-snug text-white sm:text-sm">
                {pick(language, cert.title)}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500">A–F</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href={dashboardHref}
          className="inline-flex rounded-2xl border border-gold/40 px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
        >
          {pick(language, card.cta)} →
        </Link>
        <Link
          href="/walcert"
          className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {language === 'es' ? 'Ver página de producto' : 'View product page'}
        </Link>
      </div>
    </GlassCard>
  );
}
