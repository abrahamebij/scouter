"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  OrderKind,
  OrderStatus,
  type Trade,
} from "@cowprotocol/cow-sdk";
import type { QuoteAndPost } from "@cowprotocol/cow-sdk";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useCowSdk } from "./useCowSdk";
import {
  getSpotChainConfig,
  getSpotChainOptions,
  getXStockToken,
  type SpotChainId,
} from "@/lib/config/xstocks";
import type { SwapStep } from "@/lib/spot/types";

const DEFAULT_SLIPPAGE_BPS = 50;
const QUOTE_DEBOUNCE_MS = 350;
const QUOTE_REFRESH_INTERVAL_MS = 15_000;
const QUOTE_STALE_AFTER_S = 30;
const ORDER_REFRESH_INTERVAL_MS = 8_000;

interface QuoteData {
  buyAmount: string;
  buyAmountRaw: string;
  pricePerToken: number;
  minReceived: string;
  quoteAndPost: QuoteAndPost | null;
  fetchedAt: number;
}

type SwapOrderState = "idle" | "submitted" | "partially-filled" | "filled" | "cancelled" | "expired";

interface ErrorWithResponse {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

function formatOrderState(status: SwapOrderState, trades: Trade[]): string {
  switch (status) {
    case "submitted":
      return trades.length > 0 ? "Order open" : "Order submitted";
    case "partially-filled":
      return "Partially filled";
    case "filled":
      return "Order filled";
    case "cancelled":
      return "Order cancelled";
    case "expired":
      return "Order expired";
    default:
      return "Order submitted";
  }
}

function buildNoQuoteMessage(chainName: string): string {
  return `No quote found on ${chainName}. Please increase the amount or try another spot chain.`;
}

function getErrorMessage(error: unknown, chainName: string): string {
  if (typeof error === "object" && error !== null) {
    const candidate = error as ErrorWithResponse;
    if (candidate.response?.status === 404) {
      return buildNoQuoteMessage(chainName);
    }
    if (typeof candidate.message === "string") {
      if (candidate.message.includes("Not Found")) {
        return buildNoQuoteMessage(chainName);
      }
      return candidate.message;
    }
  }

  return `Failed to get quote on ${chainName}`;
}

export function useSwap(symbol: string, spotChainId: SpotChainId) {
  const { address: account } = useAccount();
  const { isOnSelectedChain, isReady, tradingSdk, orderBookApi, cowChainId } = useCowSdk(spotChainId);

  const spotChain = useMemo(() => getSpotChainConfig(spotChainId), [spotChainId]);
  const token = useMemo(() => getXStockToken(symbol, spotChainId), [symbol, spotChainId]);
  const availableChains = useMemo(
    () => getSpotChainOptions(symbol).filter((chain) => chain.available),
    [symbol],
  );

  const [sellAmount, setSellAmount] = useState("");
  const [step, setStep] = useState<SwapStep>("idle");
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderChainId, setOrderChainId] = useState<SpotChainId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [quoteAge, setQuoteAge] = useState(0);
  const [priceUpdated, setPriceUpdated] = useState(false);
  const [isQuotePending, setIsQuotePending] = useState(false);
  const [orderState, setOrderState] = useState<SwapOrderState>("idle");
  const [orderStatusText, setOrderStatusText] = useState<string | null>(null);
  const [filledBuyAmount, setFilledBuyAmount] = useState<string | null>(null);
  const [filledSellAmount, setFilledSellAmount] = useState<string | null>(null);
  const [tradeTxHash, setTradeTxHash] = useState<string | null>(null);
  const [isTrackingOrder, setIsTrackingOrder] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refreshRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const ageRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const orderRefreshRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuotedKeyRef = useRef("");
  const inFlightQuoteKeyRef = useRef<string | null>(null);
  const inFlightOrderRef = useRef(false);
  const terminalOrderStateRef = useRef<SwapOrderState | null>(null);
  const prevPriceRef = useRef(0);

