"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { HL_CONFIG, toCoin } from "@/lib/config/hyperliquid";

const PING_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 3_000;
const ROW_HEIGHT = 22;
const SPREAD_HEIGHT = 32;

interface OrderLevel {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  symbol?: string;
}

export default function OrderBook({ symbol = "TSLA" }: OrderBookProps) {
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [spread, setSpread] = useState(0);
  const [displayMode, setDisplayMode] = useState<"asset" | "usdc">("asset");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [loadedSymbol, setLoadedSymbol] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(12);
  const contentRef = useRef<HTMLDivElement>(null);

  // Dynamically calculate how many rows fit per side
  const measureRows = useCallback(() => {
    if (!contentRef.current) return;
    const available = contentRef.current.clientHeight - SPREAD_HEIGHT;
    const perSide = Math.floor(available / 2 / ROW_HEIGHT);
    setRowCount(Math.max(perSide, 4));
  }, []);

  useEffect(() => {
    measureRows();
    const observer = new ResizeObserver(measureRows);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [measureRows]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let pingTimer: ReturnType<typeof setInterval>;
    let disposed = false;
    const coin = toCoin(symbol);

    const connect = () => {
      if (disposed) return;
      try {
        ws = new WebSocket(HL_CONFIG.WS_URL);

        ws.onopen = () => {
          setIsConnected(true);
          setIsLoadingBook(true);
          ws?.send(
            JSON.stringify({
              method: "subscribe",
              subscription: { type: "l2Book", coin },
            })
          );
          pingTimer = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ method: "ping" }));
            }
          }, PING_INTERVAL_MS);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as {
              channel?: string;
              data?: {
                coin?: string;
                levels?: [
                  { px: string; sz: string }[],
                  { px: string; sz: string }[],
                ];
              };
            };
            if (msg.channel !== "l2Book" || msg.data?.coin !== coin) return;

            const levels = msg.data.levels;
            if (!levels || levels.length < 2) return;

            const bidLevels: OrderLevel[] = [];
            const askLevels: OrderLevel[] = [];
            let runningTotal = 0;

            for (const level of levels[0]) {
              runningTotal += parseFloat(level.sz) * parseFloat(level.px);
              bidLevels.push({
                price: parseFloat(level.px),
                size: parseFloat(level.sz),
                total: runningTotal,
              });
            }

            runningTotal = 0;
            for (const level of levels[1]) {
              runningTotal += parseFloat(level.sz) * parseFloat(level.px);
              askLevels.push({
                price: parseFloat(level.px),
                size: parseFloat(level.sz),
                total: runningTotal,
              });
            }

            setBids(bidLevels);
            setAsks(askLevels);
            setLoadedSymbol(symbol);
            setIsLoadingBook(false);

            if (bidLevels.length > 0 && askLevels.length > 0) {
              setSpread(askLevels[0].price - bidLevels[0].price);
            }
          } catch {
            // malformed frame
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          clearInterval(pingTimer);
          if (!disposed) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        };

        ws.onerror = () => setIsConnected(false);
      } catch {
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [symbol]);

  const displayAsks = asks.slice(0, rowCount).reverse();
  const displayBids = bids.slice(0, rowCount);
  const showLoadingOverlay = loadedSymbol !== symbol || isLoadingBook;

  const maxTotal = Math.max(
    ...displayAsks.map((a) => a.total),
    ...displayBids.map((b) => b.total),
    1
  );

  const formatPrice = (price: number) => {
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const formatSize = (price: number, size: number) => {
    if (displayMode === "usdc") {
      return (price * size).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return size.toFixed(5);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-outline-variant/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="font-headline font-semibold text-sm text-on-surface">
            Orderbook
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-primary animate-pulse" : "bg-error"
            }`}
          />
        </div>
        <div className="flex gap-0.5 bg-surface-container rounded p-0.5">
          <button
            onClick={() => setDisplayMode("asset")}
            className={`px-2 py-1 rounded text-[11px] font-label font-medium transition-colors ${
              displayMode === "asset"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {symbol}
          </button>
          <button
            onClick={() => setDisplayMode("usdc")}
            className={`px-2 py-1 rounded text-[11px] font-label font-medium transition-colors ${
              displayMode === "usdc"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            USDC
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1 text-[10px] font-label uppercase tracking-wider text-on-surface-variant flex-shrink-0">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div ref={contentRef} className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
        <div
          className={`flex flex-col min-h-0 transition-opacity duration-150 ${
            showLoadingOverlay ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            className="flex flex-col justify-end overflow-hidden"
            style={{ height: `${rowCount * ROW_HEIGHT}px` }}
          >
            {displayAsks.map((ask, i) => (
              <Row
                key={`a${i}`}
                price={ask.price}
                size={formatSize(ask.price, ask.size)}
                total={ask.total}
                maxTotal={maxTotal}
                side="ask"
                formatPrice={formatPrice}
              />
            ))}
          </div>

          <div
            className="flex items-center justify-center border-y border-outline-variant/10 flex-shrink-0 bg-surface-container/30"
            style={{ height: `${SPREAD_HEIGHT}px` }}
          >
            <span className="text-[12px] font-label text-on-surface-variant">
              Spread{" "}
              <span className="text-on-surface font-medium">
                {formatPrice(spread)}
              </span>{" "}
              ({spread > 0 && asks.length > 0 && bids.length > 0
                ? ((spread / ((asks[0].price + bids[0].price) / 2)) * 100).toFixed(3)
                : "0.000"}%)
            </span>
          </div>

          <div
            className="overflow-hidden"
            style={{ height: `${rowCount * ROW_HEIGHT}px` }}
          >
            {displayBids.map((bid, i) => (
              <Row
                key={`b${i}`}
                price={bid.price}
                size={formatSize(bid.price, bid.size)}
                total={bid.total}
                maxTotal={maxTotal}
                side="bid"
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </div>

        {showLoadingOverlay ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/96">
            <div className="flex flex-col items-center gap-3 text-on-surface-variant">
              <div className="h-5 w-5 rounded-full border-2 border-outline-variant/30 border-t-primary animate-spin" />
              <span className="text-sm font-label">Loading orderbook...</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  price,
  size,
  total,
  maxTotal,
  side,
  formatPrice,
}: {
  price: number;
  size: string;
  total: number;
  maxTotal: number;
  side: "ask" | "bid";
  formatPrice: (p: number) => string;
}) {
  const depthColor = side === "ask" ? "bg-error/[0.06]" : "bg-primary/[0.06]";
  const priceColor = side === "ask" ? "text-error" : "text-primary";

  return (
    <div
      className="relative grid grid-cols-3 px-3 items-center text-[12px] font-label leading-none hover:bg-surface-container/40"
      style={{ height: `${ROW_HEIGHT}px` }}
    >
      <div
        className={`absolute top-0 right-0 h-full ${depthColor} transition-all duration-300`}
        style={{ width: `${Math.min((total / maxTotal) * 100, 95)}%` }}
      />
      <span className={`${priceColor} relative z-10 tabular-nums`}>
        {formatPrice(price)}
      </span>
      <span className="text-right text-on-surface relative z-10 tabular-nums">
        {size}
      </span>
      <span className="text-right text-on-surface-variant relative z-10 tabular-nums">
        {total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}
