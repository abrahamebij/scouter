import { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "TypeScript SDK | Scouter Developer Documentation",
  description:
    "Official TypeScript SDK reference for building private market applications with Scouter.",
};

export default function DocsSdkPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          Developer SDK
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          TypeScript SDK (`scouter-sdk`)
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Lightweight, strongly typed client for querying PreStocks assets, calculating premiums, and streaming market intelligence.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
        {/* Installation */}
        <div className="space-y-2">
          <h2 className="text-base font-headline font-semibold text-on-surface">
            Installation
          </h2>
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface">
            npm install scouter-sdk
          </div>
        </div>

        {/* Initialization */}
        <div className="space-y-2">
          <h2 className="text-base font-headline font-semibold text-on-surface">
            Initialization
          </h2>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface overflow-x-auto">
{`import { Scouter } from "scouter-sdk";

// Initialize with environment API key
const scouter = new Scouter({
  apiKey: process.env.SCOUTER_API_KEY,
  // Optional custom baseUrl (defaults to production):
  // baseUrl: "https://scouter-tool.vercel.app"
});`}
          </pre>
        </div>

        {/* Method 1: scouter.markets() */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
          <code className="font-mono text-sm font-semibold text-accent block">
            scouter.markets(): Promise&lt;Market[]&gt;
          </code>
          <p>
            Retrieves the full directory of active PreStocks markets with live secondary prices and official benchmark valuations.
          </p>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`const markets = await scouter.markets();
for (const m of markets) {
  console.log(\`$\${m.symbol}: \${m.name} | Token: $\${m.tokenPrice} | Mark: $\${m.markPrice}\`);
}`}
          </pre>
        </div>

        {/* Method 2: scouter.market(symbol).get() */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
          <code className="font-mono text-sm font-semibold text-accent block">
            scouter.market(symbol).get(): Promise&lt;Market&gt;
          </code>
          <p>
            Fetches live pricing, supply, and implied valuation for a specific company symbol.
          </p>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`const openai = await scouter.market("OPENAI").get();
console.log(openai.impliedValuation); // 141807375452
console.log(openai.premiumPercent);   // 4.76`}
          </pre>
        </div>

        {/* Method 3: scouter.market(symbol).history() */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
          <code className="font-mono text-sm font-semibold text-accent block">
            scouter.market(symbol).history(): Promise&lt;MarketHistoryPoint[]&gt;
          </code>
          <p>
            Fetches authentic snapshot history points for charting or delta calculation.
          </p>
          <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 font-mono text-xs text-on-surface overflow-x-auto">
{`const history = await scouter.market("OPENAI").history();
console.log(\`Captured \${history.length} snapshot points\`);`}
          </pre>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-center text-xs">
        <Link
          href="/docs/api"
          className="inline-flex items-center gap-1.5 font-headline text-on-surface-variant hover:text-on-surface"
        >
          <MaterialIcon icon="arrow_back" size="sm" />
          <span>REST API</span>
        </Link>
        <Link
          href="/docs/explorer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold hover:brightness-95 transition-all shadow-sm"
        >
          <span>Next: API Explorer</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>
      </div>
    </div>
  );
}
