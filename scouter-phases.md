# Scouter — Phase-by-Phase Coding Agent Plan

## 0. Mission

You are working inside the already-cloned **Scouter** repository.

Scouter is a research and discovery terminal for **PreStocks tokenised pre-IPO assets**.

The goal is to build a polished, functional MVP for the Stocklana | Hackathons Solana hackathon, specifically targeting the **PreStocks bounty**.

### Core product flow

```text
PreStocks
   ↓
Scouter Discover
   ↓
Find a company
   ↓
Research its token metrics
   ↓
Compare it with other companies
   ↓
Add to Watchlist
```

Scouter is **not** an exchange, trading protocol, lending protocol, or autonomous trading agent.

The product should make it easier to answer:

1. What PreStocks assets are available?
2. How do their token prices compare with their reference/mark prices?
3. What are their implied valuations?
4. How does one asset compare with another?
5. Which assets do I want to monitor?

---

# NON-NEGOTIABLE RULES

Before starting, follow these rules throughout the implementation.

### 1. Do not rebuild the project unnecessarily

First inspect the existing repository.

Determine:

* framework
* package manager
* existing dependencies
* existing components
* existing routes
* existing styling system
* existing design system
* existing API/data layer
* existing environment variables
* existing configuration

Reuse what already exists where reasonable.

Do not replace the project's architecture simply because you prefer another approach.

---

### 2. Do not install packages automatically

Do not install new npm packages unless they are genuinely necessary.

If the existing repository already has a suitable dependency, use it.

If a new dependency appears necessary:

1. Stop.
2. Explain why it is necessary.
3. Ask before installing it.

Prefer native/browser/React/Next.js functionality when practical.

---

### 3. Do not hard-code live PreStocks data

The current product list must come from the PreStocks API.

Use:

```text
https://prestocks.com/api/prestocks
```

Do not hard-code the current companies, prices, valuations, supply, or contract addresses.

The API data may change.

---

### 4. PreStocks must remain the centre of the application

Do not integrate other tokenised-stock/pre-IPO protocols into the application.

Do not integrate:

* xStocks
* Tessera T-Tokens
* unrelated RWA stock protocols
* unrelated tokenised-equity markets

Other protocols can be mentioned in documentation if necessary, but they must not become part of Scouter's asset data or core product flow.

---

### 5. Do not fabricate data

Never invent:

* historical prices
* historical charts
* company metrics
* funding rounds
* company sectors
* company locations
* status information
* news
* market data
* holders
* volume
* AUM
* transactions

Only display information when it comes from a verified source.

---

### 6. Do not build unnecessary blockchain functionality

Scouter is being built on Solana, but the MVP does **not** require:

* wallet connection
* token swaps
* smart contracts
* staking
* lending
* automated trading
* trading bots
* portfolio execution
* custom exchange infrastructure

A contract address and explorer link are useful.

A wallet is optional and should not be added unless there is a clear product reason later.

---

### 7. Do not copy xPrime

xPrime was researched as product inspiration.

Do not copy:

* its branding
* its copy
* its product identity
* its contracts
* its keeper architecture
* its trading logic
* its integrations
* its addresses
* its proprietary implementation

Scouter should be its own product.

---

### 8. Do not overbuild

The priority is:

```text
Functional > polished > simple > clever
```

Build the smallest complete product that demonstrates the idea extremely well.

---

# PHASE 1 — REPOSITORY AUDIT

## Objective

Understand the existing repository before changing anything.

### Tasks

Inspect:

```text
package.json
README
app/
pages/
src/
components/
lib/
utils/
hooks/
public/
```

and any other relevant directories.

Determine:

* Is this Next.js?
* App Router or Pages Router?
* TypeScript or JavaScript?
* Tailwind?
* Tailwind version?
* Existing component library?
* Existing state management?
* Existing data fetching?
* Existing API routes?
* Existing layout?
* Existing fonts?
* Existing theme?
* Existing reusable components?

Also inspect:

```text
.gitignore
.env*
next.config.*
tsconfig.json
tailwind.config.*
postcss.config.*
```

where applicable.

### Important

Do not modify application code during this phase unless absolutely necessary.

### Deliverable

Create a short internal implementation plan based on the repository's actual structure.

Then proceed to Phase 2.

---

# PHASE 2 — ESTABLISH THE SCOUTER FOUNDATION

## Objective

Make the existing repository structurally ready for the product.

### Tasks

Establish the following conceptual structure if it does not already exist:

```text
app/
  page.tsx
  discover/
    page.tsx
  company/
    [symbol]/
      page.tsx
  compare/
    page.tsx
  watchlist/
    page.tsx

components/
  prestocks/
    ProductCard
    ProductGrid
    ProductSearch
    ProductFilters
    PriceDisplay
    ValuationDisplay
    PremiumBadge
    CompanyHeader
    TokenMetrics
    CompareTable
    WatchlistButton

lib/
  prestocks/
    api
    types
    transforms
```

