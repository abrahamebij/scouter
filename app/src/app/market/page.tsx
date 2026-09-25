import { redirect } from "next/navigation";
import { fetchPreStocks } from "@/lib/prestocks/api";

export const revalidate = 60;

export default async function MarketIndexPage() {
  let defaultSymbol = "openai";
  try {
    const products = await fetchPreStocks();
    if (products.length > 0) {
      defaultSymbol = products[0].symbol.toLowerCase();
    }
  } catch {
    defaultSymbol = "openai";
  }

  redirect(`/market/${defaultSymbol}`);
}
