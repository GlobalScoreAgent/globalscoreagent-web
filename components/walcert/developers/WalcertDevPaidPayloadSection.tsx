'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { walcertDevelopersCopy } from '@/content/walcert/developers-copy';
import { pick } from '@/content/marketing/i18n';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

export default function WalcertDevPaidPayloadSection() {
  const { language } = useLanguage();
  const { paidPayload } = walcertDevelopersCopy;

  return (
    <SectionSurface id="paid-payload" tone="dark">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="mb-8 text-2xl font-bold text-white md:text-3xl">
          {pick(language, paidPayload.title)}
        </h2>
        <ul className="space-y-3">
          {paidPayload.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm leading-relaxed text-zinc-300"
            >
              <span className="shrink-0 text-gold">•</span>
              <span>{pick(language, item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionSurface>
  );
}
