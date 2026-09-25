Build a new **Market Terminal** experience for Scouter.

The goal is to create a single-company private-market terminal where users select one PreStocks company and see its market data, company intelligence, activity, and an AI chatbot that is specifically contextualised to that selected company.

This should become one of the core experiences of Scouter.

Do not unnecessarily modify existing Discover, Compare, Watchlist, or other completed features.

---

## Phase 1 — Audit the Existing Application

Before writing code:

* Inspect the entire existing Scouter architecture.
* Identify the current PreStocks API/data layer.
* Identify existing company-page components.
* Identify historical/snapshot functionality if already implemented.
* Identify existing Gemini/AI infrastructure.
* Identify existing research/news/activity functionality.
* Identify existing formatting utilities.
* Identify the current navigation and routing conventions.
* Identify the current design tokens and layout system.

Reuse existing functionality wherever possible.

Do not duplicate data-fetching logic.

Do not install packages automatically.

Do not replace working components merely to implement this feature.

---

# Phase 2 — Market Terminal Route

Create a new route for the market terminal.

Preferred structure:

```text
/market/[symbol]
```

Examples:

```text
/market/openai
/market/anthropic
/market/spacex
```

The selected symbol should determine the company currently displayed.

The page must work with any valid PreStocks product returned by the existing data source.

Do not hard-code the current company list.

---

# Phase 3 — Overall Layout

Create a desktop-first terminal layout:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Scouter                    [ OpenAI ▼ ]                Intelligence │
├──────────────────────────────────────────────┬──────────────────────┤
│                                              │                      │
│  OPENAI                                      │  Intelligence         │
│  OPENAI                                      │  Ask about OpenAI     │
│                                              │                      │
│  $XXX.XX     +X.X%                           │  Conversation...      │
│  Token Price                                 │                      │
│                                              │                      │
│  ┌────────────────────────────────────────┐  │                      │
│  │                                        │  │                      │
│  │             MARKET CHART               │  │                      │
│  │                                        │  │                      │
│  └────────────────────────────────────────┘  │                      │
│                                              │                      │
│  Market Data                                │                      │
│  Company                                    │                      │
│  Activity                                   │  [Ask anything...]     │
└──────────────────────────────────────────────┴──────────────────────┘
```

The main market area should occupy approximately **two-thirds** of the available desktop width.

The Intelligence panel should occupy approximately **one-third**.

The exact proportions can adapt responsively.

---

# Phase 4 — Company Selector

At the top-left/top-bar area, create a prominent company selector.

Example:

```text
OpenAI ▾
```

Clicking it opens a searchable list of available PreStocks companies.

Each option should show:

* company logo
* company name
* symbol
* current token price

Example:

```text
Select market

Search...

OpenAI
OPENAI                         $XXX

Anthropic
ANTHROPIC                      $XXX

SpaceX
SPACEX                         $XXX

Anduril
ANDURIL                        $XXX
```

Requirements:

* Search companies by name or symbol.
* Selecting a company navigates to its `/market/[symbol]` route.
* The current selection is visually obvious.
* Use actual PreStocks data.
* Do not hard-code company values.
* Handle empty search results gracefully.

---

# Phase 5 — Market Header

Build the main company header.

Display:

* company logo
* company name
* symbol
* token price
* price change if historical data exists
* premium/discount to mark
* optional status/lifecycle information if supported by existing data

Example:

```text
OpenAI
OPENAI

$XXX.XX
+X.XX%

+X.X% vs Mark
```

Do not display fake price changes.

If historical data does not exist, omit the change rather than inventing it.

---

# Phase 6 — Market Chart

Create the main market chart area.

The chart should represent the selected company's actual available market data.

Preferred controls:

```text
1D   1W   1M   3M   ALL
```

However:

**Do not create fake historical data.**

If the current Scouter data layer does not yet contain historical snapshots, implement the chart against the existing/approved historical data source or clearly show an appropriate empty state until historical data is available.

The chart should feel like a professional market terminal rather than a generic dashboard chart.

Display the current selected company only.

Switching companies must switch the chart.

---

# Phase 7 — Historical Snapshot System

If not already implemented, create a reusable snapshot mechanism for PreStocks market data.

A snapshot should capture relevant values such as:

```ts
{
  symbol,
  tokenPrice,
  markPrice,
  impliedValuation,
  markValuation,
  supply,
  timestamp
}
```

Use actual data.

The purpose is to allow Scouter to eventually answer:

> What changed?

and:

> How has this market moved?

Do not fabricate historical values to populate the chart.

Use the simplest reliable persistence mechanism appropriate for the existing project architecture.

---

# Phase 8 — Market Metrics

Under the chart, create a compact market-data section.

Display:

```text
Market Data

