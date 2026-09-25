"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/connector/react";
import type { UserProfile } from "./users";

export function useFirebaseAuth() {
  const { isConnected, isConnecting, account } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncedAddressRef = useRef<string | null>(null);

  const walletAddress = account ? (typeof account === "string" ? account : String(account)) : null;

  useEffect(() => {
    if (isConnected && walletAddress) {
      if (syncedAddressRef.current === walletAddress) return;

      let isCurrent = true;
      queueMicrotask(() => {
        if (isCurrent) {
          setIsSyncing(true);
        }
      });

      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Sync failed");
          return res.json();
        })
        .then((data) => {
          if (isCurrent && data.profile) {
            setProfile(data.profile);
            syncedAddressRef.current = walletAddress;
          }
        })
        .catch((err) => {
          console.error("Firebase sync error:", err);
        })
        .finally(() => {
          if (isCurrent) {
            setIsSyncing(false);
          }
        });

      return () => {
        isCurrent = false;
      };
    } else {
      queueMicrotask(() => {
        setProfile(null);
      });
      syncedAddressRef.current = null;
    }
  }, [isConnected, walletAddress]);

  return {
    isConnected,
    isConnecting,
    isSyncing,
    walletAddress,
    profile,
  };
}
