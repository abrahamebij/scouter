import { PreStock, PreStockDerived } from "./types";

/**
 * Validates whether an unknown object matches the expected PreStock shape.
 */
export function isValidPreStock(item: unknown): item is PreStock {
  if (!item || typeof item !== "object") return false;
  const p = item as Record<string, unknown>;

  return (
    typeof p.name === "string" &&
    typeof p.symbol === "string" &&
    typeof p.contract_address === "string" &&
    typeof p.tokenPrice === "number" &&
    !Number.isNaN(p.tokenPrice) &&
    typeof p.markPrice === "number" &&
    !Number.isNaN(p.markPrice)
  );
}

/**
 * Derives financial metrics for a PreStock asset.
 */
export function derivePreStockMetrics(product: PreStock): PreStockDerived {
  const markPrice = Number(product.markPrice) || 0;
  const tokenPrice = Number(product.tokenPrice) || 0;
  const markValuation = Number(product.markValuation) || 0;
  const impliedValuation = Number(product.impliedValuation) || 0;

  const premiumPercent =
    markPrice === 0 ? 0 : ((tokenPrice - markPrice) / markPrice) * 100;

  const priceDifference = tokenPrice - markPrice;
  const valuationDifference = impliedValuation - markValuation;

  return {
    ...product,
    markPrice,
    tokenPrice,
    markValuation,
    impliedValuation,
    supply: Number(product.supply) || 0,
    premiumPercent,
    priceDifference,
    valuationDifference,
  };
}

/**
 * Normalises a company display name from its product name (e.g. "OpenAI PreStocks" -> "OpenAI").
 */
export function getCompanyName(name: string): string {
  return name.replace(/\s+PreStocks$/i, "").trim();
}

/**
 * Normalises a symbol for URL routing and lookups.
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}
