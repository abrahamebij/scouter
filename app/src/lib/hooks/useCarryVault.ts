"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  CARRY_VAULT_ADDRESS,
  SPYX_ADDRESS,
  ETH_MAINNET_CHAIN_ID,
  carryVaultAbi,
  erc20Abi,
} from "@/lib/contracts/carryVault";

const SPYX_DECIMALS = 18;
const AUSD_DECIMALS = 6;
const BPS = BigInt(10_000);

type TxAction = "approve" | "deposit" | "withdraw" | null;

export function useCarryVault() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const [txAction, setTxAction] = useState<TxAction>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingDepositAmount = useRef<string | null>(null);

  const isOnMainnet = chainId === ETH_MAINNET_CHAIN_ID;

  // --- Read vault state ---
  const { data: vaultReads, refetch: refetchVault } = useReadContracts({
    contracts: [
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "totalAssets",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "totalSupply",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "getCurrentLtv",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "targetLtv",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "getHealthFactor",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "collateralValue",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "debtValue",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "vaultDeposited",
        chainId: ETH_MAINNET_CHAIN_ID,
      },
    ],
    query: {
      refetchInterval: 15_000,
    },
  });

  // --- User-specific reads ---
  const { data: userReads, refetch: refetchUser } = useReadContracts({
    contracts: [
      {
        address: SPYX_ADDRESS,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: SPYX_ADDRESS,
        abi: erc20Abi,
        functionName: "allowance",
        args: [address!, CARRY_VAULT_ADDRESS],
        chainId: ETH_MAINNET_CHAIN_ID,
      },
      {
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "balanceOf",
        args: [address!],
        chainId: ETH_MAINNET_CHAIN_ID,
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
  const lastConfirmedTx = useRef<string | null>(null);
  const onTxConfirmedRef = useRef<((action: TxAction) => void) | null>(null);

  useEffect(() => {
    if (!isTxConfirmed || !pendingTx || lastConfirmedTx.current === pendingTx) return;
    lastConfirmedTx.current = pendingTx;

    const confirmedAction = txAction;
    const shouldChainDeposit = confirmedAction === "approve" && pendingDepositAmount.current;
    const depositAmount = pendingDepositAmount.current;

    setPendingTx(undefined);
    setTxAction(null);

    const refetchAll = () => {
      refetchVault();
      refetchUser();
    };
    refetchAll();
    setTimeout(refetchAll, 2_000);
    setTimeout(refetchAll, 5_000);

    if (onTxConfirmedRef.current) {
      onTxConfirmedRef.current(confirmedAction);
    }

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
  const currentLtv = vaultReads?.[2]?.result as bigint | undefined;
  const targetLtv = vaultReads?.[3]?.result as bigint | undefined;
  const healthFactor = vaultReads?.[4]?.result as bigint | undefined;
  const collateralVal = vaultReads?.[5]?.result as bigint | undefined;
  const debtVal = vaultReads?.[6]?.result as bigint | undefined;
  const vaultDeposited = vaultReads?.[7]?.result as bigint | undefined;

  const userSpyxBalance = userReads?.[0]?.result as bigint | undefined;
  const userAllowance = userReads?.[1]?.result as bigint | undefined;
  const userShares = userReads?.[2]?.result as bigint | undefined;

  const fmt = {
    tvl: totalAssets != null ? formatUnits(totalAssets, SPYX_DECIMALS) : null,
    totalShares: totalSupply != null ? formatUnits(totalSupply, AUSD_DECIMALS) : null,
    currentLtv:
      currentLtv != null && currentLtv > BigInt(0)
        ? (Number(currentLtv) / Number(BPS) * 100).toFixed(1)
        : null,
    targetLtv:
      targetLtv != null
        ? (Number(targetLtv) / Number(BPS) * 100).toFixed(0)
        : null,
    healthFactor:
      healthFactor != null && healthFactor > BigInt(0) && healthFactor < BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")
        ? (() => {
            // Contract returns lltv(1e18) * 1e18 / ltv(BPS) — need to correct to lltv/ltv
            // Divide by 1e18 and multiply by BPS/1e18 to normalize
            const hf = Number(healthFactor) / 1e18 / 1e18 * Number(BPS);
            return hf.toFixed(2);
          })()
        : null,
    collateralValue:
      collateralVal != null
        ? formatUnits(collateralVal, SPYX_DECIMALS)
        : null,
    debtValue:
      debtVal != null
        ? formatUnits(debtVal, AUSD_DECIMALS)
        : null,
    vaultDeposited:
      vaultDeposited != null
        ? formatUnits(vaultDeposited, AUSD_DECIMALS)
        : null,
    userSpyxBalance:
      userSpyxBalance != null
        ? formatUnits(userSpyxBalance, SPYX_DECIMALS)
        : null,
    userShares:
      userShares != null ? formatUnits(userShares, AUSD_DECIMALS) : null,
  };

  // --- Actions ---
  const ensureMainnet = useCallback(async (): Promise<boolean> => {
    if (chainId === ETH_MAINNET_CHAIN_ID) return true;
    try {
      await switchChainAsync({ chainId: ETH_MAINNET_CHAIN_ID });
      return true;
    } catch {
      setTxError("Please switch to Ethereum Mainnet.");
      return false;
    }
  }, [chainId, switchChainAsync]);

  const _executeDeposit = async (amount: string) => {
    if (!address) return;
    try {
      const parsed = parseUnits(amount, SPYX_DECIMALS);
      const hash = await writeContractAsync({
        address: CARRY_VAULT_ADDRESS,
        abi: carryVaultAbi,
        functionName: "deposit",
        args: [parsed, address],
        chainId: ETH_MAINNET_CHAIN_ID,
      });
      setPendingTx(hash);
      setTxAction("deposit");
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Deposit failed");
      setIsProcessing(false);
    }
  };

  const deposit = useCallback(
    async (amount: string): Promise<{ success: boolean }> => {
      if (!address) return { success: false };
      setTxError(null);
      setIsProcessing(true);

      try {
        if (!(await ensureMainnet())) {
          setIsProcessing(false);
          return { success: false };
        }

        const parsed = parseUnits(amount, SPYX_DECIMALS);

        if (userAllowance != null && userAllowance < parsed) {
          pendingDepositAmount.current = amount;
          const approveHash = await writeContractAsync({
            address: SPYX_ADDRESS,
            abi: erc20Abi,
            functionName: "approve",
            args: [CARRY_VAULT_ADDRESS, parsed],
            chainId: ETH_MAINNET_CHAIN_ID,
          });
          setPendingTx(approveHash);
          setTxAction("approve");
          return { success: true };
        }

        const hash = await writeContractAsync({
          address: CARRY_VAULT_ADDRESS,
          abi: carryVaultAbi,
          functionName: "deposit",
          args: [parsed, address],
          chainId: ETH_MAINNET_CHAIN_ID,
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
    [address, ensureMainnet, writeContractAsync, userAllowance]
  );

  const withdraw = useCallback(
    async (shares: string): Promise<{ success: boolean }> => {
      if (!address) return { success: false };
      setTxError(null);
      setIsProcessing(true);

      try {
        if (!(await ensureMainnet())) {
          setIsProcessing(false);
          return { success: false };
        }

        const parsed = parseUnits(shares, SPYX_DECIMALS);
        const hash = await writeContractAsync({
          address: CARRY_VAULT_ADDRESS,
          abi: carryVaultAbi,
          functionName: "redeem",
          args: [parsed, address, address],
          chainId: ETH_MAINNET_CHAIN_ID,
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
    [address, ensureMainnet, writeContractAsync]
  );

  const clearError = useCallback(() => setTxError(null), []);

  return {
    isConnected,
    isOnMainnet,
    address,

    totalAssets,
    totalSupply,
    currentLtv,
    targetLtv,
    healthFactor,
    collateralVal,
    debtVal,
    vaultDeposited,

    userSpyxBalance,
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

    onTxConfirmed: (cb: (action: TxAction) => void) => {
      onTxConfirmedRef.current = cb;
    },
  };
}
