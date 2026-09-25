import { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Quickstart | Scouter Developer Documentation",
  description:
    "Get started with the Scouter Developer SDK and REST API in less than 5 minutes.",
};

export default function DocsQuickstartPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          Getting Started
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          Quickstart Guide
        </h1>
        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
          Follow this 5-step guide to connect your application to Scouter&apos;s live private-market feed.
        </p>
      </div>

      {/* Step by step */}
      <div className="space-y-8 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
        {/* Step 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-accent text-surface-container-lowest font-headline font-bold text-xs flex items-center justify-center flex-shrink-0">
              1
            </span>
            <h2 className="text-base font-headline font-semibold text-on-surface">
              Connect Wallet &amp; Generate an API Key
            </h2>
          </div>
          <p className="pl-9">
            Access the Scouter Dashboard using your Solana wallet. Navigate to{" "}
            <Link
              href="/dashboard/settings/api-keys"
              className="text-accent underline hover:text-on-surface"
            >
              Settings &rarr; API Keys
            </Link>{" "}
            and generate your secret key (`scouter_live_...`).
          </p>
        </div>

        {/* Step 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-accent text-surface-container-lowest font-headline font-bold text-xs flex items-center justify-center flex-shrink-0">
              2
            </span>
            <h2 className="text-base font-headline font-semibold text-on-surface">
              Install the SDK
            </h2>
          </div>
          <p className="pl-9">
            Install the official TypeScript SDK into your Node.js or Next.js project:
          </p>
          <div className="pl-9">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface">
              npm install scouter-sdk
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-accent text-surface-container-lowest font-headline font-bold text-xs flex items-center justify-center flex-shrink-0">
              3
            </span>
            <h2 className="text-base font-headline font-semibold text-on-surface">
              Configure Your Environment
            </h2>
          </div>
          <p className="pl-9">
            Set your secret key in your environment variables (`.env.local`):
          </p>
          <div className="pl-9">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface">
              SCOUTER_API_KEY=&quot;scouter_live_your_secret_key_here&quot;
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-accent text-surface-container-lowest font-headline font-bold text-xs flex items-center justify-center flex-shrink-0">
              4
            </span>
            <h2 className="text-base font-headline font-semibold text-on-surface">
              Fetch Live Market Data
            </h2>
          </div>
          <p className="pl-9">
            Initialize the client and retrieve market metrics for OpenAI:
          </p>
          <div className="pl-9">
            <pre className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-xs text-on-surface overflow-x-auto">
{`import { Scouter } from "scouter-sdk";

const scouter = new Scouter({
  apiKey: process.env.SCOUTER_API_KEY,
});

async function main() {
  // Fetch single market
  const openai = await scouter.market("OPENAI").get();
  console.log(\`Token: $\${openai.tokenPrice} | Mark: $\${openai.markPrice}\`);
  console.log(\`Implied Valuation: $\${(openai.impliedValuation / 1e9).toFixed(1)}B\`);

  // Fetch all live markets
  const allMarkets = await scouter.markets();
  console.log(\`Tracked markets on Solana: \${allMarkets.length}\`);
}

main();`}
            </pre>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-center text-xs">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 font-headline text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <MaterialIcon icon="arrow_back" size="sm" />
          <span>Introduction</span>
        </Link>

        <Link
          href="/docs/api"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold hover:brightness-95 transition-all shadow-sm"
        >
          <span>Next: REST API Reference</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>
      </div>
    </div>
  );
}
