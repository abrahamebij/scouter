import { Metadata } from "next";
import { fetchPreStocks } from "@/lib/prestocks/api";
import IntelligenceChat from "@/components/intelligence/IntelligenceChat";

export const metadata: Metadata = {
  title: "Intelligence Workspace | Scouter",
  description:
    "Ask natural-language questions about PreStocks tokenised pre-IPO companies, implied valuations, benchmark mark pricing, and live secondary market trading on Solana.",
};

export const revalidate = 60;

export default async function IntelligencePage() {
  let products = [];
  try {
    products = await fetchPreStocks();
  } catch (err) {
    console.error("Failed to load PreStocks products for Intelligence page:", err);
  }

  return <IntelligenceChat initialProducts={products} />;
}
