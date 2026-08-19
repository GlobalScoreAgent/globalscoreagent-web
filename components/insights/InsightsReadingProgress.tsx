'use client';

import { useEffect, useState } from 'react';

export default function InsightsReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, el.scrollTop / max)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="insights-reading-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden
    />
  );
}
