"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { coinLogoUrl } from "@/lib/config/hyperliquid";
import { getEarningsForSymbol, formatEarningsDate } from "@/lib/data/earnings";

interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  body: string;
  source: string;
  time: string;
  sentiment: "bullish" | "bearish" | "neutral";
  tag: string;
}

function getMockNews(symbol: string): NewsItem[] {
  const earnings = getEarningsForSymbol(symbol);
  const company = earnings?.company ?? symbol;
  const date = earnings ? formatEarningsDate(earnings.date) : "TBD";

  return [
    {
      id: `${symbol}-1`,
      symbol,
      headline: `${company} Q1 earnings preview: Wall Street expects strong revenue beat`,
      body: `Analysts are broadly optimistic heading into ${company}'s quarterly report on ${date}. Consensus estimates point to year-over-year revenue growth driven by strong demand across key segments.`,
      source: "Bloomberg",
      time: "2h ago",
      sentiment: "bullish",
      tag: "Preview",
    },
    {
      id: `${symbol}-2`,
      symbol,
      headline: `Options market pricing ±${earnings?.avgMove.toFixed(1) ?? "6.0"}% move into ${date} report`,
      body: `Implied volatility on ${symbol} options has spiked ahead of earnings, with the at-the-money straddle implying a move of roughly ±${earnings?.avgMove.toFixed(1) ?? "6.0"}%. This is slightly above the historical average.`,
      source: "Options Flow",
      time: "4h ago",
      sentiment: "neutral",
      tag: "Options",
    },
    {
      id: `${symbol}-3`,
      symbol,
      headline: `Analysts raise ${symbol} price target ahead of earnings on ${date}`,
      body: `Multiple sell-side analysts have revised their price targets upward over the past week, citing improving fundamentals and favorable industry tailwinds. The average target now sits 15% above current levels.`,
      source: "Reuters",
      time: "6h ago",
      sentiment: "bullish",
      tag: "Analyst",
    },
    {
      id: `${symbol}-4`,
      symbol,
      headline: `${company} insider sold $2.4M in shares last week`,
      body: `SEC filings reveal that a senior executive at ${company} sold a significant block of shares in the open market. While insider sales don't always signal bearishness, the timing ahead of earnings is notable.`,
      source: "SEC Filings",
      time: "1d ago",
      sentiment: "bearish",
      tag: "Insider",
    },
    {
      id: `${symbol}-5`,
      symbol,
      headline: `Short interest in ${symbol} rises 12% ahead of earnings`,
      body: `Short interest data shows a meaningful increase in bearish positioning over the past two weeks. The current short interest ratio stands at 4.2 days to cover, suggesting elevated skepticism.`,
      source: "S3 Partners",
      time: "1d ago",
      sentiment: "bearish",
      tag: "Short Interest",
    },
    {
      id: `${symbol}-6`,
      symbol,
      headline: `${company} guidance expected to address new product pipeline`,
      body: `Investors will be watching closely for commentary on upcoming product launches and strategic investments. Management's tone on forward guidance could be the key swing factor for the stock.`,
      source: "Barron's",
      time: "2d ago",
      sentiment: "neutral",
      tag: "Preview",
    },
    {
      id: `${symbol}-7`,
      symbol,
      headline: `Unusual call volume detected in ${symbol} ahead of ${date}`,
      body: `Over 3x the average daily call volume was traded today, with heavy activity concentrated in the weekly expiry straddling the earnings date. Market makers appear to be pricing in a larger-than-usual move.`,
      source: "Unusual Whales",
      time: "3h ago",
      sentiment: "bullish",
      tag: "Options",
    },
    {
      id: `${symbol}-8`,
      symbol,
      headline: `${company} competitor reports weak quarter, raising sector concerns`,
      body: `A key competitor in ${company}'s sector reported earnings below consensus this morning, sending shares down 8%. Investors are watching whether the weakness is company-specific or indicative of broader headwinds.`,
      source: "CNBC",
      time: "5h ago",
      sentiment: "bearish",
      tag: "Sector",
    },
    {
      id: `${symbol}-9`,
      symbol,
      headline: `Institutional ownership in ${symbol} increases by 2.3% in latest 13F filings`,
      body: `Major hedge funds and mutual funds have been building positions in ${company} over the past quarter. Notable buyers include several top-performing growth funds, suggesting conviction in the long-term thesis.`,
      source: "WhaleWisdom",
      time: "1d ago",
      sentiment: "bullish",
      tag: "Institutional",
    },
    {
      id: `${symbol}-10`,
      symbol,
      headline: `${symbol} implied volatility at 90th percentile vs. past 12 months`,
      body: `Current IV rank sits at the 90th percentile relative to the past year, making option premiums expensive. Straddle sellers may find this attractive, while buyers need a larger move to profit.`,
      source: "Volatility Lab",
      time: "8h ago",
      sentiment: "neutral",
      tag: "Options",
    },
    {
      id: `${symbol}-11`,
      symbol,
      headline: `Dark pool activity surges in ${symbol} shares this week`,
      body: `Dark pool volume has accounted for 45% of total ${symbol} trading this week, up from 32% last week. Large blocks are changing hands off-exchange, which can signal institutional repositioning ahead of the report.`,
      source: "Fintel",
      time: "1d ago",
      sentiment: "neutral",
      tag: "Flow",
    },
    {
      id: `${symbol}-12`,
      symbol,
      headline: `${company} CEO makes bullish comments at industry conference`,
      body: `Speaking at a conference earlier this week, ${company}'s CEO struck an optimistic tone about demand trends and margin expansion. The comments were seen as a preview of what management may say on the earnings call.`,
      source: "Seeking Alpha",
      time: "3d ago",
      sentiment: "bullish",
      tag: "Management",
    },
  ];
}

