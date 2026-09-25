import { PreStockDerived } from "@/lib/prestocks/types";
import {
  formatCompactValuation,
  formatCurrency,
  formatPercentage,
} from "@/lib/prestocks/format";
import { getCompanyName } from "@/lib/prestocks/transforms";

interface MarketStatsStripProps {
  products: PreStockDerived[];
}

export default function MarketStatsStrip({ products }: MarketStatsStripProps) {
  if (!products || products.length === 0) return null;

  const totalAssets = products.length;

  const highestValuationProduct = [...products].sort(
    (a, b) => b.impliedValuation - a.impliedValuation
  )[0];

  const highestPriceProduct = [...products].sort(
    (a, b) => b.tokenPrice - a.tokenPrice
  )[0];

  const avgPremium =
    products.reduce((acc, p) => acc + (p.premiumPercent || 0), 0) / totalAssets;

  const premiumCount = products.filter((p) => p.premiumPercent > 0.001).length;
  const discountCount = products.filter((p) => p.premiumPercent < -0.001).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* Total Tracked */}
      <div className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/15 flex flex-col justify-between">
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
          PreStocks Monitored
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-on-surface">
            {totalAssets}
          </span>
        </div>
        <div className="text-[11px] text-on-surface-variant/70 mt-1">
          {premiumCount} at premium, {discountCount} at discount
        </div>
      </div>

      {/* Highest Valuation */}
      <div className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/15 flex flex-col justify-between">
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
          Largest Implied Valuation
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-accent">
            {formatCompactValuation(highestValuationProduct?.impliedValuation || 0)}
          </span>
          <span className="font-mono text-xs text-on-surface-variant font-semibold">
            ${highestValuationProduct?.symbol}
          </span>
        </div>
        <div className="text-[11px] text-on-surface-variant/70 mt-1 truncate">
          {getCompanyName(highestValuationProduct?.name || "")}
        </div>
      </div>

      {/* Highest Token Price */}
      <div className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/15 flex flex-col justify-between">
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
          Highest Token Price
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-on-surface">
            {formatCurrency(highestPriceProduct?.tokenPrice || 0)}
          </span>
          <span className="font-mono text-xs text-on-surface-variant font-semibold">
            ${highestPriceProduct?.symbol}
          </span>
        </div>
        <div className="text-[11px] text-on-surface-variant/70 mt-1 truncate">
          {getCompanyName(highestPriceProduct?.name || "")}
        </div>
      </div>

      {/* Average Benchmark Variance */}
      <div className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/15 flex flex-col justify-between">
        <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
          Average vs Mark Price
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-mono text-xl font-bold text-on-surface">
            {formatPercentage(avgPremium)}
          </span>
        </div>
        <div className="text-[11px] text-on-surface-variant/70 mt-1">
          Relative to official mark benchmark
        </div>
      </div>
    </div>
  );
}
