# Quickstart: Admin Control Center v3

Validation scenarios proving the feature works end-to-end. Run after implementation, in this order
(each depends on the previous one's data existing).

## Prerequisites

- Local or connected Supabase project with migrations through `014_wholesale_sections.sql` applied.
- An admin session (magic-link login) for the admin-panel scenarios.
- Browser devtools console open to catch any unexpected error during each step.

## 0. Apply migration 015

```
mcp__supabase__apply_migration  (015_wholesale_section_icon.sql, see contracts/database-schema.md)
```

Confirm via `mcp__supabase__list_tables` that `wholesale_sections.icon_name` exists (nullable,
varchar, no default). Run `mcp__supabase__get_advisors` (security) — expect no new findings.

## 1. US2/US3 — Create a wholesale section with an icon, from `wholesale-sections.html`

1. Log in as admin, navigate to `wholesale-sections.html` (via the sidebar's new "إدارة متجر الجملة"
   group once US4 is also implemented, or directly by URL before then).
2. Confirm the page shows only wholesale-section CRUD — no companies form/list anywhere on it.
3. Create a new section: name "مواد غذائية", pick an icon from the picker (confirm it's the same
   icon set/thumbnails as `sections.html`'s picker — same files, no "مميز" special-case shown here).
4. Confirm it appears immediately in the list with the chosen icon thumbnail.
5. Rename it, reorder it (change `display_order`), toggle it inactive then active again, and
   finally soft-delete a second throwaway section created for this step — confirm each action
   reflects in the list without a page reload.
6. Navigate to `companies.html` — confirm it shows only companies CRUD, no wholesale-section UI
   at all (US2 acceptance scenario 3/4).

## 2. US1 — Wholesale storefront reflects the section just created

1. Open the storefront with wholesale mode active (`?pricing=wholesale` once, then it persists via
   `sessionStorage` per `pricing-mode.js`) at `wholesale-home.html`.
2. Confirm "مواد غذائية" (from step 1) appears in the section grid, with its chosen icon.
3. Confirm no retail section names (e.g. "الغسالة", "بيت الراحة") appear anywhere on this page.
4. Click into "مواد غذائية" → `wholesale-section-companies.html?wholesale_section=<id>` loads,
   shows the section's name/icon in the header, and (if no products are assigned to it yet) the
   "مفيش شركات في القسم ده لسه" empty state with a working link back to `wholesale-home.html`.
5. Separately, open `index.html` (retail homepage, wholesale mode NOT active) — confirm the house
   hero's Frame 1 → Frame 2 animation and all 12 zones behave exactly as before this feature
   (`git diff` should show zero changes to `house-interactions.js`, `Frame 1.svg`, `Frame 2.svg`).

## 3. US1 (continued) — `category.html`'s narrow wholesale-section filtering branch (FR-019)

Requires at least one product with `wholesale_section_id` set to the section from step 1 and a
`wholesale_price > 0` (create via `products.html`'s existing wholesale-placement fields from
feature 004).

1. From `wholesale-section-companies.html?wholesale_section=<id>`, click "كل منتجات مواد غذائية" →
   confirm it lands on `category.html?wholesale_section=<id>` and shows that product, using the
   existing product grid and cart.
2. Confirm the retail sidebar-nav and the filter panel's slug-based "القسم" dropdown are **not**
   shown on this load — per research.md Decision 2, this mode reuses only the product grid, cart,
   and existing company facet, with no section-switching UI inside `category.html` itself.
3. If the product has a company assigned, click its company card from
   `wholesale-section-companies.html` → confirm it lands on
   `category.html?wholesale_section=<id>&company=<companyId>` and shows only that company's
   products in that section.
4. As a regression check: open `category.html?section=<any-real-retail-slug>` directly (retail
   mode) — confirm it behaves exactly as before this feature (unaffected code path).
5. As the Decision-3 check: manually visit `category.html?section=<any-slug>` while wholesale mode
   IS active — confirm it does NOT show retail-section products; it falls back to the no-section
   wholesale listing instead.

## 4. US4 — Sidebar restructure, all 7 pages

1. Visit each of `dashboard.html`, `products.html`, `sections.html`, `companies.html`,
   `wholesale-sections.html`, `invoices.html`, `customers.html` in turn.
2. On each, confirm: "الرئيسية" and "إدارة المنتجات" are always visible top-level links; "إدارة متجر
   المستهلك" and "إدارة متجر الجملة" are present as collapsible groups, in that order.
3. On `sections.html`, confirm "إدارة متجر المستهلك" is expanded by default and its one link
   ("إدارة أقسام متجر المستهلك") is visually marked active.
4. On `companies.html`, `wholesale-sections.html`, `invoices.html`, and `customers.html` in turn,
   confirm "إدارة متجر الجملة" is expanded by default each time, with the correct one of its four
   links marked active.
5. On `dashboard.html` and `products.html`, confirm neither group is force-expanded (both start
   collapsed, since the active link is a top-level one).
6. Click each group's header on a page where it starts collapsed — confirm it expands/collapses
   and reveals the correct links, each navigating to the correct page.

## 5. Verification-only — company logo upload (Decision 6)

1. On `companies.html`, create or edit a company, choose an image file in the logo field, save.
2. Confirm the image appears (as the company's logo, not a monogram fallback) in the company list
   and on any storefront company card (`company-card-html.js`'s output) that references it.
3. Edit the same company again WITHOUT touching the logo field, change only its name, save —
   confirm the logo is still present afterward (FR-011).

## 6. Full regression pass

- `npx vitest run` — all tests pass, including new coverage for `icon-picker.js`, `admin-nav.js`,
  `wholesale-section-grid-html.js`, and the extended `admin-templates.test.js` assertions.
- `git diff` confirms zero changes to `house-interactions.js`, `public/assets/Frame 1.svg`,
  `public/assets/Frame 2.svg`, and `index.html`'s hero markup.
- `mcp__supabase__get_advisors` (security) — no new findings versus the pre-feature baseline.
