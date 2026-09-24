"use client";

import { useState } from "react";

const timeframes = ["1D", "1W", "1M"];
const chartBars = [40, 55, 45, 70, 60, 85, 75, 95, 100];

export default function PortfolioOverview() {
  const [activeTimeframe, setActiveTimeframe] = useState("1M");

  return (
    <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-headline text-2xl font-bold">
            Portfolio Overview
          </h2>
          <p className="font-body text-sm text-on-surface-variant">
            Aggregate performance across all structured vaults.
          </p>
        </div>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-3 py-1 rounded text-xs font-label border ${
                tf === activeTimeframe
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/20"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div>
          <span className="block font-label text-xs uppercase text-on-surface-variant mb-1">
            Total Value
          </span>
          <span className="text-3xl font-headline font-bold">$142,850.00</span>
        </div>
        <div>
          <span className="block font-label text-xs uppercase text-on-surface-variant mb-1">
            Net Earnings
          </span>
          <span className="text-3xl font-headline font-bold text-primary">
            +$4,210.45
          </span>
        </div>
        <div>
          <span className="block font-label text-xs uppercase text-on-surface-variant mb-1">
            Active Vaults
          </span>
          <span className="text-3xl font-headline font-bold">04</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 bg-surface-container-low rounded-xl border border-outline-variant/10 flex items-end p-4 gap-1 relative overflow-hidden">
        <div className="absolute inset-0 mesh-glow opacity-30" />
        <div className="w-full h-full flex items-end justify-between px-4 pb-4 z-10">
          {chartBars.map((height, i) => (
            <div
              key={i}
              className={`w-4 rounded-t transition-all duration-500 ${
                i === chartBars.length - 1
                  ? "bg-primary shadow-[0_0_15px_rgba(78,242,180,0.5)]"
                  : `bg-primary/${(i + 2) * 10}`
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
