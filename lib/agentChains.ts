/**
 * Normalización de nombre de cadena para UI y colores (directorio).
 */
export function normalizeChainName(chainName: string): string {
  const normalizedName = chainName.toLowerCase().trim();

  const nameMapping: Record<string, string> = {
    ethereum: 'Ethereum',
    'ethereum mainnet': 'Ethereum',
    base: 'Base',
    'base mainnet': 'Base',
    bnb: 'BNB',
    'bnb smart chain': 'BNB',
    'bnb chain': 'BNB',
    arbitrum: 'Arbitrum',
    'arbitrum one': 'Arbitrum',
    'arbitrum-one': 'Arbitrum',
    polygon: 'Polygon',
    'polygon mainnet': 'Polygon',
    matic: 'Polygon',
  };

  return nameMapping[normalizedName] || chainName;
}

/**
 * Alias para igualar contra `chains.short_name` en API (primer intento EQ).
 */
export function normalizeChainShortNameForMatch(chainName: string | null): string | null {
  if (!chainName || !String(chainName).trim()) return null;
  const n = String(chainName).trim();
  return normalizeChainName(n);
}

export function getChainColor(chainName: string): string {
  const normalizedName = chainName.toLowerCase().trim();

  const colorMapping: Record<string, string> = {
    ethereum: '#627EEA',
    base: '#0052FF',
    bnb: '#F3BA2F',
    arbitrum: '#28A0F0',
    polygon: '#8247E5',
  };

  return colorMapping[normalizedName] || '#6B7280';
}
