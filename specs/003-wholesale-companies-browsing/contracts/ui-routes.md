# Contract: UI Routes & Query Params

This is the "external interface" contract for this feature — the pages a merchant navigates
between, and the query-param contract each accepts/produces. All routing uses `location.href`
navigation and query strings, consistent with the rest of the storefront (no client-side router).

## `index.html` (retail homepage) — edited (minimally — early redirect only)

> **Revised 2026-09-01** (`/speckit-clarify` correction): the house hero must never render, even
> briefly, in wholesale mode. The "Browse Companies" showcase and section-grid entry point
> described below now live on the new `wholesale-home.html` page, not on `index.html`.

- **Only change**: at the very top of its module script — before the existing `fetch('Frame
  1.svg')`/`fetch('Frame 2.svg')` calls and before `initializeHouse()` runs — add an
  `isWholesaleMode()` check (from `pricing-mode.js`). If true: `location.replace('wholesale-home.html')`
  and `return` immediately, so no house-hero code executes.
- **Everything else in `index.html`, and all of `house-interactions.js`, stays completely
  untouched.** Retail/consumer mode never redirects and behaves exactly as before this feature
  (Constitution Principle III, SC-004).

## `wholesale-home.html` — new page (dedicated wholesale homepage)

> Replaces the earlier plan of adding a companies showcase directly inside `index.html`. This is a
> fully separate page/file — never shares DOM, script, or SVG assets with `index.html`.

- **Reached via**: the redirect above (`index.html` → `wholesale-home.html` when
  `isWholesaleMode()` is true), or direct navigation/bookmark.
- **Visual design**: produced separately (Claude Design) — out of scope for this spec/plan. This
  contract only fixes the *functional* wiring so implementation can proceed on the data/behavior
  layer ahead of the final visual design landing; the design output replaces the placeholder
  markup, not the data flow described here.