Do not blindly create every file if the repository has a better existing architecture.

Adapt the structure to the project.

---

## Data types

Create a central type representing the PreStocks API response.

Conceptually:

```ts
export interface PreStock {
  name: string
  symbol: string
  description: string
  image: string
  external_url: string
  contract_address: string
  markPrice: number
  markValuation: number
  tokenPrice: number
  impliedValuation: number
  supply: number
}
```

Create a derived type for values Scouter calculates:

```ts
export interface PreStockDerived extends PreStock {
  premiumPercent: number
  priceDifference: number
  valuationDifference: number
}
```

Do not duplicate these types across components.

---

# PHASE 3 — PRESTOCKS API DATA LAYER

## Objective

Connect Scouter to live PreStocks data.

API:

```text
https://prestocks.com/api/prestocks
```

### Requirements

Create one reusable API/data layer.

Do not have individual components independently fetch the API.

The data layer should:

1. Fetch the API.
2. Validate that the response is usable.
3. Handle HTTP errors.
4. Handle malformed/empty responses.
5. Transform raw products into Scouter's derived representation.

---

## Derived metrics

Calculate:

### Premium percentage

```ts
const premiumPercent =
  product.markPrice === 0
    ? 0
    : ((product.tokenPrice - product.markPrice) / product.markPrice) * 100
```

### Price difference

```ts
product.tokenPrice - product.markPrice
```

### Valuation difference

```ts
product.impliedValuation - product.markValuation
```

These are derived values.

Do not pretend they are supplied directly by PreStocks.

---

## Data freshness

Use a sensible short revalidation period if using Next.js server-side fetching.

Approximately:

```text
60 seconds
```

is appropriate.

The exact implementation should follow the repository's existing architecture.

---

## API failure states

The UI must handle:

* API unavailable
* non-200 response
* malformed response
* empty result
* missing image
* missing optional fields

Never leave the application looking broken because the API is temporarily unavailable.

---

# PHASE 4 — APPLICATION SHELL

## Objective

Create the core Scouter interface.

The application should feel like a modern research terminal rather than a generic dashboard.

### Navigation

At minimum:

```text
Scouter
Discover
Compare
Watchlist
```

The navigation should work on mobile and desktop.

---

## Visual direction

Keep the design:

* clean
* modern
* restrained
* information-dense
* professional
* easy to scan

Avoid:

* excessive gradients
* unnecessary illustrations
* giant decorative elements
* excessive animations
* fake financial-dashboard clutter
* unnecessary charts

The product should look credible enough to demonstrate during a hackathon judging session.

---

# PHASE 5 — DISCOVER PAGE

## Objective

Build the main asset discovery experience.

Route:

```text
/discover
```

This is the most important page.

---

## Page structure

Recommended structure:

```text
Header
    ↓
Page introduction
    ↓
Search / filters
    ↓
Results summary
    ↓
Product grid
```

---

## Search

Search by:

* company name
* symbol
* description

Search should update the visible product list.

Do not make a backend search endpoint unless required.

Client-side filtering of the fetched dataset is sufficient for the current scale.

---

## Product cards

Each card should show relevant information such as:

```text
Company
Symbol

Token Price
Mark Price

Premium / Discount vs Mark

Implied Valuation
```

The card should also provide a clear route to the company page.

Do not overload the card with every available field.

---

## Premium display

Example:

```text
+2.41% vs mark
```

or

```text
-1.84% vs mark
```

Use neutral language.

Do not write:

```text
Good buy
Undervalued
Overvalued
Buy
Sell
Best opportunity
```

Scouter is a research tool, not an investment adviser.

---

## Empty state

If search produces no result:

```text
No companies found.
Try another company name or symbol.
```

Make it polished.

---

# PHASE 6 — COMPANY PAGE

## Objective

Create the detailed research view for one PreStocks asset.

Route:

```text
/company/[symbol]
```

Example:

```text
/company/OPENAI
```

Do not assume symbols are always uppercase in routing logic. Normalise lookup appropriately.

---

## Header

Display:

* company image
* company name
* symbol
* description

Include:

```text
Open on PreStocks
```

which links to the actual `external_url`.

---

## Token metrics

Display:

### Token Price

The current PreStocks token price.

### Mark Price

The current mark price.

### Premium / Discount

Calculated by Scouter.

### Implied Valuation

The valuation implied by the token.

### Mark Valuation

The reference mark valuation.

### Supply

Token supply.

---

## Contract information

Show:

```text
Contract Address
```

with:

