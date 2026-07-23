'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertDevBodySection() {
  const { language } = useLanguage();
  const { body } = walcertDevelopersCopy;

  return (
    <SectionSurface id="body" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
          {pick(language, body.title)}
        </h2>
        <p className="mb-6 text-zinc-400">{pick(language, body.intro)}</p>
        <pre className="mb-10 overflow-x-auto rounded-2xl border border-zinc-800 bg-black/50 p-5 font-mono text-sm text-amber-100/90">
          <code>{body.example}</code>
        </pre>
        <p className="mb-6 text-zinc-400">{pick(language, body.verifyIntro)}</p>
        <pre className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/50 p-5 font-mono text-sm text-amber-100/90">
          <code>{body.verifyExample}</code>
        </pre>
      </div>
    </SectionSurface>
  );
}
