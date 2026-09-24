# Scouter Design Theme

> Reference document for any agent continuing work on this codebase.
> Describes the current design system after the **Charcoal Terminal** refactor.

---

## Design Direction

| Concern | Value |
|---|---|
| Aesthetic | Financial / data terminal. Minimal, dense, no decoration. |
| Background | Pure charcoal black — no green tint |
| Primary UI color | Off-white (`#f5f5f0`) — buttons, active borders, primary text |
| Accent color | Soft emerald green (`#6ee7b7`) — data highlights only |
| Glow effects | **None.** All removed. Sharp shadows only (`shadow-sm`, `shadow-md`). |
| Borders | Off-white/zinc at very low opacity (`border-outline-variant/20`) |
| Typography | Plus Jakarta Sans (headline), Inter (body), Space Grotesk (label) |

---

## Color Token System

All tokens are defined in `app/src/app/globals.css` inside `@theme inline { … }`.
Tailwind v4 automatically generates `text-*`, `bg-*`, `border-*` utilities from these.

### Surface hierarchy (charcoal, no green tint)

| Token | Hex | Usage |
|---|---|---|
| `--color-surface` | `#141414` | Page background (`bg-surface`) |
| `--color-surface-dim` | `#111111` | Deepest background layer |
| `--color-surface-container-lowest` | `#0d0d0d` | Recessed wells, code blocks |
| `--color-surface-container-low` | `#1a1a1a` | Cards, panels |
| `--color-surface-container` | `#1f1f1f` | Inline containers |
| `--color-surface-container-high` | `#252525` | Elevated cards, dropdowns |
| `--color-surface-container-highest` | `#2e2e2e` | Top-most surfaces, hover states |
| `--color-surface-bright` | `#2a2a2a` | Borders, dividers |
| `--color-background` | `#141414` | Same as surface |

### Primary (off-white) — structural UI chrome

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#f5f5f0` | **Button backgrounds, active outlines** |
| `--color-on-primary` | `#141414` | Text/icons ON primary buttons |
| `--color-primary-container` | `#e8e8e3` | Light container variant |
| `--color-primary-fixed` | `#ffffff` | Pure white variant |
| `--color-primary-fixed-dim` | `#ededea` | Slightly dimmed white |

**Rule:** `bg-primary` → off-white button. `text-primary` → off-white text on dark bg.  
Used for: primary CTA buttons, active nav highlight text, hover link text.  
**Not used** for data values or accents.

### Accent (soft green) — data highlights only

| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#6ee7b7` | Implied valuation values, live indicator dot, active bookmark, "Live SPL" badge |
| `--color-accent-dim` | `#34d399` | Slightly brighter accent variant |
| `--color-on-accent` | `#0d2e1f` | Text ON accent backgrounds |

**Rule:** `text-accent` / `bg-accent/8` / `border-accent/20` for financial data emphasis.  
Green is **never** used for structural chrome (nav, buttons, borders) — only data.

### Secondary (muted blue) — discount badges

| Token | Hex | Usage |
|---|---|---|
| `--color-secondary` | `#93c5fd` | Discount/negative premium badge text |
| `--color-on-secondary` | `#1e3a5f` | Text on secondary bg |

### Text colors

| Token | Hex | Usage |
|---|---|---|
| `--color-on-surface` | `#ededea` | Primary body text |
| `--color-on-surface-variant` | `#a3a3a3` | Secondary/muted text, labels |
| `--color-on-background` | `#ededea` | Same as on-surface |

### Outline / border colors

| Token | Hex | Usage |
|---|---|---|
| `--color-outline` | `#3f3f3f` | Medium borders (focus rings, hover) |
| `--color-outline-variant` | `#272727` | Default subtle borders |

---

## What Each Tailwind Class Maps To

| Class | Result |
|---|---|
| `bg-surface` | `#141414` charcoal bg |
| `bg-surface-container-low` | `#1a1a1a` card bg |
| `bg-primary` | `#f5f5f0` off-white (primary button bg) |
| `text-on-primary` | `#141414` charcoal (text on off-white buttons) |
| `text-primary` | `#f5f5f0` off-white text |
| `text-accent` | `#6ee7b7` soft green (data values only) |
| `bg-accent/8` | `rgba(110, 231, 183, 0.08)` very subtle green tint |
| `border-accent/20` | soft green border at 20% |
| `text-on-surface` | `#ededea` near-white body text |
| `text-on-surface-variant` | `#a3a3a3` muted grey text |
| `border-outline-variant/20` | `rgba(39, 39, 39, 0.2)` subtle dark border |
| `border-outline/60` | `rgba(63, 63, 63, 0.6)` focus/hover border |

---

## Component Map

### Custom UI (`app/src/components/ui/`)

