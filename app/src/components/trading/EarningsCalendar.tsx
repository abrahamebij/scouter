"use client";

import { useMemo } from "react";
import Image from "next/image";
import MaterialIcon from "@/components/ui/MaterialIcon";
import { coinLogoUrl } from "@/lib/config/hyperliquid";
import {
  getUpcomingEarnings,
  daysUntilEarnings,
  formatEarningsDate,
  type EarningsEvent,
} from "@/lib/data/earnings";

interface EarningsCalendarProps {
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export default function EarningsCalendar({
  onSelectSymbol,
  selectedSymbol,
}: EarningsCalendarProps) {
  const upcoming = useMemo(() => getUpcomingEarnings(), []);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, EarningsEvent[]>();
    for (const e of upcoming) {
      const existing = map.get(e.date) ?? [];
      existing.push(e);
      map.set(e.date, existing);
    }
    return Array.from(map.entries());
  }, [upcoming]);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 flex-shrink-0 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="event" size="sm" className="text-secondary" />
          <span className="text-[13px] font-label uppercase tracking-wider text-on-surface font-bold">
            Upcoming Earnings
          </span>
        </div>
        <span className="text-[10px] font-label text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
          {upcoming.length} reports
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-[10px] font-label uppercase tracking-[0.14em] text-on-surface-variant border-b border-outline-variant/8">
              <th className="text-left px-4 py-2 font-normal">Date</th>
              <th className="text-left px-3 py-2 font-normal">Stock</th>
              <th className="text-left px-3 py-2 font-normal">Timing</th>
              <th className="text-right px-3 py-2 font-normal">EPS Est.</th>
              <th className="text-right px-3 py-2 font-normal">Rev Est.</th>
              <th className="text-right px-3 py-2 font-normal">Avg Move</th>
              <th className="text-right px-4 py-2 font-normal">Days</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(([date, events]) =>
              events.map((event, idx) => {
                const days = daysUntilEarnings(event.date);
                const isSelected = event.symbol === selectedSymbol;
                const isThisWeek = days <= 7;
                const isToday = days === 0;

                return (
                  <tr
                    key={event.symbol}
                    onClick={() => onSelectSymbol(event.symbol)}
                    className={[
                      "cursor-pointer transition-colors border-b border-outline-variant/5",
                      isSelected
                        ? "bg-primary/8"
                        : "hover:bg-surface-container/50",
                    ].join(" ")}
                  >
                    {/* Date - only show on first row of group */}
                    <td className="px-4 py-2">
                      {idx === 0 ? (
                        <div>
                          <span className={`text-[12px] font-label font-bold ${isToday ? "text-error" : isThisWeek ? "text-secondary" : "text-on-surface"}`}>
                            {formatEarningsDate(date)}
                          </span>
                          <span className="block text-[10px] text-on-surface-variant">
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        </div>
                      ) : null}
                    </td>

                    {/* Stock */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={coinLogoUrl(event.symbol)}
                          alt={event.symbol}
                          width={22}
                          height={22}
                          className="rounded-full"
                          unoptimized
                        />
                        <div>
                          <span className="text-[12px] font-headline font-semibold text-on-surface">
                            {event.symbol}
                          </span>
                          <span className="block text-[10px] text-on-surface-variant truncate max-w-[100px]">
                            {event.company}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Timing */}
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-label font-bold px-1.5 py-0.5 rounded ${
                        event.timing === "BMO"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {event.timing === "BMO" ? "Pre-Market" : "After Close"}
                      </span>
                    </td>

                    {/* EPS */}
                    <td className="px-3 py-2 text-right">
                      <span className="text-[12px] font-label tabular-nums text-on-surface">
                        {event.epsEstimate !== null ? `$${event.epsEstimate.toFixed(2)}` : "—"}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="px-3 py-2 text-right">
                      <span className="text-[12px] font-label tabular-nums text-on-surface">
                        {event.revenueEstimate !== null
                          ? event.revenueEstimate >= 1000
                            ? `$${(event.revenueEstimate / 1000).toFixed(1)}B`
                            : `$${event.revenueEstimate}M`
                          : "—"}
                      </span>
                    </td>

                    {/* Avg Move */}
                    <td className="px-3 py-2 text-right">
                      <span className={`text-[12px] font-label font-bold tabular-nums ${
                        event.avgMove >= 10 ? "text-error" : event.avgMove >= 7 ? "text-[#f0a050]" : "text-primary"
                      }`}>
                        ±{event.avgMove.toFixed(1)}%
                      </span>
                    </td>

                    {/* Days Until */}
                    <td className="px-4 py-2 text-right">
                      <span className={`text-[12px] font-label font-bold tabular-nums ${
                        isToday ? "text-error" : isThisWeek ? "text-secondary" : "text-on-surface-variant"
                      }`}>
                        {isToday ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
