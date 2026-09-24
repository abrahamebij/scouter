import { Metadata } from "next";
import Link from "next/link";
import { getPreStockBySymbol, fetchPreStocks } from "@/lib/prestocks/api";
import { normalizeSymbol, getCompanyName } from "@/lib/prestocks/transforms";
import CompanyHeader from "@/components/prestocks/CompanyHeader";
import TokenMetrics from "@/components/prestocks/TokenMetrics";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface CompanyPageProps {
  params: Promise<{ symbol: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const product = await getPreStockBySymbol(symbol);

  if (!product) {
    return {
      title: `${symbol.toUpperCase()} | Not Found | Scouter`,
      description: `Asset ${symbol.toUpperCase()} not found on PreStocks.`,
    };
  }

  const companyName = getCompanyName(product.name);
  return {
    title: `${companyName} ($${product.symbol}) | Scouter`,
    description: `PreStocks token metrics, implied valuation, and benchmark mark pricing for ${companyName} on Solana.`,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { symbol } = await params;
  const product = await getPreStockBySymbol(symbol);

  if (!product) {
    // Retrieve all valid symbols to help the user navigate
    let allSymbols: string[] = [];
    try {
      const all = await fetchPreStocks();
      allSymbols = all.map((a) => a.symbol);
    } catch {
      // Fallback
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant">
          <MaterialIcon icon="travel_explore" size="lg" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            Asset Not Found
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            No PreStocks asset matches symbol &ldquo;<span className="font-mono text-on-surface">{symbol}</span>&rdquo;.
          </p>
        </div>

        {allSymbols.length > 0 && (
          <div className="pt-4 max-w-lg mx-auto">
            <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant/80 mb-3">
              Available PreStocks Companies:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allSymbols.map((sym) => (
                <Link
                  key={sym}
                  href={`/company/${sym.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-mono font-medium text-on-surface hover:text-primary hover:border-primary/40 transition-colors"
                >
                  ${sym}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Company Header & Identity */}
      <CompanyHeader product={product} />

      {/* Main Token & Valuation Metrics Grid */}
      <TokenMetrics product={product} />

      {/* Action Banner: Compare with other PreStocks */}
      <div className="bg-surface-container-low/60 rounded-2xl border border-outline-variant/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline font-bold text-base text-on-surface">
            Compare with other PreStocks companies
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Evaluate {getCompanyName(product.name)} side-by-side with other private market assets.
          </p>
        </div>

        <Link
          href={`/compare?symbols=${normalizeSymbol(product.symbol)}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-primary transition-colors flex-shrink-0"
        >
          <MaterialIcon icon="compare_arrows" size="sm" />
          <span>Compare ${product.symbol}</span>
        </Link>
      </div>

      {/* Educational PreStocks Mechanics Disclaimer */}
      <div className="bg-surface-container-lowest/80 rounded-2xl border border-outline-variant/15 p-6 text-xs text-on-surface-variant space-y-2">
        <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface font-bold">
          PreStocks Asset Structure Notice
        </h4>
        <p className="leading-relaxed">
          The <span className="font-mono text-on-surface font-medium">${product.symbol}</span> token is issued through PreStocks and backed 1:1 by SPV exposure tracking the valuation of {getCompanyName(product.name)}. PreStocks tokens trade 24/7 on the Solana blockchain.
        </p>
        <p className="leading-relaxed text-[11px] text-on-surface-variant/70">
          PreStocks tokens represent synthetic economic exposure rather than direct registered equity or shareholder ownership. Mark prices are provided as benchmark reference points.
        </p>
      </div>
    </div>
  );
}
