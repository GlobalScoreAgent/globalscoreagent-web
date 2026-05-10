'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_ACCENT = '#facc15';

export type AgentDetailCardVariant =
  | 'onchain'
  | 'metadata'
  | 'transactional'
  | 'feedback'
  | 'profiles'
  | 'image'
  | 'chain';

type AgentDetailCardProps = {
  isDark: boolean;
  variant: AgentDetailCardVariant;
  /** 6-digit hex (e.g. #facc15) for layered gradients/shadows; defaults to amber. */
  accentHex?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

/** Corner / offset for decorative radial blob — same family, not identical. */
const BLOB_OFFSET: Record<AgentDetailCardVariant, { x: number; y: number }> = {
  onchain: { x: 22, y: -18 },
  chain: { x: 22, y: -18 },
  metadata: { x: -28, y: 18 },
  transactional: { x: 26, y: -22 },
  feedback: { x: -18, y: -16 },
  profiles: { x: 14, y: -14 },
  image: { x: 20, y: -20 },
};

function darkBg(variant: AgentDetailCardVariant, a: string): string {
  switch (variant) {
    case 'onchain':
    case 'chain':
      return `linear-gradient(135deg, ${a}15 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${a}10 100%)`;
    case 'metadata':
      return `linear-gradient(135deg, ${a}12 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${a}08 100%)`;
    case 'transactional':
      return `linear-gradient(135deg, ${a}14 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${a}09 100%)`;
    case 'feedback':
      return `linear-gradient(135deg, ${a}13 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${a}09 100%)`;
    case 'profiles':
      return `linear-gradient(135deg, ${a}12 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${a}08 100%)`;
    case 'image':
      return `linear-gradient(135deg, ${a}16 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${a}11 100%)`;
    default:
      return darkBg('onchain', a);
  }
}

function lightBg(variant: AgentDetailCardVariant, a: string): string {
  switch (variant) {
    case 'onchain':
    case 'chain':
      return `linear-gradient(135deg, ${a}20 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${a}15 100%)`;
    case 'metadata':
      return `linear-gradient(135deg, ${a}17 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${a}12 100%)`;
    case 'transactional':
      return `linear-gradient(135deg, ${a}19 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${a}14 100%)`;
    case 'feedback':
      return `linear-gradient(135deg, ${a}18 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${a}13 100%)`;
    case 'profiles':
      return `linear-gradient(135deg, ${a}17 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${a}12 100%)`;
    case 'image':
      return `linear-gradient(135deg, ${a}22 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${a}16 100%)`;
    default:
      return lightBg('onchain', a);
  }
}

export function AgentDetailCard({
  isDark,
  variant,
  accentHex,
  className,
  contentClassName,
  children,
}: AgentDetailCardProps) {
  const accent = accentHex ?? DEFAULT_ACCENT;
  const { x, y } = BLOB_OFFSET[variant];
  const background = isDark ? darkBg(variant, accent) : lightBg(variant, accent);

  const boxShadow = isDark
    ? `0 16px 48px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.38), 0 0 0 1px ${accent}28, inset 0 1px 0 rgba(255,255,255,0.07)`
    : `0 16px 48px rgba(0,0,0,0.11), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px ${accent}32, inset 0 1px 0 rgba(255,255,255,0.55)`;

  const dotOpacity = variant === 'image' || variant === 'profiles' ? 0.028 : 0.032;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-0.5',
        isDark ? 'border-zinc-700/45' : 'border-zinc-200/55',
        className,
      )}
      style={{ background, boxShadow }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full opacity-[0.055]"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 72%)`,
          transform: `translate(${x}px, ${y}px)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: dotOpacity,
          backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className={cn('relative z-[1]', contentClassName)}>{children}</div>
    </div>
  );
}
