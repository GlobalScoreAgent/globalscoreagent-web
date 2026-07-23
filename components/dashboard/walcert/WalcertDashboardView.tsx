'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { DashboardSubscriptionGate } from '@/components/dashboard/DashboardSubscriptionGate';
import { walcertDashboardCopy } from '@/content/dashboard/walcert-examples';
import { WALCERT_LIVE_URL } from '@/content/walcert/copy';
import { pick } from '@/content/marketing/i18n';
import WalcertLivePreviewPanel from '@/components/dashboard/walcert/WalcertLivePreviewPanel';
import WalcertVerifyPanel from '@/components/dashboard/walcert/WalcertVerifyPanel';
import WalcertExamplesPanel from '@/components/dashboard/walcert/WalcertExamplesPanel';

export default function WalcertDashboardView() {
  const { lang, theme } = useLanguage();
  const isDark = theme === 'dark';
  const copy = walcertDashboardCopy;

  return (
    <DashboardSubscriptionGate>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-6">
        <header>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
            {pick(lang, copy.agentId)}
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-3xl">
            {pick(lang, copy.title)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400 md:text-base">
            {pick(lang, copy.subtitle)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={WALCERT_LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              {pick(lang, copy.agentCardLink)} →
            </a>
            <Link
              href="/walcert/developers"
              className="inline-flex text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              {pick(lang, copy.developersLink)} →
            </Link>
          </div>
        </header>

        <WalcertLivePreviewPanel lang={lang} isDark={isDark} />
        <WalcertVerifyPanel lang={lang} isDark={isDark} />
        <WalcertExamplesPanel lang={lang} isDark={isDark} />
      </div>
    </DashboardSubscriptionGate>
  );
}
