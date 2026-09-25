import { NextResponse } from "next/server";
import { syncUserWalletToFirebase } from "@/lib/firebase/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const profile = await syncUserWalletToFirebase(walletAddress);
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Error in /api/user/sync:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
