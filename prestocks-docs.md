# PreStocks Integration & Product Development Guide

## 1. Purpose

This document teaches the coding agent how PreStocks works, what data is available, how to integrate the official PreStocks API, and how to build a hackathon application around it.

The application is intended for the **Stocklana hackathon — Best Use of PreStocks** bounty.

The goal is NOT to build another exchange, token, lending protocol, or complex DeFi primitive.

The recommended product direction is a **PreStocks research and discovery application** that makes tokenised pre-IPO companies easier to discover, understand, compare and monitor.

Working concept name:

# PreStocks Scout

> A research terminal for discovering and comparing tokenised pre-IPO companies available through PreStocks.

---

# 2. Official PreStocks Resources

The agent should treat PreStocks' own resources as the source of truth.

* Products: https://prestocks.com/products
* API: https://prestocks.com/api/prestocks
* FAQ: https://prestocks.com/faq
* Mechanics FAQ: https://prestocks.com/faq?tab=mechanics
* Legal FAQ: https://prestocks.com/faq?tab=legal
* Ecosystem: https://prestocks.com/ecosystem

Do not invent API endpoints or fields that are not documented or observable from the official service.

---

# 3. What Are PreStocks?

PreStocks are tokens that track the price/valuation of private, pre-IPO companies.

According to PreStocks, the tokens are:

* backed 1:1 by SPV exposure to the underlying company;
* tradable on Solana;
* available for 24/7 trading;
* transferable;
* designed to provide economic exposure to private companies.

They do NOT represent direct ownership of the referenced company.

A PreStocks holder does not automatically receive:

* shareholder ownership;
* voting rights;
* dividends;
* information rights;
* other legal rights associated with owning shares in the underlying company.

The application must therefore use language such as:

> "economic exposure"

rather than:

> "you own shares in OpenAI."

Never represent a PreStocks token as direct equity ownership.

---

# 4. Important Concept: Token Price vs Valuation

PreStocks uses token prices to represent exposure to the valuation of a private company.

Example concept:

If a PreStocks token price corresponds to an implied valuation of $100B, the token is representing exposure to that valuation level.

Do not interpret the token price as:

> "$100 = one share."

Instead, understand the system as:

```text
Private company valuation
        ↓
PreStocks pricing mechanism
        ↓
Token price
        ↓
Token represents economic exposure
```

The API exposes both token price and implied valuation.

---

# 5. Official API

## Endpoint

```text
GET https://prestocks.com/api/prestocks
```

The endpoint currently returns a JSON array.

Example shape:

```json
[
  {
    "name": "Anduril PreStocks",
    "symbol": "ANDURIL",
    "description": "...",
    "image": "https://www.prestocks.com/logos/anduril.png",
    "external_url": "https://www.prestocks.com/anduril",
    "contract_address": "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB",
    "markPrice": 152.9954134,
    "markValuation": 135354898004,
    "tokenPrice": 160.2888284824877,
    "impliedValuation": 141807375452,
    "supply": 11805.817985464
  }
]
```

The live endpoint currently exposes these fields.

---

# 6. API Field Reference

## `name`

Example:

```text
"OpenAI PreStocks"
```

Type:

```ts
string
```

Purpose:

Human-readable product/token name.

UI usage:

```text
OpenAI PreStocks
```

For display, the application may derive the company name by removing the ` PreStocks` suffix, but this should only be a presentation transformation.

---

## `symbol`

Example:

```text
"OPENAI"
```

Type:

```ts
string
```

Purpose:

Short identifier for the PreStocks product.

Use this as the primary internal identifier where appropriate.

Example:

```ts
const symbol = "OPENAI";
```

Do NOT assume every symbol is a conventional public-market ticker.

---

## `description`

Example:

```text
"OpenAI is an AI research company..."
```

Type:

```ts
string
```

Purpose:

Official product/company description supplied by PreStocks.

Use it for:

* company cards;
* company detail pages;
* search results;
* overview sections.

Do not rewrite the description unless there is a strong product reason.

---

## `image`

Example:

```text
"https://www.prestocks.com/logos/openai.png"
```

Type:

```ts
string
```

Purpose:

Official PreStocks-hosted logo/image.

Use this instead of downloading/rehosting logos unless necessary.

The UI should gracefully handle image loading failures.

---

## `external_url`

Example:

```text
"https://www.prestocks.com/openai"
```

Type:

