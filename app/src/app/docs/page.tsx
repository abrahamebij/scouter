import { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Introduction | Scouter Developer Documentation",
  description:
    "Learn about Scouter, the private-market intelligence platform and developer tools for PreStocks data on Solana.",
};

export default function DocsIntroductionPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-2 pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-label uppercase tracking-widest text-accent font-semibold">
          Documentation
        </span>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
          Scouter Developer Platform
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant font-light leading-relaxed">
          Programmatic access to real-time pre-IPO secondary pricing, valuation benchmarks, and AI-powered private market intelligence.
        </p>
      </div>

      {/* Overview Block */}
      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-4 font-light">
        <h2 className="text-lg font-headline font-semibold text-on-surface">
          What is Scouter?
        </h2>
        <p>
          <strong className="text-on-surface font-semibold">Scouter</strong> is a dual-purpose platform: an elite research terminal for private-market investors and an open developer platform. It structures live PreStocks asset data trading on the Solana blockchain and pairs it with Google Search Grounding to deliver unprecedented transparency into private companies like OpenAI, Anthropic, SpaceX, and Anduril.
        </p>

        <h2 className="text-lg font-headline font-semibold text-on-surface pt-4">
          PreStocks Architecture &amp; Asset Exposure
        </h2>
        <p>
          PreStocks issues tokenised economic exposure tracking the valuation of private pre-IPO companies. Each token represents 1:1 backed exposure via Special Purpose Vehicles (SPVs) trading 24/7 on Solana.
        </p>
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 not-prose space-y-2">
          <div className="font-headline font-semibold text-xs text-on-surface">
            Key Metric Standards:
          </div>
          <ul className="space-y-1.5 text-xs text-on-surface-variant font-mono">
            <li>&bull; <strong className="text-on-surface">Token Price:</strong> Live 24/7 secondary market pricing on Solana.</li>
            <li>&bull; <strong className="text-on-surface">Mark Price:</strong> Institutional benchmark reference from official funding rounds.</li>
            <li>&bull; <strong className="text-on-surface">Implied Valuation:</strong> Market-clearing enterprise valuation derived from token pricing.</li>
            <li>&bull; <strong className="text-on-surface">Premium / Discount:</strong> Continuous percentage variance relative to the official mark.</li>
          </ul>
        </div>

        <h2 className="text-lg font-headline font-semibold text-on-surface pt-4">
          What Developers Can Build
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 not-prose pt-2">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-1.5">
            <MaterialIcon icon="monitoring" size="sm" className="text-accent" />
            <div className="font-headline font-semibold text-xs text-on-surface">
              Market Dashboards
            </div>
            <p className="text-xs text-on-surface-variant font-light">
              Embed live private-market pricing widgets into financial portals or DeFi dApps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-1.5">
            <MaterialIcon icon="notifications_active" size="sm" className="text-accent" />
            <div className="font-headline font-semibold text-xs text-on-surface">
              Monitoring &amp; Alert Bots
            </div>
            <p className="text-xs text-on-surface-variant font-light">
              Detect valuation shifts, premium expansions, or new secondary listings in automated webhooks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-1.5">
            <MaterialIcon icon="smart_toy" size="sm" className="text-accent" />
            <div className="font-headline font-semibold text-xs text-on-surface">
              Autonomous AI Agents
            </div>
            <p className="text-xs text-on-surface-variant font-light">
              Equip LLM agents with deterministic market tools to verify private asset valuations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 space-y-1.5">
            <MaterialIcon icon="terminal" size="sm" className="text-accent" />
            <div className="font-headline font-semibold text-xs text-on-surface">
              Algorithmic Trading Tools
            </div>
            <p className="text-xs text-on-surface-variant font-light">
              Execute statistical arbitrage models tracking secondary tokens vs benchmark marks.
            </p>
          </div>
        </div>
      </div>

      {/* Next Step Navigation */}
      <div className="pt-6 border-t border-outline-variant/15 flex justify-end">
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline font-semibold text-xs hover:brightness-95 transition-all shadow-sm"
        >
          <span>Next: Quickstart Guide</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>
      </div>
    </div>
  );
}
