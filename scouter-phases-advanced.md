# Scouter — Advanced Feature Implementation Plan

## Context

The Scouter MVP is complete.

The existing MVP already provides:

* Live PreStocks API integration
* Asset discovery
* Search
* Company pages
* Token metrics
* Mark-price comparison
* Premium/discount calculation
* Compare
* Watchlist
* Responsive UI
* Loading/error/empty states

The next goal is to turn Scouter from a **PreStocks data viewer** into a **private-market research and monitoring tool**.

The core transformation is:

```text
MVP

Discover → View → Compare → Watchlist


Advanced Scouter

Discover → Scout → Research → Understand → Monitor → Detect Changes
```

---

# IMPORTANT ARCHITECTURE RULE

PreStocks remains the source of truth for:

* token price
* mark price
* implied valuation
* mark valuation
* supply
* contract address
* PreStocks product information

Gemini must **not invent or replace PreStocks market data**.

Gemini is an intelligence layer used for:

* research summaries
* extracting structured company information
* summarising verified information
* identifying relevant events
* generating research briefs
* organising information for the UI

For current/recent information, use Gemini's Google Search grounding rather than relying on the model's internal knowledge. Google's Gemini API supports Google Search grounding and returns citation metadata that can be surfaced to users.

---

# PHASE 20 — GEMINI FOUNDATION

## Objective

Integrate Gemini into Scouter safely and centrally.

Use Google's current official JavaScript/TypeScript SDK:

```text
@google/genai
```

Google currently recommends the Google GenAI SDK rather than the older `@google/generativeai` package.

---

## API key

Use:

```text
GEMINI_API_KEY
```

in the server environment.

Never expose the Gemini API key to browser/client-side code.

Do NOT use:

```text
NEXT_PUBLIC_GEMINI_API_KEY
```

Do not hard-code the key.

---

## Gemini architecture

Create a server-side Gemini service.

Conceptually:

```text
lib/
  gemini/
    client
    research
    schemas
```

Adapt this to the existing repository structure.

The client should initialise Gemini once rather than creating clients throughout the application.

---

## Important

Do not call Gemini directly from React components.

Instead:

```text
React UI
   ↓
Next.js server/API route
   ↓
Gemini service
   ↓
Gemini API
```

This protects the API key and gives us one place to control prompts, errors and output validation.

---

# PHASE 21 — SCOUT REPORT

## Objective

Create the first major intelligence feature.

Add:

```text
Scout this company
```

to the company page.

The user clicks it and Scouter generates a structured research brief.

---

## UX

The button should feel like a primary product capability.

Example:

```text
┌──────────────────────────────┐
│  🔎 Scout this company       │
│  Generate a research brief   │
└──────────────────────────────┘
```

Do not make this look like a generic chatbot.

Scouter is not primarily a chat application.

---

# PHASE 22 — RESEARCH DATA PIPELINE

Before asking Gemini to write anything, collect verified information.

For a company, gather:

### PreStocks data

```text
name
symbol
description
tokenPrice
markPrice
premiumPercent
markValuation
impliedValuation
supply
external_url
contract_address
```

### Company source

Use the company's official PreStocks page where available.

### Web research

Gemini may use Google Search grounding to find current public information.

Prioritise:

1. Official company website
2. Official company announcements
3. Official PreStocks information
4. Reputable reporting
5. Other trustworthy sources

Do not instruct Gemini to use random social-media posts as authoritative evidence.

---

# PHASE 23 — STRUCTURED GEMINI OUTPUT

Do not simply ask Gemini:

```text
Tell me about OpenAI.
```

and render the resulting paragraph.

Instead, require structured output.

Google's Gemini API supports JSON-schema-based structured output, including JavaScript/TypeScript usage.

Conceptually define:

```ts
interface ScoutReport {
  overview: string
  sector?: string
  foundedYear?: number
  headquarters?: string
  businessModel?: string
  notableFacts: string[]
  recentDevelopments: ResearchEvent[]
  sources: ResearchSource[]
}
```

