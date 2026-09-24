"use client";

import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import type { PrivateKeyAccount } from "viem/accounts";
import { ARBITRUM_CHAIN_ID } from "@/lib/config/appkit";
import { HL_CONFIG, toSymbol } from "@/lib/config/hyperliquid";
import {
  ensureApprovedAgent,
  getStoredAgent,
  isAgentApproved,
  clearAgent,
} from "@/lib/hyperliquid/agent";
import { simulateImmediateMarketFill } from "@/lib/hyperliquid/marketFill";
import {
  placeOrder,
  cancelOrder,
  getUserState,
  getUserOrders,
  getL2BookSnapshot,
  type OrderResult,
  type CancelResult,
} from "@/lib/hyperliquid/execution";
import type { OrderParams, UserPosition, UserOrder, UserState } from "@/lib/hyperliquid/types";

const USER_SYNC_INTERVAL_MS = 30_000;
const USER_WS_PING_INTERVAL_MS = 30_000;
const USER_WS_RECONNECT_DELAY_MS = 3_000;

export interface TradingState {
  agent: PrivateKeyAccount | null;
  isApproved: boolean;
  isInitializing: boolean;
  hasLoadedUserState: boolean;
  positions: UserPosition[];
  orders: UserOrder[];
  equity: string;
  accountValue: string;
  totalRawUsd: string;
  totalMarginUsed: string;
  crossAccountValue: string;
  crossMarginUsed: string;
  crossMaintenanceMarginUsed: string;
  unrealizedPnl: string;
  withdrawable: string;
  error: string | null;
}

interface TradingContextValue extends TradingState {
  isConnected: boolean;
  isOnArbitrum: boolean;
  address?: `0x${string}`;
  initializeAgent: () => Promise<boolean>;
  submitOrder: (params: OrderParams) => Promise<OrderResult>;
  submitCancel: (symbol: string, orderId: number) => Promise<CancelResult>;
  closePosition: (position: UserPosition) => Promise<OrderResult>;
  resetAgent: () => void;
}

const INITIAL_STATE: TradingState = {
  agent: null,
  isApproved: false,
  isInitializing: false,
  hasLoadedUserState: false,
  positions: [],
  orders: [],
  equity: "0",
  accountValue: "0",
  totalRawUsd: "0",
  totalMarginUsed: "0",
  crossAccountValue: "0",
  crossMarginUsed: "0",
  crossMaintenanceMarginUsed: "0",
  unrealizedPnl: "0",
  withdrawable: "0",
  error: null,
};

const TradingContext = createContext<TradingContextValue | null>(null);

interface ClearinghouseStateEventPayload {
  dex: string;
  user: `0x${string}`;
  clearinghouseState: UserState;
}

interface OpenOrdersEventPayload {
  dex: string;
  user: `0x${string}`;
  orders: UserOrder[];
}

