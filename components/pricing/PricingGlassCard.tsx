'use client';

import type { ReactNode } from 'react';
import GlassCard from '@/components/marketing/shared/GlassCard';

type PricingGlassCardProps = {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  muted?: boolean;
};

export default function PricingGlassCard({
  children,
  className = '',
  highlight = false,
  muted = false,
}: PricingGlassCardProps) {
  return (
    <GlassCard
      variant="elevated"
      className={`flex h-full flex-col ${highlight ? 'ring-1 ring-gold/50' : ''} ${
        muted ? 'opacity-75' : ''
      } ${className}`}
    >
      {children}
    </GlassCard>
  );
}
