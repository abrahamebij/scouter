import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialIcon from "@/components/ui/MaterialIcon";
import CarryVaultPanel from "@/components/strategies/CarryVaultPanel";
import CarryVaultStats from "@/components/strategies/CarryVaultStats";

const processSteps = [
  { num: "01", title: "Collateralize SPYx", desc: "Deposit SPYx tokens as collateral into the Morpho SPYx/aUSD lending market." },
  { num: "02", title: "Borrow aUSD", desc: "Borrow aUSD against your SPYx collateral at the market borrow rate." },
  { num: "03", title: "Deposit into Flowdesk Vault", desc: "Supply borrowed aUSD into the Morpho Flowdesk aUSD RWA Strategy vault to earn yield." },
  { num: "04", title: "Earn the Spread", desc: "Profit from the difference between the vault yield and the borrow cost on aUSD." },
  { num: "05", title: "Monitor Health Factor", desc: "Maintain a safe collateral ratio to avoid liquidation on the SPYx/aUSD market." },
  { num: "06", title: "Unwind Position", desc: "Withdraw aUSD from vault, repay borrow, and reclaim SPYx collateral." },
];

const risks = [
  { title: "Market Risks", color: "text-error", items: ["SPYx price decline reducing collateral value", "Borrow rate spikes narrowing or inverting the spread", "aUSD depeg risk affecting both borrow and deposit sides"] },
  { title: "System Risks", color: "text-error", items: ["Morpho smart contract vulnerability", "Flowdesk vault strategy risk", "Oracle dependency for SPYx pricing"] },
  { title: "Execution Risks", color: "text-error", items: ["Liquidation if health factor drops below threshold", "Vault withdrawal delays or liquidity constraints", "Gas cost erosion on smaller positions"] },
];

export default function AusdCarryTradePage() {
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
                <Image src="/protocols/morpho.svg" alt="Morpho" width={48} height={48} className="rounded-full border-2 border-surface" unoptimized />
                <Image src="/coins/AUSD.jpg" alt="aUSD" width={48} height={48} className="rounded-full border-2 border-surface" unoptimized />
                <Image src="/coins/SP500.svg" alt="SPYx" width={48} height={48} className="rounded-full border-2 border-surface" unoptimized />
              </div>
              <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface">
                USD Carry Trade
              </h1>
            </div>
            <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-8">
              A stablecoin carry trade on Morpho. Borrow aUSD against SPYx collateral at a low rate and deposit it into the Flowdesk aUSD RWA Strategy vault for a higher yield. Profit from the spread between borrow cost and vault APY.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Est. Net APY</p>
                <p className="text-2xl font-headline font-bold text-primary">~12.7%</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Risk Level</p>
                <p className="text-2xl font-headline font-bold text-secondary">Moderate</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10">
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Duration</p>
                <p className="text-2xl font-headline font-bold text-on-surface">Ongoing</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">Stablecoin Yield</span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">Morpho Lending</span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">RWA Strategy</span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/10 text-xs text-on-surface-variant font-medium">SPYx Collateral</span>
            </div>
          </div>

          <CarryVaultPanel />
        </header>

        {/* How It Works Diagram */}
        <section className="bg-surface-container-low rounded-2xl p-8 mb-12 border border-outline-variant/10">
          <div className="mb-10">
            <h2 className="font-headline text-2xl font-bold mb-1">How It Works</h2>
            <p className="text-on-surface-variant text-sm">Capital flow through the carry trade</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 py-8">
            {/* SPYx */}
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden">
                <Image src="/coins/SP500.svg" alt="SPYx" width={40} height={40} unoptimized />
              </div>
              <span className="font-headline font-bold text-sm">SPYx</span>
              <span className="text-[10px] text-on-surface-variant">Collateral</span>
            </div>

            <MaterialIcon icon="arrow_forward" className="text-outline text-2xl rotate-90 md:rotate-0" />

            {/* Morpho Borrow */}
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden">
                <Image src="/protocols/morpho.svg" alt="Morpho" width={40} height={40} unoptimized />
              </div>
              <span className="font-headline font-bold text-sm">Morpho</span>
              <span className="text-[10px] text-on-surface-variant">Borrow aUSD</span>
            </div>

            <MaterialIcon icon="arrow_forward" className="text-outline text-2xl rotate-90 md:rotate-0" />

            {/* aUSD */}
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden">
                <Image src="/coins/AUSD.jpg" alt="aUSD" width={48} height={48} className="rounded-lg" unoptimized />
              </div>
              <span className="font-headline font-bold text-sm">aUSD</span>
              <span className="text-[10px] text-on-surface-variant">Borrowed</span>
            </div>

            <MaterialIcon icon="arrow_forward" className="text-outline text-2xl rotate-90 md:rotate-0" />

            {/* Flowdesk Vault */}
            <div className="flex flex-col items-center gap-2 min-w-[120px]">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden">
                <Image src="/protocols/flowdesk.png" alt="Flowdesk" width={40} height={40} className="rounded-lg" unoptimized />
              </div>
              <span className="font-headline font-bold text-sm">Flowdesk Vault</span>
              <span className="text-[10px] text-primary font-bold">Earn Yield</span>
            </div>
          </div>
        </section>

        {/* Process */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-12 py-8">
            <h2 className="font-headline text-2xl font-bold mb-8">
              Process &amp; Execution
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
            <CarryVaultStats />
          </section>

          <aside className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-xl font-bold mb-6">Counterparties</h3>
              <div className="flex flex-col gap-4">
                {[
                  { logo: "/protocols/morpho.svg", name: "Morpho", role: "Lending Protocol" },
                  { logo: "/coins/AUSD.jpg", name: "aUSD (Agora)", role: "Stablecoin" },
                  { logo: "/protocols/flowdesk.png", name: "Flowdesk", role: "Vault Curator" },
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
              <h3 className="font-headline text-xl font-bold mb-6">Links</h3>
              <div className="space-y-3">
                <a
                  href="https://app.morpho.org/ethereum/market/0x04b580ba9e6e886b67e47265cc8e314820123d5683563bb24097ad80513d6e4f/spyx-ausd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MaterialIcon icon="open_in_new" size="sm" />
                  SPYx/aUSD Borrow Market
                </a>
                <a
                  href="https://app.morpho.org/ethereum/vault/0x32401B9fb79065Bc15949DE0BD43927492f02F0C/flowdesk-ausd-rwa-strategy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MaterialIcon icon="open_in_new" size="sm" />
                  Flowdesk aUSD RWA Vault
                </a>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-xl font-bold mb-6">FAQ</h3>
              <div className="space-y-4">
                {[
                  { q: "What is the carry trade?", a: "You borrow aUSD at a lower rate and deposit it into a higher-yielding vault. The profit is the spread between what you earn and what you pay to borrow." },
                  { q: "What happens if rates invert?", a: "If the borrow rate exceeds the vault APY, the position becomes unprofitable. You should unwind by withdrawing from the vault, repaying the loan, and reclaiming your collateral." },
                  { q: "Can I get liquidated?", a: "Yes. If the value of your SPYx collateral drops below the liquidation threshold on the Morpho market, your position can be liquidated. Monitor your health factor closely." },
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
