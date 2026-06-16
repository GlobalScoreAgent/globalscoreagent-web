'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { AgentTransactionalWalletCarousel } from '@/components/dashboard/AgentTransactionalWalletCarousel';
import type { TransactionalWalletRow } from '@/lib/agentTransactionalWallets';
import { dashboardFormHeadingClass } from '@/app/(dashboard)/dashboard/components/dashboard-ui';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  rows: TransactionalWalletRow[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  isDark: boolean;
  lang: 'es' | 'en';
  t: Translations;
  onCopy: (text: string) => void;
};

export function AgentWamiWalletAnalysisCard({
  title,
  rows,
  selectedIndex,
  onIndexChange,
  isDark,
  lang,
  t,
  onCopy,
}: Props) {
  return (
    <>
      <h2 className={cn('mb-4 text-xl font-semibold', dashboardFormHeadingClass(isDark))}>
        {title}
      </h2>
      <AgentTransactionalWalletCarousel
        rows={rows}
        isDark={isDark}
        lang={lang}
        t={t}
        onCopy={onCopy}
        hideSectionTitle
        badgeMode="maturity"
        controlledIndex={selectedIndex}
        onIndexChange={onIndexChange}
        className="mb-0"
      />
    </>
  );
}
