"use client";

import { useState } from "react";
import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";

type BorrowMode = "floating" | "fixed";

// --- Fixed rate data ---

interface FixedRateAsset {
  ticker: string;
  logo: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  duration: string;
  upsideCap: string;
}

const fixedAssets: FixedRateAsset[] = [
  { ticker: "SPY", logo: "/coins/SP500.svg", tag: "Stable", tagColor: "text-secondary", tagBg: "bg-secondary/10", duration: "90 Days", upsideCap: "+12.0%" },
  { ticker: "QQQ", logo: "/xStocks/qqq.svg", tag: "Growth", tagColor: "text-secondary", tagBg: "bg-secondary/10", duration: "180 Days", upsideCap: "+18.0%" },
  { ticker: "TSLA", logo: "/coins/TSLA.svg", tag: "High Vol", tagColor: "text-error", tagBg: "bg-error/10", duration: "30 Days", upsideCap: "+25.0%" },
  { ticker: "NVDA", logo: "/coins/NVDA.svg", tag: "High Vol", tagColor: "text-error", tagBg: "bg-error/10", duration: "60 Days", upsideCap: "+22.0%" },
];

const collarBenefits = [
  "Zero borrowing cost — no interest payments at all.",
  "You give up upside beyond the cap in exchange for free borrowing.",
  "Fixed duration matches your liquidity needs perfectly.",
];

