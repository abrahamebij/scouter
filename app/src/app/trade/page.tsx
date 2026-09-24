"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MarketSelector from "@/components/trading/MarketSelector";
import TradingChart from "@/components/trading/TradingChart";
import type { StraddleOverlay } from "@/components/trading/TradingChart";
import OrderBook from "@/components/trading/OrderBook";
import TradingForm from "@/components/trading/TradingForm";
import UserPositions from "@/components/trading/UserPositions";
import SpotSwapForm from "@/components/trading/SpotSwapForm";
import BridgeDrawer from "@/components/trading/BridgeDrawer";
import EarningsCalendar from "@/components/trading/EarningsCalendar";
import EarningsStraddle from "@/components/trading/EarningsStraddle";
import EarningsNewsFeed from "@/components/trading/EarningsNewsFeed";
import { useMarketData } from "@/lib/hooks/useMarketData";
import { ALL_MARKETS } from "@/lib/config/hyperliquid";
import { hasSpotMarket } from "@/lib/config/xstocks";
import { getEarningsForSymbol, daysUntilEarnings, formatEarningsDate } from "@/lib/data/earnings";
import type { TradeMode } from "@/lib/spot/types";

export default function TradePage() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") ?? "TSLA";
  const initialMode = (searchParams.get("mode") as TradeMode) ?? "perp";
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [tradeMode, setTradeMode] = useState<TradeMode>(initialMode);
  const [isBridgeOpen, setIsBridgeOpen] = useState(false);
  const [breakoutPct, setBreakoutPct] = useState(5);
  const [contracts, setContracts] = useState(1);
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  const marketData = useMarketData(selectedSymbol);

  const straddleOverlay = useMemo<StraddleOverlay | null>(() => {
    if (tradeMode !== "earnings" || marketData.midPrice <= 0) return null;
    const earnings = getEarningsForSymbol(selectedSymbol);
    if (!earnings) return null;

    // Use selected expiry date or fall back to earnings date
    const expiryDate = selectedExpiry ?? earnings.date;
    const days = daysUntilEarnings(expiryDate);

    const strike = marketData.midPrice;
    const iv = earnings.avgMove * 2.8;
    const tv = Math.sqrt(Math.max(days, 1) / 365);
    const callPremium = strike * (iv / 100) * tv * 0.4;
    const putPremium = strike * (iv / 100) * tv * 0.38;
    const totalDebit = callPremium + putPremium;

    const d = new Date(expiryDate + "T00:00:00");
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

    return {
      upperBE: strike + totalDebit,
      lowerBE: strike - totalDebit,
      strike,
      earningsDate: expiryDate,
      earningsLabel: `${dayName}, ${formatEarningsDate(expiryDate)}`,
    };
  }, [tradeMode, selectedSymbol, marketData.midPrice, selectedExpiry]);

  const handleSymbolChange = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      if (tradeMode === "spot" && !hasSpotMarket(symbol)) {
        setTradeMode("perp");
      }
    },
    [tradeMode]
  );

  const handleModeChange = useCallback(
    (nextMode: TradeMode) => {
      if (nextMode === "spot" && !hasSpotMarket(selectedSymbol)) {
        const firstSpotMarket = ALL_MARKETS.find((market) => hasSpotMarket(market.symbol));
        if (firstSpotMarket) {
          setSelectedSymbol(firstSpotMarket.symbol);
        }
      }
      setTradeMode(nextMode);
    },
    [selectedSymbol]
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface">
      <Navbar />

      <div className="flex-1 min-h-0 pt-20">
        <div className="flex h-full gap-0.5 px-1.5 pb-0.5 min-h-0">
          <div className="flex-1 flex flex-col gap-0 min-w-0">
            <div className="flex-shrink-0">
              <MarketSelector
                selectedSymbol={selectedSymbol}
                onSymbolChange={handleSymbolChange}
                marketData={marketData}
                mode={tradeMode}
                onModeChange={handleModeChange}
              />
            </div>
            <div className="flex-[2] min-h-0">
              <TradingChart
                symbol={selectedSymbol}
                straddle={straddleOverlay}
                xStockMode={tradeMode === "earnings" || tradeMode === "spot"}
                contracts={contracts}
              />
            </div>
            <div className="flex-[1] min-h-[180px] max-h-[280px]">
              {tradeMode === "earnings" ? (
                <EarningsCalendar
                  selectedSymbol={selectedSymbol}
                  onSelectSymbol={(symbol) => {
                    setSelectedSymbol(symbol);
                  }}
                />
              ) : (
                <UserPositions />
              )}
            </div>
          </div>

          <div className="w-[320px] flex-shrink-0 min-h-0">
            {tradeMode === "earnings" ? (
              <EarningsNewsFeed symbol={selectedSymbol} />
            ) : (
              <OrderBook symbol={selectedSymbol} />
            )}
          </div>

          <div className="w-[360px] flex-shrink-0 min-h-0 overflow-y-auto">
            {tradeMode === "earnings" ? (
              <EarningsStraddle
                symbol={selectedSymbol}
                currentPrice={marketData.midPrice}
                onOpenBridge={() => setIsBridgeOpen(true)}
                breakoutPct={breakoutPct}
                onBreakoutPctChange={setBreakoutPct}
                contracts={contracts}
                onContractsChange={setContracts}
                selectedExpiry={selectedExpiry}
                onExpiryChange={setSelectedExpiry}
              />
            ) : tradeMode === "perp" ? (
              <TradingForm
                symbol={selectedSymbol}
                currentPrice={marketData.midPrice}
                bestBidPrice={marketData.bestBidPrice}
                bestAskPrice={marketData.bestAskPrice}
                onOpenBridge={() => setIsBridgeOpen(true)}
              />
            ) : (
              <SpotSwapForm
                symbol={selectedSymbol}
                currentPrice={marketData.midPrice}
                onOpenBridge={() => setIsBridgeOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <BridgeDrawer
        isOpen={isBridgeOpen}
        mode={tradeMode === "earnings" ? "perp" : tradeMode}
        onClose={() => setIsBridgeOpen(false)}
      />
    </div>
  );
}
