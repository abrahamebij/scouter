"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";
import { useSwap } from "@/lib/hooks/useSwap";
import { useSpotBalance } from "@/lib/hooks/useSpotBalance";
import {
  getPreferredSpotChainId,
  getSpotChainConfig,
  getSpotChainOptions,
  INK_CHAIN_ID,
  type SpotChainId,
} from "@/lib/config/xstocks";

interface SpotSwapFormProps {
  symbol: string;
  currentPrice: number;
  onOpenBridge: () => void;
}

const PRESET_AMOUNTS = ["10", "25", "50", "100"];

export default function SpotSwapForm({
  symbol,
  currentPrice,
  onOpenBridge,
}: SpotSwapFormProps) {
  const { isConnected, chainId } = useAccount();
  const { open } = useAppKit();
  const { switchChainAsync } = useSwitchChain();
  const { toast } = useToast();

  const [selectedChainId, setSelectedChainId] = useState<SpotChainId>(() =>
    getPreferredSpotChainId(symbol, chainId),
  );

  const chainOptions = getSpotChainOptions(symbol);
  const selectedChain = getSpotChainConfig(selectedChainId);
  const swap = useSwap(symbol, selectedChainId);
  const spotBalance = useSpotBalance(selectedChainId);

  const isOnSelectedChain = chainId === selectedChainId;
  const isUnavailableOnSelectedChain = !swap.token;
  const isLoading =
    swap.isQuotePending ||
    swap.step === "quoting" ||
    swap.step === "checking-allowance" ||
    swap.step === "approving" ||
    swap.step === "posting";

  const handleAction = async () => {
    if (!isConnected) {
      open({ view: "Connect" });
      return;
    }

    if (!selectedChain) {
      toast("Unsupported spot chain", "error");
      return;
    }

    if (!isOnSelectedChain) {
      try {
        await switchChainAsync({ chainId: selectedChainId });
        toast(`Switched to ${selectedChain.name}`, "success");
      } catch {
        toast(`Failed to switch to ${selectedChain.name}`, "error");
      }
      return;
    }

    if (isUnavailableOnSelectedChain) {
      return;
    }

    if (swap.step === "needs-approval") {
      await swap.approve();
      return;
    }

    if (swap.step === "ready") {
      await swap.submitSwap();
    }
  };

  let buttonLabel: string;
  let buttonStyle: string;

  if (!isConnected) {
    buttonLabel = "Connect Wallet";
    buttonStyle = "primary-gradient text-on-primary";
  } else if (!selectedChain) {
    buttonLabel = "Unsupported Spot Chain";
    buttonStyle = "bg-surface-container-high text-on-surface";
  } else if (!isOnSelectedChain) {
    buttonLabel = selectedChain.actionLabel;
    buttonStyle = "primary-gradient text-on-primary";
  } else if (isUnavailableOnSelectedChain) {
    buttonLabel = `${symbol} is not available on ${selectedChain.shortName}`;
    buttonStyle = "bg-surface-container-high text-on-surface";
  } else if (swap.step === "approving") {
    buttonLabel = "Approving USDC...";
    buttonStyle = "bg-surface-container-high text-on-surface";
  } else if (swap.step === "needs-approval") {
    buttonLabel = "Approve USDC";
    buttonStyle = "primary-gradient text-on-primary";
  } else if (swap.step === "posting") {
    buttonLabel = "Submitting Swap...";
    buttonStyle = "primary-gradient text-on-primary";
  } else if (swap.step === "submitted") {
    buttonLabel = swap.orderState === "filled" ? "Order Filled" : "Tracking Order...";
    buttonStyle = "bg-primary/20 text-primary";
  } else if (
    swap.step === "quoting" ||
    swap.step === "checking-allowance" ||
    swap.step === "switch-chain"
  ) {
    buttonLabel = "Getting Quote...";
    buttonStyle = "bg-surface-container-high text-on-surface";
  } else {
    buttonLabel = `Swap to ${swap.token?.xSymbol ?? `${symbol}x`}`;
    buttonStyle = "primary-gradient text-on-primary";
  }

  return (
    <div className="bg-surface-container-lowest rounded-b-xl border border-outline-variant/10 border-t-0 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-outline-variant/10 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-headline font-bold text-on-surface">
            Buy {swap.token?.xSymbol ?? `${symbol}x`}
          </span>
          <span className="text-xs font-label text-on-surface-variant">
            via CoW Protocol
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {chainOptions.map((chain) => {
            const isActive = selectedChainId === chain.chainId;

            return (
              <button
                key={chain.chainId}
                onClick={() => setSelectedChainId(chain.chainId)}
                className={[
                  "rounded-xl border px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/10"
                    : "border-outline-variant/15 bg-surface-container hover:border-outline-variant/25 hover:bg-surface-container-high",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Image
                      src={chain.icon}
                      alt={chain.name}
                      width={18}
                      height={18}
                      className="rounded-full"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-label font-bold text-on-surface">
                        {chain.shortName}
                      </div>
                      <div className="text-[11px] font-label text-on-surface-variant truncate">
                        Spot trading
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <MaterialIcon icon="check_circle" size="sm" className="text-primary flex-shrink-0" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isConnected && selectedChain ? (
          <div className="flex justify-between gap-3 text-xs font-label text-on-surface-variant">
            <span>
              USDC on {selectedChain.shortName}:{" "}
              <span
                className={`font-bold ${
                  parseFloat(spotBalance.formatted) > 0 ? "text-on-surface" : "text-error"
                }`}
              >
                ${spotBalance.displayBalance}
              </span>
            </span>
            {selectedChainId === INK_CHAIN_ID ? (
              <button
                onClick={onOpenBridge}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <MaterialIcon icon="swap_calls" size="sm" />
                Bridge to Ink
              </button>
            ) : null}
          </div>
        ) : null}

        {!isUnavailableOnSelectedChain && swap.token && selectedChain ? (
          <div className="rounded-lg border border-outline-variant/10 bg-surface-container px-3.5 py-3 text-xs font-label text-on-surface-variant">
            Swapping USDC on <span className="font-bold text-on-surface">{selectedChain.name}</span> for{" "}
            <span className="font-bold text-on-surface">{swap.token.xSymbol}</span>.
          </div>
        ) : null}

        {isUnavailableOnSelectedChain && selectedChain ? (
          <div className="flex items-start gap-2.5 text-sm font-body bg-secondary/5 rounded-lg px-4 py-2.5 border border-secondary/10">
            <MaterialIcon icon="info" size="sm" className="text-secondary mt-0.5 flex-shrink-0" />
            <div className="text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5">
                {symbol} is not currently available on {selectedChain.name}
              </span>
              Switch to another spot chain or choose another asset.
            </div>
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2.5">
            You Pay
          </label>
          <div className="flex bg-surface-container rounded-lg border border-outline-variant/20 focus-within:border-primary transition-colors">
            <input
              type="number"
              value={swap.sellAmount}
              onChange={(e) => swap.setSellAmount(e.target.value)}
              className="input-no-spin flex-1 bg-transparent px-4 py-2.5 text-base font-label outline-none"
              placeholder="0"
              step="1"
            />
            <span className="px-4 py-2.5 text-sm font-label text-on-surface-variant border-l border-outline-variant/20">
              USDC
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => swap.setSellAmount(amount)}
              className="py-1.5 rounded-lg bg-surface-container text-sm font-label text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              ${amount}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
            <MaterialIcon icon="arrow_downward" size="sm" className="text-primary" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2.5">
            You Receive
          </label>
          <div
            className={`relative flex overflow-hidden rounded-lg border bg-surface-container transition-colors duration-300 ${
              swap.step === "quoting"
                ? "border-primary/35"
                : swap.priceUpdated
                  ? "border-primary/40"
                  : "border-outline-variant/20"
            }`}
          >
            {swap.step === "quoting" ? (
              <>
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="animate-quote-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
                </div>
                <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
                  <div className="h-4 w-24 animate-quote-pulse rounded bg-surface-container-high/90" />
                  <span className="text-sm font-label text-primary/80">Finding best quote</span>
                </div>
              </>
            ) : (
              <input
                type="text"
                value={swap.buyAmount || "0"}
                disabled
                className={`flex-1 bg-transparent px-4 py-2.5 text-base font-label outline-none transition-colors duration-300 ${
                  swap.priceUpdated ? "text-primary" : "text-on-surface"
                }`}
              />
            )}
            <span className="px-4 py-2.5 text-sm font-label text-primary font-bold border-l border-outline-variant/20">
              {swap.token?.xSymbol ?? `${symbol}x`}
            </span>
          </div>
          {swap.step === "quoting" ? (
            <div className="mt-1.5 flex items-center gap-2 text-xs font-label text-primary/80">
              <div className="h-1.5 w-1.5 animate-quote-pulse rounded-full bg-primary" />
              Checking route, price impact, and minimum received...
            </div>
          ) : null}
        </div>

        {swap.buyAmount && swap.step !== "quoting" ? (
          <div className="space-y-2 bg-surface-container rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                Quote
              </span>
              <div className="flex items-center gap-1.5">
                {swap.priceUpdated ? (
                  <span className="text-[10px] font-label text-primary animate-pulse">
                    Price updated
                  </span>
                ) : null}
                <span
                  className={`text-[10px] font-label tabular-nums ${
                    swap.isQuoteStale ? "text-error/70" : "text-on-surface-variant/60"
                  }`}
                >
                  {swap.quoteAge}s ago
                </span>
                <button
                  onClick={swap.refreshQuote}
                  className="text-on-surface-variant/60 hover:text-primary transition-colors"
                  title="Refresh quote"
                >
                  <MaterialIcon icon="refresh" size="sm" />
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm font-label">
              <span className="text-on-surface-variant">Price</span>
              <span className={`text-on-surface transition-colors duration-300 ${swap.priceUpdated ? "text-primary" : ""}`}>
                ${swap.pricePerToken.toFixed(2)} per {swap.token?.xSymbol}
              </span>
            </div>
            <div className="flex justify-between text-sm font-label">
              <span className="text-on-surface-variant">Spot Chain</span>
              <span className="text-on-surface">{selectedChain?.name}</span>
            </div>
            {currentPrice > 0 ? (
              <div className="flex justify-between text-sm font-label">
                <span className="text-on-surface-variant">Perp Price</span>
                <span className="text-on-surface-variant">${currentPrice.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm font-label">
              <span className="text-on-surface-variant">Slippage</span>
              <span className="text-on-surface">{(swap.slippageBps / 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm font-label">
              <span className="text-on-surface-variant">Min. Received</span>
              <span className="text-on-surface">
                {swap.minReceived} {swap.token?.xSymbol}
              </span>
            </div>
          </div>
        ) : null}

        {swap.step === "submitted" && swap.orderId ? (
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-body">
            <div className="flex h-5 w-5 items-center justify-center flex-shrink-0">
              <MaterialIcon
                icon={swap.orderState === "filled" ? "check_circle" : "hourglass_top"}
                size="sm"
                className="text-primary"
              />
            </div>
            <div className="min-w-0 flex-1 text-on-surface-variant">
              <span className="mb-0.5 block font-bold text-on-surface">
                {swap.orderStatusText ?? "Order submitted"}
              </span>
              <span className="block break-all text-xs">{swap.orderId}</span>
              <div className="mt-2 min-h-10 space-y-1 text-xs">
                <div>
                  Filled: {Number(swap.filledSellAmount ?? "0").toFixed(2)} USDC → {Number(swap.filledBuyAmount ?? "0").toFixed(6)} {swap.token?.xSymbol}
                </div>
                <div className="text-on-surface-variant">
                  {swap.orderState === "filled"
                    ? "Order settled"
                    : swap.isTrackingOrder
                      ? "Refreshing fill status..."
                      : "Waiting for next fill update..."}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {swap.orderExplorerUrl ? (
                  <a
                    href={swap.orderExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on CoW Explorer
                  </a>
                ) : null}
                <button onClick={swap.reset} className="text-primary hover:underline">
                  New Swap
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {swap.error ? (
          <div className="flex items-start gap-2.5 text-sm font-body text-error/80 bg-error/5 rounded-lg px-4 py-2.5 border border-error/10">
            <MaterialIcon icon="error" size="sm" className="text-error mt-0.5 flex-shrink-0" />
            <span>{swap.error}</span>
          </div>
        ) : null}

        {isConnected && !spotBalance.isLoading && parseFloat(spotBalance.formatted) === 0 ? (
          <div className="flex items-start gap-2.5 text-sm font-body bg-secondary/5 rounded-lg px-4 py-2.5 border border-secondary/10">
            <MaterialIcon
              icon="account_balance_wallet"
              size="sm"
              className="text-secondary mt-0.5 flex-shrink-0"
            />
            <div className="text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-0.5">
                No USDC on {selectedChain?.name}
              </span>
              {selectedChainId === INK_CHAIN_ID ? (
                <>
                  <button onClick={onOpenBridge} className="text-primary hover:underline">
                    Bridge USDC from another chain
                  </button>{" "}
                  to start trading spot xStocks on Ink.
                </>
              ) : (
                <>Fund your wallet with USDC on {selectedChain?.name} to start trading spot xStocks.</>
              )}
            </div>
          </div>
        ) : null}

        <button
          onClick={handleAction}
          disabled={
            isLoading ||
            swap.step === "submitted" ||
            (swap.step === "idle" && isConnected && isOnSelectedChain) ||
            (isConnected && isOnSelectedChain && isUnavailableOnSelectedChain)
          }
          className={`w-full py-3.5 rounded-xl font-headline font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyle}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
