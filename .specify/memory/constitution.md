<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 1.0.0 → 2.0.0 (MAJOR — breaking changes to house hero,
  security model, WhatsApp config, and admin icon management)

  Modified principles:
    - III. Hand-Built SVG House Hero → III. Two-Phase Auto-Opening House Hero
      (replaced single SVG with Frame 1 / Frame 2 auto-animation flow;
       removed requirement for user click-to-open door)
    - IV. Separation of Concerns → IV. Separation of Concerns
      (updated admin icon management requirements)

  Added sections:
    - IX. Security Hardening (Magic Link Auth, Rate Limiting, RLS,
      Server-side Validation)
    - Admin icon visual preview requirement
    - Product image optionality
    - Fixed WhatsApp number (+201555077347)

  Removed sections:
    - Door-click interaction requirement (house now auto-opens)
    - Old single house-hero.svg reference (replaced by Frame 1.svg + Frame 2.svg)

  Templates requiring updates:
    - plan-template.md      ✅ reviewed — Constitution Check section
        already references constitution file generically; no update needed.
    - spec-template.md      ✅ reviewed — User Scenarios & Requirements
        sections are compatible; no update needed.
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

### III. Two-Phase Auto-Opening House Hero (UPDATED — client change)

The homepage hero MUST present a **two-phase animation** using two
client-provided SVG files. The user does **NOT** click a door to open the
house — the house opens automatically after a brief delay.

**Phase 1 — Closed House (`Frame 1.svg`)**:
When the consumer first loads the homepage, they see the house in its closed
state. This is the `public/assets/Frame 1.svg` file — a flat-front house
illustration with a visible door (blue rectangle with golden knob), a
triangular navy roof, and four interior window/room panels.

**Phase 2 — Open House (`Frame 2.svg`)**:
After a short timed delay (e.g. 1.5–2.5 seconds), the house automatically
transitions (via CSS animation/JS) to reveal the interior layout. This is
the `public/assets/Frame 2.svg` file — the same house structure but with the
interior divided into a 4×3 grid of 12 section zones. Each zone contains a
detailed, hand-drawn category illustration (person icons, appliance drawings,
etc.) separated by navy-blue divider lines.

**Key rules**:
- The consumer MUST NOT be required to click, tap, or interact to open the
  house. The transition from Frame 1 to Frame 2 happens **automatically**.
- The transition SHOULD be smooth (e.g., fade, slide, or morph animation)
  to give a "door opening" feeling.
- After the house is fully open (Frame 2 visible), each of the 12 section
  zones becomes clickable, navigating to the corresponding category page.
- Both SVG files are client-designed assets stored at:
  - `public/assets/Frame 1.svg` (closed house)
  - `public/assets/Frame 2.svg` (open house — 12 section grid)
- The old `house-hero.svg` file is **deprecated** and MUST NOT be used.
- No AI-generated raster images — only the client-provided SVGs.
- Section zone names/icons pull from live Supabase data overlaid on top of
  the Frame 2 SVG grid, not hardcoded text baked into the SVG.
- Full keyboard navigability and correct `aria-label`s for all zones.
- All colors MUST stay within the design token palette.

**Rationale**: the client changed the requirement — instead of an interactive
door-click, the consumer should immediately see the house form and then watch
it open by itself, revealing the shopping sections without any extra action.

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
- The house hero SVGs and all interactive zones MUST be usable on touch devices.

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

### IX. Security Hardening (NON-NEGOTIABLE)

The application MUST implement the following security measures:

1. **Authentication via Magic Link (Supabase Auth)**:
   - Admin panel access MUST use Supabase Magic Link authentication
     (passwordless email login). No traditional username/password flow.
   - Only authenticated users with the merchant role can access admin
     routes (`/admin/*`).
   - Session tokens MUST be validated on every admin API call.

2. **Rate Limiting**:
   - All public-facing endpoints and form submissions MUST be protected
     by rate limiting to prevent abuse.
   - Implement client-side throttling for repeated actions (e.g., add to
     cart, WhatsApp send button).
   - Server-side rate limiting SHOULD be applied via Supabase Edge Functions
     or Vercel middleware when available.

3. **Row-Level Security (RLS)**:
   - All Supabase tables MUST have RLS policies enabled.
   - Storefront queries (public read) MUST be restricted to active,
     non-deleted records only.
   - Admin write operations (insert, update, delete) MUST require a valid
     authenticated session with the merchant role.
   - No table should ever be accessible without an RLS policy — even if
     the policy is "allow public read."

4. **Server-Side Validation**:
   - All data submitted by admin forms (section names, product data, prices,
     images) MUST be validated server-side (via Supabase RLS policies,
     database constraints, and/or Edge Functions).
   - Client-side validation is for UX convenience only — it MUST NOT be
     the sole line of defense.
   - Input sanitization MUST be applied to prevent XSS and injection attacks.

**Rationale**: even though this is a simple storefront, the admin panel manages
real business data. Magic Link eliminates password-related vulnerabilities,
RLS ensures data isolation, and rate limiting prevents automated abuse.

## Locked Tech Stack

| Layer | Choice | Change Policy |
|---|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) | Do NOT deviate without explicit approval |
| Backend / Database | Supabase (Postgres + Auth + Storage) | Do NOT deviate without explicit approval |
| Hosting | Vercel (static deployment) | Do NOT deviate without explicit approval |
| Homepage hero | Two-phase auto-opening SVGs (Frame 1.svg → Frame 2.svg) | Do NOT deviate without explicit approval |
| Planning tool | Spec-Kit (spec → plan → tasks → implement) | Do NOT deviate without explicit approval |
| Authentication | Supabase Magic Link (passwordless) | Do NOT deviate without explicit approval |

