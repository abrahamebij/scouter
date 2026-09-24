import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="text-center mb-24">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-surface-container-high border border-outline-variant/15">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
          LIVE ON ETHEREUM &amp; INK
        </span>
      </div>
      <h1 className="text-5xl md:text-8xl font-headline font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
        Prime Brokerage for <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-fixed to-secondary">
          Onchain Equities
        </span>
      </h1>
      <p className="text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto mb-12 leading-relaxed font-light">
        Unlock yield, leverage, and liquidity from your stock portfolio.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <Link
          href="/strategies"
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/10"
        >
          Explore Strategies
        </Link>
        <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-surface-container-highest text-on-surface font-semibold text-lg hover:bg-surface-variant transition-all border border-outline-variant/10">
          Onboard Stocks From Brokerage
        </button>
      </div>
    </section>
  );
}
