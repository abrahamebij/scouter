"use client";

import { PreStockDerived } from "@/lib/prestocks/types";
import { useCompanySnapshot } from "@/lib/prestocks/snapshots";
import { formatCompactValuation, formatCurrency } from "@/lib/prestocks/format";

interface WatchlistChangeIndicatorProps {
  product: PreStockDerived;
}

export default function WatchlistChangeIndicator({ product }: WatchlistChangeIndicatorProps) {
  const { change, isLoaded } = useCompanySnapshot(product);

  if (!isLoaded || !change) {
    return (
      <span className="text-[10px] font-mono text-on-surface-variant/60">
        Baseline active
      </span>
    );
  }

  if (!change.hasChanges) {
    return (
      <span className="text-[10px] font-mono text-on-surface-variant/70">
        No metric shift since last check
      </span>
    );
  }

  if (Math.abs(change.impliedValuationChange) > 1e6) {
    return (
      <span
        className={`text-[11px] font-mono font-semibold ${
          change.impliedValuationChange >= 0 ? "text-accent" : "text-error"
        }`}
      >
        {change.impliedValuationChange >= 0 ? "+" : ""}
        {formatCompactValuation(change.impliedValuationChange)} val delta
      </span>
    );
  }

  return (
    <span
      className={`text-[11px] font-mono font-semibold ${
        change.tokenPriceChange >= 0 ? "text-accent" : "text-error"
      }`}
    >
      {change.tokenPriceChange >= 0 ? "+" : ""}
      {formatCurrency(change.tokenPriceChange)} price delta
    </span>
  );
}
