import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import VaultPanel from "@/components/strategies/VaultPanel";
import VaultStats from "@/components/strategies/VaultStats";

const processSteps = [
  { num: "01", title: "Initial Deposit", desc: "User deposits xStock or USDC into the vault controller." },
  { num: "04", title: "Repay Flashloan", desc: "Borrow USDC on Tydro to repay flashloan." },
  { num: "02", title: "Flash Loan to Lever Up", desc: "Flash borrow USDC 2x the deposit which is swapped to xStock to achieve 3x leverage." },
  { num: "05", title: "Automated Rebalancing", desc: "Collateral and debt are rebalanced to maintain 3x leverage during market swings." },
  { num: "03", title: "Collateralize Lending Market", desc: "Supply xStock to Tydro as collateral." },
  { num: "06", title: "Tokenization", desc: "User receives vault share tokens which are composable with DeFi." },
];

const risks = [
  { title: "Market Risks", color: "text-error", items: ["Collateral liquidation during extreme volatility", "Amplified losses from 3x leverage", "Subject to volatile borrow rates"] },
  { title: "System Risks", color: "text-error", items: ["Oracle dependency (Chainlink)", "Smart contract vulnerability", "Keeper bot centralization risk"] },
  { title: "Execution Risks", color: "text-error", items: ["Swap slippage", "Rebalancing delay during congestion", "Lending pool liquidity constraints"] },
];

export default function TokenizedLeveragedETFPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Back */}
        <Link href="/strategies" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
          <MaterialIcon icon="arrow_back" size="sm" />
          Back to Strategies
        </Link>

        {/* Hero */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-5 mb-6">
              <div className="flex -space-x-3">
                <Image src="/protocols/tydro.jpg" alt="Tydro" width={48} height={48} className="rounded-full border-2 border-surface" unoptimized />
                <Image src="/coins/SP500.svg" alt="SPYx" width={48} height={48} className="rounded-full border-2 border-surface" unoptimized />
                <Image src="/coins/usdc.svg" alt="USDC" width={48} height={48} className="rounded-full border-2 border-surface" unoptimized />
              </div>
              <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface">
                3x Leveraged Equities
              </h1>
            </div>
            <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-8">
              Amplified exposure to equities with automated leverage and capital
              efficiency. Long-term leverage without the maintenance of perpetual
              futures. Auto-rebalancing to mitigate liquidation risk and maintain
              target leverage. Position is tokenized and usable as collateral.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Est. Net APY</p>
                <p className="text-2xl font-headline font-bold text-primary">~30.7%</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Risk Level</p>
                <p className="text-2xl font-headline font-bold text-error">High</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Duration</p>
                <p className="text-2xl font-headline font-bold text-on-surface">Ongoing</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">3x Leverage</span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">Auto-Rebalancing</span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">Tokenized Position</span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">Ink Chain</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-2">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-headline font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 active:scale-[0.98] transition-all duration-150">
                <Image src="/xStocks/spy.svg" alt="SPY" width={20} height={20} className="rounded-full" unoptimized />
                3x SPY
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-headline font-bold text-sm border border-outline-variant/20 hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150">
                <Image src="/xStocks/qqq.svg" alt="QQQ" width={20} height={20} className="rounded-full" unoptimized />
                3x QQQ
              </button>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
              More equities coming soon
            </p>
          </div>

          <VaultPanel />
        </header>

        {/* Chart */}
        <section className="bg-surface-container-low rounded-2xl p-8 mb-12 border border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h2 className="font-headline text-2xl font-bold mb-1">
                How returns are amplified
              </h2>
              <p className="text-on-surface-variant text-sm">
                Comparison of index vs strategy performance
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-outline" />
                <span className="font-label text-[10px] uppercase text-on-surface-variant">
                  SPX Index
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="font-label text-[10px] uppercase text-on-surface-variant">
                  3x Leveraged Strategy
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-96 w-full recessed-pocket rounded-xl border border-outline-variant/10 overflow-hidden chart-grid">
            <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
              <rect x="0" y="320" width="1000" height="80" fill="#93000a" fillOpacity="0.15" />
              <line x1="0" y1="320" x2="1000" y2="320" stroke="#ffb4ab" strokeDasharray="8 4" strokeWidth="1" />
              <path d="M0,200 L100,195 L200,205 L300,190 L400,185 L500,192 L600,180 L700,175 L800,185 L900,170 L1000,165" fill="none" stroke="#85948b" strokeWidth="2" opacity="0.6" />
              <path d="M0,200 L100,185 L200,215 L300,170 L400,155 L500,176 L600,140 L700,125 L800,155 L900,110 L1000,95" fill="none" stroke="#4ef2b4" strokeWidth="4" />
            </svg>
            <div className="absolute bottom-8 right-6 text-right">
              <div className="font-label text-[10px] text-error uppercase font-bold tracking-widest mb-1">
                Liquidation threshold zone
              </div>
              <div className="font-body text-[10px] text-on-surface-variant max-w-[240px] bg-surface-container-lowest/80 p-2 rounded-md backdrop-blur-sm border border-outline-variant/20">
                Auto-rebalancing helps maintain leverage and reduce liquidation risk, but cannot eliminate it.
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-12 py-8">
            <h2 className="font-headline text-2xl font-bold mb-8">
              Process &amp; Automation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processSteps.map((step) => (
                <div key={step.num} className="flex gap-6 p-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
                  <span className="font-headline text-4xl font-extrabold text-outline opacity-20 italic">
                    {step.num}
                  </span>
                  <div>
                    <h4 className="font-headline font-bold text-lg mb-1">{step.title}</h4>
                    <p className="text-sm text-on-surface-variant">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Risks */}
          <h2 className="lg:col-span-12 font-headline text-2xl font-bold mb-4">
            Risk Overview
          </h2>
          <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
            {risks.map((risk) => (
              <div key={risk.title} className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6">
                <h3 className={`font-headline font-bold text-xl mb-6 ${risk.color}`}>
                  {risk.title}
                </h3>
                <ul className="space-y-4 text-sm text-on-surface-variant">
                  {risk.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          {/* Vault Overview — live data from contract */}
          <section className="lg:col-span-8 bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
            <VaultStats />
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-xl font-bold mb-6">Counterparties</h3>
              <div className="flex flex-col gap-4">
                {[
                  { logo: "/protocols/tydro.jpg", name: "Tydro on Ink Chain", role: "Lending Protocol" },
                  { logo: "/protocols/chainlink.svg", name: "Chainlink", role: "Price Oracle" },
                  { logo: "/protocols/cowswap.svg", name: "Cowswap", role: "Swap Router" },
                ].map((cp) => (
                  <div key={cp.name} className="flex items-center gap-3">
                    <Image
                      src={cp.logo}
                      alt={cp.name}
                      width={32}
                      height={32}
                      className="rounded-lg flex-shrink-0"
                      unoptimized
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{cp.name}</span>
                      <span className="text-[10px] text-on-surface-variant">{cp.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-xl font-bold mb-6">Fee Structure</h3>
              <div className="space-y-4">
                {[
                  { label: "Borrow Rate", value: "4.2% variable" },
                  { label: "Protocol Fee", value: "0.1% / year" },
                ].map((fee) => (
                  <div key={fee.label} className="flex justify-between">
                    <span className="font-body text-sm text-on-surface-variant">{fee.label}</span>
                    <span className="font-label font-bold text-sm">{fee.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-xl font-bold mb-6">FAQ</h3>
              <div className="space-y-4">
                {[
                  { q: "Can the vault token be used elsewhere in DeFi?", a: "Yes — the vault token can be whitelisted for use as collateral on supported DEXs and lending platforms, making it composable with the broader DeFi ecosystem." },
                  { q: "How does this differ from using perps for leverage?", a: "Unlike perps with 8-hour funding rates, this vault uses on-chain borrow rates which are typically more stable and lower in cost." },
                  { q: "How does rebalancing work?", a: "When the index price moves, your leverage drifts away from 3x. Our keeper bots monitor the position and swap small portions to return it to exactly 3x." },
                ].map((faq, i) => (
                  <details key={faq.q} className={`group ${i > 0 ? "border-t border-outline-variant/10 pt-4" : ""}`}>
                    <summary className="list-none cursor-pointer flex justify-between items-center font-body font-semibold text-sm">
                      {faq.q}
                      <MaterialIcon icon="expand_more" className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="pt-3 text-xs text-on-surface-variant leading-relaxed">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