```ts
string
```

Purpose:

Official PreStocks product page.

Use this as the canonical "View on PreStocks" destination.

---

## `contract_address`

Example:

```text
"PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF"
```

Type:

```ts
string
```

Purpose:

Solana token/contract address associated with the PreStocks asset.

This is useful for:

* displaying an address;
* copy-to-clipboard;
* linking to a Solana explorer;
* future onchain integrations.

Do NOT hard-code addresses.

Always obtain them from the API.

---

## `markPrice`

Example:

```text
1023.0570837152244
```

Type:

```ts
number
```

Purpose:

PreStocks' mark/reference price.

This should be treated separately from `tokenPrice`.

Display it with sensible precision rather than showing all decimal places.

---

## `markValuation`

Example:

```text
1267496417442
```

Type:

```ts
number
```

Purpose:

Mark/reference valuation associated with the company.

This is a large financial number.

Do not display:

```text
1267496417442
```

Prefer compact formatting:

```text
$1.27T
```

or:

```text
$1,267.5B
```

depending on the UI.

Use a formatter rather than manually converting values.

---

## `tokenPrice`

Example:

```text
1322.2432730342719
```

Type:

```ts
number
```

Purpose:

Current token price reported by PreStocks.

This is one of the primary fields for the product.

---

## `impliedValuation`

Example:

```text
1638167252087
```

Type:

```ts
number
```

Purpose:

Valuation implied by the current token price.

Useful for:

* company cards;
* company pages;
* comparisons;
* valuation ranking;
* research dashboards.

---

## `supply`

Example:

```text
2826.3438829342012
```

Type:

```ts
number
```

Purpose:

Current token supply exposed by the API.

Do not assume this is the company's total shares outstanding.

Label it as:

```text
Token Supply
```

rather than:

```text
Shares Outstanding
```

---

# 7. TypeScript Data Model

Create a type representing the API response.

```ts
export interface PreStock {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  contract_address: string;
  markPrice: number;
  markValuation: number;
  tokenPrice: number;
  impliedValuation: number;
  supply: number;
}
```

Do not add fields to this interface unless they actually exist in the API or are clearly derived application fields.

---

# 8. API Fetching

The application should fetch the official API dynamically.

Recommended architecture:

```text
PreStocks API
     ↓
Server-side fetch
     ↓
Normalised application data
     ↓
React UI
```

Prefer server-side fetching in Next.js when possible.

Example:

```ts
const PRESTOCKS_API = "https://prestocks.com/api/prestocks";

const response = await fetch(PRESTOCKS_API, {
  next: {
    revalidate: 60,
  },
});

if (!response.ok) {
  throw new Error("Failed to fetch PreStocks data");
}

const products = await response.json();
```

The application does not need to fetch the API every second.

For a research dashboard, a short cache/revalidation period is preferable.

---

# 9. Never Hard-Code Current Products

Do NOT build:

```ts
const products = [
  "OpenAI",
  "SpaceX",
  "Anthropic",
];
```

as the source of truth.

Instead:

```text
API
 ↓
current product list
 ↓
UI
```

This matters because the product catalogue changes.

The API currently includes products such as:

* Anduril
* Anthropic
* Figure AI
* Kalshi
* Neuralink
* OpenAI
* Polymarket
* SpaceX

but the application must assume that the list can change.

---

# 10. Product Pages

The main `/products` page currently presents the catalogue using concepts including:

* AUM
* Volume
* Holders
* Transactions
* Product
* Token Price
* Implied Valuation
* Mark Price Premium %
* Mark Valuation
* Address

The application can use these concepts as inspiration but must not pretend that the basic API provides fields that it does not.

For example:

```text
AUM
Volume
Holders
Transactions
```

are visible on the PreStocks product interface but are not currently part of the basic `/api/prestocks` response.

Do not fabricate them.

If the application needs them, find an official source/API for them first.

---

# 11. Mark Price Premium

The Products interface exposes:

```text
Mark Price Premium %
```

This can be derived from the API.

Use:

```text
premium =
((tokenPrice - markPrice) / markPrice) * 100
```

Example:

```ts
const premiumPercent =
  ((product.tokenPrice - product.markPrice) / product.markPrice) * 100;
```

Positive value:

```text
token price > mark price
```

Negative value:

```text
token price < mark price
```

This should be described neutrally.

Do NOT label positive premium as automatically "good" or negative premium as automatically "bad".

