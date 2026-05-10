/** Colores badge HUMI por valor de humi_score_filter en DB */

export type HumiTranslationsPick = {
  humiElite: string;
  humiHighPerformance: string;
  humiStable: string;
  humiModerateRisk: string;
  humiCritical: string;
};

export function getHumiScoreColor(humiFilter: string): string {
  const colorMapping: Record<string, string> = {
    Elite: '#22c55e',
    'High Performance': '#84cc16',
    Stable: '#eab308',
    'Moderate Risk': '#f97316',
    Critical: '#dc2626',
  };

  return colorMapping[humiFilter] || '#6B7280';
}

export function getHumiScoreText(humiFilter: string, t: HumiTranslationsPick): string {
  const textMapping: Record<string, string> = {
    Elite: t.humiElite,
    'High Performance': t.humiHighPerformance,
    Stable: t.humiStable,
    'Moderate Risk': t.humiModerateRisk,
    Critical: t.humiCritical,
  };

  return textMapping[humiFilter] || humiFilter;
}
