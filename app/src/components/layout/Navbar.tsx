"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "@/components/ui/MaterialIcon";
import SolanaConnectButton from "./SolanaConnectButton";
import Img from "../ui/Img";

const navLinks = [
  { href: "/discover", label: "Discover", icon: "explore" },
  { href: "/compare", label: "Compare", icon: "compare_arrows" },
  { href: "/watchlist", label: "Watchlist", icon: "bookmark" },
  { href: "/market", label: "Markets", icon: "show_chart" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
      <div className="flex justify-between items-center h-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
           <Img src="/logo.png" alt="SCOUTER Logo" className="size-8" />
            <div className="flex flex-col">
              <span className="font-headline font-bold text-base tracking-wider text-on-surface">
                SCOUTER
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 font-headline font-medium text-sm">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                    isActive
                      ? "text-on-surface bg-surface-container-high font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                  }`}
                >
                  <MaterialIcon icon={link.icon} size="sm" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Status, Wallet & Links */}
        <div className="flex items-center gap-3">

          {/* Solana ConnectorKit Connect Button */}
          <SolanaConnectButton />

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-md hover:bg-surface-container-high"
            aria-label="Toggle navigation menu"
          >
            <MaterialIcon icon={mobileMenuOpen ? "close" : "menu"} size="md" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container-low border-b border-outline-variant/20 px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "text-on-surface bg-surface-container-high font-semibold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <MaterialIcon icon={link.icon} size="sm" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              PreStocks Solana Feed
            </span>
            <a
              href="https://prestocks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-on-surface hover:underline flex items-center gap-1"
            >
              PreStocks.com
              <MaterialIcon icon="open_in_new" size="sm" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
