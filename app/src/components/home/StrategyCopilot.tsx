"use client";

import { useState } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";

const intents = [
  "Long term accumulate",
  "Earn yield limited downside",
  "Delta neutral",
  "Cover downside",
];

export default function StrategyCopilot() {
  const [selectedIntent, setSelectedIntent] = useState(1);

  return (
    <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <MaterialIcon icon="psychology" fill size="xl" className="text-primary text-6xl" />
      </div>

      <h2 className="font-headline text-2xl font-bold mb-2 flex items-center gap-2">
        Strategy Copilot
        <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
          Live Alpha
        </span>
      </h2>
      <p className="font-body text-on-surface-variant text-sm mb-8">
        Select your market intent to see recommended structured products.
      </p>

      {/* User Intents */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        {intents.map((intent, idx) => (
          <button
            key={intent}
            onClick={() => setSelectedIntent(idx)}
            className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
              idx === selectedIntent
                ? "bg-surface-container-highest/40 border-primary/40"
                : "bg-surface-container border-outline-variant/10 hover:border-primary/50 group/btn"
            }`}
          >
            <span
              className={`font-headline font-semibold text-sm ${
                idx === selectedIntent ? "text-primary" : ""
              }`}
            >
              {intent}
            </span>
            {idx === selectedIntent ? (
              <MaterialIcon icon="check_circle" className="text-primary" />
            ) : (
              <MaterialIcon
                icon="arrow_forward"
                className="text-primary opacity-0 group-hover/btn:opacity-100 transition-opacity"
              />
            )}
          </button>
        ))}
      </div>

      {/* Agent Response */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              Recommended Strategy
            </span>
          </div>
          <span className="font-label text-[10px] px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
            BALANCED
          </span>
        </div>

        <h3 className="font-headline text-lg font-bold mb-1">
          NVDA Buffered Yield Vault
        </h3>
        <p className="font-body text-sm text-on-surface-variant mb-6">
          High yield generation with 15% downside protection on NVDA spot
          exposure.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-surface-container-low rounded-lg">
            <span className="block font-label text-[10px] text-on-surface-variant uppercase mb-1">
              Est. APY
            </span>
            <span className="block font-headline text-xl font-bold text-primary">
              12.4% — 18.2%
            </span>
          </div>
          <div className="p-3 bg-surface-container-low rounded-lg">
            <span className="block font-label text-[10px] text-on-surface-variant uppercase mb-1">
              Risk Level
            </span>
            <span className="block font-headline text-xl font-bold">
              Medium
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <MaterialIcon icon="lightbulb" size="sm" className="text-primary mt-0.5" />
            <p className="text-xs font-body text-on-surface-variant">
              Matches your intent by selling covered calls while holding
              protective puts.
            </p>
          </div>
          <div className="flex gap-3">
            <MaterialIcon icon="warning" size="sm" className="text-error mt-0.5" />
            <p className="text-xs font-body text-on-surface-variant">
              Yield is capped if NVDA rises &gt;25% in the current 30-day
              epoch.
            </p>
          </div>
        </div>

        <button className="w-full primary-gradient text-on-primary font-headline font-bold py-3 rounded-lg mb-4">
          Allocate Capital
        </button>
        <p className="text-[10px] font-body text-on-surface-variant/50 text-center italic">
          * Historical performance does not guarantee future results. Structured
          products involve significant risks.
        </p>
      </div>
    </div>
  );
}
