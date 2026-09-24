import { NextResponse } from "next/server";
import { fetchPreStocks } from "@/lib/prestocks/api";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await fetchPreStocks();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch PreStocks";
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
