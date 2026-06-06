'use client';

import { useLanguage } from '../components/LanguageContext';

export default function DashboardApiPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {t.apiPageTitle}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.comingSoon}</p>
    </div>
  );
}
