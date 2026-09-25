"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useWallet } from "@solana/connector/react";
import { useMounted } from "@/lib/prestocks/useMounted";
import { useFirebaseAuth } from "@/lib/firebase/useFirebaseAuth";
import SolanaConnectButton from "@/components/layout/SolanaConnectButton";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const isMounted = useMounted();
  const { isConnected, isConnecting } = useWallet();
  // Syncs user details to Firebase Firestore when connected
  useFirebaseAuth();

  // Prevent flashing content during initial hydration
  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container-low border border-outline-variant/20 animate-pulse space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container-high" />
          <div className="h-6 bg-surface-container-high rounded w-48 mx-auto" />
          <div className="h-4 bg-surface-container-high/60 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center space-y-3 font-mono text-xs text-on-surface-variant">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-container-high flex items-center justify-center text-accent">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <div>Connecting to Solana wallet...</div>
        </div>
      </div>
    );
  }

  // Gated state: Wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg rounded-2xl bg-surface-container-low border border-outline-variant/25 p-6 sm:p-8 text-center space-y-6 shadow-xl shadow-black/40 animate-fade-in">
          {/* Logo & Brand Identity */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center overflow-hidden p-2.5 shadow-md">
              <Image
                src="/logo.png"
                alt="SCOUTER Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-headline font-bold text-sm tracking-widest text-on-surface uppercase block">
                SCOUTER
              </span>
              <span className="text-[11px] font-mono text-accent">
                Private Market Intelligence Terminal
              </span>
            </div>
          </div>

          {/* Heading & Explanation */}
          <div className="space-y-2">
            <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
              Connect Wallet to Enter Scouter
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto font-light leading-relaxed">
              Scouter&apos;s private-market research, valuation intelligence, and developer platform are gated to verified Solana wallets.
            </p>
          </div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left pt-2 border-t border-outline-variant/15">
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 space-y-1">
              <MaterialIcon icon="show_chart" size="sm" className="text-accent" />
              <div className="font-headline font-semibold text-xs text-on-surface">
                Market Terminal
              </div>
              <p className="text-[10px] text-on-surface-variant font-light">
                24/7 PreStocks secondary pricing on Solana.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 space-y-1">
              <MaterialIcon icon="psychology" size="sm" className="text-accent" />
              <div className="font-headline font-semibold text-xs text-on-surface">
                AI Intelligence
              </div>
              <p className="text-[10px] text-on-surface-variant font-light">
                Real-time research briefs and Search Grounding.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/15 space-y-1">
              <MaterialIcon icon="code" size="sm" className="text-accent" />
              <div className="font-headline font-semibold text-xs text-on-surface">
                Developer SDK
              </div>
              <p className="text-[10px] text-on-surface-variant font-light">
                API keys and programmable private market data.
              </p>
            </div>
          </div>

          {/* Connect Trigger */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <SolanaConnectButton />
            <span className="text-[11px] font-mono text-on-surface-variant/60">
              Supports Phantom, Solflare, Backpack &amp; standard Solana wallets
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Render Dashboard Content
  return <>{children}</>;
}
