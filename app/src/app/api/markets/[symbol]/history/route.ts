import { NextRequest, NextResponse } from "next/server";
import { getPreStockBySymbol } from "@/lib/prestocks/api";

export const revalidate = 60;

interface RouteProps {
  params: Promise<{ symbol: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { symbol } = await params;
  try {
    const product = await getPreStockBySymbol(symbol);

    if (!product) {
      return NextResponse.json(
        { success: false, error: `Market for symbol ${symbol.toUpperCase()} not found` },
        { status: 404 }
      );
    }

    // Returns current observation snapshot point
    const liveSnapshot = {
      symbol: product.symbol,
      timestamp: Date.now(),
      tokenPrice: product.tokenPrice,
      markPrice: product.markPrice,
      impliedValuation: product.impliedValuation,
      markValuation: product.markValuation,
      premiumPercent: Number(product.premiumPercent.toFixed(2)),
      supply: product.supply,
    };

    return NextResponse.json({
      success: true,
      symbol: product.symbol,
      points: [liveSnapshot],
      count: 1,
      source: "Scouter Solana Snapshot Engine",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching market history";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
