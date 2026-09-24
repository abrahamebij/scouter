"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import MaterialIcon from "@/components/ui/MaterialIcon";

const STOCK_LOGOS: Record<string, string> = {
  SPY: "/coins/SP500.svg",
  QQQ: "/xStocks/qqq.svg",
  TSLA: "/coins/TSLA.svg",
  NVDA: "/coins/NVDA.svg",
};

const intents = [
  { label: "Accumulate Spot", icon: "shopping_cart", desc: "DCA into assets over time" },
  { label: "Yield on Stocks", icon: "trending_up", desc: "Earn passive income on holdings" },
  { label: "Borrow Against Stocks", icon: "account_balance", desc: "Unlock liquidity without selling" },
  { label: "Hedge Risks", icon: "shield", desc: "Protect your portfolio downside" },
  { label: "Trade Assets", icon: "swap_horiz", desc: "Buy and sell onchain equities" },
  { label: "Spend", icon: "credit_card", desc: "Use your portfolio for everyday spending" },
];

const assets = ["SPY", "QQQ", "TSLA", "NVDA"];

const outlooks = [
  { label: "Bullish", icon: "trending_up", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  { label: "Bearish", icon: "trending_down", color: "text-error", bg: "bg-error/10", border: "border-error/30" },
  { label: "Volatile", icon: "insights", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30" },
  { label: "Neutral", icon: "trending_flat", color: "text-on-surface-variant", bg: "bg-surface-container-highest/50", border: "border-outline-variant/30" },
];

const riskLevels = [
  { label: "Extra Conservative", desc: "Minimal risk, stable returns", icon: "lock" },
  { label: "Low", desc: "Modest risk, steady growth", icon: "security" },
  { label: "Moderate", desc: "Balanced risk and reward", icon: "balance" },
  { label: "High", desc: "Maximum returns, higher risk", icon: "bolt" },
];

const TOTAL_STEPS = 4;

interface TypeformFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function TypeformFlow({ onComplete, onBack }: TypeformFlowProps) {
  const [step, setStep] = useState(0);
  const [selectedIntent, setSelectedIntent] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null);
  const [selectedOutlook, setSelectedOutlook] = useState<number | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      onComplete();
    }
  }, [step, onComplete]);

  const goPrev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    } else {
      onBack();
    }
  }, [step, onBack]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const hasSelection =
          (step === 0 && selectedIntent !== null) ||
          (step === 1 && selectedAsset !== null) ||
          (step === 2 && selectedOutlook !== null) ||
          (step === 3 && selectedRisk !== null);
        if (hasSelection) goNext();
      }
      if (e.key === "Escape") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, selectedIntent, selectedAsset, selectedOutlook, selectedRisk, goNext, goPrev]);

  const slideVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  const canProceed =
    (step === 0 && selectedIntent !== null) ||
    (step === 1 && selectedAsset !== null) ||
    (step === 2 && selectedOutlook !== null) ||
    (step === 3 && selectedRisk !== null);

  return (
    <div className="min-h-[70vh] flex flex-col justify-center max-w-3xl mx-auto relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 flex gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-surface-container-highest">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        ))}
      </div>

      {/* Step counter & back */}
      <div className="flex items-center justify-between mb-12 mt-8">
        <button
          onClick={goPrev}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm group"
        >
          <MaterialIcon icon="arrow_back" size="sm" className="group-hover:-translate-x-1 transition-transform" />
          {step === 0 ? "Back" : "Previous"}
        </button>
        <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
          {step + 1} / {TOTAL_STEPS}
        </span>
      </div>

      {/* Question area */}
      <div className="relative min-h-[400px] flex items-start">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full"
          >
            {step === 0 && (
              <StepIntent selected={selectedIntent} onSelect={(i) => { setSelectedIntent(i); setTimeout(() => { setDirection(1); setStep(1); }, 400); }} />
            )}
            {step === 1 && (
              <StepAsset selected={selectedAsset} onSelect={(i) => { setSelectedAsset(i); setTimeout(() => { setDirection(1); setStep(2); }, 400); }} />
            )}
            {step === 2 && (
              <StepOutlook selected={selectedOutlook} onSelect={(i) => { setSelectedOutlook(i); setTimeout(() => { setDirection(1); setStep(3); }, 400); }} />
            )}
            {step === 3 && (
              <StepRisk selected={selectedRisk} onSelect={setSelectedRisk} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-8">
        {step === TOTAL_STEPS - 1 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: canProceed ? 1 : 0.4, scale: 1 }}
            onClick={goNext}
            disabled={!canProceed}
            className="px-10 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-base hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:cursor-not-allowed"
          >
            Show Strategies
            <MaterialIcon icon="arrow_forward" size="sm" />
          </motion.button>
        )}
      </div>

      {/* Press Enter hint */}
      {canProceed && step === TOTAL_STEPS - 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-on-surface-variant/50 mt-4"
        >
          press <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[10px] font-mono">Enter ↵</kbd> to continue
        </motion.p>
      )}
    </div>
  );
}

