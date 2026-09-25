"use client";

import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";
import Img from "@/components/ui/Img";
import SolanaConnectButton from "@/components/layout/SolanaConnectButton";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden border-b border-outline-variant/20 bg-surface-container-lowest min-h-[85vh] lg:min-h-[100vh] flex flex-col justify-between p-4 sm:p-10 lg:px-12 shadow-2xl transition-all">
      {/* Background Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* Atmospheric High-Tech CSS Fallback / Lighting Overlays */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(110,231,183,0.06),transparent_70%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(255,255,255,0.04),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-25 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        aria-hidden="true"
      />
      {/* Dark Vignettes & Contrast Gradients for Crisp Text Readability */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-surface via-surface/40 to-surface/20"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-r from-black/85 via-black/40 to-black/60"
        aria-hidden="true"
      />

      {/* Top Floating Header & Pill Navigation */}
      <header className="relative z-10 w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <Img src="/logo.png" alt="SCOUTER Logo" className="size-8 sm:size-9" />
          <div className="flex flex-col">
            <span className="font-headline font-bold text-base sm:text-lg tracking-wider text-white">
              SCOUTER
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold -mt-1 hidden sm:inline">
              PreStocks Terminal
            </span>
          </div>
        </Link>

        {/* Floating Center Frosted Glass Pill Capsule */}
        <nav
          aria-label="Hero navigation"
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/30 font-headline text-xs font-medium"
        >
          <a
            href="#catalog"
            className="px-4 py-1.5 rounded-full bg-white/15 text-white font-semibold shadow-xs transition-colors"
          >
            Overview
          </a>
          <Link
            href="/dashboard/market"
            className="px-3.5 py-1.5 rounded-full text-zinc-300 hover:text-white transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/dashboard/intelligence"
            className="px-3.5 py-1.5 rounded-full text-zinc-300 hover:text-white transition-colors"
          >
            Intelligence
          </Link>
          <Link
            href="/docs"
            className="px-3.5 py-1.5 rounded-full text-zinc-300 hover:text-white transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Right Action: Wallet + Pill CTA Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:block">
            <SolanaConnectButton />
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white text-black font-headline font-bold text-xs sm:text-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            <span>Launch App</span>
            <MaterialIcon icon="north_east" size="sm" className="text-black" />
          </Link>
        </div>
      </header>

      {/* Bottom Main Content Grid */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-end pt-16 sm:pt-20">
        {/* Lower-Left Bold Title Typography */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-[11px] font-mono text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>PreStocks Secondary Markets</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-headline font-extrabold tracking-tight text-white leading-[1.06]">
            Empowering the <br />
            valuation <br />
            of private tech.
          </h1>
        </div>

        {/* Lower-Right Narrative Block */}
        <div className="lg:col-span-5 space-y-4 lg:pl-6">
          <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
            Track live secondary token pricing, SPV collateral, and institutional marks for pre-IPO giants in{" "}
            <span className="font-semibold text-white">
              real-time on Solana.
            </span>
          </p>

          <div className="flex items-center gap-4 pt-1">
            <a
              href="#catalog"
              className="inline-flex items-center gap-1.5 text-xs font-headline font-semibold text-zinc-300 hover:text-white transition-colors group"
            >
              <span>Explore PreStocks Catalog</span>
              <MaterialIcon
                icon="arrow_downward"
                size="sm"
                className="group-hover:translate-y-0.5 transition-transform text-accent"
              />
            </a>
            <span className="text-zinc-600" aria-hidden="true">&bull;</span>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1 text-xs font-headline text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span>Developer API</span>
              <MaterialIcon icon="arrow_forward" size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
