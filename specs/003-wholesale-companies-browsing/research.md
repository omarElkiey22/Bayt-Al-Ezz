# Phase 0 Research: Wholesale Companies Catalog and Filtering

No `NEEDS CLARIFICATION` markers remain in the Technical Context — the spec's single
clarification (unassigned-product handling, FR-013) was already resolved during `/speckit-clarify`.
This document instead records the key implementation-approach decisions made while reconciling the
feature spec with the existing codebase's established patterns.

## Decision 1: Client-side query composition for company grids (no DB views/RPCs)

- **Decision**: Derive "companies with active wholesale products in section X" (and the global
  homepage list) by fetching the relevant products client-side and reducing to distinct
  `company_id`s in JS, then fetching those company rows by id.
- **Rationale**: The codebase has no precedent for Postgres views, RPC functions, or Edge
  Functions in the data-fetching path — `searchProducts()` in `products-api.js` already does the
  same "select broadly, filter/dedupe in JS" style for a comparable problem (filtering products by
  hidden-section admin rules). Matches Constitution Principle II (no build step, minimal backend
  surface) and the project's small catalog scale (tens of companies, hundreds of products) where
  this has no meaningful performance cost.
- **Alternatives considered**:
  - A Postgres view (`company_section_products`) — rejected: adds a migration-managed schema
    object with no existing precedent, and the client-side approach is simpler to reason about at
    this scale.
  - A Supabase Edge Function — rejected: constitution explicitly says none are planned for the
    initial phase; would be new operational surface for a problem solvable in the existing data
    layer.

## Decision 2: Section company grid reuses `fetchProductsBySection()` + `filterWholesaleProducts()`

- **Decision**: `fetchCompaniesForSection(sectionSlug)` calls the existing
  `fetchProductsBySection(slug)` (from `sections-api.js`/`products-api.js`), applies the existing
  `filterWholesaleProducts()` (from `pricing-mode.js`), then derives `{ companies, hasUnassigned }`
  from the filtered array.
- **Rationale**: The user's tech-stack instructions explicitly require reusing
  `pricing-mode.js`'s wholesale detection/filtering rather than introducing a new mechanism. This
  also guarantees the company grid and the section's product listing can never disagree about
  which products count as "active wholesale products in this section" — they share one fetch.
- **Alternatives considered**: A separate direct Supabase query
  (`products.select('company_id').eq('section_id', ...).not('wholesale_price', 'is', null)`) —
  rejected: duplicates the wholesale-price-based filtering logic that already lives in
  `filterWholesaleProducts()`, violating Constitution Principle VI (no duplicated logic).

## Decision 3: Companies are truly soft-deleted; `company_id` associations are preserved

- **Decision**: `softDeleteCompany(id)` only sets `deleted_at` (and RLS then hides the row from
  public reads). It does **not** touch `products.company_id` or the referencing products.
- **Rationale**: FR-012 explicitly requires that "removing a company does not corrupt historical
  associations or break direct bookmarks." A product that keeps `company_id` pointing at a
  soft-deleted company continues to render correctly (the product row itself is unaffected); only
  company-scoped browsing surfaces (grids, filter dropdowns) stop listing the deleted company,
  matching the "logo/brand disappears from discovery, but existing links/records don't break"
  requirement.
