import { Metadata } from "next";
import { getPreStocksSafe } from "@/lib/prestocks/api";
import ProductGrid from "@/components/prestocks/ProductGrid";
import MarketStatsStrip from "@/components/prestocks/MarketStatsStrip";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Discover Assets | Scouter",
  description:
    "Discover and research live PreStocks tokenised pre-IPO companies. Track secondary market pricing, implied valuations, and mark benchmarks.",
};

export const revalidate = 60;

export default async function DiscoverPage() {
  const { data: products, error } = await getPreStocksSafe();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Introduction */}
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label">
          <span className="text-on-surface-variant font-medium">Terminal</span>
          <span>/</span>
          <span className="text-on-surface">Discover</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
              PreStocks Discovery
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1.5 leading-relaxed font-light">
              Explore tokenised pre-IPO companies available through PreStocks on Solana. Research live secondary market token prices, evaluate implied valuations, and monitor deviations from official mark prices.
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

      {/* Main Content: Error State or Product Grid */}
      {error ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
            <MaterialIcon icon="error" size="md" />
          </div>
          <h2 className="font-headline font-semibold text-lg text-on-surface">
            Unable to load PreStocks data
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The PreStocks live API is currently unavailable or returning an unexpected response.
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
