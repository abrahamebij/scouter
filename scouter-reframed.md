# Scouter — New Scope & Phase-by-Phase Coding Agent Prompt

## Context

Scouter is being reframed as both:

1. **A private-market research and intelligence application for normal users**
2. **A developer tool for building applications with Scouter / PreStocks data**

The existing application already contains the main user-facing functionality:

* Scout Report
* Company Details
* AI Chat / Intelligence
* Market + Intelligence
* Discover
* Compare
* Watchlist
* Other existing dashboard functionality

Do **not** throw away or rebuild these features. The goal is to reorganise the existing application around the new product structure and add the developer-facing layer.

---

# Critical Instructions

### 1. DO NOT install packages

**Do not run npm install, pnpm add, yarn add, bun add, or any package installation command.**

Do not modify package.json to add dependencies unless absolutely necessary for code compatibility.

I will install all required packages myself.

If a dependency is required, clearly state:

```text
DEPENDENCY REQUIRED:
package-name
```

and continue working without installing it.

---

### 2. Do not unnecessarily rebuild existing functionality

First inspect the existing repository thoroughly.

Reuse:

* Existing components
* Existing API/data layer
* Existing Gemini integration
* Existing pages
* Existing styling system
* Existing types
* Existing utilities
* Existing market functionality

Only refactor where required by the new structure.

Do not remove existing functionality unless explicitly instructed.

---

### 3. No unauthenticated application access

Scouter will be an authenticated application.

Unauthenticated users must not be able to access the dashboard or its protected functionality.

The authentication implementation will eventually use Firebase.

Do not invent a second authentication system.

If Firebase is not yet configured, build the application architecture so Firebase Authentication can be integrated cleanly, using an appropriate auth abstraction/provider where necessary.

Do not install Firebase yourself.

---

### 4. Firebase database

Firebase will be used for persistent user data.

Potential persisted data includes:

* User profile
* Watchlists
* Saved research
* User preferences
* API keys
* Other user-specific settings

Do not create a competing database architecture.

If Firebase is not yet configured, create the necessary interfaces/services in a way that makes Firebase integration straightforward.

Do not install Firebase packages.

---

### 5. Separate npm tooling workspace

There will be a **separate folder outside the main Scouter application** for the developer tooling / npm package.

Do not create the npm package inside the main application's source tree.

I will provide/create the separate folder.

The npm tooling should eventually contain the Scouter SDK and related developer tooling.

---

# NEW PRODUCT STRUCTURE

The primary navbar should now contain only:

```text
Dashboard
Docs
```

Nothing else should remain as a primary navbar item.

---

# Dashboard Structure

The Dashboard is the authenticated Scouter application.

It should contain a sidebar.

The sidebar should contain the existing application sections that previously appeared in the navbar, plus account/settings functionality.

Conceptually:

```text
SCOUTER

Dashboard
────────────────────

Research
  Scout Report
  Discover
  Companies
  Compare

Intelligence
  AI Chat
  Market + Intelligence

Portfolio / Tracking
  Watchlist

────────────────────

Settings
  Profile
  API Keys
```

Use the application's existing feature names where appropriate rather than blindly copying the example structure above.

The important rule is:

> Existing application functionality moves into the Dashboard sidebar rather than disappearing.

The sidebar should be the primary navigation for the authenticated application.

---

# Top-level application structure

The intended product architecture is:

```text
Scouter
│
├── Dashboard
│   │
│   ├── Scout Report
│   ├── Discover
│   ├── Companies
│   ├── Compare
│   ├── AI Chat
│   ├── Market + Intelligence
│   ├── Watchlist
│   │
│   └── Settings
│       ├── Profile
│       └── API Keys
│
└── Docs
    │
    ├── Introduction
    ├── API
    ├── SDK
    ├── Authentication
    ├── Markets
    ├── Examples
    └── AI Developer Assistant
```

The exact routes can follow the existing application's conventions.

---

# PHASE 1 — Repository Audit

Before modifying anything, inspect the entire repository.

Identify:

* Current framework/version
* Existing routes
* Existing layouts
* Existing navbar
* Existing sidebar components
* Existing authentication code
* Existing Gemini integration
* Existing PreStocks API integration
* Existing market data layer
* Existing user state
* Existing watchlist implementation
* Existing settings functionality
* Existing components that can be reused
* Existing dependencies
* Existing environment variables
* Existing API routes/server actions
* Existing styling/design system

Do not modify code during this phase.

Produce a concise architecture summary and identify which existing files should be reused.

---

# PHASE 2 — Application Architecture

Refactor the application around the new product structure.

The application should conceptually become:

