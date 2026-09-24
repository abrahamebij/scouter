import MaterialIcon from "@/components/ui/MaterialIcon";

interface Transaction {
  icon: string;
  iconColor: string;
  type: string;
  asset: string;
  amount: string;
  status: string;
  date: string;
}

const transactions: Transaction[] = [
  {
    icon: "download",
    iconColor: "text-primary",
    type: "Deposit",
    asset: "USDC",
    amount: "150,000.00",
    status: "Confirmed",
    date: "Oct 24, 2024",
  },
  {
    icon: "paid",
    iconColor: "text-secondary",
    type: "Yield Claim",
    asset: "ETH",
    amount: "0.8240",
    status: "Confirmed",
    date: "Oct 22, 2024",
  },
  {
    icon: "upload",
    iconColor: "text-on-surface-variant",
    type: "Withdraw",
    asset: "SOL",
    amount: "250.00",
    status: "Confirmed",
    date: "Oct 18, 2024",
  },
];

export default function TransactionHistory() {
  return (
    <div className="mt-16">
      <h3 className="font-headline text-xl font-bold tracking-tight mb-6">Transaction History</h3>
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <table className="w-full text-left font-body">
          <thead>
            <tr className="bg-surface-container-highest/20 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              <th className="py-4 px-6 font-semibold">Type</th>
              <th className="py-4 px-6 font-semibold">Asset</th>
              <th className="py-4 px-6 font-semibold">Amount</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {transactions.map((tx) => (
              <tr
                key={`${tx.date}-${tx.type}`}
                className="hover:bg-surface-container transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <MaterialIcon icon={tx.icon} size="sm" className={tx.iconColor} />
                    <span className="text-sm font-semibold">{tx.type}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm">{tx.asset}</td>
                <td className="py-4 px-6 text-sm font-label">{tx.amount}</td>
                <td className="py-4 px-6">
                  <span className="text-[10px] font-bold uppercase text-primary">{tx.status}</span>
                </td>
                <td className="py-4 px-6 text-xs text-on-surface-variant">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-center">
          <button className="text-xs font-label text-on-surface-variant hover:text-primary transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
