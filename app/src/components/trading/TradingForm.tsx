"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";
import { useTrading } from "@/lib/hooks/useTrading";
import { getAssetMetaForSymbol } from "@/lib/hyperliquid/meta";
import { minOrderSize } from "@/lib/hyperliquid/formatting";
import type { AssetMeta } from "@/lib/hyperliquid/types";

type PositionType = "long" | "short";
type OrderType = "market" | "limit";

const HL_DEPOSIT_URL = "https://app.hyperliquid.xyz/portfolio";

interface TradingFormProps {
  symbol: string;
  currentPrice: number;
  bestBidPrice: number;
  bestAskPrice: number;
  onOpenBridge: () => void;
}

export default function TradingForm({
  symbol,
  currentPrice,
  bestBidPrice,
  bestAskPrice,
  onOpenBridge,
}: TradingFormProps) {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { toast } = useToast();
  const trading = useTrading();

  const [positionType, setPositionType] = useState<PositionType>("long");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [size, setSize] = useState("10");
  const [price, setPrice] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [sizeUnit, setSizeUnit] = useState<"asset" | "usdc">("usdc");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assetMeta, setAssetMeta] = useState<AssetMeta | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAssetMetaForSymbol(symbol, controller.signal)
      .then(setAssetMeta)
      .catch(() => {});
    return () => controller.abort();
  }, [symbol]);

  const maxLeverage = assetMeta?.maxLeverage ?? 40;
  const szDecimals = assetMeta?.szDecimals ?? 3;
  const minSize = minOrderSize(szDecimals);
  const availableBalance = parseFloat(trading.withdrawable);
  const accountValue = parseFloat(trading.accountValue);
  const safeAvailableBalance = Math.max(truncateDecimals(availableBalance, 2), 0);
  const isAccountSyncing = isConnected && trading.isApproved && !trading.hasLoadedUserState;
  const hasBalance = trading.hasLoadedUserState && (availableBalance > 0 || accountValue > 0);
  const marketExecutionPrice = positionType === "long" ? bestAskPrice : bestBidPrice;
  const hasMarketLiquidity = marketExecutionPrice > 0;
  const displayedMarketPrice = hasMarketLiquidity ? marketExecutionPrice : currentPrice;
  const maxEntryPrice =
    orderType === "market"
      ? displayedMarketPrice
      : parseFloat(price || "0") > 0
        ? parseFloat(price || "0")
        : displayedMarketPrice;
  const maxOpenSize =
    sizeUnit === "usdc"
      ? truncateDecimals(safeAvailableBalance * leverage, 2)
      : maxEntryPrice > 0
        ? truncateDecimals((safeAvailableBalance * leverage) / maxEntryPrice, szDecimals)
        : 0;

  const presetAmounts =
    sizeUnit === "usdc"
      ? ["10", "25", "50", "100"]
      : [minSize.toString(), (minSize * 5).toString(), (minSize * 50).toString(), (minSize * 100).toString()];

  const leverageMarks = [1, Math.round(maxLeverage * 0.25), Math.round(maxLeverage * 0.5), Math.round(maxLeverage * 0.75), maxLeverage];

  const orderValue = parseFloat(size || "0") * (sizeUnit === "usdc" ? 1 : displayedMarketPrice);
  const marginRequired = orderValue / leverage;

  useEffect(() => {
    if (leverage > maxLeverage) setLeverage(maxLeverage);
  }, [maxLeverage, leverage]);

  const validate = (): string | null => {
    if (!isConnected) return null;
    if (!trading.isApproved) return null;
    if (isAccountSyncing) return null;
    if (!hasBalance) return null;

    const sizeNum = parseFloat(size || "0");
    if (sizeNum <= 0) return "Enter a valid size";

    if (orderType === "market" && !hasMarketLiquidity) {
      return "Waiting for live orderbook liquidity...";
    }

    const effectivePrice = orderType === "market" ? marketExecutionPrice : parseFloat(price || "0");
    if (effectivePrice <= 0) return orderType === "limit" ? "Enter a valid price" : "Waiting for market price...";

    const assetSize = sizeUnit === "usdc" ? sizeNum / effectivePrice : sizeNum;
    if (assetSize < minSize) {
      return `Minimum size is ${minSize} ${symbol} (~$${(minSize * effectivePrice).toFixed(2)})`;
    }

    const notional = assetSize * effectivePrice;
    if (notional < 10) return "Minimum order value is $10";

    if (marginRequired - availableBalance > 1e-9) {
      return `Insufficient margin. Need $${formatDisplayedBalance(marginRequired)}, have $${formatDisplayedBalance(availableBalance)}`;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      open({ view: "Connect" });
      return;
    }

    if (!trading.isApproved) {
      const ok = await trading.initializeAgent();
      if (ok) toast("Trading enabled! You can now place orders.", "success");
      return;
    }

    if (isAccountSyncing) {
      toast("Syncing Hyperliquid account state...", "info");
      return;
    }

    if (!hasBalance) {
      onOpenBridge();
      toast("Bridge USDC to Hyperliquid Core to start trading", "info");
      return;
    }

    const error = validate();
    if (error) {
      toast(error, "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const effectivePrice = orderType === "market" ? marketExecutionPrice : parseFloat(price);
      const sizeNum = parseFloat(size);
      const assetSize = sizeUnit === "usdc" ? sizeNum / effectivePrice : sizeNum;
      const orderRequest = {
        symbol,
        isBuy: positionType === "long",
        price: effectivePrice,
        size: assetSize,
        reduceOnly,
        tif: orderType === "market" ? "Ioc" : "Gtc",
      } as const;

      console.info("[trade] form submit", {
        symbol,
        positionType,
        orderType,
        currentPrice,
        bestBidPrice,
        bestAskPrice,
        marketExecutionPrice,
        sizeInput: size,
        sizeUnit,
        parsedSize: sizeNum,
        assetSize,
        leverage,
        reduceOnly,
        orderRequest,
      });

      const result = await trading.submitOrder(orderRequest);

      if (result.success) {
        toast(`${positionType === "long" ? "Long" : "Short"} ${symbol} order placed`, "success");
        setSize("10");
        setSizeUnit("usdc");
      } else {
        toast(friendlyError(result.error ?? "Unknown error"), "error");
      }
    } catch (err) {
      toast(friendlyError(err instanceof Error ? err.message : "Order failed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationError = validate();
  const isDisabled = isSubmitting || trading.isInitializing || isAccountSyncing;

  const handleUseMax = () => {
    if (maxOpenSize <= 0) {
      return;
    }

    setSize(formatMaxSize(maxOpenSize, sizeUnit, szDecimals));
  };

  let buttonLabel: string;
  let buttonStyle: string;

  if (!isConnected) {
    buttonLabel = "Connect Wallet";
    buttonStyle = "primary-gradient text-on-primary";
  } else if (trading.isInitializing) {
    buttonLabel = "Setting Up...";
    buttonStyle = "bg-surface-container-high text-on-surface";
  } else if (isAccountSyncing) {
    buttonLabel = "Syncing Account...";
    buttonStyle = "bg-surface-container-high text-on-surface";
  } else if (!trading.isApproved) {
    buttonLabel = "Enable Trading";
    buttonStyle = "primary-gradient text-on-primary";
  } else if (!hasBalance) {
    buttonLabel = "Deposit to Trade";
    buttonStyle = "primary-gradient text-on-primary";
  } else if (isSubmitting) {
    buttonLabel = "Placing Order...";
    buttonStyle = positionType === "long" ? "primary-gradient text-on-primary" : "bg-error text-on-error";
  } else {
    buttonLabel = `${positionType === "long" ? "Long" : "Short"} ${symbol}`;
    buttonStyle = positionType === "long" ? "primary-gradient text-on-primary" : "bg-error text-on-error";
  }

  return (
    <div className="bg-surface-container-lowest rounded-b-xl border border-outline-variant/10 border-t-0 flex flex-col overflow-hidden">
      <div className="grid grid-cols-2">
        <button
          onClick={() => setPositionType("long")}
          className={`py-3.5 font-headline font-bold text-base transition-colors ${
            positionType === "long"
              ? "bg-primary/15 text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface bg-surface-container-lowest"
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setPositionType("short")}
          className={`py-3.5 font-headline font-bold text-base transition-colors ${
            positionType === "short"
              ? "bg-error/15 text-error border-b-2 border-error"
              : "text-on-surface-variant hover:text-on-surface bg-surface-container-lowest"
          }`}
        >
          Short
        </button>
      </div>

      <div className="p-4 space-y-4">
        {isConnected && !trading.isApproved && (
          <div className="flex items-start gap-2.5 text-sm font-body bg-secondary/5 rounded-lg px-4 py-2.5 border border-secondary/10">
            <MaterialIcon icon="lock_open" size="sm" className="text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5">Enable trading to get started</span>
              {!trading.isOnArbitrum
                ? "You’ll be asked to switch to Arbitrum, then sign two messages to create your trading agent."
                : "Sign two messages to create your trading agent. This is a one-time setup."}
            </div>
          </div>
        )}

        {isConnected && trading.isApproved && !hasBalance && (
          !isAccountSyncing && (
          <div className="flex items-start gap-2.5 text-sm font-body bg-primary/5 rounded-lg px-4 py-2.5 border border-primary/10">
            <MaterialIcon icon="account_balance_wallet" size="sm" className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5">No balance detected</span>
              <button onClick={onOpenBridge} className="text-primary hover:underline">
                Bridge USDC to Hyperliquid Core
              </button>{" "}
              to start trading stocks on XYZ.
            </div>
          </div>
          )
        )}

        {isAccountSyncing && (
          <div className="flex items-start gap-2.5 text-sm font-body bg-secondary/5 rounded-lg px-4 py-2.5 border border-secondary/10">
            <MaterialIcon icon="sync" size="sm" className="text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5">Syncing Hyperliquid account</span>
              Fetching your live balance, positions, and open orders.
            </div>
          </div>
        )}

        {isConnected && trading.isApproved && !hasMarketLiquidity && orderType === "market" && hasBalance && (
          <div className="flex items-start gap-2.5 text-sm font-body bg-secondary/5 rounded-lg px-4 py-2.5 border border-secondary/10">
            <MaterialIcon icon="hourglass_top" size="sm" className="text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5">Waiting for live orderbook</span>
              Market orders are enabled after the best bid and ask load for {symbol}.
            </div>
          </div>
        )}

        {isConnected && trading.isApproved && (
          <div className="flex justify-between text-xs font-label text-on-surface-variant">
            <span>
              Available:{" "}
              <span className={`font-bold ${isAccountSyncing ? "text-on-surface-variant" : hasBalance ? "text-on-surface" : "text-error"}`}>
                {isAccountSyncing ? "--" : `$${availableBalance > 0 ? availableBalance.toFixed(2) : "0.00"}`}
                {isAccountSyncing ? "--" : `$${formatDisplayedBalance(availableBalance)}`}
              </span>
            </span>
            <span>
              Account: <span className={`font-bold ${isAccountSyncing ? "text-on-surface-variant" : "text-on-surface"}`}>
                {isAccountSyncing ? "--" : `$${formatDisplayedBalance(accountValue)}`}
              </span>
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {(["market", "limit"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-label uppercase tracking-wider transition-colors ${
                orderType === type
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {orderType === "market" && displayedMarketPrice > 0 && (
          <div className="text-sm font-label text-on-surface-variant text-center">
            {positionType === "long" ? "Best Ask" : "Best Bid"}:{" "}
            <span className="text-on-surface font-bold">${displayedMarketPrice.toFixed(2)}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2.5">
            Size
          </label>
          <div className="flex overflow-hidden bg-surface-container rounded-lg border border-outline-variant/20 focus-within:border-primary transition-colors">
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="input-no-spin min-w-0 flex-1 bg-transparent px-4 py-2.5 text-base font-label outline-none"
              step="0.0001"
              placeholder="0"
            />
            <div className="flex shrink-0 items-stretch border-l border-outline-variant/20 bg-surface-container-high/30">
              <button
                onClick={handleUseMax}
                disabled={maxOpenSize <= 0}
                className="w-16 px-0 py-2.5 text-xs font-label uppercase tracking-[0.18em] text-primary hover:bg-surface-container-high/40 hover:text-on-surface transition-colors disabled:text-on-surface-variant/40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant/40"
              >
                Max
              </button>
              <button
                onClick={() => setSizeUnit(sizeUnit === "asset" ? "usdc" : "asset")}
                className="min-w-[92px] px-3 py-2.5 text-sm font-label text-on-surface-variant hover:bg-surface-container-high/40 hover:text-primary transition-colors border-l border-outline-variant/20 flex items-center justify-center gap-1.5"
              >
                {sizeUnit === "usdc" ? "USDC" : symbol}
                <MaterialIcon icon="swap_vert" size="sm" />
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs font-label text-on-surface-variant">
              {sizeUnit === "asset"
                ? `~$${(parseFloat(size || "0") * displayedMarketPrice).toFixed(2)}`
                : `~${displayedMarketPrice > 0 ? (parseFloat(size || "0") / displayedMarketPrice).toFixed(4) : "0"} ${symbol}`}
            </span>
            {assetMeta && (
              <span className="text-xs font-label text-on-surface-variant">
                Min: {minSize} {symbol}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSize(amount)}
              className="py-1.5 rounded-lg bg-surface-container text-sm font-label text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              {sizeUnit === "usdc" ? `$${amount}` : amount}
            </button>
          ))}
        </div>

        {orderType === "limit" && (
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2.5">
              Price
            </label>
            <div className="flex bg-surface-container rounded-lg border border-outline-variant/20 focus-within:border-primary transition-colors">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice > 0 ? currentPrice.toFixed(2) : "0.00"}
                className="input-no-spin flex-1 bg-transparent px-4 py-2.5 text-base font-label outline-none"
                step="0.01"
              />
              <span className="px-4 py-2.5 text-sm font-label text-on-surface-variant border-l border-outline-variant/20">
                USDC
              </span>
            </div>
            <div className="flex justify-end mt-1">
              <button onClick={() => setPrice(currentPrice.toFixed(2))} className="text-xs font-label text-primary hover:underline">
                Use Market
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Leverage</span>
            <span className="text-sm font-label font-bold text-primary">{leverage}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={maxLeverage}
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between mt-1">
            {leverageMarks.map((mark) => (
              <button key={mark} onClick={() => setLeverage(mark)} className="text-xs font-label text-on-surface-variant hover:text-primary">
                {mark}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="terminal-checkbox"
            />
            <span className="text-sm font-label text-on-surface-variant">Reduce Only</span>
          </label>
        </div>

        <div className="space-y-2.5 bg-surface-container rounded-lg p-4">
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Order Value</span>
            <span className="text-on-surface">${orderValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Margin Required</span>
            <span className={marginRequired > availableBalance && hasBalance ? "text-error" : "text-on-surface"}>
              ${marginRequired.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Max Leverage</span>
            <span className="text-on-surface">{maxLeverage}x</span>
          </div>
        </div>

        {isConnected && trading.isApproved && hasBalance && validationError && (
          <div className="flex items-start gap-2.5 text-sm font-body text-error/80 bg-error/5 rounded-lg px-4 py-2.5 border border-error/10">
            <MaterialIcon icon="info" size="sm" className="text-error mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`w-full py-3.5 rounded-xl font-headline font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyle}`}
        >
          {buttonLabel}
        </button>

        {isConnected && trading.isApproved && (
          <div className="flex gap-2">
            <button
              onClick={onOpenBridge}
              className="flex-1 py-2.5 rounded-lg bg-surface-container text-center text-sm font-label font-bold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Deposit
            </button>
            <a
              href={HL_DEPOSIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg bg-surface-container text-center text-sm font-label font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Withdraw
            </a>
          </div>
        )}

        {trading.error && <p className="text-xs text-error text-center">{friendlyError(trading.error)}</p>}
      </div>
    </div>
  );
}

function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("insufficient margin") || lower.includes("not enough margin"))
    return "Insufficient margin. Deposit more funds or reduce your position size.";
  if (lower.includes("min") && lower.includes("size"))
    return "Order size is below the minimum. Increase your position size.";
  if (lower.includes("max leverage"))
    return "Leverage exceeds the maximum for this asset.";
  if (lower.includes("reduce only"))
    return "Reduce-only order rejected — no existing position to reduce.";
  if (lower.includes("user rejected") || lower.includes("user denied"))
    return "Transaction rejected in wallet.";
  if (lower.includes("no account"))
    return "No Hyperliquid account found. Deposit funds first to create your account.";
  if (lower.includes("price") && lower.includes("slippage"))
    return "Order price exceeds slippage tolerance. Try again.";
  if (lower.includes("could not immediately match"))
    return "Market order could not find enough resting liquidity immediately. Try again or place a limit order.";
  if (lower.includes("agent") && lower.includes("not found"))
    return "Trading agent not approved. Please set up your agent first.";
  if (lower.includes("rate limit"))
    return "Rate limited. Wait a moment and try again.";
  if (lower.includes("chainid") && lower.includes("must match"))
    return "Wrong network. Please switch to Arbitrum to enable trading.";
  return raw;
}

function formatMaxSize(value: number, unit: "asset" | "usdc", szDecimals: number): string {
  const decimals = unit === "usdc" ? 2 : Math.min(Math.max(szDecimals, 0), 6);
  return truncateDecimals(value, decimals)
    .toFixed(decimals)
    .replace(/\.?0+$/, "");
}

function truncateDecimals(value: number, decimals: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** Math.max(decimals, 0);
  return Math.floor(value * factor) / factor;
}

function formatDisplayedBalance(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0.00";
  }

  const twoDecimal = value.toFixed(2);
  if (Math.abs(parseFloat(twoDecimal) - value) < 0.0005) {
    return twoDecimal;
  }

  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
