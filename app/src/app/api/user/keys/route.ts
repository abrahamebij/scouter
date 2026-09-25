import { NextResponse } from "next/server";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/firebase/apiKeys";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const keys = await listApiKeys(walletAddress);
    return NextResponse.json({ success: true, keys });
  } catch (err) {
    console.error("Error in GET /api/user/keys:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, name } = body;

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
    }

    const result = await createApiKey(
      walletAddress,
      typeof name === "string" ? name : "Default Secret Key"
    );

    if (!result) {
      return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rawKey: result.rawKey,
      keyItem: result.keyItem,
    });
  } catch (err) {
    console.error("Error in POST /api/user/keys:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, keyId } = body;

    if (!walletAddress || !keyId) {
      return NextResponse.json({ error: "Missing walletAddress or keyId" }, { status: 400 });
    }

    const ok = await revokeApiKey(walletAddress, keyId);
    if (!ok) {
      return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/user/keys:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
