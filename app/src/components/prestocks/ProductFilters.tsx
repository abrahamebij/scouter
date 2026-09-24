"use client";

import { SortField, SortDirection } from "@/lib/prestocks/types";
import MaterialIcon from "@/components/ui/MaterialIcon";

export type PremiumFilter = "all" | "premium" | "discount";

interface ProductFiltersProps {
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionToggle: () => void;
  premiumFilter: PremiumFilter;
  onPremiumFilterChange: (filter: PremiumFilter) => void;
}

export default function ProductFilters({
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionToggle,
  premiumFilter,
  onPremiumFilterChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Premium / Discount Quick Pills */}
      <div className="flex items-center p-1 bg-surface-container-high border border-outline-variant/20 rounded-xl text-xs">
        <button
          onClick={() => onPremiumFilterChange("all")}
          className={`px-3 py-1 rounded-lg transition-colors font-label uppercase tracking-wider text-[11px] ${
            premiumFilter === "all"
              ? "bg-surface-container-highest text-on-surface font-bold shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All
        </button>
        <button
          onClick={() => onPremiumFilterChange("premium")}
          className={`px-3 py-1 rounded-lg transition-colors font-label uppercase tracking-wider text-[11px] ${
            premiumFilter === "premium"
              ? "bg-surface-container-highest text-on-surface font-bold shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Premium
        </button>
        <button
          onClick={() => onPremiumFilterChange("discount")}
          className={`px-3 py-1 rounded-lg transition-colors font-label uppercase tracking-wider text-[11px] ${
            premiumFilter === "discount"
              ? "bg-surface-container-highest text-on-surface font-bold shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Discount
        </button>
      </div>

      {/* Sort Field Selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-on-surface-variant font-label uppercase tracking-wider hidden sm:inline">
          Sort:
        </label>
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs rounded-xl px-3 py-2 font-headline focus:outline-none focus:border-outline/60"
        >
          <option value="impliedValuation">Implied Valuation</option>
          <option value="tokenPrice">Token Price</option>
          <option value="markPrice">Mark Price</option>
          <option value="premiumPercent">Premium vs Mark</option>
          <option value="name">Company Name</option>
        </select>

        {/* Direction toggle button */}
        <button
          onClick={onSortDirectionToggle}
          className="p-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors"
          title={`Order: ${sortDirection === "desc" ? "Highest to lowest" : "Lowest to highest"}`}
        >
          <MaterialIcon
            icon={sortDirection === "desc" ? "arrow_downward" : "arrow_upward"}
            size="sm"
          />
        </button>
      </div>
    </div>
  );
}
