import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export interface UserProfile {
  walletAddress: string;
  createdAt: number;
  lastSeenAt: number;
  connectionCount: number;
  solanaCluster: string;
  displayName?: string;
}

/**
 * Saves or updates user record in Firebase Firestore whenever a wallet connects.
 */
export async function syncUserWalletToFirebase(walletAddress: string): Promise<UserProfile | null> {
  if (!walletAddress) return null;

  try {
    const userRef = doc(db, "users", walletAddress.toLowerCase());
    const snapshot = await getDoc(userRef);
    const now = Date.now();

    if (snapshot.exists()) {
      const data = snapshot.data();
      const updated: UserProfile = {
        walletAddress,
        createdAt: data.createdAt || now,
        lastSeenAt: now,
        connectionCount: (data.connectionCount || 1) + 1,
        solanaCluster: "mainnet-beta",
        displayName: data.displayName,
      };
      await updateDoc(userRef, {
        lastSeenAt: now,
        connectionCount: (data.connectionCount || 1) + 1,
      });
      return updated;
    } else {
      const newUser: UserProfile = {
        walletAddress,
        createdAt: now,
        lastSeenAt: now,
        connectionCount: 1,
        solanaCluster: "mainnet-beta",
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (err) {
    console.error("Firebase syncUserWallet error:", err);
    return null;
  }
}

/**
 * Fetches user profile from Firebase Firestore.
 */
export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  if (!walletAddress) return null;

  try {
    const userRef = doc(db, "users", walletAddress.toLowerCase());
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error("Firebase getUserProfile error:", err);
    return null;
  }
}

/**
 * Updates user profile in Firebase Firestore.
 */
export async function updateUserProfile(
  walletAddress: string,
  data: { displayName?: string }
): Promise<boolean> {
  if (!walletAddress) return false;

  try {
    const userRef = doc(db, "users", walletAddress.toLowerCase());
    await updateDoc(userRef, {
      ...data,
      lastSeenAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error("Firebase updateUserProfile error:", err);
    return false;
  }
}