| File | Purpose | Notes |
|---|---|---|
| `Button.tsx` (uppercase) | Custom button wrapper | 4 variants: `primary` (off-white), `secondary` (charcoal + border), `tertiary` (link), `ghost` (transparent). No glows. |
| `button.tsx` (lowercase) | **shadcn/ui Button** | Installed by shadcn init. Uses `@base-ui/react`. Can be used for new UI if needed. |
| `Dropdown.tsx` | Custom select dropdown | Neutral hover borders, neutral selected option bg. |
| `Toast.tsx` | Toast notification context | Success toasts use `text-accent` / `border-accent/25`. Custom slide-in animation. |
| `MaterialIcon.tsx` | Google Material Symbols wrapper | Unchanged. |

### shadcn/ui setup

shadcn was initialized with `npx shadcn@latest init -d --css-variables`. It uses **shadcn v4 with Base UI** (not Radix).

- `components.json` — shadcn config at `app/components.json`
- `src/lib/utils.ts` — shadcn `cn()` utility (classname merger)
- `src/components/ui/button.tsx` (lowercase) — shadcn button component

To add more shadcn components:
```bash
cd app
node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" shadcn@latest add <component>
```
> Note: `npx` via PowerShell is blocked by execution policy. Use the `node ... npx-cli.js` form above.

### Prestocks components (`app/src/components/prestocks/`)

| Component | Key colors | Notes |
|---|---|---|
| `ProductCard.tsx` | Implied valuation: `text-accent` | Card hover: neutral border, black shadow only |
| `ProductGrid.tsx` | Reset button: `text-on-surface` | Filter/sort controls are neutral |
| `ProductSearch.tsx` | Focus: `border-outline/60 ring-outline/20` | No green focus ring |
| `ProductFilters.tsx` | Active pill: `text-on-surface font-bold` | No green on active state |
| `MarketStatsStrip.tsx` | Largest valuation: `text-accent`, "Live SPL" badge: `text-accent/80 bg-accent/8` | |
| `CompanyHeader.tsx` | "PreStocks Asset" badge: `text-accent/80 bg-accent/8 border-accent/15` | All links neutral on hover |
| `TokenMetrics.tsx` | Implied valuation: `text-accent` | All other metrics neutral |
| `CompareTable.tsx` | Implied valuation: `text-accent`, symbol fallback: `text-on-surface-variant/60` | All link hovers neutral |
| `PremiumBadge.tsx` | Positive: `bg-accent/8 text-accent border-accent/20`, Negative: `bg-secondary/10 text-secondary` | |
| `WatchlistButton.tsx` | Active: `bg-accent/10 border-accent/25 text-accent` | Only accent usage for active state |
| `WatchlistFeed.tsx` | "Live Matched" badge: `text-accent bg-accent/8`, pulse dot: `bg-accent`, CTA button: `bg-primary text-on-primary` | |
| `SkeletonCard.tsx` | Pure surface tokens | Unchanged |
| `ErrorState.tsx` | Retry button: `text-on-surface` | Error icon uses `text-error` |

### Layout components

| Component | Key changes |
|---|---|
| `Navbar.tsx` | Active nav: `text-on-surface bg-surface-container-high` (no green). Logo icon: neutral border. Pulse dot: `bg-accent`. Brand subtitle: `text-accent/70`. |
| `Footer.tsx` | All hover links: `hover:text-on-surface`. API URL in footer: `text-accent/80`. Brand badge: neutral. |

---

## Pages

| Page | Key changes |
|---|---|
| `app/page.tsx` | Hero title: solid `text-primary` (off-white) — no gradient. Combined valuation stat: `text-accent`. CTA button: `bg-primary text-on-primary` no glow. |
| `discover/page.tsx` | Breadcrumb: neutral. Pulse dot: `bg-accent`. |
| `compare/page.tsx` | Breadcrumb: neutral. Pulse dot: `bg-accent`. |
| `watchlist/page.tsx` | Breadcrumb: neutral. Pulse dot: `bg-accent`. |
| `company/[symbol]/page.tsx` | All link hovers: `hover:text-on-surface`. Compare button: `text-on-surface`. |

---

## globals.css Structure

```
@import "tailwindcss";
@import "tw-animate-css";       ← added by shadcn
@import "shadcn/tailwind.css";  ← added by shadcn

@custom-variant dark (&:is(.dark *));  ← added by shadcn

/* input spinner hide */
/* custom-check / custom-radio */

@theme inline {
  /* Surface tokens — charcoal */
  /* Primary tokens — off-white */
  /* Accent tokens — soft green */
  /* Secondary, Tertiary, Error, On-surface, Outline tokens */
  /* Font tokens */
  /* shadcn radius tokens */
  /* shadcn component color mappings (border, input, ring, card, popover, destructive, muted) */
}

/* body base styles */
/* ::selection */
/* scrollbar */
/* .material-symbols-outlined */
/* .glass-header, .glass-card */
/* .recessed-pocket */
/* .card-texture, .chart-grid */
/* .no-scrollbar */
/* .input-no-spin */
/* .terminal-checkbox (off-white checked state, neutral focus ring) */
/* @keyframes quote-shimmer, quote-pulse */
/* @keyframes slide-in-from-right */

/* shadcn :root variables (radius, border, input, ring, destructive, muted, card, popover) */
```

