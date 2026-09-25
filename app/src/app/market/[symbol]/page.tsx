import { Metadata } from "next";
import Link from "next/link";
import { getPreStockBySymbol, fetchPreStocks } from "@/lib/prestocks/api";
import { normalizeSymbol, getCompanyName } from "@/lib/prestocks/transforms";
import CompanySelector from "@/components/market/CompanySelector";
import MarketTerminalHeader from "@/components/market/MarketTerminalHeader";
import MarketChart from "@/components/market/MarketChart";
import MarketMetrics from "@/components/market/MarketMetrics";
import MarketCompanyInfo from "@/components/market/MarketCompanyInfo";
import MarketTerminalIntelligence from "@/components/market/MarketTerminalIntelligence";
import WhatChanged from "@/components/prestocks/WhatChanged";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface MarketPageProps {
  params: Promise<{ symbol: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: MarketPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const product = await getPreStockBySymbol(symbol);

  if (!product) {
    return {
      title: `${symbol.toUpperCase()} | Market Not Found | Scouter`,
      description: `Market ${symbol.toUpperCase()} not found on Scouter.`,
    };
  }

  const companyName = getCompanyName(product.name);
  return {
    title: `${companyName} ($${product.symbol}) | Market Terminal | Scouter`,
    description: `Real-time PreStocks terminal for ${companyName} with live token pricing, valuation benchmarks, and contextual AI intelligence.`,
  };
}

export default async function MarketTerminalPage({ params }: MarketPageProps) {
  const { symbol } = await params;
  const [product, allProducts] = await Promise.all([
    getPreStockBySymbol(symbol),
    fetchPreStocks().catch(() => []),
  ]);

  // Invalid symbol / Market not found (Phase 24)
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant">
          <MaterialIcon icon="storefront" size="lg" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            Market Not Found
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto font-light">
            No active PreStocks market matches &ldquo;<span className="font-mono text-on-surface">{symbol}</span>&rdquo;.
          </p>
        </div>

        {allProducts.length > 0 && (
          <div className="pt-4 max-w-lg mx-auto">
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant/80 mb-3">
              Available PreStocks Markets:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allProducts.map((p) => (
                <Link
                  key={p.symbol}
                  href={`/market/${p.symbol.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-mono font-medium text-on-surface hover:text-on-surface hover:border-outline/50 transition-colors"
                >
                  ${p.symbol}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface hover:text-primary transition-colors"
          >
            <MaterialIcon icon="arrow_back" size="sm" />
            <span>Return to Discover</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Terminal Bar (Company Selector & Quick Nav) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-outline-variant/15">
        <div className="flex items-center gap-3">
          <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant/70 font-semibold hidden sm:inline">
            Terminal
          </span>
          <CompanySelector currentSymbol={product.symbol} products={allProducts} />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href={`/company/${normalizeSymbol(product.symbol)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 font-headline font-medium text-on-surface transition-colors"
          >
            <MaterialIcon icon="article" size="sm" />
            <span>Classic Profile</span>
          </Link>

          <Link
            href={`/compare?symbols=${normalizeSymbol(product.symbol)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 font-headline font-medium text-on-surface transition-colors"
          >
            <MaterialIcon icon="compare_arrows" size="sm" />
            <span>Compare</span>
          </Link>
        </div>
      </div>

      {/* Main Terminal Grid: 2/3 Market View, 1/3 Intelligence Chat (Phases 3 & 23) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Market Area (~66% width) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Market Header */}
          <MarketTerminalHeader product={product} />

          {/* Market Chart */}
          <MarketChart product={product} />

          {/* Market Metrics */}
          <MarketMetrics product={product} />

          {/* What Changed? Snapshot Comparison */}
          <WhatChanged product={product} />

          {/* Company Intelligence & Activity Timeline */}
          <MarketCompanyInfo product={product} />
        </div>

        {/* Right Column: Contextual Company Intelligence Panel (~34% width) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20">
          <MarketTerminalIntelligence product={product} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}
