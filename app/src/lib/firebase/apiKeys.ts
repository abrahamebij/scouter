import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export interface ApiKeyItem {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: number;
  lastUsedAt: number | null;
  status: "active" | "revoked";
  walletAddress: string;
}

export interface GeneratedKeyResult {
  rawKey: string;
  keyItem: ApiKeyItem;
}

function generateRandomHex(bytes = 20): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Creates a new API key for the authenticated wallet address and saves metadata to Firestore.
 */
export async function createApiKey(
  walletAddress: string,
  name: string
): Promise<GeneratedKeyResult | null> {
  if (!walletAddress) return null;

  try {
    const rawKey = `scouter_live_${generateRandomHex(16)}`;
    const maskedKey = `scouter_live_...${rawKey.slice(-4)}`;
    const id = `key_${Date.now()}_${generateRandomHex(4)}`;
    const now = Date.now();

    const keyItem: ApiKeyItem = {
      id,
      name: name.trim() || "Default API Key",
      maskedKey,
      createdAt: now,
      lastUsedAt: null,
      status: "active",
      walletAddress: walletAddress.toLowerCase(),
    };

    const keyRef = doc(db, "users", walletAddress.toLowerCase(), "apiKeys", id);
    await setDoc(keyRef, keyItem);

    return { rawKey, keyItem };
  } catch (err) {
    console.error("Firebase createApiKey error:", err);
    return null;
  }
}

/**
 * Lists all API keys associated with the authenticated wallet address.
 */
export async function listApiKeys(walletAddress: string): Promise<ApiKeyItem[]> {
  if (!walletAddress) return [];

  try {
    const keysCol = collection(db, "users", walletAddress.toLowerCase(), "apiKeys");
    const snapshot = await getDocs(keysCol);
    const list: ApiKeyItem[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as ApiKeyItem);
    });
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("Firebase listApiKeys error:", err);
    return [];
  }
}

/**
 * Revokes an existing API key in Firestore.
 */
export async function revokeApiKey(
  walletAddress: string,
  keyId: string
): Promise<boolean> {
  if (!walletAddress || !keyId) return false;

  try {
    const keyRef = doc(db, "users", walletAddress.toLowerCase(), "apiKeys", keyId);
    await updateDoc(keyRef, { status: "revoked" });
    return true;
  } catch (err) {
    console.error("Firebase revokeApiKey error:", err);
    return false;
  }
}
