'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { docsCopy } from '@/content/docs/copy';
import { getDocManifestEntry } from '@/content/docs/manifest';
import { pick } from '@/content/marketing/i18n';
import type { LoadedDoc } from '@/lib/docs/loadDoc';
import DocsHero from './DocsHero';
import DocsMarkdown from './DocsMarkdown';
import DocsNavAccordion from './DocsNavAccordion';
import DocsShell from './DocsShell';

type DocsArticleClientProps = {
  slug: string;
  docs: { es: LoadedDoc; en: LoadedDoc };
};

export default function DocsArticleClient({ slug, docs }: DocsArticleClientProps) {
  const { language } = useLanguage();
  const entry = getDocManifestEntry(slug);
  const doc = language === 'en' ? docs.en : docs.es;
  const pageTitle = entry ? pick(language, entry.title) : doc.title;

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: doc.title,
      description: entry ? pick(language, entry.description) : doc.title,
      inLanguage: language === 'en' ? 'en-US' : 'es-ES',
      url: `https://globalscoreagent.com/docs/${slug}${language === 'en' ? '?lang=en' : ''}`,
      publisher: {
        '@type': 'Organization',
        name: 'Global Score Agent',
        url: 'https://globalscoreagent.com',
      },
    }),
    [doc.title, entry, language, slug],
  );

  return (
    <DocsShell hero={<DocsHero pageTitle={pageTitle} />}>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <DocsNavAccordion activeSlug={slug} headings={doc.headings} />
        </aside>

        <article className="min-w-0">
          <DocsMarkdown markdown={doc.markdown} docSlug={slug} />
          <footer className="mt-12 border-t border-zinc-800 pt-6">
            <a
              href={doc.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gold transition-colors hover:text-amber-300"
            >
              {pick(language, docsCopy.viewSource)} →
            </a>
          </footer>
        </article>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </DocsShell>
  );
}
