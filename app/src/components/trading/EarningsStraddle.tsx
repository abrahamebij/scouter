"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";
import { coinLogoUrl } from "@/lib/config/hyperliquid";
import {
  getEarningsForSymbol,
  daysUntilEarnings,
  formatEarningsDate,
} from "@/lib/data/earnings";

interface EarningsStraddleProps {
  symbol: string;
  currentPrice: number;
  onOpenBridge: () => void;
  breakoutPct: number;
  onBreakoutPctChange: (pct: number) => void;
  contracts: number;
  onContractsChange: (n: number) => void;
  selectedExpiry: string | null;
  onExpiryChange: (date: string | null) => void;
}

export default function EarningsStraddle({
  symbol,
  currentPrice,
  onOpenBridge,
  onBreakoutPctChange,
  contracts,
  onContractsChange,
  selectedExpiry,
  onExpiryChange,
}: EarningsStraddleProps) {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const earnings = useMemo(() => getEarningsForSymbol(symbol), [symbol]);
  const days = earnings ? daysUntilEarnings(earnings.date) : null;

  // Generate mock expiry dates (weekly Fridays around the earnings date)
  const expiryOptions = useMemo(() => {
    if (!earnings) return [];
    const earningsDate = new Date(earnings.date + "T00:00:00");
    const options: { date: string; label: string; daysOut: number; isEarnings: boolean }[] = [];

    // Find the Friday of the earnings week and surrounding weeks
    const earningsDay = earningsDate.getDay();
    const fridayOffset = (5 - earningsDay + 7) % 7;
    const earningsFriday = new Date(earningsDate);
    earningsFriday.setDate(earningsFriday.getDate() + fridayOffset);

    for (let w = -2; w <= 2; w++) {
      const d = new Date(earningsFriday);
      d.setDate(d.getDate() + w * 7);
      const iso = d.toISOString().slice(0, 10);
      const dOut = daysUntilEarnings(iso);
      if (dOut < 0) continue;
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isER = Math.abs(d.getTime() - earningsDate.getTime()) < 7 * 86400_000
        && d.getTime() >= earningsDate.getTime();
      options.push({
        date: iso,
        label: `${dayName}, ${monthDay}`,
        daysOut: dOut,
        isEarnings: isER && w === 0,
      });
    }
    return options;
  }, [earnings]);

  // Auto-select the earnings week expiry
  useEffect(() => {
    const earningsWeek = expiryOptions.find((o) => o.isEarnings);
    if (earningsWeek) onExpiryChange(earningsWeek.date);
    else if (expiryOptions.length > 0) onExpiryChange(expiryOptions[0].date);
  }, [expiryOptions, onExpiryChange]);

  const activeExpiry = expiryOptions.find((o) => o.date === selectedExpiry);
  const daysToExpiry = activeExpiry?.daysOut ?? days ?? 30;

  // Derive mock option pricing from avg move & days to expiry
  const strike = currentPrice > 0 ? Math.round(currentPrice * 100) / 100 : 0;
  const impliedVol = earnings ? earnings.avgMove * 2.8 : 35; // annualized-ish mock IV
  const timeValue = Math.sqrt(daysToExpiry / 365);

  // Mock premiums: rough Black-Scholes-ish feel
  const callPremium = strike > 0
    ? Math.round(strike * (impliedVol / 100) * timeValue * 0.4 * 100) / 100
    : 0;
  const putPremium = strike > 0
    ? Math.round(strike * (impliedVol / 100) * timeValue * 0.38 * 100) / 100
    : 0;
  const totalDebit = Math.round((callPremium + putPremium) * 100) / 100;

  const numContracts = contracts;
  const totalCost = totalDebit * numContracts * 100; // 100 shares per contract
  const breakevenUp = strike + totalDebit;
  const breakevenDown = strike - totalDebit;
  const breakevenPctUp = strike > 0 ? ((totalDebit / strike) * 100) : 0;
  const breakevenPctDown = breakevenPctUp;

  // Estimated P&L if avg move happens
  const avgMoveAmount = earnings ? strike * (earnings.avgMove / 100) : 0;
  const estProfit = avgMoveAmount > totalDebit
    ? (avgMoveAmount - totalDebit) * numContracts * 100
    : 0;

  // Mock greeks
  const delta = 0.01; // straddle is delta-neutral
  const gamma = strike > 0 ? Math.round((1 / (strike * (impliedVol / 100) * timeValue)) * 1000) / 1000 : 0;
  const theta = strike > 0 ? -Math.round(totalDebit / daysToExpiry * 100) / 100 : 0;
  const vega = strike > 0 ? Math.round(strike * timeValue * 0.01 * 100) / 100 : 0;

  // Sync breakout pct with breakeven for chart overlay
  useEffect(() => {
    if (strike > 0) {
      onBreakoutPctChange(Math.round(breakevenPctUp * 10) / 10);
    }
  }, [strike, breakevenPctUp, onBreakoutPctChange]);

  const handleSubmit = async () => {
    if (!isConnected) {
      open({ view: "Connect" });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast(`Bought ${numContracts}x ${symbol} Straddle @ $${totalDebit.toFixed(2)} for $${totalCost.toFixed(0)}`, "success");
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="bg-surface-container-lowest rounded-b-xl border border-outline-variant/10 border-t-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/10 border-b border-secondary/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MaterialIcon icon="stacked_line_chart" size="sm" className="text-secondary" />
          <span className="font-headline font-bold text-base text-on-surface">
            Options Straddle
          </span>
        </div>
        <span className="text-[10px] font-label font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
          MOCK
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Earnings info */}
        {earnings ? (
          <div className="bg-surface-container rounded-lg p-3 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-2.5">
              <Image
                src={coinLogoUrl(symbol)}
                alt={symbol}
                width={28}
                height={28}
                className="rounded-full"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <span className="font-headline font-bold text-sm text-on-surface">
                  {earnings.company}
                </span>
                <span className="block text-[11px] font-label text-on-surface-variant">
                  Earnings {formatEarningsDate(earnings.date)} · {earnings.timing === "BMO" ? "Pre-Market" : "After Close"}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-label font-bold ${days !== null && days <= 3 ? "text-error" : "text-secondary"}`}>
                  {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-surface-container-lowest rounded-md px-2.5 py-2 text-center">
                <span className="block text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Implied Vol</span>
                <span className="text-sm font-label font-bold text-[#f0a050]">{impliedVol.toFixed(0)}%</span>
              </div>
              <div className="bg-surface-container-lowest rounded-md px-2.5 py-2 text-center">
                <span className="block text-[9px] font-label uppercase tracking-widest text-on-surface-variant">Avg Move</span>
                <span className={`text-sm font-label font-bold ${earnings.avgMove >= 10 ? "text-error" : "text-[#f0a050]"}`}>
                  ±{earnings.avgMove.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/10 text-center">
            <MaterialIcon icon="event_busy" size="lg" className="text-on-surface-variant mb-1" />
            <p className="text-sm font-label text-on-surface-variant">
              No upcoming earnings for <span className="text-on-surface font-bold">{symbol}</span>
            </p>
          </div>
        )}

        {/* Strike */}
        <div>
          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
            Strike Price (ATM)
          </label>
          <div className="flex bg-surface-container rounded-lg border border-outline-variant/20">
            <input
              type="text"
              value={strike > 0 ? `$${strike.toFixed(2)}` : "—"}
              readOnly
              className="flex-1 bg-transparent px-4 py-2.5 text-base font-label text-on-surface outline-none"
            />
            <span className="px-3 py-2.5 text-[11px] font-label text-on-surface-variant border-l border-outline-variant/20 flex items-center">
              ATM
            </span>
          </div>
        </div>

        {/* Expiry selection */}
        {expiryOptions.length > 0 && (
          <div>
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
              Expiry
            </label>
            <div className="flex flex-col gap-1">
              {expiryOptions.map((opt) => (
                <button
                  key={opt.date}
                  onClick={() => onExpiryChange(opt.date)}
                  className={[
                    "flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all border",
                    selectedExpiry === opt.date
                      ? opt.isEarnings
                        ? "bg-secondary/12 border-secondary/30 shadow-[inset_0_0_0_1px_rgba(102,212,246,0.1)]"
                        : "bg-surface-container-high border-outline-variant/20"
                      : "bg-surface-container border-transparent hover:border-outline-variant/14 hover:bg-surface-container/80",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                      selectedExpiry === opt.date
                        ? "border-secondary"
                        : "border-on-surface-variant/30"
                    }`}>
                      {selectedExpiry === opt.date && (
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      )}
                    </div>
                    <span className={`text-[12px] font-label ${
                      selectedExpiry === opt.date ? "text-on-surface font-bold" : "text-on-surface-variant"
                    }`}>
                      {opt.label}
                    </span>
                    {opt.isEarnings && (
                      <span className="text-[8px] font-label font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary uppercase tracking-wider">
                        ER Week
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-label tabular-nums ${
                    selectedExpiry === opt.date ? "text-on-surface" : "text-on-surface-variant/60"
                  }`}>
                    {opt.daysOut}d
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Call + Put premiums */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary/6 rounded-lg p-3 border border-primary/12">
            <div className="flex items-center gap-1.5 mb-1">
              <MaterialIcon icon="call_made" size="sm" className="text-primary" />
              <span className="text-[10px] font-label uppercase tracking-wider text-primary font-bold">Call</span>
            </div>
            <span className="text-lg font-label font-bold tabular-nums text-on-surface">
              ${callPremium.toFixed(2)}
            </span>
            <span className="block text-[10px] font-label text-on-surface-variant">per share</span>
          </div>
          <div className="bg-error/6 rounded-lg p-3 border border-error/12">
            <div className="flex items-center gap-1.5 mb-1">
              <MaterialIcon icon="call_received" size="sm" className="text-error" />
              <span className="text-[10px] font-label uppercase tracking-wider text-error font-bold">Put</span>
            </div>
            <span className="text-lg font-label font-bold tabular-nums text-on-surface">
              ${putPremium.toFixed(2)}
            </span>
            <span className="block text-[10px] font-label text-on-surface-variant">per share</span>
          </div>
        </div>

        {/* Contracts */}
        <div>
          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
            Contracts
          </label>
          <div className="flex bg-surface-container rounded-lg border border-outline-variant/20 focus-within:border-secondary transition-colors">
            <input
              type="number"
              value={contracts}
              onChange={(e) => onContractsChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="input-no-spin flex-1 bg-transparent px-4 py-2.5 text-base font-label outline-none"
              min="1"
              step="1"
              placeholder="1"
            />
            <span className="px-3 py-2.5 text-[11px] font-label text-on-surface-variant border-l border-outline-variant/20 flex items-center">
              × 100 shares
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {["1", "2", "5", "10"].map((n) => (
              <button
                key={n}
                onClick={() => onContractsChange(parseInt(n))}
                className="flex-1 py-1.5 rounded-lg bg-surface-container text-sm font-label text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                {n}x
              </button>
            ))}
          </div>
        </div>

        {/* Breakevens visualization */}
        {strike > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 bg-primary/6 rounded-lg px-3 py-2 border border-primary/12">
              <MaterialIcon icon="arrow_upward" size="sm" className="text-primary" />
              <div className="flex-1">
                <span className="text-[10px] font-label uppercase text-primary">Upper Breakeven</span>
                <span className="block text-sm font-label font-bold tabular-nums text-on-surface">
                  ${breakevenUp.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] font-label text-on-surface-variant">
                +{breakevenPctUp.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] font-label text-on-surface-variant py-0.5">
              <div className="h-px flex-1 bg-outline-variant/20" />
              <span>Strike ${strike.toFixed(2)}</span>
              <div className="h-px flex-1 bg-outline-variant/20" />
            </div>

            <div className="flex items-center gap-2 bg-error/6 rounded-lg px-3 py-2 border border-error/12">
              <MaterialIcon icon="arrow_downward" size="sm" className="text-error" />
              <div className="flex-1">
                <span className="text-[10px] font-label uppercase text-error">Lower Breakeven</span>
                <span className="block text-sm font-label font-bold tabular-nums text-on-surface">
                  ${breakevenDown.toFixed(2)}
                </span>
              </div>
              <span className="text-[11px] font-label text-on-surface-variant">
                -{breakevenPctDown.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="space-y-2 bg-surface-container rounded-lg p-3">
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Total Debit</span>
            <span className="text-on-surface font-bold">${totalDebit.toFixed(2)} / share</span>
          </div>
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Total Cost</span>
            <span className="text-on-surface font-bold">${totalCost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Max Loss</span>
            <span className="text-error font-bold">-${totalCost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm font-label">
            <span className="text-on-surface-variant">Max Profit</span>
            <span className="text-primary font-bold">Unlimited</span>
          </div>
          {earnings && estProfit > 0 && (
            <>
              <div className="h-px bg-outline-variant/10" />
              <div className="flex justify-between text-sm font-label">
                <span className="text-on-surface-variant">Est. P&L (avg move)</span>
                <span className="text-primary font-bold">+${estProfit.toFixed(0)}</span>
              </div>
              <span className="block text-[10px] font-label text-on-surface-variant">
                If {symbol} moves ±{earnings.avgMove}% on earnings
              </span>
            </>
          )}
        </div>

        {/* Greeks */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Delta", value: delta.toFixed(2), color: "text-on-surface" },
            { label: "Gamma", value: gamma.toFixed(3), color: "text-primary" },
            { label: "Theta", value: theta.toFixed(2), color: "text-error" },
            { label: "Vega", value: vega.toFixed(2), color: "text-[#f0a050]" },
          ].map((g) => (
            <div key={g.label} className="bg-surface-container rounded-md px-2 py-1.5 text-center">
              <span className="block text-[8px] font-label uppercase tracking-widest text-on-surface-variant">{g.label}</span>
              <span className={`text-[11px] font-label font-bold tabular-nums ${g.color}`}>{g.value}</span>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || numContracts <= 0 || strike <= 0}
          className={`w-full py-3.5 rounded-xl font-headline font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            !isConnected
              ? "primary-gradient text-on-primary"
              : isSubmitting
                ? "bg-secondary text-on-secondary"
                : "bg-secondary text-on-secondary hover:bg-secondary/90"
          }`}
        >
          {!isConnected
            ? "Connect Wallet"
            : isSubmitting
              ? "Placing Straddle..."
              : `Buy ${numContracts}x ${symbol} Straddle · $${totalCost.toFixed(0)}`}
        </button>

        {/* Deposit */}
        {isConnected && (
          <button
            onClick={onOpenBridge}
            className="w-full py-2.5 rounded-lg bg-surface-container text-center text-sm font-label font-bold text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Deposit
          </button>
        )}
      </div>
    </div>
  );
}
