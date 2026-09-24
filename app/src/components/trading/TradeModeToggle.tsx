"use client";

import { hasSpotMarket } from "@/lib/config/xstocks";
import type { TradeMode } from "@/lib/spot/types";

interface TradeModeToggleProps {
  mode: TradeMode;
  onModeChange: (mode: TradeMode) => void;
  symbol: string;
}

export default function TradeModeToggle({
  mode,
  onModeChange,
  symbol,
}: TradeModeToggleProps) {
  const spotAvailable = hasSpotMarket(symbol);

  return (
    <div className="grid grid-cols-2 bg-surface-container-lowest rounded-t-xl border border-outline-variant/10 border-b-0 overflow-hidden">
      <button
        onClick={() => onModeChange("perp")}
        className={`py-2.5 text-sm font-headline font-bold transition-colors ${
          mode === "perp"
            ? "bg-surface-container-high text-on-surface"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        Perp
      </button>
      <button
        onClick={() => spotAvailable && onModeChange("spot")}
        disabled={!spotAvailable}
        className={`py-2.5 text-sm font-headline font-bold transition-colors relative ${
          !spotAvailable
            ? "text-on-surface-variant/30 cursor-not-allowed"
            : mode === "spot"
            ? "bg-surface-container-high text-on-surface"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
        title={!spotAvailable ? "No spot market for this asset" : undefined}
      >
        Spot
        {spotAvailable && (
          <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary align-middle" />
        )}
      </button>
    </div>
  );
}
