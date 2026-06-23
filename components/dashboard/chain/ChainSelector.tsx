'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { chainAccentColor } from '@/lib/dashboardChains';
import { publicChainLogoUrl } from '@/lib/chainPublicLogo';
import type { DashboardChainRow } from '@/lib/dashboardChains';

type Props = {
  chains: DashboardChainRow[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isDark: boolean;
};

export function ChainSelector({ chains, selectedIndex, onSelect, isDark }: Props) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 -mx-1 mb-4 border-b px-1 pb-3 pt-1 backdrop-blur-md',
        isDark ? 'border-zinc-800 bg-zinc-950/90' : 'border-zinc-200 bg-zinc-100/90',
      )}
      role="tablist"
      aria-label="Blockchain networks"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
        {chains.map((chain, index) => {
          const isActive = index === selectedIndex;
          const accent = chainAccentColor(chain.chain_id);
          const logoSrc = publicChainLogoUrl(chain.logo_file_name);
          const label = chain.short_name || chain.name;

          return (
            <button
              key={chain.chain_id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(index)}
              className={cn(
                'flex shrink-0 snap-start items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? isDark
                    ? 'border-amber-400/40 bg-zinc-800 text-amber-300'
                    : 'border-amber-500/40 bg-white text-amber-700 shadow-sm'
                  : isDark
                    ? 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600'
                    : 'border-zinc-200 bg-white/80 text-zinc-700 hover:border-zinc-300',
              )}
              style={isActive ? { boxShadow: `0 0 0 1px ${accent}55` } : undefined}
            >
              <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                {logoSrc ? (
                  <Image src={logoSrc} alt="" fill className="object-contain p-0.5" sizes="28px" unoptimized />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-400">{label.slice(0, 2)}</span>
                )}
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
