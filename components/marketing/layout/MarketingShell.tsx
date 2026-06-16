'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import MarketingSidebar from './MarketingSidebar';
import MarketingTopBar from './MarketingTopBar';
import MarketingFooter from '../shared/MarketingFooter';

const OVERLAY_ROUTES = ['/', '/humi', '/wami'] as const;

const HERO_SECTION_ID_BY_ROUTE: Record<(typeof OVERLAY_ROUTES)[number], string> = {
  '/': 'overview',
  '/humi': 'humi-hero',
  '/wami': 'wami-hero',
};

type MarketingShellProps = {
  children: ReactNode;
};

export default function MarketingShell({ children }: MarketingShellProps) {
  const pathname = usePathname();
  const hasOverlayHero = OVERLAY_ROUTES.includes(
    pathname as (typeof OVERLAY_ROUTES)[number]
  );
  const heroSectionId = hasOverlayHero
    ? HERO_SECTION_ID_BY_ROUTE[pathname as (typeof OVERLAY_ROUTES)[number]]
    : undefined;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <MarketingSidebar />
      <div className={`ml-16 flex min-h-screen flex-col md:ml-64 ${hasOverlayHero ? 'relative' : ''}`}>
        <MarketingTopBar overlay={hasOverlayHero} heroSectionId={heroSectionId} />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
