'use client';

import { useEffect, useMemo, useState } from 'react';
import { markDashboardPreferencesHydrated } from '@/lib/gsa/dashboard-preferences-hydration';
import { useDashboardLogin } from './DashboardLoginContext';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardFormBodyClass,
  dashboardFormInputClass,
  dashboardFormInsetClass,
  dashboardFormLabelClass,
  dashboardFormMutedClass,
} from './dashboard-ui';

type Preferences = {
  language: 'es' | 'en';
  theme: 'dark' | 'light';
  agents: Array<{ id: string; name: string }>;
};

type ProfilePayload = {
  display_name: string;
  avatar_url: string;
  email_address: string;
  preferences: Preferences;
};

type ProfileApiResponse = {
  success: boolean;
  oauth_locked?: boolean;
  profile?: ProfilePayload;
  error?: string;
};

type RedeemApiResponse = {
  success: boolean;
  error_code?: string;
  message_es?: string;
  message_en?: string;
  error?: string;
};

type RedeemMessageState = {
  kind: 'success' | 'error';
  message_es: string;
  message_en: string;
};

function pickRpcMessage(lang: 'es' | 'en', message_es: string, message_en: string): string {
  const primary = lang === 'es' ? message_es : message_en;
  const fallback = lang === 'es' ? message_en : message_es;
  return (
    primary.trim() ||
    fallback.trim() ||
    (lang === 'es' ? 'Operación completada' : 'Operation completed')
  );
}