* truncated display
* copy action
* Solana explorer link

Use the actual API-provided address.

Do not invent addresses.

---

## Company research enrichment

If reliable information can be obtained from the official PreStocks product page or another verified source, the company page may optionally display:

* location
* founded year
* sector
* website
* social links
* status

However:

**Do not make this a blocker for the MVP.**

If enrichment is difficult or unreliable, ship the page using verified PreStocks API data only.

---

# PHASE 7 — COMPARE

## Objective

Allow users to compare PreStocks assets directly.

Route:

```text
/compare
```

---

## Interaction

Allow the user to select:

```text
2–3 companies
```

Do not build an enormous comparison system.

---

## Comparison table

Compare:

| Metric             | Company A | Company B | Company C |
| ------------------ | --------: | --------: | --------: |
| Token Price        |           |           |           |
| Mark Price         |           |           |           |
| Premium / Discount |           |           |           |
| Implied Valuation  |           |           |           |
| Mark Valuation     |           |           |           |
| Supply             |           |           |           |

Use the same formatting throughout the application.

---

## Important

Do not rank the companies.

Do not create:

```text
Winner
Best
#1
Top pick
Score
Rating
```

The purpose is side-by-side research.

---

# PHASE 8 — WATCHLIST

## Objective

Allow users to save companies for later research.

No authentication is required.

Use browser `localStorage`.

---

## Storage format

Store symbols rather than entire API objects.

Example:

```text
["OPENAI", "ANTHROPIC", "ANDURIL"]
```

This prevents stale copies of mutable API data from being stored.

---

## Behaviour

Users should be able to:

* add a company
* remove a company
* open its company page
* see current live metrics

The watchlist page should retrieve the latest data from the API and match it against saved symbols.

---

## Empty state

Provide a useful empty state explaining that saved companies will appear here.

---

# PHASE 9 — FORMATTING & DATA PRESENTATION

## Objective

Make financial information easy to understand.

Create reusable formatting utilities.

---

## Currency

Do not show unnecessary decimal precision.

Prefer:

```text
$160.29
```

over:

```text
$160.2888284824877
```

---

## Large valuations

Use compact formatting.

For example:

```text
$141.8B
$1.64T
$8.2B
```

instead of huge unformatted numbers.

---

## Percentages

Use sensible precision.

For example:

```text
+2.41%
-1.84%
0.00%
```

Do not show excessive precision.

---

## Token supply

Format large numbers sensibly.

Do not expose unnecessary floating-point noise.

---

# PHASE 10 — RESPONSIVE DESIGN

## Objective

Make the entire product usable on:

* desktop
* tablet
* mobile

Pay particular attention to:

### Discover

Cards should collapse cleanly.

### Company page

Metrics should stack naturally.

### Compare

The comparison table should remain usable on narrow screens.

Horizontal scrolling is acceptable for the comparison table.

### Navigation

The navigation must not overflow on mobile.

---

# PHASE 11 — LOADING & ERROR STATES

Every major data-dependent screen needs proper states.

Implement:

### Loading

Use the existing project's loading/skeleton patterns where available.

### Error

Example:

```text
Unable to load PreStocks data.

Please try again.
```

Provide a retry mechanism if practical.

### Empty

Differentiate between:

```text
No PreStocks assets available.
```

and:

```text
No results match your search.
```

These are different states.

---

# PHASE 12 — POLISH

Only after the core functionality works.

Improve:

* spacing
* typography
* hierarchy
* card consistency
* hover states
* focus states
* transitions
* mobile layout
* loading states
* empty states
* error states

Do not add decorative features simply because the interface looks empty.

Every visual element should help users research assets.

---

# PHASE 13 — OPTIONAL STRETCH FEATURES

Only attempt these if the MVP is already complete and stable.

Work on them in this order.

---

## Stretch 1 — What Changed?

If a reliable previous snapshot mechanism exists, show changes such as:

```text
Token price
Implied valuation
Premium vs mark
```

Do not fabricate historical data.

If there is no trustworthy historical source, skip this feature.

---

## Stretch 2 — Market Overview

Add a lightweight overview such as:

```text
Assets tracked
Highest token price
Largest implied valuation
Average premium vs mark
```

Only calculate these from the current API dataset.

Do not describe them as investment signals.

---

## Stretch 3 — External trading/discovery links

If an authorised external venue is available, provide an external link.

Do not build a trading system.

---

## Stretch 4 — Wallet integration

Only consider this after the MVP is complete.

Wallet connection is not required for the core product.

Do not let wallet integration delay the bounty submission.

---

# PHASE 14 — SECURITY & DATA QUALITY REVIEW

Before final testing, inspect the project for:

