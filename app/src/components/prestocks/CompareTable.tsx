"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName, normalizeSymbol } from "@/lib/prestocks/transforms";
import {
  formatCurrency,
  formatCompactValuation,
  formatSupply,
  truncateAddress,
} from "@/lib/prestocks/format";
import PremiumBadge from "./PremiumBadge";
import WatchlistButton from "./WatchlistButton";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface CompareTableProps {
  products: PreStockDerived[];
  initialSymbols?: string[];
}

export default function CompareTable({
  products,
  initialSymbols,
}: CompareTableProps) {
  const { toast } = useToast();

  // Pick initial 2-3 symbols
  const defaultSelected =
    initialSymbols && initialSymbols.length > 0
      ? initialSymbols
      : products.slice(0, 3).map((p) => normalizeSymbol(p.symbol));

  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(defaultSelected);

  // Get currently selected objects
  const selectedProducts = selectedSymbols
    .map((sym) => products.find((p) => normalizeSymbol(p.symbol) === sym))
    .filter((p): p is PreStockDerived => Boolean(p));

  // Available to add
  const availableToAdd = products.filter(
    (p) => !selectedSymbols.includes(normalizeSymbol(p.symbol))
  );

  const handleAddCompany = (symbol: string) => {
    if (selectedSymbols.length >= 3) {
      toast("You can compare up to 3 companies simultaneously", "warning");
      return;
    }
    const norm = normalizeSymbol(symbol);
    if (!selectedSymbols.includes(norm)) {
      setSelectedSymbols([...selectedSymbols, norm]);
    }
  };

  const handleRemoveCompany = (symbol: string) => {
    const norm = normalizeSymbol(symbol);
    if (selectedSymbols.length <= 1) {
      toast("Keep at least one company to compare", "info");
      return;
    }
    setSelectedSymbols(selectedSymbols.filter((s) => s !== norm));
  };

  return (
    <div className="space-y-6">
      {/* Selector Controls Bar */}
      <div className="bg-surface-container-low/80 p-4 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-headline font-semibold text-sm text-on-surface">
            Comparing {selectedProducts.length} {selectedProducts.length === 1 ? "Company" : "Companies"}
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Select 2 to 3 assets for side-by-side metric inspection.
          </p>
        </div>

        {/* Company Dropdown Adder */}
        {selectedSymbols.length < 3 && availableToAdd.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddCompany(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs rounded-xl px-3 py-2 font-headline focus:outline-none focus:border-outline/60 w-full sm:w-56"
            >
              <option value="" disabled>
                + Add company to compare...
              </option>
              {availableToAdd.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {getCompanyName(p.name)} (${p.symbol})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 bg-surface-container/60">
              <th className="p-4 sm:p-5 w-48 min-w-[180px] font-label text-xs uppercase tracking-wider text-on-surface-variant sticky left-0 bg-surface-container/95 backdrop-blur-sm z-10">
                Metric
              </th>
              {selectedProducts.map((p) => (
                <th
                  key={p.symbol}
                  className="p-4 sm:p-5 min-w-[240px] align-top border-l border-outline-variant/15"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={getCompanyName(p.name)}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain p-1"
                            unoptimized
                          />
                        ) : (
                          <span className="font-bold text-xs text-on-surface-variant/60">
                            {p.symbol.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/company/${p.symbol.toLowerCase()}`}
                          className="font-headline font-bold text-sm text-on-surface hover:text-on-surface transition-colors block"
                        >
                          {getCompanyName(p.name)}
                        </Link>
                        <span className="font-mono text-xs text-on-surface-variant font-semibold">
                          ${p.symbol}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveCompany(p.symbol)}
                      className="p-1 text-on-surface-variant/70 hover:text-error hover:bg-surface-container-high rounded transition-colors"
                      title="Remove from comparison"
                    >
                      <MaterialIcon icon="close" size="sm" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <WatchlistButton symbol={p.symbol} variant="button" size="sm" />
                    <Link
                      href={`/company/${p.symbol.toLowerCase()}`}
                      className="text-xs text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <MaterialIcon icon="arrow_forward" size="sm" />
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-outline-variant/10 font-body">
            {/* Token Price */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Token Price
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 font-mono font-bold text-base text-on-surface border-l border-outline-variant/15"
                >
                  {formatCurrency(p.tokenPrice)}
                </td>
              ))}
            </tr>

            {/* Mark Price */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Mark Price
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 font-mono text-sm text-on-surface-variant border-l border-outline-variant/15"
                >
                  {formatCurrency(p.markPrice)}
                </td>
              ))}
            </tr>

            {/* Premium / Discount */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Premium vs Mark
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 border-l border-outline-variant/15"
                >
                  <PremiumBadge premiumPercent={p.premiumPercent} size="md" />
                </td>
              ))}
            </tr>

            {/* Implied Valuation */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Implied Valuation
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 font-mono font-bold text-sm text-accent border-l border-outline-variant/15"
                  title={formatCurrency(p.impliedValuation)}
                >
                  {formatCompactValuation(p.impliedValuation)}
                </td>
              ))}
            </tr>

            {/* Mark Valuation */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Mark Valuation
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 font-mono text-sm text-on-surface-variant border-l border-outline-variant/15"
                  title={formatCurrency(p.markValuation)}
                >
                  {formatCompactValuation(p.markValuation)}
                </td>
              ))}
            </tr>

            {/* Supply */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Token Supply
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 font-mono text-xs text-on-surface border-l border-outline-variant/15"
                >
                  {formatSupply(p.supply)} {p.symbol}
                </td>
              ))}
            </tr>

            {/* Solana Mint Address */}
            <tr className="hover:bg-surface-container/30 transition-colors">
              <td className="p-4 sm:p-5 font-headline font-semibold text-xs text-on-surface-variant sticky left-0 bg-surface-container-low/95 backdrop-blur-sm z-10">
                Contract Address
              </td>
              {selectedProducts.map((p) => (
                <td
                  key={p.symbol}
                  className="p-4 sm:p-5 border-l border-outline-variant/15"
                >
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {truncateAddress(p.contract_address, 4, 4)}
                    </code>
                    <a
                      href={`https://explorer.solana.com/address/${p.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-on-surface-variant hover:text-on-surface p-1"
                      title="Open in Solana Explorer"
                    >
                      <MaterialIcon icon="open_in_new" size="sm" />
                    </a>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
