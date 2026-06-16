'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
} from 'react';
import { createPortal } from 'react-dom';
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

type TooltipPosition = { top: number; left: number };

const GAP_PX = 4;
const VIEWPORT_PAD = 8;

function computeTooltipPosition(
  triggerRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: DashboardInfoTooltipPlacement,
): TooltipPosition {
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = triggerRect.bottom + GAP_PX;
      left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      left = triggerRect.left - tooltipWidth - GAP_PX;
      break;
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      left = triggerRect.right + GAP_PX;
      break;
    case 'top':
    default:
      top = triggerRect.top - tooltipHeight - GAP_PX;
      left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      break;
  }

  const maxLeft = Math.max(VIEWPORT_PAD, window.innerWidth - tooltipWidth - VIEWPORT_PAD);
  const maxTop = Math.max(VIEWPORT_PAD, window.innerHeight - tooltipHeight - VIEWPORT_PAD);

  return {
    top: Math.min(Math.max(VIEWPORT_PAD, top), maxTop),
    left: Math.min(Math.max(VIEWPORT_PAD, left), maxLeft),
  };
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
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const tooltip = tooltipRef.current;
    if (!button || !tooltip) return;

    const triggerRect = button.getBoundingClientRect();
    const { width, height } = tooltip.getBoundingClientRect();
    setPosition(computeTooltipPosition(triggerRect, width, height, placement));
  }, [placement]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [open, content, placement, tooltipClassName, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePosition]);

  const handleBlur = (e: FocusEvent) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      close();
    }
  };

  const tooltipNode =
    open && mounted ? (
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        style={
          position
            ? { position: 'fixed', top: position.top, left: position.left, zIndex: 9999 }
            : { position: 'fixed', top: -9999, left: -9999, zIndex: 9999, visibility: 'hidden' as const }
        }
        className={cn(
          'pointer-events-none w-max max-w-[12rem] rounded-md border px-2 py-1 text-left text-[10px] leading-snug shadow-lg',
          isDark
            ? 'border-zinc-600 bg-zinc-900/95 text-zinc-200 backdrop-blur-sm'
            : 'border-zinc-200 bg-white text-zinc-700',
          tooltipClassName,
        )}
      >
        {content}
      </span>
    ) : null;

  return (
    <span
      ref={rootRef}
      className={cn('inline-flex shrink-0', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
    >
      <button
        ref={buttonRef}
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
      {mounted && tooltipNode ? createPortal(tooltipNode, document.body) : null}
    </span>
  );
}
