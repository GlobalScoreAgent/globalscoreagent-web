// app/(dashboard)/dashboard/components/DashboardTitleOverrideContext.tsx
'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type DashboardTitleOverrideContextValue = {
  titleOverride: string | null;
  setTitleOverride: (v: string | null) => void;
};

const DashboardTitleOverrideContext = createContext<
  DashboardTitleOverrideContextValue | null
>(null);

export function DashboardTitleOverrideProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [titleOverride, setTitleOverrideState] = useState<string | null>(null);

  const setTitleOverride = useCallback((v: string | null) => {
    setTitleOverrideState(v);
  }, []);

  const value = useMemo<DashboardTitleOverrideContextValue>(
    () => ({
      titleOverride,
      setTitleOverride,
    }),
    [titleOverride, setTitleOverride],
  );

  return (
    <DashboardTitleOverrideContext.Provider value={value}>
      {children}
    </DashboardTitleOverrideContext.Provider>
  );
}

export function useDashboardTitleOverride() {
  const ctx = useContext(DashboardTitleOverrideContext);
  if (!ctx) {
    throw new Error(
      'useDashboardTitleOverride must be used within DashboardTitleOverrideProvider',
    );
  }
  return ctx;
}