- **Renders**:
  - A section-grid entry view: one tappable entry per active section (`fetchActiveSections()`,
    same data source `index.html`'s hero already uses), each linking to
    `wholesale-section-companies.html?section=<slug>`. Rendered via a new pure template module
    (`wholesale-section-grid-html.js`, mirrors `section-nav-html.js`) — explicitly **not** the
    house SVG components.
  - The "Browse Companies" / "شركاء النجاح والشركات" showcase (User Story 2): populated via
    `fetchActiveCompanies()`, rendered with `company-card-html.js`'s `buildCompanyCardHTML()`. Each
    company card links to `category.html?company=<id>` (no `section` param — full cross-section
    catalog).
- **Gating (revised, plan-eng-review finding):** mirrors the exact fix applied to
  `wholesale-section-companies.html` (below) — a direct/bookmarked visit with wholesale mode
  inactive would otherwise render this page's company showcase and section grid built from
  `fetchActiveCompanies()`/`fetchActiveSections()` with no retail/wholesale distinction
  enforced anywhere in that data path. This page now checks `isWholesaleMode()` first; if
  false, `location.replace('index.html')` — the retail homepage — symmetric with
  `index.html`'s own redirect (`isWholesaleMode()` true → `wholesale-home.html`), so the two
  redirects can never loop (each only fires on the condition the other doesn't). No data leak
  either way (RLS is the real boundary, per Constitution Principle IX), but a merchant who
  lands here without wholesale mode active now sees the page they actually meant to reach.

## `wholesale-section-companies.html` — new page

- **Query param**: `?section=<slug>` (required — same convention as `category.html`'s `section`
  param; redirect to `wholesale-home.html` if missing, mirroring `category.html`'s existing
  `if (!slug && !searchQuery) { location.href = 'index.html'; return; }` guard, but pointed at the
  wholesale homepage since this page only exists within the wholesale flow).
- **Data source**: `fetchCompaniesForSection(slug)` → `{ companies, hasUnassigned }`.
- **Renders**:
  - A grid of company cards (logo, name — `buildCompanyCardHTML()`, with the fallback monogram
    for missing `logo_url`, per the spec's "Company without logo" edge case).
  - One additional "All products in this section" entry, labeled with the section's name (fetched
    via `fetchActiveSections()` for the section's display name), linking to
    `category.html?section=<slug>` (no `company` param).
  - Empty state ("no companies with active wholesale products in this section") when
    `companies.length === 0`, with a link back to `wholesale-home.html` — mirrors `category.html`'s
    existing empty-state markup/copy style.
  - Error state (invalid/soft-deleted section slug) — reuses `category.html`'s existing catch-block
    pattern: descriptive message + "return to catalog" button.
- **Each company card links to**: `category.html?section=<slug>&company=<id>`.
- **Access (revised, plan-eng-review finding):** `fetchCompaniesForSection()`'s underlying
  `filterWholesaleProducts()` is a no-op outside wholesale mode (it returns the input array
  unchanged when `isWholesaleMode()` is false — `pricing-mode.js`), so a direct/bookmarked
  visit with wholesale mode inactive would build the company grid from the section's *entire*
  catalog, not just wholesale-eligible products. This page now checks `isWholesaleMode()`
  first; if false, `location.replace('category.html?section=' + slug)` — the equivalent
  retail listing — mirroring `index.html`'s existing wholesale-mode redirect (Decision 7).
  No data leak either way (RLS is the real boundary, per Constitution Principle IX), but the
  page now shows the merchant the view they actually meant to reach instead of a
  wholesale-labeled grid built from retail inventory. `wholesale-home.html` (above) now has
  the mirror-image fix — the two pages are consistent with each other again.

## `category.html` — edited (all three listing entry paths converge here)

| Params present | Behavior |
|---|---|
| `?section=<slug>` only | **Unchanged retail behavior.** `fetchProductsBySection(slug)`, no filter panel, no company param handling. |
| `?section=<slug>` (wholesale mode) | Same fetch as above; filter panel rendered and pre-seeded with `sectionId` = the resolved section, `companyId` = null (matches Acceptance Scenario 4 — "All products" entry shows everything including unassigned). |
| `?section=<slug>&company=<id>` (wholesale mode only — retail never produces this URL) | `fetchCompanyDetails(id)` first (see Invalid company id, below), then `fetchProductsByCompany(id, { sectionSlug: slug })`. Filter panel pre-seeded with both `sectionId` and `companyId` (Acceptance Scenario 2, User Story 3). |
| `?company=<id>` only (wholesale mode only) | `fetchCompanyDetails(id)` first, then `fetchProductsByCompany(id)` (no section scoping). Filter panel pre-seeded with `companyId` only, `sectionId` = null. Page header shows the company name from the already-fetched `fetchCompanyDetails(id)` result — no second lookup. |
| `?search=<query>` | **Unchanged** — existing search behavior, no filter panel (out of scope for this feature). |

- **Filter panel** (new, wholesale-mode-only UI block): price range (min/max number inputs),
  company multi/single-select (options from whichever company list is relevant to the current
  context — `fetchCompaniesForSection(slug)`'s `companies` when a `section` is present, else
  `fetchActiveCompanies()`), section select (options from `fetchActiveSections()`), plus a
  synthetic "بدون شركة" (unassigned) option appended to the company select **only** when
  `hasUnassigned` is true for the current section context (FR-013 — maps to
  `applyProductFilters()`'s `unassignedOnly` flag, see `data-model.md`).
  **Revised (plan-eng-review finding):** only the price-range and company/unassigned
  controls call `applyProductFilters()` against the already-fetched product array with no
  network request (SC-003 genuinely holds for these). Changing the **section** select
  triggers a real `fetchProductsBySection()` (or `fetchProductsByCompany(id, {
  sectionSlug })` if a company is also active) call and re-renders — the already-fetched
  array cannot contain a different section's products, so this was never actually a
  no-reload operation and the panel must not present it as instant. A "reset filters"
  control restores the URL-derived initial state.
- **Zero-match state**: reuses/extends the existing empty-state block with the spec's required
  "No matching products" copy + a clear/reset-filters button (Acceptance Scenario 4, User Story 3).
- **Invalid company id (revised, plan-eng-review finding):** previously only the plain
  `?company=<id>` route validated the company at all — the `?section=<slug>&company=<id>`
  route called `fetchProductsByCompany()` directly, so a soft-deleted or deactivated
  company's products kept showing indefinitely via that specific URL shape with no
  indication anything was wrong, while the other route hard-threw an uncaught error for the
  same condition. Both routes now call `fetchCompanyDetails(id)` first; its "not found"
  error is caught by the same top-level try/catch `category.html` already has around its
  render logic, producing the existing network/error-style message ("حصلت مشكلة..." block) —
  satisfies the "Direct URL tampering / invalid IDs" edge case identically on both routes,
  without new error-handling code paths.

## `admin/companies.html` — new admin page

- No query params — single CRUD page, structurally identical to `admin/products.html` /
  `admin/sections.html` (form column + list/table column, `requireAdmin()` gate on load and on
  every write).
- Linked from `admin/dashboard.html`'s sidebar nav (new item alongside "إدارة الأقسام" / "إدارة
  المنتجات").

> **`requireAdmin()` upgrade (plan-eng-review finding, resolved):** `auth-gate.js`'s
> `requireAdmin()` currently only checks for *any* authenticated session, not admins-table
> membership — RLS (`is_admin()`, migration `012`) blocks actual writes, but every existing
> admin page's UI shell is reachable by any authenticated non-admin user today. Since this
> feature adds a 6th admin page anyway, `requireAdmin()` is upgraded once, shared by all six:
> ```js
> export async function requireAdmin() {
>   if (!supabase) { window.location.replace('login.html'); throw new Error('Not authenticated'); }
>   const { data: { session } } = await supabase.auth.getSession();
>   if (!session) { window.location.replace('login.html'); throw new Error('Not authenticated'); }
>   const { data: isAdmin } = await supabase.rpc('is_admin');
>   if (!isAdmin) { window.location.replace('login.html'); throw new Error('Not authorized'); }
>   return true;
> }
> ```
> Calls the existing `public.is_admin()` SQL function (migration `012`) via Supabase's RPC
> mechanism — already `GRANT EXECUTE ... TO authenticated`, so no migration change needed,
> this is a pure `auth-gate.js` edit. `products.html`, `sections.html`, `customers.html`,
> `invoices.html`, and `login.html`'s `redirectIfSignedIn()` all benefit automatically since
> they already import `requireAdmin()` from the same shared module.

## `admin/products.html` — edited (not a new route, but a contract addition)

The existing product form gains a "الشركة" (company) `<select>` populated from
`fetchAllCompaniesAdmin()`, with a "بدون شركة" (unassigned) option as the default/blank choice —
mirroring the existing `section_id` `<select>` in `products-crud.js`. This is how admins assign
`company_id` on a product (FR-002); no separate route needed.
