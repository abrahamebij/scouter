import { getPreStocksSafe } from "@/lib/prestocks/api";
import { formatCompactValuation, formatPercentage } from "@/lib/prestocks/format";
import ProductGrid from "@/components/prestocks/ProductGrid";
import MaterialIcon from "@/components/ui/MaterialIcon";
import HeroSection from "@/components/home/HeroSection";

export const revalidate = 60;

export default async function HomePage() {
  const { data: products, error } = await getPreStocksSafe();

  // Aggregate market overview metrics from current live dataset
  const totalAssets = products.length;
  const totalImpliedValuation = products.reduce(
    (acc, p) => acc + (p.impliedValuation || 0),
    0
  );
  const avgPremium =
    totalAssets > 0
      ? products.reduce((acc, p) => acc + (p.premiumPercent || 0), 0) / totalAssets
      : 0;

  return (
    <div className="-mt-16 pb-16 space-y-12 sm:space-y-16 w-full overflow-x-hidden">
      {/* Full Screen-Filling Hero Section */}
      <HeroSection />

      {/* Main Content Constrained to max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Live Market Snapshot Stats */}
      {products.length > 0 && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Assets Tracked
            </div>
            <div className="font-mono text-2xl font-bold text-on-surface">
              {totalAssets} Companies
            </div>
            <div className="text-[11px] text-on-surface-variant/70 mt-1 font-label">
              Live PreStocks feed
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Combined Implied Valuation
            </div>
            <div className="font-mono text-2xl font-bold text-accent">
              {formatCompactValuation(totalImpliedValuation)}
            </div>
            <div className="text-[11px] text-on-surface-variant/70 mt-1 font-label">
              Aggregated across all tokens
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Average Premium vs Mark
            </div>
            <div className="font-mono text-2xl font-bold text-on-surface">
              {formatPercentage(avgPremium)}
            </div>
            <div className="text-[11px] text-on-surface-variant/70 mt-1 font-label">
              Benchmark variance
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Network &amp; Collateral
            </div>
            <div className="font-mono text-xl font-bold text-on-surface">
              Solana SPL
            </div>
            <div className="text-[11px] text-on-surface-variant/70 mt-1 font-label">
              1:1 SPV exposure
            </div>
          </div>
        </section>
      )}

      {/* Main Assets Section */}
      <section id="catalog" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              PreStocks Asset Catalog
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live secondary market pricing vs official PreStocks mark references.
            </p>
          </div>
          <span className="text-xs font-mono text-on-surface-variant/70">
            Auto-refreshes every 60s
          </span>
        </div>

        {error ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
              <MaterialIcon icon="error" size="md" />
            </div>
            <h3 className="font-headline font-semibold text-on-surface">
              Unable to load PreStocks data
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              {error}
            </p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
      </div>
    </div>
  );
}