Use terminology such as:

```text
+2.4% premium
-1.8% discount
```

or:

```text
+2.4% vs mark
-1.8% vs mark
```

---

# 12. Important: Do Not Turn the Premium Into Investment Advice

The application is a research/discovery tool.

It should not say:

```text
BUY THIS
```

or:

```text
SELL THIS
```

based solely on premium.

Instead:

```text
Trading 3.2% above mark
```

or:

```text
Trading 3.2% below mark
```

The user can interpret the information.

---

# 13. Company Detail Pages

The official PreStocks site exposes additional company-level information on individual pages.

For example, the OpenAI page includes:

* company name;
* location;
* founded year;
* sector;
* description;
* website/social/research links where available;
* token price;
* implied valuation;
* mark price;
* mark valuation;
* premium;
* market cap;
* supply;
* holders;
* latest news;
* reports;
* funding rounds.

The exact availability of these sections can differ between companies.

Therefore:

```text
Do not assume every company has every section.
```

Use optional rendering.

Example:

```tsx
{company.latestNews?.length > 0 && (
  <NewsSection />
)}
```

rather than assuming data exists.

---

# 14. Company Research Model

The application should conceptually separate:

### Company information

```text
Name
Location
Founded
Sector
Description
Website
Socials
```

from:

### Token information

```text
Token price
Mark price
Implied valuation
Mark valuation
Premium
Supply
Contract address
```

This distinction is important.

A company is not the token.

The token provides economic exposure to the company.

---

# 15. Recommended Product Architecture

Build:

```text
/app
  /page.tsx
  /discover
    /page.tsx
  /company
    /[symbol]
      /page.tsx
  /compare
    /page.tsx
  /watchlist
    /page.tsx
```

Possible components:

```text
/components
  /prestocks
    ProductCard.tsx
    ProductGrid.tsx
    ProductSearch.tsx
    ProductFilters.tsx
    PriceDisplay.tsx
    ValuationDisplay.tsx
    PremiumBadge.tsx
    CompanyHeader.tsx
    TokenMetrics.tsx
    CompareTable.tsx
    WatchlistButton.tsx
```

---

# 16. Core Product: Discover

The homepage should immediately communicate what the application does.

Recommended structure:

```text
PRESTOCKS SCOUT

Research private companies
before they go public.

[ Search companies... ]

Featured / All PreStocks

┌─────────────────────────────┐
│ OpenAI                      │
│ AI                          │
│                             │
│ $1,322.24                   │
│ $1.64T implied valuation    │
│ +2.9% vs mark               │
│                             │
│ View company →              │
└─────────────────────────────┘
```

Cards should prioritise:

1. Company identity
2. Token price
3. Implied valuation
4. Mark comparison
5. Sector/category
6. Link to research

---

# 17. Search

Search should operate over:

```text
name
symbol
description
sector
```

However, sector may not be available directly from the basic API.

Do not assume it exists in the API response.

If sector information is sourced from individual PreStocks pages, keep that as a separate enrichment layer.

Example:

```text
Search:
"AI"

Results:
OpenAI
Anthropic
Figure AI
```

---

# 18. Compare

This should be one of the main differentiating features.

Allow users to select two or more PreStocks.

Example:

```text
                 OpenAI       Anthropic

Token Price      $1,322       $1,038

Implied Val.     $1.64T       $1.70T

Mark Price       $1,023       $1,035

vs Mark          +29.2%       +0.3%

Token Supply     2,826        7,382
```

Do not declare one company "better".

The purpose is to expose differences.

---

# 19. Watchlist

Watchlist can initially be entirely client-side.

Do not build authentication unless necessary.

Use:

```text
localStorage
```

for the MVP.

Example:

```ts
const WATCHLIST_KEY = "prestocks-watchlist";
```

Store symbols:

```json
[
  "OPENAI",
  "ANTHROPIC",
  "SPACEX"
]
```

Do not store the entire API object because prices change.

---

# 20. "What Changed?" Feature

This is the most valuable optional feature.

The application can detect changes between API snapshots.

Example:

```text
OPENAI

Token price
$1,280 → $1,322
+3.3%

Mark price
$1,020 → $1,023
+0.3%

Implied valuation
$1.59T → $1.64T
```

This can become:

```text
WHAT CHANGED
```

on the company page.

For the hackathon MVP, this can be implemented using recent cached snapshots rather than a complex database.

