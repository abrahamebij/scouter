import { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Code Examples | Scouter Developer Documentation",
  description:
    "Production-ready code examples for building dashboards, monitors, and AI apps with Scouter.",
};

export default function DocsExamplesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          Implementation Recipes
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          Code Examples
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Production-tested recipes for React components, valuation monitoring, and AI agent integration.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
        {/* Example 1: React Component */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="widgets" size="sm" className="text-accent" />
            <h2 className="font-headline font-semibold text-sm text-on-surface">
              1. React / Next.js Live Market Card
            </h2>
          </div>
          <p>
            Create a live trading card displaying token price, benchmark mark, and premium vs mark:
          </p>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`"use client";

import { useEffect, useState } from "react";
import { Scouter, Market } from "scouter-sdk";

const scouter = new Scouter();

export function MarketCard({ symbol }: { symbol: string }) {
  const [market, setMarket] = useState<Market | null>(null);

  useEffect(() => {
    scouter.market(symbol).get().then(setMarket);
  }, [symbol]);

  if (!market) return <div>Loading \${symbol}...</div>;

  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 text-white">
      <div className="flex justify-between">
        <span className="font-bold">\${market.symbol}</span>
        <span className="text-emerald-400">\${market.tokenPrice.toFixed(2)}</span>
      </div>
      <div className="text-xs text-zinc-400 mt-2">
        Mark: \${market.markPrice.toFixed(2)} (\${market.premiumPercent}% vs mark)
      </div>
    </div>
  );
}`}
          </pre>
        </div>

        {/* Example 2: Market Monitor Script */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="trending_up" size="sm" className="text-accent" />
            <h2 className="font-headline font-semibold text-sm text-on-surface">
              2. Valuation Shift Monitor (Node.js Polling)
            </h2>
          </div>
          <p>
            Poll market prices every 60 seconds and log when secondary pricing moves significantly:
          </p>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`import { Scouter } from "scouter-sdk";

const scouter = new Scouter();
let lastValuation: number | null = null;

async function monitorOpenAI() {
  const data = await scouter.market("OPENAI").get();
  
  if (lastValuation !== null && lastValuation !== data.impliedValuation) {
    const delta = data.impliedValuation - lastValuation;
    console.log(\`[ALERT] OpenAI implied valuation shifted by $\${(delta / 1e9).toFixed(2)}B!\`);
  }
  
  lastValuation = data.impliedValuation;
  console.log(\`Current Implied Val: $\${(data.impliedValuation / 1e9).toFixed(1)}B\`);
}

setInterval(monitorOpenAI, 60000);
monitorOpenAI();`}
          </pre>
        </div>

        {/* Example 3: AI Prompt Integration */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="smart_toy" size="sm" className="text-accent" />
            <h2 className="font-headline font-semibold text-sm text-on-surface">
              3. Grounding LLM Prompts with Verified Market Data
            </h2>
          </div>
          <p>
            Inject live PreStocks metrics into AI agent system instructions to avoid financial hallucinations:
          </p>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`import { Scouter } from "scouter-sdk";

const scouter = new Scouter();

async function buildAiContext(symbol: string) {
  const asset = await scouter.market(symbol).get();
  
  return \`
### VERIFIED PRE-IPO DATA FOR \${asset.name} (\$\${asset.symbol})
- Token Price: $\${asset.tokenPrice.toFixed(2)} (Solana secondary)
- Benchmark Mark Price: $\${asset.markPrice.toFixed(2)}
- Implied Valuation: $\${(asset.impliedValuation / 1e9).toFixed(1)}B
- Premium to Mark: \${asset.premiumPercent.toFixed(2)}%
DO NOT hallucinate these valuation numbers.
\`;
}`}
          </pre>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-center text-xs">
        <Link
          href="/docs/explorer"
          className="inline-flex items-center gap-1.5 font-headline text-on-surface-variant hover:text-on-surface"
        >
          <MaterialIcon icon="arrow_back" size="sm" />
          <span>API Explorer</span>
        </Link>
        <Link
          href="/docs/assistant"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold hover:brightness-95 transition-all shadow-sm"
        >
          <span>Next: AI Developer Assistant</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>
      </div>
    </div>
  );
}
