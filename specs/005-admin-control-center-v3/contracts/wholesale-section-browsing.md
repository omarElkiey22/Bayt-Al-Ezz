# Contract: Wholesale Section Browsing (UI Routes, Query Params, Data Functions)

This is the "external interface" contract for User Story 1 — the storefront pages and query-param
contract this feature changes, and the new/extended data-access functions backing them. Written in
the same style as feature 003's `contracts/ui-routes.md`.

## Data-access functions

### New: `fetchActiveWholesaleSections()` — `src/js/wholesale-sections-api.js`

Storefront-facing. Mirrors `fetchActiveSections()` (`sections-api.js`) exactly: active + non-
deleted rows from `wholesale_sections`, ordered by `display_order`. No hidden-section-style gating
(research.md Decision 4).

```js
export async function fetchActiveWholesaleSections() {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .select('*')
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('display_order');
  if (error) throw error;
  return data || [];
}
```

### New: `fetchProductsByWholesaleSection(wholesaleSectionId)` — `src/js/products-api.js`

Mirrors `fetchProductsBySection(slug)`, minus the hidden-section check (Decision 4) and keyed by
id + `wholesale_section_id` instead of slug + `section_id`. Returns every active, non-deleted
product in the section (wholesale-price filtering, as with the retail equivalent, happens
downstream via `filterWholesaleProducts()` in the calling page — this function does not itself
filter on `wholesale_price`, consistent with how `fetchProductsBySection` doesn't pre-filter either).

```js
export async function fetchProductsByWholesaleSection(wholesaleSectionId) {
  const db = requireSupabase();
  const { data, error } = await active(
    db.from(TABLES.products).select('*, product_variants(*)').eq('wholesale_section_id', wholesaleSectionId)
  ).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProductWithVariants);
}
```

### New: `fetchCompaniesForWholesaleSection(wholesaleSectionId)` — `src/js/companies-api.js`

Mirrors `fetchCompaniesForSection(slug)` exactly, built on `fetchProductsByWholesaleSection()`
instead of `fetchProductsBySection()`. Same return shape: `{ companies, hasUnassigned }`.

### Extended: `fetchProductsByCompany(companyId, options)` — `src/js/companies-api.js`

Gains a second, mutually-exclusive scoping option alongside the existing `sectionSlug`:

```js
// options: { sectionSlug } (existing, retail) | { wholesaleSectionId } (new) | {} (no scoping)
export async function fetchProductsByCompany(companyId, { sectionSlug, wholesaleSectionId } = {}) {
  // sectionSlug branch: unchanged from today.
  // wholesaleSectionId branch (new): no lookup needed (already an id, unlike sectionSlug which
  //   must resolve to a section row first) -- just adds .eq('wholesale_section_id', wholesaleSectionId)
  //   to the product query, same shape as the sectionSlug branch's .eq('section_id', sectionId).
}
```

Callers never pass both — `category.html` picks one based on which URL param is present, per the
table below.

> **Revised during planning** (`/plan-eng-review` finding, US1 focus review): `category.html`'s
> `fetchAndLabelProducts(sections, targetSlug, targetCompanyId)` already takes `targetCompanyId` as
> an *explicit parameter rather than a closure read* — the existing code's own comment explains why:
> so `refetchAndSync()` can re-fetch with a changed value without the function needing to know why
> its caller changed. The wholesale-section id gets the identical treatment: `fetchAndLabelProducts`
> gains a 4th parameter, `targetWholesaleSectionId`, appended after the existing three (so every
> existing retail call site is unaffected — it simply never passes a 4th argument, which is
> `undefined`/falsy, so the new branch is never taken on the retail path). Both call sites —
> `render()` and `refetchAndSync()` — pass `currentWholesaleSectionId` as that 4th argument. Missing
> this on the `refetchAndSync()` call site specifically would silently drop the wholesale-section
> scope the moment a shopper changes the company facet while browsing `?wholesale_section=<id>&company=<id>`
> — the initial load would still work, masking the bug until that specific interaction is tested.

### Extended: `buildWholesaleSectionGridEntryHTML(section)` — `src/js/wholesale-section-grid-html.js`

Same signature, but the link target changes from `wholesale-section-companies.html?section=<slug>`
to `wholesale-section-companies.html?wholesale_section=<id>` (Decision 1) — `section.slug` no
longer exists on the row, so this is a required change, not a style choice.

> **Revised during planning** (`/speckit.clarify` correction): an earlier version of this contract
> added `buildWholesaleSidebarNavLinkHTML`/`buildWholesaleMobileNavLinkHTML` in a new
> `wholesale-section-nav-html.js`, mirroring `section-nav-html.js`, for a wholesale sidebar-nav
> inside `category.html`. That UI is out of scope under the narrow-branch resolution below (research.md
> Decision 2) — no such module or functions are created.

## `wholesale-home.html` — edited

- **Change**: `fetchActiveSections()` → `fetchActiveWholesaleSections()`. Everything else
  (skeleton, empty state, the "Browse Companies" showcase via `fetchActiveCompanies()`) is
  unchanged — `fetchActiveCompanies()` already queries `products`/`companies` directly, not
  `sections`, so it was never part of this bug.
- **Empty state**: unchanged markup, now correctly reachable in production's actual starting state
  (`wholesale_sections` empty) rather than only in a theoretical/test scenario (FR-004).

## `wholesale-section-companies.html` — edited

- **Query param renamed**: `?section=<slug>` → `?wholesale_section=<id>` (Decision 1). Missing-param
  guard unchanged in behavior (redirect to `wholesale-home.html`), just checks the new param name.
- **Data source**: `fetchActiveWholesaleSections()` + `.find(s => s.id === id)` (mirrors the
  existing `fetchActiveSections()` + `.find(s => s.slug === slug)` pattern exactly — same
  list-then-find shape, just a different source list and key) instead of `fetchActiveSections()`.
- **Companies fetch**: `fetchCompaniesForWholesaleSection(id)` instead of
  `fetchCompaniesForSection(slug)`.
- **"All products in this section" banner**: links to `category.html?wholesale_section=<id>`
  instead of `category.html?section=<slug>`.
- **Company cards**: link to `category.html?wholesale_section=<id>&company=<companyId>` instead of
  `category.html?section=<slug>&company=<companyId>`.
- **Icon display** in the section header: `section.icon_name` now genuinely comes from the
  wholesale section's own icon (previously it read `section.icon_name` off a *retail* section
  object that happened to share the slug — now it's the real thing, via the same field name on a
  different table).

