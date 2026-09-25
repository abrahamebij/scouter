import Link from "next/link";
import { fetchPreStocks } from "@/lib/prestocks/api";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { formatCurrency, formatCompactValuation, formatPercentage } from "@/lib/prestocks/format";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const revalidate = 60;

export default async function DashboardPage() {
  const products = await fetchPreStocks().catch(() => []);

  const totalValuation = products.reduce((acc, p) => acc + (p.impliedValuation || 0), 0);
  const highestPremium = [...products].sort((a, b) => b.premiumPercent - a.premiumPercent)[0];
  const lowestPremium = [...products].sort((a, b) => a.premiumPercent - b.premiumPercent)[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] uppercase tracking-wider text-accent font-semibold px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30">
              Authenticated Terminal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mt-2">
            Private Market Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-light mt-1">
            Real-time PreStocks secondary market pricing, implied valuations, and verified intelligence on Solana.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors"
          >
            <MaterialIcon icon="explore" size="sm" />
            <span>Discover Assets</span>
          </Link>

          <Link
            href="/dashboard/market/openai"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 transition-all shadow-sm"
          >
            <MaterialIcon icon="show_chart" size="sm" />
            <span>Open Market Terminal</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Active Markets
          </div>
          <div className="font-mono text-2xl font-bold text-on-surface">
            {products.length}
          </div>
          <div className="text-[11px] text-on-surface-variant/60 font-light">
            Tokenised private companies
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Total Implied Valuation
          </div>
          <div className="font-mono text-2xl font-bold text-accent">
            {formatCompactValuation(totalValuation)}
          </div>
          <div className="text-[11px] text-on-surface-variant/60 font-light">
            Aggregate secondary capitalization
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Highest Premium
          </div>
          <div className="font-mono text-2xl font-bold text-accent">
            {highestPremium ? formatPercentage(highestPremium.premiumPercent) : "—"}
          </div>
          <div className="text-[11px] text-on-surface-variant/60 font-light truncate">
            {highestPremium ? `${getCompanyName(highestPremium.name)} ($${highestPremium.symbol})` : "—"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-medium">
            Widest Discount
          </div>
          <div className="font-mono text-2xl font-bold text-secondary">
            {lowestPremium ? formatPercentage(lowestPremium.premiumPercent) : "—"}
          </div>
          <div className="text-[11px] text-on-surface-variant/60 font-light truncate">
            {lowestPremium ? `${getCompanyName(lowestPremium.name)} ($${lowestPremium.symbol})` : "—"}
          </div>
        </div>
      </div>

      {/* Main Markets Table */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-outline-variant/15 flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-base text-on-surface">
              Live PreStocks Secondary Markets
            </h2>
            <p className="text-xs text-on-surface-variant font-light mt-0.5">
              Select any market to inspect real-time metrics and interact with its contextual AI intelligence.
            </p>
          </div>

          <Link
            href="/dashboard/discover"
            className="text-xs font-headline font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <MaterialIcon icon="chevron_right" size="sm" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-outline-variant/15 bg-surface-container text-on-surface-variant/80 font-label uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Token Price</th>
                <th className="py-3 px-4">Mark Price</th>
                <th className="py-3 px-4">vs Mark</th>
                <th className="py-3 px-4">Implied Val</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-mono">
              {products.map((p) => {
                const name = getCompanyName(p.name);
                const isPremiumPositive = p.premiumPercent >= 0;

                return (
                  <tr
                    key={p.symbol}
                    className="hover:bg-surface-container-high/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <div className="font-headline font-semibold text-sm text-on-surface">
                            {name}
                          </div>
                          <div className="text-[10px] text-on-surface-variant/70">
                            ${p.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface font-semibold">
                      {formatCurrency(p.tokenPrice)}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {formatCurrency(p.markPrice)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          isPremiumPositive ? "text-accent" : "text-secondary"
                        }`}
                      >
                        {formatPercentage(p.premiumPercent)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-accent font-semibold">
                      {formatCompactValuation(p.impliedValuation)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/market/${p.symbol.toLowerCase()}`}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] font-headline font-medium text-on-surface transition-colors"
                        >
                          Terminal
                        </Link>
                        <Link
                          href={`/dashboard/company/${p.symbol.toLowerCase()}`}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-headline text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer & Platform Shortcuts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-accent">
              <MaterialIcon icon="code" size="sm" />
            </div>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Developer Platform &amp; SDK
            </h3>
            <p className="text-xs text-on-surface-variant font-light leading-relaxed">
              Build your own private-market trading terminals, monitors, and AI workflows using the Scouter SDK and REST API.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-xs font-headline font-semibold text-accent hover:underline"
            >
              <span>Explore Documentation</span>
              <MaterialIcon icon="arrow_forward" size="sm" />
            </Link>
            <Link
              href="/dashboard/settings/api-keys"
              className="text-xs font-headline text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Manage API Keys
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-accent">
              <MaterialIcon icon="psychology" size="sm" />
            </div>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Scouter AI Intelligence
            </h3>
            <p className="text-xs text-on-surface-variant font-light leading-relaxed">
              Ask natural language questions grounded in live PreStocks market figures and Google Search Grounding.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/intelligence"
              className="inline-flex items-center gap-1.5 text-xs font-headline font-semibold text-accent hover:underline"
            >
              <span>Launch AI Workspace</span>
              <MaterialIcon icon="arrow_forward" size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
