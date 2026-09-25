import { NextResponse } from "next/server";
import { fetchPreStocks } from "@/lib/prestocks/api";
import { getCompanyName } from "@/lib/prestocks/transforms";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await fetchPreStocks();

    const formatted = products.map((p) => ({
      symbol: p.symbol,
      name: getCompanyName(p.name),
      tokenPrice: p.tokenPrice,
      markPrice: p.markPrice,
      impliedValuation: p.impliedValuation,
      markValuation: p.markValuation,
      premiumPercent: Number(p.premiumPercent.toFixed(2)),
      priceDifference: Number(p.priceDifference.toFixed(2)),
      supply: p.supply,
      contractAddress: p.contract_address,
      externalUrl: p.external_url,
      description: p.description,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      timestamp: Date.now(),
      data: formatted,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching markets";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
