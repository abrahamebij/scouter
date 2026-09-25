import { redirect } from "next/navigation";

interface MarketRedirectProps {
  params: Promise<{ symbol: string }>;
}

export default async function MarketSymbolRedirect({ params }: MarketRedirectProps) {
  const { symbol } = await params;
  redirect(`/dashboard/market/${symbol.toLowerCase()}`);
}