export default function ProfileForm() {
  const { lang, theme, applyPersistedPreferences } = useLanguage();
  const { profileId, loginReady, refreshLoginProcess } = useDashboardLogin();
  const isDark = theme === 'dark';
  const inputClass = dashboardFormInputClass(isDark);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [oauthLocked, setOauthLocked] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'en',
    theme: 'dark',
    agents: [],
  });

  const [promoCode, setPromoCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<RedeemMessageState | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/dashboard/profile', { credentials: 'include' });
        const data = (await res.json()) as ProfileApiResponse;
        if (!res.ok || !data.success || !data.profile) {
          throw new Error(data.error ?? 'profile_fetch_failed');
        }

        setOauthLocked(data.oauth_locked === true);
        setDisplayName(data.profile.display_name ?? '');
        setAvatarUrl(data.profile.avatar_url ?? '');
        setEmailAddress(data.profile.email_address ?? '');
        setPreferences({
          ...data.profile.preferences,
          language: lang,
          theme,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'profile_fetch_failed');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once; form prefs mirror session UI
  }, []);

  const texts = useMemo(
    () =>
      lang === 'es'
        ? {
            title: 'Perfil',
            account: 'Cuenta',
            name: 'Nombre visible',
            avatar: 'URL del avatar',
            email: 'Correo de contacto (opcional)',
            oauthLock:
              'Cuenta OAuth (Google/GitHub): el nombre y avatar se gestionan desde el proveedor.',
            redeemCode: 'Redimir Código',
            redeemPlaceholder: 'Introduce tu código',
            redeem: 'Redimir',
            redeeming: 'Redimiendo...',
            redeemNotReady: 'Espera a que la sesión esté lista para redimir un código.',
            redeemNetworkError: 'No se pudo redimir el código. Inténtalo de nuevo.',
            preferences: 'Preferencias',
            language: 'Idioma',
            theme: 'Entorno',
            favorites: 'Agentes favoritos',
            noFavorites: 'No tienes agentes favoritos aún.',
            remove: 'Quitar',
            save: 'Guardar cambios',
            saving: 'Guardando...',
            saved: 'Preferencias guardadas correctamente.',
          }
        : {
            title: 'Profile',
            account: 'Account',
            name: 'Display name',
            avatar: 'Avatar URL',
            email: 'Contact email (optional)',
            oauthLock:
              'OAuth account (Google/GitHub): name and avatar are managed by your provider.',
            redeemCode: 'Redeem Code',
            redeemPlaceholder: 'Enter your code',
            redeem: 'Redeem',
            redeeming: 'Redeeming...',
            redeemNotReady: 'Wait for the session to be ready before redeeming a code.',
            redeemNetworkError: 'Could not redeem the code. Please try again.',
            preferences: 'Preferences',
            language: 'Language',
            theme: 'Theme',
            favorites: 'Favorite agents',
            noFavorites: 'You do not have favorite agents yet.',
            remove: 'Remove',
            save: 'Save changes',
            saving: 'Saving...',
            saved: 'Preferences saved successfully.',
          },
    [lang],
  );

  const redeemMessageText = useMemo(() => {
    if (!redeemMessage) return null;
    return pickRpcMessage(lang, redeemMessage.message_es, redeemMessage.message_en);
  }, [lang, redeemMessage]);

  const removeFavorite = (id: string) => {
    setPreferences((prev) => ({
      ...prev,
      agents: prev.agents.filter((item) => item.id !== id),
    }));
  };

  const onRedeem = async () => {
    setRedeemMessage(null);

    if (!loginReady || profileId == null) {
      setRedeemMessage({
        kind: 'error',
        message_es: 'Espera a que la sesión esté lista para redimir un código.',
        message_en: 'Wait for the session to be ready before redeeming a code.',
      });
      return;
    }

    const trimmedCode = promoCode.trim();
    if (!trimmedCode) return;

    setRedeeming(true);
    try {
      const res = await fetch('/api/dashboard/redeem-promotional-code', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmedCode }),
      });
      const data = (await res.json()) as RedeemApiResponse;

      if (data.message_es != null || data.message_en != null) {
        setRedeemMessage({
          kind: data.success ? 'success' : 'error',
          message_es: data.message_es ?? '',
          message_en: data.message_en ?? '',
        });
      } else {
        setRedeemMessage({
          kind: 'error',
          message_es: texts.redeemNetworkError,
          message_en: 'Could not redeem the code. Please try again.',
        });
        return;
      }

      if (data.success) {
        setPromoCode('');
        await refreshLoginProcess({ force: true });
      }
    } catch {
      setRedeemMessage({
        kind: 'error',
        message_es: texts.redeemNetworkError,
        message_en: 'Could not redeem the code. Please try again.',
      });
    } finally {
      setRedeeming(false);
    }
  };

  const onSave = async () => {
    setSaved(false);
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
          email_address: emailAddress.trim() || null,
          preferences,
        }),
      });
      const data = (await res.json()) as ProfileApiResponse;
      if (!res.ok || !data.success || !data.profile) {
        throw new Error(data.error ?? 'profile_update_failed');
      }

      setPreferences(data.profile.preferences);
      setDisplayName(data.profile.display_name ?? '');
      setAvatarUrl(data.profile.avatar_url ?? '');
      setEmailAddress(data.profile.email_address ?? '');
      applyPersistedPreferences({
        language: data.profile.preferences.language,
        theme: data.profile.preferences.theme,
      });
      markDashboardPreferencesHydrated();
      window.dispatchEvent(
        new CustomEvent('gsa:preferences-updated', {
          detail: { agents: data.profile.preferences.agents },
        }),
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'profile_update_failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>Loading profile...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DashboardFormSection
        isDark={isDark}
        title={texts.account}
        variant="profiles"
        accentHex="#facc15"
      >
        {oauthLocked && (
          <p className="text-xs text-amber-600 dark:text-amber-300">{texts.oauthLock}</p>
        )}
        <div className="space-y-3">
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {texts.name}
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              disabled={oauthLocked}
            />
          </div>
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {texts.avatar}
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className={inputClass}
              disabled={oauthLocked}
            />
          </div>
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {texts.email}
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </DashboardFormSection>

      <DashboardFormSection
        isDark={isDark}
        title={texts.redeemCode}
        variant="profiles"
        accentHex="#22c55e"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={texts.redeemPlaceholder}
              className={`min-w-0 flex-1 ${inputClass}`}
              disabled={redeeming || !loginReady || profileId == null}
            />
            <button
              type="button"
              onClick={() => void onRedeem()}
              disabled={redeeming || !promoCode.trim() || !loginReady || profileId == null}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${
                isDark
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60'
                  : 'bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60'
              }`}
            >
              {redeeming ? texts.redeeming : texts.redeem}
            </button>
          </div>
          {redeemMessageText && redeemMessage && (
            <p
              className={`text-sm ${
                redeemMessage.kind === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-500'
              }`}
            >
              {redeemMessageText}
            </p>
          )}
        </div>
      </DashboardFormSection>

      <DashboardFormSection
        isDark={isDark}
        title={texts.preferences}
        variant="metadata"
        accentHex="#a855f7"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {texts.language}
            </label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  language: e.target.value === 'en' ? 'en' : 'es',
                }))
              }
              className={inputClass}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className={`mb-1 block text-xs ${dashboardFormLabelClass(isDark)}`}>
              {texts.theme}
            </label>
            <select
              value={preferences.theme}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  theme: e.target.value === 'light' ? 'light' : 'dark',
                }))
              }
              className={inputClass}
            >
              <option value="dark">{lang === 'es' ? 'Oscuro' : 'Dark'}</option>
              <option value="light">{lang === 'es' ? 'Claro' : 'Light'}</option>
            </select>
          </div>
        </div>
      </DashboardFormSection>

      <DashboardFormSection
        isDark={isDark}
        title={texts.favorites}
        variant="profiles"
        accentHex="#facc15"
      >
        {preferences.agents.length === 0 ? (
          <p className={`text-sm ${dashboardFormMutedClass(isDark)}`}>{texts.noFavorites}</p>
        ) : (
          <div className="space-y-2">
            {preferences.agents.map((agent) => (
              <div
                key={agent.id}
                className={`flex items-center justify-between px-3 py-2 ${dashboardFormInsetClass(isDark)}`}
              >
                <div className="min-w-0">
                  <p className={`truncate text-sm ${dashboardFormBodyClass(isDark)}`}>
                    {agent.name}
                  </p>
                  <p className={`truncate text-xs ${dashboardFormMutedClass(isDark)}`}>
                    {agent.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFavorite(agent.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  {texts.remove}
                </button>
              </div>
            ))}
          </div>
        )}
      </DashboardFormSection>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400">{texts.saved}</p>}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={`rounded-xl px-4 py-2 text-sm font-medium ${
          isDark
            ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-60'
            : 'bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60'
        }`}
      >
        {saving ? texts.saving : texts.save}
      </button>
    </div>
  );
}