---

# 21. Do Not Pretend the API Provides Historical Data

The current `/api/prestocks` endpoint is a current snapshot.

It does NOT expose a historical time series in the response.

Therefore do not build:

```text
1D chart
7D chart
30D chart
1Y chart
```

from this endpoint alone.

If historical charts are required, the agent must find an official/authorised historical data source first.

Do not fabricate historical values.

---

# 22. Product Lifecycle Events

Private companies can change status.

This is extremely important.

For example, the current PreStocks pages show lifecycle events:

### SpaceX

The SpaceX page currently warns that SpaceX has gone public and gives a deadline for converting the existing SPACEX PreStocks token.

### xAI

The xAI page currently states that xAI was acquired by SpaceX and provides a conversion deadline.

This proves that the product cannot assume:

```text
Pre-IPO forever
```

The application should therefore support lifecycle/status messaging.

Potential status values:

```ts
type ProductStatus =
  | "active"
  | "conversion_required"
  | "public"
  | "acquired"
  | "inactive";
```

Only assign these when supported by authoritative data.

Do not infer lifecycle status from price behaviour.

---

# 23. Important API Design Rule

Do not create a fake database of company status.

Instead, if an official PreStocks page contains a lifecycle notice, expose it as an optional enriched field.

For example:

```ts
interface PreStockEnrichment {
  sector?: string;
  foundedYear?: number;
  location?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  status?: string;
  statusMessage?: string;
}
```

Keep this separate from the raw API object.

---

# 24. Raw vs Derived Data

Maintain a clear distinction.

## Raw API data

```ts
tokenPrice
markPrice
impliedValuation
markValuation
supply
```

## Derived data

```ts
premiumPercent
valuationDifference
priceDifference
formattedValuation
formattedPrice
```

Example:

```ts
const premiumPercent =
  ((tokenPrice - markPrice) / markPrice) * 100;
```

Never overwrite the raw values.

---

# 25. Formatting

Financial numbers need human-readable formatting.

Use helpers.

Example:

```ts
formatCurrency(1322.243)
// "$1,322.24"

formatCompactCurrency(1638167252087)
// "$1.64T"

formatPercent(2.438)
// "+2.44%"
```

Avoid displaying excessive precision.

Do not show:

```text
1322.2432730342719
```

to users.

---

# 26. Large Number Handling

Valuations can reach trillions.

Use:

```text
1.2K
1.2M
1.2B
1.2T
```

Example:

```text
$1.64T
```

Do not use JavaScript integer arithmetic for huge financial values if precision becomes important.

The API values can be represented as JavaScript `number` for display, but do not perform unnecessary high-precision financial calculations with floating-point arithmetic.

---

# 27. Solana

PreStocks is live on Solana.

The API's `contract_address` values should therefore be treated as Solana addresses.

The MVP does not need to perform transactions.

The product can simply provide:

```text
Contract
PreweJY...
[Copy]
[View on Explorer]
```

If an explorer link is added, construct it from the actual address rather than hard-coding individual links.

---

# 28. Wallet Connection

A wallet is NOT required for the first version of the research product.

Do not add wallet connection merely because this is a Solana hackathon.

Only add it if there is a concrete feature that requires it.

The primary value proposition is:

```text
Discover
Research
Compare
Monitor
```

not:

```text
Connect wallet
```

---

# 29. Trading

The application may eventually link users to an authorised trading venue, but trading should not be the core MVP.

The PreStocks ecosystem already contains many external trading integrations.

The application should not rebuild an exchange.

If a "Trade" button is included, it should simply navigate to an appropriate official/existing venue and clearly distinguish that external service from the application.

---

# 30. PreStocks Ecosystem

The official ecosystem page currently categorises integrations across:

* Trading
* Wallet
* Analytics
* Launchpad
* Research
* Bot
* Leverage
* Index
* Liquidity
* Bridge
* Chain

This is useful evidence that PreStocks already has a broader ecosystem.

Therefore:

> The hackathon product should add a new utility layer rather than pretending PreStocks has no surrounding ecosystem.

A research/discovery product fits naturally into the ecosystem.

---

# 31. Stocklana Bounty Constraint

The Stocklana PreStocks bounty explicitly asks for projects using PreStocks.

It also states that projects integrating other non-PreStocks pre-IPO tokens are ineligible.

Therefore:

## DO

Use:

