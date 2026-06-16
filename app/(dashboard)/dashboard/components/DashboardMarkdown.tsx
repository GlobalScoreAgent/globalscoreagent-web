'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type DashboardMarkdownProps = {
  markdown: string;
  isDark: boolean;
  className?: string;
};

export default function DashboardMarkdown({ markdown, isDark, className }: DashboardMarkdownProps) {
  return (
    <div
      className={cn(
        'dashboard-markdown prose max-w-none text-sm leading-relaxed md:text-base',
        isDark
          ? 'prose-invert prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-100'
          : 'prose-zinc prose-p:text-zinc-700 prose-li:text-zinc-700 prose-strong:text-zinc-900',
        'prose-p:my-2 prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0.5',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
