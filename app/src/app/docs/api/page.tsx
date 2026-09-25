import { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "REST API Reference | Scouter Developer Documentation",
  description:
    "Complete REST API reference for Scouter private market data endpoints.",
};

export default function DocsApiPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          API Reference
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          REST API Reference
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Standard HTTP endpoints returning real-time PreStocks private market metrics and snapshot history.
        </p>
      </div>

      <div className="space-y-10 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
        {/* Endpoint 1: GET /api/markets */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-accent/20 text-accent">
              GET
            </span>
            <code className="font-mono text-sm font-semibold text-on-surface">
              /api/markets
            </code>
          </div>
          <p>
            Returns all active tokenised pre-IPO companies currently trading on PreStocks via Solana.
          </p>

          <div className="space-y-1.5">
            <div className="font-headline font-semibold text-xs text-on-surface">
              Response (200 OK)
            </div>
            <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`{
  "success": true,
  "count": 10,
  "timestamp": 1727271400000,
  "data": [
    {
      "symbol": "OPENAI",
      "name": "OpenAI",
      "tokenPrice": 160.28,
      "markPrice": 152.99,
      "impliedValuation": 141807375452,
      "markValuation": 135354898004,
      "premiumPercent": 4.76,
      "priceDifference": 7.29,
      "supply": 11805.81,
      "contractAddress": "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
      "externalUrl": "https://prestocks.com/asset/openai"
    }
  ]
}`}
            </pre>
          </div>
        </div>

        {/* Endpoint 2: GET /api/markets/:symbol */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-accent/20 text-accent">
              GET
            </span>
            <code className="font-mono text-sm font-semibold text-on-surface">
              /api/markets/:symbol
            </code>
          </div>
          <p>
            Retrieves current live pricing, implied valuation, and benchmark mark pricing for a single asset.
          </p>

          <div className="space-y-1.5">
            <div className="font-headline font-semibold text-xs text-on-surface">
              URL Parameters
            </div>
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 font-mono text-xs">
              <span className="text-accent font-semibold">symbol</span>: PreStock asset symbol (case-insensitive, e.g. <code className="text-on-surface">openai</code>, <code className="text-on-surface">anthropic</code>, <code className="text-on-surface">spacex</code>).
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-headline font-semibold text-xs text-on-surface">
              Response (200 OK)
            </div>
            <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`{
  "success": true,
  "timestamp": 1727271400000,
  "data": {
    "symbol": "ANTHROPIC",
    "name": "Anthropic",
    "tokenPrice": 84.15,
    "markPrice": 89.00,
    "impliedValuation": 42075000000,
    "markValuation": 44500000000,
    "premiumPercent": -5.45,
    "priceDifference": -4.85,
    "supply": 500000.00,
    "contractAddress": "Prew...xyz",
    "externalUrl": "https://prestocks.com/asset/anthropic"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Endpoint 3: GET /api/markets/:symbol/history */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-accent/20 text-accent">
              GET
            </span>
            <code className="font-mono text-sm font-semibold text-on-surface">
              /api/markets/:symbol/history
            </code>
          </div>
          <p>
            Retrieves authentic snapshot observations recorded by the Scouter protocol engine.
          </p>

          <div className="space-y-1.5">
            <div className="font-headline font-semibold text-xs text-on-surface">
              Response (200 OK)
            </div>
            <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`{
  "success": true,
  "symbol": "OPENAI",
  "count": 1,
  "points": [
    {
      "symbol": "OPENAI",
      "timestamp": 1727271400000,
      "tokenPrice": 160.28,
      "markPrice": 152.99,
      "impliedValuation": 141807375452,
      "markValuation": 135354898004,
      "premiumPercent": 4.76,
      "supply": 11805.81
    }
  ],
  "source": "Scouter Solana Snapshot Engine"
}`}
            </pre>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-center text-xs">
        <Link
          href="/docs/authentication"
          className="inline-flex items-center gap-1.5 font-headline text-on-surface-variant hover:text-on-surface"
        >
          <MaterialIcon icon="arrow_back" size="sm" />
          <span>Authentication</span>
        </Link>
        <Link
          href="/docs/sdk"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold hover:brightness-95 transition-all shadow-sm"
        >
          <span>Next: TypeScript SDK</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>
      </div>
    </div>
  );
}
