import { NextRequest, NextResponse } from "next/server";
import { getPreStockBySymbol } from "@/lib/prestocks/api";
import { generateScoutReport, getCachedScoutReport } from "@/lib/gemini/research";
import { normalizeSymbol } from "@/lib/prestocks/transforms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, forceRefresh } = body;

    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      );
    }

    const norm = normalizeSymbol(symbol);

    // If cached and not forcing refresh, return immediately
    if (!forceRefresh) {
      const cached = getCachedScoutReport(norm);
      if (cached) {
        return NextResponse.json({ report: cached, fromCache: true });
      }
    }

    // Retrieve verified PreStocks data as the authoritative ground truth
    const product = await getPreStockBySymbol(norm);
    if (!product) {
      return NextResponse.json(
        { error: `Asset with symbol ${norm} not found on PreStocks` },
        { status: 404 }
      );
    }

    const report = await generateScoutReport(product, Boolean(forceRefresh));
    return NextResponse.json({ report, fromCache: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate Scout report";
    console.error("Scout API Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const cached = getCachedScoutReport(symbol);
  return NextResponse.json({ report: cached });
}
