"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/connector/react";
import { syncUserWalletToFirebase, UserProfile } from "./users";

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
      setIsSyncing(true);

      syncUserWalletToFirebase(walletAddress)
        .then((res) => {
          if (isCurrent && res) {
            setProfile(res);
            syncedAddressRef.current = walletAddress;
          }
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
      setProfile(null);
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
