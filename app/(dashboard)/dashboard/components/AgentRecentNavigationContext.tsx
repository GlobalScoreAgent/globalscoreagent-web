'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';

const STORAGE_RECENT = 'gsa:agentsRecent';
const STORAGE_FAVORITES = 'gsa:agentFavorites';
const RECENT_LIMIT = 10;

export interface RecentAgentEntry {
  id: string;
  label: string;
}

function parseRecent(raw: string | null): RecentAgentEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (row): row is RecentAgentEntry =>
          row != null &&
          typeof row === 'object' &&
          typeof (row as RecentAgentEntry).id === 'string' &&
          typeof (row as RecentAgentEntry).label === 'string'
      )
      .slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}

function parseFavorites(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return new Set();
    return new Set(data.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

let recentCache = parseRecent(
  typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_RECENT) : null
);
let favoritesCache = parseFavorites(
  typeof window !== 'undefined' ? sessionStorage.getItem(STORAGE_FAVORITES) : null
);
let listeners: Array<() => void> = [];

function persistRecent(entries: RecentAgentEntry[]) {
  recentCache = entries.slice(0, RECENT_LIMIT);
  try {
    sessionStorage.setItem(STORAGE_RECENT, JSON.stringify(recentCache));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l());
}

function persistFavorites(ids: Set<string>) {
  favoritesCache = ids;
  try {
    sessionStorage.setItem(STORAGE_FAVORITES, JSON.stringify([...ids]));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getRecentSnapshot(): RecentAgentEntry[] {
  return recentCache;
}

function getFavoriteSnapshot(): Set<string> {
  return favoritesCache;
}

interface AgentRecentNavigationContextValue {
  recentAgents: RecentAgentEntry[];
  favoriteAgentIds: string[];
  isFavorite: (id: string) => boolean;
  recordAgentVisit: (id: string, label: string) => void;
  closeRecentAgent: (id: string) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
}

const AgentRecentNavigationContext = createContext<AgentRecentNavigationContextValue | null>(
  null
);

export function RecentAgentsProvider({ children }: { children: React.ReactNode }) {
  const recentAgents = useSyncExternalStore(
    subscribe,
    getRecentSnapshot,
    getRecentSnapshot
  );
  const favoriteSet = useSyncExternalStore(subscribe, getFavoriteSnapshot, getFavoriteSnapshot);

  const favoriteAgentIds = useMemo(() => [...favoriteSet], [favoriteSet]);

  const recordAgentVisit = useCallback((id: string, label: string) => {
    const trimmedLabel = label.trim() || id;
    const next = [
      { id, label: trimmedLabel },
      ...recentCache.filter((a) => a.id !== id),
    ].slice(0, RECENT_LIMIT);
    persistRecent(next);
  }, []);

  const closeRecentAgent = useCallback((id: string) => {
    persistRecent(recentCache.filter((a) => a.id !== id));
  }, []);

  const addFavorite = useCallback((id: string) => {
    const next = new Set(favoritesCache);
    next.add(id);
    persistFavorites(next);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const next = new Set(favoritesCache);
    next.delete(id);
    persistFavorites(next);
  }, []);

  const isFavorite = useCallback((id: string) => favoriteSet.has(id), [favoriteSet]);

  const value = useMemo<AgentRecentNavigationContextValue>(
    () => ({
      recentAgents,
      favoriteAgentIds,
      isFavorite,
      recordAgentVisit,
      closeRecentAgent,
      addFavorite,
      removeFavorite,
    }),
    [
      recentAgents,
      favoriteAgentIds,
      isFavorite,
      recordAgentVisit,
      closeRecentAgent,
      addFavorite,
      removeFavorite,
    ]
  );

  return (
    <AgentRecentNavigationContext.Provider value={value}>{children}</AgentRecentNavigationContext.Provider>
  );
}

export function useAgentRecentNavigation() {
  const ctx = useContext(AgentRecentNavigationContext);
  if (!ctx) {
    throw new Error('useAgentRecentNavigation must be used within RecentAgentsProvider');
  }
  return ctx;
}
