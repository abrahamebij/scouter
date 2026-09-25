Build a completely separate page called **Intelligence** for Scouter.

The Intelligence page should function as a personalised AI research workspace where users can ask natural-language questions about the PreStocks companies, tokens, valuations, market activity, research, and their watchlist.

Do not redesign or unnecessarily modify the existing Scouter pages. Build this as a new feature that integrates with the existing data layer and design system.

### Phase 1 — Audit Existing Architecture

Before writing code:

* Inspect the existing Scouter application.
* Identify the current PreStocks data-fetching/data-transformation layer.
* Identify existing company, watchlist, and research components.
* Identify the existing Gemini integration if already implemented.
* Identify the current theme, typography, spacing, buttons, cards, and layout conventions.
* Reuse existing utilities and components where appropriate.
* Do not install packages automatically.
* Do not duplicate existing data-fetching logic.

Do not proceed with assumptions about the existing architecture. Adapt the implementation to what is actually present.

---

### Phase 2 — Intelligence Route

Create the new route:

```text
/intelligence
```

The page should feel substantially different from Discover, Compare, and Watchlist.

It should feel like an AI research workspace rather than a conventional dashboard.

Core structure:

```text
┌─────────────────────────────────────────────┐
│ Intelligence                                │
│                                             │
│                                             │
│        Ask anything about your              │
│        private-market research              │
│                                             │
│        [ suggested prompts ]                │
│                                             │
│                                             │
│─────────────────────────────────────────────│
│ Ask Scouter anything...              [Send] │
└─────────────────────────────────────────────┘
```

Use the existing Scouter visual language.

Keep the interface minimal and premium.

---

### Phase 3 — Empty State

When there is no conversation, create a strong empty state.

Title:

**Intelligence**

Supporting copy should communicate that the user can ask Scouter about the companies and assets available through PreStocks.

Do not use generic AI-copy such as:

> "How can I help you today?"

Instead make the experience explicitly about private-market research.

Include several clickable suggested prompts.

Examples:

* `Give me a research brief on OpenAI`
* `Compare OpenAI and Anthropic`
* `What changed for SpaceX recently?`
* `Explain Anduril's current valuation`
* `What companies are available on PreStocks?`
* `Analyse the companies in my watchlist`

The suggestions should populate the input and/or immediately submit the prompt according to the existing interaction pattern.

---

### Phase 4 — Chat Interface

Build the conversation interface.

Requirements:

* User messages aligned clearly apart from AI responses.
* AI responses should support Markdown.
* Proper spacing between conversational turns.
* Long responses must remain readable.
* Preserve conversation history during the current session.
* Auto-scroll to the latest response.
* Input remains easily accessible.
* Enter submits.
* Shift + Enter creates a new line.
* Disable submission while a request is processing.
* Show a subtle loading state while Gemini is generating.
* Allow the user to continue asking follow-up questions.

Do not make it look like a generic ChatGPT clone.

The visual identity should remain distinctly Scouter.

---

### Phase 5 — Gemini Intelligence Layer

Use the existing Gemini setup if one already exists.

If Gemini has not yet been configured, use the official Google GenAI JavaScript/TypeScript SDK already approved for this project.

The Gemini API key must remain server-side.

Never expose:

```text
GEMINI_API_KEY
```

to the browser.

Architecture:

```text
Intelligence UI
      ↓
Next.js API/server action
      ↓
Scouter context builder
      ↓
Gemini
      ↓
Structured response
      ↓
Intelligence UI
```

Do not call Gemini directly from client-side React code.

---

### Phase 6 — Scouter Context

Gemini must not behave like a generic chatbot.

Build a context layer containing relevant Scouter data.

The model should have access to:

* Current PreStocks products
* Company names
* Symbols
* Token prices
* Mark prices
* Implied valuations
* Mark valuations
* Supply
* Descriptions
* Contract addresses where relevant
* Company research data already available to Scouter
* Relevant recent activity/news when available
* User watchlist
* Current conversation context

Do not hard-code the current companies.

Always use the existing PreStocks data source.

---

### Phase 7 — Intelligent Context Selection

Do not blindly send the entire database to Gemini for every question.

