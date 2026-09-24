/**
 * Hyperliquid XYZ DEX configuration
 *
 * XYZ is the stocks/equities DEX on Hyperliquid mainnet.
 * All coin names are prefixed with "xyz:" (e.g. "xyz:TSLA", "xyz:AAPL").
 */

export const HL_CONFIG = {
  /** REST API base URL */
  API_URL: "https://api.hyperliquid.xyz/info",

  /** WebSocket URL */
  WS_URL: "wss://api.hyperliquid.xyz/ws",

  /** DEX identifier for REST requests that take a `dex` parameter */
  DEX_NAME: "xyz",
} as const;

/**
 * Convert a display symbol (e.g. "TSLA") to the full XYZ DEX coin name
 * used in Hyperliquid API requests (e.g. "xyz:TSLA").
 */
export function toCoin(symbol: string): string {
  if (symbol.startsWith("xyz:")) return symbol;
  return `xyz:${symbol}`;
}

/**
 * Convert a full coin name (e.g. "xyz:TSLA") back to display symbol ("TSLA").
 */
export function toSymbol(coin: string): string {
  return coin.replace("xyz:", "");
}

/**
 * Get the logo URL for a symbol. Logos are stored at /coins/SYMBOL.svg
 */
export function coinLogoUrl(symbol: string): string {
  return `/coins/${symbol}.svg`;
}

/** Market metadata for known XYZ DEX assets */
export interface MarketMeta {
  symbol: string;
  displayName: string;
}

/** All known XYZ DEX markets */
export const ALL_MARKETS: MarketMeta[] = [
  // Index
  { symbol: "XYZ100", displayName: "XYZ Index 100" },
  // Tech
  { symbol: "TSLA", displayName: "Tesla" },
  { symbol: "NVDA", displayName: "NVIDIA" },
  { symbol: "AAPL", displayName: "Apple" },
  { symbol: "MSFT", displayName: "Microsoft" },
  { symbol: "GOOGL", displayName: "Alphabet" },
  { symbol: "AMZN", displayName: "Amazon" },
  { symbol: "META", displayName: "Meta" },
  { symbol: "AMD", displayName: "AMD" },
  { symbol: "INTC", displayName: "Intel" },
  { symbol: "ORCL", displayName: "Oracle" },
  { symbol: "TSM", displayName: "TSMC" },
  { symbol: "MU", displayName: "Micron" },
  { symbol: "SNDK", displayName: "SanDisk" },
  { symbol: "NFLX", displayName: "Netflix" },
  // Finance / Crypto
  { symbol: "COIN", displayName: "Coinbase" },
  { symbol: "HOOD", displayName: "Robinhood" },
  { symbol: "MSTR", displayName: "MicroStrategy" },
  { symbol: "PLTR", displayName: "Palantir" },
  { symbol: "CRCL", displayName: "Circle" },
  // Retail / Consumer
  { symbol: "COST", displayName: "Costco" },
  { symbol: "LLY", displayName: "Eli Lilly" },
  { symbol: "BABA", displayName: "Alibaba" },
  { symbol: "RIVN", displayName: "Rivian" },
  { symbol: "HIMS", displayName: "Hims & Hers" },
  { symbol: "DKNG", displayName: "DraftKings" },
  { symbol: "GME", displayName: "GameStop" },
  { symbol: "CRWV", displayName: "CrowdStrike" },
  { symbol: "LITE", displayName: "Lumentum" },
  // Asian
  { symbol: "SMSN", displayName: "Samsung" },
  { symbol: "HYUNDAI", displayName: "Hyundai" },
  { symbol: "KIOXIA", displayName: "Kioxia" },
  { symbol: "SOFTBANK", displayName: "SoftBank" },
  { symbol: "SKHX", displayName: "SK Hynix" },
  // ETFs / Regional
  { symbol: "EWY", displayName: "iShares Korea" },
  { symbol: "EWJ", displayName: "iShares Japan" },
  { symbol: "KR200", displayName: "KOSPI 200" },
  { symbol: "JP225", displayName: "Nikkei 225" },
  { symbol: "USAR", displayName: "US 10Y Yield" },
  { symbol: "XLE", displayName: "Energy Select" },
  { symbol: "URNM", displayName: "Uranium Miners" },
  // Commodities
  { symbol: "GOLD", displayName: "Gold" },
  { symbol: "SILVER", displayName: "Silver" },
  { symbol: "PLATINUM", displayName: "Platinum" },
  { symbol: "PALLADIUM", displayName: "Palladium" },
  { symbol: "COPPER", displayName: "Copper" },
  { symbol: "ALUMINIUM", displayName: "Aluminium" },
  { symbol: "URANIUM", displayName: "Uranium" },
  { symbol: "CL", displayName: "Crude Oil WTI" },
  { symbol: "BRENTOIL", displayName: "Brent Oil" },
  { symbol: "NATGAS", displayName: "Natural Gas" },
  { symbol: "CORN", displayName: "Corn" },
  // FX / Macro
  { symbol: "EUR", displayName: "EUR/USD" },
  { symbol: "JPY", displayName: "USD/JPY" },
  { symbol: "DXY", displayName: "Dollar Index" },
  { symbol: "VIX", displayName: "VIX" },
  { symbol: "SP500", displayName: "S&P 500" },
];

/** Default markets shown first in the selector */
export const DEFAULT_MARKETS = ALL_MARKETS.slice(0, 20);
