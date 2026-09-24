"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { toCoin, coinLogoUrl, ALL_MARKETS } from "@/lib/config/hyperliquid";
import { useAllMids, type MarketStats } from "@/lib/hooks/useMarketData";
import { hasSpotMarket } from "@/lib/config/xstocks";
import { getEarningsForSymbol, daysUntilEarnings, formatEarningsDate } from "@/lib/data/earnings";
import type { TradeMode } from "@/lib/spot/types";

function CoinLogo({
  symbol,
  size = 28,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={coinLogoUrl(symbol)}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      unoptimized
    />
  );
}

interface MarketSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  marketData: MarketStats;
  mode: TradeMode;
  onModeChange: (mode: TradeMode) => void;
}

interface MarketOption {
  symbol: string;
  displayName: string;
  price: number;
}

export default function MarketSelector({
  selectedSymbol,
  onSymbolChange,
  marketData,
  mode,
  onModeChange,
}: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const allMids = useAllMids();

  const currentMarket = ALL_MARKETS.find((market) => market.symbol === selectedSymbol);
  const isPositive = marketData.changePct24h >= 0;

  const markets = useMemo<MarketOption[]>(() => {
    return ALL_MARKETS.map((market) => ({
      symbol: market.symbol,
      displayName: market.displayName,
      price: allMids[toCoin(market.symbol)] ?? 0,
    })).filter((market) => market.price > 0);
  }, [allMids]);

  const visibleMarkets = useMemo(() => {
    let modeFiltered;
    if (mode === "spot") {
      modeFiltered = markets.filter((market) => hasSpotMarket(market.symbol));
    } else if (mode === "earnings") {
      modeFiltered = markets.filter((market) => getEarningsForSymbol(market.symbol));
    } else {
      modeFiltered = markets;
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      // In earnings mode, sort by earnings date
      if (mode === "earnings") {
        return [...modeFiltered].sort((a, b) => {
          const eA = getEarningsForSymbol(a.symbol);
          const eB = getEarningsForSymbol(b.symbol);
          return (eA?.date ?? "").localeCompare(eB?.date ?? "");
        });
      }
      return modeFiltered;
    }

    return modeFiltered.filter((market) => {
      return (
        market.symbol.toLowerCase().includes(query) ||
        market.displayName.toLowerCase().includes(query)
      );
    });
  }, [markets, mode, search]);

  return (
    <div className="relative z-20 border border-outline-variant/10 border-b-0 bg-surface-container-lowest rounded-t-xl px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => setIsOpen((open) => !open)}
            className="flex min-w-0 items-center gap-2.5 rounded-lg pl-1 pr-2 py-1 transition-colors hover:bg-surface-container flex-shrink-0"
          >
            <CoinLogo symbol={selectedSymbol} size={30} />
            <span className="font-headline text-[17px] font-bold text-on-surface">
              {selectedSymbol}
            </span>
            {currentMarket ? (
              <span className="hidden lg:inline truncate text-[11px] font-label text-on-surface-variant">
                {currentMarket.displayName}
              </span>
            ) : null}
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-label ${
              mode === "earnings" || mode === "spot"
                ? "bg-secondary/15 text-secondary font-bold"
                : "bg-surface-container-high text-on-surface-variant"
            }`}>
              {mode === "earnings" || mode === "spot" ? "xSTOCK" : "XYZ"}
            </span>
            <EarningsBadge symbol={selectedSymbol} />
            <MaterialIcon
              icon={isOpen ? "expand_less" : "expand_more"}
              size="sm"
              className="text-on-surface-variant"
            />
          </button>

          <div className="hidden h-6 w-px flex-shrink-0 bg-outline-variant/20 lg:block" />
        </div>

        <div className="ml-auto flex items-center justify-end gap-5 overflow-x-auto text-sm font-label">
          <Stat label="Mid" value={fmtPrice(marketData.midPrice)} />
          <Stat label="Mark" value={fmtPrice(marketData.markPrice)} />
          <Stat
            label="24h Change"
            value={
              marketData.prevDayPrice > 0
                ? `${isPositive ? "+" : ""}${marketData.changePct24h.toFixed(2)}%`
                : "—"
            }
            valueClass={
              marketData.prevDayPrice > 0
                ? isPositive
                  ? "text-primary"
                  : "text-error"
                : undefined
            }
          />
          <Stat label="24h Vol" value={fmtVolume(marketData.volume24h)} />
          <Stat
            label="Open Interest"
            value={fmtOI(marketData.openInterest)}
            className="hidden xl:block"
          />
          <Stat
            label="Funding"
            value={fmtFunding(marketData.funding)}
            valueClass={
              marketData.funding && parseFloat(marketData.funding) < 0
                ? "text-error"
                : "text-primary"
            }
            className="hidden xl:block"
          />
        </div>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] rounded-2xl border border-outline-variant/14 bg-[#0b120f]/98 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-hidden">
          <div className="border-b border-outline-variant/10 px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-surface-container/70 px-3 py-2.5 focus-within:border-primary/60 focus-within:bg-surface-container-high/60">
              <MaterialIcon icon="search" size="sm" className="text-on-surface-variant" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search stocks & markets..."
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
                autoFocus
              />
              <span className="rounded-md bg-surface-container-high px-2 py-1 text-[10px] font-label text-on-surface-variant">
                {visibleMarkets.length}
              </span>
            </div>
          </div>

          <div className="border-b border-outline-variant/10 px-3 pt-2">
            <div className="flex items-end gap-5">
              <button
                onClick={() => onModeChange("perp")}
                className={`border-b-2 px-1 pb-2 text-[14px] font-headline font-semibold transition-colors ${
                  mode === "perp"
                    ? "border-primary text-on-surface"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Perps
              </button>
              <button
                onClick={() => onModeChange("spot")}
                className={`border-b-2 px-1 pb-2 text-[14px] font-headline font-semibold transition-colors ${
                  mode === "spot"
                    ? "border-primary text-on-surface"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Spot
              </button>
              <button
                onClick={() => onModeChange("earnings")}
                className={`border-b-2 px-1 pb-2 text-[14px] font-headline font-semibold transition-colors flex items-center gap-1.5 ${
                  mode === "earnings"
                    ? "border-[#66d4f6] text-on-surface"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Earnings
                <span className="text-[9px] font-bold bg-[#66d4f6]/15 text-[#66d4f6] px-1.5 py-0.5 rounded-full">
                  NEW
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-outline-variant/8 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
            <span>Market</span>
            <span>Last Price</span>
          </div>

          <div className="max-h-[420px] overflow-y-auto px-2 py-2">
            {visibleMarkets.length > 0 ? (
              visibleMarkets.map((market) => {
                const isSelected = market.symbol === selectedSymbol;

                return (
                  <button
                    key={market.symbol}
                    onClick={() => {
                      onSymbolChange(market.symbol);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={[
                      "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center rounded-xl px-3 py-3 text-left transition-all",
                      isSelected
                        ? "border border-primary/20 bg-primary/10 shadow-[inset_0_0_0_1px_rgba(98,234,181,0.06)]"
                        : "border border-transparent hover:border-outline-variant/14 hover:bg-surface-container/65",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <CoinLogo symbol={market.symbol} size={30} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-headline text-sm font-semibold text-on-surface">
                            {market.symbol}
                          </span>
                          <EarningsBadge symbol={market.symbol} />
                        </div>
                        <span className="block truncate text-[11px] font-label text-on-surface-variant">
                          {market.displayName}
                        </span>
                      </div>
                    </div>

                    <div className="pl-4 text-right">
                      <span className="block font-label text-sm font-bold tabular-nums text-on-surface">
                        {fmtPrice(market.price)}
                      </span>
                      <EarningsDateLabel symbol={market.symbol} show={mode === "earnings"} />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/14 bg-surface-container/35 px-6 text-center">
                <MaterialIcon icon="search_off" size="lg" className="mb-2 text-on-surface-variant" />
                <div className="text-sm font-medium text-on-surface">
                  No matching markets
                </div>
                <div className="mt-1 text-xs text-on-surface-variant">
                  Try a ticker like TSLA, NVDA, AAPL, or XYZ100.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EarningsBadge({ symbol }: { symbol: string }) {
  const earnings = getEarningsForSymbol(symbol);
  if (!earnings) return null;

  const days = daysUntilEarnings(earnings.date);
  if (days > 14) return null;

  const isImminent = days <= 3;
  return (
    <span
      className={`flex-shrink-0 text-[9px] font-label font-bold px-1.5 py-0.5 rounded-full ${
        isImminent
          ? "bg-error/15 text-error"
          : "bg-[#66d4f6]/12 text-[#66d4f6]"
      }`}
    >
      {days === 0 ? "ER TODAY" : days === 1 ? "ER TMR" : `ER ${days}d`}
    </span>
  );
}

function EarningsDateLabel({ symbol, show }: { symbol: string; show: boolean }) {
  if (!show) return null;
  const earnings = getEarningsForSymbol(symbol);
  if (!earnings) return null;
  return (
    <span className="block text-[10px] font-label text-on-surface-variant mt-0.5">
      {formatEarningsDate(earnings.date)} · {earnings.timing === "BMO" ? "Pre" : "Post"} · ±{earnings.avgMove}%
    </span>
  );
}

function Stat({
  label,
  value,
  valueClass,
  className = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1 block text-[9px] uppercase tracking-[0.14em] leading-none text-on-surface-variant">
        {label}
      </span>
      <span
        className={`tabular-nums text-[12px] font-bold leading-none ${valueClass ?? "text-on-surface"}`}
      >
        {value}
      </span>
    </div>
  );
}

function fmtPrice(price: number): string {
  if (price <= 0) return "—";
  if (price >= 10_000) return `$${(price / 1_000).toFixed(2)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function fmtVolume(volume: string): string {
  if (!volume) return "—";
  const parsed = parseFloat(volume);
  if (parsed >= 1_000_000) return `$${(parsed / 1_000_000).toFixed(2)}M`;
  if (parsed >= 1_000) return `$${(parsed / 1_000).toFixed(1)}K`;
  return `$${parsed.toFixed(0)}`;
}

function fmtFunding(funding: string): string {
  if (!funding) return "—";
  return `${(parseFloat(funding) * 100).toFixed(5)}%`;
}

function fmtOI(openInterest: string): string {
  if (!openInterest) return "—";
  const parsed = parseFloat(openInterest);
  if (parsed >= 1_000_000) return `${(parsed / 1_000_000).toFixed(2)}M`;
  if (parsed >= 1_000) return `${(parsed / 1_000).toFixed(1)}K`;
  return parsed.toFixed(0);
}
