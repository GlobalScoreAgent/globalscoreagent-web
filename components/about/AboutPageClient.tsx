'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { aboutCopy, type AboutRecognitionImage } from '@/content/about/copy';
import { pick } from '@/content/marketing/i18n';
import ContactSocialIcon from '@/components/marketing/shared/ContactSocialIcon';
import GlassCard from '@/components/marketing/shared/GlassCard';
import { buildAuthLoginUrl } from '@/lib/auth/redirect';

const socialChipClass =
  'inline-flex items-center gap-2 rounded-xl border border-gold/15 bg-black/30 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-gold/40 hover:text-gold';

const linkChipClass =
  'inline-flex rounded-2xl border border-gold/40 px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10';

function resolveCtaHref(href: string): string {
  if (href === '/auth/login') {
    return buildAuthLoginUrl('/dashboard');
  }
  return href;
}

export default function AboutPageClient() {
  const { language } = useLanguage();
  const { intro, founder, recognitions, cta } = aboutCopy;
  const [lightboxImage, setLightboxImage] = useState<AboutRecognitionImage | null>(null);

  useEffect(() => {
    if (!lightboxImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxImage]);

  return (
    <div className="min-h-screen bg-zinc-950 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-16 px-6">
        <header>
          <h1 className="border-b border-gold/30 pb-4 text-3xl font-semibold md:text-4xl">
            {pick(language, aboutCopy.pageTitle)}
          </h1>
        </header>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-white">
            {pick(language, intro.title)}
          </h2>
          <div className="space-y-4 leading-relaxed text-zinc-300">
            {intro.paragraphs.map((paragraph, i) => (
              <p key={i}>{pick(language, paragraph)}</p>
            ))}
          </div>
          <p className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-zinc-500">
            {pick(language, intro.productsTitle)}
          </p>
          <ul className="space-y-2 text-zinc-300">
            {intro.products.map((product) => (
              <li key={product.name} className="flex gap-2">
                <span className="font-semibold text-gold">{product.name}</span>
                <span className="text-zinc-500">—</span>
                <span>{pick(language, product.description)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-white">
            {pick(language, founder.title)}
          </h2>
          <GlassCard variant="elevated" className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-xl font-semibold tracking-wide text-gold shadow-[0_0_24px_-8px_rgba(212,175,55,0.35)]"
              aria-hidden
            >
              {founder.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gold/80">
                {pick(language, founder.role)}
              </p>
              <p className="mt-1 text-xl font-semibold text-white">{founder.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {pick(language, founder.bio)}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={founder.profiles.linkedin.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialChipClass}
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>{founder.profiles.linkedin.label}</span>
                </a>
                <a
                  href={founder.profiles.x.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialChipClass}
                >
                  <ContactSocialIcon kind="x" />
                  <span>{founder.profiles.x.label}</span>
                </a>
              </div>
            </div>
          </GlassCard>
        </section>

        <section>
          <h2 className="mb-8 text-2xl font-semibold text-white">
            {pick(language, recognitions.title)}
          </h2>
          <div className="space-y-6">
            {recognitions.items.map((item) => (
              <GlassCard
                key={`${item.year}-${item.images[0]?.src ?? item.title.es}`}
                variant="elevated"
              >
                <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                  {item.images.map((image) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setLightboxImage(image)}
                      className="flex h-28 w-40 cursor-zoom-in items-center justify-center rounded-xl border border-gold/15 bg-black/30 px-3 py-2 transition-colors hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      aria-label={pick(language, image.alt)}
                    >
                      <img
                        src={image.src}
                        alt={pick(language, image.alt)}
                        className="max-h-24 w-auto max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-6 min-w-0 border-t border-zinc-800/80 pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-gold/80">
                    {item.year}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    {pick(language, item.title)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {pick(language, item.detail)}
                  </p>
                  {item.links && item.links.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {item.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkChipClass}
                        >
                          {pick(language, link.label)}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-800 pt-12">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            {pick(language, cta.title)}
          </h2>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {cta.items.map((item, index) => {
              const href = resolveCtaHref(item.href);
              const className =
                index === 0
                  ? 'inline-block rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-3 text-sm font-semibold text-black transition-all hover:from-amber-300 hover:to-yellow-300 active:scale-95'
                  : 'inline-flex rounded-2xl border border-gold/40 px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10';

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {pick(language, item.label)}
                  </a>
                );
              }

              return (
                <Link key={item.href} href={href} className={className}>
                  {pick(language, item.label)}
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {lightboxImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setLightboxImage(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={pick(language, lightboxImage.alt)}
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-gold/20 bg-zinc-950/95 p-4 shadow-[0_0_40px_-12px_rgba(212,175,55,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <p className="text-sm text-zinc-300">{pick(language, lightboxImage.alt)}</p>
              <button
                type="button"
                className="shrink-0 rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/10"
                onClick={() => setLightboxImage(null)}
              >
                {pick(language, aboutCopy.closeModal)}
              </button>
            </div>
            <div className="flex max-h-[75vh] items-center justify-center overflow-auto">
              <img
                src={lightboxImage.src}
                alt={pick(language, lightboxImage.alt)}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
