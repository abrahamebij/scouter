"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PreStockDerived } from "@/lib/prestocks/types";
import { normalizeSymbol } from "@/lib/prestocks/transforms";
import { useWatchlist } from "@/lib/prestocks/watchlist";
import ProductCard from "./ProductCard";
import WatchlistChangeIndicator from "./WatchlistChangeIndicator";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { formatCompactValuation } from "@/lib/prestocks/format";

interface WatchlistFeedProps {
  allProducts: PreStockDerived[];
}

export default function WatchlistFeed({ allProducts }: WatchlistFeedProps) {
  const { symbols, isLoaded } = useWatchlist();

  // Match saved symbols with live PreStocks assets
  const watchlistProducts = useMemo(() => {
    if (!isLoaded || symbols.length === 0) return [];
    return symbols
      .map((sym) => allProducts.find((p) => normalizeSymbol(p.symbol) === sym))
      .filter((p): p is PreStockDerived => Boolean(p));
  }, [symbols, allProducts, isLoaded]);

  // Aggregate metrics for monitored companies
  const totalValuation = watchlistProducts.reduce(
    (acc, p) => acc + (p.impliedValuation || 0),
    0
  );

  if (!isLoaded) {
    return (
      <div className="py-20 text-center text-on-surface-variant flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-xs font-mono">Loading saved watchlist...</span>
      </div>
    );
  }

  if (watchlistProducts.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-surface-container-low/40 rounded-2xl border border-dashed border-outline-variant/30 max-w-lg mx-auto">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant">
          <MaterialIcon icon="bookmark_border" size="lg" />
        </div>
        <h3 className="font-headline font-semibold text-lg text-on-surface mb-2">
          Your Watchlist is empty
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-light">
          You haven&apos;t saved any PreStocks assets yet. Save companies from the Discover or Company pages to track their token prices and valuations.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 shadow-sm transition-all"
        >
          <MaterialIcon icon="explore" size="sm" />
          <span>Discover Companies</span>
        </Link>
      </div>
    );
  }

  // Generate compare query link if multiple saved
  const compareQuery = watchlistProducts
    .slice(0, 3)
    .map((p) => p.symbol)
    .join(",");

  return (
    <div className="space-y-6">
      {/* Watchlist Summary Bar */}
      <div className="bg-surface-container-low/80 p-4 sm:p-5 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline font-bold text-base text-on-surface">
              Monitored Assets ({watchlistProducts.length})
            </h2>
            <span className="text-[11px] font-mono text-accent bg-accent/8 border border-accent/15 px-2 py-0.5 rounded-full">
              Live Matched
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-light">
            Combined Implied Valuation:{" "}
            <span className="font-mono font-semibold text-on-surface">
              {formatCompactValuation(totalValuation)}
            </span>
          </p>
        </div>

        {watchlistProducts.length >= 2 && (
          <Link
            href={`/compare?symbols=${compareQuery}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors flex-shrink-0"
          >
            <MaterialIcon icon="compare_arrows" size="sm" />
            <span>Compare Saved Assets</span>
          </Link>
        )}
      </div>

      {/* Grid of Saved Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {watchlistProducts.map((product) => (
          <div key={product.symbol} className="flex flex-col gap-2">
            <ProductCard product={product} />
            <div className="px-3 py-1.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/15 flex items-center justify-between text-xs">
              <span className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80">
                Snapshot:
              </span>
              <WatchlistChangeIndicator product={product} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
