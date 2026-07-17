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
    celo: 'Celo',
    'celo mainnet': 'Celo',
    gnosis: 'Gnosis',
    'gnosis chain': 'Gnosis',
    'x layer': 'X Layer',
    'x layer mainnet': 'X Layer',
    xlayer: 'X Layer',
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
    celo: '#35D07F',
    'celo mainnet': '#35D07F',
    gnosis: '#3E6957',
    'gnosis chain': '#3E6957',
    'x layer': '#94A3B8',
    'x layer mainnet': '#94A3B8',
    xlayer: '#94A3B8',
  };

  return colorMapping[normalizedName] || '#6B7280';
}

/** Native gas token ticker for a chain display name. */
const CHAIN_NATIVE_GAS_SYMBOL: Record<string, string> = {
  ethereum: 'ETH',
  'ethereum mainnet': 'ETH',
  base: 'ETH',
  'base mainnet': 'ETH',
  arbitrum: 'ETH',
  'arbitrum one': 'ETH',
  'arbitrum-one': 'ETH',
  bnb: 'BNB',
  'bnb smart chain': 'BNB',
  'bnb chain': 'BNB',
  polygon: 'POL',
  'polygon mainnet': 'POL',
  matic: 'POL',
  celo: 'CELO',
  'celo mainnet': 'CELO',
  gnosis: 'xDAI',
  'gnosis chain': 'xDAI',
  'x layer': 'OKB',
  'x layer mainnet': 'OKB',
  xlayer: 'OKB',
};

export function nativeGasSymbolFromChainName(
  chainName: string | null | undefined,
): string | null {
  if (chainName == null || typeof chainName !== 'string') return null;
  const key = chainName.trim().toLowerCase();
  if (!key) return null;
  return CHAIN_NATIVE_GAS_SYMBOL[key] ?? null;
}
