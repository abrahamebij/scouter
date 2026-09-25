import { NextRequest, NextResponse } from "next/server";
import { getPreStockBySymbol } from "@/lib/prestocks/api";
import { getCompanyName } from "@/lib/prestocks/transforms";

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

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      data: {
        symbol: product.symbol,
        name: getCompanyName(product.name),
        tokenPrice: product.tokenPrice,
        markPrice: product.markPrice,
        impliedValuation: product.impliedValuation,
        markValuation: product.markValuation,
        premiumPercent: Number(product.premiumPercent.toFixed(2)),
        priceDifference: Number(product.priceDifference.toFixed(2)),
        supply: product.supply,
        contractAddress: product.contract_address,
        externalUrl: product.external_url,
        description: product.description,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error fetching market details";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