```text
Public
└── Authentication

Authenticated
└── Dashboard
    ├── Research
    ├── Intelligence
    ├── Tracking
    └── Settings

Public/Documentation
└── Docs
```

Ensure the architecture supports:

* authenticated dashboard access
* protected routes
* shared dashboard layout
* persistent sidebar
* independent documentation area
* future Firebase integration

Do not introduce unnecessary architectural complexity.

---

# PHASE 3 — Authentication Boundary

Implement the application's authentication boundary.

Requirements:

* Unauthenticated users cannot access Dashboard routes.
* Authenticated users can access Dashboard routes.
* Authentication state should be accessible throughout the dashboard.
* Loading/authentication states must be handled cleanly.
* Avoid flashing protected dashboard content to unauthenticated users.

Prepare the architecture for Firebase Authentication.

If Firebase is not currently configured, create clean integration points rather than installing or configuring packages automatically.

Do not create a fake authentication system just to make the UI appear complete.

---

# PHASE 4 — New Global Navbar

Replace the existing top-level navigation with:

```text
Dashboard
Docs
```

The navbar should remain minimal.

Do not put individual research/market features back into the global navbar.

The Dashboard itself owns those navigation items through its sidebar.

Preserve the existing Scouter branding and visual language.

---

# PHASE 5 — Dashboard Shell

Create/refactor the authenticated Dashboard layout.

The dashboard should contain:

* Sidebar
* Main content area
* Existing Scouter visual identity
* Responsive behaviour
* User/account access
* Settings access

The sidebar should contain the application's existing major features.

Suggested organisation:

```text
Dashboard

Research
  Scout Report
  Discover
  Companies
  Compare

Intelligence
  AI Chat
  Market + Intelligence

Tracking
  Watchlist

Settings
  Profile
  API Keys
```

Adjust labels based on the existing application's actual functionality.

Do not duplicate routes or features unnecessarily.

---

# PHASE 6 — Move Existing Features into Dashboard

Move/reorganise existing pages so they are accessible from the Dashboard sidebar.

The following existing functionality must remain available:

* Scout Report
* Company Details
* Discover
* Compare
* Watchlist
* AI Chat
* Market + Intelligence
* Any other currently implemented core functionality

Do not rewrite their business logic unless required.

The goal is primarily:

```text
Existing feature
       ↓
Dashboard sidebar
       ↓
Existing functionality
```

not:

```text
Existing feature
       ↓
Complete rewrite
```

---

# PHASE 7 — Settings

Create a Settings area within the Dashboard.

Settings should contain at minimum:

```text
Settings
├── Profile
└── API Keys
```

## Profile

Display the authenticated user's information.

Prepare the UI for Firebase-backed profile information.

Possible fields:

* Name
* Email
* Profile image/avatar
* Account creation information if available

Do not fabricate user information.

---

## API Keys

Create an API key management interface.

The UI should support the future ability to:

* Create API keys
* View existing keys
* Revoke/delete keys
* Copy keys
* Display creation metadata
* Display last-used metadata if available

Security requirements:

* Never expose secret API keys unnecessarily.
* Do not store API secrets in localStorage.
* Do not log API keys.
* Do not expose server-side secrets to the client.
* Treat generated API keys as sensitive credentials.

If actual API-key persistence is not yet connected to Firebase, build the UI and service abstraction without inventing a fake persistence layer.

---

# PHASE 8 — Firebase Data Architecture Preparation

Prepare the application for Firebase-backed persistence.

Do not install Firebase packages.

Define a clean abstraction for user-specific persistence.

The architecture should eventually support:

```text
User
│
├── Profile
├── Watchlists
├── Saved Research
├── Preferences
└── API Keys
```

Avoid coupling every React component directly to Firebase.

Prefer:

```text
UI
 ↓
Application/service layer
 ↓
Firebase
```

This will make future changes easier.

---

# PHASE 9 — Developer Tooling Workspace

There will be a separate folder for the npm tooling.

Do not create it inside the main Scouter application.

The developer tooling should eventually contain:

```text
scouter-tooling/
│
├── sdk/
│   ├── package.json
│   ├── src/
│   └── ...
│
└── ...
```

The exact structure should be determined after inspecting the tooling requirements.

The first SDK should remain deliberately small.

It should provide developers with convenient access to Scouter's API.

Conceptually:

```ts
import { Scouter } from "@scouter/sdk";

const scouter = new Scouter();

const market = await scouter.market("OPENAI");
```

Potential SDK methods:

```ts
scouter.markets()

scouter.market("OPENAI")

scouter.market("OPENAI").history()

scouter.market("OPENAI").events()
```

Do not over-engineer this.

The SDK should be a thin, typed wrapper around Scouter's API.