Token Price
Mark Price
Implied Valuation
Mark Valuation
Premium / Discount
Supply
```

Use the existing Scouter formatting utilities.

Large values should be compact and readable.

Example:

```text
$1.64T
$142.3B
+4.7%
```

Avoid long decimal values.

---

# Phase 9 — Premium / Discount Analysis

Calculate the selected company's difference from its mark using the actual values.

For example:

```ts
((tokenPrice - markPrice) / markPrice) * 100
```

Display it neutrally:

```text
+4.7% vs mark
```

or:

```text
-2.1% vs mark
```

Do not turn this into:

* Buy
* Sell
* Strong buy
* Undervalued
* Overvalued

unless those are explicitly presented as sourced external opinions.

Scouter should present the market relationship, not make investment recommendations.

---

# Phase 10 — Company Intelligence

Below the market section, provide a company information area.

Use information already available through Scouter's research/enrichment layer.

Potential fields:

* sector
* location
* founded year
* description
* website
* social links
* lifecycle/status
* relevant research links

Only render fields that actually exist.

Do not create empty placeholders for unavailable information.

---

# Phase 11 — Activity Timeline

Create a company-specific activity timeline.

Example:

```text
Activity

Today
Market data updated

Sep 24
Company announcement

Sep 21
New research source

Sep 18
Funding development
```

Each event should:

* have a timestamp/date
* have a short title
* optionally have a description
* link to its source where available

Use actual research/activity data.

Do not generate fake events.

---

# Phase 12 — What Changed

Create a prominent **What Changed?** section.

This should compare the selected company's latest available state with an earlier snapshot.

Example:

```text
What Changed?

Token price
+$8.21        +5.4%

Implied valuation
+$12.4B       +4.8%

New activity
3 new events
```

If no previous snapshot exists:

```text
Not enough historical data yet
```

Do not fabricate comparisons.

---

# Phase 13 — Intelligence Panel

Create a fixed/right-side Intelligence panel occupying approximately one-third of the desktop screen.

Header:

```text
Intelligence

OpenAI
```

The panel should make it obvious that the AI is currently operating in the context of the selected company.

When the user switches from OpenAI to Anthropic:

```text
Intelligence

Anthropic
```

The context should automatically change.

---

# Phase 14 — Company-Specific Chat

The chatbot should behave as an AI research assistant specifically for the currently selected PreStocks company.

Example questions:

```text
Why is the token trading above its mark?

What changed recently?

Give me a research brief on this company.

What are the latest developments?

Explain its current valuation.

What should I know about this company?

Compare this company with Anthropic.
```

The user should be able to type completely free-form questions.

Do not restrict the experience to predefined prompts.

---

# Phase 15 — AI Context Layer

When sending a question to Gemini, provide the relevant context for the currently selected company.

The context should include, where available:

```text
Company
Symbol
Description
Token price
Mark price
Implied valuation
Mark valuation
Supply
Historical snapshots
Company research
Recent activity
Events
Sources
```

Also provide relevant conversation history.

Do not send unrelated companies or unnecessary data unless the user's question requires it.

---

# Phase 16 — Cross-Company Questions

The AI must be able to temporarily reference another company when the user asks.

Example:

Current market:

```text
OpenAI
```

User:

> Compare this with Anthropic.

The AI should retrieve Anthropic's relevant Scouter data and answer the comparison.

However, the selected market should remain OpenAI.

The UI should make clear that OpenAI remains the active market.

---

# Phase 17 — AI Market Awareness

The chatbot should understand the market data currently visible on screen.

For example, if the screen shows:

```text
Token Price      $160
Mark Price       $153
Premium          +4.6%
```

and the user asks:

> Why is it above the mark?

the AI should receive those exact values from Scouter rather than independently inventing or estimating them.

The AI should explain the data using available research and clearly distinguish:

```text
Verified market data
Research/source information
AI interpretation
Unknowns
```

---

# Phase 18 — AI Guardrails

The Intelligence system must:

* Never fabricate market data.
* Never fabricate historical data.
* Never fabricate events.
* Never fabricate sources.
* Never claim direct equity ownership where the product represents economic exposure instead.
* Never give personalised buy/sell instructions.
* Never create investment rankings.
* Never present speculation as verified information.
* Clearly state when information is unavailable.
* Use Scouter's market data as the source of truth for Scouter metrics.

The AI is a **market research assistant**, not a trading adviser.

---

# Phase 19 — Contextual Suggested Questions

When the Intelligence panel is empty, show context-specific prompts.

For OpenAI:

```text
What changed recently?

Explain the current valuation.

Why is the token above the mark?

Give me a research brief.

What are the latest developments?
```

These should automatically change when the selected company changes.

Do not use generic prompts such as:

> "How can I help?"

---

# Phase 20 — Chat History

Maintain the conversation for the current session.

Example:

```text
User:
Tell me about OpenAI.

AI:
...

User:
What changed recently?

