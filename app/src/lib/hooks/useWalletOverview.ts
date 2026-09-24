"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useChainId, usePublicClient } from "wagmi";
import { getAppChainInfo } from "@/lib/config/xstocks";
import { useTrading } from "@/lib/hooks/useTrading";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

interface ExchangeOverview {
  equity: string;
  accountValue: string;
  withdrawable: string;
  totalRawUsd: string;
  totalMarginUsed: string;
  crossAccountValue: string;
  crossMarginUsed: string;
  crossMaintenanceMarginUsed: string;
  unrealizedPnl: string;
}

const TOKEN_FETCH_TIMEOUT_MS = 8_000;

export function useWalletOverview() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chainInfo = getAppChainInfo(chainId);
  const usdcToken = chainInfo?.usdc;
  const publicClient = usePublicClient({ chainId });
  const trading = useTrading();

  const {
    data: nativeBalance,
    isLoading: isNativeBalanceLoading,
    error: nativeBalanceError,
  } = useBalance({
    address,
    chainId,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 15_000,
    },
  });

  const [usdcBalanceRaw, setUsdcBalanceRaw] = useState<bigint | null>(null);
  const [isUsdcBalanceLoading, setIsUsdcBalanceLoading] = useState(false);
  const [hasFetchedUsdcBalance, setHasFetchedUsdcBalance] = useState(false);
  const [usdcBalanceError, setUsdcBalanceError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !isConnected || !usdcToken || !publicClient) {
      setUsdcBalanceRaw(null);
      setIsUsdcBalanceLoading(false);
      setHasFetchedUsdcBalance(false);
      setUsdcBalanceError(null);
      return;
    }

    let isActive = true;

    const fetchUsdcBalance = async () => {
      setIsUsdcBalanceLoading(true);
      setUsdcBalanceError(null);

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = window.setTimeout(() => {
          reject(new Error("USDC balance read timed out"));
        }, TOKEN_FETCH_TIMEOUT_MS);

        return () => window.clearTimeout(timeoutId);
      });

      try {
        const balance = await Promise.race([
          publicClient.readContract({
            address: usdcToken,
            abi: ERC20_BALANCE_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
          timeoutPromise,
        ]);

        if (!isActive) {
          return;
        }

        setUsdcBalanceRaw(balance);
      } catch (error) {
        if (!isActive) {
          return;
        }

        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        setUsdcBalanceError(normalizedError);
      } finally {
        if (isActive) {
          setIsUsdcBalanceLoading(false);
          setHasFetchedUsdcBalance(true);
        }
      }
    };

    void fetchUsdcBalance();
    const interval = window.setInterval(() => {
      void fetchUsdcBalance();
    }, 15_000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [address, chainId, chainInfo, isConnected, publicClient, usdcToken]);

  const nativeFormatted = nativeBalance
    ? `${Number(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4)} ${nativeBalance.symbol}`
    : `0.0000 ${chainInfo?.nativeSymbol ?? ""}`.trim();

  const usdcFormatted = chainInfo?.usdc
    ? `${Number(formatUnits(usdcBalanceRaw ?? BigInt(0), 6)).toFixed(2)} USDC`
    : null;

  const exchange: ExchangeOverview = {
    equity: trading.equity,
    accountValue: trading.accountValue,
    withdrawable: trading.withdrawable,
    totalRawUsd: trading.totalRawUsd,
    totalMarginUsed: trading.totalMarginUsed,
    crossAccountValue: trading.crossAccountValue,
    crossMarginUsed: trading.crossMarginUsed,
    crossMaintenanceMarginUsed: trading.crossMaintenanceMarginUsed,
    unrealizedPnl: trading.unrealizedPnl,
  };

  return {
    chainInfo,
    nativeFormatted,
    usdcFormatted,
    exchange,
    nativeBalanceError,
    usdcBalanceError,
    hasFetchedUsdcBalance,
    isLoading:
      isNativeBalanceLoading ||
      (!!chainInfo?.usdc && !hasFetchedUsdcBalance && isUsdcBalanceLoading) ||
      trading.isInitializing,
  };
}
