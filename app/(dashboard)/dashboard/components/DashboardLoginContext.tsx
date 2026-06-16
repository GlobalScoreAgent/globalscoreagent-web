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
import type { LoginProcessRequest, LoginProcessResult } from '@/lib/gsa/login-process';
import {
  fetchLoginProcessFromApi,
  getValidLoginProcessCache,
} from '@/lib/gsa/login-process-client';

function consumeRegistrationLoginHint(): LoginProcessRequest | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  if (params.get('gsa_login') !== 'registration') return undefined;

  params.delete('gsa_login');
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);

  return { is_registration: true };
}

type DashboardLoginContextValue = {
  profileId: number | null;
  loginLogId: number | null;
  subscription: LoginProcessResult['subscription'] | null;
  loginMessage: { es: string; en: string } | null;
  newUser: boolean;
  isSubscriptionActive: boolean;
  loginReady: boolean;
  loginError: string | null;
  refreshLoginProcess: (options?: { force?: boolean }) => Promise<void>;
};

const DashboardLoginContext = createContext<DashboardLoginContextValue | null>(null);

export function DashboardLoginProvider({ children }: { children: ReactNode }) {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [loginLogId, setLoginLogId] = useState<number | null>(null);
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
    setLoginLogId(result.login_log_id);
    setSubscription(result.subscription);
    setLoginMessage({ es: result.message_es, en: result.message_en });
    setNewUser(result.new_user);
  }, []);

  const refreshLoginProcess = useCallback(
    async (options?: { force?: boolean }) => {
      setLoginError(null);
      const cached = getValidLoginProcessCache();

      if (cached) {
        applyResult(cached);
        if (!options?.force) {
          setLoginReady(true);
          return;
        }
      }

      try {
        const request = options?.force ? undefined : consumeRegistrationLoginHint();
        const result = await fetchLoginProcessFromApi(request);
        applyResult(result);
      } catch (err) {
        if (!cached) {
          setLoginError(err instanceof Error ? err.message : 'login_process_failed');
        }
      } finally {
        setLoginReady(true);
      }
    },
    [applyResult],
  );

  useEffect(() => {
    void refreshLoginProcess();
  }, [refreshLoginProcess]);

  const value = useMemo(
    (): DashboardLoginContextValue => ({
      profileId,
      loginLogId,
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
      loginLogId,
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