Determine what information is relevant to the user's question.

For example:

```text
"Tell me about OpenAI"
        ↓
OpenAI company context

"Compare OpenAI and Anthropic"
        ↓
OpenAI + Anthropic context

"What is the most expensive token?"
        ↓
Relevant market-wide context

"What changed on my watchlist?"
        ↓
Watchlist + relevant activity context
```

Build a reusable context-builder service rather than putting this logic inside the page component.

---

### Phase 8 — Structured AI Responses

Do not rely entirely on unconstrained text generation.

Where useful, have Gemini return structured information such as:

```ts
{
  answer: string,
  companies: [],
  metrics: [],
  sources: [],
  followUpQuestions: []
}
```

The exact schema should match the application's needs.

The `answer` remains the main conversational response.

Structured fields allow the UI to render useful information alongside the response.

---

### Phase 9 — Financial Data Integrity

This is critical.

Gemini must **never invent Scouter market data**.

For values such as:

* token price
* mark price
* implied valuation
* mark valuation
* supply
* premium

use the actual Scouter/PreStocks data.

Gemini may explain or interpret the supplied data, but must not fabricate numbers.

Clearly distinguish:

```text
Verified Scouter data
AI interpretation
External/current research
Uncertainty
```

Never imply that token ownership represents direct equity ownership when that is not what the underlying PreStocks product represents.

---

### Phase 10 — Research Questions

The Intelligence page should support broad research questions.

Examples:

```text
"Give me a research brief on OpenAI."

"What is the difference between OpenAI and Anthropic?"

"Why is this token trading above its mark?"

"What should I know about Anduril?"

"Summarise the latest developments around SpaceX."

"Compare the valuations of the companies I'm watching."

"Explain this company to me like I'm new to private markets."
```

The AI should answer conversationally rather than forcing users through predefined workflows.

---

### Phase 11 — Contextual Data Cards

When an answer references a known Scouter company, render useful contextual information where appropriate.

For example:

```text
OpenAI
────────────────
Token Price       $XXX
Mark Price        $XXX
Implied Valuation $XXX
vs Mark           +X.X%
```

Do not add cards to every response.

Only render structured information when it materially improves the answer.

---

### Phase 12 — Company References

When the AI mentions a company that exists in Scouter:

* Make the company name clickable where appropriate.
* Link to the existing company page.
* Do not create duplicate company pages.
* Reuse existing routing conventions.

Example:

```text
"OpenAI currently has..."
       ↓
[OpenAI] → /company/OPENAI
```

---

### Phase 13 — Follow-up Intelligence

After an answer, optionally provide a small number of contextual follow-up prompts.

For example:

```text
Explore further

[Compare with Anthropic]
[Show recent activity]
[Explain the valuation]
```

These must be generated from the conversation context.

Avoid generic suggestions that appear after every response.

---

### Phase 14 — Watchlist Personalisation

If the user has a watchlist, Intelligence should understand it.

Examples:

```text
"Analyse my watchlist."

"Which companies on my watchlist changed recently?"

"Compare the companies I'm watching."

"Give me a brief on each company I'm tracking."
```

The AI should receive the user's watchlist symbols and resolve them against current Scouter data.

Do not store sensitive personal information.

Use the existing local watchlist implementation if that is how Scouter currently stores it.

---

### Phase 15 — Conversation State

Maintain the current conversation in client state.

Each message should contain something similar to:

```ts
{
  role: "user" | "assistant",
  content: string
}
```

Keep conversation context available for follow-up questions.

Example:

```text
User:
Tell me about OpenAI.

AI:
...

User:
How does that compare with Anthropic?

AI:
...
```

The second question should understand that "that" refers to OpenAI without requiring the user to repeat the company name.

Do not implement persistent cloud conversation storage unless it already exists in the application.

---

### Phase 16 — Error Handling

Handle:

* Gemini unavailable
* API request failure
* malformed Gemini response
* rate limits
* missing company data
* empty user input
* network failure
* timeout

The page should fail gracefully.

If Gemini is unavailable, clearly communicate the problem without breaking the rest of Scouter.

Never display raw API keys, stack traces, or internal errors to users.

