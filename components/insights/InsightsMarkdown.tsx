'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Element } from 'hast';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { buildHeadingIdsByLine } from '@/lib/docs/extractHeadings';
import { insightsHref } from '@/lib/insights/site';

function resolveInsightsHref(
  href: string | undefined,
  onInsightsHost: boolean,
): string | undefined {
  if (!href) return href;
  if (href.startsWith('http') || href.startsWith('#') || href.startsWith('/insights/')) {
    return href;
  }
  const mdMatch = href.match(/^\.\/([a-z0-9-]+)\.md$/i);
  if (mdMatch) {
    return insightsHref(mdMatch[1], onInsightsHost);
  }
  return href;
}

function headingIdFromNode(
  node: Element | undefined,
  idsByLine: Map<number, string>,
): string | undefined {
  const line = node?.position?.start.line;
  if (!line) return undefined;
  return idsByLine.get(line);
}

type InsightsMarkdownProps = {
  markdown: string;
  className?: string;
  onInsightsHost: boolean;
};

export default function InsightsMarkdown({
  markdown,
  className,
  onInsightsHost,
}: InsightsMarkdownProps) {
  const idsByLine = useMemo(() => buildHeadingIdsByLine(markdown), [markdown]);

  return (
    <div
      className={cn(
        'insights-markdown prose prose-lg prose-invert prose-zinc max-w-none',
        'prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-zinc-100',
        'prose-h1:hidden',
        'prose-p:text-zinc-300 prose-p:leading-8',
        'prose-a:text-amber-200/90 prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-zinc-100',
        'prose-li:text-zinc-300 prose-li:leading-8',
        'prose-hr:border-zinc-800',
        'prose-blockquote:border-amber-200/30 prose-blockquote:bg-zinc-800/40 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-zinc-400',
        'prose-code:rounded prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-amber-100',
        'prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-900',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ node, children }) => {
            const id = headingIdFromNode(node, idsByLine);
            return (
              <h2
                id={id}
                className="mb-4 mt-12 scroll-mt-28 border-l-2 border-amber-200/30 pl-4 text-xl"
              >
                {children}
              </h2>
            );
          },
          h3: ({ node, children }) => {
            const id = headingIdFromNode(node, idsByLine);
            return (
              <h3 id={id} className="mb-3 mt-8 scroll-mt-28 text-lg">
                {children}
              </h3>
            );
          },
          a: ({ href, children }) => {
            const resolvedHref = resolveInsightsHref(href, onInsightsHost);
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
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
