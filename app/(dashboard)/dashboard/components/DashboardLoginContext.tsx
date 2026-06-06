'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LoginProcessResult } from '@/lib/gsa/login-process';
import {
  loadLoginProcess,
  persistLoginProcess,
} from '@/lib/gsa/login-process-storage';

type DashboardLoginContextValue = {
  profileId: number | null;
  subscription: LoginProcessResult['subscription'] | null;
  loginMessage: { es: string; en: string } | null;
  newUser: boolean;
  isSubscriptionActive: boolean;
  loginReady: boolean;
  loginError: string | null;
  refreshLoginProcess: () => Promise<void>;
};

const DashboardLoginContext = createContext<DashboardLoginContextValue | null>(null);

async function fetchLoginProcess(
  body?: Record<string, unknown>,
): Promise<LoginProcessResult> {
  const res = await fetch('/api/auth/login-process', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

  const data = await res.json();

  if (!res.ok || !data?.success) {
    throw new Error(
      typeof data?.error === 'string' ? data.error : 'login_process_failed',
    );
  }

  const result: LoginProcessResult = {
    profile_id: data.profile_id,
    subscription: data.subscription,
    new_user: data.new_user === true,
    message_es: data.message_es ?? '',
    message_en: data.message_en ?? '',
  };

  persistLoginProcess(result);
  return result;
}

export function DashboardLoginProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<
    LoginProcessResult['subscription'] | null
  >(null);
  const [loginMessage, setLoginMessage] = useState<{ es: string; en: string } | null>(
    null,
  );
  const [newUser, setNewUser] = useState(false);
  const [loginReady, setLoginReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const applyResult = useCallback((result: LoginProcessResult) => {
    setProfileId(result.profile_id);
    setSubscription(result.subscription);
    setLoginMessage({ es: result.message_es, en: result.message_en });
    setNewUser(result.new_user);
  }, []);

  const refreshLoginProcess = useCallback(async () => {
    setLoginError(null);
    const cached = loadLoginProcess();
    if (cached) {
      applyResult(cached);
    }

    try {
      const result = await fetchLoginProcess();
      applyResult(result);
    } catch (err) {
      if (!cached) {
        setLoginError(err instanceof Error ? err.message : 'login_process_failed');
      }
    } finally {
      setLoginReady(true);
    }
  }, [applyResult]);

  useEffect(() => {
    void refreshLoginProcess();
  }, [refreshLoginProcess]);

  const value = useMemo(
    (): DashboardLoginContextValue => ({
      profileId,
      subscription,
      loginMessage,
      newUser,
      isSubscriptionActive: subscription === 'Active',
      loginReady,
      loginError,
      refreshLoginProcess,
    }),
    [
      profileId,
      subscription,
      loginMessage,
      newUser,
      loginReady,
      loginError,
      refreshLoginProcess,
    ],
  );

  return (
    <DashboardLoginContext.Provider value={value}>{children}</DashboardLoginContext.Provider>
  );
}

export function useDashboardLogin() {
  const ctx = useContext(DashboardLoginContext);
  if (!ctx) {
    throw new Error('useDashboardLogin must be used within DashboardLoginProvider');
  }
  return ctx;
}
