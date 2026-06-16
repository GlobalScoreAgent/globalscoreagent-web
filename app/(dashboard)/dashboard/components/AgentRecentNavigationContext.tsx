'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

const STORAGE_RECENT = 'gsa:agentsRecent';
const STORAGE_FAVORITES = 'gsa:agentFavorites';
const RECENT_LIMIT = 10;

export interface RecentAgentEntry {
  id: string;
  label: string;
}

export interface FavoriteAgentEntry {
  id: string;
  name: string;
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

function parseFavorites(raw: string | null): FavoriteAgentEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (entry): entry is FavoriteAgentEntry =>
          !!entry &&
          typeof entry === 'object' &&
          typeof (entry as FavoriteAgentEntry).id === 'string' &&
          typeof (entry as FavoriteAgentEntry).name === 'string',
      )
      .map((entry) => ({ id: entry.id.trim(), name: entry.name.trim() }))
      .filter((entry) => entry.id.length > 0 && entry.name.length > 0)
      .filter(
        (entry, index, arr) => arr.findIndex((item) => item.id === entry.id) === index,
      );
  } catch {
    return [];
  }
}

type ProfileApiResponse = {
  success: boolean;
  profile?: {
    preferences?: {
      agents?: FavoriteAgentEntry[];
    };
  };
};

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

function persistFavorites(entries: FavoriteAgentEntry[]) {
  favoritesCache = entries;
  try {
    sessionStorage.setItem(STORAGE_FAVORITES, JSON.stringify(entries));
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

function getFavoriteSnapshot(): FavoriteAgentEntry[] {
  return favoritesCache;
}

interface AgentRecentNavigationContextValue {
  recentAgents: RecentAgentEntry[];
  favoriteAgentIds: string[];
  isFavorite: (id: string) => boolean;
  favoriteAgents: RecentAgentEntry[];
  recordAgentVisit: (id: string, label: string) => void;
  closeRecentAgent: (id: string) => void;
  addFavorite: (id: string, label?: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
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
  const favoriteEntries = useSyncExternalStore(subscribe, getFavoriteSnapshot, getFavoriteSnapshot);

  const favoriteAgentIds = useMemo(() => favoriteEntries.map((entry) => entry.id), [favoriteEntries]);
  const favoriteAgents = useMemo(
    () =>
      favoriteEntries.map((entry) => ({
        id: entry.id,
        label: entry.name,
      })),
    [favoriteEntries],
  );

  useEffect(() => {
    let cancelled = false;
    const loadFavoritesFromProfile = async () => {
      try {
        const res = await fetch('/api/dashboard/profile', { credentials: 'include' });
        const data = (await res.json()) as ProfileApiResponse;
        if (!cancelled && res.ok && data.success) {
          const entries = data.profile?.preferences?.agents ?? [];
          persistFavorites(entries);
        }
      } catch {
        // keep session fallback
      }
    };

    void loadFavoritesFromProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPreferencesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ agents?: FavoriteAgentEntry[] }>;
      if (!Array.isArray(customEvent.detail?.agents)) return;
      persistFavorites(
        customEvent.detail.agents.filter(
          (entry): entry is FavoriteAgentEntry =>
            !!entry &&
            typeof entry === 'object' &&
            typeof (entry as FavoriteAgentEntry).id === 'string' &&
            typeof (entry as FavoriteAgentEntry).name === 'string',
        ),
      );
    };

    window.addEventListener('gsa:preferences-updated', onPreferencesUpdated as EventListener);
    return () => {
      window.removeEventListener(
        'gsa:preferences-updated',
        onPreferencesUpdated as EventListener,
      );
    };
  }, []);

  const syncFavoritesToProfile = useCallback(async (entries: FavoriteAgentEntry[]) => {
    await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferences: {
          agents: entries,
        },
      }),
    });
  }, []);

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

  const addFavorite = useCallback(async (id: string, label?: string) => {
    const displayName = label?.trim() || id;
    const next = [
      ...favoritesCache.filter((entry) => entry.id !== id),
      { id, name: displayName },
    ];
    persistFavorites(next);
    await syncFavoritesToProfile(next);
  }, [syncFavoritesToProfile]);

  const removeFavorite = useCallback(async (id: string) => {
    const next = favoritesCache.filter((entry) => entry.id !== id);
    persistFavorites(next);
    await syncFavoritesToProfile(next);
  }, [syncFavoritesToProfile]);

  const isFavorite = useCallback(
    (id: string) => favoriteEntries.some((entry) => entry.id === id),
    [favoriteEntries],
  );

  const value = useMemo<AgentRecentNavigationContextValue>(
    () => ({
      recentAgents,
      favoriteAgentIds,
      favoriteAgents,
      isFavorite,
      recordAgentVisit,
      closeRecentAgent,
      addFavorite,
      removeFavorite,
    }),
    [
      recentAgents,
      favoriteAgentIds,
      favoriteAgents,
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
