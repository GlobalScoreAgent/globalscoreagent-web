'use client';

import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  label: string;
  isDark: boolean;
  className?: string;
  videoClassName?: string;
};

export function DashboardStatusVideo({
  src,
  label,
  isDark,
  className,
  videoClassName,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const useFallback = Boolean(reduceMotion) || videoFailed;

  if (useFallback) {
    return (
      <div
        className={cn(
          'relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 px-4 py-6',
          isDark ? 'bg-zinc-900/80' : 'bg-zinc-100',
          className,
        )}
      >
        <div
          className={cn(
            'h-8 w-8 rounded-full border-2 border-t-transparent animate-spin',
            isDark
              ? 'border-emerald-400/40 border-t-emerald-400'
              : 'border-emerald-600/30 border-t-emerald-600',
          )}
          aria-hidden
        />
        <p
          className={cn(
            'text-center text-sm font-medium',
            isDark ? 'text-zinc-300' : 'text-zinc-700',
          )}
        >
          {label}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden',
        isDark ? 'bg-zinc-900/80' : 'bg-zinc-100',
        className,
      )}
    >
      {!videoReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400"
            aria-hidden
          />
        </div>
      )}
      <video
        key={src}
        className={cn(
          'max-h-full max-w-full object-contain transition-opacity duration-300',
          videoReady ? 'opacity-100' : 'opacity-0',
          videoClassName,
        )}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoFailed(true)}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
