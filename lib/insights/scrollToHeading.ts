/** Sticky Insights header (h-16) + breathing room */
const INSIGHTS_TOC_SCROLL_OFFSET = 96;

function findInsightsHeading(id: string): HTMLElement | null {
  return (
    document.getElementById(id) ??
    document.querySelector<HTMLElement>(`.insights-markdown [id="${CSS.escape(id)}"]`)
  );
}

export function scrollToInsightsHeading(id: string): boolean {
  const el = findInsightsHeading(id);
  if (!el) return false;

  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - INSIGHTS_TOC_SCROLL_OFFSET);
  window.scrollTo({ top, behavior: 'smooth' });

  window.requestAnimationFrame(() => {
    if (window.location.hash !== `#${id}`) {
      const url = `${window.location.pathname}${window.location.search}#${id}`;
      window.history.replaceState(null, '', url);
    }
  });

  return true;
}