export default function BorrowPanel() {
  const [mode, setMode] = useState<BorrowMode>("floating");

  return (
    <section className="mb-16">
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          {/* Mode Toggle */}
          <div className="flex gap-1 mb-4 bg-surface-container-high rounded-full p-1">
            <button
              onClick={() => setMode("floating")}
              className={`flex-1 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
                mode === "floating"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Floating Rate
            </button>
            <button
              onClick={() => setMode("fixed")}
              className={`flex-1 py-2.5 rounded-full text-sm font-headline font-bold transition-all ${
                mode === "fixed"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Zero Cost
            </button>
          </div>

          {mode === "floating" ? <FloatingRateContent /> : <FixedRateContent />}
        </div>
      </div>
    </section>
  );
}

// ── Floating Rate ──

function FloatingRateContent() {
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  const collateralValue = Number(collateralAmount) || 0;
  const borrowValue = Number(borrowAmount) || 0;
  const collateralUsd = collateralValue * 512.44;
  const ltv = collateralUsd > 0 ? ((borrowValue / collateralUsd) * 100).toFixed(0) : "0";

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Image src="/coins/SP500.svg" alt="SPYx" width={40} height={40} className="rounded-full" unoptimized />
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface leading-tight">Borrow</h2>
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
        <InputBox
          label="Supply Collateral SPYx"
          tokenLogo="/coins/SP500.svg"
          tokenAlt="SPYx"
          value={collateralAmount}
          onChange={setCollateralAmount}
          usdValue={collateralUsd}
          balance="0.00"
          balanceLabel="SPYx"
        />

        <InputBox
          label="Borrow USDC"
          tokenLogo="/coins/usdc.svg"
          tokenAlt="USDC"
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
              <Image src="/chains/ethereum.svg" alt="Ethereum" width={18} height={18} className="rounded-full" unoptimized />
              <span className="text-sm font-bold text-on-surface">Ethereum</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <SummaryRow icon={<Image src="/coins/SP500.svg" alt="SPYx" width={20} height={20} className="rounded-full" unoptimized />} label="Collateral" value={collateralValue.toFixed(2)} />
            <SummaryRow icon={<Image src="/coins/usdc.svg" alt="USDC" width={20} height={20} className="rounded-full" unoptimized />} label="Loan" value={borrowValue.toFixed(2)} />
            <SummaryRow label="LTV" value={`${ltv}%`} />
            <SummaryRow label="Liq. LTV" value="85%" />
            <SummaryRow label="Rate" value="3.15%" valueClassName="text-primary" />
          </div>
        </div>

        <button className="w-full primary-gradient rounded-xl text-on-primary font-bold text-base hover:brightness-110 transition-all shadow-lg py-3">
          Initialize Borrow Position
        </button>
        <p className="text-center text-xs text-outline italic font-label">
          * Dynamic APR: <span className="text-on-surface-variant font-bold">4.2% – 12.8%</span> based on utilization
        </p>
      </div>
    </div>
  );
}

// ── Fixed Rate ──

function FixedRateContent() {
  const [activeIdx, setActiveIdx] = useState(0);
  const asset = fixedAssets[activeIdx];

  const prev = () => setActiveIdx((i) => (i === 0 ? fixedAssets.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === fixedAssets.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-4">
      {/* Carousel card */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface leading-tight">
              Zero Cost Borrow via Collar
            </h2>
            <p className="text-xs text-on-surface-variant font-label mt-0.5">
              Borrow for free by giving up upside beyond the cap
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20">
            <Image src="/protocols/sts.jpg" alt="STS Digital" width={18} height={18} className="rounded-full" unoptimized />
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-label">
              STS Digital
            </span>
          </div>
        </div>

        {/* Single asset card */}
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Image src={asset.logo} alt={asset.ticker} width={32} height={32} className="rounded-full" unoptimized />
            <span className="font-label font-black text-2xl text-on-surface">{asset.ticker}</span>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-outline font-label">Borrow Cost</span>
              <span className="text-lg font-label font-bold text-primary">0%</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-outline font-label">Upside Cap</span>
              <span className="text-sm font-label font-bold text-on-surface">{asset.upsideCap}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-outline font-label">Duration</span>
              <span className="text-sm font-label font-bold text-on-surface">{asset.duration}</span>
            </div>
          </div>

          <button className="w-full primary-gradient rounded-xl text-on-primary font-bold text-base py-3 hover:brightness-110 transition-all shadow-lg">
            Select {asset.ticker} Strategy
          </button>
        </div>

        {/* Navigation: arrows + dots */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container hover:border-primary/30 transition-all"
          >
            <MaterialIcon icon="chevron_left" size="sm" />
          </button>

          <div className="flex gap-2">
            {fixedAssets.map((a, i) => (
              <button
                key={a.ticker}
                onClick={() => setActiveIdx(i)}
                className={`transition-all ${
                  i === activeIdx
                    ? "w-6 h-2 rounded-full bg-primary"
                    : "w-2 h-2 rounded-full bg-outline-variant/40 hover:bg-outline-variant"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container hover:border-primary/30 transition-all"
          >
            <MaterialIcon icon="chevron_right" size="sm" />
          </button>
        </div>
      </div>

      {/* Collar explainer teaser — draws eye downward */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
        <div className="flex items-center gap-3 mb-3">
          <MaterialIcon icon="info" size="sm" className="text-secondary" />
          <h3 className="text-base font-headline font-bold text-on-surface">
            How Zero Cost Borrow Works
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          Borrow at <span className="text-on-surface font-semibold">zero cost</span> by giving up
          some <span className="text-on-surface font-semibold italic">upside</span> (capping gains).
          Routed through <span className="text-secondary font-semibold">STS Digital</span> collar
          infrastructure.
        </p>
        <ul className="space-y-2.5 mb-5">
          {collarBenefits.map((b) => (
            <li key={b} className="flex items-center gap-2.5">
              <MaterialIcon icon="check_circle" size="sm" className="text-primary shrink-0" />
              <span className="text-xs text-on-surface-variant">{b}</span>
            </li>
          ))}
        </ul>

        {/* Payoff diagram */}
        <div className="bg-surface-container rounded-xl p-4 relative overflow-hidden">
          <span className="text-[10px] text-outline uppercase tracking-widest font-label block mb-3 text-center">
            Collar Payoff Diagram
          </span>
          <div className="h-32 w-full relative">
            <div className="absolute bottom-0 left-0 w-full h-px bg-outline-variant" />
            <div className="absolute bottom-0 left-0 h-full w-px bg-outline-variant" />
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <line stroke="#3c4a42" strokeDasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="80" y2="20" />
              <polyline fill="none" points="0,70 30,70 70,30 100,30" stroke="#66d4f6" strokeWidth="2" />
            </svg>
            <div className="absolute left-0 top-[65%] -translate-y-1/2 bg-surface-container px-1.5 py-0.5 border border-secondary/30 rounded text-[9px] text-secondary font-label">
              PUT FLOOR
            </div>
            <div className="absolute right-0 top-[35%] -translate-y-1/2 bg-surface-container px-1.5 py-0.5 border border-primary/30 rounded text-[9px] text-primary font-label">
              CALL CAP
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[9px] font-label text-outline uppercase tracking-widest">
            <span>Price Down</span>
            <span>Price Up</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-[40px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──

function InputBox({
  label, tokenLogo, tokenAlt, value, onChange, usdValue, balance, balanceLabel,
}: {
  label: string; tokenLogo: string; tokenAlt: string; value: string;
  onChange: (val: string) => void; usdValue: number; balance: string; balanceLabel: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-colors px-4 py-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-on-surface-variant font-label">{label}</span>
        <Image src={tokenLogo} alt={tokenAlt} width={24} height={24} className="rounded-full" unoptimized />
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
          <span className="text-[11px] text-outline font-label">{balance} {balanceLabel}</span>
          <button className="bg-surface-container-high px-2.5 py-1 rounded text-[10px] font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-colors uppercase">
            MAX
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, valueClassName = "text-on-surface" }: {
  icon?: React.ReactNode; label: string; value: string; valueClassName?: string;
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