  const fetchPostableQuote = useCallback(async (): Promise<QuoteAndPost | null> => {
    if (!token || !account || !isReady) {
      return null;
    }

    const sellAmountWei = parseUnits(sellAmount, token.stablecoin.decimals).toString();

    try {
      return await tradingSdk.getQuote({
        chainId: cowChainId,
        kind: OrderKind.SELL,
        owner: account,
        amount: sellAmountWei,
        sellToken: token.stablecoin.address,
        sellTokenDecimals: token.stablecoin.decimals,
        buyToken: token.address,
        buyTokenDecimals: token.decimals,
        slippageBps: DEFAULT_SLIPPAGE_BPS,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare swap");
      setStep("error");
      return null;
    }
  }, [account, cowChainId, isReady, sellAmount, token, tradingSdk]);

  const refreshAllowance = useCallback(async (): Promise<boolean> => {
    if (!token || !account || !isReady) {
      return false;
    }

    setStep("checking-allowance");

    try {
      const currentAllowance = await tradingSdk.getCowProtocolAllowance({
        tokenAddress: token.stablecoin.address,
        owner: account,
        chainId: cowChainId,
      });
      const needed = parseUnits(sellAmount, token.stablecoin.decimals);

      setAllowance(currentAllowance);
      setStep(currentAllowance < needed ? "needs-approval" : "ready");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check allowance");
      setStep("error");
      return false;
    }
  }, [account, cowChainId, isReady, sellAmount, token, tradingSdk]);

  const fetchQuote = useCallback(
    async (opts?: { silent?: boolean }): Promise<boolean> => {
      if (!spotChain || !account) {
        setIsQuotePending(false);
        return false;
      }

      const amountValue = parseFloat(sellAmount || "0");
      if (amountValue <= 0) {
        setIsQuotePending(false);
        return false;
      }

      const quoteKey = `${symbol}:${spotChainId}:${sellAmount}`;
      if (inFlightQuoteKeyRef.current === quoteKey) {
        return false;
      }

      if (!token) {
        const fallback = availableChains
          .map((chain) => chain.name)
          .filter((name) => name !== spotChain.name)
          .join(" or ");
        const nextMessage = fallback
          ? `This asset is not currently available on ${spotChain.name}. Try ${fallback}.`
          : `This asset is not currently available on ${spotChain.name}.`;

        abortRef.current?.abort();
        setQuote(null);
        setAllowance(null);
        setPriceUpdated(false);
        setIsQuotePending(false);
        prevPriceRef.current = 0;
        setError(nextMessage);
        setStep("error");
        return false;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      inFlightQuoteKeyRef.current = quoteKey;

      if (!opts?.silent) {
        setStep("quoting");
        setError(null);
      }

      try {
        const sellAmountWei = parseUnits(sellAmount, token.stablecoin.decimals).toString();

        const quoteResults = await tradingSdk.getQuoteOnly({
          chainId: cowChainId,
          kind: OrderKind.SELL,
          owner: account,
          amount: sellAmountWei,
          sellToken: token.stablecoin.address,
          sellTokenDecimals: token.stablecoin.decimals,
          buyToken: token.address,
          buyTokenDecimals: token.decimals,
          slippageBps: DEFAULT_SLIPPAGE_BPS,
        });

        if (controller.signal.aborted) {
          return false;
        }

        const rawBuy = quoteResults.amountsAndCosts.afterNetworkCosts.buyAmount;
        const formatted = formatUnits(rawBuy, token.decimals);
        const sellNum = parseFloat(sellAmount);
        const buyNum = parseFloat(formatted);
        const price = buyNum > 0 ? sellNum / buyNum : 0;
        const minBuy = (rawBuy * BigInt(10000 - DEFAULT_SLIPPAGE_BPS)) / BigInt(10000);
        const minFormatted = formatUnits(minBuy, token.decimals);

        if (opts?.silent && prevPriceRef.current > 0) {
          const pctChange = Math.abs(price - prevPriceRef.current) / prevPriceRef.current;
          if (pctChange > 0.001) {
            setPriceUpdated(true);
            setTimeout(() => setPriceUpdated(false), 2_000);
          }
        }
        prevPriceRef.current = price;

        setQuote({
          buyAmount: buyNum.toFixed(6),
          buyAmountRaw: rawBuy.toString(),
          pricePerToken: price,
          minReceived: parseFloat(minFormatted).toFixed(6),
          quoteAndPost: null,
          fetchedAt: Date.now(),
        });
        setQuoteAge(0);
        setIsQuotePending(false);
        lastQuotedKeyRef.current = quoteKey;

        if (opts?.silent) {
          return true;
        }

        if (!isReady) {
          setAllowance(null);
          setStep("switch-chain");
          return true;
        }

        return refreshAllowance();
      } catch (err) {
        if (controller.signal.aborted) {
          return false;
        }

        setIsQuotePending(false);
        if (!opts?.silent) {
          setError(getErrorMessage(err, spotChain.name));
          setStep("error");
        }
        return false;
      } finally {
        if (inFlightQuoteKeyRef.current === quoteKey) {
          inFlightQuoteKeyRef.current = null;
        }
      }
    },
    [account, availableChains, cowChainId, isReady, refreshAllowance, sellAmount, spotChain, spotChainId, symbol, token, tradingSdk],
  );

  useEffect(() => {
    setSellAmount("");
    setStep("idle");
    setQuote(null);
    setOrderId(null);
    setOrderChainId(null);
    setError(null);
    setAllowance(null);
    setQuoteAge(0);
    setPriceUpdated(false);
    setIsQuotePending(false);
    terminalOrderStateRef.current = null;
    setOrderState("idle");
    setOrderStatusText(null);
    setFilledBuyAmount(null);
    setFilledSellAmount(null);
    setTradeTxHash(null);
    setIsTrackingOrder(false);
    lastQuotedKeyRef.current = "";
    inFlightQuoteKeyRef.current = null;
    inFlightOrderRef.current = false;
    prevPriceRef.current = 0;
  }, [symbol]);

  useEffect(() => {
    setStep("idle");
    setQuote(null);
    setOrderId(null);
    setOrderChainId(null);
    setError(null);
    setAllowance(null);
    setQuoteAge(0);
    setPriceUpdated(false);
    setIsQuotePending(false);
    terminalOrderStateRef.current = null;
    setOrderState("idle");
    setOrderStatusText(null);
    setFilledBuyAmount(null);
    setFilledSellAmount(null);
    setTradeTxHash(null);
    setIsTrackingOrder(false);
    lastQuotedKeyRef.current = "";
    inFlightQuoteKeyRef.current = null;
    inFlightOrderRef.current = false;
    prevPriceRef.current = 0;
  }, [spotChainId]);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    const amountValue = parseFloat(sellAmount || "0");
    if (!spotChain || !account || amountValue <= 0) {
      setQuote(null);
      setPriceUpdated(false);
      setIsQuotePending(false);
      prevPriceRef.current = 0;
      setStep("idle");
      lastQuotedKeyRef.current = "";
      inFlightQuoteKeyRef.current = null;
      return;
    }

    const key = `${symbol}:${spotChainId}:${sellAmount}`;
    if (key === lastQuotedKeyRef.current || key === inFlightQuoteKeyRef.current) {
      return;
    }

    setIsQuotePending(true);
    setStep("quoting");
    setError(null);

    debounceRef.current = setTimeout(() => {
      void fetchQuote();
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [account, fetchQuote, sellAmount, spotChain, spotChainId, symbol]);

  useEffect(() => {
    clearInterval(refreshRef.current);

    if (!quote || (step !== "ready" && step !== "needs-approval" && step !== "switch-chain")) {
      return;
    }

    refreshRef.current = setInterval(() => {
      void fetchQuote({ silent: true });
    }, QUOTE_REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshRef.current);
  }, [fetchQuote, quote, step]);

  useEffect(() => {
    clearInterval(ageRef.current);

    if (!quote) {
      setQuoteAge(0);
      return;
    }

    ageRef.current = setInterval(() => {
      setQuoteAge(Math.floor((Date.now() - quote.fetchedAt) / 1000));
    }, 1000);

    return () => clearInterval(ageRef.current);
  }, [quote]);

  useEffect(() => {
    if (!quote || !isReady || step !== "switch-chain") {
      return;
    }

    void refreshAllowance();
  }, [isReady, quote, refreshAllowance, step]);

  const refreshOrderStatus = useCallback(async () => {
    if (!orderId || !token || inFlightOrderRef.current) {
      return;
    }

    try {
      inFlightOrderRef.current = true;
      setIsTrackingOrder(true);
      const [order, trades] = await Promise.all([
        tradingSdk.getOrder({ orderUid: orderId, chainId: cowChainId }),
        orderBookApi.getTrades({ orderUid: orderId }),
      ]);

      let nextOrderState: SwapOrderState;
      switch (order.status) {
        case OrderStatus.FULFILLED:
          nextOrderState = "filled";
          break;
        case OrderStatus.CANCELLED:
          nextOrderState = "cancelled";
          break;
        case OrderStatus.EXPIRED:
          nextOrderState = "expired";
          break;
        default:
          nextOrderState = trades.length > 0 ? "partially-filled" : "submitted";
          break;
      }

      if (
        terminalOrderStateRef.current &&
        terminalOrderStateRef.current !== nextOrderState
      ) {
        return;
      }

      const nextFilledBuyAmount = formatUnits(BigInt(order.executedBuyAmount), token.decimals);
      const nextFilledSellAmount = formatUnits(BigInt(order.executedSellAmount), token.stablecoin.decimals);
      const latestTrade = trades[trades.length - 1];

      setFilledBuyAmount(nextFilledBuyAmount);
      setFilledSellAmount(nextFilledSellAmount);
      setTradeTxHash(latestTrade?.txHash ?? null);
      setOrderState(nextOrderState);
      setOrderStatusText(formatOrderState(nextOrderState, trades));

      if (
        nextOrderState === "filled" ||
        nextOrderState === "cancelled" ||
        nextOrderState === "expired"
      ) {
        terminalOrderStateRef.current = nextOrderState;
        clearInterval(orderRefreshRef.current);
      }
    } catch {
      // Submitted orders can take a moment to propagate across the orderbook API.
    } finally {
      inFlightOrderRef.current = false;
      setIsTrackingOrder(false);
    }
  }, [cowChainId, orderBookApi, orderId, token, tradingSdk]);

  useEffect(() => {
    clearInterval(orderRefreshRef.current);

    if (!orderId) {
      return;
    }

    void refreshOrderStatus();
    orderRefreshRef.current = setInterval(() => {
      void refreshOrderStatus();
    }, ORDER_REFRESH_INTERVAL_MS);

    return () => clearInterval(orderRefreshRef.current);
  }, [orderId, refreshOrderStatus]);

  const approve = useCallback(async () => {
    if (!token || !account || !isReady) {
      return;
    }

    setStep("approving");
    setError(null);

    try {
      const amount = parseUnits(sellAmount, token.stablecoin.decimals);
      await tradingSdk.approveCowProtocol({
        tokenAddress: token.stablecoin.address,
        amount,
        chainId: cowChainId,
      });
      await refreshAllowance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
      setStep("needs-approval");
    }
  }, [account, cowChainId, isReady, refreshAllowance, sellAmount, token, tradingSdk]);

  const submitSwap = useCallback(async () => {
    if (!quote || !isReady) {
      return;
    }

    setStep("posting");
    setError(null);

    try {
      const quoteAndPost = quote.quoteAndPost ?? (await fetchPostableQuote());
      if (!quoteAndPost) {
        return;
      }

      setQuote((currentQuote) =>
        currentQuote
          ? {
              ...currentQuote,
              quoteAndPost,
              fetchedAt: Date.now(),
            }
          : currentQuote,
      );

      const result = await quoteAndPost.postSwapOrderFromQuote();
      if (result) {
        inFlightOrderRef.current = false;
        terminalOrderStateRef.current = null;
        setOrderId(result.orderId);
        setOrderChainId(spotChainId);
        setOrderState("submitted");
        setOrderStatusText("Order submitted");
        setFilledBuyAmount("0");
        setFilledSellAmount("0");
        setTradeTxHash(null);
        setStep("submitted");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order submission failed");
      setStep("error");
    }
  }, [fetchPostableQuote, isReady, quote, spotChainId]);

  const reset = useCallback(() => {
    clearInterval(orderRefreshRef.current);
    setSellAmount("");
    setStep("idle");
    setQuote(null);
    setOrderId(null);
    setOrderChainId(null);
    setError(null);
    setQuoteAge(0);
    setPriceUpdated(false);
    setIsQuotePending(false);
    setOrderState("idle");
    setOrderStatusText(null);
    setFilledBuyAmount(null);
    setFilledSellAmount(null);
    setTradeTxHash(null);
    setIsTrackingOrder(false);
    lastQuotedKeyRef.current = "";
    inFlightQuoteKeyRef.current = null;
    prevPriceRef.current = 0;
  }, []);

  const isQuoteStale = quoteAge > QUOTE_STALE_AFTER_S;
  const orderExplorerUrl = orderId
    ? `${getSpotChainConfig(orderChainId ?? spotChainId)?.orderExplorerBaseUrl}/${orderId}`
    : null;

  return {
    sellAmount,
    setSellAmount,
    step,
    buyAmount: quote?.buyAmount ?? "",
    buyAmountRaw: quote?.buyAmountRaw ?? "",
    pricePerToken: quote?.pricePerToken ?? 0,
    minReceived: quote?.minReceived ?? "",
    slippageBps: DEFAULT_SLIPPAGE_BPS,
    quoteAge,
    isQuoteStale,
    isQuotePending,
    priceUpdated,
    orderId,
    orderState,
    orderStatusText,
    filledBuyAmount,
    filledSellAmount,
    tradeTxHash,
    isTrackingOrder,
    error,
    allowance,
    token,
    spotChain,
    availableChains,
    isOnSelectedChain,
    isReady,
    approve,
    submitSwap,
    refreshQuote: () => fetchQuote(),
    refreshOrderStatus,
    reset,
    orderExplorerUrl,
  };
}
