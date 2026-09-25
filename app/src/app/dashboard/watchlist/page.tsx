import { Metadata } from "next";
import { getPreStocksSafe } from "@/lib/prestocks/api";
import WatchlistFeed from "@/components/prestocks/WatchlistFeed";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Watchlist | Dashboard | Scouter",
  description:
    "Monitor saved PreStocks pre-IPO assets, track live token prices, and observe valuation changes inside the Scouter Dashboard.",
};

export const revalidate = 60;

export default async function DashboardWatchlistPage() {
  const { data: products, error } = await getPreStocksSafe();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              PreStocks Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed font-light">
              Track your saved tokenised pre-IPO companies. Symbols are monitored with live PreStocks secondary market pricing on Solana.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-on-surface-variant">
              Live Feed
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
            Unable to load live PreStocks data
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed font-light">
            Saved symbols are safe, but the PreStocks API could not be reached.
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
