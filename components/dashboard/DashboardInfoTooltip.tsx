'use client';

import { useCallback, useId, useRef, useState, type FocusEvent } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardInfoTooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

type Props = {
  content: string;
  ariaLabel: string;
  isDark: boolean;
  className?: string;
  tooltipClassName?: string;
  placement?: DashboardInfoTooltipPlacement;
};

function placementClasses(placement: DashboardInfoTooltipPlacement): string {
  switch (placement) {
    case 'bottom':
      return 'top-full left-1/2 mt-1 -translate-x-1/2';
    case 'left':
      return 'right-full top-1/2 mr-1 -translate-y-1/2';
    case 'right':
      return 'left-full top-1/2 ml-1 -translate-y-1/2';
    case 'top':
    default:
      return 'bottom-full left-1/2 mb-1 -translate-x-1/2';
  }
}

export function DashboardInfoTooltip({
  content,
  ariaLabel,
  isDark,
  className,
  tooltipClassName,
  placement = 'top',
}: Props) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const handleBlur = (e: FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      close();
    }
  };

  return (
    <span
      ref={rootRef}
      className={cn('relative inline-flex shrink-0', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className={cn(
          'rounded p-0.5 transition-colors focus:outline-none focus-visible:ring-1',
          isDark
            ? 'text-zinc-500 hover:text-zinc-300 focus-visible:ring-zinc-500'
            : 'text-zinc-400 hover:text-zinc-600 focus-visible:ring-zinc-400',
        )}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-3 w-3" aria-hidden />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-[12rem] rounded-md border px-2 py-1 text-left text-[10px] leading-snug shadow-lg transition-opacity',
          placementClasses(placement),
          open ? 'opacity-100' : 'opacity-0',
          isDark
            ? 'border-zinc-600 bg-zinc-900/95 text-zinc-200 backdrop-blur-sm'
            : 'border-zinc-200 bg-white text-zinc-700',
          tooltipClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
