# Contract: UI Routes & Query Params

This is the "external interface" contract for this feature — the pages a merchant navigates
between, and the query-param contract each accepts/produces. All routing uses `location.href`
navigation and query strings, consistent with the rest of the storefront (no client-side router).

## `index.html` (homepage) — edited

- **New**: a wholesale-only "Browse Companies" / "شركاء النجاح والشركات" showcase section,
  populated via `fetchActiveCompanies()` and rendered with `company-card-html.js`'s
  `buildCompanyCardHTML()`.
- **Gating**: the showcase's container is only populated/shown when `isWholesaleMode()` is true —
  same pattern as `updateWholesaleHeroText()` already uses in `pricing-mode.js`'s
  `initPricingMode()`. Retail users never see this section (Acceptance Scenario 3, User Story 2).
- **Each company card links to**: `category.html?company=<id>` (no `section` param — full
  cross-section catalog).
- **Section-zone click routing** (via `house-interactions.js`, not a static `href`): in wholesale
  mode, routes to `wholesale-section-companies.html?section=<slug>` instead of
  `category.html?section=<slug>`. In retail mode, unchanged.

## `wholesale-section-companies.html` — new page

- **Query param**: `?section=<slug>` (required — same convention as `category.html`'s `section`
  param; redirect to `index.html` if missing, mirroring `category.html`'s existing
  `if (!slug && !searchQuery) { location.href = 'index.html'; return; }` guard).
- **Data source**: `fetchCompaniesForSection(slug)` → `{ companies, hasUnassigned }`.
- **Renders**:
  - A grid of company cards (logo, name — `buildCompanyCardHTML()`, with the fallback monogram
    for missing `logo_url`, per the spec's "Company without logo" edge case).
  - One additional "All products in this section" entry, labeled with the section's name (fetched
    via `fetchActiveSections()` for the section's display name), linking to
    `category.html?section=<slug>` (no `company` param).
  - Empty state ("no companies with active wholesale products in this section") when
    `companies.length === 0`, with a link back to the homepage — mirrors `category.html`'s
    existing empty-state markup/copy style.
  - Error state (invalid/soft-deleted section slug) — reuses `category.html`'s existing catch-block
    pattern: descriptive message + "return to catalog" button.
- **Each company card links to**: `category.html?section=<slug>&company=<id>`.
- **Access**: not gated by a hard redirect if visited without wholesale mode active (no security
  boundary is crossed — it just shows the same public data `category.html` would), but it is never
  linked to from anywhere in retail mode, satisfying "no company intermediary grid after section
  click" for retail (spec Edge Cases / Consumer mode isolation).

## `category.html` — edited (all three listing entry paths converge here)

| Params present | Behavior |
|---|---|
| `?section=<slug>` only | **Unchanged retail behavior.** `fetchProductsBySection(slug)`, no filter panel, no company param handling. |
| `?section=<slug>` (wholesale mode) | Same fetch as above; filter panel rendered and pre-seeded with `sectionId` = the resolved section, `companyId` = null (matches Acceptance Scenario 4 — "All products" entry shows everything including unassigned). |
| `?section=<slug>&company=<id>` (wholesale mode only — retail never produces this URL) | `fetchProductsByCompany(id, { sectionSlug: slug })`. Filter panel pre-seeded with both `sectionId` and `companyId` (Acceptance Scenario 2, User Story 3). |
| `?company=<id>` only (wholesale mode only) | `fetchProductsByCompany(id)` (no section scoping). Filter panel pre-seeded with `companyId` only, `sectionId` = null. Page header shows the company name via `fetchCompanyDetails(id)`. |
| `?search=<query>` | **Unchanged** — existing search behavior, no filter panel (out of scope for this feature). |

- **Filter panel** (new, wholesale-mode-only UI block): price range (min/max number inputs),
  company multi/single-select (options from whichever company list is relevant to the current
  context — `fetchCompaniesForSection(slug)`'s `companies` when a `section` is present, else
  `fetchActiveCompanies()`), section select (options from `fetchActiveSections()`), plus a
  synthetic "بدون شركة" (unassigned) option appended to the company select **only** when
  `hasUnassigned` is true for the current section context (FR-013). Every control change calls
  `applyProductFilters()` (`product-filters.js`) against the already-fetched product array and
  re-renders the grid — no navigation, no network request (SC-003). A "reset filters" control
  restores the URL-derived initial state.
- **Zero-match state**: reuses/extends the existing empty-state block with the spec's required
  "No matching products" copy + a clear/reset-filters button (Acceptance Scenario 4, User Story 3).
- **Invalid company id**: `fetchCompanyDetails()` throwing is caught by the same top-level
  try/catch `category.html` already has around its render logic, producing the existing
  network/error-style message ("حصلت مشكلة..." block) — satisfies the "Direct URL tampering /
  invalid IDs" edge case without new error-handling code paths.

## `admin/companies.html` — new admin page

- No query params — single CRUD page, structurally identical to `admin/products.html` /
  `admin/sections.html` (form column + list/table column, `requireAdmin()` gate on load and on
  every write).
- Linked from `admin/dashboard.html`'s sidebar nav (new item alongside "إدارة الأقسام" / "إدارة
  المنتجات").

## `admin/products.html` — edited (not a new route, but a contract addition)

The existing product form gains a "الشركة" (company) `<select>` populated from
`fetchAllCompaniesAdmin()`, with a "بدون شركة" (unassigned) option as the default/blank choice —
mirroring the existing `section_id` `<select>` in `products-crud.js`. This is how admins assign
`company_id` on a product (FR-002); no separate route needed.