---

# PHASE 10 — Scouter Developer API

Expose the core data required by developers through clean API endpoints.

Potential structure:

```text
GET /api/markets
GET /api/markets/:symbol
GET /api/markets/:symbol/history
GET /api/markets/:symbol/events
```

Use the existing Scouter/PreStocks data layer.

Do not create duplicate data sources.

Do not hard-code current market values.

The API should return clean, predictable JSON.

Example:

```json
{
  "symbol": "OPENAI",
  "tokenPrice": 160.28,
  "markPrice": 152.99,
  "impliedValuation": 141807375452,
  "markValuation": 135354898004,
  "supply": 11805.81
}
```

Use the actual application's available fields.

Do not expose unsupported or fabricated fields.

---

# PHASE 11 — Developer API Explorer

Create an API Explorer inside the Docs/developer experience.

It should allow developers to understand and test Scouter's API.

For each endpoint show:

* HTTP method
* Endpoint
* Description
* Parameters
* Example request
* Example response
* Copy button
* cURL example where useful

Example:

```text
GET /api/markets/:symbol

Get market information for a specific PreStock.

Parameter:
symbol — market symbol

Example:

GET /api/markets/OPENAI
```

If practical, include a simple "Try it" interaction.

Do not build a complicated Postman clone.

---

# PHASE 12 — AI Developer Assistant

Scouter already has an AI intelligence layer.

Extend it for developers.

The Developer Assistant should understand:

* Scouter API
* Scouter SDK
* API endpoints
* SDK methods
* Response schemas
* Authentication requirements
* Example usage
* PreStocks market concepts

Its purpose is:

> Help developers build applications with Scouter.

Examples of requests:

```text
"How do I get OpenAI's current market data?"

"Give me a TypeScript example using the SDK."

"How can I monitor a market's premium to mark?"

"Show me how to retrieve all available markets."

"Create a simple React component that displays a market."
```

The assistant should generate practical code using the actual Scouter API/SDK.

It must not invent SDK methods or endpoints.

Ground its answers in the actual documentation and implementation.

---

# PHASE 13 — Documentation

The Docs section is extremely important.

It should not be a generic marketing page.

It should function as actual developer documentation.

The documentation should contain:

## 1. Introduction

Explain:

* What Scouter is
* What Scouter provides
* Who the developer tools are for
* Relationship between Scouter and PreStocks
* What developers can build

Position it clearly:

> Scouter provides structured access to PreStocks market intelligence so developers can build applications, dashboards, automations and AI-powered experiences around private-market assets.

Avoid claiming Scouter provides direct ownership of underlying companies.

---

## 2. Quickstart

A developer should be able to understand the basic workflow quickly.

Include:

```text
1. Create a Scouter account
2. Create an API key
3. Install the SDK
4. Initialise Scouter
5. Fetch a market
```

Example:

```bash
npm install @scouter/sdk
```

Then:

```ts
import { Scouter } from "@scouter/sdk";

const scouter = new Scouter({
  apiKey: process.env.SCOUTER_API_KEY
});

const market = await scouter.market("OPENAI");

console.log(market);
```

Use the actual SDK API once implemented.

---

## 3. Authentication

Document:

* API keys
* How to create an API key
* Where API keys should be stored
* Environment variables
* Server-side usage
* Security recommendations
* What not to expose publicly

Example:

```env
SCOUTER_API_KEY=your_key_here
```

Clearly warn developers not to commit secrets to GitHub or expose secret API keys in browser code.

---

## 4. Markets API

Document:

```text
GET /api/markets
GET /api/markets/:symbol
```

Explain:

* Endpoint
* Parameters
* Response schema
* Example response
* Errors

---

## 5. Historical Data

If the application actually provides historical data, document:

```text
GET /api/markets/:symbol/history
```

Explain:

* Supported periods
* Returned fields
* Timestamp format
* Example response

If historical data is not actually available yet, do not document it as though it exists.

---

## 6. Events

If event/activity data is implemented:

```text
GET /api/markets/:symbol/events
```

Document:

* Event structure
* Event types
* Timestamp
* Source information
* Example response

Again, only document functionality that actually exists.

---

## 7. SDK

Document:

```ts
new Scouter()

scouter.markets()

scouter.market(symbol)

scouter.market(symbol).history()

scouter.market(symbol).events()
```

For every method include:

* Purpose
* Parameters
* Return value
* Example
* Error behaviour

---

## 8. Examples

Include practical examples such as:

### Market dashboard

Retrieve a market and display:

* Token price
* Mark price
* Implied valuation
* Premium/discount

### Market monitoring

Retrieve market data periodically and detect changes.

### React integration

