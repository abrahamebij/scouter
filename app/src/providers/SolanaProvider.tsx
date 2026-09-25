"use client";

import { useMemo, type ReactNode } from "react";
import { AppProvider } from "@solana/connector/react";
import { getDefaultConfig, getDefaultMobileConfig } from "@solana/connector/headless";

export function SolanaProvider({ children }: { children: ReactNode }) {
  const connectorConfig = useMemo(() => {
    return getDefaultConfig({
      appName: "Scouter",
      appUrl: typeof window !== "undefined" ? window.location.origin : "https://scouter-tool.vercel.app",
      autoConnect: true,
      enableMobile: true,
      clusters: [
        {
          id: "solana:mainnet" as const,
          label: "Solana Mainnet",
          url: "https://api.mainnet-beta.solana.com",
        },
      ],
      wallets: {
        featured: ["Phantom", "Solflare", "Backpack"],
      },
    });
  }, []);

  const mobile = useMemo(
    () =>
      getDefaultMobileConfig({
        appName: "Scouter",
        appUrl: typeof window !== "undefined" ? window.location.origin : "https://scouter-tool.vercel.app",
      }),
    []
  );

  return (
    <AppProvider connectorConfig={connectorConfig} mobile={mobile}>
      {children}
    </AppProvider>
  );
}
