import { Metadata } from "next";
import { fetchPreStocks } from "@/lib/prestocks/api";
import { PreStockDerived } from "@/lib/prestocks/types";
import IntelligenceChat from "@/components/intelligence/IntelligenceChat";

export const metadata: Metadata = {
  title: "AI Intelligence Workspace | Dashboard | Scouter",
  description:
    "Ask natural-language questions about PreStocks tokenised pre-IPO companies, valuations, benchmark pricing, and live secondary market trading.",
};

export const revalidate = 60;

export default async function DashboardIntelligencePage() {
  let products: PreStockDerived[] = [];
  try {
    products = await fetchPreStocks();
  } catch (err) {
    console.error("Failed to load PreStocks products for Intelligence page:", err);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <IntelligenceChat initialProducts={products} />
    </div>
  );
}
