"use client";

import { useEffect, useMemo } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import {
  SupportedChainId,
  TradingSdk,
  OrderBookApi,
  setGlobalAdapter,
} from "@cowprotocol/cow-sdk";
import { ViemAdapter } from "@cowprotocol/sdk-viem-adapter";
import type { ViemAdapterOptions } from "@cowprotocol/sdk-viem-adapter";
import type { SpotChainId } from "@/lib/config/xstocks";
import { MAINNET_CHAIN_ID } from "@/lib/config/xstocks";

function getProxyBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/cow`;
  }

  return "https://api.cow.fi";
}

const proxyBase = getProxyBaseUrl();
const inkUrl = `${proxyBase}/ink`;

const COW_BASE_URLS = {
  [SupportedChainId.MAINNET]: `${proxyBase}/mainnet`,
  [SupportedChainId.BNB]: `${proxyBase}/bnb`,
  [SupportedChainId.GNOSIS_CHAIN]: `${proxyBase}/xdai`,
  [SupportedChainId.POLYGON]: `${proxyBase}/polygon`,
  [SupportedChainId.BASE]: `${proxyBase}/base`,
  [SupportedChainId.PLASMA]: inkUrl,
  [SupportedChainId.ARBITRUM_ONE]: `${proxyBase}/arbitrum_one`,
  [SupportedChainId.AVALANCHE]: `${proxyBase}/avalanche`,
  [SupportedChainId.INK]: inkUrl,
  [SupportedChainId.LINEA]: `${proxyBase}/linea`,
  [SupportedChainId.SEPOLIA]: `${proxyBase}/sepolia`,
} as const;

export function getCowChainId(chainId: SpotChainId): SupportedChainId {
  return chainId === MAINNET_CHAIN_ID ? SupportedChainId.MAINNET : SupportedChainId.INK;
}

export function useCowSdk(spotChainId: SpotChainId) {
  const { chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: spotChainId });
  const cowChainId = getCowChainId(spotChainId);

  const orderBookApi = useMemo(
    () =>
      new OrderBookApi({
        chainId: cowChainId,
        baseUrls: COW_BASE_URLS,
      }),
    [cowChainId],
  );

  const tradingSdk = useMemo(
    () =>
      new TradingSdk(
        {
          chainId: cowChainId,
          appCode: "xPrime",
        },
        {
          orderBookApi,
        },
      ),
    [cowChainId, orderBookApi],
  );

  const isReady = Boolean(walletClient && publicClient && chainId === spotChainId);
  const isOnSelectedChain = chainId === spotChainId;

  useEffect(() => {
    if (!isReady || !walletClient || !publicClient) {
      return;
    }

    setGlobalAdapter(
      new ViemAdapter({
        provider: publicClient,
        walletClient,
      } as unknown as ViemAdapterOptions),
    );

    tradingSdk.setTraderParams({ chainId: cowChainId });
  }, [cowChainId, isReady, publicClient, tradingSdk, walletClient]);

  return {
    cowChainId,
    isOnSelectedChain,
    isReady,
    orderBookApi,
    tradingSdk,
  };
}
