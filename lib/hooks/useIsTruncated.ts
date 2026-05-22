'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useIsTruncated(
  ref: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
): boolean {
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setTruncated(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-check when text/content changes
  }, [ref, ...deps]);

  return truncated;
}
