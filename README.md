# Scouter

A research and discovery terminal for **PreStocks tokenised pre-IPO assets** on Solana.

- **Live Application**: [https://scouter-tool.vercel.app/](https://scouter-tool.vercel.app/)
- **Developer Documentation**: [https://scouter-tool.vercel.app/docs](https://scouter-tool.vercel.app/docs)
- **API Explorer**: [https://scouter-tool.vercel.app/docs/explorer](https://scouter-tool.vercel.app/docs/explorer)

Built for the Stocklana hackathon, specifically targeting the **PreStocks bounty**.

---

## What is Scouter?

Scouter helps users discover, research, and compare private pre-IPO companies whose valuations are tokenised through PreStocks.

PreStocks tokens are tradable 24/7 on Solana and backed 1:1 by SPV exposure tracking the underlying private company valuation. Scouter provides a professional financial terminal interface to answer:

1. **What PreStocks assets are available?**
2. **How do their token prices compare with their reference mark prices?**
3. **What are their implied valuations?**
4. **How does one asset compare directly with another?**
5. **Which assets do I want to monitor?**

---

## Core Product Flow

```text
PreStocks Live API
       ↓
Scouter Discover
       ↓
Find a Company
       ↓
Research Token & Mark Metrics
       ↓
Side-by-Side Comparison
       ↓
Save to Local Watchlist
```

---

## Key Features

- **Live PreStocks Data**: Powered by the official PreStocks endpoint (`https://prestocks.com/api/prestocks`) with 60-second caching and error resilience.
- **Discover Terminal**: Multi-field instant search (name, symbol, description), premium/discount filters, and sorting by implied valuation, token price, mark price, and benchmark variance.
- **Detailed Research Views**: Detailed metrics breakdown on `/company/[symbol]` with token price, mark price, premium/discount variance, implied valuation, token supply, and Solana token mint copy actions with explorer links.
- **Objective Comparison**: Direct side-by-side metric inspection of 2–3 companies on `/compare` without arbitrary rankings or gamified scores.
- **Local Watchlist**: Browser-persistent watchlist on `/watchlist` storing sanitized symbol keys to prevent stale data retention while hydrating metrics in real-time.
- **Strict Data Integrity**: Derived metrics are explicitly calculated and marked; zero fabricated data or speculative financial advice.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (Strict)
- **Styling**: Tailwind CSS v4 with dark financial terminal design system
- **State Management**: React 19 `useSyncExternalStore` for external storage synchronization
- **Icons & Fonts**: Plus Jakarta Sans, Inter, Space Grotesk, Material Symbols Outlined

---

## Project Structure

```text
app/
  src/
    app/
      page.tsx                   # Terminal Overview & Market Stats
      discover/page.tsx          # Main Asset Discovery Terminal
      company/[symbol]/page.tsx  # In-Depth Company Research
      compare/page.tsx           # Side-by-Side Comparison Terminal
      watchlist/page.tsx         # Local Watchlist Feed
      api/prestocks/route.ts     # Cached API Proxy Handler
      layout.tsx                 # Persistent Root Terminal Layout
      globals.css                # Dark Terminal Styling & Theme
    components/
      layout/Navbar.tsx          # Terminal Navigation with Mobile Menu
      layout/Footer.tsx          # Legal & Mechanics Disclaimers
      prestocks/                 # Scouter Core UI Components
        ProductCard.tsx
        ProductGrid.tsx
        ProductSearch.tsx
        ProductFilters.tsx
        MarketStatsStrip.tsx
        CompanyHeader.tsx
        TokenMetrics.tsx
        CompareTable.tsx
        WatchlistFeed.tsx
        WatchlistButton.tsx
        PremiumBadge.tsx
        SkeletonCard.tsx
        ErrorState.tsx
    lib/
      prestocks/
        api.ts                   # Centralized API Fetcher & Safe Handlers
        types.ts                 # PreStock & PreStockDerived Interfaces
        transforms.ts            # Derived Calculations & Normalization
        format.ts                # Currency & Valuation Formatters
        watchlist.ts             # LocalStorage Sync Store
```

---

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify code quality and types:

```bash
npm run check
npm run lint
```
