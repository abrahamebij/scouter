"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { formatCurrency, formatCompactValuation, formatPercentage } from "@/lib/prestocks/format";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface ContextualCompanyCardProps {
  product: PreStockDerived;
}

export default function ContextualCompanyCard({ product }: ContextualCompanyCardProps) {
  const [imgError, setImgError] = useState(false);
  const companyName = getCompanyName(product.name);

  return (
    <Link
      href={`/company/${product.symbol.toLowerCase()}`}
      className="group block p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container-high/40 transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.image && !imgError ? (
              <Image
                src={product.image}
                alt={companyName}
                width={32}
                height={32}
                className="w-full h-full object-contain p-1"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <span className="font-headline font-bold text-xs text-on-surface-variant">
                {product.symbol.slice(0, 2)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="font-headline font-semibold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
              {companyName}
            </h4>
            <span className="font-mono text-[10px] text-on-surface-variant">
              ${product.symbol}
            </span>
          </div>
        </div>

        <MaterialIcon
          icon="arrow_forward"
          size="sm"
          className="text-on-surface-variant/40 group-hover:text-on-surface transition-colors"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/10 text-[11px]">
        <div>
          <span className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/70 block">
            Token
          </span>
          <span className="font-mono font-semibold text-on-surface">
            {formatCurrency(product.tokenPrice)}
          </span>
        </div>

        <div>
          <span className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/70 block">
            Implied Val
          </span>
          <span className="font-mono font-semibold text-accent">
            {formatCompactValuation(product.impliedValuation)}
          </span>
        </div>

        <div>
          <span className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/70 block">
            vs Mark
          </span>
          <span
            className={`font-mono font-semibold ${
              product.premiumPercent >= 0 ? "text-accent" : "text-secondary"
            }`}
          >
            {formatPercentage(product.premiumPercent)}
          </span>
        </div>
      </div>
    </Link>
  );
}
