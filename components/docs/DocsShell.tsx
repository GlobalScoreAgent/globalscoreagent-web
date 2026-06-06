'use client';

import type { ReactNode } from 'react';
import SectionSurface from '@/components/marketing/shared/SectionSurface';

type DocsShellProps = {
  hero: ReactNode;
  children: ReactNode;
};

export default function DocsShell({ hero, children }: DocsShellProps) {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <SectionSurface id="docs-hero" tone="dark">
        {hero}
      </SectionSurface>
      <SectionSurface id="docs-content" tone="darker">
        {children}
      </SectionSurface>
    </main>
  );
}
