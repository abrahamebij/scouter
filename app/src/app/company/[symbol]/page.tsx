import { Metadata } from "next";

interface CompanyPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} | Scouter`,
    description: `Detailed PreStocks metrics and implied valuation for ${symbol.toUpperCase()}.`,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { symbol } = await params;
  return (
    <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-headline font-bold text-on-surface">
        {symbol.toUpperCase()}
      </h1>
      <p className="text-on-surface-variant mt-2 text-sm">
        Detailed token metrics and implied valuation.
      </p>
    </div>
  );
}
