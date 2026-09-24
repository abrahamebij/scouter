/**
 * XYZ DEX metadata fetching and caching.
 * Provides asset index (assetId), szDecimals, and maxLeverage for each coin.
 */

import { HL_CONFIG, toCoin } from "@/lib/config/hyperliquid";
import type { AssetMeta } from "./types";

interface UniverseEntry {
  name: string;
  szDecimals: number;
  maxLeverage: number;
}

interface PerpDexEntry {
  name: string;
}

let cachedMeta: Map<string, AssetMeta> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;

async function getPerpDexIndex(signal?: AbortSignal): Promise<number> {
  if (!HL_CONFIG.DEX_NAME) {
    return 0;
  }

  const response = await fetch(HL_CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "perpDexs" }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch perpDexs: ${response.status}`);
  }

  const data: Array<PerpDexEntry | null> = await response.json();
  const perpDexIndex = data.findIndex((entry) => entry?.name === HL_CONFIG.DEX_NAME);
  if (perpDexIndex < 0) {
    throw new Error(`Perp dex "${HL_CONFIG.DEX_NAME}" not found in perpDexs response`);
  }

  return perpDexIndex;
}

/**
 * Fetch the XYZ DEX universe and build a symbol → AssetMeta map.
 * Caches for 60 seconds.
 */
export async function getAssetMeta(signal?: AbortSignal): Promise<Map<string, AssetMeta>> {
  const now = Date.now();
  if (cachedMeta && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedMeta;
  }

  const [response, perpDexIndex] = await Promise.all([
    fetch(HL_CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "meta", dex: HL_CONFIG.DEX_NAME }),
      signal,
    }),
    getPerpDexIndex(signal),
  ]);

  if (!response.ok) {
    throw new Error(`Failed to fetch XYZ meta: ${response.status}`);
  }

  const data: { universe: UniverseEntry[] } = await response.json();
  const metaMap = new Map<string, AssetMeta>();
  const assetIdOffset = perpDexIndex === 0 ? 0 : 100000 + perpDexIndex * 10000;

  for (let i = 0; i < data.universe.length; i++) {
    const entry = data.universe[i];
    if (!entry) continue;
    metaMap.set(entry.name, {
      name: entry.name,
      szDecimals: entry.szDecimals,
      maxLeverage: entry.maxLeverage,
      assetIndex: assetIdOffset + i,
    });
  }

  cachedMeta = metaMap;
  cacheTimestamp = now;
  return metaMap;
}

/**
 * Get metadata for a single symbol. Throws if not found.
 */
export async function getAssetMetaForSymbol(symbol: string, signal?: AbortSignal): Promise<AssetMeta> {
  const meta = await getAssetMeta(signal);
  const coin = toCoin(symbol);
  const entry = meta.get(coin);
  if (!entry) {
    throw new Error(`Asset "${coin}" not found in XYZ DEX universe`);
  }
  return entry;
}
