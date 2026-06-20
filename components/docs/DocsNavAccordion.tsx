'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { docsCopy } from '@/content/docs/copy';
import { docManifest, type DocCategory } from '@/content/docs/manifest';
import { pick } from '@/content/marketing/i18n';
import type { DocHeading } from '@/lib/docs/extractHeadings';
import { cn } from '@/lib/utils';

type DocsNavAccordionProps = {
  activeSlug: string;
  headings: DocHeading[];
};

const categoryOrder: DocCategory[] = [
  'platform',
  'api',
  'dashboard',
  'pricing',
  'humi',
  'wami',
  'agents',
  'wallets',
];

export default function DocsNavAccordion({ activeSlug, headings }: DocsNavAccordionProps) {
  const { language } = useLanguage();
  const langQuery = language === 'en' ? '?lang=en' : '';

  return (
    <nav aria-label={pick(language, docsCopy.navTitle)} className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {pick(language, docsCopy.navTitle)}
        </p>
        <ul className="space-y-5">
          {categoryOrder.map((category) => {
            const items = docManifest
              .filter((entry) => entry.category === category)
              .sort((a, b) => a.order - b.order);
            if (items.length === 0) return null;

            return (
              <li key={category}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gold/80">
                  {pick(language, docsCopy.categories[category])}
                </p>
                <ul className="space-y-1 border-l border-zinc-800 pl-3">
                  {items.map((entry) => {
                    const href = `/docs/${entry.slug}${langQuery}`;
                    const isActive = activeSlug === entry.slug;

                    return (
                      <li key={entry.slug}>
                        <Link
                          href={href}
                          className={cn(
                            'block rounded-lg py-1.5 pl-2 text-sm transition-colors',
                            isActive
                              ? 'border-l-2 border-gold bg-gold/10 font-medium text-gold -ml-px pl-[calc(0.5rem-1px)]'
                              : 'text-zinc-400 hover:text-zinc-200',
                          )}
                        >
                          {pick(language, entry.title)}
                        </Link>

                        {isActive && headings.length > 0 ? (
                          <div className="mb-2 mt-2 border-l border-gold/30 pl-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              {pick(language, docsCopy.tocTitle)}
                            </p>
                            <ul className="space-y-1 text-sm">
                              {headings.map((heading) => (
                                <li key={heading.id}>
                                  <a
                                    href={`#${heading.id}`}
                                    className={cn(
                                      'block py-1 text-zinc-400 transition-colors hover:text-zinc-200',
                                      heading.level === 3 && 'pl-3 text-xs',
                                    )}
                                  >
                                    {heading.text}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
