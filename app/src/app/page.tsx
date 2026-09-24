"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TypeformFlow from "@/components/home/TypeformFlow";
import SuggestedStrategies from "@/components/home/SuggestedStrategies";
import PoweredBy from "@/components/home/PoweredBy";
import MaterialIcon from "@/components/ui/MaterialIcon";

const quickLinks = [
  { href: "/strategies", label: "Earn", icon: "trending_up" },
  { href: "/borrow", label: "Borrow", icon: "account_balance" },
  { href: "/trade", label: "Trade", icon: "swap_horiz" },
  { href: "/spend", label: "Spend", icon: "credit_card" },
];

type View = "hero" | "flow" | "result";

export default function HomePage() {
  const [view, setView] = useState<View>("hero");

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-screen-2xl mx-auto overflow-x-hidden min-h-screen">
        <AnimatePresence mode="wait">
          {view === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Hero */}
              <section className="text-center mb-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-surface-container-high border border-outline-variant/15"
                >
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">
                    LIVE ON ETHEREUM &amp; INK
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-5xl md:text-8xl font-headline font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]"
                >
                  Prime Brokerage for <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-fixed to-secondary">
                    Onchain Equities
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto mb-12 leading-relaxed font-light"
                >
                  Unlock yield, leverage, and liquidity from your stock portfolio.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
                >
                  <button
                    onClick={() => setView("flow")}
                    className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold text-lg hover:brightness-110 transition-all shadow-xl shadow-primary/10"
                  >
                    Explore Strategies
                  </button>
                  <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-surface-container-highest text-on-surface font-semibold text-lg hover:bg-surface-variant transition-all border border-outline-variant/10">
                    Onboard Stocks From Brokerage
                  </button>
                </motion.div>

                {/* Quick access pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center justify-center gap-3 flex-wrap"
                >
                  <span className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-label mr-2">
                    Jump to
                  </span>
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-low/50 border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium"
                    >
                      <MaterialIcon icon={link.icon} size="sm" />
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              </section>

              <SuggestedStrategies />
              <PoweredBy />
            </motion.div>
          )}

          {view === "flow" && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Quick-access pills */}
              <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
                <span className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-label mr-2">
                  Skip to
                </span>
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-low/50 border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium"
                  >
                    <MaterialIcon icon={link.icon} size="sm" />
                    {link.label}
                  </Link>
                ))}
              </div>

              <TypeformFlow
                onComplete={() => setView("result")}
                onBack={() => setView("hero")}
              />
            </motion.div>
          )}

          {view === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-2xl mx-auto"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20">
                  <MaterialIcon icon="auto_awesome" size="sm" className="text-primary" />
                  <span className="text-xs font-label uppercase tracking-widest text-primary font-bold">
                    Strategy Selected For You
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface tracking-tight">
                  USD Carry Trade
                </h2>
                <p className="text-on-surface-variant mt-3 text-lg font-light">
                  Earn the spread between borrow cost and vault APY on stablecoins
                </p>
                <Link
                  href="/strategies"
                  className="inline-flex items-center gap-2 mt-5 text-sm text-on-surface-variant/60 hover:text-primary transition-colors"
                >
                  Explore other earn strategies
                  <MaterialIcon icon="arrow_forward" size="sm" />
                </Link>
              </motion.div>

              {/* Strategy Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="glass-card rounded-[2rem] p-8 md:p-10 premium-shadow relative overflow-hidden"
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                {/* Strategy info header */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-primary/10">
                    <MaterialIcon icon="currency_exchange" size="lg" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-headline font-bold text-on-surface">USD Carry Trade</h3>
                      <span className="text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                        Mid Risk
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      Borrow aUSD against SPYx and earn yield on the spread
                    </p>
                  </div>
                </div>

                {/* Balance */}
                <div className="bg-surface-container-lowest/60 rounded-2xl p-6 mb-8 border border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Your Balance</p>
                      <p className="text-3xl font-label font-bold text-on-surface">$10,000.00</p>
                      <p className="text-sm text-on-surface-variant mt-1">
                        <span className="text-primary">10,000.00 USDC</span> available
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Est. APY</p>
                      <p className="text-3xl font-label font-bold text-primary">15.0%</p>
                      <p className="text-sm text-on-surface-variant mt-1">carry spread</p>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                    How it works
                  </p>

                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Link
                      href="/trade?symbol=SP500&mode=spot"
                      className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm font-label shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-on-surface text-sm">Buy SPYx</p>
                        <p className="text-xs text-on-surface-variant/60">Purchase tokenized S&P 500 on the trade page</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image src="/coins/SP500.svg" alt="SPY" width={20} height={20} className="rounded-full" unoptimized />
                        <MaterialIcon icon="arrow_forward" size="sm" className="text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <Link
                      href="/strategies/ausd-carry-trade"
                      className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/10 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm font-label shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-on-surface text-sm">Deposit into Carry Vault</p>
                        <p className="text-xs text-on-surface-variant/60">Earn yield on the borrow-to-vault spread automatically</p>
                      </div>
                      <MaterialIcon icon="trending_up" size="sm" className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                    </Link>
                  </motion.div>
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.4 }}
                  className="flex gap-3"
                >
                  <Link
                    href="/strategies/ausd-carry-trade"
                    className="flex-1 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-base text-center hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                  >
                    Start Earning
                  </Link>
                  <button
                    onClick={() => setView("hero")}
                    className="px-6 py-4 rounded-full bg-surface-container-highest text-on-surface font-semibold text-base hover:bg-surface-variant transition-all border border-outline-variant/10"
                  >
                    Start Over
                  </button>
                </motion.div>
              </motion.div>

              {/* Quick links below */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex items-center justify-center gap-3 mt-10 flex-wrap"
              >
                <span className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-label mr-2">
                  Or go to
                </span>
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-low/50 border border-outline-variant/10 text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium"
                  >
                    <MaterialIcon icon={link.icon} size="sm" />
                    {link.label}
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
