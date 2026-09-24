"use client";

import { useState } from "react";
import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";

const STOCK_LOGOS: Record<string, string> = {
  SPY: "/coins/SP500.svg",
  QQQ: "/xStocks/qqq.svg",
  TSLA: "/coins/TSLA.svg",
  NVDA: "/coins/NVDA.svg",
};

const intents = [
  "Accumulate Spot",
  "Yield on Stocks",
  "Borrow Against Stocks",
  "Hedge Risks",
  "Trade Assets",
  "Spend",
];

const assets = ["SPY", "QQQ", "TSLA", "NVDA"];

const outlooks = [
  { label: "Bullish", icon: "trending_up", color: "text-primary/70", hoverColor: "hover:text-primary", borderColor: "hover:border-primary/30" },
  { label: "Bearish", icon: "trending_down", color: "text-error/70", hoverColor: "hover:text-error", borderColor: "hover:border-error/30" },
  { label: "Volatile", icon: "insights", color: "text-secondary/70", hoverColor: "hover:text-secondary", borderColor: "hover:border-secondary/30" },
  { label: "Neutral", icon: "trending_flat", color: "text-on-surface-variant/70", hoverColor: "hover:text-on-surface-variant", borderColor: "hover:border-on-surface-variant/30" },
];

const riskLevels = ["Extra conservative", "Low", "Moderate", "High"];

export default function StrategySelector() {
  const [selectedIntent, setSelectedIntent] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(3);
  const [selectedOutlook, setSelectedOutlook] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState("Moderate");
  const [riskConstraint, setRiskConstraint] = useState("");
  const [intentSearch, setIntentSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <section className="max-w-4xl mx-auto mb-32 relative">
      {/* Background glow */}
      <div className="absolute -inset-10 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 blur-[100px] -z-10 opacity-50" />

      <div className="glass-card rounded-[2.5rem] p-10 md:p-14 premium-shadow relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="space-y-14">
          {/* 1. Intent */}
          <div>
            <label className="block font-label text-sm font-bold uppercase tracking-widest text-primary mb-6">
              1. WHAT DO YOU WANT TO DO?
            </label>
            <div className="flex flex-wrap gap-3">
              {intents.map((intent, idx) => (
                <button
                  key={intent}
                  onClick={() => setSelectedIntent(idx)}
                  className={
                    idx === selectedIntent
                      ? "px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20"
                      : "px-6 py-3 rounded-full bg-surface-container-highest/50 border border-outline-variant/20 text-on-surface-variant hover:text-on-surface pill-hover transition-colors text-sm"
                  }
                >
                  {intent}
                </button>
              ))}
              <div className="relative flex-grow max-w-xs">
                <MaterialIcon
                  icon="search"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
                />
                <input
                  type="text"
                  value={intentSearch}
                  onChange={(e) => setIntentSearch(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/20 rounded-full pl-11 pr-6 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                  placeholder="Specify intent..."
                />
              </div>
            </div>
          </div>

          {/* 2. Asset */}
          <div>
            <label className="block font-label text-sm font-bold uppercase tracking-widest text-primary mb-6">
              2. WHAT ASSET?
            </label>
            <div className="flex flex-wrap gap-3 items-center">
              {assets.map((asset, idx) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAsset(idx)}
                  className={`flex items-center gap-2 ${
                    idx === selectedAsset
                      ? "px-5 py-2.5 rounded-full border border-primary/50 text-primary bg-primary/10 text-sm font-bold ring-1 ring-primary/20"
                      : "px-5 py-2.5 rounded-full bg-surface-container-highest/50 border border-outline-variant/20 text-on-surface-variant hover:text-on-surface pill-hover transition-colors text-sm"
                  }`}
                >
                  <Image src={STOCK_LOGOS[asset]} alt={asset} width={20} height={20} className="rounded-full" unoptimized />
                  {asset}
                </button>
              ))}
              <div className="relative flex-grow max-w-xs">
                <MaterialIcon
                  icon="search"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
                />
                <input
                  type="text"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/20 rounded-full pl-11 pr-6 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                  placeholder="Specify ticker..."
                />
              </div>
            </div>
          </div>

          {/* 3. Market Outlook & 4. Risk */}
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <label className="block font-label text-sm font-bold uppercase tracking-widest text-primary mb-6">
                3. MARKET OUTLOOK
              </label>
              <div className="grid grid-cols-2 gap-3">
                {outlooks.map((outlook, idx) => (
                  <button
                    key={outlook.label}
                    onClick={() => setSelectedOutlook(idx)}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all group ${
                      selectedOutlook === idx
                        ? "bg-surface-container-highest border-primary/40"
                        : `bg-surface-container-highest/40 border-outline-variant/10 ${outlook.borderColor} hover:bg-surface-container-highest`
                    }`}
                  >
                    <MaterialIcon
                      icon={outlook.icon}
                      className={selectedOutlook === idx ? "text-primary" : `${outlook.color} group-hover:${outlook.hoverColor}`}
                    />
                    <span className="text-sm font-semibold">{outlook.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-label text-sm font-bold uppercase tracking-widest text-primary mb-6">
                4. RISK TOLERANCE
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full bg-surface-container-lowest/50 border border-outline-variant/20 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none appearance-none cursor-pointer text-on-surface"
                  >
                    {riskLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <MaterialIcon
                    icon="expand_more"
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40"
                  />
                </div>
                <input
                  type="text"
                  value={riskConstraint}
                  onChange={(e) => setRiskConstraint(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/20 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none placeholder:text-on-surface-variant/40 transition-all text-on-surface"
                  placeholder="E.g. Max drawdown < 10%"
                />
              </div>
            </div>
          </div>

          {/* AI Input */}
          <div className="pt-10 border-t border-outline-variant/10">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <div className="relative flex">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-surface-container-low/80 border border-outline-variant/20 rounded-2xl px-6 py-6 text-on-surface focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40 text-base"
                  placeholder="Describe your financial needs"
                />
                <button className="absolute right-3 top-3 bottom-3 px-8 rounded-xl bg-primary text-on-primary font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                  Recommend
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
