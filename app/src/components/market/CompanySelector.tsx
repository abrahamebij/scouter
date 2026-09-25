"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName, normalizeSymbol } from "@/lib/prestocks/transforms";
import { formatCurrency } from "@/lib/prestocks/format";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface CompanySelectorProps {
  currentSymbol: string;
  products: PreStockDerived[];
}

export default function CompanySelector({ currentSymbol, products }: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const currentProduct = useMemo(() => {
    const norm = normalizeSymbol(currentSymbol);
    return products.find((p) => normalizeSymbol(p.symbol) === norm) || products[0];
  }, [currentSymbol, products]);

  // Filter products by name or symbol
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => {
      const name = getCompanyName(p.name).toLowerCase();
      const symbol = p.symbol.toLowerCase();
      return name.includes(query) || symbol.includes(query);
    });
  }, [products, searchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (symbol: string) => {
    setIsOpen(false);
    router.push(`/market/${symbol.toLowerCase()}`);
  };

  const currentName = currentProduct ? getCompanyName(currentProduct.name) : currentSymbol.toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 hover:border-outline-variant/60 transition-all text-on-surface"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentProduct?.image && (
          <div className="w-6 h-6 rounded-md bg-surface-container-lowest overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image
              src={currentProduct.image}
              alt={currentName}
              width={24}
              height={24}
              className="w-full h-full object-contain p-0.5"
              unoptimized
            />
          </div>
        )}
        <div className="flex items-baseline gap-2 text-left">
          <span className="font-headline font-bold text-sm sm:text-base text-on-surface">
            {currentName}
          </span>
          <span className="font-mono text-xs text-on-surface-variant font-medium">
            ${currentProduct?.symbol || currentSymbol.toUpperCase()}
          </span>
        </div>
        <MaterialIcon
          icon={isOpen ? "expand_less" : "expand_more"}
          size="sm"
          className="text-on-surface-variant group-hover:text-on-surface transition-colors ml-1"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container border border-outline-variant/30 shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Header & Search Input */}
          <div className="p-3 border-b border-outline-variant/20 bg-surface-container-low/70">
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-semibold mb-2 px-1">
              Select Market
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-on-surface-variant/60 pointer-events-none">
                <MaterialIcon icon="search" size="sm" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company or symbol..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-outline-variant/60 font-light"
              />
            </div>
          </div>

          {/* Product Options List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant">
                No matching markets found
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected =
                  normalizeSymbol(p.symbol) === normalizeSymbol(currentProduct?.symbol || currentSymbol);
                const companyName = getCompanyName(p.name);

                return (
                  <button
                    key={p.symbol}
                    type="button"
                    onClick={() => handleSelect(p.symbol)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                      isSelected
                        ? "bg-surface-container-high border border-outline-variant/40"
                        : "hover:bg-surface-container-high/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={companyName}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain p-1"
                            unoptimized
                          />
                        ) : (
                          <span className="font-headline font-bold text-xs text-on-surface-variant">
                            {p.symbol.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-semibold text-xs text-on-surface truncate">
                            {companyName}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-accent font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-on-surface-variant uppercase">
                          ${p.symbol}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-3">
                      <div className="font-mono text-xs font-semibold text-on-surface">
                        {formatCurrency(p.tokenPrice)}
                      </div>
                      <div className="text-[10px] font-mono text-on-surface-variant/80">
                        Mark: {formatCurrency(p.markPrice)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
