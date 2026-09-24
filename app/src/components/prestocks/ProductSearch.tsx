"use client";

import MaterialIcon from "@/components/ui/MaterialIcon";

interface ProductSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  totalResults?: number;
}

export default function ProductSearch({
  value,
  onChange,
  placeholder = "Search by company name, symbol, or description...",
  totalResults,
}: ProductSearchProps) {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/70">
        <MaterialIcon icon="search" size="sm" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-24 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
        {value && (
          <button
            onClick={() => onChange("")}
            className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
            title="Clear search"
          >
            <MaterialIcon icon="close" size="sm" />
          </button>
        )}
        {totalResults !== undefined && (
          <span className="text-[11px] font-mono text-on-surface-variant/80 border-l border-outline-variant/20 pl-2">
            {totalResults} {totalResults === 1 ? "asset" : "assets"}
          </span>
        )}
      </div>
    </div>
  );
}
