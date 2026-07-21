'use client';

import { FormEvent, useState } from 'react';
import { handleDashboardUnauthorized } from '@/lib/auth/handle-dashboard-unauthorized';
import {
  WALCERT_PREVIEW_TYPES,
  isWalcertPreviewType,
  type WalcertPreviewResult,
  type WalcertPreviewType,
  walcertDashboardCopy,
} from '@/content/dashboard/walcert-examples';
import { pick } from '@/content/marketing/i18n';
import {
  dashboardFormInputClass,
  dashboardFormLabelClass,
  dashboardSectionClass,
} from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import WalcertCertificateCard from './WalcertCertificateCard';

type Props = {
  lang: 'es' | 'en';
  isDark: boolean;
};

export default function WalcertLivePreviewPanel({ lang, isDark }: Props) {
  const copy = walcertDashboardCopy;
  const [wallet, setWallet] = useState('');
  const [type, setType] = useState<WalcertPreviewType>('origins');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<WalcertPreviewResult | null>(null);

  const inputClass = dashboardFormInputClass(isDark);
  const labelClass = dashboardFormLabelClass(isDark);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPreview(null);

    const trimmed = wallet.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError(pick(lang, copy.invalidWallet));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/walcert/preview', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: trimmed, type }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        await handleDashboardUnauthorized('/dashboard/walcert');
        return;
      }

      if (response.status === 403 && data?.error === 'subscription_inactive') {
        setError(pick(lang, copy.errorGeneric));
        return;
      }

      if (!response.ok || !data?.success) {
        const code = typeof data?.error === 'string' ? data.error : '';
        if (code === 'invalid_wallet') {
          setError(pick(lang, copy.invalidWallet));
        } else if (code === 'preview_not_allowed') {
          setError(pick(lang, copy.errorPreviewNotAllowed));
        } else if (code === 'rate_limited') {
          const retry =
            typeof data?.retry_after === 'number' && data.retry_after > 0
              ? data.retry_after
              : null;
          setError(
            retry != null
              ? pick(lang, copy.errorRateLimitedRetry).replace(
                  '{seconds}',
                  String(retry),
                )
              : pick(lang, copy.errorRateLimited),
          );
        } else if (code === 'provider_quota_exceeded') {
          setError(pick(lang, copy.errorQuota));
        } else if (code === 'certificate_unavailable') {
          setError(pick(lang, copy.errorUnavailable));
        } else {
          setError(pick(lang, copy.errorGeneric));
        }
        return;
      }

      const result = data.preview as WalcertPreviewResult;
      const certType = result.certificate_type ?? type;
      if (!result?.grade || !isWalcertPreviewType(certType)) {
        setError(pick(lang, copy.errorGeneric));
        return;
      }
      setPreview({
        ...result,
        certificate_type: certType,
        preview: true,
      });
    } catch {
      setError(pick(lang, copy.errorGeneric));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={dashboardSectionClass}>
      <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
        {pick(lang, copy.liveTitle)}
      </h2>
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
        {pick(lang, copy.liveIntro)}
      </p>
      <p className="mb-5 text-xs text-zinc-500 dark:text-zinc-500">
        {pick(lang, copy.liveLimitHint)}
      </p>

      <form onSubmit={onSubmit} className="mb-6 space-y-4">
        <div>
          <label className={labelClass} htmlFor="walcert-wallet">
            {pick(lang, copy.walletLabel)}
          </label>
          <input
            id="walcert-wallet"
            className={`${inputClass} mt-1.5 font-mono`}
            value={wallet}
            onChange={(ev) => setWallet(ev.target.value)}
            placeholder={pick(lang, copy.walletPlaceholder)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="walcert-type">
            {pick(lang, copy.typeLabel)}
          </label>
          <select
            id="walcert-type"
            className={`${inputClass} mt-1.5`}
            value={type}
            onChange={(ev) => {
              const v = ev.target.value;
              if (isWalcertPreviewType(v)) setType(v);
            }}
          >
            {WALCERT_PREVIEW_TYPES.map((t) => (
              <option key={t} value={t}>
                {pick(lang, copy.typeNames[t])}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? pick(lang, copy.loading) : pick(lang, copy.submit)}
        </button>
      </form>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {preview ? (
        <WalcertCertificateCard
          lang={lang}
          isDark={isDark}
          badge="live"
          type={preview.certificate_type}
          grade={preview.grade}
          gradeLabel={preview.grade_label}
          wallet={preview.wallet}
          analyzedAt={preview.analyzed_at}
          note={preview.note}
        />
      ) : null}
    </section>
  );
}
