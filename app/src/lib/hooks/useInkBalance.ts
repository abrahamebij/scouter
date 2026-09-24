"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { USDC_INK, INK_CHAIN_ID } from "@/lib/config/xstocks";

const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Reads the user's USDC balance on Ink chain.
 */
export function useInkBalance() {
  const { address } = useAccount();

  const { data: rawBalance, isLoading, refetch } = useReadContract({
    address: USDC_INK.address,
    abi: ERC20_BALANCE_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: INK_CHAIN_ID,
    query: {
      enabled: !!address,
      refetchInterval: 15_000,
    },
  });

  const balance = rawBalance ?? BigInt(0);
  const formatted = formatUnits(balance, USDC_INK.decimals);

  return {
    balance,
    formatted,
    displayBalance: parseFloat(formatted).toFixed(2),
    isLoading,
    refetch,
  };
}