---

### Phase 17 — AI Guardrails

The system instructions for Gemini must explicitly enforce:

* Do not fabricate facts.
* Do not fabricate sources.
* Do not fabricate financial metrics.
* Do not invent historical events.
* Do not present speculation as fact.
* Do not give personalised buy/sell instructions.
* Do not create investment recommendations.
* Do not rank companies as investments.
* Do not claim token ownership equals direct equity ownership.
* Distinguish verified data from interpretation.
* State uncertainty when information is unavailable.
* Use Scouter's actual data whenever answering questions about Scouter assets.

The AI is a **research and intelligence assistant**, not a financial adviser.

---

### Phase 18 — Source Handling

When external research is available through the existing Gemini/search architecture:

* Preserve useful source information.
* Display sources beneath the relevant answer.
* Make sources clickable.
* Do not fabricate URLs.
* Clearly distinguish external sources from Scouter's own data.

If no reliable source is available, do not create one.

---

### Phase 19 — Response Quality

Optimise the AI responses for research usefulness.

Avoid:

* unnecessary introductions
* repetitive disclaimers
* giant walls of text
* generic AI language
* excessive headings
* repeating the user's question

Prefer:

* concise explanations
* useful comparisons
* relevant numbers
* clear context
* citations/sources where available
* structured information when useful
* actionable research directions without giving investment instructions

---

### Phase 20 — Visual Polish

The Intelligence page should feel like a premium research terminal.

Use:

* Scouter charcoal background
* Off-white primary text
* Existing Scouter accent colour/tokens
* subtle borders
* restrained surfaces
* generous spacing
* strong typography
* minimal animations

Avoid:

* excessive gradients
* glowing AI effects
* giant illustrations
* unnecessary icons
* excessive rounded cards
* generic chatbot aesthetics
* over-designed dashboards

The interface should feel closer to a serious intelligence/research product than a consumer AI toy.

---

### Phase 21 — Responsive Design

Ensure Intelligence works properly on:

* desktop
* tablet
* mobile

On mobile:

* input remains easy to access
* messages do not overflow
* suggested prompts can horizontally scroll or wrap cleanly
* company cards remain readable
* navigation follows the existing Scouter mobile behaviour

---

### Phase 22 — Performance

Do not call Gemini unnecessarily.

Only make a request when the user submits a message.

Do not regenerate responses because of unrelated React renders.

Avoid sending unnecessary Scouter data to Gemini.

Use caching for reusable research data where appropriate.

Do not block the entire application while Gemini is processing.

---

### Phase 23 — Final Integration

Add Intelligence to the existing Scouter navigation.

The navigation should clearly expose:

```text
Discover
Compare
Watchlist
Intelligence
```

Do not change the existing navigation structure unnecessarily.

Ensure `/intelligence` can be opened directly.

---

### Phase 24 — Final Testing

Test the following:

1. Open Intelligence with no conversation.
2. Submit a basic company question.
3. Submit a follow-up question.
4. Compare two companies.
5. Ask a market-wide question.
6. Ask about the watchlist.
7. Ask a question about an unavailable company.
8. Submit an empty message.
9. Test Gemini failure.
10. Test malformed/empty AI response.
11. Test mobile layout.
12. Test long responses.
13. Test rapid submissions.
14. Verify no Gemini API key reaches the client.
15. Verify existing Scouter pages still work.

---

### Phase 25 — Final Product Audit

Before declaring the feature complete, verify:

* `/intelligence` works independently.
* Existing Scouter functionality is unchanged.
* Gemini calls are server-side.
* PreStocks data remains the source of truth for market metrics.
* AI does not fabricate numbers.
* Company links work.
* Watchlist context works.
* Follow-up questions preserve context.
* Errors are handled gracefully.
* Mobile layout works.
* No unnecessary dependencies were added.
* No hard-coded current PreStocks companies were introduced.
* No xPrime/xStocks functionality was copied into the feature.
* No unsupported trading functionality was added.
* Production build succeeds.

The final result should make Scouter feel like more than a PreStocks dashboard.

**Scouter Intelligence should feel like a private-market research assistant that understands the entire Scouter ecosystem.**
