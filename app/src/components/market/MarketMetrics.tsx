import { PreStockDerived } from "@/lib/prestocks/types";
import {
  formatCurrency,
  formatCompactValuation,
  formatPercentage,
  formatSupply,
} from "@/lib/prestocks/format";

interface MarketMetricsProps {
  product: PreStockDerived;
}

export default function MarketMetrics({ product }: MarketMetricsProps) {
  const isPremiumPositive = product.premiumPercent >= 0;

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="border-b border-outline-variant/15 pb-3">
        <h2 className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">
          Market Data
        </h2>
        <p className="text-[11px] text-on-surface-variant font-light mt-0.5">
          Core trading metrics and benchmark valuations verified on Solana.
        </p>
      </div>

      {/* Grid of 6 Compact Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Token Price */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Token Price
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-on-surface">
            {formatCurrency(product.tokenPrice)}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/60">
            Secondary market
          </div>
        </div>

        {/* Mark Price */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Mark Price
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-on-surface">
            {formatCurrency(product.markPrice)}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/60">
            Benchmark appraisal
          </div>
        </div>

        {/* Premium / Discount */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Premium / Discount
          </div>
          <div
            className={`font-mono text-base sm:text-lg font-bold ${
              isPremiumPositive ? "text-accent" : "text-secondary"
            }`}
          >
            {formatPercentage(product.premiumPercent)}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/60">
            vs official mark
          </div>
        </div>

        {/* Implied Valuation */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Implied Valuation
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-accent">
            {formatCompactValuation(product.impliedValuation)}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/60">
            {formatCurrency(product.impliedValuation)}
          </div>
        </div>

        {/* Mark Valuation */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Mark Valuation
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-on-surface">
            {formatCompactValuation(product.markValuation)}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/60">
            {formatCurrency(product.markValuation)}
          </div>
        </div>

        {/* Token Supply */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Token Supply
          </div>
          <div className="font-mono text-base sm:text-lg font-bold text-on-surface">
            {formatSupply(product.supply)}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/60">
            SPL Tokens
          </div>
        </div>
      </div>
    </div>
  );
}
