import { redirect } from "next/navigation";

interface CompanyRedirectProps {
  params: Promise<{ symbol: string }>;
}

export default async function CompanySymbolRedirect({ params }: CompanyRedirectProps) {
  const { symbol } = await params;
  redirect(`/dashboard/company/${symbol.toLowerCase()}`);
}