AI:
...
```

The AI should understand that the second question refers to OpenAI.

Switching companies should clearly establish a new market context.

Do not mix unrelated company conversations together.

If appropriate, reset or compartmentalise the conversation when the selected market changes.

---

# Phase 21 — Chat UI

The right panel should behave like a polished research assistant.

Requirements:

* scrollable conversation
* user/AI distinction
* Markdown support
* loading state
* disabled submit while processing
* Enter to submit
* Shift + Enter for newline
* auto-scroll to latest response
* clear input state
* graceful errors

The chat should remain usable while the market section is being scrolled.

---

# Phase 22 — Intelligence + Market Integration

Make the relationship between the two sides obvious.

For example:

```text
┌─────────────────────────────┬───────────────────┐
│                             │                   │
│        OPENAI MARKET        │    INTELLIGENCE   │
│                             │                   │
│      $XXX.XX                │    OpenAI         │
│                             │                   │
│       [ CHART ]             │    conversation   │
│                             │                   │
│                             │                   │
│    Market Data              │                   │
│    Activity                 │                   │
│                             │ [ Ask OpenAI... ] │
└─────────────────────────────┴───────────────────┘
```

The user should feel like the AI is **inside the market terminal**, not a separate chatbot pasted onto it.

---

# Phase 23 — Responsive Behaviour

Desktop:

```text
~66% Market
~34% Intelligence
```

Tablet:

* Reduce panel width appropriately.
* Preserve both experiences where practical.

Mobile:

Stack them intelligently:

```text
Company selector
Market header
Chart
Market data
Activity
What Changed
Intelligence
```

The chatbot should remain fully usable.

Do not allow the two-column layout to become cramped on mobile.

---

# Phase 24 — Loading and Empty States

Handle:

* company loading
* chart loading
* AI loading
* activity loading
* missing historical data
* missing company research
* API failure
* invalid symbol
* empty activity
* unavailable Gemini

Examples:

```text
Historical data is not available yet.
```

rather than rendering an artificial chart.

For an invalid route:

```text
Market not found
```

with a route back to Discover.

---

# Phase 25 — Performance

Avoid unnecessary requests.

When switching companies:

* fetch only the required company data
* update the market view
* update the AI context
* do not reload the entire application

Do not call Gemini automatically when the company changes.

Gemini should only run when the user submits a question.

Cache reusable research data where appropriate.

---

# Phase 26 — Navigation Integration

Add the Market Terminal to the existing Scouter navigation without breaking the existing structure.

Preferred navigation:

```text
Discover
Compare
Watchlist
Markets
```

The Intelligence experience lives inside the Market Terminal.

Do not create a second generic Intelligence page unless there is a clear existing reason to keep one.

---

# Phase 27 — Shareable Markets

Ensure each market has a unique URL:

```text
/market/openai
/market/anthropic
/market/spacex
```

The page should load correctly when opened directly.

The selected company should be recoverable entirely from the URL.

This makes individual market terminals shareable.

---

# Phase 28 — Final Testing

Test at minimum:

### Company selection

* Open OpenAI.
* Switch to Anthropic.
* Switch to SpaceX.
* Search for a company.
* Open a company directly by URL.

### Market data

* Token price renders correctly.
* Mark price renders correctly.
* Implied valuation renders correctly.
* Premium/discount calculates correctly.
* No hard-coded values.

### Historical data

* Existing snapshots render correctly.
* Missing history produces an honest empty state.
* No fabricated chart points.

### Intelligence

Ask:

```text
Tell me about this company.

What changed recently?

Why is the token above the mark?

Explain the valuation.

Compare this with Anthropic.
```

Verify that the AI receives the correct company context.

### Switching

* Start a conversation on OpenAI.
* Switch to Anthropic.
* Verify Anthropic becomes the active AI context.
* Verify OpenAI data does not accidentally remain as the primary context.

### Failure handling

* Invalid symbol.
* PreStocks API failure.
* Gemini failure.
* Missing research.
* Missing historical data.

### Responsive

Test:

* desktop
* tablet
* mobile

---

# Phase 29 — Final Product Audit

Before declaring the feature complete, verify:

* Market Terminal feels like a coherent product.
* One company is clearly the active market.
* Company switching is fast and intuitive.
* Market data is real.
* Historical data is real.
* No fabricated chart history exists.
* Activity is sourced.
* What Changed is based on actual snapshots.
* Intelligence is contextual to the selected market.
* Cross-company questions work.
* AI does not fabricate Scouter metrics.
* AI does not give investment recommendations.
* Each company has a shareable URL.
* Existing Scouter pages remain functional.
* No unnecessary dependencies were added.
* No existing functionality was removed.
* Production build succeeds.

## Final Product Direction

The finished experience should feel like:

> **A private-market trading terminal without the trading execution.**

The user selects a company, sees its live/current PreStocks market data and research context, observes what has changed, and can immediately ask an AI that understands **that specific market** questions about it.

The core loop should be:

```text
Select Market
      ↓
Inspect Market
      ↓
See What Changed
      ↓
Ask Intelligence
      ↓
Investigate
      ↓
Switch Market
      ↓
Repeat
```

Do not turn this into a generic AI chatbot.

The differentiator is the combination of:

**PreStocks market data + historical context + company intelligence + activity + contextual AI in one terminal.**
