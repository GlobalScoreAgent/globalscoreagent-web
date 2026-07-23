'use client';

import { FormEvent, useState } from 'react';
import { Check, ExternalLink, X } from 'lucide-react';
import { handleDashboardUnauthorized } from '@/lib/auth/handle-dashboard-unauthorized';
import {
  isWalcertTxHash,
  isWalcertVerifyResult,
  type WalcertVerifyResult,
  walcertVerifyCopy,
} from '@/content/dashboard/walcert-verify';
import { pick } from '@/content/marketing/i18n';
import {
  dashboardFormInputClass,
  dashboardFormLabelClass,
  dashboardSectionClass,
} from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  lang: 'es' | 'en';
  isDark: boolean;
};

type CheckState = 'pass' | 'fail' | 'unknown';

function CheckRow({
  label,
  state,
  passLabel,
  failLabel,
  unknownLabel,
  isDark,
}: {
  label: string;
  state: CheckState;
  passLabel: string;
  failLabel: string;
  unknownLabel: string;
  isDark: boolean;
}) {
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const statusLabel =
    state === 'pass' ? passLabel : state === 'fail' ? failLabel : unknownLabel;

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm',
        isDark ? 'border-zinc-700/60 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-50',
      )}
    >
      <span className={cn('font-medium', isDark ? 'text-zinc-200' : 'text-zinc-800')}>
        {label}
      </span>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
          state === 'pass' && 'text-emerald-500',
          state === 'fail' && 'text-rose-400',
          state === 'unknown' && muted,
        )}
      >
        {state === 'pass' ? (
          <Check className="h-3.5 w-3.5" aria-hidden />
        ) : state === 'fail' ? (
          <X className="h-3.5 w-3.5" aria-hidden />
        ) : null}
        {statusLabel}
      </span>
    </li>
  );
}

function deriveChecks(result: WalcertVerifyResult): {
  registry: CheckState;
  signature: CheckState;
  onchain: CheckState;
} {
  const reason = result.reason ?? '';
  const hasCert = Boolean(result.certificate);

  let registry: CheckState = 'unknown';
  if (reason === 'not_found') registry = 'fail';
  else if (hasCert) registry = 'pass';
  else if (result.valid === false && !hasCert) registry = 'fail';

  let signature: CheckState = 'unknown';
  if (result.signature && typeof result.signature.valid === 'boolean') {
    signature = result.signature.valid ? 'pass' : 'fail';
  }

  let onchain: CheckState = 'unknown';
  if (result.onchain && typeof result.onchain.valid === 'boolean') {
    onchain = result.onchain.valid ? 'pass' : 'fail';
  } else if (
    reason === 'onchain_mismatch' ||
    reason === 'onchain_failed'
  ) {
    onchain = 'fail';
  }

  return { registry, signature, onchain };
}

