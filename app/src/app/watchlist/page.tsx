import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist | Scouter",
  description: "Monitor saved PreStocks companies and token metrics.",
};

export default function WatchlistPage() {
  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-headline font-bold text-on-surface">Watchlist</h1>
      <p className="text-on-surface-variant mt-2 text-sm">
        Track your saved pre-IPO companies and monitor live valuation changes.
      </p>
    </div>
  );
}