/* ─── Individual Steps ─── */

function StepIntent({ selected, onSelect }: { selected: number | null; onSelect: (i: number) => void }) {
  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">
        What do you want to do?
      </h2>
      <p className="text-lg text-on-surface-variant mb-10 font-light">
        Choose your primary investment objective
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {intents.map((intent, idx) => (
          <motion.button
            key={intent.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            onClick={() => onSelect(idx)}
            className={`group relative flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200 ${
              selected === idx
                ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                : "bg-surface-container-low/50 border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container/50"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              selected === idx ? "bg-primary/20" : "bg-surface-container-highest/60 group-hover:bg-primary/10"
            }`}>
              <MaterialIcon
                icon={intent.icon}
                className={selected === idx ? "text-primary" : "text-on-surface-variant group-hover:text-primary/70"}
              />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${selected === idx ? "text-primary" : "text-on-surface"}`}>
                {intent.label}
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">{intent.desc}</p>
            </div>
            <span className="text-xs font-mono text-on-surface-variant/30 hidden sm:block">
              {String.fromCharCode(65 + idx)}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepAsset({ selected, onSelect }: { selected: number | null; onSelect: (i: number) => void }) {
  const [search, setSearch] = useState("");

  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">
        Which asset?
      </h2>
      <p className="text-lg text-on-surface-variant mb-10 font-light">
        Select the equity you&apos;d like to work with
      </p>
      <div className="space-y-3">
        {assets.map((asset, idx) => (
          <motion.button
            key={asset}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            onClick={() => onSelect(idx)}
            className={`w-full group flex items-center gap-5 p-5 rounded-2xl border text-left transition-all duration-200 ${
              selected === idx
                ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                : "bg-surface-container-low/50 border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container/50"
            }`}
          >
            <Image src={STOCK_LOGOS[asset]} alt={asset} width={36} height={36} className="rounded-full" unoptimized />
            <span className={`font-bold text-lg font-label tracking-tight ${
              selected === idx ? "text-primary" : "text-on-surface"
            }`}>
              {asset}
            </span>
            <span className="text-xs font-mono text-on-surface-variant/30 ml-auto hidden sm:block">
              {String.fromCharCode(65 + idx)}
            </span>
          </motion.button>
        ))}
        {/* Custom search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          className="relative"
        >
          <MaterialIcon
            icon="search"
            size="sm"
            className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl pl-13 pr-6 py-5 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none transition-all placeholder:text-on-surface-variant/30"
            placeholder="Search for another ticker..."
          />
        </motion.div>
      </div>
    </div>
  );
}

function StepOutlook({ selected, onSelect }: { selected: number | null; onSelect: (i: number) => void }) {
  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">
        Market outlook?
      </h2>
      <p className="text-lg text-on-surface-variant mb-10 font-light">
        What&apos;s your view on where the market is headed?
      </p>
      <div className="grid grid-cols-2 gap-4">
        {outlooks.map((outlook, idx) => (
          <motion.button
            key={outlook.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08, duration: 0.3 }}
            onClick={() => onSelect(idx)}
            className={`group flex flex-col items-center gap-3 p-8 rounded-2xl border transition-all duration-200 ${
              selected === idx
                ? `${outlook.bg} ${outlook.border} ring-1 ring-primary/10`
                : "bg-surface-container-low/50 border-outline-variant/10 hover:border-outline-variant/30 hover:bg-surface-container/50"
            }`}
          >
            <MaterialIcon
              icon={outlook.icon}
              size="lg"
              className={selected === idx ? outlook.color : "text-on-surface-variant/50 group-hover:text-on-surface-variant"}
            />
            <span className={`font-bold text-base ${
              selected === idx ? outlook.color : "text-on-surface"
            }`}>
              {outlook.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepRisk({ selected, onSelect }: { selected: number | null; onSelect: (i: number) => void }) {
  return (
    <div>
      <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-3 tracking-tight">
        Risk tolerance?
      </h2>
      <p className="text-lg text-on-surface-variant mb-10 font-light">
        How much risk are you comfortable with?
      </p>
      <div className="space-y-3">
        {riskLevels.map((level, idx) => (
          <motion.button
            key={level.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.3 }}
            onClick={() => onSelect(idx)}
            className={`w-full group flex items-center gap-5 p-5 rounded-2xl border text-left transition-all duration-200 ${
              selected === idx
                ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                : "bg-surface-container-low/50 border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container/50"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              selected === idx ? "bg-primary/20" : "bg-surface-container-highest/60 group-hover:bg-primary/10"
            }`}>
              <MaterialIcon
                icon={level.icon}
                className={selected === idx ? "text-primary" : "text-on-surface-variant group-hover:text-primary/70"}
              />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${selected === idx ? "text-primary" : "text-on-surface"}`}>
                {level.label}
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">{level.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