Where:

```ts
interface ResearchEvent {
  title: string
  summary: string
  date?: string
  source: string
  url: string
}
```

And:

```ts
interface ResearchSource {
  title: string
  url: string
  domain: string
}
```

---

# PHASE 24 — RESEARCH BRIEF UI

Display the generated report on the company page.

Suggested structure:

```text
COMPANY
────────────────────────

OpenAI

AI
San Francisco
Founded 2015


SCOUT REPORT
────────────────────────

Overview

[short verified summary]


BUSINESS

[concise explanation]


NOTABLE FACTS

• ...
• ...
• ...


SOURCES

[Source]
[Source]
[Source]
```

Keep the output concise.

Do not create a giant AI-generated essay.

---

# PHASE 25 — CITATIONS

This is extremely important.

If Gemini uses Google Search grounding, preserve the returned source information.

Google's grounding response includes citation annotations and search metadata.

Scouter should show users where research information came from.

For example:

```text
Recent funding announcement
Source: Company announcement
```

with a clickable source.

Do not display AI-generated claims without attribution when they depend on external research.

---

# PHASE 26 — "WHAT CHANGED?"

## Objective

Turn Scouter into a monitoring product.

This is one of the highest-priority features.

The user should be able to see:

```text
WHAT CHANGED?
```

for a company.

---

## Snapshot model

When a user scouts/views a company, create a lightweight snapshot.

Store:

```ts
interface CompanySnapshot {
  symbol: string
  timestamp: number
  tokenPrice: number
  markPrice: number
  impliedValuation: number
  markValuation: number
  premiumPercent: number
}
```

Do not store the entire API response.

---

# PHASE 27 — SNAPSHOT STORAGE

For the MVP, localStorage is acceptable.

Store:

```text
scouter:snapshots
```

Example:

```json
{
  "OPENAI": {
    "timestamp": 1727180000000,
    "tokenPrice": 160.28,
    "markPrice": 156.50,
    "impliedValuation": 141800000000,
    "markValuation": 138000000000,
    "premiumPercent": 2.42
  }
}
```

Do not treat this as a permanent market-history database.

It is a user-local comparison snapshot.

---

# PHASE 28 — CHANGE CALCULATOR

Compare:

```text
previous snapshot
        ↓
current PreStocks data
```

Calculate:

```text
token price change
mark price change
implied valuation change
premium change
```

Example:

```text
Token price
$151.20 → $160.28
+$9.08

Implied valuation
$132B → $141.8B
+$9.8B

Premium
+1.2% → +2.4%
+1.2 percentage points
```

Make the distinction between:

```text
percentage change
```

and:

```text
percentage-point change
```

correctly.

---

# PHASE 29 — WHAT CHANGED UI

Add a dedicated section:

```text
WHAT CHANGED
```

Example:

```text
Since your last snapshot

Token price
$151.20 → $160.28

Implied valuation
$132B → $141.8B

Premium vs mark
+1.2% → +2.4%

Last checked
2 hours ago
```

If there is no previous snapshot:

```text
No previous snapshot yet.

Scouter will compare future observations here.
```

Do not pretend that a first observation represents a historical change.

---

# PHASE 30 — COMPANY ACTIVITY / CATALYST TIMELINE

## Objective

Give Scouter a second dimension beyond market numbers.

Add:

```text
Recent Activity
```

to the company page.

Gemini's Google Search grounding can be used to retrieve current public web information and provide citations.

---

## Event categories

Keep categories simple:

```text
Funding
Company
Product
Partnership
Acquisition
Regulatory
Market
PreStocks
Other
```

Do not create dozens of categories.

---

# PHASE 31 — EVENT EXTRACTION

Gemini should return structured events.

Example:

```ts
interface ResearchEvent {
  title: string
  summary: string
  date: string | null
  category:
    | "funding"
    | "company"
    | "product"
    | "partnership"
    | "acquisition"
    | "regulatory"
    | "market"
    | "prestocks"
    | "other"
  sourceTitle: string
  sourceUrl: string
}
```

Limit the result.

For example:

```text
3–5 recent relevant events
```

Do not return 30 news stories.

---

# PHASE 32 — ACTIVITY TIMELINE UI

Display:

```text
RECENT ACTIVITY

● Sep 22
  New funding announcement
  Short summary...

● Sep 18
  Company announcement
  Short summary...

● Sep 14
  PreStocks update
  Short summary...
```

Each event should have:

* date
* title
* short summary
* category
* source

The source must be clickable.

---

# PHASE 33 — AI WATCHLIST INTELLIGENCE

Upgrade the existing watchlist.

Instead of:

```text
WATCHLIST

OpenAI
Anthropic
Anduril
```

display:

```text
WATCHLIST

OPENAI
$160.28
+2.4% vs mark

1 new development
Valuation changed since last snapshot


ANTHROPIC
$...
...
```

The watchlist should remain primarily data-driven.

Do not call Gemini for every card render.

---

# PHASE 34 — GEMINI CACHING

Gemini calls can be expensive/slow and shouldn't happen every time a user opens a page.

Cache research results.

Possible architecture:

```text
Company
   ↓
Research request
   ↓
Check cache
   ↓
If fresh → return cached report
   ↓
If stale → Gemini
   ↓
Store result
```

For the hackathon, a simple server-side cache or lightweight persistence mechanism is sufficient.

Do not build a complicated distributed caching system.

---

# PHASE 35 — RESEARCH REFRESH

Add:

```text
Refresh research
```

to the research section.

This explicitly requests a new Gemini research run.

Show:

```text
Research updated just now
```

after completion.

Do not silently call Gemini every time the page loads.

---

# PHASE 36 — AI FAILURE HANDLING

Gemini can fail.

Handle:

* API timeout
* rate limit
* invalid API key
* malformed structured response
* search grounding failure
* empty research response

The company page must still work if Gemini is unavailable.

For example:

```text
Research unavailable

Scouter's live PreStocks data is still available.
Try refreshing research later.
```

The core application must never depend entirely on Gemini.

---

# PHASE 37 — AI GUARDRAILS

The Gemini prompt must explicitly instruct:

```text
Do not provide investment advice.
Do not recommend buying or selling.
Do not rank companies as investments.
Do not invent facts.
Do not invent dates.
Do not invent sources.
Do not claim that token ownership equals direct equity ownership.
Use only information supported by provided data or retrieved sources.
Clearly distinguish known facts from uncertainty.
```

This is especially important because the product deals with financial information.

---

# PHASE 38 — MARKET OVERVIEW

Only after the intelligence features work.

Add a lightweight overview to Discover:

```text
MARKET OVERVIEW

8
Assets tracked

$...
Largest implied valuation

...
Average premium vs mark

...
```

All metrics must be calculated from the current PreStocks API response.

Do not turn these metrics into investment rankings.

Avoid:

```text
Best stock
Best opportunity
Top investment
```

---

# PHASE 39 — "SCOUT" PRODUCT IDENTITY

Review the UI and make the word **Scout** meaningful.

The application should repeatedly reinforce:

```text
Discover
Scout
Research
Monitor
```

Potential CTA:

```text
Scout company
```

Potential navigation:

```text
Discover
Watchlist
Compare
```

Potential company-page section:

```text
Scout Report
```

The product should feel cohesive rather than like unrelated AI features were bolted on.

---

# PHASE 40 — FINAL DEMO FLOW

After these features are implemented, the ideal demo becomes:

