"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface DocsLink {
  href: string;
  label: string;
  icon: string;
}

interface DocsSection {
  title: string;
  items: DocsLink[];
}

const DOCS_NAV: DocsSection[] = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", label: "Introduction", icon: "menu_book" },
      { href: "/docs/quickstart", label: "Quickstart", icon: "rocket_launch" },
    ],
  },
  {
    title: "Developer Platform",
    items: [
      { href: "/docs/authentication", label: "Authentication", icon: "key" },
      { href: "/docs/api", label: "REST API Reference", icon: "api" },
      { href: "/docs/sdk", label: "TypeScript SDK", icon: "code" },
      { href: "/docs/explorer", label: "API Explorer", icon: "travel_explore" },
    ],
  },
  {
    title: "Resources & AI",
    items: [
      { href: "/docs/examples", label: "Code Examples", icon: "integration_instructions" },
      { href: "/docs/assistant", label: "AI Developer Assistant", icon: "psychology" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 border-r border-outline-variant/20 bg-surface-container-low/95 backdrop-blur-md p-4 flex flex-col justify-between overflow-y-auto z-30">
      <div className="space-y-6">
        {DOCS_NAV.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-label uppercase tracking-wider text-on-surface-variant/70 font-semibold mb-1">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;

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

      <div className="pt-4 border-t border-outline-variant/15 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-headline text-on-surface transition-colors"
        >
          <div className="flex items-center gap-2">
            <MaterialIcon icon="space_dashboard" size="sm" className="text-accent" />
            <span>Open Dashboard</span>
          </div>
          <MaterialIcon icon="chevron_right" size="sm" className="text-on-surface-variant" />
        </Link>
      </div>
    </aside>
  );
}
