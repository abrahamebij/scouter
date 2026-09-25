"use client";

import { useState, useMemo, useEffect } from "react";
import { PreStockDerived } from "@/lib/prestocks/types";
import { formatCurrency, formatPercentage } from "@/lib/prestocks/format";
import { useCompanyHistory, saveCompanySnapshot, CompanySnapshot } from "@/lib/prestocks/snapshots";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface MarketChartProps {
  product: PreStockDerived;
}

type Timeframe = "1D" | "1W" | "1M" | "3M" | "ALL";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "ALL"];

export default function MarketChart({ product }: MarketChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("1D");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [externalHistory, setExternalHistory] = useState<CompanySnapshot[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  const { history, isLoaded } = useCompanyHistory(product.symbol);
  const { toast } = useToast();

  // Fetch real on-chain candles and secondary trading history from the API
  useEffect(() => {
    let isCurrent = true;
    setIsLoadingFeed(true);

    fetch(`/api/markets/${product.symbol.toLowerCase()}/history?timeframe=${activeTimeframe}`)
      .then((res) => res.json())
      .then((data) => {
        if (isCurrent && data.success && Array.isArray(data.points) && data.points.length > 0) {
          setExternalHistory(data.points);
        }
      })
      .catch((err) => {
        console.error("Failed to load market chart feed:", err);
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingFeed(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [product.symbol, activeTimeframe]);

  const handleManualSnapshot = () => {
    saveCompanySnapshot(product);
    toast("Recorded new snapshot observation for chart", "success");
  };

  // Combine external on-chain history with any local observations and the live tick
  const combinedHistory = useMemo(() => {
    const livePoint: CompanySnapshot = {
      symbol: product.symbol.toLowerCase(),
      timestamp: Date.now(),
      tokenPrice: product.tokenPrice,
      markPrice: product.markPrice,
      impliedValuation: product.impliedValuation,
      markValuation: product.markValuation,
      premiumPercent: product.premiumPercent,
      supply: product.supply,
    };

    const base = externalHistory.length > 0 ? externalHistory : history;

    if (base.length === 0) {
      return [livePoint];
    }

    const last = base[base.length - 1];
    if (Math.abs(livePoint.timestamp - last.timestamp) < 30000) {
      return base;
    }
    return [...base, livePoint];
  }, [externalHistory, history, product]);

  const filteredPoints = useMemo(() => {
    return combinedHistory;
  }, [combinedHistory]);

  const hasEnoughData = filteredPoints.length >= 2;

  // Compute SVG dimensions and paths
  const chartMetrics = useMemo(() => {
    if (!hasEnoughData) return null;

    const prices = filteredPoints.map((p) => p.tokenPrice);
    const markPrices = filteredPoints.map((p) => p.markPrice);
    const allValues = [...prices, ...markPrices];

    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const padding = (rawMax - rawMin) * 0.1 || rawMin * 0.05 || 1;
    const minVal = Math.max(0, rawMin - padding);
    const maxVal = rawMax + padding;
    const valRange = maxVal - minVal || 1;

    const width = 800;
    const height = 300;
    const paddingX = 40;
    const paddingY = 25;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;

    const points = filteredPoints.map((pt, index) => {
      const x = paddingX + (index / (filteredPoints.length - 1)) * plotWidth;
      const y = paddingY + plotHeight - ((pt.tokenPrice - minVal) / valRange) * plotHeight;
      const markY = paddingY + plotHeight - ((pt.markPrice - minVal) / valRange) * plotHeight;
      return { x, y, markY, pt };
    });

    // Token price line
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

    // Token price area fill
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = paddingY + plotHeight;
    const areaPath = `${linePath} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;

    // Mark price line (dashed)
    const markPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.markY.toFixed(1)}`).join(" ");

    return {
      width,
      height,
      minVal,
      maxVal,
      points,
      linePath,
      areaPath,
      markPath,
    };
  }, [filteredPoints, hasEnoughData]);

  const activeHoverPoint =
    hoverIndex !== null && chartMetrics?.points[hoverIndex]
      ? chartMetrics.points[hoverIndex]
      : null;

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/15">
        <div className="flex items-center gap-2.5">
          <span className="font-headline font-semibold text-xs text-on-surface uppercase tracking-wider">
            Token vs Mark Chart
          </span>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/20 text-[10px] font-mono text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>Solana DEX Feed</span>
          </div>

          <span className="text-[11px] font-mono text-on-surface-variant/70">
            ({filteredPoints.length} {filteredPoints.length === 1 ? "point" : "points"})
          </span>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-surface-container p-1 border border-outline-variant/25">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setActiveTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeTimeframe === tf
                  ? "bg-surface-container-high text-on-surface font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      {!isLoaded || (isLoadingFeed && externalHistory.length === 0) ? (
        <div className="h-64 rounded-xl bg-surface-container/50 animate-pulse flex flex-col items-center justify-center gap-2">
          <span className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="font-mono text-xs text-on-surface-variant">
            Connecting to live on-chain market feed...
          </span>
        </div>
      ) : !hasEnoughData ? (
        /* Empty State */
        <div className="py-14 px-4 text-center rounded-xl bg-surface-container-lowest/50 border border-dashed border-outline-variant/25 space-y-4">
          <div className="w-10 h-10 mx-auto rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <MaterialIcon icon="show_chart" size="md" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-headline font-semibold text-sm text-on-surface">
              Historical data is syncing
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-light">
              Connecting to Solana DEX liquidity pools to plot live token vs. mark pricing curves.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleManualSnapshot}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors"
            >
              <MaterialIcon icon="add_chart" size="sm" />
              <span>Record Snapshot Observation</span>
            </button>
          </div>
        </div>
      ) : chartMetrics ? (
        /* Authentic SVG Chart */
        <div className="relative space-y-2">
          {/* Active Hover / Current Stats Display */}
          <div className="flex items-center justify-between text-xs font-mono px-2 py-1.5 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/15">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-accent rounded-full inline-block" />
                <span className="text-on-surface-variant text-[11px]">Token:</span>
                <span className="font-semibold text-on-surface">
                  {formatCurrency(
                    activeHoverPoint ? activeHoverPoint.pt.tokenPrice : product.tokenPrice
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dashed border-on-surface-variant/80 inline-block" />
                <span className="text-on-surface-variant text-[11px]">Mark:</span>
                <span className="font-semibold text-on-surface-variant">
                  {formatCurrency(
                    activeHoverPoint ? activeHoverPoint.pt.markPrice : product.markPrice
                  )}
                </span>
              </div>

              {activeHoverPoint && (
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-on-surface-variant text-[11px]">Premium:</span>
                  <span
                    className={`font-semibold ${
                      activeHoverPoint.pt.premiumPercent >= 0 ? "text-accent" : "text-error"
                    }`}
                  >
                    {formatPercentage(activeHoverPoint.pt.premiumPercent)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-on-surface-variant/70">
              {activeHoverPoint
                ? new Date(activeHoverPoint.pt.timestamp).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Live Point"}
            </div>
          </div>

          {/* SVG Viewport */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`}
              className="w-full h-56 sm:h-64 select-none"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1="40"
                y1="30"
                x2="760"
                y2="30"
                stroke="currentColor"
                className="text-outline-variant/15"
                strokeDasharray="4 4"
              />
              <line
                x1="40"
                y1="150"
                x2="760"
                y2="150"
                stroke="currentColor"
                className="text-outline-variant/15"
                strokeDasharray="4 4"
              />
              <line
                x1="40"
                y1="270"
                x2="760"
                y2="270"
                stroke="currentColor"
                className="text-outline-variant/20"
              />

              {/* Area Under Token Price */}
              <path d={chartMetrics.areaPath} fill="url(#tokenGradient)" />

              {/* Mark Benchmark Reference Line (Dashed) */}
              <path
                d={chartMetrics.markPath}
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Token Price Line */}
              <path
                d={chartMetrics.linePath}
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Dots & Hover Hitboxes */}
              {chartMetrics.points.map((pt, i) => {
                const isHovered = hoverIndex === i;
                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3}
                      className={isHovered ? "fill-accent" : "fill-surface-container-lowest"}
                      stroke="#6ee7b7"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                    />
                    {/* Invisible Hitbox */}
                    <rect
                      x={pt.x - 20}
                      y={0}
                      width={40}
                      height={chartMetrics.height}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => setHoverIndex(i)}
                    />
                  </g>
                );
              })}

              {/* Hover Vertical Guide */}
              {activeHoverPoint && (
                <line
                  x1={activeHoverPoint.x}
                  y1={25}
                  x2={activeHoverPoint.x}
                  y2={275}
                  stroke="#6ee7b7"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              )}
            </svg>
          </div>

          {/* Min / Max Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant/60 px-1">
            <span>Low: {formatCurrency(chartMetrics.minVal)}</span>
            <span>High: {formatCurrency(chartMetrics.maxVal)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
