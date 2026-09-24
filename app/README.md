# xPrime App

Frontend for xPrime, an onchain prime brokerage for tokenized equities.

The app brings earn, borrow, trade, hedge, spend, and bridge flows into one interface. In the current codebase, it includes strategy discovery, intent based onboarding, Hyperliquid perp trading, spot xStocks execution across Ink and Ethereum, bridge flows through LiFi, borrow surfaces, spend surfaces, and earnings options ideas.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Stack

- Next.js 16
- React 19
- TypeScript
- Reown AppKit + Wagmi
- Hyperliquid market data and trading
- CoW Swap for spot execution
- LiFi for bridging
