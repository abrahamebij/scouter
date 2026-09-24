import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover | Scouter",
  description: "Discover and research tokenised pre-IPO assets on PreStocks.",
};

export default function DiscoverPage() {
  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-headline font-bold text-on-surface">Discover PreStocks</h1>
      <p className="text-on-surface-variant mt-2 text-sm">
        Explore live valuations and token prices for tokenised pre-IPO companies.
      </p>
    </div>
  );
}
