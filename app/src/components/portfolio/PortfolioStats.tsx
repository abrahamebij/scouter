import MaterialIcon from "@/components/ui/MaterialIcon";

const yieldBars: Array<{ height: number; opacity: string }> = [
  { height: 40, opacity: "bg-secondary/20" },
  { height: 60, opacity: "bg-secondary/30" },
  { height: 50, opacity: "bg-secondary/40" },
  { height: 80, opacity: "bg-secondary/50" },
  { height: 70, opacity: "bg-secondary/60" },
  { height: 90, opacity: "bg-secondary/80" },
  { height: 100, opacity: "bg-secondary" },
];

export default function PortfolioStats() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
      {/* Total Deposited */}
      <div className="md:col-span-2 lg:col-span-2 bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <MaterialIcon icon="account_balance_wallet" className="text-6xl" />
        </div>
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
          Total Deposited
        </p>
        <h2 className="font-headline text-4xl font-extrabold text-primary mb-2">
          $1,248,392.40
        </h2>
        <div className="flex items-center gap-2 text-primary-fixed-dim text-sm font-label">
          <MaterialIcon icon="trending_up" size="sm" />
          <span>+12.4% vs last month</span>
        </div>
      </div>

      {/* Total Realized Yield */}
      <div className="md:col-span-2 lg:col-span-2 bg-surface-container p-8 rounded-xl yield-pulse-mesh border border-outline-variant/10">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
          Total Realized Yield
        </p>
        <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-2">$42,910.15</h2>
        <div className="h-12 flex items-end gap-1">
          {yieldBars.map((bar, i) => (
            <div
              key={i}
              className={`flex-1 ${bar.opacity} rounded-t-sm`}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Unrealized PnL */}
      <div className="md:col-span-1 lg:col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">
          Unrealized PnL
        </p>
        <p className="font-headline text-2xl font-bold text-secondary mb-1">+$8,402.11</p>
        <p className="text-[10px] text-on-surface-variant font-label">Mark-to-Market Valuation</p>
      </div>

      {/* Claimable */}
      <div className="md:col-span-1 lg:col-span-1 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
        <div>
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">
            Claimable
          </p>
          <p className="font-headline text-2xl font-bold text-primary mb-1">$1,104.50</p>
        </div>
        <button className="text-xs font-label text-primary font-bold flex items-center gap-1 hover:underline">
          Claim Now
          <MaterialIcon icon="chevron_right" size="sm" />
        </button>
      </div>
    </section>
  );
}
