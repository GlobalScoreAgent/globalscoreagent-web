import type { PeriodUrgency } from '@/lib/gsa/subscription-period-urgency';

export const dashboardSectionClass =
  'rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900';

export const dashboardSectionTitleClass =
  'mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500';

type InsetCardOptions = {
  selected?: boolean;
  muted?: boolean;
};

export function dashboardInsetCardClass(
  isDark: boolean,
  { selected = false, muted = false }: InsetCardOptions = {},
): string {
  const base = isDark
    ? 'rounded-xl border border-zinc-600/50 bg-zinc-950/40 backdrop-blur-sm'
    : 'rounded-xl border border-zinc-300/70 bg-white/50 backdrop-blur-sm';

  const selectedClass = selected
    ? 'ring-2 ring-emerald-500/60 border-emerald-500 bg-emerald-500/10'
    : '';

  const mutedClass = muted && !selected ? 'opacity-90' : '';

  return `${base} ${selectedClass} ${mutedClass}`.trim();
}

export function dashboardFormInputClass(isDark: boolean): string {
  return isDark
    ? 'w-full rounded-xl border border-zinc-600/50 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500'
    : 'w-full rounded-xl border border-zinc-300 bg-white/90 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400';
}

export function dashboardFormInsetClass(isDark: boolean): string {
  return isDark
    ? 'rounded-xl border border-zinc-600/50 bg-zinc-950/40 backdrop-blur-sm'
    : 'rounded-xl border border-zinc-300/70 bg-white/50 backdrop-blur-sm';
}

export function dashboardFormLabelClass(isDark: boolean): string {
  return isDark ? 'text-zinc-400' : 'text-zinc-500';
}

export function dashboardFormBodyClass(isDark: boolean): string {
  return isDark ? 'text-zinc-300' : 'text-zinc-700';
}

export function dashboardFormMutedClass(isDark: boolean): string {
  return isDark ? 'text-zinc-400' : 'text-zinc-500';
}

export function dashboardFormHeadingClass(isDark: boolean): string {
  return isDark ? 'text-zinc-100' : 'text-zinc-900';
}

const ACCENT_BADGE_PRESETS: Record<
  string,
  { dark: string; light: string }
> = {
  '#facc15': {
    dark: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    light: 'border-amber-400/30 bg-amber-400/15 text-amber-700',
  },
  '#a855f7': {
    dark: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    light: 'border-violet-400/30 bg-violet-400/15 text-violet-700',
  },
  '#38bdf8': {
    dark: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
    light: 'border-sky-400/30 bg-sky-400/15 text-sky-600',
  },
  '#22c55e': {
    dark: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    light: 'border-emerald-500/30 bg-emerald-400/15 text-emerald-700',
  },
  '#eab308': {
    dark: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-300',
    light: 'border-yellow-500/30 bg-yellow-400/15 text-yellow-800',
  },
  '#ef4444': {
    dark: 'border-red-400/20 bg-red-400/10 text-red-300',
    light: 'border-red-500/30 bg-red-400/15 text-red-700',
  },
  '#71717a': {
    dark: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300',
    light: 'border-zinc-400/30 bg-zinc-400/15 text-zinc-600',
  },
};

export function accentBadgeClasses(isDark: boolean, accentHex: string): string {
  const preset = ACCENT_BADGE_PRESETS[accentHex.toLowerCase()];
  const base = 'rounded-lg border px-3 py-1 text-xs font-bold tracking-wider';
  if (preset) {
    return `${base} ${isDark ? preset.dark : preset.light}`;
  }
  return `${base} ${isDark ? 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300' : 'border-zinc-400/30 bg-zinc-400/15 text-zinc-600'}`;
}

export function dashboardSmallAccentBadgeClass(isDark: boolean, accentHex: string): string {
  const section = accentBadgeClasses(isDark, accentHex);
  return section
    .replace('rounded-lg', 'rounded-md')
    .replace('px-3 py-1 text-xs font-bold tracking-wider', 'px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide');
}

export function urgencyAccentHex(urgency: PeriodUrgency): string {
  switch (urgency) {
    case 'red':
      return '#ef4444';
    case 'yellow':
      return '#eab308';
    case 'green':
      return '#22c55e';
    default:
      return '#71717a';
  }
}

export function dashboardDisabledPrimaryButtonClass(isDark: boolean): string {
  const bg = isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-700 text-white';
  return `mt-auto w-full rounded-xl px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed ${bg}`;
}
