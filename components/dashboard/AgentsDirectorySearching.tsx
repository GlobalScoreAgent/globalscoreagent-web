'use client';

import { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SEARCH_VIDEOS = [
  '/animations/agent-searching-1.mp4',
  '/animations/agent-searching-2.mp4',
  '/animations/agent-searching-3.mp4',
  '/animations/agent-searching-4.mp4',
] as const;

type Props = {
  label: string;
  isDark: boolean;
  className?: string;
};

function pickRandomVideoSrc(): string {
  const index = Math.floor(Math.random() * SEARCH_VIDEOS.length);
  return SEARCH_VIDEOS[index] ?? SEARCH_VIDEOS[0];
}

export function AgentsDirectorySearching({ label, isDark, className }: Props) {
  const reduceMotion = useReducedMotion();
  const videoSrc = useMemo(() => pickRandomVideoSrc(), []);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const useFallback = Boolean(reduceMotion) || videoFailed;

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-md overflow-hidden rounded-3xl border',
        isDark ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-200 bg-white/90',
        className,
      )}
    >
      {useFallback ? (
        <div className="relative flex min-h-[14rem] flex-col items-center justify-center gap-3 px-6 py-8">
          <div
            className={cn(
              'h-10 w-10 rounded-full border-2 border-t-transparent animate-spin',
              isDark ? 'border-emerald-400/40 border-t-emerald-400' : 'border-emerald-600/30 border-t-emerald-600',
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
      ) : (
        <div className="relative aspect-video min-h-[14rem] w-full bg-zinc-950">
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400"
                aria-hidden
              />
            </div>
          )}
          <video
            key={videoSrc}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
              videoReady ? 'opacity-100' : 'opacity-0',
            )}
            src={videoSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
