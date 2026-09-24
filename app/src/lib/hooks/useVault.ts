"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  VAULT_ADDRESS,
  USDC_ADDRESS,
  A_WSPYX_ADDRESS,
  DEBT_USDC_ADDRESS,
  INK_SEPOLIA_CHAIN_ID,
  vaultAbi,
  erc20Abi,
  poolAbi,
} from "@/lib/contracts/vault";

const USDC_DECIMALS = 6;
const BPS = BigInt(10_000);

type TxAction = "approve" | "deposit" | "withdraw" | null;

export function useVault() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Store the pending deposit amount so we can auto-chain after approval
  const pendingDepositAmount = useRef<string | null>(null);

  const isOnInkSepolia = chainId === INK_SEPOLIA_CHAIN_ID;

  // --- Read vault state ---
  const { data: vaultPool } = useReadContract({
    address: VAULT_ADDRESS,
    abi: vaultAbi,
    functionName: "POOL",
    chainId: INK_SEPOLIA_CHAIN_ID,
  });

  const { data: vaultReads, refetch: refetchVault } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "totalAssets",
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "totalSupply",
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "getCurrentLeverage",
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "targetLeverageRatio",
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: A_WSPYX_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [VAULT_ADDRESS],
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: DEBT_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [VAULT_ADDRESS],
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      refetchInterval: 15_000,
    },
  });

  const { data: poolData, refetch: refetchPool } = useReadContract({
    address: vaultPool ?? undefined,
    abi: poolAbi,
    functionName: "getUserAccountData",
    args: [VAULT_ADDRESS],
    chainId: INK_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!vaultPool,
      refetchInterval: 15_000,
    },
  });

  // --- User-specific reads ---
  const { data: userReads, refetch: refetchUser } = useReadContracts({
    contracts: [
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, VAULT_ADDRESS],
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "balanceOf",
        args: [address!],
        chainId: INK_SEPOLIA_CHAIN_ID,
      },
    ],
    query: {
      enabled: !!address,
      refetchInterval: 15_000,
    },
  });

  // Wait for pending tx
  const { isLoading: isTxConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({
      hash: pendingTx,
      query: {
        enabled: !!pendingTx,
      },
    });

  // --- Tx confirmation handler ---
  // Stores the last confirmed tx so we only fire once per hash
  const lastConfirmedTx = useRef<string | null>(null);

  // Callback ref set by the component to get notified on tx confirm
  const onTxConfirmedRef = useRef<((action: TxAction) => void) | null>(null);

  useEffect(() => {
    if (!isTxConfirmed || !pendingTx || lastConfirmedTx.current === pendingTx) return;
    lastConfirmedTx.current = pendingTx;

    const confirmedAction = txAction;
    const shouldChainDeposit = confirmedAction === "approve" && pendingDepositAmount.current;
    const depositAmount = pendingDepositAmount.current;

    // Reset tx state
    setPendingTx(undefined);
    setTxAction(null);

    // Refetch on-chain data — stagger to give the RPC time to index
    const refetchAll = () => {
      refetchVault();
      refetchUser();
      refetchPool();
    };
    refetchAll();
    setTimeout(refetchAll, 2_000);
    setTimeout(refetchAll, 5_000);

    // Notify component
    if (onTxConfirmedRef.current) {
      onTxConfirmedRef.current(confirmedAction);
    }

    // Auto-chain: approval confirmed → fire deposit
    if (shouldChainDeposit && depositAmount) {
      pendingDepositAmount.current = null;
      setTimeout(() => {
        _executeDeposit(depositAmount);
      }, 2_000);
    } else {
      setIsProcessing(false);
      pendingDepositAmount.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxConfirmed, pendingTx]);

  // --- Parsed vault data ---
  const totalAssets = vaultReads?.[0]?.result as bigint | undefined;
  const totalSupply = vaultReads?.[1]?.result as bigint | undefined;
  const currentLeverage = vaultReads?.[2]?.result as bigint | undefined;
  const targetLeverage = vaultReads?.[3]?.result as bigint | undefined;
  const collateralBalance = vaultReads?.[4]?.result as bigint | undefined;
  const debtBalance = vaultReads?.[5]?.result as bigint | undefined;

  const healthFactor = poolData?.[5] as bigint | undefined;
  const totalCollateralBase = poolData?.[0] as bigint | undefined;
  const totalDebtBase = poolData?.[1] as bigint | undefined;

  const userUsdcBalance = userReads?.[0]?.result as bigint | undefined;
  const userAllowance = userReads?.[1]?.result as bigint | undefined;
  const userShares = userReads?.[2]?.result as bigint | undefined;

  const fmt = {
    tvl: totalAssets != null ? formatUnits(totalAssets, USDC_DECIMALS) : null,
    totalShares: totalSupply != null ? formatUnits(totalSupply, USDC_DECIMALS) : null,
    leverage:
      currentLeverage != null && currentLeverage > BigInt(0)
        ? (Number(currentLeverage) / Number(BPS)).toFixed(2)
        : null,
    targetLeverage:
      targetLeverage != null
        ? (Number(targetLeverage) / Number(BPS)).toFixed(1)
        : null,
    healthFactor:
      healthFactor != null && healthFactor > BigInt(0)
        ? (Number(healthFactor) / 1e18).toFixed(2)
        : null,
    collateralUsd:
      totalCollateralBase != null
        ? (Number(totalCollateralBase) / 1e8).toFixed(2)
        : null,
    debtUsd:
      totalDebtBase != null
        ? (Number(totalDebtBase) / 1e8).toFixed(2)
        : null,
    userUsdcBalance:
      userUsdcBalance != null
        ? formatUnits(userUsdcBalance, USDC_DECIMALS)
        : null,
    userShares:
      userShares != null ? formatUnits(userShares, USDC_DECIMALS) : null,
  };

  // --- Actions ---
  const ensureInkSepolia = useCallback(async (): Promise<boolean> => {
    if (chainId === INK_SEPOLIA_CHAIN_ID) return true;
    try {
      await switchChainAsync({ chainId: INK_SEPOLIA_CHAIN_ID });
      return true;
    } catch {
      setTxError("Please switch to Ink Sepolia to use the vault.");
      return false;
    }
  }, [chainId, switchChainAsync]);

  /** Internal: send just the deposit tx (no allowance check) */
  const _executeDeposit = async (amount: string) => {
    if (!address) return;
    try {
      const parsed = parseUnits(amount, USDC_DECIMALS);
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: "deposit",
        args: [parsed, address],
        chainId: INK_SEPOLIA_CHAIN_ID,
      });
      setPendingTx(hash);
      setTxAction("deposit");
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Deposit failed");
      setIsProcessing(false);
    }
  };

  /**
   * Deposit USDC into vault.
   * If allowance is insufficient, approves first then auto-chains the deposit
   * after the approval confirms on-chain — single click flow.
   */
  const deposit = useCallback(
    async (amount: string): Promise<{ success: boolean }> => {
      if (!address) return { success: false };
      setTxError(null);
      setIsProcessing(true);

      try {
        if (!(await ensureInkSepolia())) {
          setIsProcessing(false);
          return { success: false };
        }

        const parsed = parseUnits(amount, USDC_DECIMALS);

        // Check allowance — if insufficient, approve then auto-chain deposit
        if (userAllowance != null && userAllowance < parsed) {
          pendingDepositAmount.current = amount;
          const approveHash = await writeContractAsync({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: "approve",
            args: [VAULT_ADDRESS, parsed],
            chainId: INK_SEPOLIA_CHAIN_ID,
          });
          setPendingTx(approveHash);
          setTxAction("approve");
          return { success: true };
        }

        // Allowance sufficient — deposit directly
        const hash = await writeContractAsync({
          address: VAULT_ADDRESS,
          abi: vaultAbi,
          functionName: "deposit",
          args: [parsed, address],
          chainId: INK_SEPOLIA_CHAIN_ID,
        });
        setPendingTx(hash);
        setTxAction("deposit");
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Deposit failed";
        setTxError(msg);
        setIsProcessing(false);
        return { success: false };
      }
    },
    [address, ensureInkSepolia, writeContractAsync, userAllowance]
  );

  const withdraw = useCallback(
    async (shares: string): Promise<{ success: boolean }> => {
      if (!address) return { success: false };
      setTxError(null);
      setIsProcessing(true);

      try {
        if (!(await ensureInkSepolia())) {
          setIsProcessing(false);
          return { success: false };
        }

        const parsed = parseUnits(shares, USDC_DECIMALS);
        const hash = await writeContractAsync({
          address: VAULT_ADDRESS,
          abi: vaultAbi,
          functionName: "redeem",
          args: [parsed, address, address],
          chainId: INK_SEPOLIA_CHAIN_ID,
        });

        setPendingTx(hash);
        setTxAction("withdraw");
        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Withdrawal failed";
        setTxError(msg);
        setIsProcessing(false);
        return { success: false };
      }
    },
    [address, ensureInkSepolia, writeContractAsync]
  );

  const clearError = useCallback(() => setTxError(null), []);

  return {
    isConnected,
    isOnInkSepolia,
    address,

    totalAssets,
    totalSupply,
    currentLeverage,
    targetLeverage,
    collateralBalance,
    debtBalance,
    healthFactor,
    totalCollateralBase,
    totalDebtBase,

    userUsdcBalance,
    userAllowance,
    userShares,

    fmt,

    pendingTx,
    txAction,
    txError,
    isProcessing: isProcessing || isTxConfirming,
    isTxConfirming,

    deposit,
    withdraw,
    clearError,
    refetchVault,
    refetchUser,

    /** Set a callback to be notified when a tx confirms on-chain */
    onTxConfirmed: (cb: (action: TxAction) => void) => {
      onTxConfirmedRef.current = cb;
    },
  };
}