Show how a developer could use Scouter inside a React/Next.js application.

### AI application

Show how Scouter market data could be passed into an AI application.

Do not provide investment recommendations as examples.

---

## 9. AI Developer Assistant

Explain how developers can use Scouter's AI assistant to:

* Learn the API
* Generate SDK examples
* Understand response schemas
* Create integrations
* Troubleshoot implementation problems

---

## 10. Webhooks / Alerts

Only document this section if the functionality is actually implemented.

If implemented, explain:

* Creating an alert
* Supported conditions
* Webhook payload
* Security
* Example receiver

Do not document a feature that doesn't exist merely because it is planned.

---

# PHASE 14 — Documentation UI

The Docs interface should feel like proper developer documentation.

Recommended structure:

```text
Docs
│
├── Introduction
├── Quickstart
├── Authentication
├── API
│   ├── Markets
│   ├── History
│   └── Events
├── SDK
├── Examples
└── AI Developer Assistant
```

Use a documentation sidebar/navigation.

Make code examples easy to read and copy.

Prioritise usability over visual decoration.

---

# PHASE 15 — Developer Experience Consistency

Ensure the Developer experience and normal Scouter experience feel like one product.

Normal user:

```text
Dashboard
   ↓
Research
   ↓
Intelligence
   ↓
Market
```

Developer:

```text
Docs
   ↓
API
   ↓
SDK
   ↓
Build
```

The underlying data should remain consistent.

A market shown in the dashboard should correspond to the same market returned through the API.

---

# PHASE 16 — Security Review

Before finishing, inspect the implementation for:

* Exposed Gemini API key
* Exposed Firebase credentials/secrets
* Exposed Scouter API secrets
* API keys in client bundles
* Secrets in localStorage
* Unprotected API routes
* Unauthenticated dashboard access
* Sensitive data appearing in logs
* Incorrect CORS behaviour
* Missing server-side validation

Do not make security claims that cannot be verified.

---

# PHASE 17 — Responsive Behaviour

Verify:

### Desktop

```text
Navbar
────────────────────────────
Sidebar │ Dashboard
        │
        │ Content
```

### Mobile

The sidebar should collapse into an appropriate mobile navigation pattern.

Docs should also remain usable on mobile.

Developer code examples should not overflow the entire page.

---

# PHASE 18 — Final Product Audit

Verify the complete product:

### Authentication

* [ ] Unauthenticated users cannot access Dashboard
* [ ] Authenticated users can access Dashboard
* [ ] Authentication state is handled cleanly

### Dashboard

* [ ] Sidebar exists
* [ ] Existing functionality is accessible
* [ ] Scout Report works
* [ ] Company Details work
* [ ] Discover works
* [ ] Compare works
* [ ] Watchlist works
* [ ] AI Chat works
* [ ] Market + Intelligence works

### Settings

* [ ] Profile exists
* [ ] API Keys exists
* [ ] Sensitive information is handled safely

### Developer

* [ ] API endpoints work
* [ ] API Explorer works
* [ ] SDK structure is ready
* [ ] Developer Assistant understands actual API/SDK functionality
* [ ] No invented endpoints or SDK methods

### Docs

* [ ] Introduction
* [ ] Quickstart
* [ ] Authentication
* [ ] API reference
* [ ] SDK reference
* [ ] Examples
* [ ] AI Developer Assistant documentation

### Product structure

* [ ] Global navbar contains only Dashboard and Docs
* [ ] Dashboard features are inside the sidebar
* [ ] No redundant navigation
* [ ] No unauthenticated dashboard access

### Engineering

* [ ] No unnecessary dependencies installed
* [ ] No packages installed by the agent
* [ ] No hard-coded current market data
* [ ] No fabricated API responses
* [ ] No secrets committed
* [ ] Production build succeeds
* [ ] Existing functionality has not been unnecessarily broken

---

# FINAL IMPLEMENTATION PRINCIPLE

Do not treat this as a request to build an entirely new product.

The existing Scouter application is already the foundation.

The task is to evolve it into:

```text
                         SCOUTER
                            │
              ┌─────────────┴─────────────┐
              │                           │
          DASHBOARD                     DOCS
              │                           │
       Research & Intel              Developer Platform
              │                           │
       ┌──────┼──────┐              ┌─────┼─────┐
       │      │      │              │     │     │
     Scout  Market  AI            API   SDK    AI
     Report Intel   Chat         Explorer      Assistant
```

The core idea is:

> **Scouter helps people understand private-market assets and gives developers the tools to build on top of that intelligence.**

Prioritise working functionality, clear architecture and a convincing developer experience over adding unnecessary features.

Do not expand the scope beyond this specification without explicit instruction.
