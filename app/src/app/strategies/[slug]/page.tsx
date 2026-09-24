import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";

// In a real app, this would fetch from DB based on slug
export default async function StrategyDetailPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-8 max-w-[1440px] mx-auto">
        {/* Hero Header */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-label text-xs uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded-sm text-secondary">
                Low Risk
              </span>
              <span className="font-label text-xs uppercase tracking-widest bg-surface-container-high px-3 py-1 rounded-sm text-on-surface-variant">
                Active Vault
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-6 text-on-surface">
              Delta-Neutral USDC Basis
            </h1>
            <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl">
              Capture market inefficiencies by longing spot assets while
              simultaneously shorting perpetual futures. A market-neutral
              strategy optimized for stablecoin yield.
            </p>
          </div>
          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col gap-6">
            <div className="flex justify-between items-baseline">
              <span className="font-label text-sm text-on-surface-variant">
                Target APY
              </span>
              <span className="font-headline text-4xl font-bold text-primary">
                12.4% — 15.8%
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <span className="font-label text-sm text-on-surface-variant">
                Duration
              </span>
              <span className="font-body text-md font-semibold">
                Anytime Withdrawal
              </span>
            </div>
            <button className="primary-gradient w-full py-4 rounded-full text-on-primary font-headline font-extrabold text-lg shadow-lg">
              Deposit USDC
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Performance Chart */}
          <section className="lg:col-span-8 bg-surface-container-low rounded-xl p-8">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-headline text-2xl font-bold">
                Yield Performance
              </h2>
              <div className="flex gap-2">
                <button className="font-label text-xs bg-surface-container-lowest px-3 py-1 rounded-sm">
                  1M
                </button>
                <button className="font-label text-xs bg-primary text-on-primary px-3 py-1 rounded-sm">
                  ALL
                </button>
              </div>
            </div>
            {/* Chart */}
            <div className="relative h-80 w-full recessed-pocket rounded-lg flex items-end px-4 pb-8 overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, #4ef2b4 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 1000 300"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#66d4f6"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="#66d4f6"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M0,280 Q100,250 200,260 T400,200 T600,180 T800,120 T1000,80 L1000,300 L0,300 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,280 Q100,250 200,260 T400,200 T600,180 T800,120 T1000,80"
                  fill="none"
                  stroke="#66d4f6"
                  strokeWidth="3"
                />
                <circle cx="200" cy="260" fill="#66d4f6" r="4" />
                <circle cx="600" cy="180" fill="#66d4f6" r="4" />
                <circle cx="1000" cy="80" fill="#66d4f6" r="4" />
              </svg>
              <div className="absolute bottom-2 left-4 font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">
                Jan 2023
              </div>
              <div className="absolute bottom-2 right-4 font-label text-[10px] text-on-surface-variant uppercase tracking-tighter">
                Current
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Max Drawdown", value: "-0.42%" },
                { label: "Sharpe Ratio", value: "4.12" },
                { label: "Total TVL", value: "$42.8M" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-label text-xs text-on-surface-variant uppercase mb-1">
                    {stat.label}
                  </div>
                  <div className="font-headline font-bold text-xl">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Profile Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container rounded-xl p-6">
              <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
                <MaterialIcon icon="warning" className="text-error" />
                Risk Profile
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    num: "01",
                    title: "Smart Contract Risk",
                    desc: "Potential bugs in the underlying GMX and Aave protocols.",
                  },
                  {
                    num: "02",
                    title: "Negative Funding",
                    desc: "Basis spread could flip negative during extreme market stress.",
                  },
                  {
                    num: "03",
                    title: "De-pegging",
                    desc: "Strategy relies on stable peg maintenance of USDC/DAI.",
                  },
                ].map((risk) => (
                  <li key={risk.num} className="flex gap-4">
                    <span className="font-label font-bold text-primary">
                      {risk.num}
                    </span>
                    <div>
                      <h4 className="font-body font-semibold text-sm">
                        {risk.title}
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant">
                        {risk.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold mb-4">
                Counterparties
              </h3>
              <div className="flex flex-wrap gap-3">
                {["GMX v2", "Aave V3", "Uniswap"].map((cp) => (
                  <div
                    key={cp}
                    className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full"
                  >
                    <div className="w-4 h-4 rounded-full bg-white/10" />
                    <span className="font-label text-xs">{cp}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* How it Works */}
          <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            <div className="md:col-span-3">
              <h2 className="font-headline text-3xl font-bold mb-2">
                Institutional-Grade Execution
              </h2>
              <p className="font-body text-on-surface-variant">
                Our automated engine manages positions 24/7 across multiple
                liquidity pools.
              </p>
            </div>
            {[
              {
                icon: "account_balance_wallet",
                title: "1. Capital Deployment",
                desc: "USDC is split: 50% provides liquidity to GMX markets, while 50% is utilized for short positioning to maintain neutral delta.",
              },
              {
                icon: "rebase",
                title: "2. Continuous Rebalancing",
                desc: "The vault monitors funding rates and skew every 15 minutes, rebalancing short positions to minimize liquidation risk and maximize yield.",
              },
              {
                icon: "published_with_changes",
                title: "3. Yield Auto-compounding",
                desc: "Accrued funding fees and trading incentives are harvested daily and swapped back into USDC to grow your principal balance.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="recessed-pocket p-8 rounded-xl border border-outline-variant/10"
              >
                <MaterialIcon
                  icon={step.icon}
                  size="xl"
                  className="text-primary mb-4"
                />
                <h4 className="font-headline text-xl font-bold mb-3">
                  {step.title}
                </h4>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </section>

          {/* Proof of Reserves */}
          <section className="lg:col-span-8 bg-surface-container-low rounded-xl p-8">
            <h3 className="font-headline text-2xl font-bold mb-8">
              Proof of Reserves
            </h3>
            <div className="space-y-6">
              {[
                {
                  icon: "database",
                  label: "On-chain Collateral",
                  value: "$42,842,109.20",
                },
                {
                  icon: "token",
                  label: "Locked in GMX LP",
                  value: "$21,411,054.60",
                },
                {
                  icon: "receipt_long",
                  label: "Short Margin (USDC)",
                  value: "$21,431,054.60",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center bg-surface-container px-6 py-4 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <MaterialIcon icon={row.icon} className="text-secondary" />
                    <span className="font-body font-medium">{row.label}</span>
                  </div>
                  <span className="font-label font-bold text-on-surface">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="font-headline text-xl font-bold mb-6">
                Contract Addresses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Strategy Vault", addr: "0x4e...f2b4" },
                  { label: "Yield Controller", addr: "0x1f...d59a" },
                ].map((contract) => (
                  <div
                    key={contract.label}
                    className="bg-surface-container-lowest p-4 rounded-lg flex justify-between items-center group"
                  >
                    <div className="flex flex-col">
                      <span className="font-label text-[10px] uppercase text-on-surface-variant">
                        {contract.label}
                      </span>
                      <span className="font-label text-xs">
                        {contract.addr}
                      </span>
                    </div>
                    <MaterialIcon
                      icon="content_copy"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Fee Structure & FAQ */}
          <section className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container rounded-xl p-8">
              <h3 className="font-headline text-xl font-bold mb-6">
                Fee Structure
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Management Fee", value: "1.0% / year" },
                  { label: "Performance Fee", value: "10% of profit" },
                  { label: "Entry / Exit Fee", value: "0.00%" },
                ].map((fee) => (
                  <div key={fee.label} className="flex justify-between">
                    <span className="font-body text-sm text-on-surface-variant">
                      {fee.label}
                    </span>
                    <span className="font-label font-bold">{fee.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8">
              <h3 className="font-headline text-xl font-bold mb-6">
                FAQ
              </h3>
              <div className="space-y-6">
                <details className="group">
                  <summary className="list-none cursor-pointer flex justify-between items-center font-body font-semibold text-sm">
                    How does the delta-neutral strategy work?
                    <MaterialIcon
                      icon="expand_more"
                      className="group-open:rotate-180 transition-transform"
                    />
                  </summary>
                  <p className="pt-3 text-xs text-on-surface-variant leading-relaxed">
                    The vault holds a spot position in the underlying asset while
                    simultaneously shorting the equivalent perpetual future. This
                    neutralizes price exposure, and the yield comes from the
                    funding rate spread between the two positions.
                  </p>
                </details>
                <details className="group border-t border-outline-variant/10 pt-4">
                  <summary className="list-none cursor-pointer flex justify-between items-center font-body font-semibold text-sm">
                    What are the risks?
                    <MaterialIcon
                      icon="expand_more"
                      className="group-open:rotate-180 transition-transform"
                    />
                  </summary>
                  <p className="pt-3 text-xs text-on-surface-variant leading-relaxed">
                    The main risks are negative funding rates (where you pay
                    instead of earn), exchange counterparty risk, and smart
                    contract risk. The strategy is not exposed to directional
                    price movement.
                  </p>
                </details>
                <details className="group border-t border-outline-variant/10 pt-4">
                  <summary className="list-none cursor-pointer flex justify-between items-center font-body font-semibold text-sm">
                    Can I withdraw at any time?
                    <MaterialIcon
                      icon="expand_more"
                      className="group-open:rotate-180 transition-transform"
                    />
                  </summary>
                  <p className="pt-3 text-xs text-on-surface-variant leading-relaxed">
                    Yes — there is no lock-up period. Withdrawals are processed
                    as the vault unwinds the corresponding spot and perp
                    positions.
                  </p>
                </details>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
