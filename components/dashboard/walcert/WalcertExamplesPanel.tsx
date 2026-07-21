'use client';

import { useState } from 'react';
import {
  WALCERT_CERT_TYPES,
  type WalcertCertType,
  walcertDashboardCopy,
  walcertExampleReports,
} from '@/content/dashboard/walcert-examples';
import { pick } from '@/content/marketing/i18n';
import { cn } from '@/lib/utils';
import { dashboardSectionClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import WalcertCertificateCard from './WalcertCertificateCard';

type Props = {
  lang: 'es' | 'en';
  isDark: boolean;
};

export default function WalcertExamplesPanel({ lang, isDark }: Props) {
  const copy = walcertDashboardCopy;
  const [active, setActive] = useState<WalcertCertType>('origins');
  const report = walcertExampleReports.find((r) => r.type === active) ?? walcertExampleReports[0];

  return (
    <section className={dashboardSectionClass}>
      <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
        {pick(lang, copy.examplesTitle)}
      </h2>
      <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
        {pick(lang, copy.examplesIntro)}
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {WALCERT_CERT_TYPES.map((t) => {
          const selected = t === active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={cn(
                'rounded-xl border px-3 py-1.5 text-sm font-medium transition',
                selected
                  ? isDark
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : isDark
                    ? 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                    : 'border-zinc-300 text-zinc-600 hover:border-zinc-400',
              )}
            >
              {pick(lang, copy.typeNames[t])}
            </button>
          );
        })}
      </div>

      <WalcertCertificateCard
        lang={lang}
        isDark={isDark}
        badge="example"
        type={report.type}
        grade={report.grade}
        gradeLabel={report.grade_label}
        summary={report.summary}
        strengths={report.strengths}
        concerns={report.concerns}
        highlights={report.highlights}
      />
    </section>
  );
}
