'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { resolveRelativeDocLink } from '@/lib/docs/resolveDocLink';

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function flattenText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(flattenText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    const el = children as { props?: { children?: ReactNode } };
    return flattenText(el.props?.children ?? '');
  }
  return '';
}

const headingSlugCounts = new Map<string, number>();

function nextHeadingId(text: string): string {
  const base = slugifyHeading(text);
  const count = headingSlugCounts.get(base) ?? 0;
  headingSlugCounts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function resolveDocHref(href: string | undefined, docSlug?: string): string | undefined {
  if (!href) return href;
  if (href.startsWith('http') || href.startsWith('#') || href.startsWith('/docs/')) {
    return href;
  }
  const mdMatch = href.match(/^\.\/([a-z0-9-]+)\.md$/i);
  if (mdMatch && docSlug) {
    return resolveRelativeDocLink(docSlug, mdMatch[1]);
  }
  if (mdMatch) {
    return `/docs/dashboard/${mdMatch[1]}`;
  }
  return href;
}

type DocsMarkdownProps = {
  markdown: string;
  className?: string;
  docSlug?: string;
};

export default function DocsMarkdown({ markdown, className, docSlug }: DocsMarkdownProps) {
  headingSlugCounts.clear();

  return (
    <div
      className={cn(
        'docs-markdown prose prose-invert prose-zinc max-w-none',
        'prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:text-white',
        'prose-h1:hidden',
        'prose-p:text-zinc-300 prose-p:leading-relaxed',
        'prose-a:text-gold prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-white',
        'prose-li:text-zinc-300',
        'prose-hr:border-zinc-800',
        'prose-blockquote:border-gold/40 prose-blockquote:text-zinc-400',
        'prose-code:rounded prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-amber-200',
        'prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800',
        'prose-table:border-collapse prose-th:border prose-th:border-zinc-700 prose-th:bg-zinc-900/80 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-zinc-200',
        'prose-td:border prose-td:border-zinc-800 prose-td:px-3 prose-td:py-2 prose-td:text-zinc-300',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h2: ({ children }) => {
          const text = flattenText(children);
          const id = nextHeadingId(text);
          return (
            <h2 id={id} className="mb-4 mt-10 text-2xl">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => {
          const text = flattenText(children);
          const id = nextHeadingId(text);
          return (
            <h3 id={id} className="mb-3 mt-8 text-xl">
              {children}
            </h3>
          );
        },
        a: ({ href, children }) => {
          const resolvedHref = resolveDocHref(href, docSlug);
          return (
            <a
              href={resolvedHref}
              target={resolvedHref?.startsWith('http') ? '_blank' : undefined}
              rel={resolvedHref?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          );
        },
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src ?? ''}
            alt={alt ?? ''}
            loading="lazy"
            className="my-6 w-full rounded-lg border border-zinc-800"
          />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
    </div>
  );
}
