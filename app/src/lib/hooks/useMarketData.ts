"use client";

import { useState, useEffect, useRef } from "react";
import { HL_CONFIG, toCoin } from "@/lib/config/hyperliquid";

const PING_INTERVAL_MS = 30_000;
const RECONNECT_DELAY_MS = 3_000;
const STATS_POLL_MS = 15_000;

export interface MarketStats {
  midPrice: number;
  markPrice: number;
  bestBidPrice: number;
  bestAskPrice: number;
  bidLevels: BookLevel[];
  askLevels: BookLevel[];
  funding: string;
  openInterest: string;
  volume24h: string;
  prevDayPrice: number;
  change24h: number;
  changePct24h: number;
}

interface BookLevel {
  price: number;
  size: number;
}

const EMPTY_STATS: MarketStats = {
  midPrice: 0,
  markPrice: 0,
  bestBidPrice: 0,
  bestAskPrice: 0,
  bidLevels: [],
  askLevels: [],
  funding: "",
  openInterest: "",
  volume24h: "",
  prevDayPrice: 0,
  change24h: 0,
  changePct24h: 0,
};

export function useMarketData(symbol: string) {
  const [stats, setStats] = useState<MarketStats>(EMPTY_STATS);
  const statsRef = useRef(EMPTY_STATS);
  const prevSymbolRef = useRef(symbol);

  useEffect(() => {
    let resetTimer: number | undefined;

    if (prevSymbolRef.current !== symbol) {
      prevSymbolRef.current = symbol;
      statsRef.current = EMPTY_STATS;
      resetTimer = window.setTimeout(() => setStats(EMPTY_STATS), 0);
    }

    const controller = new AbortController();
    const coin = toCoin(symbol);

    const fetchStats = async () => {
      try {
        const response = await fetch(HL_CONFIG.API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "metaAndAssetCtxs",
            dex: HL_CONFIG.DEX_NAME,
          }),
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.length < 2) return;

        const universe: { name: string }[] = data[0].universe ?? [];
        const contexts: Record<string, string>[] = data[1] ?? [];
        const idx = universe.findIndex((a) => a.name === coin);
        if (idx < 0 || !contexts[idx]) return;

        const ctx = contexts[idx];
        const mid = parseFloat(ctx.midPx ?? "0");
        const mark = parseFloat(ctx.markPx ?? "0");
        const prevDay = parseFloat(ctx.prevDayPx ?? "0");
        const currentMid = mid || statsRef.current.midPrice;
        const change24h = prevDay > 0 ? currentMid - prevDay : 0;
        const changePct24h = prevDay > 0 ? (change24h / prevDay) * 100 : 0;

        const next: MarketStats = {
          midPrice: currentMid,
          markPrice: mark || mid || statsRef.current.markPrice,
          bestBidPrice: statsRef.current.bestBidPrice,
          bestAskPrice: statsRef.current.bestAskPrice,
          bidLevels: statsRef.current.bidLevels,
          askLevels: statsRef.current.askLevels,
          funding: ctx.funding ?? "",
          openInterest: ctx.openInterest ?? "",
          volume24h: ctx.dayNtlVlm ?? "",
          prevDayPrice: prevDay,
          change24h,
          changePct24h,
        };
        statsRef.current = next;
        setStats(next);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to fetch market stats:", err);
      }
    };

    void fetchStats();
    const interval = setInterval(fetchStats, STATS_POLL_MS);
    return () => {
      if (resetTimer !== undefined) {
        window.clearTimeout(resetTimer);
      }
      controller.abort();
      clearInterval(interval);
    };
  }, [symbol]);

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

            const bidLevels = levels[0]
              .map((level) => ({
                price: parseFloat(level.px),
                size: parseFloat(level.sz),
              }))
              .filter((level) => Number.isFinite(level.price) && Number.isFinite(level.size) && level.size > 0);

            const askLevels = levels[1]
              .map((level) => ({
                price: parseFloat(level.px),
                size: parseFloat(level.sz),
              }))
              .filter((level) => Number.isFinite(level.price) && Number.isFinite(level.size) && level.size > 0);

            const bid = bidLevels[0]?.price ?? 0;
            const ask = askLevels[0]?.price ?? 0;
            const mid = bid > 0 && ask > 0 ? (bid + ask) / 2 : statsRef.current.midPrice;
            const next = {
              ...statsRef.current,
              midPrice: mid,
              bestBidPrice: bid,
              bestAskPrice: ask,
              bidLevels,
              askLevels,
            };
            statsRef.current = next;
            setStats(next);
          } catch {
            // malformed frame, ignore
          }
        };

        ws.onclose = () => {
          clearInterval(pingTimer);
          if (!disposed) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        };

        ws.onerror = () => {
          // onclose will fire after this
        };
      } catch {
        if (!disposed) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
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

  return stats;
}

export function useAllMids() {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();

    const fetchPrices = async () => {
      try {
        const response = await fetch(HL_CONFIG.API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "allMids", dex: HL_CONFIG.DEX_NAME }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: Record<string, string> = await response.json();

        const parsed: Record<string, number> = {};
        for (const [coin, px] of Object.entries(data)) {
          const val = parseFloat(px);
          if (val > 0) parsed[coin] = val;
        }
        setPrices(parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Failed to fetch allMids:", err);
      }
    };

    void fetchPrices();
    const interval = setInterval(fetchPrices, 30_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return prices;
}
