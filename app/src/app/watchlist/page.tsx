import { Metadata } from "next";
import { getPreStocksSafe } from "@/lib/prestocks/api";
import WatchlistFeed from "@/components/prestocks/WatchlistFeed";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Watchlist | Scouter",
  description:
    "Monitor saved PreStocks pre-IPO assets, track live token prices, and observe valuation changes.",
};

export const revalidate = 60;

export default async function WatchlistPage() {
  const { data: products, error } = await getPreStocksSafe();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label">
          <span className="text-on-surface-variant font-medium">Terminal</span>
          <span>/</span>
          <span className="text-on-surface">Watchlist</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
              PreStocks Watchlist
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1.5 leading-relaxed font-light">
              Track saved tokenised pre-IPO companies. Symbols are stored locally in your browser and matched with live PreStocks API data.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-on-surface-variant">
              Local Persistence &amp; Live Hydration
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Error State or Watchlist Feed */}
      {error ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
            <MaterialIcon icon="error" size="md" />
          </div>
          <h2 className="font-headline font-semibold text-lg text-on-surface">
            Unable to load live PreStocks data
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Saved symbols are safe, but the PreStocks API could not be reached to fetch current market metrics.
          </p>
          <div className="text-xs font-mono text-on-surface-variant/70 p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 break-all">
            {error}
          </div>
        </div>
      ) : (
        <WatchlistFeed allProducts={products} />
      )}
    </div>
  );
}
