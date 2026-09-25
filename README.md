# Scouter

**The Private Market Intelligence Terminal & Developer Platform for PreStocks on Solana.**

- **Live Application**: [https://scouter-tool.vercel.app/](https://scouter-tool.vercel.app/)
- **Developer Documentation**: [https://scouter-tool.vercel.app/docs](https://scouter-tool.vercel.app/docs)
- **Interactive API Explorer**: [https://scouter-tool.vercel.app/docs/explorer](https://scouter-tool.vercel.app/docs/explorer)
- **npm Package**: [`scouter-sdk`](https://www.npmjs.com/package/scouter-sdk) (`npm install scouter-sdk`)
  

![Cover image](https://i.ibb.co/C5YRdfx5/Add-wordmark-to-logo-20260925195706.jpg)

Built for the **Stocklana Hackathon**, specifically targeting the **PreStocks Bounty Track**.

---

## 1. Executive Summary

Private pre-IPO companies like OpenAI, SpaceX, Anthropic, and Anduril represent trillions in enterprise value, yet private equity secondary markets have historically been illiquid, opaque, and gatekept by institutional brokers.

**PreStocks** solves this foundation by bringing 1:1 SPV-backed economic exposure onto the Solana blockchain, trading 24/7 as SPL tokens.

**Scouter is the financial terminal and developer layer for PreStocks.** It provides institutional-grade market discovery, real-time on-chain liquidity feeds, benchmark mark comparison, AI-grounded research reports, a developer REST API, and an official TypeScript SDK.

---

## 2. Core Pillars & Architecture

```text
       ┌────────────────────────┐      ┌────────────────────────┐
       │     PreStocks API      │      │   Solana DEX Pools     │
       │ (Benchmark Marks & SPV)│      │  (Raydium & Meteora)   │
       └───────────┬────────────┘      └───────────┬────────────┘
                   │                               │
                   ▼                               ▼
       ┌────────────────────────────────────────────────────────┐
       │                  Scouter Data Engine                   │
       │  • Normalization & Delta Variance Engine               │
       │  • Multi-Pool On-Chain Candlestick Aggregator (OHLCV)  │
       │  • Gemini 3.5 Flash Lite + Google Search Grounding     │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│        Scouter Terminal         │         │       Developer Platform        │
│  • Edge-to-Edge Cinema Hero     │         │  • Authenticated REST API       │
│  • Discover & Company Terminals │         │  • Interactive API Explorer     │
│  • On-Chain Trading Charts      │         │  • scouter-sdk (TypeScript)     │
│  • Multi-Asset Side-by-Side     │         │  • Solana Wallet Keys (Firebase)│
│  • Grounded Scout AI Reports    │         │  • Documentation & Guides       │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

### Pillar 1: Institutional Research & Price Discovery
- **Secondary vs. Benchmark Valuation**: Continuously compares live secondary token prices against institutional funding marks (e.g. OpenAI at \$152.99 mark vs live secondary quote), computing continuous percentage premiums or discounts.
- **On-Chain OHLCV Trading Charts**: Real-time interactive candlestick and snapshot line charts powered by GeckoTerminal and Solana liquidity pool telemetry (15m, 1h, and daily intervals).
- **Objective Multi-Asset Comparison**: Side-by-side terminal inspecting 2–3 private companies simultaneously across implied valuations, mark multiples, circulating supply, and contractual mint addresses.
- **Persistent Personal Watchlist**: Reactive watchlist utilizing `useSyncExternalStore` for immediate client hydration without retaining stale pricing.

### Pillar 2: Grounded AI Market Intelligence
- **Autonomous Scout Reports**: Powered by Gemini 3.5 Flash Lite with Google Search Grounding to evaluate real-world funding rounds, secondary liquidity shifts, valuation rumors, and operational catalysts.
- **Hallucination-Resistant Synthesis**: Injects deterministic PreStocks on-chain metrics into LLM system prompts, ensuring AI answers are mathematically anchored to real pricing.

### Pillar 3: Solana Identity & API Key Architecture
- **Solana ConnectorKit**: Native wallet authentication supporting Phantom, Solflare, and Backpack.
- **Cryptographic Key Provisioning**: Allows connected wallet users to generate and revoke API keys (`scouter_live_...`) backed by Firebase Firestore for programmatic access.

### Pillar 4: Developer Platform & REST API
- `GET /api/markets`: Returns all active tokenised pre-IPO companies.
- `GET /api/markets/:symbol`: Returns live secondary quote, benchmark mark, and valuation metrics for a specific asset.
- `GET /api/markets/:symbol/history`: Returns authentic time-series observation snapshots and on-chain candle points.
- **Interactive API Explorer**: In-browser endpoint runner with parameter customization, live status inspection, and one-click cURL generation.

### Pillar 5: Official Developer SDK (`scouter-sdk`)
- Published to npm as `scouter-sdk`.
- Strongly typed TypeScript client library with zero runtime dependencies.
- Standardized methods: `new Scouter()`, `scouter.markets()`, `scouter.market(symbol).get()`, and `scouter.market(symbol).history()`.

---

## 3. Tracked PreStocks Assets

Scouter currently indexes and provides live on-chain feeds for all primary PreStocks assets:

| Symbol | Company | Valuation Benchmark | Token Mint | DEX Liquidity Pool |
|---|---|---|---|---|
| `OPENAI` | OpenAI | \$157.00B | `PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF` | Meteora / Raydium |
| `ANTHROPIC` | Anthropic | \$61.50B | `Prewe...anthropic` | Meteora / Raydium |
| `SPACEX` | SpaceX | \$350.00B | `Prewe...spacex` | Meteora / Raydium |
| `ANDURIL` | Anduril Industries | \$14.00B | `Prewe...anduril` | Meteora / Raydium |
| `NEURALINK` | Neuralink | \$8.00B | `Prewe...neuralink` | Meteora / Raydium |
| `FIGUREAI` | Figure AI | \$2.60B | `Prewe...figureai` | Meteora / Raydium |
| `POLYMARKET` | Polymarket | \$1.00B | `Prewe...polymarket` | Meteora / Raydium |
| `KALSHI` | Kalshi | \$800.00M | `Prewe...kalshi` | Meteora / Raydium |

---

## 4. Developer SDK Quickstart

Install the SDK in your project:

```bash
npm install scouter-sdk
```

Query live pre-IPO pricing in TypeScript:

```typescript
import { Scouter } from "scouter-sdk";

const scouter = new Scouter({
  apiKey: process.env.SCOUTER_API_KEY, // Optional for public endpoints
});

async function run() {
  // Fetch live market metrics for OpenAI
  const openai = await scouter.market("OPENAI").get();
  console.log(`Token Price: $${openai.tokenPrice}`);
  console.log(`Benchmark Mark Price: $${openai.markPrice}`);
  console.log(`Implied Valuation: $${(openai.impliedValuation / 1e9).toFixed(1)}B`);
  console.log(`Premium to Mark: ${openai.premiumPercent}%`);

  // Fetch all active PreStocks markets
  const all = await scouter.markets();
  console.log(`Active pre-IPO assets tracked: ${all.length}`);
}

run();
```

---

## 5. Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (Strict mode)
- **UI & Styling**: Tailwind CSS v4 with dark Charcoal Terminal design system
- **Blockchain Connectivity**: `@solana/connector`, `@solana/web3.js`
- **Data & Oracles**: PreStocks REST API, GeckoTerminal API, DexScreener, Birdeye
- **AI & Grounding**: Google Gen AI SDK (`@google/genai` / Gemini 3.5 Flash Lite) with Google Search Grounding
- **Database & Auth**: Firebase Firestore (server-side authenticated sync)
- **Charting**: Lightweight Charts 5
- **Tooling Package**: `scouter-sdk` (TypeScript, ES2022 / NodeNext)

---

## 6. Local Setup & Installation

### Prerequisites
- Node.js 20+
- npm 10+

### Clone & Install
```bash
git clone https://github.com/abrahamebij/scouter.git
cd scouter/app
npm install
```

### Environment Configuration
Create `app/.env.local` with the following variables:

```env
# Google Gemini API Key (for Grounded AI Market Intelligence)
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Birdeye API Key for extended Solana OHLCV history
BIRDEYE_API_KEY="your-birdeye-key"

# Firebase Configuration (for wallet sync and API key persistence)
FIREBASE_API_KEY="your-firebase-key"
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
FIREBASE_APP_ID="your-app-id"
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verify Code Quality
```bash
npm run check    # TypeScript compilation (tsc --noEmit)
npm run lint     # ESLint validation
```

---

## 7. Hackathon Alignment: PreStocks Bounty

Scouter directly addresses the core mission of the **PreStocks bounty track**:

1. **Solves the Information Asymmetry Problem**: Pre-IPO tokens often fluctuate against private marks based on liquidity and sentiment. Scouter makes these valuation deltas completely transparent.
2. **Accelerates On-Chain Volume**: Provides interactive trading charts and direct links to Solana block explorers and DEX pools, encouraging liquidity participation.
3. **Fosters Developer Ecosystem**: Provides an open REST API, interactive testing playground, and published npm SDK (`scouter-sdk`) so third-party developers, algorithmic bots, and DeFi dashboards can integrate PreStocks data seamlessly.

---

## 8. License & Disclaimers

- **License**: MIT
- **Financial Disclaimer**: Scouter is an information and developer research terminal. All derived data, marks, and implied valuations are for analytical purposes only and do not constitute financial advice.
