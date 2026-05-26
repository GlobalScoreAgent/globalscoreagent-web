/** Inset panel inside AgentDetailCard — matches agent detail page. */
export function dashboardCardInlayClass(isDark: boolean): string {
  return isDark
    ? 'rounded-2xl border border-zinc-700/55 bg-zinc-950/75 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] backdrop-blur-[1px]'
    : 'rounded-2xl border border-zinc-300/70 bg-white/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]';
}
