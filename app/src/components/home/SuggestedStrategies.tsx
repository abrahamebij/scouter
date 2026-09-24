"use client";

import { useRef } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface StrategyCard {
  icon: string;
  iconBg: string;
  iconColor: string;
  riskLabel: string;
  riskBg: string;
  riskColor: string;
  riskBorder: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  metricColor: string;
  href: string;
}

const strategies: StrategyCard[] = [
  {
    icon: "currency_exchange",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    riskLabel: "Risk: Mid",
    riskBg: "bg-secondary/10",
    riskColor: "text-secondary",
    riskBorder: "border-secondary/20",
    title: "USD Carry Trade",
    description: "Maximize yield by borrowing against blue-chip stocks to farm stablecoins.",
    metricLabel: "Est. APY",
    metricValue: "15.0%",
    metricColor: "text-primary",
    href: "/strategies/ausd-carry-trade",
  },
  {
    icon: "balance",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    riskLabel: "Risk: Moderate",
    riskBg: "bg-secondary/10",
    riskColor: "text-secondary",
    riskBorder: "border-secondary/20",
    title: "Delta Neutral Basis",
    description: "Hedge price risk while capturing perpetual funding rate spreads.",
    metricLabel: "Real-time APY",
    metricValue: "45.2%",
    metricColor: "text-primary",
    href: "/strategies",
  },
  {
    icon: "donut_large",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    riskLabel: "Risk: Moderate",
    riskBg: "bg-secondary/10",
    riskColor: "text-secondary",
    riskBorder: "border-secondary/20",
    title: "SPY Covered Call",
    description: "Automated options selling to generate income on passive index holdings.",
    metricLabel: "Yield APY",
    metricValue: "12.0%",
    metricColor: "text-primary",
    href: "/strategies",
  },
];

export default function SuggestedStrategies() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-headline font-bold text-on-surface mb-3">
            Tailored Strategies
          </h2>
          <p className="text-on-surface-variant">
            Suggested based on your market views
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container hover:border-primary/30 transition-all"
          >
            <MaterialIcon icon="chevron_left" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container hover:border-primary/30 transition-all"
          >
            <MaterialIcon icon="chevron_right" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 pb-8 snap-x no-scrollbar"
      >
        {strategies.map((strategy) => (
          <Link
            key={strategy.title}
            href={strategy.href}
            className="min-w-[340px] snap-start bg-surface-container-low/50 rounded-[2rem] p-8 border border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-14">
              <div
                className={`w-14 h-14 rounded-2xl ${strategy.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <MaterialIcon icon={strategy.icon} size="lg" className={strategy.iconColor} />
              </div>
              <span
                className={`text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${strategy.riskBg} ${strategy.riskColor} border ${strategy.riskBorder}`}
              >
                {strategy.riskLabel}
              </span>
            </div>

            <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">
              {strategy.title}
            </h3>
            <p className="text-sm text-on-surface-variant mb-10 leading-relaxed">
              {strategy.description}
            </p>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-label uppercase text-on-surface-variant tracking-widest">
                  {strategy.metricLabel}
                </p>
                <p className={`text-2xl font-label font-bold ${strategy.metricColor}`}>
                  {strategy.metricValue}
                </p>
              </div>
              <div className="bg-surface-container-highest w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors group-hover:text-on-primary">
                <MaterialIcon icon="arrow_forward" size="sm" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