## `category.html` — edited (narrow `wholesale_section=<id>` filtering branch — FR-019)

> **Revised during planning** (`/speckit.clarify` correction, superseding an earlier "full
> filter-panel parity" version of this table). See research.md Decision 2 for the full option
> comparison and why the narrow branch was chosen.
>
> **Revised again** (`/plan-eng-review` finding, US1 focus review, live-read against the actual
> `category.html` source rather than the earlier abstract description). The narrow-branch *intent*
> below was correct, but describing it only as "add a branch to `fetchAndLabelProducts`, hide the
> nav/facet" undersold three concrete, pre-existing code sites that a literal implementation would
> either miss (causing the retail-data leak Decision 3 exists to prevent) or crash on (a hard
> `TypeError` the very first time `?wholesale_section=<id>` loads, from `wireFilterPanelEvents()`/
> `refetchAndSync()` unconditionally setting `.value` on a `#filter-section` element this mode never
> renders). The pseudocode below is the concrete fix, written directly against the real line numbers
> in `src/pages/category.html` as of this review.

| Params present | Mode | Behavior |
|---|---|---|
| `?section=<slug>` | retail (any) | **100% unchanged** — existing behavior, existing code path, untouched. |
| `?section=<slug>` | wholesale | **Changed**: no longer resolved against retail `sections` for scoping purposes (Decision 3) — treated as absent via `effectiveSlug` (below). With no `wholesale_section` and no `company` also present, this now hits the *same* redirect-to-`index.html` guard retail already uses for "nothing to show" — there is no "browse all wholesale products, unscoped" route in this feature, so redirecting (not rendering an empty grid) is the correct fallback, consistent with how the page already handles an equivalently bare retail URL. |
| `?wholesale_section=<id>` only | wholesale | `fetchProductsByWholesaleSection(id)`, feeding the existing product grid and cart. `companyId` = null. The section's own name/icon for the page header/breadcrumb comes from `fetchActiveWholesaleSections()` + `.find(s => s.id === id)`, resolved fresh inside `fetchAndLabelProducts()` itself (see below) — not a cached list feeding any nav/facet UI. |
| `?wholesale_section=<id>&company=<companyId>` | wholesale | `fetchCompanyDetails(companyId)` first (same invalid-id handling as the retail-equivalent row below), then `fetchProductsByCompany(companyId, { wholesaleSectionId: id })`. Existing company facet (see below) pre-seeded to `companyId`. |
| `?company=<companyId>` only | wholesale | **Unchanged** from today — `fetchCompanyDetails(companyId)` then `fetchProductsByCompany(companyId)`, no section scoping. |
| `?search=<query>` | any | **Unchanged.** |

### The redirect guard and `slug` neutralization (Decision 3, made concrete)

Today's guard (`category.html:635`) and the assignment right after it:

```js
if (!slug && !searchQuery && !(isWholesaleMode() && companyId)) {
  location.href = 'index.html';
  return;
}
currentSlug = slug;
```

both need to change — not just get a new branch elsewhere. `slug` is read at **four** sites total
(the guard; this assignment; `resetFilters()`'s `currentSlug !== slug` dirty-check at line 476; the
filter panel's `sectionSelect.value = currentSlug || ''` pre-seed at line 346 and its twin in
`refetchAndSync()` at line 439) — patching only the ones that happen to be near the new code and
missing the rest is exactly how the leak or the crash below would ship. Compute one neutralized
value and use it everywhere `slug` currently is read for scoping purposes:

```js
const wholesaleSectionId = getQueryParam('wholesale_section');
// Decision 3: a retail slug is meaningless (and must never be resolved) once wholesale mode is
// active -- neutralize it ONCE, here, rather than re-checking isWholesaleMode() at every one of
// the four sites below.
const effectiveSlug = isWholesaleMode() ? null : slug;

if (!effectiveSlug && !searchQuery && !(isWholesaleMode() && (companyId || wholesaleSectionId))) {
  location.href = 'index.html';
  return;
}
currentSlug = effectiveSlug;
activeCompanyId = companyId;
currentWholesaleSectionId = isWholesaleMode() ? wholesaleSectionId : null;
```

`resetFilters()`'s dirty-check becomes `currentSlug !== effectiveSlug` (not the raw `slug`) — using
the raw value there would make the check permanently true post-neutralization, since `currentSlug`
was reset to `effectiveSlug` (`null` in wholesale mode) while `slug` itself never changes, causing
every reset click to think there's unsaved facet drift and force an unnecessary re-fetch.

**Without this fix**, a bare `?wholesale_section=<id>` load — the primary entry point per the table
above, reached from every "all products" banner and company card `wholesale-section-companies.html`
produces — hits the *existing* guard's `!(isWholesaleMode() && companyId)` check, which knows
nothing about `wholesale_section`, and redirects straight to `index.html` before the new branch is
ever reached.

### `render()` — no retail `sections` fetch at all in this mode (SC-001)

`render()` (`category.html:643-645`) unconditionally calls `fetchActiveSections()` and
`loadNavigation(sections)` today, regardless of mode. Leaving that unconditional is a real, if
subtle, SC-001 violation ("zero references to retail-section data appearing anywhere in that
flow") — an unrendered Supabase call to the retail `sections` table is still a reference. Guard it:

```js
let sections = [];
if (isWholesaleMode() && currentWholesaleSectionId) {
  // No fetchActiveSections()/loadNavigation() call at all -- there is nothing retail-scoped
  // to fetch or render in this mode (Decision 2).
} else {
  sections = await fetchActiveSections();
  sectionsCache = sections;
  await loadNavigation(sections);
}
```

The retail branch (`else`) is byte-for-byte what `render()` already does today — this is a wrapping
guard around existing code, not a rewrite of it.

### Filter panel — omit the section `<select>`, guard every reference to it

`buildFilterPanelHTML()` must skip the "القسم" `<div>` block entirely when
`currentWholesaleSectionId` is set (not just leave it empty) — and, critically, both places that
unconditionally read `document.getElementById('filter-section')` today (`wireFilterPanelEvents()`
line 341/346, and `refetchAndSync()` line 439) **must null-guard that reference**, since the element
won't exist in the DOM in this mode:

```js
const sectionSelect = document.getElementById('filter-section'); // null when omitted
if (sectionSelect) {
  sectionSelect.value = currentSlug || '';
  sectionSelect.onchange = () => onSectionFacetChange(sectionSelect.value || null);
}
```
and the equivalent guard around `refetchAndSync()`'s `document.getElementById('filter-section').value = ...` line.
**Without this guard, `.value = ...` on `null` throws a `TypeError` the first time `?wholesale_section=<id>`
loads — not a degraded UI, a hard crash of the entire filter panel**, including the company facet
and price inputs this mode is explicitly supposed to keep working.

- **Filter panel's "الشركة" `<select>`**: unchanged, reused as-is in this mode — its options come
  from whichever company list is contextually relevant (now including
  `fetchCompaniesForWholesaleSection`'s `companies` when a `wholesale_section` is present), not from
  a sections table, so nothing about how it's populated needs to change.
- **No sidebar-nav / mobile-nav in this mode.** Covered by the `render()` guard above — the retail
  sidebar-nav (`sectionsCache`/`fetchActiveSections()`/`section-nav-html.js`) is only ever populated
  on the `?section=<slug>` (retail) path.

### `fetchAndLabelProducts()` — explicit 4th parameter, checked first

```js
async function fetchAndLabelProducts(sections, targetSlug, targetCompanyId, targetWholesaleSectionId) {
  if (isWholesaleMode() && targetWholesaleSectionId) {
    const wholesaleSections = await fetchActiveWholesaleSections();
    const wholesaleSection = wholesaleSections.find(s => s.id === targetWholesaleSectionId);
    if (wholesaleSection) {
      breadcrumbActive.textContent = wholesaleSection.name;
      sectionTitle.textContent = wholesaleSection.name;
      document.title = `${wholesaleSection.name} | بيت العز`;
    }
    if (targetCompanyId) {
      const company = await fetchCompanyDetails(targetCompanyId);
      if (wholesaleSection) {
        const scopedTitle = `${wholesaleSection.name} — ${company.name}`;
        breadcrumbActive.textContent = scopedTitle;
        sectionTitle.textContent = scopedTitle;
        document.title = `${scopedTitle} | بيت العز`;
      }
      return await fetchProductsByCompany(targetCompanyId, { wholesaleSectionId: targetWholesaleSectionId });
    }
    return await fetchProductsByWholesaleSection(targetWholesaleSectionId);
  }
  // Everything below this line is the existing retail-slug and company-only logic, COMPLETELY
  // UNCHANGED -- targetWholesaleSectionId is undefined/falsy on every retail call site (they never
  // pass a 4th argument), so this new branch is provably never taken there.
}
```

Both call sites — `render()`'s initial `fetchAndLabelProducts(sections, currentSlug, activeCompanyId, currentWholesaleSectionId)`
and `refetchAndSync()`'s re-fetch call — pass the same 4th argument. `refetchAndSync()` is reached
when the company facet changes on a `?wholesale_section=<id>&company=<companyId>` page (Decision 2
keeps that facet reused/wired) — missing the 4th argument there specifically would silently drop the
wholesale-section scope on that one interaction while the initial page load still worked correctly,
making it easy to ship unnoticed without deliberately testing a facet change mid-browse.

## Non-goals (explicitly out of scope for this contract)

- No change to `index.html`'s retail hero, `house-interactions.js`, or any retail-house-zone
  click behavior.
- No change to `category.html`'s retail-mode behavior for any existing param combination.
- No hidden-section-equivalent concept for wholesale sections (Decision 4).
- **No wholesale sidebar-nav or filter-panel section-facet in `category.html`** (Decision 2,
  revised during planning) — a shopper cannot switch wholesale sections from within the
  product-listing page itself; only the product grid, cart, and existing company facet are reused.
- No new page beyond `wholesale-sections.html` (per spec.md's explicit constraint) — this contract
  only edits existing pages plus that one new admin page (covered in `admin-ui.md`, not here).
