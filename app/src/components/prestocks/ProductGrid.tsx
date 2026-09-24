"use client";

import { useMemo, useState } from "react";
import { PreStockDerived, SortField, SortDirection } from "@/lib/prestocks/types";
import { normalizeSymbol } from "@/lib/prestocks/transforms";
import ProductCard from "./ProductCard";
import ProductSearch from "./ProductSearch";
import ProductFilters, { PremiumFilter } from "./ProductFilters";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface ProductGridProps {
  products: PreStockDerived[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("impliedValuation");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [premiumFilter, setPremiumFilter] = useState<PremiumFilter>("all");

  const filteredAndSorted = useMemo(() => {
    let list = [...products];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.symbol.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Premium / discount filter
    if (premiumFilter === "premium") {
      list = list.filter((p) => p.premiumPercent > 0.001);
    } else if (premiumFilter === "discount") {
      list = list.filter((p) => p.premiumPercent < -0.001);
    }

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "impliedValuation":
          comparison = a.impliedValuation - b.impliedValuation;
          break;
        case "tokenPrice":
          comparison = a.tokenPrice - b.tokenPrice;
          break;
        case "markPrice":
          comparison = a.markPrice - b.markPrice;
          break;
        case "premiumPercent":
          comparison = a.premiumPercent - b.premiumPercent;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortDirection === "desc" ? -comparison : comparison;
    });

    return list;
  }, [products, search, premiumFilter, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-surface-container-low/70 p-4 rounded-2xl border border-outline-variant/15">
        <ProductSearch
          value={search}
          onChange={setSearch}
          totalResults={filteredAndSorted.length}
        />
        <ProductFilters
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionToggle={() =>
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          premiumFilter={premiumFilter}
          onPremiumFilterChange={setPremiumFilter}
        />
      </div>

      {/* Results Grid or Empty State */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSorted.map((product) => (
            <ProductCard key={normalizeSymbol(product.symbol)} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-surface-container-low/40 rounded-2xl border border-dashed border-outline-variant/30">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <MaterialIcon icon="search_off" size="md" />
          </div>
          <h4 className="font-headline font-semibold text-base text-on-surface mb-1">
            No companies found
          </h4>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-4">
            {search
              ? `No pre-IPO companies matched "${search}". Try searching for another name or symbol.`
              : "No companies currently match the selected filter criteria."}
          </p>
          {(search || premiumFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setPremiumFilter("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-headline font-medium text-primary hover:bg-surface-container-highest transition-colors"
            >
              <MaterialIcon icon="refresh" size="sm" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
