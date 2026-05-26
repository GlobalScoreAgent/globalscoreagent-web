/** Formatea fechas del dashboard siempre en UTC (coincide con timestamps de DB). */
export function formatDashboardDateUtc(
  dateString: string | null | undefined,
  locale: string,
  notAvailableLabel: string,
): string {
  if (!dateString) return notAvailableLabel;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(dateString));
}
