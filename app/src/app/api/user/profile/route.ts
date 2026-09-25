import { NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/firebase/users";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const profile = await getUserProfile(walletAddress);
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Error in GET /api/user/profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, displayName } = body;

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const ok = await updateUserProfile(walletAddress, {
      displayName: typeof displayName === "string" ? displayName.trim() : undefined,
    });

    if (!ok) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST /api/user/profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
