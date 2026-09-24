import { PreStock, PreStockDerived } from "./types";
import { derivePreStockMetrics, isValidPreStock, normalizeSymbol } from "./transforms";

export const PRESTOCKS_API_URL = "https://prestocks.com/api/prestocks";
export const REVALIDATE_SECONDS = 60;

export interface FetchPreStocksResult {
  data: PreStockDerived[];
  error: string | null;
  timestamp: number;
}

/**
 * Fetches and validates live assets from the PreStocks API.
 * Uses Next.js incremental cache with 60s revalidation.
 */
export async function fetchPreStocks(): Promise<PreStockDerived[]> {
  try {
    const res = await fetch(PRESTOCKS_API_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`PreStocks API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();

    if (!Array.isArray(json)) {
      throw new Error("Invalid response format: expected an array of assets");
    }

    const validProducts = json
      .filter(isValidPreStock)
      .map((item: PreStock) => derivePreStockMetrics(item));

    if (validProducts.length === 0 && json.length > 0) {
      throw new Error("No items in PreStocks response matched the expected schema");
    }

    return validProducts;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error fetching PreStocks data";
    console.error("fetchPreStocks error:", message);
    throw new Error(message);
  }
}

/**
 * Safely fetches PreStocks data, returning an empty array and error string on failure.
 */
export async function getPreStocksSafe(): Promise<FetchPreStocksResult> {
  try {
    const data = await fetchPreStocks();
    return {
      data,
      error: null,
      timestamp: Date.now(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load PreStocks data";
    return {
      data: [],
      error: message,
      timestamp: Date.now(),
    };
  }
}

/**
 * Retrieves a single PreStock asset by its symbol.
 */
export async function getPreStockBySymbol(symbol: string): Promise<PreStockDerived | null> {
  const norm = normalizeSymbol(symbol);
  try {
    const all = await fetchPreStocks();
    const found = all.find((item) => normalizeSymbol(item.symbol) === norm);
    return found || null;
  } catch (err) {
    console.error(`getPreStockBySymbol error for ${symbol}:`, err);
    return null;
  }
}
