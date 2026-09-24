"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import {
  projectId,
  networks,
  wagmiAdapter,
  metadata,
} from "@/lib/config/appkit";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  allowUnsupportedChain: true,
  chainImages: {
    42161: "/chains/arbitrum.svg",
    57073: "/chains/ink.svg",
    763373: "/chains/ink.svg",
    1: "/chains/ethereum.svg",
  },
  features: {
    analytics: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#4ef2b4",
    "--w3m-color-mix": "#0f1413",
    "--w3m-color-mix-strength": 40,
    "--w3m-border-radius-master": "2px",
  },
});

export default function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
