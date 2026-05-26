'use client';

import Image from 'next/image';
import { Copy } from 'lucide-react';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';

type Props = {
  isDark: boolean;
  t: Translations;
  chainLogoSrc: string | null;
  chainLogoFailed: boolean;
  onChainLogoError: () => void;
  chainDisplayName: string;
  walletChainRegister: string | null;
  onChainCreatedAt: string | null;
  ownerChanges: unknown;
  formatDate: (iso: string) => string;
  onCopy: (text: string) => void;
  mutedClassName: string;
};

export function AgentDetailOnChainCard({
  isDark,
  t,
  chainLogoSrc,
  chainLogoFailed,
  onChainLogoError,
  chainDisplayName,
  walletChainRegister,
  onChainCreatedAt,
  ownerChanges,
  formatDate,
  onCopy,
  mutedClassName,
}: Props) {
  return (
    <AgentDetailCard
      isDark={isDark}
      variant="onchain"
      className="w-full"
      contentClassName="p-8 pb-10"
    >
      <h2 className="mb-6 text-2xl font-semibold">{t.agentDetailOnChainData}</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {chainLogoSrc && !chainLogoFailed ? (
            <div
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border ${
                isDark ? 'border-zinc-700 bg-black/40' : 'border-zinc-200 bg-white'
              }`}
            >
              <Image
                src={chainLogoSrc}
                alt={chainDisplayName}
                fill
                className="object-contain p-1"
                unoptimized
                onError={onChainLogoError}
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl">
              🔗
            </div>
          )}
          <div>
            <div className={`text-sm ${mutedClassName}`}>{t.agentDetailChainLabel}</div>
            <div className="font-medium">{chainDisplayName || t.notAvailable}</div>
          </div>
        </div>

        <div>
          <div className={`text-sm ${mutedClassName}`}>{t.agentDetailWalletOnChainIdInfo}</div>
          <div className="mt-1 flex items-center gap-2 break-all font-mono text-sm">
            {walletChainRegister ?? t.notAvailable}
            {walletChainRegister ? (
              <button
                type="button"
                onClick={() => onCopy(walletChainRegister)}
                className={`shrink-0 ${isDark ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <Copy size={16} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className={`text-sm ${mutedClassName}`}>{t.agentDetailCreatedAt}</div>
            <div className="mt-1">
              {onChainCreatedAt ? formatDate(onChainCreatedAt) : t.notAvailable}
            </div>
          </div>
          <div>
            <div className={`text-sm ${mutedClassName}`}>{t.agentDetailOwnerChanges}</div>
            <div className="mt-1 font-medium">
              {ownerChanges !== undefined && ownerChanges !== null
                ? String(ownerChanges)
                : t.notAvailable}
            </div>
          </div>
        </div>
      </div>
    </AgentDetailCard>
  );
}
