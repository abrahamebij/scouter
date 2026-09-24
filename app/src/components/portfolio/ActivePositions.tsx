import MaterialIcon from "@/components/ui/MaterialIcon";

interface Position {
  icon: string;
  iconBg: string;
  iconColor: string;
  name: string;
  label: string;
  balance: string;
  balanceUsd: string;
  apy: string;
  apyColor: string;
  apyType: string;
  health: string;
  healthBg: string;
}

const positions: Position[] = [
  {
    icon: "token",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    name: "ETH Sovereign Yield Vault",
    label: "Epoch 42 \u2022 Delta Neutral Strategy",
    balance: "240.50 ETH",
    balanceUsd: "$620,490.00",
    apy: "14.2%",
    apyColor: "text-primary",
    apyType: "Floating",
    health: "Optimal",
    healthBg: "bg-primary/10 text-primary",
  },
  {
    icon: "currency_exchange",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    name: "USDC Fixed Rate Alpha",
    label: "Term: 180 Days \u2022 Fixed Income",
    balance: "500,000 USDC",
    balanceUsd: "$500,000.00",
    apy: "8.5%",
    apyColor: "text-secondary",
    apyType: "Locked",
    health: "Secured",
    healthBg: "bg-secondary/10 text-secondary",
  },
  {
    icon: "warning",
    iconBg: "bg-error/10",
    iconColor: "text-error",
    name: "SOL Leverage Yield",
    label: "Isolated Pool \u2022 High Risk",
    balance: "1,200 SOL",
    balanceUsd: "$127,902.40",
    apy: "32.8%",
    apyColor: "text-error",
    apyType: "Volatile",
    health: "At Risk",
    healthBg: "bg-error-container/50 text-error",
  },
];

export default function ActivePositions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-xl font-bold tracking-tight">Active Positions</h3>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface">
            <MaterialIcon icon="filter_list" />
          </button>
          <button className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface">
            <MaterialIcon icon="search" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {positions.map((pos) => (
          <div
            key={pos.name}
            className="bg-surface-container-low hover:bg-surface-container p-6 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/20"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${pos.iconBg} flex items-center justify-center`}
                >
                  <MaterialIcon icon={pos.icon} className={pos.iconColor} />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface">{pos.name}</h4>
                  <p className="text-xs font-label text-on-surface-variant">{pos.label}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] uppercase font-label text-on-surface-variant mb-1">
                    Balance
                  </p>
                  <p className="font-headline font-bold text-sm">{pos.balance}</p>
                  <p className="text-xs font-label text-on-surface-variant">{pos.balanceUsd}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-label text-on-surface-variant mb-1">
                    Current APY
                  </p>
                  <p className={`font-headline font-bold text-sm ${pos.apyColor}`}>{pos.apy}</p>
                  <p className="text-xs font-label text-on-surface-variant">{pos.apyType}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] uppercase font-label text-on-surface-variant mb-1">
                    Health
                  </p>
                  <span
                    className={`px-2 py-1 rounded ${pos.healthBg} text-[10px] font-bold uppercase tracking-wider`}
                  >
                    {pos.health}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