```text
OPEN SCOUTER
      ↓
DISCOVER
      ↓
Search OpenAI
      ↓
Open company
      ↓
Show live PreStocks metrics
      ↓
Click "Scout"
      ↓
Generate research brief
      ↓
Show verified sources
      ↓
Show recent activity
      ↓
Show "What's Changed?"
      ↓
Add to Watchlist
      ↓
Open Watchlist
      ↓
Show current metrics + changes
      ↓
Compare with another company
```

This should take approximately:

```text
2–3 minutes
```

for a judge.

---

# PHASE 41 — PERFORMANCE REVIEW

Before submission:

Check that:

* Discover does not trigger Gemini.
* Company pages do not repeatedly trigger Gemini.
* Watchlist does not trigger Gemini for every card.
* Research is cached.
* API calls are centralised.
* Gemini calls happen intentionally.
* Loading states are clear.
* The UI remains responsive during AI generation.

---

# PHASE 42 — FINAL AI QUALITY AUDIT

Test at least 3 different companies.

For each generated report, check:

### Accuracy

Are the facts actually true?

### Sources

Can every externally sourced claim be traced to a source?

### Freshness

Does the activity section contain genuinely recent information?

### Hallucination

Did Gemini invent:

* funding
* dates
* valuation
* executives
* partnerships
* products
* company status?

If yes, fix the prompt/data pipeline before submission.

### Neutrality

Does it avoid:

* Buy
* Sell
* Strong buy
* Best investment
* Undervalued
* Guaranteed
* Will rise
* Will fall

---

# PHASE 43 — FINAL UX POLISH

Once everything works:

Improve only the things that make the demo clearer.

Prioritise:

1. Scout button
2. Research loading state
3. Research result hierarchy
4. Source presentation
5. Activity timeline
6. What's Changed section
7. Watchlist change indicators
8. Mobile presentation

Do not start redesigning the entire application.

---

# PHASE 44 — FINAL PRODUCT CHECK

Scouter should now communicate:

> **Scouter is a research and monitoring layer for PreStocks — helping users discover private companies, understand their tokenised market data, investigate recent developments, and track what changes over time.**

The application should have three distinct strengths:

```text
DISCOVERY
What exists?

       ↓

INTELLIGENCE
What's happening?

       ↓

MONITORING
What's changed?
```

---

# PRIORITY ORDER

If time becomes limited, implement in this exact order:

```text
1. Gemini foundation
        ↓
2. Scout Report
        ↓
3. Google Search grounding + sources
        ↓
4. Recent Activity
        ↓
5. Snapshot storage
        ↓
6. What's Changed?
        ↓
7. Intelligent Watchlist
        ↓
8. Caching
        ↓
9. Market Overview
        ↓
10. Final polish
```

If only enough time remains for three things:

```text
SCOUT REPORT
+
RECENT ACTIVITY
+
WHAT'S CHANGED?
```

Stop there and polish them.

---

# DO NOT DO

Do not add:

* trading execution
* automated trading
* investment recommendations
* price predictions
* buy/sell signals
* portfolio optimisation
* leverage
* lending
* complex DeFi
* unnecessary wallet functionality
* fabricated historical charts
* fabricated news
* generic chatbot interface

The goal is not to make Scouter bigger.

The goal is to make Scouter **meaningfully more useful**.

---

# DEFINITION OF DONE

The advanced version is complete when:

* [ ] Gemini is integrated server-side.
* [ ] Gemini API key is never exposed client-side.
* [ ] Scout Report works.
* [ ] Research output is structured.
* [ ] Current research can use Google Search grounding.
* [ ] Sources are shown to users.
* [ ] Recent activity works.
* [ ] Previous snapshots can be stored.
* [ ] What's Changed works.
* [ ] Watchlist displays useful changes.
* [ ] Gemini failures do not break the core app.
* [ ] No fabricated information is displayed.
* [ ] No investment recommendations are generated.
* [ ] PreStocks remains the source of truth for market data.
* [ ] The product still works when Gemini is unavailable.
* [ ] Production build passes.
* [ ] Final demo can be completed in approximately 2–3 minutes.
