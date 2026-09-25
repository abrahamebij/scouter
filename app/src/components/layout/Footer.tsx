"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "@/components/ui/MaterialIcon";
import Img from "../ui/Img";
import { cn } from "@/lib/utils";

export default function Footer() {
  const pathname = usePathname();
  const hasFixedSidebar = pathname.startsWith("/dashboard") || pathname.startsWith("/docs");

  return (
    <footer
      className={cn(
        "bg-surface-container-lowest border-t border-outline-variant/15 py-12 px-6 mt-auto transition-all",
        hasFixedSidebar && "md:pl-72"
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <Img src="/logo.png" alt="SCOUTER Logo" className="size-6" />
            <span className="font-headline font-bold text-sm tracking-wider text-on-surface">
              SCOUTER
            </span>
          </div>
          <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
            Research and discovery terminal for PreStocks tokenised pre-IPO assets. Discover valuation metrics, compare token pricing vs mark benchmarks, and monitor private company assets.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div>
            <h4 className="font-label font-bold text-on-surface uppercase tracking-wider mb-3 text-[11px]">
              Platform
            </h4>
            <div className="flex flex-col gap-2 text-on-surface-variant">
              <Link href="/dashboard" className="hover:text-on-surface transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/market" className="hover:text-on-surface transition-colors">
                Market Terminal
              </Link>
              <Link href="/docs" className="hover:text-on-surface transition-colors">
                Developer Docs
              </Link>
              <Link href="/docs/api" className="hover:text-on-surface transition-colors">
                REST API
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-label font-bold text-on-surface uppercase tracking-wider mb-3 text-[11px]">
              PreStocks
            </h4>
            <div className="flex flex-col gap-2 text-on-surface-variant">
              <a
                href="https://prestocks.com/products"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-on-surface transition-colors inline-flex items-center gap-1"
              >
                <span>Products</span>
                <MaterialIcon icon="open_in_new" size="sm" />
              </a>
              <a
                href="https://prestocks.com/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-on-surface transition-colors inline-flex items-center gap-1"
              >
                <span>Mechanics FAQ</span>
                <MaterialIcon icon="open_in_new" size="sm" />
              </a>
              <a
                href="https://prestocks.com/ecosystem"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-on-surface transition-colors inline-flex items-center gap-1"
              >
                <span>Ecosystem</span>
                <MaterialIcon icon="open_in_new" size="sm" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-label font-bold text-on-surface uppercase tracking-wider mb-3 text-[11px]">
              Solana
            </h4>
            <div className="flex flex-col gap-2 text-on-surface-variant">
              <a
                href="https://explorer.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-on-surface transition-colors inline-flex items-center gap-1"
              >
                <span>Solana Explorer</span>
                <MaterialIcon icon="open_in_new" size="sm" />
              </a>
              <span className="text-[11px] text-on-surface-variant/70">
                Network: Mainnet-beta
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-on-surface-variant/60">
        <div>&copy; 2026 Scouter. Built for the Stocklana PreStocks Bounty.</div>
        <div className="font-label tracking-wide">
          Live feed: <span className="text-accent/80 font-mono">prestocks.com/api/prestocks</span>
        </div>
      </div>
    </footer>
  );
}