## Repository & Architecture Structure

```
/public
  /assets
    Frame 1.svg                 — closed house (Phase 1 of hero animation)
    Frame 2.svg                 — open house with 12 section zones (Phase 2)
    Frame 3.svg                 — reference design for sections with icons
    house-coordinates.json      — zone coordinate map for overlay positioning
    icons/                      — flat icons, one per section
/src
  /pages
    index.html                  — homepage (two-phase house hero animation)
    category.html               — product listing (query param: section slug)
    product.html                — single product detail + variant switcher
    cart.html                   — cart review + "Send via WhatsApp" action
    /admin
      login.html
      dashboard.html
      sections.html             — CRUD for sections (with visual icon picker)
      products.html             — CRUD for products (image is OPTIONAL)
  /js
    supabase-client.js
    constants.js                — shared constants (palette, table names, slugs)
    utils.js                    — shared helpers (price formatting, slug gen, etc.)
    cart.js                     — cart state (localStorage, guest-only)
    house-interactions.js       — auto-open animation, zone click, navigation
    sections-api.js             — data-access layer for sections
    products-api.js             — data-access layer for products
    image-compressor.js         — client-side image compression
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

**Deprecated files** (do NOT use):
- `public/assets/house-hero.svg` — replaced by Frame 1.svg + Frame 2.svg

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

## Admin Icon Management (NEW — client requirement)

The admin panel MUST allow the merchant to change section icons along with
section names. The following rules apply:

1. **Visual icon picker**: when the admin creates or edits a section, the icon
   selection interface MUST display the **actual icon shapes** (visual
   previews) — NOT just filenames like `kitchen.svg`. The merchant is
   non-technical and cannot identify icons by filename alone.

2. **Icon source**: the available icons MUST be extracted from the
   `public/assets/Frame 3.svg` reference file, which is identical to
   Frame 2.svg but includes an additional section with its icon as a
   design reference. Each section zone in Frame 3 contains the visual
   icon that should be associated with that section.

3. **Icon rendering in admin**: each selectable icon MUST be rendered as
   a small visual thumbnail (inline SVG or `<img>` tag) so the admin
   can see the icon shape before selecting it.

4. **Storage**: selected icon references MUST be stored in the `sections`
   table so the storefront can fetch and display them dynamically.

## Product Image Optionality (NEW — client requirement)

Product images are **NOT mandatory**. The admin MUST be able to create and
save a product without uploading any image.

- The product form MUST NOT block submission if no image is provided.
- On the storefront, products without images MUST display a tasteful
  placeholder graphic (e.g., a styled icon or brand-colored "no image"
  card) rather than a broken image tag or blank space.
- The `products` and `product_variants` tables MUST allow NULL values for
  image columns.

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

- **Access**: Supabase Auth via **Magic Link** (passwordless email login),
  single merchant role (no multi-role in this phase).
  See Principle IX for full security requirements.
- **Sections management** (`/admin/sections.html`):
  - List all sections (table or card grid); drag-to-reorder is nice-to-have, not
    blocking for v1.
  - Create: name (Arabic), slug (auto-generated, editable), icon (pick from
    visual icon picker showing actual icon shapes — NOT filenames).
  - Edit: rename, change icon (with visual preview), change slug (with a warning
    that slug changes affect the section's URL).
  - Delete: warn if products are assigned; require reassignment or confirm
    cascade; MUST use soft-delete (see Principle VIII).
- **Products management** (`/admin/products.html`):
  - List all products (filterable by section, with search).
  - Create: name, description, price, section (dropdown), images (**optional** —
    product can be saved without any image), variants.
  - Edit: same fields, plus toggle active/inactive (inactive = hidden from
    storefront without deleting).
  - Delete: MUST use soft-delete (see Principle VIII).

### Product Variants

- `products` table holds the parent listing (shared name, description, section).
- `product_variants` table holds per-variant data: variant label (color/pattern),
  price override, image(s) (nullable), stock/availability flag, FK to parent
  product.
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
- **WhatsApp number**: `+201555077347` — this is the fixed merchant number.
  It MUST be stored in a configurable location (e.g., `constants.js` or a
  Supabase `settings` table) so it can be updated without code changes, but
  the initial value MUST be `+201555077347`.
- No in-app order confirmation beyond "your order has been prepared, continue
  in WhatsApp."

## Non-Functional Requirements

- **Mobile-first**: house hero and all pages tested on small viewports first.
- **Arabic-first / RTL**: entire UI in Arabic, RTL layout throughout.
- **Performance**: no heavy 3D/WebGL; SVG + CSS/JS only, low page weight.
- **Accessibility**: all 12 zones reachable/operable via keyboard with
  `aria-label`s; section names are real HTML text overlays.
- **SEO**: category and product pages MUST have real, crawlable text content —
  section names, product names/descriptions are HTML, not images.
- **Security**: see Principle IX — Magic Link auth, RLS, rate limiting, and
  server-side validation are all non-negotiable.

## Definition of Done

A task is only "done" when ALL of the following are true:

1. It matches its spec's acceptance criteria.
2. It follows the file structure and naming rules in this constitution.
3. Any pure logic it introduces has a corresponding automated test.
4. No duplicated logic was introduced that already exists elsewhere.
5. For visual/interactive features: human review confirms the output matches the
   approved design (see Principle I, step 5).
6. Security requirements from Principle IX are satisfied where applicable.

## Explicitly Out of Scope (This Phase)

- No true 3D/WebGL interactive house (superseded by two-phase SVG animation —
  see Principle III rationale).
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

**Version**: 2.0.0 | **Ratified**: 2026-07-14 | **Last Amended**: 2026-07-15
