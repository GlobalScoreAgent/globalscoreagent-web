'use client';

import { Copy } from 'lucide-react';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { OwnerWalletChainActivityCarousel } from '@/components/dashboard/OwnerWalletChainActivityCarousel';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import type { OwnerWalletDetailRow } from '@/lib/agentOwnerWalletDetails';

type Props = {
  isDark: boolean;
  t: Translations;
  governanceType: string | null;
  ownerWallet: string | null;
  ownerSinceAt: string | null;
  activityRows: OwnerWalletDetailRow[];
  activityResetKey?: string;
  formatDate: (iso: string) => string;
  onCopy: (text: string) => void;
  mutedClassName: string;
};

export function AgentDetailOwnerCard({
  isDark,
  t,
  governanceType,
  ownerWallet,
  ownerSinceAt,
  activityRows,
  activityResetKey,
  formatDate,
  onCopy,
  mutedClassName,
}: Props) {
  const hasGovernance = Boolean(governanceType?.trim());

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="onchain"
      accentHex="#38bdf8"
      className="w-full"
      contentClassName="relative overflow-hidden p-5 sm:p-8"
    >
      {hasGovernance ? (
        <div className="mb-4 sm:absolute sm:right-6 sm:top-6 sm:z-10 sm:mb-0 sm:max-w-[62%] sm:text-right">
          <span
            className={`inline-block max-w-full rounded-full border px-3 py-1 text-left text-xs font-medium leading-snug ${
              isDark
                ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                : 'border-violet-300 bg-violet-50 text-violet-900'
            }`}
            title={`${t.governanceTypeLabel} ${governanceType}`}
          >
            <span className="opacity-90">{t.governanceTypeLabel}</span>{' '}
            <span className="break-words font-semibold">{governanceType}</span>
          </span>
        </div>
      ) : null}
      <h2 className={`mb-6 text-xl font-semibold sm:text-2xl ${hasGovernance ? 'sm:pr-44' : ''}`}>
        {t.agentDetailOwnerCardTitle}
      </h2>

      <div className="space-y-6">
        <div>
          <div className={`text-sm ${mutedClassName}`}>{t.agentDetailOwnerWallet}</div>
          <div className="mt-1 flex items-center gap-2 break-all font-mono text-sm">
            {ownerWallet ?? t.notAvailable}
            {ownerWallet ? (
              <button
                type="button"
                onClick={() => onCopy(ownerWallet)}
                className={`shrink-0 ${isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <Copy size={16} />
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <div className={`text-sm ${mutedClassName}`}>{t.agentDetailOwnerSince}</div>
          <div className="mt-1">
            {ownerSinceAt ? formatDate(ownerSinceAt) : t.notAvailable}
          </div>
        </div>

        <div className={`border-t pt-6 ${isDark ? 'border-zinc-700/40' : 'border-zinc-200/80'}`}>
          <OwnerWalletChainActivityCarousel
            rows={activityRows}
            isDark={isDark}
            t={t}
            formatDate={formatDate}
            resetKey={activityResetKey}
          />
        </div>
      </div>
    </AgentDetailCard>
  );
}
