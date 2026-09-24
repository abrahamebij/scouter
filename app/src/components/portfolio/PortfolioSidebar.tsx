import MaterialIcon from "@/components/ui/MaterialIcon";

const allocations = [
  { label: "Stablecoins", pct: 48, color: "bg-secondary" },
  { label: "Ethereum", pct: 42, color: "bg-primary" },
  { label: "Other Alt-L1s", pct: 10, color: "bg-tertiary" },
];

export default function PortfolioSidebar() {
  return (
    <aside className="lg:col-span-4 space-y-8">
      <UpcomingMaturity />
      <AssetAllocation />
      <RiskAssessment />
    </aside>
  );
}

function UpcomingMaturity() {
  return (
    <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10">
      <h3 className="font-headline text-lg font-bold mb-6">Upcoming Maturity</h3>
      <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
        <div className="relative pl-10">
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <p className="text-xs font-label text-on-surface-variant mb-1">In 12 Days (Nov 5)</p>
          <h5 className="font-headline font-bold text-sm mb-1">USDC Fixed Rate Alpha</h5>
          <p className="text-xs text-primary font-semibold">$521,400.00 Unlock</p>
        </div>
        <div className="relative pl-10">
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
          </div>
          <p className="text-xs font-label text-on-surface-variant mb-1">In 28 Days (Nov 21)</p>
          <h5 className="font-headline font-bold text-sm mb-1">ETH Sovereign Epoch 42</h5>
          <p className="text-xs text-on-surface-variant">Rollover Option Available</p>
        </div>
      </div>
      <button className="w-full mt-8 py-3 bg-surface-container-high rounded-lg text-sm font-headline font-bold hover:bg-surface-bright transition-colors">
        Manage Maturity
      </button>
    </div>
  );
}

function AssetAllocation() {
  return (
    <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10">
      <h3 className="font-headline text-lg font-bold mb-6">Asset Allocation</h3>
      <div className="space-y-4">
        {allocations.map((alloc) => (
          <div key={alloc.label}>
            <div className="flex justify-between text-xs font-label mb-2">
              <span className="text-on-surface-variant">{alloc.label}</span>
              <span className="font-bold">{alloc.pct}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
              <div className={`h-full ${alloc.color}`} style={{ width: `${alloc.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskAssessment() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <MaterialIcon icon="shield" fill className="text-primary" />
        <h3 className="font-headline text-lg font-bold">Risk Assessment</h3>
      </div>
      <p className="text-sm text-on-surface-variant mb-4">
        Your current allocation is{" "}
        <span className="text-on-surface font-bold">Diversified &amp; Stable</span>. You have 0.4%
        exposure to high-volatility vaults.
      </p>
      <button className="text-xs font-label text-primary font-bold flex items-center gap-1 hover:underline">
        Review Safety Report
        <MaterialIcon icon="arrow_outward" size="sm" />
      </button>
    </div>
  );
}