```text
PreStocks
PreStocks API
PreStocks product pages
PreStocks contract addresses
Solana
```

## DO NOT

Integrate:

```text
xStocks
Tessera T-Tokens
other pre-IPO token systems
```

Even if another protocol provides useful data.

Other projects can be used as design inspiration during development, but the submitted application must comply with the bounty's PreStocks-only requirement.

---

# 32. Compliance / Product Language

Avoid language such as:

```text
Best investment
Guaranteed opportunity
Buy before everyone else
Risk-free
Undervalued
You should buy
You should sell
```

Prefer:

```text
Market data
Token price
Implied valuation
Trading above mark
Trading below mark
Company research
Market activity
Price difference
Valuation difference
```

The application is a research tool, not a financial adviser.

---

# 33. Error Handling

The API can fail or return unexpected data.

Handle:

```text
network failure
non-200 response
empty response
malformed JSON
missing fields
image failure
stale data
```

Example:

```ts
if (!response.ok) {
  throw new Error("PreStocks API unavailable");
}
```

UI should show:

```text
Unable to load PreStocks data.

Try again.
```

rather than a blank screen.

---

# 34. Empty State

If no products are returned:

```text
No PreStocks products available.

Please try again later.
```

Do not hard-code fallback financial values.

---

# 35. Loading State

Use skeletons.

Example:

```text
┌─────────────────────┐
│ ▓▓▓▓                │
│ ▓▓▓▓▓▓▓             │
│                     │
│ ▓▓▓▓▓▓              │
│ ▓▓▓▓▓▓▓▓            │
└─────────────────────┘
```

Avoid blocking the entire page with a spinner.

---

# 36. Recommended MVP

The first working version should contain only:

### Page 1 — Discover

* API-powered product list
* Search
* Basic filtering
* Product cards
* Token price
* Implied valuation
* Premium vs mark

### Page 2 — Company

* Company identity
* Description
* Token metrics
* Mark comparison
* Contract address
* Official PreStocks link
* Optional enriched company information

### Page 3 — Compare

* Select 2–3 companies
* Side-by-side metrics
* Price
* Valuation
* Mark
* Premium
* Supply

### Page 4 — Watchlist

* LocalStorage-based watchlist
* Current prices
* Current valuations
* Current premium

This is enough for a convincing MVP.

---

# 37. Stretch Features

Only build these after the MVP is working.

Priority order:

```text
1. What Changed
2. Better comparison
3. Company research enrichment
4. Market overview
5. Wallet integration
6. External trading links
```

Do NOT start with:

```text
smart contracts
lending
leverage
automated trading
AI agents
```

Those are unnecessary for the core concept.

---

# 38. Suggested Homepage

```text
┌──────────────────────────────────────────────────────┐
│ PRESTOCKS SCOUT                         [Watchlist]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Research the private markets                         │
│                                                      │
│ Discover and compare tokenised                       │
│ pre-IPO companies on Solana.                         │
│                                                      │
│ [ Search companies... ]                              │
│                                                      │
├──────────────────────────────────────────────────────┤
│ MARKET                                               │
│                                                      │
│ 8 Assets     $X.XT Implied Value     X Categories    │
│                                                      │
├──────────────────────────────────────────────────────┤
│ PRESTOCKS                                            │
│                                                      │
│ [OpenAI] [Anthropic] [SpaceX] [Anduril]              │
│                                                      │
│ ...                                                  │
└──────────────────────────────────────────────────────┘
```

Keep the design clean.

Do not make it look like a generic crypto casino.

---

# 39. Suggested Company Page

```text
OPENAI

AI · CA, USA · Founded 2015

OpenAI pioneers large-language models...

────────────────────────────────────

TOKEN

$1,322.24
Token Price

$1.64T
Implied Valuation

$1,023.06
Mark Price

+29.25%
vs Mark

────────────────────────────────────

TOKEN DETAILS

Supply
2,826.34

Contract
PreweJY...

[Copy Address]

────────────────────────────────────

RESEARCH

Company Overview
Latest News
Reports
Funding Rounds

────────────────────────────────────

[Add to Watchlist]
[View on PreStocks]
```

The actual availability of research sections should be data-driven.

---

# 40. Suggested Comparison Page

