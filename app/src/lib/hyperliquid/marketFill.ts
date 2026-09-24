export interface BookLevel {
  price: number;
  size: number;
}

export interface MarketFillEstimate {
  hasLiquidity: boolean;
  assetSize: number;
  quoteValue: number;
  averagePrice: number;
  limitPrice: number;
}

export function simulateImmediateMarketFill(
  levels: ReadonlyArray<BookLevel>,
  amount: number,
  unit: "asset" | "usdc"
): MarketFillEstimate {
  if (amount <= 0 || levels.length === 0) {
    return {
      hasLiquidity: false,
      assetSize: 0,
      quoteValue: 0,
      averagePrice: 0,
      limitPrice: 0,
    };
  }

  let remaining = amount;
  let filledAsset = 0;
  let filledQuote = 0;
  let limitPrice = 0;

  for (const level of levels) {
    if (remaining <= 0) break;

    const levelSize = Math.max(level.size, 0);
    const levelQuote = levelSize * level.price;
    if (levelSize <= 0 || level.price <= 0) continue;

    if (unit === "asset") {
      const takeSize = Math.min(levelSize, remaining);
      filledAsset += takeSize;
      filledQuote += takeSize * level.price;
      remaining -= takeSize;
      limitPrice = level.price;
      continue;
    }

    const takeQuote = Math.min(levelQuote, remaining);
    const takeSize = takeQuote / level.price;
    filledAsset += takeSize;
    filledQuote += takeQuote;
    remaining -= takeQuote;
    limitPrice = level.price;
  }

  return {
    hasLiquidity: remaining <= 1e-9,
    assetSize: filledAsset,
    quoteValue: filledQuote,
    averagePrice: filledAsset > 0 ? filledQuote / filledAsset : 0,
    limitPrice,
  };
}
