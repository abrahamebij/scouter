"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import type { SpotChainId } from "@/lib/config/xstocks";
import { getSpotChainConfig } from "@/lib/config/xstocks";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export function useSpotBalance(chainId: SpotChainId) {
  const { address } = useAccount();
  const chain = getSpotChainConfig(chainId);

  const { data: rawBalance, isLoading, refetch } = useReadContract({
    address: chain?.usdc,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: Boolean(address && chain),
      refetchInterval: 15_000,
    },
  });

  const balance = rawBalance ?? BigInt(0);
  const decimals = chain?.usdcDecimals ?? 6;
  const formatted = formatUnits(balance, decimals);

  return {
    balance,
    formatted,
    displayBalance: parseFloat(formatted).toFixed(2),
    isLoading,
    refetch,
  };
}
