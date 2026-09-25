"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PreStockDerived } from "@/lib/prestocks/types";
import { getCompanyName } from "@/lib/prestocks/transforms";
import { truncateAddress } from "@/lib/prestocks/format";
import WatchlistButton from "./WatchlistButton";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";

interface CompanyHeaderProps {
  product: PreStockDerived;
}

export default function CompanyHeader({ product }: CompanyHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const companyName = getCompanyName(product.name);

  const handleCopyContract = () => {
    if (!product.contract_address) return;
    navigator.clipboard.writeText(product.contract_address);
    setCopied(true);
    toast("Contract address copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface-container-low/70 rounded-2xl border border-outline-variant/20 p-6 md:p-8 space-y-6">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors font-headline"
        >
          <MaterialIcon icon="arrow_back" size="sm" />
          <span>Back to Discover</span>
        </Link>

        <span className="font-label text-[11px] uppercase tracking-wider text-accent font-semibold">
          PreStocks Asset
        </span>
      </div>

      {/* Main Company Identity Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.image && !imgError ? (
              <Image
                src={product.image}
                alt={companyName}
                width={64}
                height={64}
                className="w-full h-full object-contain p-2"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <div className="font-headline font-bold text-xl text-on-surface-variant/60">
                {product.symbol.slice(0, 2)}
              </div>
            )}
          </div>

          {/* Titles & Symbol */}
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
                {companyName}
              </h1>
              <span className="font-mono font-bold text-xs uppercase px-2.5 py-1 rounded-md bg-surface-container-high border border-outline-variant/30 text-on-surface">
                ${product.symbol}
              </span>
            </div>
            <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant/80 mt-1">
              Tokenised Pre-IPO Economic Exposure
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <WatchlistButton symbol={product.symbol} variant="button" />

          <a
            href={product.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-headline font-semibold text-on-surface transition-colors"
          >
            <span>Open on PreStocks</span>
            <MaterialIcon icon="open_in_new" size="sm" />
          </a>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-4">
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {/* Contract & Explorer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/10 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label uppercase text-[11px] text-on-surface-variant/70">
            Solana Token Mint:
          </span>
          <code className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface border border-outline-variant/20 select-all">
            {truncateAddress(product.contract_address, 8, 8)}
          </code>
          <button
            onClick={handleCopyContract}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface transition-colors"
            title="Copy full contract address"
          >
            <MaterialIcon icon={copied ? "check" : "content_copy"} size="sm" />
          </button>
        </div>

        <a
          href={`https://explorer.solana.com/address/${product.contract_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors font-label uppercase tracking-wider"
        >
          <span>View on Solana Explorer</span>
          <MaterialIcon icon="open_in_new" size="sm" />
        </a>
      </div>
    </div>
  );
}
