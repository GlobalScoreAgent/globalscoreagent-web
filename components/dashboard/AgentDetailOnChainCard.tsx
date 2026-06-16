'use client';

import Image from 'next/image';
import { Copy } from 'lucide-react';
import { AgentDetailCard } from '@/components/dashboard/AgentDetailCard';
import { AgentDetailIndexScoreCard } from '@/components/dashboard/AgentDetailIndexScoreCard';
import { cn } from '@/lib/utils';
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
  realnessScore: number | null;
  realnessTier: string;
  realnessStatusLabel: string;
  realnessAccentColor: string;
  realnessBadgeHelpText: string;
};

function ChainBlock({
  chainLogoSrc,
  chainLogoFailed,
  onChainLogoError,
  chainDisplayName,
  chainLabel,
  notAvailable,
  isDark,
  mutedClassName,
  align = 'end',
}: {
  chainLogoSrc: string | null;
  chainLogoFailed: boolean;
  onChainLogoError: () => void;
  chainDisplayName: string;
  chainLabel: string;
  notAvailable: string;
  isDark: boolean;
  mutedClassName: string;
  align?: 'start' | 'end';
}) {
  const alignEnd = align === 'end';

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-4',
        alignEnd ? 'justify-end' : 'justify-start',
      )}
    >
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-2xl">
          🔗
        </div>
      )}
      <div className={cn('min-w-0', alignEnd && 'text-right')}>
        <div className={`text-sm ${mutedClassName}`}>{chainLabel}</div>
        <div className="truncate font-medium">{chainDisplayName || notAvailable}</div>
      </div>
    </div>
  );
}

function WalletBlock({
  walletLabel,
  walletChainRegister,
  notAvailable,
  onCopy,
  mutedClassName,
  isDark,
  align = 'start',
}: {
  walletLabel: string;
  walletChainRegister: string | null;
  notAvailable: string;
  onCopy: (text: string) => void;
  mutedClassName: string;
  isDark: boolean;
  align?: 'start' | 'end';
}) {
  const alignEnd = align === 'end';

  return (
    <div className={cn('min-w-0', alignEnd && 'text-right')}>
      <div className={`text-sm ${mutedClassName}`}>{walletLabel}</div>
      <div
        className={cn(
          'mt-1 flex items-center gap-2 break-all font-mono text-sm',
          alignEnd && 'justify-end',
        )}
      >
        {walletChainRegister ?? notAvailable}
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
  );
}

function RealnessScoreBlock({
  t,
  realnessScore,
  realnessTier,
  realnessStatusLabel,
  realnessAccentColor,
  realnessBadgeHelpText,
  isDark,
}: {
  t: Translations;
  realnessScore: number | null;
  realnessTier: string;
  realnessStatusLabel: string;
  realnessAccentColor: string;
  realnessBadgeHelpText: string;
  isDark: boolean;
}) {
  return (
    <AgentDetailIndexScoreCard
      bare
      hidePlusButton
      density="compact"
      align="end"
      categoryPlacement="below"
      cardTitle={t.agentDetailRealnessTitle}
      cardHelpText={t.agentDetailRealnessHelp}
      infoAriaLabel={t.agentDetailRealnessInfoAriaLabel}
      badgeHelpText={realnessBadgeHelpText}
      badgeInfoAriaLabel={t.realnessStatusInfoAriaLabel}
      score={realnessScore}
      filterTier={realnessTier}
      filterLabel={realnessStatusLabel}
      accentColor={realnessAccentColor}
      notAvailableLabel={t.notAvailable}
      isDark={isDark}
    />
  );
}

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
  realnessScore,
  realnessTier,
  realnessStatusLabel,
  realnessAccentColor,
  realnessBadgeHelpText,
}: Props) {
  const chainProps = {
    chainLogoSrc,
    chainLogoFailed,
    onChainLogoError,
    chainDisplayName,
    chainLabel: t.agentDetailChainLabel,
    notAvailable: t.notAvailable,
    isDark,
    mutedClassName,
  };

  const walletProps = {
    walletLabel: t.agentDetailWalletOnChainIdInfo,
    walletChainRegister,
    notAvailable: t.notAvailable,
    onCopy,
    mutedClassName,
    isDark,
  };

  const scoreProps = {
    t,
    realnessScore,
    realnessTier,
    realnessStatusLabel,
    realnessAccentColor,
    realnessBadgeHelpText,
    isDark,
  };

  return (
    <AgentDetailCard
      isDark={isDark}
      variant="onchain"
      accentHex={realnessAccentColor}
      className="w-full"
      contentClassName="p-8 pb-10"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-x-8">
        {/* Row 1: title (left); realness inline on mobile only */}
        <div className="flex items-center justify-between gap-4 lg:contents">
          <h2 className="text-2xl font-semibold lg:col-start-1 lg:row-start-1">
            {t.agentDetailOnChainData}
          </h2>
          <div className="w-full max-w-[14rem] shrink-0 lg:hidden">
            <RealnessScoreBlock {...scoreProps} />
          </div>
        </div>

        {/* Right column (desktop): realness top, wallet bottom */}
        <div className="ml-auto hidden w-full max-w-[14rem] flex-col justify-between lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:flex lg:justify-self-end lg:text-right">
          <RealnessScoreBlock {...scoreProps} />
          <WalletBlock {...walletProps} align="end" />
        </div>

        {/* Row 2: chain (left) */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <ChainBlock {...chainProps} align="start" />
        </div>

        {/* Wallet (mobile only, after chain) */}
        <div className="ml-auto w-full max-w-[14rem] lg:hidden">
          <WalletBlock {...walletProps} align="end" />
        </div>

        {/* Row 3: dates + owner changes (left) */}
        <div className="grid grid-cols-2 gap-6 lg:col-start-1 lg:row-start-3">
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
