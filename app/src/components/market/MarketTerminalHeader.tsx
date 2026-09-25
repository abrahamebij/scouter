"use client";

import { useState } from "react";
import Image from "next/image";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { formatCurrency, formatPercentage, truncateAddress } from "@/lib/prestocks/format";
import { useCompanySnapshot } from "@/lib/prestocks/snapshots";
import WatchlistButton from "@/components/prestocks/WatchlistButton";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface MarketTerminalHeaderProps {
  product: PreStockDerived;
}

export default function MarketTerminalHeader({ product }: MarketTerminalHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { change } = useCompanySnapshot(product);

  const companyName = getCompanyName(product.name);

  const handleCopyContract = () => {
    if (!product.contract_address) return;
    navigator.clipboard.writeText(product.contract_address);
    setCopied(true);
    toast("Contract address copied", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const hasPriceDelta = change && change.hasChanges && Math.abs(change.tokenPriceChange) > 0.001;
  const isPremiumPositive = product.premiumPercent >= 0;

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-outline-variant/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-accent font-semibold tracking-wider uppercase">
            Solana Pre-IPO Secondary
          </span>
          <span className="text-on-surface-variant/40">&bull;</span>
          <span className="text-[11px] text-on-surface-variant font-light">
            24/7 Continuous Trading
          </span>
        </div>

        <div className="flex items-center gap-3">
          {product.contract_address && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant">
              <span>{truncateAddress(product.contract_address, 4, 4)}</span>
              <button
                type="button"
                onClick={handleCopyContract}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="Copy Solana contract address"
              >
                <MaterialIcon icon={copied ? "check" : "content_copy"} size="sm" />
              </button>
            </div>
          )}

          <WatchlistButton symbol={product.symbol} variant="button" />

          {product.external_url && (
            <a
              href={product.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-headline text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span>PreStocks</span>
              <MaterialIcon icon="open_in_new" size="sm" />
            </a>
          )}
        </div>
      </div>

      {/* Main Identity & Price Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Company Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 overflow-hidden flex items-center justify-center flex-shrink-0">
            {product.image && !imgError ? (
              <Image
                src={product.image}
                alt={companyName}
                width={48}
                height={48}
                className="w-full h-full object-contain p-1.5"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <span className="font-headline font-bold text-base text-on-surface-variant/70">
                {product.symbol.slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
                {companyName}
              </h1>
              <span className="font-mono text-xs font-semibold text-on-surface-variant uppercase">
                ${product.symbol}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-light mt-0.5 line-clamp-1">
              {product.description || "Tokenised economic exposure via Special Purpose Vehicle"}
            </p>
          </div>
        </div>

        {/* Live Token Pricing & vs Mark */}
        <div className="flex flex-col sm:items-end">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono font-bold text-2xl sm:text-3xl text-on-surface">
              {formatCurrency(product.tokenPrice)}
            </span>
            {hasPriceDelta && change && (
              <span
                className={`font-mono text-xs font-semibold ${
                  change.tokenPriceChange >= 0 ? "text-accent" : "text-error"
                }`}
              >
                {change.tokenPriceChange >= 0 ? "+" : ""}
                {formatCurrency(change.tokenPriceChange)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs font-mono">
            <span className="text-on-surface-variant/70 text-[11px]">
              Mark: {formatCurrency(product.markPrice)}
            </span>
            <span className="text-on-surface-variant/40">&bull;</span>
            <span
              className={`text-[11px] font-semibold ${
                isPremiumPositive ? "text-accent" : "text-secondary"
              }`}
            >
              {formatPercentage(product.premiumPercent)} vs Mark
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
