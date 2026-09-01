# Quickstart: Validating Wholesale Companies Catalog and Filtering

Manual + automated validation steps, mapped to the spec's user stories and acceptance scenarios.
Run these after `/speckit-implement` has produced the artifacts described in `plan.md` /
`contracts/`.

## Prerequisites

1. Apply `supabase/migrations/013_companies_and_product_company.sql` (see
   `contracts/database-schema.md`) to your Supabase project (Dashboard SQL editor, or your usual
   migration-apply flow — this repo has no CLI migration runner configured).
2. Via `admin/companies.html`, create at least 2 companies (one **with** a logo, one **without** —
   to exercise the fallback-monogram edge case).
3. Via `admin/products.html`, for at least 2 different sections:
   - Assign 1+ product per section to each of the 2 companies, with a `wholesale_price` set.
   - Leave at least 1 product in one section **unassigned** (no company) but with a
     `wholesale_price` set — to exercise FR-013.
   - Leave at least 1 section with **no** wholesale-priced products at all — to exercise the
     empty-state (Acceptance Scenario 3, User Story 1).

## Automated checks

```bash
npm test
```

Confirm the new pure-logic suites pass:
- `tests/product-filters.test.js` — price range / company (incl. `null`/"unassigned") / section
  filter combinations, including a zero-match case.
- `tests/company-card-html.test.js` — HTML escaping + fallback monogram when `logo_url` is absent.
- `tests/rls-admin-access.test.js` — now also covers `['companies', 'merchant companies writes']`.

## User Story 1: Section-to-Company Wholesale Browsing (P1)

1. Open `index.html?pricing=wholesale`.
2. Tap a section that has wholesale companies (from Prerequisites step 3) →
   **expect** `wholesale-section-companies.html?section=<slug>` loads, showing a company grid
   (logo + name each) plus an "All products in this section" entry labeled with the section's
   name.
3. Tap a company card → **expect** `category.html?section=<slug>&company=<id>` shows only that
   company's products in that section.
4. Go back, tap the section's own "All products in this section" entry → **expect**
   `category.html?section=<slug>` shows every active wholesale product in the section, including
   the unassigned one from Prerequisites.
5. Repeat step 2 with the section that has **no** wholesale companies → **expect** a clear empty
   state with a way back to all sections (no dead end).

## User Story 2: Direct Company Browsing on Wholesale Homepage (P2)

1. On `index.html?pricing=wholesale`, locate the "شركاء النجاح والشركات" showcase → **expect** it
   lists the companies created in Prerequisites.
2. Tap a company card → **expect** `category.html?company=<id>` shows *all* of that company's
   active wholesale products across every section (not just one).
3. Open `index.html` **without** `?pricing=wholesale` (plain retail) → **expect** the companies
   showcase is absent and the house hero behaves exactly as before (Constitution Principle III
   unaffected).

## User Story 3: Multi-Criteria Product Filter Panel (P3)

1. From either entry path above, open any resulting `category.html` listing in wholesale mode →
   **expect** a visible filter panel with price min/max, company selection, and section selection.
2. If entered via section+company, **expect** that section and company are pre-selected in the
   panel.
3. Change the price range / toggle a company / change the section → **expect** the grid updates
   immediately (no visible reload, no URL navigation) and stays under ~150ms perceptibly.
4. On the "All products in this section" listing from User Story 1 step 4, **expect** the company
   filter includes an explicit "بدون شركة" option, and selecting it isolates the unassigned
   product.
5. Pick a filter combination matching zero products → **expect** a "لا توجد منتجات مطابقة" (no
   matching products) message with a working "reset filters" control.

## Edge cases

- **Invalid/soft-deleted section or company id**: manually visit `category.html?company=<bogus
  uuid>` (wholesale mode) → **expect** the existing descriptive error block + "return to catalog"
  button, not a blank page or unhandled exception.
- **Company without logo**: confirm the company card for the logo-less company (Prerequisites)
  renders a branded monogram/icon fallback instead of a broken `<img>`.
- **Retail isolation**: with `?pricing=normal` (or no pricing param at all), click through the
  normal section → category flow end-to-end → **expect** zero visible differences from before this
  feature (no company grid, no filter panel, identical empty/error states) — this is the SC-004
  regression gate.
