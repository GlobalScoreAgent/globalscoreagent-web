'use client';

import { cn } from '@/lib/utils';

type Props = {
  categoryLabel: string;
  accentColor: string;
  isDark: boolean;
  className?: string;
};

export function AgentDirectoryHumiRibbon({
  categoryLabel,
  accentColor,
  isDark,
  className,
}: Props) {
  if (!categoryLabel.trim()) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 top-0 z-30 h-14 w-14 overflow-hidden rounded-tl-3xl',
        className,
      )}
    >
      <div
        className="pointer-events-auto absolute left-[-38%] top-[18%] w-[140%] cursor-default py-0.5 text-center text-[9px] font-bold uppercase leading-tight tracking-wide shadow-sm"
        style={{
          backgroundColor: accentColor,
          color: isDark ? '#fafafa' : '#18181b',
          transform: 'rotate(-45deg)',
        }}
        title={categoryLabel}
        aria-label={categoryLabel}
      >
        <span className="block truncate px-6">{categoryLabel}</span>
      </div>
    </div>
  );
}
