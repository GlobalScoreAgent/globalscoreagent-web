import { ReactNode } from 'react';

type GlassCardVariant = 'default' | 'hero' | 'elevated';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: GlassCardVariant;
};

const variantClasses: Record<GlassCardVariant, string> = {
  default: 'rounded-2xl border border-gold/10 bg-black/40 p-5 backdrop-blur-xl',
  hero:
    'rounded-xl border border-white/10 bg-black/15 p-3 backdrop-blur-md shadow-none',
  elevated:
    'rounded-2xl border border-gold/20 bg-gradient-to-br from-zinc-900/80 to-black/60 p-5 shadow-[0_0_40px_-12px_rgba(212,175,55,0.25)] ring-1 ring-inset ring-white/5 backdrop-blur-xl transition-colors hover:border-gold/35',
};

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
}: GlassCardProps) {
  return <div className={`${variantClasses[variant]} ${className}`}>{children}</div>;
}
