"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { formatCurrency, formatCompactValuation } from "@/lib/prestocks/format";
import WatchlistButton from "./WatchlistButton";

interface ProductCardProps {
  product: PreStockDerived;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const companyName = getCompanyName(product.name);

  return (
    <Link
      href={`/company/${product.symbol.toLowerCase()}`}
      className="group relative rounded-xl border border-outline-variant/20 bg-surface-container/60 hover:bg-surface-container hover:border-outline-variant/50 transition-all duration-200 flex flex-col justify-between p-5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] cursor-pointer"
    >
      <div>
        {/* Top Header: Logo, Name, Symbol, Watchlist */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
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
                <div className="w-full h-full flex items-center justify-center font-headline font-bold text-base text-on-surface-variant/50 bg-surface-container-highest">
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
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <WatchlistButton symbol={product.symbol} variant="icon" size="sm" />
          </div>
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

        {/* Implied Valuation */}
        <div className="pt-3">
          <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
            Implied Valuation
          </div>
          <div
            className="font-mono font-bold text-base text-accent"
            title={`Implied: ${formatCurrency(product.impliedValuation)} | Mark: ${formatCurrency(product.markValuation)}`}
          >
            {formatCompactValuation(product.impliedValuation)}
          </div>
        </div>
      </div>
    </Link>
  );
}
