"use client";

import Dropdown from "@/components/ui/Dropdown";

export default function StrategyFilters() {
  return (
    <aside className="lg:col-span-3 sticky top-28 space-y-6">
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline font-bold text-lg">Filters</h3>
          <button className="text-primary text-xs font-label uppercase tracking-wider">
            Reset All
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Search strategies..."
            type="text"
          />
        </div>

        <div className="space-y-6">
          {/* Asset Filter */}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3">
              Underlying Asset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["SPYx", "USDC", "aUSD", "NVDAx"].map((asset) => (
                <label
                  key={asset}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container cursor-pointer hover:bg-surface-container-high transition-all duration-150"
                >
                  <input
                    type="checkbox"
                    defaultChecked={asset === "SPYx" || asset === "USDC"}
                    className="sr-only"
                  />
                  <span className="custom-check">
                    <svg
                      className="w-2.5 h-2.5 text-on-primary"
                      viewBox="0 0 12 10"
                      fill="none"
                    >
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-xs font-medium">{asset}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Profile */}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3">
              Risk Profile
            </label>
            <Dropdown
              options={[
                "All Profiles",
                "Low (Conservative)",
                "Medium (Moderate)",
                "High (Aggressive)",
              ]}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3">
              Duration
            </label>
            <div className="space-y-2">
              {["Flexible / No Lock", "30 - 90 Days", "90+ Days"].map((dur) => (
                <label key={dur} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="dur" className="sr-only" />
                  <span className="custom-radio" />
                  <span className="text-xs">{dur}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Outcome */}
          <div>
            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3">
              Target Outcome
            </label>
            <div className="flex flex-wrap gap-2">
              {["Capital Preservation", "Yield Maximization", "Delta Hedging"].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 rounded border border-outline-variant/30 text-[10px] font-label uppercase hover:border-primary transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Principal Protected Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/10">
            <div>
              <p className="text-xs font-bold">Principal Protected</p>
              <p className="text-[10px] text-on-surface-variant">Insured by Sovereign Vault</p>
            </div>
            <label className="relative inline-block w-10 h-6 cursor-pointer">
              <input type="checkbox" className="peer opacity-0 w-0 h-0" />
              <span className="absolute inset-0 bg-outline-variant/20 rounded-full transition-all peer-checked:bg-primary" />
              <span className="absolute left-1 bottom-1 bg-on-surface w-4 h-4 rounded-full transition-all peer-checked:translate-x-4" />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
