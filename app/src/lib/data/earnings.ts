/**
 * Upcoming earnings dates for XYZ DEX stocks.
 *
 * In production this would come from an API (e.g. Financial Modeling Prep,
 * Earnings Whispers, or Alpha Vantage). For the prototype we use static data
 * that covers the next ~2 months from April 2026.
 */

export interface EarningsEvent {
  /** Ticker symbol matching ALL_MARKETS */
  symbol: string;
  /** Company display name */
  company: string;
  /** ISO date string (YYYY-MM-DD) of the earnings report */
  date: string;
  /** Before market open or after market close */
  timing: "BMO" | "AMC";
  /** Consensus EPS estimate (USD) */
  epsEstimate: number | null;
  /** Consensus revenue estimate (USD, millions) */
  revenueEstimate: number | null;
  /** Historical average absolute move on earnings day (%) */
  avgMove: number;
}

export const EARNINGS_CALENDAR: EarningsEvent[] = [
  // April 2026
  { symbol: "TSLA", company: "Tesla", date: "2026-04-22", timing: "AMC", epsEstimate: 0.72, revenueEstimate: 25_800, avgMove: 8.2 },
  { symbol: "GOOGL", company: "Alphabet", date: "2026-04-23", timing: "AMC", epsEstimate: 2.01, revenueEstimate: 92_400, avgMove: 5.1 },
  { symbol: "META", company: "Meta", date: "2026-04-23", timing: "AMC", epsEstimate: 5.28, revenueEstimate: 42_100, avgMove: 6.8 },
  { symbol: "MSFT", company: "Microsoft", date: "2026-04-24", timing: "AMC", epsEstimate: 3.22, revenueEstimate: 68_500, avgMove: 4.3 },
  { symbol: "INTC", company: "Intel", date: "2026-04-24", timing: "AMC", epsEstimate: 0.14, revenueEstimate: 12_800, avgMove: 7.5 },
  { symbol: "AMZN", company: "Amazon", date: "2026-04-30", timing: "AMC", epsEstimate: 1.38, revenueEstimate: 162_000, avgMove: 5.9 },
  { symbol: "AAPL", company: "Apple", date: "2026-04-30", timing: "AMC", epsEstimate: 1.61, revenueEstimate: 94_200, avgMove: 4.1 },

  // May 2026
  { symbol: "AMD", company: "AMD", date: "2026-05-06", timing: "AMC", epsEstimate: 0.94, revenueEstimate: 7_600, avgMove: 8.9 },
  { symbol: "PLTR", company: "Palantir", date: "2026-05-05", timing: "AMC", epsEstimate: 0.13, revenueEstimate: 884, avgMove: 12.4 },
  { symbol: "COIN", company: "Coinbase", date: "2026-05-08", timing: "AMC", epsEstimate: 2.05, revenueEstimate: 2_100, avgMove: 11.2 },
  { symbol: "HOOD", company: "Robinhood", date: "2026-05-07", timing: "AMC", epsEstimate: 0.38, revenueEstimate: 740, avgMove: 9.6 },
  { symbol: "DKNG", company: "DraftKings", date: "2026-05-08", timing: "BMO", epsEstimate: 0.22, revenueEstimate: 1_380, avgMove: 10.1 },
  { symbol: "HIMS", company: "Hims & Hers", date: "2026-05-12", timing: "AMC", epsEstimate: 0.11, revenueEstimate: 540, avgMove: 14.8 },
  { symbol: "RIVN", company: "Rivian", date: "2026-05-07", timing: "AMC", epsEstimate: -0.82, revenueEstimate: 1_250, avgMove: 11.5 },
  { symbol: "MSTR", company: "MicroStrategy", date: "2026-05-01", timing: "AMC", epsEstimate: -0.12, revenueEstimate: 118, avgMove: 9.8 },
  { symbol: "NVDA", company: "NVIDIA", date: "2026-05-28", timing: "AMC", epsEstimate: 0.88, revenueEstimate: 43_200, avgMove: 7.6 },
  { symbol: "COST", company: "Costco", date: "2026-05-29", timing: "AMC", epsEstimate: 4.18, revenueEstimate: 62_800, avgMove: 3.2 },
  { symbol: "LLY", company: "Eli Lilly", date: "2026-05-01", timing: "BMO", epsEstimate: 3.45, revenueEstimate: 12_600, avgMove: 5.4 },
  { symbol: "BABA", company: "Alibaba", date: "2026-05-15", timing: "BMO", epsEstimate: 1.42, revenueEstimate: 36_200, avgMove: 6.3 },
  { symbol: "ORCL", company: "Oracle", date: "2026-05-12", timing: "AMC", epsEstimate: 1.68, revenueEstimate: 15_400, avgMove: 5.7 },
  { symbol: "MU", company: "Micron", date: "2026-05-19", timing: "AMC", epsEstimate: 1.05, revenueEstimate: 8_900, avgMove: 8.1 },
  { symbol: "NFLX", company: "Netflix", date: "2026-05-14", timing: "AMC", epsEstimate: 6.25, revenueEstimate: 11_800, avgMove: 7.2 },
  { symbol: "TSM", company: "TSMC", date: "2026-05-15", timing: "BMO", epsEstimate: 2.12, revenueEstimate: 28_500, avgMove: 4.5 },
  { symbol: "GME", company: "GameStop", date: "2026-05-20", timing: "AMC", epsEstimate: 0.01, revenueEstimate: 1_280, avgMove: 15.2 },
  { symbol: "CRCL", company: "Circle", date: "2026-05-13", timing: "AMC", epsEstimate: 0.22, revenueEstimate: 620, avgMove: 8.5 },
];

/** Get all earnings sorted by date (soonest first) */
export function getUpcomingEarnings(afterDate?: string): EarningsEvent[] {
  const cutoff = afterDate ?? new Date().toISOString().slice(0, 10);
  return EARNINGS_CALENDAR
    .filter((e) => e.date >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Get earnings for a specific symbol */
export function getEarningsForSymbol(symbol: string): EarningsEvent | undefined {
  const now = new Date().toISOString().slice(0, 10);
  return EARNINGS_CALENDAR
    .filter((e) => e.symbol === symbol && e.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** Days until an earnings date */
export function daysUntilEarnings(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format a date string as "Apr 22" */
export function formatEarningsDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
