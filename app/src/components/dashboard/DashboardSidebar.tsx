"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/connector/react";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { truncateAddress } from "@/lib/prestocks/format";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const DASHBOARD_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "space_dashboard" }],
  },
  {
    title: "Research",
    items: [
      { href: "/dashboard/discover", label: "Discover", icon: "explore" },
      { href: "/dashboard/market", label: "Markets", icon: "show_chart" },
      { href: "/dashboard/compare", label: "Compare", icon: "compare_arrows" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard/intelligence", label: "AI Chat", icon: "psychology" },
    ],
  },
  {
    title: "Tracking",
    items: [{ href: "/dashboard/watchlist", label: "Watchlist", icon: "bookmark" }],
  },
  {
    title: "Settings",
    items: [
      { href: "/dashboard/settings/profile", label: "Profile", icon: "person" },
      { href: "/dashboard/settings/api-keys", label: "API Keys", icon: "key" },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { account } = useWallet();
  const addressStr = account ? (typeof account === "string" ? account : String(account)) : "";

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 border-r border-outline-variant/20 bg-surface-container-low/95 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto z-30">
      {/* Navigation Sections */}
      <div className="space-y-6">
        {DASHBOARD_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-label uppercase tracking-wider text-on-surface-variant/70 font-semibold mb-1">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-headline font-medium transition-all ${
                      isActive
                        ? "bg-surface-container-high text-on-surface font-semibold shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                    }`}
                  >
                    <MaterialIcon
                      icon={item.icon}
                      size="sm"
                      className={isActive ? "text-accent" : "text-on-surface-variant"}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Connected User Badge */}
      <div className="pt-4 border-t border-outline-variant/15 space-y-2">
        <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-accent flex-shrink-0">
            <MaterialIcon icon="account_balance_wallet" size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/70 font-medium">
              Solana Wallet
            </div>
            <div className="font-mono text-xs text-on-surface font-semibold truncate">
              {addressStr ? truncateAddress(addressStr, 4, 4) : "Connected"}
            </div>
          </div>
        </div>

        <Link
          href="/docs"
          className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span>Developer Docs</span>
          <MaterialIcon icon="open_in_new" size="sm" />
        </Link>
      </div>
    </aside>
  );
}