```text
COMPARE PRESTOCKS

Choose assets to compare.

[ OpenAI ] [ Anthropic ] [ SpaceX ]

────────────────────────────────────

                 OPENAI    ANTHROPIC

Token Price      $1,322     $1,038

Implied Val.     $1.64T     $1.70T

Mark Price       $1,023     $1,035

vs Mark          +29.2%     +0.3%

Supply           2,826      7,382

────────────────────────────────────

View full research →
```

Do not rank companies.

Comparison should expose data, not make the decision for the user.

---

# 41. Agent Instructions

The coding agent should follow these rules:

### Rule 1

PreStocks official API is the source of truth for current token data.

### Rule 2

Never invent API fields.

### Rule 3

Never hard-code current prices.

### Rule 4

Never fabricate historical data.

### Rule 5

Never represent a PreStocks token as direct company ownership.

### Rule 6

Keep raw API data separate from derived values.

### Rule 7

Use server-side API fetching where practical.

### Rule 8

Make the interface resilient to missing company information.

### Rule 9

Do not add unnecessary blockchain infrastructure.

### Rule 10

Do not integrate other pre-IPO token systems.

### Rule 11

Do not add financial recommendations or buy/sell scoring.

### Rule 12

Prioritise a working polished demo over feature quantity.

---

# 42. Recommended Type Structure

```ts
export interface PreStock {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  contract_address: string;
  markPrice: number;
  markValuation: number;
  tokenPrice: number;
  impliedValuation: number;
  supply: number;
}

export interface PreStockDerived extends PreStock {
  premiumPercent: number;
  priceDifference: number;
  valuationDifference: number;
}

export interface PreStockEnrichment {
  location?: string;
  foundedYear?: number;
  sector?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  status?: string;
  statusMessage?: string;
}
```

---

# 43. Derived Data

Create one transformation function.

```ts
export function enrichPreStock(product: PreStock): PreStockDerived {
  const premiumPercent =
    product.markPrice === 0
      ? 0
      : ((product.tokenPrice - product.markPrice) / product.markPrice) * 100;

  return {
    ...product,
    premiumPercent,
    priceDifference: product.tokenPrice - product.markPrice,
    valuationDifference:
      product.impliedValuation - product.markValuation,
  };
}
```

This ensures every component receives consistent calculations.

---

# 44. Data Fetch Layer

Do not call the API from every component independently.

Use:

```text
API
 ↓
fetch layer
 ↓
data transformation
 ↓
pages/components
```

Example:

```ts
export async function getPreStocks(): Promise<PreStock[]> {
  const response = await fetch("https://prestocks.com/api/prestocks", {
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PreStocks");
  }

  return response.json();
}
```

---

# 45. Final Product Philosophy

The application should answer three questions:

### 1. What's available?

```text
Discover
```

### 2. What's different?

```text
Compare
```

### 3. What's happening?

```text
Monitor
```

That creates a clear product:

```text
                 PRESTOCKS SCOUT

        DISCOVER → COMPARE → MONITOR
             ↓         ↓          ↓
          Assets    Research    Changes
```

The product is not trying to compete with PreStocks itself.

It is a **research/discovery layer built around the PreStocks ecosystem**.

---

# 46. Definition of Done

The application is ready for submission when:

* [ ] Official PreStocks API is integrated.
* [ ] Products load dynamically.
* [ ] Search works.
* [ ] Product cards show live API data.
* [ ] Company detail page works.
* [ ] Premium vs mark is calculated correctly.
* [ ] Compare page works.
* [ ] Watchlist works.
* [ ] No current financial values are hard-coded.
* [ ] No fabricated historical data exists.
* [ ] No unsupported API fields are assumed.
* [ ] PreStocks branding/API attribution is handled appropriately.
* [ ] No non-PreStocks pre-IPO tokens are integrated.
* [ ] No xPrime/xStocks-specific code remains.
* [ ] No references to the old product remain in metadata/copy.
* [ ] Production build succeeds.
* [ ] Mobile layout works.
* [ ] API failure has a graceful UI.
* [ ] Missing company information does not break the page.
* [ ] The final demo clearly shows why PreStocks is central to the product.

---

# 47. Most Important Principle

Do not build a large financial protocol.

Build a **small, polished product that makes the existing PreStocks data substantially more useful**.

The winning demo should be understandable in approximately 30 seconds:

> "PreStocks has tokenised private companies. We built a research terminal that lets you discover them, compare their market data, understand their valuation relative to the mark, and monitor changes — all powered directly by the PreStocks ecosystem."

That is the core product.
