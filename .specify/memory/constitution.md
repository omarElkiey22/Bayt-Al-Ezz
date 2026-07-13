<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)

  Modified principles: N/A (initial version, no prior principles)

  Added sections:
    - Core Principles (8 principles: Spec-First, No-Build-Step,
      Hand-Built SVG, Separation-of-Concerns, Mobile-First-RTL,
      Single-Responsibility, Testable-Pure-Logic, Soft-Delete)
    - Locked Tech Stack
    - Repository & Architecture Structure
    - Sections Catalog (seed data)
    - Design Tokens
    - Feature Catalog (Admin, Variants, Cart/WhatsApp)
    - Non-Functional Requirements
    - Out of Scope
    - Governance

  Removed sections: N/A (initial version)

  Templates requiring updates:
    - plan-template.md      ✅ reviewed — Constitution Check section
        already references constitution file generically; no update needed.
    - spec-template.md      ✅ reviewed — User Scenarios & Requirements
        sections are compatible with the spec-first principle; no update needed.
    - tasks-template.md     ✅ reviewed — Phase structure and story-driven
        layout are compatible; no update needed.

  Follow-up TODOs: none.
-->

# Bayt Al-Ezz Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

Every feature MUST follow this sequence — skipping straight to code is prohibited:

1. **Spec** — write `spec.md`: user story, acceptance criteria, data touched,
   UI states (empty, loading, error, success).
2. **Plan** — write `plan.md`: which files change, Supabase tables/queries
   involved, reusable UI components identified.
3. **Tasks** — write `tasks.md`: atomic, independently verifiable checklist
   items generated from the plan.
4. **Implement** — execute tasks one at a time; each task MUST be independently
   testable before moving to the next.
5. **Review** — any feature touching visual/interactive output (house hero,
   animations, admin CRUD) requires a human review step against spec acceptance
   criteria. AI-generated code that "runs" is NOT the same as "matches the
   approved design."

A feature is NOT complete until checked against its original spec — not just
against "the code executes without errors."

### II. No-Build-Step Architecture

The codebase MUST deploy as static files — no bundler, no transpiler, no
framework build step.

- Plain `<script type="module">` imports are acceptable for code organization.
- All pages are served as static HTML + CSS + JS on Vercel; data flows through
  client-side Supabase SDK calls.
- Supabase Edge Functions MAY be introduced later for server-side logic, but
  none are planned for the initial phase.

**Rationale**: keeps the deployment pipeline trivial, reduces tooling surface
area, and avoids bundler-related debugging overhead for a vanilla-JS project.

### III. Hand-Built SVG House Hero

The homepage hero MUST be a code-generated SVG — never an AI-generated raster
image or uncontrolled SVG export.

- Single SVG, `viewBox="0 0 1200 900"`, isometric projection, transparent
  background.
- Exactly 12 `<g>` groups, one per section, each with a stable unique `id`
  matching the section slug (see Sections Catalog).
- Each zone group contains: floor-tile shape, back-wall shape (10–15% darker,
  same hue), and an empty icon-slot placeholder — icons are overlaid via CSS/JS.
- A separate `id="main-entrance-cta"` door element in Primary Blue with a soft
  SVG-filter glow (blur only, no colors outside the palette).
- No text/labels/numbers inside the SVG — section names render as real HTML text
  overlays for editability, accessibility, and SEO.
- Icon-slot center coordinates (`cx`, `cy`) for all 12 zones plus the entrance
  MUST be exported as a JSON/JS array, so click handlers and overlay positioning
  use JS without parsing SVG geometry at runtime.
