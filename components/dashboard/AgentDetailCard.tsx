'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const ACCENT = '#facc15';

export type AgentDetailCardVariant =
  | 'onchain'
  | 'metadata'
  | 'transactional'
  | 'feedback'
  | 'profiles'
  | 'image';

type AgentDetailCardProps = {
  isDark: boolean;
  variant: AgentDetailCardVariant;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

/** Corner / offset for decorative radial blob — same family, not identical. */
const BLOB_OFFSET: Record<AgentDetailCardVariant, { x: number; y: number }> = {
  onchain: { x: 22, y: -18 },
  metadata: { x: -28, y: 18 },
  transactional: { x: 26, y: -22 },
  feedback: { x: -18, y: -16 },
  profiles: { x: 14, y: -14 },
  image: { x: 20, y: -20 },
};

const DARK_BG: Record<AgentDetailCardVariant, string> = {
  onchain: `linear-gradient(135deg, ${ACCENT}15 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${ACCENT}10 100%)`,
  metadata: `linear-gradient(135deg, ${ACCENT}12 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${ACCENT}08 100%)`,
  transactional: `linear-gradient(135deg, ${ACCENT}14 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${ACCENT}09 100%)`,
  feedback: `linear-gradient(135deg, ${ACCENT}13 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${ACCENT}09 100%)`,
  profiles: `linear-gradient(135deg, ${ACCENT}12 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${ACCENT}08 100%)`,
  image: `linear-gradient(135deg, ${ACCENT}16 0%, rgba(39,39,42,0.88) 32%, rgba(24,24,27,0.96) 68%, ${ACCENT}11 100%)`,
};

const LIGHT_BG: Record<AgentDetailCardVariant, string> = {
  onchain: `linear-gradient(135deg, ${ACCENT}20 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${ACCENT}15 100%)`,
  metadata: `linear-gradient(135deg, ${ACCENT}17 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${ACCENT}12 100%)`,
  transactional: `linear-gradient(135deg, ${ACCENT}19 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${ACCENT}14 100%)`,
  feedback: `linear-gradient(135deg, ${ACCENT}18 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${ACCENT}13 100%)`,
  profiles: `linear-gradient(135deg, ${ACCENT}17 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${ACCENT}12 100%)`,
  image: `linear-gradient(135deg, ${ACCENT}22 0%, rgba(255,255,255,0.92) 32%, rgba(250,250,250,0.97) 68%, ${ACCENT}16 100%)`,
};

export function AgentDetailCard({
  isDark,
  variant,
  className,
  contentClassName,
  children,
}: AgentDetailCardProps) {
  const { x, y } = BLOB_OFFSET[variant];
  const background = isDark ? DARK_BG[variant] : LIGHT_BG[variant];

  const boxShadow = isDark
    ? `0 16px 48px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.38), 0 0 0 1px ${ACCENT}28, inset 0 1px 0 rgba(255,255,255,0.07)`
    : `0 16px 48px rgba(0,0,0,0.11), 0 8px 24px rgba(0,0,0,0.07), 0 0 0 1px ${ACCENT}32, inset 0 1px 0 rgba(255,255,255,0.55)`;

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
          background: `radial-gradient(circle, ${ACCENT} 0%, transparent 72%)`,
          transform: `translate(${x}px, ${y}px)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: dotOpacity,
          backgroundImage: `radial-gradient(circle, ${ACCENT} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      <div className={cn('relative z-[1]', contentClassName)}>{children}</div>
    </div>
  );
}
