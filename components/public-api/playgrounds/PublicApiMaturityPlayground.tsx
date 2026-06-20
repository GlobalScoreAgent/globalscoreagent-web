'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { publicApiCopy } from '@/content/public-api/copy';
import { pick } from '@/content/marketing/i18n';
import type { PublicApiFetchResult } from '@/lib/public-api/constants';
import { fetchPublicApi } from '@/lib/public-api/fetchPublicApi';
import PublicApiPlaygroundShell, {
  PlaygroundField,
  playgroundInputClass,
  playgroundSelectClass,
} from './PublicApiPlaygroundShell';

export default function PublicApiMaturityPlayground() {
  const { language } = useLanguage();
  const copy = publicApiCopy.playground.maturity;

  const [canonicalSlug, setCanonicalSlug] = useState('base-32333');
  const [lang, setLang] = useState<'eng' | 'esp'>('eng');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicApiFetchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const params = useMemo(() => {
    const next: Record<string, string> = { lang };
    if (canonicalSlug.trim()) next.canonical_slug = canonicalSlug.trim();
    return next;
  }, [canonicalSlug, lang]);

  const requestUrl = useMemo(() => {
    const qs = new URLSearchParams(params);
    return `https://api.globalscoreagent.com/v1/agents/maturity?${qs.toString()}`;
  }, [params]);

  async function handleSubmit() {
    if (!canonicalSlug.trim()) {
      setErrorMessage(pick(language, copy.slugRequired));
      setResult(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchPublicApi('maturity', params);
      setResult(response);
    } catch {
      setResult(null);
      setErrorMessage(pick(language, publicApiCopy.playground.networkError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicApiPlaygroundShell
      title={pick(language, copy.title)}
      requestUrl={requestUrl}
      onSubmit={handleSubmit}
      loading={loading}
      result={result}
      errorMessage={errorMessage}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <PlaygroundField label={pick(language, copy.fields.canonicalSlug)}>
          <input
            type="text"
            value={canonicalSlug}
            onChange={(e) => setCanonicalSlug(e.target.value)}
            placeholder={pick(language, copy.placeholders.canonicalSlug)}
            className={playgroundInputClass}
            required
          />
        </PlaygroundField>
        <PlaygroundField label={pick(language, copy.fields.lang)}>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'eng' | 'esp')}
            className={playgroundSelectClass}
          >
            <option value="eng">{pick(language, copy.langOptions.eng)}</option>
            <option value="esp">{pick(language, copy.langOptions.esp)}</option>
          </select>
        </PlaygroundField>
      </div>
    </PublicApiPlaygroundShell>
  );
}
