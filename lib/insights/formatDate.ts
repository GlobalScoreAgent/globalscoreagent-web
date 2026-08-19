export function formatInsightsDate(date: string, lang: 'es' | 'en'): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' },
  );
}
