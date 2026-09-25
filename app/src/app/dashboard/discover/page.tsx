import { Metadata } from "next";
import { getPreStocksSafe } from "@/lib/prestocks/api";
import ProductGrid from "@/components/prestocks/ProductGrid";
import MarketStatsStrip from "@/components/prestocks/MarketStatsStrip";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Discover Assets | Dashboard | Scouter",
  description:
    "Discover and research live PreStocks tokenised pre-IPO companies inside the Scouter Dashboard.",
};

export const revalidate = 60;

export default async function DashboardDiscoverPage() {
  const { data: products, error } = await getPreStocksSafe();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              PreStocks Discovery
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed font-light">
              Explore tokenised pre-IPO companies available through PreStocks on Solana. Research live secondary token prices, evaluate implied valuations, and monitor deviations from benchmark mark prices.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-on-surface-variant">
              {products.length} {products.length === 1 ? "Asset" : "Assets"} Live
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
            <MaterialIcon icon="error" size="md" />
          </div>
          <h2 className="font-headline font-semibold text-lg text-on-surface">
            Unable to load PreStocks data
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed font-light">
            The PreStocks live API is currently unavailable.
          </p>
          <div className="text-xs font-mono text-on-surface-variant/70 p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 break-all">
            {error}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <MarketStatsStrip products={products} />
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
