import { Metadata } from "next";
import { getPreStocksSafe } from "@/lib/prestocks/api";
import { normalizeSymbol } from "@/lib/prestocks/transforms";
import CompareTable from "@/components/prestocks/CompareTable";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Compare Assets | Scouter",
  description:
    "Direct side-by-side comparison of PreStocks tokenised pre-IPO assets. Compare valuations, token prices, and mark benchmarks.",
};

export const revalidate = 60;

interface ComparePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { data: products, error } = await getPreStocksSafe();
  const params = await searchParams;

  // Extract initial symbols from query string (e.g. ?symbols=OPENAI,ANTHROPIC or ?symbols=OPENAI)
  let initialSymbols: string[] = [];
  if (params?.symbols) {
    const raw = typeof params.symbols === "string" ? params.symbols : params.symbols[0];
    if (raw) {
      initialSymbols = raw
        .split(",")
        .map((s) => normalizeSymbol(s))
        .filter(Boolean);
    }
  }

  // If only 1 symbol passed from query, add another available product to compare
  if (initialSymbols.length === 1 && products.length > 1) {
    const second = products.find((p) => normalizeSymbol(p.symbol) !== initialSymbols[0]);
    if (second) {
      initialSymbols.push(normalizeSymbol(second.symbol));
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 pb-6 border-b border-outline-variant/15">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label">
          <span className="text-on-surface-variant font-medium">Terminal</span>
          <span>/</span>
          <span className="text-on-surface">Compare</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
              PreStocks Comparison Terminal
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl mt-1.5 leading-relaxed font-light">
              Conduct objective side-by-side metric research on tokenised pre-IPO assets. Compare secondary token prices, implied valuations, and benchmark mark variance.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-on-surface-variant">
              Live Comparative Feed
            </span>
          </div>
        </div>
      </div>

      {/* Main Table or Error State */}
      {error ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-error/30 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center">
            <MaterialIcon icon="error" size="md" />
          </div>
          <h2 className="font-headline font-semibold text-lg text-on-surface">
            Unable to load comparison data
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The PreStocks live data feed could not be reached to perform side-by-side asset comparison.
          </p>
          <div className="text-xs font-mono text-on-surface-variant/70 p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 break-all">
            {error}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-low/40 rounded-2xl border border-dashed border-outline-variant/30">
          <p className="text-sm">No PreStocks assets are currently available for comparison.</p>
        </div>
      ) : (
        <CompareTable products={products} initialSymbols={initialSymbols} />
      )}

      {/* Research Disclaimer */}
      <div className="bg-surface-container-lowest/80 rounded-2xl border border-outline-variant/15 p-6 text-xs text-on-surface-variant space-y-2">
        <h4 className="font-label uppercase tracking-wider text-[11px] text-on-surface font-bold">
          Side-by-Side Research Standards
        </h4>
        <p className="leading-relaxed">
          Scouter presents objective PreStocks secondary market prices alongside official mark prices. Comparisons do not rank, rate, score, or endorse any asset.
        </p>
      </div>
    </div>
  );
}
