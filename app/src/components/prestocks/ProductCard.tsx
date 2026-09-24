"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { formatCurrency, formatCompactValuation } from "@/lib/prestocks/format";
import PremiumBadge from "./PremiumBadge";
import WatchlistButton from "./WatchlistButton";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface ProductCardProps {
  product: PreStockDerived;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const companyName = getCompanyName(product.name);

  return (
    <div className="group relative rounded-xl border border-outline-variant/20 bg-surface-container/60 hover:bg-surface-container hover:border-primary/40 transition-all duration-200 flex flex-col justify-between p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div>
        {/* Top Header: Logo, Name, Symbol, Watchlist */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link
            href={`/company/${product.symbol.toLowerCase()}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="w-11 h-11 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              {product.image && !imgError ? (
                <Image
                  src={product.image}
                  alt={companyName}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain p-1.5"
                  onError={() => setImgError(true)}
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-headline font-bold text-base text-primary/80 bg-primary/5">
                  {product.symbol.slice(0, 2)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-headline font-semibold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                {companyName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-label text-xs uppercase px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-mono">
                  ${product.symbol}
                </span>
                <span className="text-[11px] text-on-surface-variant/70 truncate hidden sm:inline">
                  PreStocks
                </span>
              </div>
            </div>
          </Link>

          <WatchlistButton symbol={product.symbol} variant="icon" size="sm" />
        </div>

        {/* Pricing Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-outline-variant/10 text-xs">
          <div>
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
              Token Price
            </div>
            <div className="font-mono font-bold text-sm text-on-surface">
              {formatCurrency(product.tokenPrice)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
              Mark Price
            </div>
            <div className="font-mono text-sm text-on-surface-variant">
              {formatCurrency(product.markPrice)}
            </div>
          </div>
        </div>

        {/* Secondary Metrics: Implied Valuation & Premium */}
        <div className="pt-3 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
              Implied Valuation
            </div>
            <div
              className="font-mono font-semibold text-xs text-on-surface"
              title={`Implied: ${formatCurrency(product.impliedValuation)} | Mark: ${formatCurrency(product.markValuation)}`}
            >
              {formatCompactValuation(product.impliedValuation)}
            </div>
          </div>

          <PremiumBadge premiumPercent={product.premiumPercent} size="sm" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs">
        <Link
          href={`/company/${product.symbol.toLowerCase()}`}
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-headline font-medium"
        >
          <span>Research metrics</span>
          <MaterialIcon icon="arrow_forward" size="sm" />
        </Link>

        <a
          href={product.external_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] text-on-surface-variant/60 hover:text-primary transition-colors flex items-center gap-0.5"
          title="Open on PreStocks.com"
        >
          <span>PreStocks</span>
          <MaterialIcon icon="open_in_new" size="sm" />
        </a>
      </div>
    </div>
  );
}