export default function WalcertVerifyPanel({ lang, isDark }: Props) {
  const copy = walcertVerifyCopy;
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WalcertVerifyResult | null>(null);

  const inputClass = dashboardFormInputClass(isDark);
  const labelClass = dashboardFormLabelClass(isDark);

  function mapErrorCode(code: string): string {
    switch (code) {
      case 'invalid_tx_hash':
        return pick(lang, copy.invalidTxHash);
      case 'not_found':
        return pick(lang, copy.errorNotFound);
      case 'onchain_mismatch':
        return pick(lang, copy.errorOnchainMismatch);
      case 'onchain_failed':
        return pick(lang, copy.errorOnchainFailed);
      case 'verification_error':
      case 'timeout':
        return pick(lang, copy.errorVerification);
      default:
        return pick(lang, copy.errorGeneric);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = txHash.trim();
    if (!isWalcertTxHash(trimmed)) {
      setError(pick(lang, copy.invalidTxHash));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/walcert/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_hash: trimmed }),
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
        setError(mapErrorCode(code));
        return;
      }

      if (!isWalcertVerifyResult(data.result)) {
        setError(pick(lang, copy.errorGeneric));
        return;
      }

      setResult(data.result as WalcertVerifyResult);
    } catch {
      setError(pick(lang, copy.errorGeneric));
    } finally {
      setLoading(false);
    }
  }

  const checks = result ? deriveChecks(result) : null;
  const cert = result?.certificate ?? null;
  const celoscan =
    result?.onchain?.celoscan &&
    typeof result.onchain.celoscan === 'string' &&
    result.onchain.celoscan.startsWith('http')
      ? result.onchain.celoscan
      : null;

  return (
    <section className={dashboardSectionClass}>
      <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
        {pick(lang, copy.verifyTitle)}
      </h2>
      <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
        {pick(lang, copy.verifyIntro)}
      </p>

      <form onSubmit={onSubmit} className="mb-6 space-y-4">
        <div>
          <label className={labelClass} htmlFor="walcert-tx-hash">
            {pick(lang, copy.txHashLabel)}
          </label>
          <input
            id="walcert-tx-hash"
            className={`${inputClass} mt-1.5 font-mono`}
            value={txHash}
            onChange={(ev) => setTxHash(ev.target.value)}
            placeholder={pick(lang, copy.txHashPlaceholder)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? pick(lang, copy.verifyLoading)
            : pick(lang, copy.verifySubmit)}
        </button>
      </form>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div
            className={cn(
              'rounded-xl border px-4 py-3 text-sm font-semibold',
              result.valid
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-400',
            )}
          >
            {result.valid
              ? pick(lang, copy.validBanner)
              : pick(lang, copy.invalidBanner)}
          </div>

          {checks ? (
            <ul className="space-y-2">
              <CheckRow
                label={pick(lang, copy.checkRegistry)}
                state={checks.registry}
                passLabel={pick(lang, copy.checkPass)}
                failLabel={pick(lang, copy.checkFail)}
                unknownLabel={pick(lang, copy.checkUnknown)}
                isDark={isDark}
              />
              <CheckRow
                label={pick(lang, copy.checkSignature)}
                state={checks.signature}
                passLabel={pick(lang, copy.checkPass)}
                failLabel={pick(lang, copy.checkFail)}
                unknownLabel={pick(lang, copy.checkUnknown)}
                isDark={isDark}
              />
              <CheckRow
                label={pick(lang, copy.checkOnchain)}
                state={checks.onchain}
                passLabel={pick(lang, copy.checkPass)}
                failLabel={pick(lang, copy.checkFail)}
                unknownLabel={pick(lang, copy.checkUnknown)}
                isDark={isDark}
              />
            </ul>
          ) : null}

          {(cert || result.reason || result.source) && (
            <dl
              className={cn(
                'grid gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-2',
                isDark
                  ? 'border-zinc-700/60 bg-zinc-950/50'
                  : 'border-zinc-200 bg-white',
              )}
            >
              {cert?.type ? (
                <div>
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certType)}
                  </dt>
                  <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
                    {cert.type}
                  </dd>
                </div>
              ) : null}
              {cert?.grade ? (
                <div>
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certGrade)}
                  </dt>
                  <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">
                    {cert.grade}
                  </dd>
                </div>
              ) : null}
              {cert?.wallet ? (
                <div className="sm:col-span-2">
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certWallet)}
                  </dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {cert.wallet}
                  </dd>
                </div>
              ) : null}
              {cert?.analyzed_at ? (
                <div>
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certAnalyzedAt)}
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                    {cert.analyzed_at}
                  </dd>
                </div>
              ) : null}
              {cert?.certificate_id ? (
                <div>
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certId)}
                  </dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {cert.certificate_id}
                  </dd>
                </div>
              ) : null}
              {cert?.data_hash ? (
                <div className="sm:col-span-2">
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certDataHash)}
                  </dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {cert.data_hash}
                  </dd>
                </div>
              ) : null}
              {result.signature?.signer ? (
                <div className="sm:col-span-2">
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.certSigner)}
                  </dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {result.signature.signer}
                  </dd>
                </div>
              ) : null}
              {result.source ? (
                <div>
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.sourceLabel)}
                  </dt>
                  <dd className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                    {result.source}
                  </dd>
                </div>
              ) : null}
              {result.reason && !result.valid ? (
                <div>
                  <dt className={isDark ? 'text-zinc-500' : 'text-zinc-500'}>
                    {pick(lang, copy.reasonLabel)}
                  </dt>
                  <dd className="mt-0.5 font-mono text-xs text-zinc-900 dark:text-zinc-100">
                    {result.reason}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}

          {celoscan ? (
            <a
              href={celoscan}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              {pick(lang, copy.celoscanLink)}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
