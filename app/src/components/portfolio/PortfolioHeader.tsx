import MaterialIcon from "@/components/ui/MaterialIcon";

export default function PortfolioHeader() {
  return (
    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2">
          Portfolio Overview
        </h1>
        <p className="text-on-surface-variant font-body max-w-xl">
          Comprehensive view of your sovereign yield positions, accrued earnings, and upcoming
          maturity schedules across all vaults.
        </p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 bg-surface-container-high px-5 py-3 rounded-xl font-headline font-semibold text-sm hover:bg-surface-bright transition-colors">
          <MaterialIcon icon="file_download" size="sm" />
          Export Report
        </button>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all">
          <MaterialIcon icon="add" size="sm" />
          New Deposit
        </button>
      </div>
    </header>
  );
}