const SENTIMENT_STYLES = {
  bullish: { bg: "bg-primary/6", border: "border-primary/12", text: "text-primary", icon: "trending_up" },
  bearish: { bg: "bg-error/6", border: "border-error/12", text: "text-error", icon: "trending_down" },
  neutral: { bg: "bg-[#66d4f6]/6", border: "border-[#66d4f6]/12", text: "text-[#66d4f6]", icon: "trending_flat" },
} as const;

const TAG_COLORS: Record<string, string> = {
  Preview: "bg-secondary/10 text-secondary",
  Options: "bg-[#f0a050]/10 text-[#f0a050]",
  Analyst: "bg-primary/10 text-primary",
  Insider: "bg-error/10 text-error",
  "Short Interest": "bg-error/10 text-error",
  Sector: "bg-error/10 text-error",
  Institutional: "bg-primary/10 text-primary",
  Flow: "bg-[#66d4f6]/10 text-[#66d4f6]",
  Management: "bg-primary/10 text-primary",
};

interface EarningsNewsFeedProps {
  symbol: string;
}

export default function EarningsNewsFeed({ symbol }: EarningsNewsFeedProps) {
  const news = useMemo(() => getMockNews(symbol), [symbol]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 flex-shrink-0 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="newspaper" size="sm" className="text-secondary" />
          <span className="text-[13px] font-label uppercase tracking-wider text-on-surface font-bold">
            Earnings News
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src={coinLogoUrl(symbol)}
            alt={symbol}
            width={18}
            height={18}
            className="rounded-full"
            unoptimized
          />
          <span className="text-[11px] font-label font-bold text-on-surface">{symbol}</span>
        </div>
      </div>

      {/* News list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-1">
        {news.map((item) => {
          const style = SENTIMENT_STYLES[item.sentiment];
          const tagColor = TAG_COLORS[item.tag] ?? "bg-surface-container-high text-on-surface-variant";
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-lg border transition-colors ${style.bg} ${style.border}`}
            >
              {/* Collapsed header — always visible */}
              <button
                onClick={() => toggle(item.id)}
                className="w-full text-left px-3 py-2.5 flex items-start gap-2.5"
              >
                <MaterialIcon
                  icon={style.icon}
                  size="sm"
                  className={`${style.text} mt-0.5 flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-label text-on-surface leading-snug">
                    {item.headline}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-label font-bold px-1.5 py-0.5 rounded-full ${tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-[10px] font-label text-on-surface-variant">
                      {item.source}
                    </span>
                    <span className="text-[10px] font-label text-on-surface-variant/50">
                      {item.time}
                    </span>
                  </div>
                </div>
                <MaterialIcon
                  icon={isExpanded ? "expand_less" : "expand_more"}
                  size="sm"
                  className="text-on-surface-variant flex-shrink-0 mt-0.5"
                />
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div className="px-3 pb-3 pl-9">
                  <p className="text-[11px] font-body text-on-surface-variant leading-relaxed">
                    {item.body}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
