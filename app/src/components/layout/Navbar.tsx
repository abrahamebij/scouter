"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useChainId } from "wagmi";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { useToast } from "@/components/ui/Toast";
import { getAppChainInfo } from "@/lib/config/xstocks";
import { useWalletOverview } from "@/lib/hooks/useWalletOverview";

const navLinks = [
  { href: "/", label: "Home", exact: true },
  { href: "/strategies", label: "Earn" },
  { href: "/borrow", label: "Borrow" },
  { href: "/trade", label: "Trade" },
  { href: "/spend", label: "Spend" },
  { href: "/portfolio", label: "Portfolio", comingSoon: true },
  { href: "/faq", label: "FAQ", comingSoon: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { open } = useAppKit();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const walletOverview = useWalletOverview();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);
  const previousChainIdRef = useRef<number | null>(null);

  const chainInfo = getAppChainInfo(chainId);
  const chainIcon = chainInfo?.icon;

  useEffect(() => {
    const previousChainId = previousChainIdRef.current;

    if (isConnected && previousChainId != null && previousChainId !== chainId) {
      toast(`Switched to ${chainInfo?.name ?? `chain ${chainId}`}`, "success");
    }

    previousChainIdRef.current = chainId;
  }, [chainId, chainInfo?.name, isConnected, toast]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletMenuRef.current &&
        !walletMenuRef.current.contains(event.target as Node)
      ) {
        setWalletMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md shadow-[0_48px_12px_rgba(223,227,225,0.05)]">
      <div className="flex justify-between items-center h-20 px-3 md:px-5 lg:px-6 w-full">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/xprime-logo.svg"
              alt="xPrime"
              width={120}
              height={30}
              className="h-7 w-auto"
              priority
              unoptimized
            />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline font-semibold tracking-tight text-sm">
            {navLinks.map((link) => {
              if (link.comingSoon) {
                return (
                  <span
                    key={link.label}
                    className="relative text-on-surface opacity-30 cursor-default select-none"
                  >
                    {link.label}
                    <span className="absolute -top-3 -right-4 text-[8px] font-label font-medium uppercase tracking-wider text-on-surface-variant opacity-70 whitespace-nowrap">
                      soon
                    </span>
                  </span>
                );
              }
              const isActive = link.exact
                ? pathname === link.href
                : pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={
                    isActive
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-on-surface opacity-70 hover:opacity-100 transition-opacity hover:text-primary"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <div className="relative" ref={walletMenuRef}>
              <button
                onClick={() => setWalletMenuOpen((openMenu) => !openMenu)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-full border border-outline-variant/15 hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-150"
              >
                {chainIcon ? (
                  <Image
                    src={chainIcon}
                    alt={chainInfo?.name ?? "chain"}
                    width={20}
                    height={20}
                    className="rounded-full flex-shrink-0"
                    unoptimized
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  </span>
                )}
                <span className="text-sm font-label text-on-surface tracking-wider hidden sm:inline">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <MaterialIcon
                  icon={walletMenuOpen ? "expand_less" : "expand_more"}
                  size="sm"
                  className="text-on-surface-variant"
                />
              </button>

              {walletMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[320px] rounded-2xl border border-outline-variant/14 bg-[#0b120f]/98 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 rounded-xl border border-outline-variant/10 bg-surface-container/40 px-3 py-3">
                    {chainIcon ? (
                      <Image
                        src={chainIcon}
                        alt={chainInfo?.name ?? "chain"}
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MaterialIcon icon="account_balance_wallet" size="sm" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-headline font-bold text-on-surface">
                        {chainInfo?.name ?? `Chain ${chainId}`}
                      </span>
                      <span className="block truncate text-xs font-label text-on-surface-variant">
                        {address}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <section className="rounded-xl border border-outline-variant/10 bg-surface-container/30 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-label uppercase tracking-[0.18em] text-on-surface-variant">
                          Wallet on Current Chain
                        </span>
                        {walletOverview.isLoading ? (
                          <span className="text-[10px] font-label text-on-surface-variant">
                            Refreshing...
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-2 text-sm font-label">
                        <BalanceRow
                          label={chainInfo?.nativeSymbol ?? "Native"}
                          value={walletOverview.nativeFormatted}
                        />
                        {walletOverview.usdcFormatted ? (
                          <BalanceRow label="USDC" value={walletOverview.usdcFormatted} />
                        ) : null}
                        {walletOverview.usdcBalanceError ? (
                          <p className="text-[11px] text-error/80 leading-snug">
                            USDC read failed: {walletOverview.usdcBalanceError.message}
                          </p>
                        ) : null}
                      </div>
                    </section>

                    <section className="rounded-xl border border-outline-variant/10 bg-surface-container/30 p-3">
                      <div className="mb-2 text-[10px] font-label uppercase tracking-[0.18em] text-on-surface-variant">
                        Hyperliquid Exchange
                      </div>
                      <div className="space-y-2 text-sm font-label">
                        <BalanceRow
                          label="Account Equity"
                          value={formatUsd(walletOverview.exchange.equity)}
                        />
                        <BalanceRow
                          label="Withdrawable"
                          value={formatUsd(walletOverview.exchange.withdrawable)}
                        />
                        <BalanceRow
                          label="Unrealized PnL"
                          value={formatSignedUsd(walletOverview.exchange.unrealizedPnl)}
                        />
                        <BalanceRow
                          label="Margin Used"
                          value={formatUsd(walletOverview.exchange.totalMarginUsed)}
                        />
                      </div>
                    </section>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => open({ view: "Account" })}
                      className="rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-headline font-bold text-on-surface transition-colors hover:bg-surface-container"
                    >
                      Wallet
                    </button>
                    <button
                      onClick={() => open({ view: "Networks" })}
                      className="rounded-xl bg-surface-container-high px-3 py-2.5 text-sm font-headline font-bold text-on-surface transition-colors hover:bg-surface-container"
                    >
                      Networks
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              onClick={() => open({ view: "Connect" })}
              className="bg-primary hover:bg-primary-container text-on-primary font-semibold px-6 py-2 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Connect Vault
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <MaterialIcon icon={mobileMenuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container border-t border-outline-variant/10 px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => {
              if (link.comingSoon) {
                return (
                  <span
                    key={link.label}
                    className="flex items-center justify-between px-4 py-3 rounded-lg font-headline font-semibold text-sm text-on-surface-variant opacity-30 cursor-default select-none"
                  >
                    {link.label}
                    <span className="text-[9px] font-label font-medium uppercase tracking-wider opacity-70">
                      Coming Soon
                    </span>
                  </span>
                );
              }
              const isActive = link.exact
                ? pathname === link.href
                : pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-headline font-semibold text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

function BalanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-right font-bold text-on-surface">{value}</span>
    </div>
  );
}

function formatUsd(value: string): string {
  return `$${Number(value || "0").toFixed(2)}`;
}

function formatSignedUsd(value: string): string {
  const amount = Number(value || "0");
  return `${amount >= 0 ? "+" : "-"}$${Math.abs(amount).toFixed(2)}`;
}
