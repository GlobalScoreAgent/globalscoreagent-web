'use client';

import Image from 'next/image';
import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import { publicChainLogoUrl } from '@/lib/chainPublicLogo';
import { cn } from '@/lib/utils';

export type MonitoredChainItem = {
  short_name: string;
  logo_file_name: string | null;
};

type Props = {
  chains: MonitoredChainItem[];
  isDark: boolean;
  t: Translations;
  className?: string;
};

export function parseMonitoredChains(raw: unknown): MonitoredChainItem[] {
  if (!Array.isArray(raw)) return [];
  const out: MonitoredChainItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const shortName = typeof row.short_name === 'string' ? row.short_name.trim() : '';
    if (!shortName) continue;
    const logo =
      typeof row.logo_file_name === 'string' && row.logo_file_name.trim()
        ? row.logo_file_name.trim()
        : null;
    out.push({ short_name: shortName, logo_file_name: logo });
  }
  return out;
}

export function DashboardMonitoredChainsRow({ chains, isDark, t, className }: Props) {
  if (chains.length === 0) return null;

  return (
    <section className={cn('w-full', className)} aria-label={t.monitoredChainsTitle}>
      <p
        className={cn(
          'mb-3 text-center text-[11px] font-semibold uppercase tracking-wide',
          isDark ? 'text-zinc-500' : 'text-zinc-500',
        )}
      >
        {t.monitoredChainsTitle}
      </p>
      <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        {chains.map((chain) => {
          const logoSrc = publicChainLogoUrl(chain.logo_file_name);
          return (
            <div
              key={`${chain.short_name}-${chain.logo_file_name ?? 'none'}`}
              className={cn(
                'flex min-w-[7.5rem] items-center gap-2 rounded-2xl border px-3 py-2.5',
                isDark
                  ? 'border-zinc-700/60 bg-zinc-900/70 text-zinc-200'
                  : 'border-zinc-200 bg-white/90 text-zinc-800 shadow-sm',
              )}
            >
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt=""
                    fill
                    className="object-contain p-0.5"
                    sizes="32px"
                    unoptimized
                  />
                ) : (
                  <span className="text-[10px] font-bold text-zinc-400">
                    {chain.short_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="truncate text-sm font-medium">{chain.short_name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
