"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createClient,
  executeRoute,
  getRoutes,
  resumeRoute,
  type Route,
  type RouteExtended,
  type SDKClient,
} from "@lifi/sdk";
import { EthereumProvider } from "@lifi/sdk-provider-ethereum";
import { getConnectorClient } from "@wagmi/core";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { HL_CONFIG } from "@/lib/config/hyperliquid";
import { BRIDGE_DESTINATIONS, BRIDGE_SOURCE_CHAINS } from "@/lib/config/xstocks";
import {
  getMainUserState,
  getUserState as getDexUserState,
  moveUsdcAmountToDex,
} from "@/lib/hyperliquid/execution";
import type { TradeMode, BridgeStatus } from "@/lib/spot/types";

function toUsdcUnits(value: string): bigint {
  return parseUnits(value, 6);
}

async function waitForCoreBalanceIncrease(
  address: `0x${string}`,
  baseline: bigint,
): Promise<bigint | null> {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const state = await getMainUserState(address);
    const current = toUsdcUnits(state.withdrawable);
    if (current > baseline) {
      return current - baseline;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 2_000));
  }

  return null;
}

export function useBridge(mode: TradeMode) {
  const { address, chainId: connectedChainId } = useAccount();
  const wagmiConfig = useConfig();
  const { switchChainAsync } = useSwitchChain();
  const destination = mode === "perp" ? BRIDGE_DESTINATIONS.perp : BRIDGE_DESTINATIONS.spot;

  const [routes, setRoutes] = useState<Route[]>([]);
  const [isQuoting, setIsQuoting] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [status, setStatus] = useState<BridgeStatus>("idle");
  const [message, setMessage] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [fundingTxHash, setFundingTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coreBalance, setCoreBalance] = useState("0");
  const [xyzBalance, setXyzBalance] = useState("0");
  const [isMovingCoreBalance, setIsMovingCoreBalance] = useState(false);

  const clientRef = useRef<SDKClient | null>(null);
  const latestRouteRef = useRef<Route | null>(null);
  const latestTxHashRef = useRef<string | null>(null);
  const preBridgeCoreBalanceRef = useRef<bigint | null>(null);

  const refreshFundingBalances = useCallback(async () => {
    if (!address || mode !== "perp") {
      setCoreBalance("0");
      setXyzBalance("0");
      return;
    }

    const [mainState, xyzState] = await Promise.all([
      getMainUserState(address as `0x${string}`),
      getDexUserState(address as `0x${string}`),
    ]);

    setCoreBalance(mainState.withdrawable);
    setXyzBalance(xyzState.withdrawable);
  }, [address, mode]);

  useEffect(() => {
    if (!address || mode !== "perp") {
      setCoreBalance("0");
      setXyzBalance("0");
      return;
    }

    void refreshFundingBalances();
  }, [address, mode, refreshFundingBalances]);

  const ensureClient = useCallback(async () => {
    if (!clientRef.current) {
      clientRef.current = createClient({ integrator: "xprime" });
    }

    clientRef.current.setProviders([
      EthereumProvider({
        getWalletClient: async () => {
          return getConnectorClient(wagmiConfig, {
            account: address,
            chainId: connectedChainId,
            assertChainId: false,
          });
        },
        switchChain: async (chainId: number) => {
          const chain = await switchChainAsync({ chainId });
          return getConnectorClient(wagmiConfig, {
            account: address,
            chainId: chain.id,
          });
        },
      }),
    ]);

    return clientRef.current;
  }, [address, connectedChainId, switchChainAsync, wagmiConfig]);

  const getAvailableRoutes = useCallback(
    async (fromChainId: number, amountRaw: string) => {
      if (!address) return;

      const sourceChain = BRIDGE_SOURCE_CHAINS.find(
        (chain) => chain.chainId === fromChainId
      );
      if (!sourceChain) return;

      setIsQuoting(true);
      setStatus("quoting");
      setMessage("");
      setError(null);
      setRoutes([]);
      setSelectedRoute(null);

      try {
        const client = await ensureClient();
        const routeResponse = await getRoutes(client, {
          fromAddress: address,
          toAddress: address,
          fromChainId: sourceChain.chainId,
          toChainId: destination.chainId,
          fromAmount: amountRaw,
          fromTokenAddress: sourceChain.usdc,
          toTokenAddress: destination.token.address,
          options: {
            integrator: "xprime",
            order: "CHEAPEST",
            maxPriceImpact: 0.4,
            allowSwitchChain: true,
            executionType: "all",
            slippage: 0.03,
          },
        });

        const available = routeResponse.routes ?? [];
        setRoutes(available);
        setSelectedRoute(available[0] ?? null);
        latestRouteRef.current = available[0] ?? null;
        setStatus("idle");
      } catch (err) {
        const rawMessage =
          err instanceof Error ? err.message : "Failed to get bridge routes";
        const msg =
          sourceChain.chainId === 8453 && rawMessage.includes("Could not find token")
            ? "LI.FI could not resolve Base USDC in this SDK build. Try Arbitrum, Ethereum, Optimism, or Polygon for now."
            : rawMessage;
        setError(msg);
        setStatus("error");
      } finally {
        setIsQuoting(false);
      }
    },
    [address, destination.chainId, destination.token.address, ensureClient]
  );

  const execute = useCallback(
    async (route?: Route): Promise<boolean> => {
      const routeToExecute = route ?? latestRouteRef.current ?? selectedRoute;
      if (!routeToExecute) return false;

      setStatus("executing");
      setMessage("Preparing transaction...");
      setError(null);
      setTxHash(null);
      setFundingTxHash(null);
      latestTxHashRef.current = null;

      if (mode === "perp" && address) {
        const mainState = await getMainUserState(address as `0x${string}`);
        preBridgeCoreBalanceRef.current = toUsdcUnits(mainState.withdrawable);
      }

      try {
        const client = await ensureClient();

        const runRoute =
          status === "error" && latestRouteRef.current?.id === routeToExecute.id
            ? resumeRoute
            : executeRoute;

        await runRoute(client, routeToExecute, {
          disableMessageSigning: true,
          acceptExchangeRateUpdateHook: async () => true,
          updateRouteHook: (update: RouteExtended) => {
            latestRouteRef.current = update;
            setSelectedRoute((current) => (current?.id === update.id ? update : current));
            setRoutes((current) =>
              current.map((currentRoute) =>
                currentRoute.id === update.id ? update : currentRoute
              )
            );

            const steps = update.steps ?? [];
            for (const step of steps) {
              const execution = step.execution;
              if (!execution) continue;

              const processes = execution.process ?? [];
              const latestProcess = processes[processes.length - 1];

              if (latestProcess?.message) {
                setMessage(latestProcess.message);
              }
              if (latestProcess?.txHash) {
                latestTxHashRef.current = latestProcess.txHash;
                setTxHash(latestProcess.txHash);
              }

              if (execution.status === "DONE") {
                setStatus("done");
                setMessage(destination.completionMessage);
              } else if (execution.status === "FAILED") {
                setError(latestProcess?.message ?? "Bridge failed");
                setStatus("error");
              }
            }
          },
        });

        if (mode === "perp" && address) {
          setStatus("executing");
          setMessage("Checking Hyperliquid Core balance...");

          const baseline = preBridgeCoreBalanceRef.current ?? BigInt(0);
          const detectedIncrease = await waitForCoreBalanceIncrease(
            address as `0x${string}`,
            baseline,
          );

          if (!detectedIncrease || detectedIncrease <= BigInt(0)) {
            throw new Error("Bridge reached Hyperliquid Core, but the new Core balance was not detected.");
          }

          setMessage("Moving funds into Hyperliquid XYZ...");
          const transferResult = await moveUsdcAmountToDex(
            address as `0x${string}`,
            formatUnits(detectedIncrease, 6),
            HL_CONFIG.DEX_NAME,
            connectedChainId ?? 1,
          );

          if (transferResult.transferTxHash) {
            setFundingTxHash(transferResult.transferTxHash);
          }

          await refreshFundingBalances();
          setStatus("done");
          setMessage(
            `${transferResult.amount} USDC is now available in Hyperliquid XYZ.`
          );
          return true;
        }

        setStatus((prev) => (prev === "error" ? prev : "done"));
        setMessage((prev) => prev || destination.completionMessage);
        return true;
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : "Bridge execution failed";
        const msg = rawMessage.includes("Permit amount does not match the amount in the quote")
          ? "Route changed before signing. Please refresh the quote and try again."
          : rawMessage;

        if (rawMessage.includes("Permit amount does not match the amount in the quote")) {
          setRoutes([]);
          setSelectedRoute(null);
        }

        if (mode === "perp") {
          await refreshFundingBalances();
          setError(`Bridge reached Hyperliquid Core, but automatic funding into ${HL_CONFIG.DEX_NAME.toUpperCase()} failed: ${msg}`);
          setStatus("error");
          return false;
        }

        setError(msg);
        setStatus("error");
        return false;
      }
    },
    [
      address,
      connectedChainId,
      destination.completionMessage,
      ensureClient,
      mode,
      refreshFundingBalances,
      selectedRoute,
      status,
    ]
  );

  const moveAvailableCoreBalanceToXyz = useCallback(async (): Promise<boolean> => {
    if (!address || mode !== "perp") {
      return false;
    }

    const available = toUsdcUnits(coreBalance);
    if (available <= BigInt(0)) {
      setError("No Hyperliquid Core balance is available to move into XYZ.");
      return false;
    }

    setIsMovingCoreBalance(true);
    setError(null);
    setFundingTxHash(null);
    setStatus("executing");
    setMessage("Moving available Hyperliquid Core balance into XYZ...");

    try {
      const transferResult = await moveUsdcAmountToDex(
        address as `0x${string}`,
        formatUnits(available, 6),
        HL_CONFIG.DEX_NAME,
        connectedChainId ?? 1,
      );

      if (transferResult.transferTxHash) {
        setFundingTxHash(transferResult.transferTxHash);
      }

      await refreshFundingBalances();
      setStatus("done");
      setMessage(`${transferResult.amount} USDC is now available in Hyperliquid XYZ.`);
      return true;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Failed to move Hyperliquid Core balance.";
      setError(rawMessage);
      setStatus("error");
      return false;
    } finally {
      setIsMovingCoreBalance(false);
    }
  }, [address, connectedChainId, coreBalance, mode, refreshFundingBalances]);

  const reset = useCallback(() => {
    latestRouteRef.current = null;
    latestTxHashRef.current = null;
    setRoutes([]);
    setSelectedRoute(null);
    setStatus("idle");
    setMessage("");
    setTxHash(null);
    setFundingTxHash(null);
    setError(null);
    setIsQuoting(false);
  }, []);

  return {
    destination,
    routes,
    selectedRoute,
    setSelectedRoute,
    isQuoting,
    status,
    message,
    txHash,
    fundingTxHash,
    error,
    coreBalance,
    xyzBalance,
    isMovingCoreBalance,
    refreshFundingBalances,
    moveAvailableCoreBalanceToXyz,
    getRoutes: getAvailableRoutes,
    execute,
    reset,
    formatBridgeAmount: (amount: string) =>
      formatUnits(BigInt(amount), destination.token.decimals),
    parseBridgeAmount: (amount: string) =>
      parseUnits(amount, destination.token.decimals).toString(),
  };
}
