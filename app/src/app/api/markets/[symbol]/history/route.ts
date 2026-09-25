import { NextRequest, NextResponse } from "next/server";
import { getPreStockBySymbol } from "@/lib/prestocks/api";
import { fetchExternalMarketHistory } from "@/lib/prestocks/externalHistory";

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

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "1D";

    // Fetch real on-chain candles and market history
    const points = await fetchExternalMarketHistory(symbol, product, timeframe);

    return NextResponse.json({
      success: true,
      symbol: product.symbol,
      points,
      count: points.length,
      timeframe,
      source: "Solana On-Chain DEX & PreStocks Live Feeds",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching market history";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
