'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import { legalCopy, type LegalDocument } from '@/content/legal/copy';
import { pick } from '@/content/marketing/i18n';

function LegalDocumentSection({ doc }: { doc: LegalDocument }) {
  const { language } = useLanguage();

  return (
    <section>
      <h2 className="mb-6 border-b border-gold/30 pb-4 text-3xl font-semibold">
        {pick(language, doc.title)}
      </h2>
      <p className="mb-8 text-sm text-zinc-500">{pick(language, doc.updated)}</p>
      <div className="prose prose-invert max-w-none leading-relaxed text-zinc-300">
        {doc.sections.map((section, i) => (
          <div key={i}>
            <h3 className="mb-4 mt-8 text-xl font-medium">{pick(language, section.heading)}</h3>
            <p>{pick(language, section.body)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LegalPageClient() {
  return (
    <div className="min-h-screen bg-zinc-950 py-12 text-white">
      <div className="mx-auto max-w-4xl px-6 py-0">
        <div className="space-y-20">
          <LegalDocumentSection doc={legalCopy.terms} />
          <LegalDocumentSection doc={legalCopy.privacy} />
          <LegalDocumentSection doc={legalCopy.refunds} />
        </div>
      </div>
    </div>
  );
}