### Removed from globals.css (do not re-add)

- `.primary-gradient` — green linear gradient `#4ef2b4 → #1fd59a` with rgba green box-shadow glows
- `.premium-shadow` — `box-shadow: 0 0 60px -15px rgba(78, 242, 180, 0.1)`
- `.mesh-glow` — `radial-gradient(rgba(78, 242, 180, 0.05))`
- `.yield-pulse-mesh` — blue-ish radial gradient
- `.pill-hover` — green hover background/border
- Green `box-shadow` from `.terminal-checkbox:focus-visible`
- Green `linear-gradient` from `.terminal-checkbox:checked`
- All `--color-primary` green hex values (`#4ef2b4`, `#1fd59a`, `#5cfdbf`, `#34e0a4`)

---

## Rules for Adding New UI

1. **Backgrounds**: use `bg-surface-container-*` variants. Never use inline hex for bg.
2. **Borders**: use `border-outline-variant/20` (default) or `border-outline/50` (hover/focus). Never `border-primary/*` for structural borders (that is now off-white, which is fine for active indicators but confusing for data).
3. **Buttons**: CTA → `bg-primary text-on-primary hover:brightness-95 shadow-sm`. Secondary → `bg-surface-container-high border border-outline-variant/40`. No `shadow-primary`, no green glow.
4. **Data values** (prices, valuations, key metrics): use `text-accent` for the single most important highlighted value per card. All other values: `text-on-surface` or `text-on-surface-variant`.
5. **Live indicators / pulse dots**: `bg-accent animate-pulse` only.
6. **Badges for status**: positive data → `bg-accent/8 text-accent border-accent/20`. Negative → `bg-secondary/10 text-secondary border-secondary/25`. Neutral → `bg-surface-container-high text-on-surface-variant border-outline-variant/30`.
7. **Focus rings**: `focus:border-outline/60 focus:ring-1 focus:ring-outline/20`. Never `focus:border-primary` or `focus:ring-primary`.
8. **Hover links**: `hover:text-on-surface`. Never `hover:text-primary` (reserved for structural active state only).
9. **No box-shadow with colored rgba**. Only `shadow-sm`, `shadow-md`, `shadow-[0_8px_30px_rgba(0,0,0,0.45)]` (black only).
10. **No linear-gradient backgrounds** except `card-texture` (white dots) and `chart-grid` (charcoal dots).

---

## shadcn/ui Notes

- shadcn v4 uses **Base UI primitives** (`@base-ui/react`) instead of Radix UI.
- The `button.tsx` (lowercase) shadcn component is available but currently unused by the app. The custom `Button.tsx` (uppercase) is what all components import.
- To add a shadcn component: `node "C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js" shadcn@latest add <name>` from `app/`.
- shadcn's CSS variables (`:root` block at bottom of `globals.css`) are scoped to component internals only. They do NOT control the app's main design tokens — those are in `@theme inline`.

---

## Outstanding / Not Done

- The shadcn `button.tsx` (lowercase) is installed but not wired to anything. If you want to migrate a component to use it, note it has a different API (uses `ButtonPrimitive` from `@base-ui/react`).
- `Dropdown.tsx` was restyled but not replaced with a shadcn `Select`. If you want to replace it, run `shadcn add select` and update all import sites.
- No dark/light mode toggle — the app is always dark (charcoal). The `html` element has `class="dark"` set in `layout.tsx`.

---

## File Locations

```
app/
  src/
    app/
      globals.css              ← design tokens + utility classes
      layout.tsx               ← html.dark class, font variables
      page.tsx                 ← home page (hero, market stats)
      discover/page.tsx
      compare/page.tsx
      watchlist/page.tsx
      company/[symbol]/page.tsx
    components/
      ui/
        Button.tsx             ← custom button (uppercase, use this)
        button.tsx             ← shadcn button (lowercase, unused)
        Dropdown.tsx           ← custom select dropdown
        Toast.tsx              ← toast context + provider
        MaterialIcon.tsx       ← Material Symbols wrapper
      layout/
        Navbar.tsx
        Footer.tsx
      prestocks/
        ProductCard.tsx        ← asset card (implied val = text-accent)
        ProductGrid.tsx        ← search + filter + card grid
        ProductSearch.tsx      ← search input
        ProductFilters.tsx     ← filter pills + sort select
        MarketStatsStrip.tsx   ← 4-stat overview strip
        CompanyHeader.tsx      ← company detail header
        TokenMetrics.tsx       ← 4+2 metric cards
        CompareTable.tsx       ← side-by-side comparison table
        WatchlistFeed.tsx      ← watchlist card grid
        WatchlistButton.tsx    ← bookmark toggle button
        PremiumBadge.tsx       ← premium/discount % badge
        SkeletonCard.tsx       ← loading placeholder
        ErrorState.tsx         ← error display with retry
    lib/
      utils.ts                 ← shadcn cn() utility
      prestocks/
        api.ts, types.ts, transforms.ts, format.ts, watchlist.ts
  components.json              ← shadcn config
  package.json
```
