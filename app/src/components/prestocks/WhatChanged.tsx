"use client";

import { PreStockDerived } from "@/lib/prestocks/types";
import { useCompanySnapshot } from "@/lib/prestocks/snapshots";
import {
  formatCurrency,
  formatCompactValuation,
  formatPercentage,
} from "@/lib/prestocks/format";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface WhatChangedProps {
  product: PreStockDerived;
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function WhatChanged({ product }: WhatChangedProps) {
  const { snapshot, change, isLoaded, isInitialVisit, updateSnapshot } = useCompanySnapshot(product);
  const { toast } = useToast();

  const handleManualSnapshot = () => {
    updateSnapshot();
    toast("Saved new baseline snapshot for this company", "success");
  };

  const isFirstObservation = isInitialVisit || !change;

  if (!isLoaded) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 animate-pulse h-36" />
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/15">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-base text-on-surface">
              What Changed?
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5 font-light">
            Tracks shifts in PreStocks secondary pricing and implied valuation since your last observation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {snapshot && (
            <span className="text-[11px] font-mono text-on-surface-variant/70">
              Last saved: {formatTimeAgo(snapshot.timestamp)}
            </span>
          )}
          <button
            onClick={handleManualSnapshot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-medium text-on-surface hover:text-on-surface transition-colors"
            title="Save current metrics as your new baseline"
          >
            <MaterialIcon icon="camera_alt" size="sm" />
            <span>Update Baseline</span>
          </button>
        </div>
      </div>

      {/* Snapshot Content */}
      {isFirstObservation ? (
        <div className="py-6 px-4 text-center bg-surface-container-lowest/50 rounded-xl border border-dashed border-outline-variant/20">
          <div className="w-9 h-9 mx-auto mb-2 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <MaterialIcon icon="history" size="sm" />
          </div>
          <h4 className="font-headline font-semibold text-xs text-on-surface mb-1">
            Initial Observation Recorded
          </h4>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto font-light leading-relaxed">
            Scouter has recorded a baseline snapshot for ${product.symbol}. When prices or valuations shift on future visits, deltas will appear here automatically.
          </p>
        </div>
      ) : !change.hasChanges ? (
        <div className="py-5 px-4 text-center bg-surface-container-lowest/50 rounded-xl border border-outline-variant/15 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <MaterialIcon icon="check_circle" size="sm" className="text-accent" />
          <span>No metric changes detected since your last snapshot ({formatTimeAgo(change.previous.timestamp)}).</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Token Price Change */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Token Price Shift
            </div>
            <div className="font-mono text-sm text-on-surface flex items-baseline gap-1.5">
              <span>{formatCurrency(change.previous.tokenPrice)}</span>
              <span className="text-on-surface-variant/50">→</span>
              <span className="font-bold">{formatCurrency(product.tokenPrice)}</span>
            </div>
            <div
              className={`text-xs font-mono font-semibold mt-1.5 ${
                change.tokenPriceChange >= 0 ? "text-accent" : "text-error"
              }`}
            >
              {change.tokenPriceChange >= 0 ? "+" : ""}
              {formatCurrency(change.tokenPriceChange)}
            </div>
          </div>

          {/* Implied Valuation Change */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Implied Valuation Shift
            </div>
            <div className="font-mono text-sm text-on-surface flex items-baseline gap-1.5">
              <span>{formatCompactValuation(change.previous.impliedValuation)}</span>
              <span className="text-on-surface-variant/50">→</span>
              <span className="font-bold text-accent">
                {formatCompactValuation(product.impliedValuation)}
              </span>
            </div>
            <div
              className={`text-xs font-mono font-semibold mt-1.5 ${
                change.impliedValuationChange >= 0 ? "text-accent" : "text-error"
              }`}
            >
              {change.impliedValuationChange >= 0 ? "+" : ""}
              {formatCompactValuation(change.impliedValuationChange)}
            </div>
          </div>

          {/* Premium Points Change */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
            <div className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-1">
              Premium vs Mark
            </div>
            <div className="font-mono text-sm text-on-surface flex items-baseline gap-1.5">
              <span>{formatPercentage(change.previous.premiumPercent)}</span>
              <span className="text-on-surface-variant/50">→</span>
              <span className="font-bold">{formatPercentage(product.premiumPercent)}</span>
            </div>
            <div
              className={`text-xs font-mono font-semibold mt-1.5 ${
                change.premiumPointsChange >= 0 ? "text-accent" : "text-secondary"
              }`}
            >
              {change.premiumPointsChange >= 0 ? "+" : ""}
              {change.premiumPointsChange.toFixed(2)} percentage points
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
