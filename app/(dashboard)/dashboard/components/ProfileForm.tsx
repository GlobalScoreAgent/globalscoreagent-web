'use client';

import { useEffect, useMemo, useState } from 'react';
import { markDashboardPreferencesHydrated } from '@/lib/gsa/dashboard-preferences-hydration';
import { useLanguage } from './LanguageContext';
import DashboardFormSection from './DashboardFormSection';
import {
  dashboardFormBodyClass,
  dashboardFormHeadingClass,
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
  preferences: Preferences;
};

type ProfileApiResponse = {
  success: boolean;
  oauth_locked?: boolean;
  profile?: ProfilePayload;
  error?: string;
};

export default function ProfileForm() {
  const { lang, theme, applyPersistedPreferences } = useLanguage();
  const isDark = theme === 'dark';
  const inputClass = dashboardFormInputClass(isDark);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [oauthLocked, setOauthLocked] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'es',
    theme: 'dark',
    agents: [],
  });

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
            oauthLock:
              'Cuenta OAuth (Google/GitHub): el nombre y avatar se gestionan desde el proveedor.',
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
            oauthLock:
              'OAuth account (Google/GitHub): name and avatar are managed by your provider.',
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

  const removeFavorite = (id: string) => {
    setPreferences((prev) => ({
      ...prev,
      agents: prev.agents.filter((item) => item.id !== id),
    }));
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
      <h1 className={`text-2xl font-semibold ${dashboardFormHeadingClass(isDark)}`}>
        {texts.title}
      </h1>

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