- **Alternatives considered**: Copying `sections-api.js`'s `softDeleteSection()` behavior (which
  hard-deletes dependent active products, then hard-deletes the section itself) — rejected: that
  behavior is specific to sections (where a product without a section is meaningless) and directly
  contradicts FR-012 for companies (where a product without a company is an explicit, supported
  "unassigned" state per the spec's Clarifications session).

## Decision 4: Company logos reuse the existing `store-assets` bucket with a new path prefix

- **Decision**: `companies-crud.js`'s logo upload helper mirrors `products-crud.js`'s `upload()`
  function exactly, uploading to `companies/{uuid}.{ext}` in the existing `store-assets` bucket and
  storing only the resulting public URL in `companies.logo_url`.
- **Rationale**: Satisfies the explicit design constraint (logos as URLs, not embedded binary
  data) with zero new infrastructure — the bucket already exists (`001_initial_schema.sql`) and its
  RLS policies are already scoped by `bucket_id`, not path, so no new storage policy is needed.
  Also reuses `image-compressor.js`'s existing `compressImage()` client-side compression, keeping
  logo uploads consistent with product image uploads.
- **Alternatives considered**: A dedicated `company-logos` bucket — rejected: no functional
  benefit at this scale, and would require a duplicate pair of storage RLS policies (public read +
  admin write) that add migration surface without adding capability.

## Decision 5: `companies` RLS mirrors the `012` admin-gating pattern exactly

- **Decision**: `companies` gets `enable row level security`, a public `select` policy scoped to
  `deleted_at is null and is_active = true`, and a single `for all to authenticated using
  (public.is_admin()) with check (public.is_admin())` write policy — the same shape
  `012_admin_role_access_control.sql` re-pointed every other sensitive table to.
- **Rationale**: `012`'s own migration comment documents that the *original* `011`-era pattern
  (`to authenticated using (auth.role() = 'authenticated')`) was a real vulnerability (any
  self-registered user, not just the admin, got full write access) that was fixed project-wide.
  Introducing a new table with the old pattern would reintroduce that hole. `is_admin()` already
  exists as a `SECURITY DEFINER` helper — no new function needed.
- **Alternatives considered**: None seriously — this is a fixed, non-negotiable project pattern
  (Constitution Principle IX, `is_admin()` established in `012`). The only real decision was making
  sure the new migration is written *after* `012` in the sense of using `is_admin()` from day one
  rather than needing its own follow-up fix.

## Decision 6: Filter panel is pure client-side refinement of an in-memory product array

- **Decision**: `product-filters.js` exports a pure function
  `applyProductFilters(products, { minPrice, maxPrice, companyId, sectionId })` that filters an
  already-fetched array; the filter panel UI calls it on every control change with no network
  request.
- **Rationale**: Directly satisfies SC-003 ("updates the listing within 150 milliseconds without a
  full page reload") since there's no round-trip at all. Also makes the filtering logic a small,
  dependency-free pure function per Constitution Principle VII, testable the same way
  `cart.test.js`/`slug.test.js` test their respective pure logic.
- **Alternatives considered**: Re-querying Supabase per filter change — rejected: adds latency
  risking the 150ms budget, and the product sets involved are already small enough to filter
  in-memory (matches Decision 1's scale assumption).

## Decision 7 (REVISED 2026-09-01 — see `/speckit-clarify` session): Wholesale mode never renders the house hero — `index.html` redirects to a dedicated `wholesale-home.html` before any house code runs

> **Original decision (superseded)**: an earlier version of this document proposed adding an
> `isWholesaleMode()` branch inside `house-interactions.js`'s zone/label click handlers to route to
> the new section-companies page. A `/speckit-clarify` correction established that the merchant
> must **never** see the house hero in wholesale mode — not even briefly, not as something clicked
> through. A same-page click-handler branch is insufficient because it still renders/loads the
> house hero first. This section replaces that decision.

- **Decision**: `index.html` performs its `isWholesaleMode()` check (imported from
  `pricing-mode.js`) at the very top of its module script — **before** the existing `fetch('Frame
  1.svg')` / `fetch('Frame 2.svg')` calls and before `initializeHouse()` is called. If wholesale
  mode is active, it immediately does `location.replace('wholesale-home.html')` and returns,
  skipping all house-hero code. `house-interactions.js` and the Frame 1/Frame 2 SVG rendering
  logic are **not modified at all** and are simply never invoked in this mode.
  `wholesale-home.html` is a new, separate page: a dedicated section-grid entry view (the section
  list rendered as a new component, not the house SVG) plus the "Browse Companies" showcase from
  User Story 2. Its visual design is being produced separately (Claude Design) — this plan only
  specifies its functional wiring (data sources, links, click targets), using a placeholder-level
  markup structure that the design output will replace.
- **Rationale**: This is the only approach that satisfies the corrected requirement ("MUST NOT
  render, fetch, or execute the interactive house hero... including transiently", FR-014) — a
  same-page conditional still has to run enough of `index.html`'s script to decide, but as long as
  that decision point is strictly before the SVG fetch/`initializeHouse()` call, zero house-hero
  network requests or DOM ever occur (SC-006). It also keeps `house-interactions.js` and the SVG
  rendering logic completely untouched, directly satisfying the correction's explicit instruction
  and minimizing risk to Constitution Principle III (house hero behavior is locked/protected —
  untouched code can't regress it).
- **Alternatives considered**:
  - *Branch inside `house-interactions.js`'s click handlers* (original decision) — rejected per
    the correction: the house hero would still render and be interacted with before navigating
    away, which is exactly what's disallowed now.
  - *Conditional render inside `index.html` without a redirect* (build two different DOM subtrees
    in one file/URL) — considered and explicitly rejected by the user in favor of the redirect
    approach, to keep the two experiences fully decoupled as separate files/pages (consistent with
    the separate-page precedent already confirmed for `wholesale-section-companies.html`).

## Decision 8: `category.html` serves all three listing entry paths

- **Decision**: `category.html` gains an optional `&company=<id>` query param. When
  `isWholesaleMode()` is true, its data-fetch branches to `fetchProductsByCompany(companyId, {
  sectionSlug })` (both params present), `fetchProductsByCompany(companyId)` (company only), or the
  existing `fetchProductsBySection(slug)` (section only / retail) — and only in wholesale mode does
  it render the new filter panel, pre-seeded from the URL params.
- **Rationale**: Avoids a fourth near-duplicate product-grid page; the existing page already has
  all the grid/card/add-to-cart rendering logic in place and already gates wholesale-specific
  behavior with `isWholesaleMode() ? ... : ...` ternaries (see the price-display and empty-state
  logic already in the file). Retail mode's code path (`section` param only, no `company`, no
  filter panel) is untouched, satisfying SC-004.
- **Alternatives considered**: A separate `company-products.html` page — rejected: would duplicate
  the entire product-card rendering, add-to-cart wiring, and error/empty states already in
  `category.html`, violating Constitution Principle VI.
