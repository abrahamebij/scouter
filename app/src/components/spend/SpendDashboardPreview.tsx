import MaterialIcon from "@/components/ui/MaterialIcon";

const transactions = [
  {
    icon: "shopping_bag",
    merchant: "Apple Store",
    detail: "Sep 24, 2024 \u2022 Cupertino, CA",
    amount: "-$2,499.00",
    status: "Processed",
  },
  {
    icon: "restaurant",
    merchant: "Nobu Malibu",
    detail: "Sep 22, 2024 \u2022 Malibu, CA",
    amount: "-$840.12",
    status: "Processed",
  },
];

export default function SpendDashboardPreview() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
      {/* Card Overview */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-surface-container rounded-xl p-8 h-64 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label text-on-surface-variant uppercase text-xs tracking-widest">
              Active Balance
            </span>
            <MaterialIcon icon="visibility" className="text-on-surface-variant" />
          </div>
          <div className="font-headline text-4xl font-bold text-on-surface">$142,500.00</div>
          <div className="flex space-x-4">
            <div className="h-10 w-16 bg-surface-container-high rounded flex items-center justify-center">
              <div className="w-8 h-5 bg-outline-variant opacity-20 rounded" />
            </div>
            <div className="text-sm font-label text-on-surface-variant self-center">
              &bull;&bull;&bull;&bull; 4412
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-6 space-y-4">
          <h3 className="font-headline text-lg font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-high p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
              <MaterialIcon icon="add_card" className="text-primary" />
              <span className="text-xs font-label">Top Up</span>
            </div>
            <div className="bg-surface-container-high p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
              <MaterialIcon icon="lock" className="text-secondary" />
              <span className="text-xs font-label">Freeze</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-2xl font-bold">Recent Transactions</h2>
          <span className="text-primary text-sm font-label cursor-pointer">View All</span>
        </div>
        <div className="space-y-6">
          {transactions.map((tx) => (
            <div key={tx.merchant} className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                  <MaterialIcon icon={tx.icon} />
                </div>
                <div>
                  <div className="font-semibold">{tx.merchant}</div>
                  <div className="text-sm text-on-surface-variant font-label">{tx.detail}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-error">{tx.amount}</div>
                <div className="text-xs text-on-surface-variant font-label">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
