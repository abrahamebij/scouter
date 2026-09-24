import { PreStockDerived } from "@/lib/prestocks/types";
import {
  formatCurrency,
  formatCompactValuation,
  formatSupply,
} from "@/lib/prestocks/format";
import PremiumBadge from "./PremiumBadge";

interface TokenMetricsProps {
  product: PreStockDerived;
}

export default function TokenMetrics({ product }: TokenMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-headline font-bold text-on-surface">
          Token &amp; Valuation Metrics
        </h2>
        <span className="text-[11px] font-mono text-on-surface-variant/70">
          Source: PreStocks Live API
        </span>
      </div>

      {/* Primary 4-card metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Price */}
        <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 relative overflow-hidden">
          <div className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">
            Token Price
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface font-mono">
            {formatCurrency(product.tokenPrice)}
          </div>
          <div className="text-[11px] text-on-surface-variant/70 mt-1">
            Current secondary market token price
          </div>
        </div>

        {/* Mark Price */}
        <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">
            Mark Price
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface-variant font-mono">
            {formatCurrency(product.markPrice)}
          </div>
          <div className="text-[11px] text-on-surface-variant/70 mt-1">
            Official benchmark reference price
          </div>
        </div>

        {/* Implied Valuation */}
        <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">
            Implied Valuation
          </div>
          <div
            className="text-2xl font-headline font-bold text-primary font-mono"
            title={formatCurrency(product.impliedValuation)}
          >
            {formatCompactValuation(product.impliedValuation)}
          </div>
          <div className="text-[11px] text-on-surface-variant/70 mt-1">
            Valuation implied by current token price
          </div>
        </div>

        {/* Mark Valuation */}
        <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">
            Mark Valuation
          </div>
          <div
            className="text-2xl font-headline font-bold text-on-surface-variant font-mono"
            title={formatCurrency(product.markValuation)}
          >
            {formatCompactValuation(product.markValuation)}
          </div>
          <div className="text-[11px] text-on-surface-variant/70 mt-1">
            Benchmark mark valuation
          </div>
        </div>
      </div>

      {/* Detailed Comparison & Supply Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Premium / Discount Detailed Panel */}
        <div className="p-5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-label uppercase tracking-wider text-on-surface font-semibold">
              Premium / Discount vs Mark
            </h3>
            <PremiumBadge premiumPercent={product.premiumPercent} size="lg" />
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Calculated as the percentage difference between the current token trading price and the official PreStocks mark reference.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/10 text-xs">
            <div>
              <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80">
                Price Difference
              </div>
              <div className="font-mono text-sm text-on-surface font-semibold mt-0.5">
                {product.priceDifference >= 0 ? "+" : ""}
                {formatCurrency(product.priceDifference)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80">
                Valuation Difference
              </div>
              <div className="font-mono text-sm text-on-surface font-semibold mt-0.5">
                {product.valuationDifference >= 0 ? "+" : ""}
                {formatCompactValuation(product.valuationDifference)}
              </div>
            </div>
          </div>
        </div>

        {/* Token Supply & Solana Structure */}
        <div className="p-5 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-label uppercase tracking-wider text-on-surface font-semibold">
              Token Supply &amp; Structure
            </h3>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/20 text-on-surface font-semibold">
              Solana SPL
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs text-on-surface-variant">Circulating Supply:</span>
            <span className="font-mono text-lg font-bold text-on-surface">
              {formatSupply(product.supply)} {product.symbol}
            </span>
          </div>

          <div className="text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-3">
            Tokens are backed 1:1 by SPV exposure tracking the company valuation and trade 24/7 on Solana.
          </div>
        </div>
      </div>
    </div>
  );
}