- Zone-to-zone visual differentiation (soft/rounded for women's/baby, sharp/angular
  for men's, segmented panel lines for garage, etc.) is encoded directly in SVG
  paths per zone `id` — hardcoded per zone, not left to a generator to infer.

**Rationale**: AI image generators cannot guarantee an exact, reliably clickable
count of 12 distinct zones with consistent geometry. A coded SVG guarantees zone
count, hit-boxes, and lets sections be added/removed via the admin panel without
regenerating artwork.

### IV. Separation of Concerns

- No inline `onclick="..."` attributes in HTML — all event binding happens in JS
  via `addEventListener`.
- No direct Supabase calls inside UI-rendering code — all data access goes through
  a dedicated data-access layer (`sections-api.js`, `products-api.js`) so the
  storefront and admin panel can be tested and modified independently.
- CSS stays in dedicated files listed in the architecture structure — no large
  inline `style="..."` blocks except for truly dynamic/computed values (e.g.,
  positioning an icon overlay from JSON coordinates).
- Every Supabase query used more than once MUST be wrapped in a named function in
  the relevant `*-api.js` file — never duplicated inline.

### V. Mobile-First, Arabic-First, RTL

- All storefront and admin pages MUST be designed mobile-first — small viewports
  tested before desktop.
- Arabic is the primary UI language; RTL layout MUST be applied throughout.
- Typography: Cairo font (per the approved brand identity sheet).
- The house hero SVG and all interactive zones MUST be usable on touch devices.

### VI. Single Responsibility & Clean Code

- **One responsibility per function.** A function that fetches data, transforms
  it, AND updates the DOM MUST be split into separate functions.
- No function longer than ~30–40 lines (soft ceiling) — longer functions are
  likely doing more than one job.
- Descriptive names — `sectionSlug`, not `secSlg`. No single-letter names outside
  trivial loop counters.
- No magic numbers/strings scattered in code — constants (color palette, section
  slugs, Supabase table names) live in one shared `constants.js` / `config.js`,
  imported everywhere.
- Comments explain **why**, not **what** — reserve comments for non-obvious
  business decisions (e.g., "soft-delete to avoid breaking live cart links —
  see constitution §VIII").
- Each JS module does one job (`cart.js` manages cart state; Supabase calls
  belong in `*-api.js`). Shared logic (price formatting, WhatsApp message
  building) lives in `utils.js` / `helpers.js`, never copy-pasted.

### VII. Testable Pure Logic

- Pure logic (price calculations, cart totals, WhatsApp message formatting,
  variant selection, slug generation) MUST be written as small standalone
  functions: take input, return output, no DOM or global state dependency.
- A lightweight test setup (Vitest or plain Node `assert` scripts) MUST cover
  at minimum: cart total calculation, variant switching logic, WhatsApp message
  generation, and slug generation for sections/products.
- DOM-manipulation code (rendering product cards, house zone click handlers)
  is NOT required to have automated tests but MUST be manually verifiable
  against spec acceptance criteria before a feature is marked done.

### VIII. Soft-Delete by Default

Deleting sections or products MUST use soft-delete (an `is_deleted` or
`deleted_at` column) rather than hard-delete.

**Rationale**: prevents breaking existing cart links, category URLs, and
localStorage-persisted cart items that reference a product or section id/slug.
Hard-delete MAY only be used for data with no external references and with
explicit approval.

## Locked Tech Stack

| Layer | Choice | Change Policy |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) | Do NOT deviate without explicit approval |
| Backend / Database | Supabase (Postgres + Auth + Storage) | Do NOT deviate without explicit approval |
| Hosting | Vercel (static deployment) | Do NOT deviate without explicit approval |
| Homepage hero | Hand-built SVG (code-generated, not AI raster) | Do NOT deviate without explicit approval |
| Planning tool | Spec-Kit (spec → plan → tasks → implement) | Do NOT deviate without explicit approval |

## Repository & Architecture Structure

```
/public
  /assets
    house-hero.svg              — coded isometric house component
    icons/                      — flat icons, one per section
/src
  /pages
    index.html                  — homepage (house hero)
    category.html               — product listing (query param: section slug)
    product.html                — single product detail + variant switcher
    cart.html                   — cart review + "Send via WhatsApp" action
    /admin
      login.html
      dashboard.html
      sections.html             — CRUD for sections
      products.html             — CRUD for products
  /js
    supabase-client.js
    constants.js                — shared constants (palette, table names, slugs)
    utils.js                    — shared helpers (price formatting, slug gen, etc.)
    cart.js                     — cart state (localStorage, guest-only)
    house-interactions.js       — door click, zone hover/click, navigation
    sections-api.js             — data-access layer for sections
    products-api.js             — data-access layer for products
    admin/
      sections-crud.js
      products-crud.js
  /css
    tokens.css                  — design tokens: colors, spacing, typography
    house.css
    store.css
    admin.css
/supabase
  /migrations                  — SQL schema migrations
  /seed                        — seed data for the 12 sections
/tests
  cart.test.js                  — cart total, add/remove/update
  whatsapp.test.js              — message generation
  slug.test.js                  — slug generation
  variants.test.js              — variant selection logic
```

All files MUST follow this structure — no ad-hoc files dropped outside it.

## Sections Catalog (Initial Seed Data)

> This list is admin-editable at runtime (sections can be renamed, added, or
> removed from the admin panel). The table below is the **initial seed data**,
> not a hardcoded constant in app logic.

| # | Section Name (Arabic) | Slug | Icon Description |
|---|---|---|---|
| 1 | الغسالة | `laundry` | Washing machine |
| 2 | رفايع المطبخ | `kitchen-shelving` | Kitchen shelf with jars/utensils |
| 3 | ورقيات | `paper-goods` | Foil roll / stretch wrap / paper roll |
| 4 | بيت الراحة | `bathroom` | Simple bathroom icon |
| 5 | نص الدنيا | `women` | Elegant female head silhouette |
| 6 | جنتلمان | `men` | Razor or simple necktie |
| 7 | الريسبشن | `reception` | Reception desk / bell |
| 8 | بيبي زون | `baby` | Baby bottle or simple toy |
| 9 | الجزامة | `footwear` | Shoe |
| 10 | التسريحة | `vanity` | Vanity/dressing-table icon (hairbrush + mirror) |
| 11 | الجراج | `garage` | Simple car or garage door |
| 12 | منظفات | `cleaning` | Cleaning spray bottle |

**Change log**: Section 10 was "الصيدلية" (pharmacy) in earlier drafts — renamed
to "التسريحة" (vanity/dressing area) by the client. Icon updated to
vanity/hairbrush (not pill).

## Design Tokens

```css
--primary-blue:    #0056B3;
--secondary-navy:  #1A237E;
--tertiary-gray:   #9E9E9E;
--neutral-gray:    #75777E;
--base-white:      #F8F9FA;
```

- No other hues anywhere in the product (backgrounds, shadows, buttons, badges).
- Typography: **Cairo** (per the approved brand identity sheet).
- Button variants: Primary / Secondary / Inverted / Outlined — per the identity
  sheet.

## Feature Catalog

### Admin Panel

- **Access**: Supabase Auth, single merchant role (no multi-role in this phase).
- **Sections management** (`/admin/sections.html`):
  - List all sections (table or card grid); drag-to-reorder is nice-to-have, not
    blocking for v1.
  - Create: name (Arabic), slug (auto-generated, editable), icon (upload or
    pick from preset library).
  - Edit: rename, change icon, change slug (with a warning that slug changes
    affect the section's URL).
  - Delete: warn if products are assigned; require reassignment or confirm
    cascade; MUST use soft-delete (see Principle VIII).
- **Products management** (`/admin/products.html`):
  - List all products (filterable by section, with search).
  - Create: name, description, price, section (dropdown), images, variants.
  - Edit: same fields, plus toggle active/inactive (inactive = hidden from
    storefront without deleting).
  - Delete: MUST use soft-delete (see Principle VIII).

### Product Variants

- `products` table holds the parent listing (shared name, description, section).
- `product_variants` table holds per-variant data: variant label (color/pattern),
  price override, image(s), stock/availability flag, FK to parent product.
- Product detail page renders a swatch/thumbnail selector; variant switching
  updates image/price without full page reload.
- Admin product form MUST support adding/removing variants under a single
  product entry.

### Cart → WhatsApp Checkout

- No payment gateway in this phase.
- Cart state persists in `localStorage` (guest-only, no auth required).
- Cart page: product name, chosen variant, quantity, price, subtotal.
- "Send order via WhatsApp" button: constructs a pre-filled `wa.me` link with a
  URL-encoded text summary and opens it in a new tab/app.
- No in-app order confirmation beyond "your order has been prepared, continue
  in WhatsApp."

## Non-Functional Requirements

- **Mobile-first**: house hero and all pages tested on small viewports first.
- **Arabic-first / RTL**: entire UI in Arabic, RTL layout throughout.
- **Performance**: no heavy 3D/WebGL; SVG + CSS/JS only, low page weight.
- **Accessibility**: all 12 zones + door reachable/operable via keyboard with
  `aria-label`s; section names are real HTML text overlays.
- **SEO**: category and product pages MUST have real, crawlable text content —
  section names, product names/descriptions are HTML, not images.

## Definition of Done

A task is only "done" when ALL of the following are true:

1. It matches its spec's acceptance criteria.
2. It follows the file structure and naming rules in this constitution.
3. Any pure logic it introduces has a corresponding automated test.
4. No duplicated logic was introduced that already exists elsewhere.
5. For visual/interactive features: human review confirms the output matches the
   approved design (see Principle I, step 5).

## Explicitly Out of Scope (This Phase)

- No true 3D/WebGL interactive house (superseded by isometric SVG — see
  Principle III rationale).
- No online payment integration.
- No customer accounts/login (guest checkout via WhatsApp only).
- No multi-merchant / multi-role admin permissions.

## Governance

- This constitution supersedes all other development practices for Bayt Al-Ezz.
- Amendments MUST be documented with: what changed, why, and a migration plan
  for affected code/specs.
- The tech stack (see Locked Tech Stack) MUST NOT change without explicit
  written approval from the project owner.
- All code reviews MUST verify compliance with this constitution's principles.
- Use `speckit` workflow commands for runtime development guidance.
- Version increments follow semantic versioning:
  - **MAJOR**: backward-incompatible governance/principle changes.
  - **MINOR**: new principle/section added or materially expanded.
  - **PATCH**: clarifications, wording, typo fixes.

**Version**: 1.0.0 | **Ratified**: 2026-07-14 | **Last Amended**: 2026-07-14