export function TradingProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const [state, setState] = useState<TradingState>(INITIAL_STATE);
  const isOnArbitrum = chainId === ARBITRUM_CHAIN_ID;

  const applyUserState = useCallback((userState: UserState) => {
    const positions = userState.assetPositions
      .map((ap) => ap.position)
      .filter((p) => parseFloat(p.szi) !== 0);
    const unrealizedPnl = positions.reduce((sum, position) => {
      return sum + parseFloat(position.unrealizedPnl || "0");
    }, 0);

    setState((prev) => ({
      ...prev,
      hasLoadedUserState: true,
      positions,
      equity: String(userState.marginSummary.accountValue),
      accountValue: String(userState.marginSummary.accountValue),
      totalRawUsd: String(userState.marginSummary.totalRawUsd),
      totalMarginUsed: String(userState.marginSummary.totalMarginUsed),
      crossAccountValue: String(userState.crossMarginSummary.accountValue),
      crossMarginUsed: String(userState.crossMarginSummary.totalMarginUsed),
      crossMaintenanceMarginUsed: String(userState.crossMaintenanceMarginUsed),
      unrealizedPnl: String(unrealizedPnl),
      withdrawable: String(userState.withdrawable),
    }));
  }, []);

  const applyOpenOrders = useCallback((orders: UserOrder[]) => {
    setState((prev) => ({ ...prev, orders }));
  }, []);

  const syncUserData = useCallback(async (signal?: AbortSignal) => {
    if (!address) {
      return;
    }

    const [userState, openOrders] = await Promise.all([
      getUserState(address, signal),
      getUserOrders(address, signal),
    ]);

    applyUserState(userState);
    applyOpenOrders(openOrders);
  }, [address, applyOpenOrders, applyUserState]);

  useEffect(() => {
    if (!isConnected || !address) {
      const resetTimer = window.setTimeout(() => {
        setState(INITIAL_STATE);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const existing = getStoredAgent(address);
    if (!existing) {
      return;
    }

    const timer = window.setTimeout(() => {
      const approved = isAgentApproved(address);
      setState((prev) => ({
        ...prev,
        agent: existing,
        isApproved: approved,
      }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [address, isConnected]);

  useEffect(() => {
    if (!address || !isConnected) {
      return;
    }

    const controller = new AbortController();
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let disposed = false;

    const subscribe = (socket: WebSocket, subscription: Record<string, string>) => {
      socket.send(JSON.stringify({ method: "subscribe", subscription }));
    };

    const connect = () => {
      if (disposed) return;

      try {
        ws = new WebSocket(HL_CONFIG.WS_URL);

        ws.onopen = () => {
          subscribe(ws as WebSocket, {
            type: "clearinghouseState",
            user: address,
            dex: HL_CONFIG.DEX_NAME,
          });
          subscribe(ws as WebSocket, {
            type: "openOrders",
            user: address,
            dex: HL_CONFIG.DEX_NAME,
          });
          pingTimer = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ method: "ping" }));
            }
          }, USER_WS_PING_INTERVAL_MS);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as {
              channel?: string;
              data?: unknown;
            };

            if (msg.channel === "clearinghouseState") {
              const data = msg.data as ClearinghouseStateEventPayload | undefined;
              if (data?.user?.toLowerCase() === address.toLowerCase() && data.dex === HL_CONFIG.DEX_NAME) {
                applyUserState(data.clearinghouseState);
              }
              return;
            }

            if (msg.channel === "openOrders") {
              const data = msg.data as OpenOrdersEventPayload | undefined;
              if (data?.user?.toLowerCase() === address.toLowerCase() && data.dex === HL_CONFIG.DEX_NAME) {
                applyOpenOrders(data.orders);
              }
            }
          } catch {
            // Ignore malformed frames.
          }
        };

        ws.onclose = () => {
          if (pingTimer) clearInterval(pingTimer);
          if (!disposed) {
            reconnectTimer = setTimeout(connect, USER_WS_RECONNECT_DELAY_MS);
          }
        };

        ws.onerror = () => {
          // onclose handles reconnect
        };
      } catch {
        if (!disposed) {
          reconnectTimer = setTimeout(connect, USER_WS_RECONNECT_DELAY_MS);
        }
      }
    };

    const initialSyncTimer = setTimeout(() => {
      void syncUserData(controller.signal).catch(() => {});
    }, 0);
    const syncInterval = setInterval(() => {
      void syncUserData(controller.signal).catch(() => {});
    }, USER_SYNC_INTERVAL_MS);
    connect();

    return () => {
      disposed = true;
      controller.abort();
      clearInterval(syncInterval);
      clearTimeout(initialSyncTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingTimer) clearInterval(pingTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [address, isConnected, applyOpenOrders, applyUserState, syncUserData]);

  const ensureArbitrum = useCallback(async (): Promise<boolean> => {
    if (chainId === ARBITRUM_CHAIN_ID) {
      return true;
    }

    try {
      await switchChainAsync({ chainId: ARBITRUM_CHAIN_ID });
      return true;
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Please switch to Arbitrum to enable trading. Hyperliquid requires Arbitrum for signing.",
      }));
      return false;
    }
  }, [chainId, switchChainAsync]);

  const initializeAgent = useCallback(async (): Promise<boolean> => {
    if (!address || !isConnected) {
      setState((prev) => ({ ...prev, error: "Connect your wallet first" }));
      return false;
    }

    setState((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      const onArbitrum = await ensureArbitrum();
      if (!onArbitrum) {
        setState((prev) => ({ ...prev, isInitializing: false }));
        return false;
      }

      const agent = await ensureApprovedAgent(address);

      setState((prev) => ({
        ...prev,
        agent,
        isApproved: true,
        isInitializing: false,
        error: null,
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize agent";
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: message,
      }));
      return false;
    }
  }, [address, ensureArbitrum, isConnected]);

  const ensureTradingAgent = useCallback(async (): Promise<PrivateKeyAccount | null> => {
    let agent = state.agent;
    if (agent && state.isApproved) {
      return agent;
    }

    const ok = await initializeAgent();
    if (!ok) {
      return null;
    }

    agent = getStoredAgent(address ?? "");
    return agent ?? null;
  }, [address, initializeAgent, state.agent, state.isApproved]);

  const submitOrder = useCallback(async (params: OrderParams): Promise<OrderResult> => {
    const agent = await ensureTradingAgent();
    if (!agent) {
      return { success: false, error: state.error ?? "Agent setup failed" };
    }

    try {
      const result = await placeOrder(agent, params);
      void syncUserData().catch(() => {});
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Order failed";
      return { success: false, error: message };
    }
  }, [ensureTradingAgent, state.error, syncUserData]);

  const submitCancel = useCallback(async (symbol: string, orderId: number): Promise<CancelResult> => {
    const agent = state.agent;
    if (!agent) {
      return { success: false, error: "No agent. Initialize first." };
    }

    try {
      const result = await cancelOrder(agent, symbol, orderId);
      void syncUserData().catch(() => {});
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancel failed";
      return { success: false, error: message };
    }
  }, [state.agent, syncUserData]);

  const closePosition = useCallback(async (position: UserPosition): Promise<OrderResult> => {
    const agent = await ensureTradingAgent();
    if (!agent) {
      return { success: false, error: state.error ?? "Agent setup failed" };
    }

    const signedSize = parseFloat(position.szi);
    if (!Number.isFinite(signedSize) || signedSize === 0) {
      return { success: false, error: "Position size is zero." };
    }

    const symbol = toSymbol(position.coin);
    const isBuy = signedSize < 0;
    const size = Math.abs(signedSize);

    try {
      const book = await getL2BookSnapshot(symbol);
      const levels = isBuy ? book.asks : book.bids;
      const fill = simulateImmediateMarketFill(levels, size, "asset");

      if (!fill.hasLiquidity || fill.limitPrice <= 0) {
        const sideLabel = isBuy ? "ask" : "bid";
        return {
          success: false,
          error: `Only ${fill.assetSize.toFixed(4)} ${symbol} of immediate ${sideLabel} liquidity is available.`,
        };
      }

      const result = await placeOrder(agent, {
        symbol,
        isBuy,
        price: fill.limitPrice,
        size,
        reduceOnly: true,
        tif: "Ioc",
      });
      void syncUserData().catch(() => {});
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to close position";
      return { success: false, error: message };
    }
  }, [ensureTradingAgent, state.error, syncUserData]);

  const resetAgent = useCallback(() => {
    if (address) {
      clearAgent(address);
    }
    setState((prev) => ({ ...prev, agent: null, isApproved: false }));
  }, [address]);

  const value = useMemo<TradingContextValue>(() => ({
    ...state,
    isConnected,
    isOnArbitrum,
    address,
    initializeAgent,
    submitOrder,
    submitCancel,
    closePosition,
    resetAgent,
  }), [
    address,
    closePosition,
    initializeAgent,
    isConnected,
    isOnArbitrum,
    resetAgent,
    state,
    submitCancel,
    submitOrder,
  ]);

  return createElement(TradingContext.Provider, { value }, children);
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error("useTrading must be used within a TradingProvider");
  }
  return context;
}
