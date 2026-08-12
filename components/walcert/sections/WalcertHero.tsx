'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertCopy } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';

export default function WalcertHero() {
  const { language } = useLanguage();
  const { hero } = walcertCopy;
  const dashboardHref = buildAuthLoginUrl('/dashboard/walcert');

  return (
    <section
      id="walcert-hero"
      className="relative scroll-mt-16 overflow-hidden border-b border-zinc-800/80 bg-zinc-950"
    >
      <div className="mx-auto grid min-h-[70vh] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="relative z-10 flex flex-col justify-center lg:pr-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gold sm:text-sm">
            {pick(language, hero.badge)}
          </p>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            {pick(language, hero.title)}
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg md:text-xl">
            {pick(language, hero.subtitle)}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <Link
              href={dashboardHref}
              className="inline-flex rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-3 text-sm font-semibold text-black transition-all hover:from-amber-300 hover:to-yellow-300"
            >
              {pick(language, hero.openAgent)} →
            </Link>
            <Link
              href="/walcert/developers"
              className="inline-flex text-sm font-medium text-gold transition-colors hover:text-amber-300"
            >
              {pick(language, hero.forDevelopers)} →
            </Link>
            <Link
              href="/"
              className="inline-flex text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              ← {pick(language, hero.backToPortal)}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-md items-center justify-center lg:mx-0 lg:max-w-none lg:justify-end">
          <div className="relative aspect-square w-full max-w-md overflow-hidden lg:max-w-lg">
            <Image
              src="/walcert_header.jpg"
              alt={pick(language, hero.title)}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
