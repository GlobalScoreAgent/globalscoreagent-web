'use client';

import { useEffect, useState } from 'react';

type AnimatedCounterProps = {
  target: number;
  className?: string;
  locale?: string;
};

export default function AnimatedCounter({
  target,
  className = '',
  locale = 'es-ES',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setCount(target);
      return;
    }

    let start = 0;
    const duration = 1800;
    const increment = Math.max(1, Math.ceil(target / (duration / 16)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <span className={className}>{count.toLocaleString(locale)}</span>;
}