* exposed secrets
* API keys committed to Git
* hard-coded private credentials
* unsafe HTML rendering
* untrusted URLs
* broken external links
* malformed API handling
* client-side leakage of sensitive values

PreStocks public data should be treated as public market/product data.

Do not introduce unnecessary secrets.

---

# PHASE 15 — REMOVE DEVELOPMENT DEBRIS

Before the final build:

Search the entire repository for:

```text
TODO
FIXME
console.log
debugger
placeholder
lorem
xPrime
xStocks
T-Tokens
```

Remove development/debugging debris where appropriate.

Make sure no unrelated prototype branding or functionality remains.

---

# PHASE 16 — FINAL FUNCTIONAL TEST

Test the complete user journey:

```text
Open Scouter
    ↓
Discover
    ↓
Search for a company
    ↓
Open company page
    ↓
Inspect token metrics
    ↓
Inspect premium/discount
    ↓
Copy contract address
    ↓
Open PreStocks page
    ↓
Add company to watchlist
    ↓
Open Watchlist
    ↓
Open Compare
    ↓
Compare 2–3 companies
```

Verify that every step works.

---

# PHASE 17 — EDGE CASE TESTING

Test at least:

### API

* successful response
* API failure
* empty response
* malformed response

### Search

* exact company name
* symbol
* partial name
* no results
* empty search

### Company route

* valid symbol
* invalid symbol

### Watchlist

* empty watchlist
* add
* remove
* refresh page
* reopen application

### Compare

* no companies
* one company
* two companies
* three companies
* removing a company

### Images

* valid company image
* missing/broken image

### Mobile

* navigation
* cards
* company page
* comparison table
* watchlist

---

# PHASE 18 — PRODUCTION BUILD

Run the repository's appropriate checks.

At minimum:

```text
lint
typecheck
production build
```

Use the existing package scripts rather than inventing new commands.

Fix:

* TypeScript errors
* lint errors
* build errors
* broken imports
* invalid routes
* hydration issues
* missing environment variables

Do not ignore errors simply to get the build to pass.

---

# PHASE 19 — FINAL PRODUCT AUDIT

Before declaring the implementation complete, verify the following.

## Product

* [ ] Scouter has a clear identity.
* [ ] PreStocks is central to the product.
* [ ] Discover works.
* [ ] Search works.
* [ ] Company pages work.
* [ ] Compare works.
* [ ] Watchlist works.
* [ ] Data is live.
* [ ] Metrics are derived correctly.
* [ ] No fabricated data exists.

## UX

* [ ] Desktop works.
* [ ] Mobile works.
* [ ] Loading states work.
* [ ] Error states work.
* [ ] Empty states work.
* [ ] Navigation works.
* [ ] External links work.
* [ ] Contract addresses are handled correctly.

## Technical

* [ ] API is centralised.
* [ ] Types are centralised.
* [ ] No unnecessary duplicate fetching.
* [ ] No unnecessary dependencies.
* [ ] No secrets committed.
* [ ] No debug code.
* [ ] Production build passes.

## Hackathon compliance

* [ ] PreStocks is the integrated asset source.
* [ ] No non-PreStocks pre-IPO token integration exists.
* [ ] No unrelated protocol has become the product's core.
* [ ] No xPrime/xStocks implementation was copied into Scouter.
* [ ] The application demonstrates meaningful utility around PreStocks assets.

---

# EXECUTION ORDER

Follow this exact order:

```text
PHASE 1
Repository audit
        ↓
PHASE 2
Scouter foundation
        ↓
PHASE 3
PreStocks API/data layer
        ↓
PHASE 4
Application shell
        ↓
PHASE 5
Discover
        ↓
PHASE 6
Company page
        ↓
PHASE 7
Compare
        ↓
PHASE 8
Watchlist
        ↓
PHASE 9
Formatting
        ↓
PHASE 10
Responsive design
        ↓
PHASE 11
Loading/error states
        ↓
PHASE 12
Polish
        ↓
PHASE 13
Optional stretch
        ↓
PHASE 14
Security/data review
        ↓
PHASE 15
Cleanup
        ↓
PHASE 16
Functional test
        ↓
PHASE 17
Edge-case test
        ↓
PHASE 18
Production build
        ↓
PHASE 19
Final audit
```

# MOST IMPORTANT PRIORITY

If time becomes limited, stop adding features.

The minimum acceptable Scouter should be:

```text
Live PreStocks API
        +
Discover/search
        +
Company detail page
        +
Premium vs mark calculation
        +
Compare
        +
Watchlist
        +
Polished responsive UI
```

A smaller finished Scouter is preferable to a larger unfinished one.ng speculative features.

The final application should clearly communicate:

> **Scouter helps you discover, research and compare tokenised pre-IPO assets available through PreStocks.**
