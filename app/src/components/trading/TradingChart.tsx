"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import { HL_CONFIG, toCoin } from "@/lib/config/hyperliquid";

export interface StraddleOverlay {
  upperBE: number;
  lowerBE: number;
  strike: number;
  earningsDate: string;
  earningsLabel: string;
}

interface TradingChartProps {
  symbol?: string;
  straddle?: StraddleOverlay | null;
  xStockMode?: boolean;
  contracts?: number;
}

const INTERVALS: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
};

const LOOKBACKS: Record<string, number> = {
  "1m": 6 * 3600_000,
  "5m": 24 * 3600_000,
  "15m": 3 * 24 * 3600_000,
  "1h": 7 * 24 * 3600_000,
  "4h": 30 * 24 * 3600_000,
  "1d": 180 * 24 * 3600_000,
};

interface CandleRaw {
  t: number;
  o: string;
  h: string;
  l: string;
  c: string;
}

interface OverlayCoords {
  upperBEY: number;
  lowerBEY: number;
  expiryX: number;
  chartHeight: number;
  upperStrikeY: number;
  lowerStrikeY: number;
}

export default function TradingChart({ symbol = "TSLA", straddle, xStockMode, contracts = 1 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const straddleRef = useRef<StraddleOverlay | null>(null);
  const rawCandlesRef = useRef<CandlestickData<Time>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeInterval, setActiveInterval] = useState(xStockMode ? "4H" : "1H");
  const [coords, setCoords] = useState<OverlayCoords | null>(null);

  straddleRef.current = straddle ?? null;

  /** Set candle data with filler candles up to the expiry so timeToCoordinate works */
  const applyCandlesWithExpiry = useCallback((candles: CandlestickData<Time>[], s: StraddleOverlay | null, interval: string) => {
    if (!seriesRef.current || candles.length === 0) return;

    if (!s || !s.earningsDate) {
      seriesRef.current.setData(candles);
      return;
    }

    const lastCandle = candles[candles.length - 1];
    const lastPrice = lastCandle.close;
    const lastTs = lastCandle.time as number;
    const expiryTs = Math.floor(new Date(s.earningsDate + "T16:00:00").getTime() / 1000);

    if (expiryTs <= lastTs) {
      seriesRef.current.setData(candles);
      return;
    }

    // Fill gap with empty candles at the current interval
    const intervalSec = { "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400 }[interval] ?? 86400;
    const withFiller = [...candles];
    let t = lastTs + intervalSec;
    while (t <= expiryTs) {
      withFiller.push({
        time: t as Time,
        open: lastPrice,
        high: lastPrice,
        low: lastPrice,
        close: lastPrice,
      });
      t += intervalSec;
    }
    // Ensure the exact expiry timestamp is included
    if ((withFiller[withFiller.length - 1].time as number) < expiryTs) {
      withFiller.push({
        time: expiryTs as Time,
        open: lastPrice,
        high: lastPrice,
        low: lastPrice,
        close: lastPrice,
      });
    }

    seriesRef.current.setData(withFiller);
  }, []);

  const computeCoords = useCallback(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    const s = straddleRef.current;
    if (!chart || !series || !s || s.strike <= 0) {
      setCoords(null);
      return;
    }

    const upperBEY = series.priceToCoordinate(s.upperBE);
    const lowerBEY = series.priceToCoordinate(s.lowerBE);
    const container = chartContainerRef.current;
    const chartHeight = container ? container.clientHeight : 0;

    if (upperBEY === null || lowerBEY === null || chartHeight === 0) {
      setCoords(null);
      return;
    }

    const earningsTs = Math.floor(new Date(s.earningsDate + "T16:00:00").getTime() / 1000);
    const expiryX = chart.timeScale().timeToCoordinate(earningsTs as Time);

    if (expiryX === null || expiryX < 0) {
      setCoords(null);
      return;
    }

    setCoords({
      upperBEY,
      lowerBEY,
      expiryX,
      chartHeight,
      upperStrikeY: upperBEY,
      lowerStrikeY: lowerBEY,
    });
  }, []);

  // Create chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0f0e" },
        textColor: "#bacac0",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontSize: 13,
      },
      grid: {
        vertLines: { color: "rgba(60, 74, 66, 0.15)" },
        horzLines: { color: "rgba(60, 74, 66, 0.15)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: "rgba(60, 74, 66, 0.3)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: xStockMode ? 60 : 5,
        fixRightEdge: false,
      },
      rightPriceScale: {
        borderColor: "rgba(60, 74, 66, 0.3)",
      },
      crosshair: {
        vertLine: {
          color: "rgba(78, 242, 180, 0.3)",
          labelBackgroundColor: "#1c2120",
        },
        horzLine: {
          color: "rgba(78, 242, 180, 0.3)",
          labelBackgroundColor: "#1c2120",
        },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4ef2b4",
      downColor: "#ff6b6b",
      borderUpColor: "#4ef2b4",
      borderDownColor: "#ff6b6b",
      wickUpColor: "#4ef2b4",
      wickDownColor: "#ff6b6b",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    chart.timeScale().subscribeVisibleLogicalRangeChange(computeCoords);
    chart.subscribeCrosshairMove(computeCoords);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
        computeCoords();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);
    window.addEventListener("resize", handleResize);
    setTimeout(handleResize, 50);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(computeCoords);
      chart.unsubscribeCrosshairMove(computeCoords);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [computeCoords, xStockMode]);

  // Fetch candles
  useEffect(() => {
    const controller = new AbortController();
    const apiInterval = INTERVALS[activeInterval] || "1h";
    const coin = toCoin(symbol);
    if (seriesRef.current) seriesRef.current.setData([]);

    const fetchCandles = async (isInitial: boolean) => {
      try {
        if (isInitial) setIsLoading(true);
        const now = Date.now();
        const lookback = LOOKBACKS[apiInterval] || 7 * 24 * 3600_000;

        const response = await fetch(HL_CONFIG.API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "candleSnapshot",
            req: { coin, interval: apiInterval, startTime: now - lookback, endTime: now },
          }),
          signal: controller.signal,
        });

        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.length === 0 || !seriesRef.current) return;

        const candles: CandlestickData<Time>[] = (data as CandleRaw[]).map((c) => ({
          time: Math.floor(c.t / 1000) as Time,
          open: parseFloat(c.o),
          high: parseFloat(c.h),
          low: parseFloat(c.l),
          close: parseFloat(c.c),
        }));

        rawCandlesRef.current = candles;
        applyCandlesWithExpiry(candles, straddleRef.current, apiInterval);

        if (isInitial && chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

        setTimeout(computeCoords, 100);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        if (isInitial) setIsLoading(false);
      }
    };

    fetchCandles(true);
    const pollTimer = setInterval(() => fetchCandles(false), 15_000);
    return () => { controller.abort(); clearInterval(pollTimer); };
  }, [symbol, activeInterval, computeCoords, applyCandlesWithExpiry]);

  // When straddle/expiry changes, update filler candles and recompute overlay
  useEffect(() => {
    const apiInterval = INTERVALS[activeInterval] || "1d";
    if (rawCandlesRef.current.length > 0) {
      applyCandlesWithExpiry(rawCandlesRef.current, straddle ?? null, apiInterval);
      // Re-fit to include new filler candles
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
    const timer = setTimeout(computeCoords, 50);
    return () => clearTimeout(timer);
  }, [straddle, activeInterval, computeCoords, applyCandlesWithExpiry]);

  const [hoverInfo, setHoverInfo] = useState<{ y: number; price: number; profit: number } | null>(null);
  const [showPayoff, setShowPayoff] = useState(true);

  const showOverlay = straddle && coords && coords.expiryX > 0;

  // Straddle P&L calculator
  const calculatePL = useCallback((price: number) => {
    if (!straddle) return 0;
    const strike = straddle.strike;
    const totalDebit = straddle.upperBE - strike; // upperBE = strike + totalDebit
    const callPL = Math.max(price - strike, 0) - totalDebit / 2;
    const putPL = Math.max(strike - price, 0) - totalDebit / 2;
    return (callPL + putPL) * contracts * 100;
  }, [straddle, contracts]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-b-xl rounded-t-none border border-outline-variant/10 bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant/10 px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h3 className="font-headline font-bold text-base text-on-surface">
            {xStockMode ? `${symbol}x` : symbol}/USD
          </h3>
        </div>
        <div className="flex gap-1">
          {Object.keys(INTERVALS).map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveInterval(tf)}
              className={`px-3 py-1.5 rounded text-[12px] font-label transition-colors ${
                tf === activeInterval
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-surface-container-lowest/80">
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-label">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading chart...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />

        {/* DOM-based overlay — HEAT style */}
        {showOverlay && straddle && coords && (() => {
          const { upperBEY, lowerBEY, expiryX, chartHeight } = coords;
          const clampedUpperBE = Math.max(0, Math.min(chartHeight, upperBEY));
          const clampedLowerBE = Math.max(0, Math.min(chartHeight, lowerBEY));

          return (
            <>
              {/* Profit zone above upper BE */}
              {clampedUpperBE > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: `${expiryX}px`,
                    height: `${clampedUpperBE}px`,
                    background: `linear-gradient(to bottom,
                      rgba(78, 242, 180, 0.18),
                      rgba(78, 242, 180, 0.10),
                      rgba(78, 242, 180, 0.04)
                    )`,
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Profit zone below lower BE */}
              {clampedLowerBE < chartHeight && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: `${clampedLowerBE}px`,
                    width: `${expiryX}px`,
                    height: `${chartHeight - clampedLowerBE}px`,
                    background: `linear-gradient(to top,
                      rgba(78, 242, 180, 0.18),
                      rgba(78, 242, 180, 0.10),
                      rgba(78, 242, 180, 0.04)
                    )`,
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* ↑ PROFIT ↑ label */}
              {clampedUpperBE - 30 > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: `${clampedUpperBE - 30}px`,
                    padding: "4px 8px",
                    backgroundColor: "rgba(78, 242, 180, 0.9)",
                    borderRadius: "4px",
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: 700,
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                >
                  ↑ PROFIT ↑
                </div>
              )}

              {/* ↓ PROFIT ↓ label */}
              {clampedLowerBE + 10 < chartHeight && (
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: `${clampedLowerBE + 10}px`,
                    padding: "4px 8px",
                    backgroundColor: "rgba(78, 242, 180, 0.9)",
                    borderRadius: "4px",
                    color: "#000",
                    fontSize: "11px",
                    fontWeight: 700,
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                >
                  ↓ PROFIT ↓
                </div>
              )}

              {/* Vertical deadline — gradient line with red→orange→green transitions */}
              {(() => {
                const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
                const upperBEPct = clamp((clampedUpperBE / chartHeight) * 100, 0, 100);
                const lowerBEPct = clamp((clampedLowerBE / chartHeight) * 100, 0, 100);
                const pxT = (15 / chartHeight) * 100;
                const gap = lowerBEPct - upperBEPct;
                const t = Math.min(pxT, gap / 2);

                const profitColor = "rgba(54, 211, 153, 0.8)";
                const lossColor = "rgba(234, 94, 94, 0.8)";
                const beColor = "rgba(251, 146, 60, 0.8)";

                // Long straddle: green outside (profit), red inside (loss)
                const deadlineGradient = `linear-gradient(to bottom,
                  ${profitColor} 0%,
                  ${profitColor} ${clamp(upperBEPct - t, 0, 100)}%,
                  ${beColor} ${upperBEPct}%,
                  ${lossColor} ${clamp(upperBEPct + t, 0, 100)}%,
                  ${lossColor} ${clamp(lowerBEPct - t, 0, 100)}%,
                  ${beColor} ${lowerBEPct}%,
                  ${profitColor} ${clamp(lowerBEPct + t, 0, 100)}%,
                  ${profitColor} 100%
                )`;

                return (
                  <>
                    {/* Glow behind */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${expiryX - 8}px`,
                        top: 0,
                        width: "16px",
                        height: `${chartHeight}px`,
                        background: deadlineGradient,
                        borderRadius: "999px",
                        filter: "blur(8px)",
                        opacity: 0.6,
                        zIndex: 2,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Main line */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${expiryX - 3}px`,
                        top: 0,
                        width: "6px",
                        height: `${chartHeight}px`,
                        background: deadlineGradient,
                        borderRadius: "4px",
                        boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)",
                        zIndex: 3,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Hover capture area */}
                    <div
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if (!rect || !seriesRef.current) return;
                        const y = e.clientY - rect.top;
                        const price = seriesRef.current.coordinateToPrice(y);
                        if (price === null) return;
                        const profit = calculatePL(price);
                        setHoverInfo({ y, price, profit });
                      }}
                      onMouseLeave={() => setHoverInfo(null)}
                      onClick={() => setShowPayoff(prev => !prev)}
                      style={{
                        position: "absolute",
                        left: `${expiryX - 20}px`,
                        top: 0,
                        width: "40px",
                        height: `${chartHeight}px`,
                        cursor: "crosshair",
                        zIndex: 5,
                      }}
                    />
                  </>
                );
              })()}

              {/* Upper BE tick mark */}
              {upperBEY >= 0 && upperBEY <= chartHeight && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: `${expiryX - 10}px`,
                      top: `${upperBEY - 1}px`,
                      width: "24px",
                      height: "2px",
                      backgroundColor: "rgba(251, 146, 60, 0.9)",
                      zIndex: 4,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${expiryX + 14}px`,
                      top: `${upperBEY - 10}px`,
                      padding: "2px 6px",
                      backgroundColor: "rgba(251, 146, 60, 0.9)",
                      borderRadius: "3px",
                      color: "#000",
                      fontSize: "10px",
                      fontWeight: 700,
                      zIndex: 4,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    BE: ${straddle.upperBE.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </>
              )}

              {/* Lower BE tick mark */}
              {lowerBEY >= 0 && lowerBEY <= chartHeight && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: `${expiryX - 10}px`,
                      top: `${lowerBEY - 1}px`,
                      width: "24px",
                      height: "2px",
                      backgroundColor: "rgba(251, 146, 60, 0.9)",
                      zIndex: 4,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${expiryX + 14}px`,
                      top: `${lowerBEY - 10}px`,
                      padding: "2px 6px",
                      backgroundColor: "rgba(251, 146, 60, 0.9)",
                      borderRadius: "3px",
                      color: "#000",
                      fontSize: "10px",
                      fontWeight: 700,
                      zIndex: 4,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    BE: ${straddle.lowerBE.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </>
              )}

              {/* Hover tooltip with P&L info + mini payoff diagram */}
              {hoverInfo && showPayoff && (() => {
                const flipLeft = expiryX > (coords.chartHeight > 0 ? chartContainerRef.current?.clientWidth ?? 500 : 500) / 2;

                // Mini payoff SVG
                const svgW = 180;
                const svgH = 80;
                const pad = { l: 30, r: 8, t: 6, b: 16 };
                const pW = svgW - pad.l - pad.r;
                const pH = svgH - pad.t - pad.b;
                const beSpan = straddle.upperBE - straddle.lowerBE;
                const ext = beSpan * 0.4;
                const xMin = straddle.lowerBE - ext;
                const xMax = straddle.upperBE + ext;
                const samples = 60;
                const pts: { p: number; pl: number }[] = [];
                for (let i = 0; i <= samples; i++) {
                  const price = xMin + (i / samples) * (xMax - xMin);
                  pts.push({ p: price, pl: calculatePL(price) });
                }
                const plVals = pts.map(p => p.pl);
                const plMinV = Math.min(0, ...plVals);
                const plMaxV = Math.max(0, ...plVals);
                const plR = plMaxV - plMinV || 1;
                const tx = (p: number) => pad.l + ((p - xMin) / (xMax - xMin)) * pW;
                const ty = (pl: number) => pad.t + ((plMaxV - pl) / plR) * pH;
                const zY = ty(0);

                const profitPolys: string[] = [];
                const lossPolys: string[] = [];
                for (let i = 0; i < pts.length - 1; i++) {
                  const a = pts[i], b = pts[i + 1];
                  const x1 = tx(a.p), x2 = tx(b.p), y1 = ty(a.pl), y2 = ty(b.pl);
                  const poly = `${x1},${zY} ${x1},${y1} ${x2},${y2} ${x2},${zY}`;
                  if ((a.pl + b.pl) / 2 >= 0) profitPolys.push(poly);
                  else lossPolys.push(poly);
                }

                const hx = tx(hoverInfo.price);
                const hpl = calculatePL(hoverInfo.price);
                const hy = ty(hpl);

                const fmtPL = (v: number) => {
                  const abs = Math.abs(v);
                  return `${v >= 0 ? "+" : "-"}$${abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : abs.toFixed(0)}`;
                };

                return (
                  <div
                    style={{
                      position: "absolute",
                      ...(flipLeft
                        ? { right: `${(chartContainerRef.current?.clientWidth ?? 500) - expiryX + 14}px` }
                        : { left: `${expiryX + 14}px` }),
                      top: `${hoverInfo.y}px`,
                      transform: "translateY(-50%)",
                      padding: "8px 10px",
                      backgroundColor: "rgba(20, 20, 20, 0.96)",
                      borderRadius: "8px",
                      border: `1px solid ${hoverInfo.profit >= 0 ? "rgba(54, 211, 153, 0.4)" : "rgba(234, 94, 94, 0.4)"}`,
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 700,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                      zIndex: 10,
                      width: "200px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Price</span>
                      <span style={{ fontSize: "12px", marginLeft: "12px" }}>
                        ${hoverInfo.price < 1000 ? hoverInfo.price.toFixed(2) : Math.round(hoverInfo.price).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                        {hoverInfo.profit >= 0 ? "Profit" : "Loss"}
                      </span>
                      <span style={{ fontSize: "12px", color: hoverInfo.profit >= 0 ? "#36d399" : "#ea5e5e", marginLeft: "12px" }}>
                        {fmtPL(hoverInfo.profit)}
                      </span>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "6px" }}>
                      <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: "block" }}>
                        {profitPolys.map((p, i) => <polygon key={`pf${i}`} points={p} fill="rgba(54, 211, 153, 0.12)" />)}
                        {lossPolys.map((p, i) => <polygon key={`lf${i}`} points={p} fill="rgba(234, 94, 94, 0.12)" />)}
                        <line x1={pad.l} y1={zY} x2={svgW - pad.r} y2={zY} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="4 3" />
                        {pts.map((p, i) => {
                          if (i === 0) return null;
                          const prev = pts[i - 1];
                          const col = (prev.pl + p.pl) / 2 >= 0 ? "#36d399" : "#ea5e5e";
                          return <line key={i} x1={tx(prev.p)} y1={ty(prev.pl)} x2={tx(p.p)} y2={ty(p.pl)} stroke={col} strokeWidth={1.5} strokeLinecap="round" />;
                        })}
                        <circle cx={tx(straddle.lowerBE)} cy={zY} r={3} fill="#f59e0b" />
                        <circle cx={tx(straddle.upperBE)} cy={zY} r={3} fill="#f59e0b" />
                        <line x1={hx} y1={pad.t} x2={hx} y2={svgH - pad.b} stroke={hpl >= 0 ? "#36d399" : "#ea5e5e"} strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />
                        <circle cx={hx} cy={hy} r={4} fill={hpl >= 0 ? "#36d399" : "#ea5e5e"} stroke="#fff" strokeWidth={1.5} />
                        <text x={pad.l - 4} y={ty(plMaxV) + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="monospace">{fmtPL(plMaxV)}</text>
                        <text x={pad.l - 4} y={zY + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="monospace">$0</text>
                        <text x={pad.l - 4} y={ty(plMinV) + 3} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.35)" fontFamily="monospace">{fmtPL(plMinV)}</text>
                      </svg>
                    </div>
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "4px", fontWeight: 400 }}>
                      click to dismiss
                    </div>
                  </div>
                );
              })()}

              {/* Deadline label */}
              <div
                style={{
                  position: "absolute",
                  left: `${expiryX - 70}px`,
                  bottom: "8px",
                  width: "fit-content",
                  padding: "6px 10px",
                  background: "linear-gradient(135deg, rgba(11, 11, 15, 0.97), rgba(24, 24, 32, 0.94))",
                  border: "1px solid rgba(139, 92, 246, 0.4)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 18px rgba(0, 0, 0, 0.48), 0 0 14px rgba(139, 92, 246, 0.15)",
                  zIndex: 4,
                  pointerEvents: "none",
                  backdropFilter: "blur(5px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    lineHeight: 1,
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "rgba(139, 92, 246, 0.9)",
                  }}
                >
                  EARNINGS
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.25,
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.95)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {straddle.earningsLabel}
                </span>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
