import { NextRequest, NextResponse } from "next/server";
import { fetchPreStocks } from "@/lib/prestocks/api";
import { queryIntelligence, ChatMessage } from "@/lib/gemini/intelligence";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], watchlistSymbols = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Fetch live PreStocks asset directory
    const allProducts = await fetchPreStocks();

    const safeHistory: ChatMessage[] = Array.isArray(history)
      ? history.map((item) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: String(item.content || ""),
        }))
      : [];

    const safeWatchlist: string[] = Array.isArray(watchlistSymbols)
      ? watchlistSymbols.map(String)
      : [];

    const intelligenceResult = await queryIntelligence(
      message.trim(),
      safeHistory,
      allProducts,
      safeWatchlist
    );

    return NextResponse.json({
      success: true,
      result: intelligenceResult,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Unknown error in intelligence query";
    console.error("Intelligence API Error:", errorMsg, err);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
