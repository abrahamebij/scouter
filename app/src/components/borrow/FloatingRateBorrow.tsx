"use client";

import { useState } from "react";
import MaterialIcon from "@/components/ui/MaterialIcon";

export default function FloatingRateBorrow() {
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  const collateralValue = Number(collateralAmount) || 0;
  const borrowValue = Number(borrowAmount) || 0;
  const collateralUsd = collateralValue * 512.44;
  const ltv = collateralUsd > 0 ? ((borrowValue / collateralUsd) * 100).toFixed(0) : "0";

  return (
    <section className="mb-16">
      <div className="flex justify-center">
        <div className="w-full max-w-lg bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
          {/* Card Header — section title lives here */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MaterialIcon icon="account_balance_wallet" className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-headline font-bold text-on-surface leading-tight">
                  Borrow at Floating Rate
                </h2>
                <p className="text-xs text-on-surface-variant font-label">
                  Morpho SPYx-AUSD &middot; Collateral: SPYx
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-on-surface-variant uppercase tracking-widest font-label">
                SPYx Price
              </span>
              <span className="text-xl font-label font-bold text-secondary">$512.44</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Supply Collateral */}
            <InputBox
              label="Supply Collateral SPYx"
              tokenSymbol="S"
              tokenColor="bg-primary/20 text-primary"
              value={collateralAmount}
              onChange={setCollateralAmount}
              usdValue={collateralUsd}
              balance="0.00"
              balanceLabel="SPYx"
            />

            {/* Borrow USDC */}
            <InputBox
              label="Borrow USDC"
              tokenSymbol="$"
              tokenColor="bg-secondary/20 text-secondary"
              value={borrowAmount}
              onChange={setBorrowAmount}
              usdValue={borrowValue}
              balance="0.00"
              balanceLabel="USDC"
            />

            {/* Summary */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 px-4 py-3">
              <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-outline-variant/10">
                <span className="text-sm text-on-surface-variant font-label">Network</span>
                <div className="flex items-center gap-1.5">
                  <MaterialIcon icon="hub" size="sm" className="text-on-surface" />
                  <span className="text-sm font-bold text-on-surface">Ethereum</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <SummaryRow
                  icon={<TokenBadge symbol="S" className="bg-primary/20 text-primary" />}
                  label="Collateral"
                  value={collateralValue.toFixed(2)}
                />
                <SummaryRow
                  icon={<TokenBadge symbol="$" className="bg-secondary/20 text-secondary" />}
                  label="Loan"
                  value={borrowValue.toFixed(2)}
                />
                <SummaryRow label="LTV" value={`${ltv}%`} />
                <SummaryRow label="Liq. LTV" value="85%" />
                <SummaryRow label="Rate" value="3.15%" valueClassName="text-primary" />
              </div>
            </div>

            {/* CTA */}
            <button className="w-full primary-gradient rounded-xl text-on-primary font-bold text-base hover:brightness-110 transition-all shadow-lg py-3">
              Initialize Borrow Position
            </button>
            <p className="text-center text-xs text-outline italic font-label">
              * Dynamic APR:{" "}
              <span className="text-on-surface-variant font-bold">4.2% – 12.8%</span> based on
              utilization
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputBox({
  label,
  tokenSymbol,
  tokenColor,
  value,
  onChange,
  usdValue,
  balance,
  balanceLabel,
}: {
  label: string;
  tokenSymbol: string;
  tokenColor: string;
  value: string;
  onChange: (val: string) => void;
  usdValue: number;
  balance: string;
  balanceLabel: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-colors px-4 py-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-on-surface-variant font-label">{label}</span>
        <TokenBadge symbol={tokenSymbol} className={tokenColor} />
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none focus:ring-0 font-label font-bold w-full text-on-surface p-0 text-2xl input-no-spin mb-1"
        placeholder="0.00"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-outline font-label">
          ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-outline font-label">
            {balance} {balanceLabel}
          </span>
          <button className="bg-surface-container-high px-2.5 py-1 rounded text-[10px] font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-colors uppercase">
            MAX
          </button>
        </div>
      </div>
    </div>
  );
}

function TokenBadge({ symbol, className }: { symbol: string; className: string }) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${className}`}
    >
      {symbol}
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  valueClassName = "text-on-surface",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-on-surface-variant font-label">{label}</span>
      </div>
      <span className={`text-sm font-bold ${valueClassName}`}>{value}</span>
    </div>
  );
}
