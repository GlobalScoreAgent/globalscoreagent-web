export type PeriodUrgency = 'red' | 'yellow' | 'green';

export function getDaysUntilPeriodEnd(periodEnd: Date, now: Date = new Date()): number {
  const msPerDay = 86_400_000;
  const endOfPeriod = new Date(periodEnd);
  endOfPeriod.setHours(23, 59, 59, 999);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return Math.ceil((endOfPeriod.getTime() - startOfToday.getTime()) / msPerDay);
}

export function getPeriodUrgency(periodEnd: Date, now: Date = new Date()): PeriodUrgency {
  const daysRemaining = getDaysUntilPeriodEnd(periodEnd, now);
  if (daysRemaining <= 5) return 'red';
  if (daysRemaining <= 10) return 'yellow';
  return 'green';
}

export function getUrgencyTagClasses(
  urgency: PeriodUrgency,
  theme: 'dark' | 'light',
): string {
  const map = {
    red: {
      dark: 'border-red-400 bg-red-500/25 text-red-200',
      light: 'border-red-500 bg-red-100 text-red-800',
    },
    yellow: {
      dark: 'border-amber-400 bg-amber-500/25 text-amber-200',
      light: 'border-amber-500 bg-amber-100 text-amber-900',
    },
    green: {
      dark: 'border-emerald-400 bg-emerald-500/25 text-emerald-200',
      light: 'border-emerald-600 bg-emerald-100 text-emerald-900',
    },
  } as const;

  return map[urgency][theme];
}
