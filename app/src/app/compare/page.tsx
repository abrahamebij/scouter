import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare | Scouter",
  description: "Compare PreStocks assets side by side.",
};

export default function ComparePage() {
  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-headline font-bold text-on-surface">Compare PreStocks</h1>
      <p className="text-on-surface-variant mt-2 text-sm">
        Side-by-side comparison of valuation, token price, and mark reference metrics.
      </p>
    </div>
  );
}
