'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

type DashboardMobileNavContextValue = {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

const DashboardMobileNavContext = createContext<DashboardMobileNavContextValue | null>(null);

export function DashboardMobileNavProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileNav();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileNavOpen, closeMobileNav]);

  const value = useMemo(
    () => ({ mobileNavOpen, openMobileNav, closeMobileNav }),
    [mobileNavOpen, openMobileNav, closeMobileNav],
  );

  return (
    <DashboardMobileNavContext.Provider value={value}>{children}</DashboardMobileNavContext.Provider>
  );
}

export function useDashboardMobileNav() {
  const ctx = useContext(DashboardMobileNavContext);
  if (!ctx) {
    throw new Error('useDashboardMobileNav must be used within DashboardMobileNavProvider');
  }
  return ctx;
}
