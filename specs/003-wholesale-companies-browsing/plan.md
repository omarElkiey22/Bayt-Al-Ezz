# Implementation Plan: Wholesale Companies Catalog and Filtering

**Branch**: `003-wholesale-companies-browsing` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-wholesale-companies-browsing/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

In wholesale mode only, merchants get two new browsing paths into the existing product catalog —
section → company grid → products, and homepage → company → products across all sections — plus a
price/company/section filter panel on every resulting product listing. This is implemented as a
new `companies` table with a nullable `products.company_id` FK, RLS mirroring the existing
`sections`/`products` public-read/admin-write pattern, a `companies-api.js` data-access module
following the `sections-api.js`/`products-api.js` conventions, two new/extended storefront pages,
an admin CRUD page for companies, and a pure client-side filter function. Consumer (retail) mode
is untouched — every new code path is gated behind the existing `isWholesaleMode()` check from
`pricing-mode.js`.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES modules, no transpilation), HTML5, CSS3

**Primary Dependencies**: Supabase JS SDK (client-side, via `supabase-client.js`), Tailwind CSS
(CDN, no build step), Vitest (unit tests)

**Storage**: Supabase Postgres (new `companies` table + `products.company_id` column); company
logos stored as URLs in Supabase Storage (`store-assets` bucket, `companies/` path prefix) — no
binary data in the database

**Testing**: Vitest, following existing `tests/*.test.js` conventions (pure-logic unit tests only,
per Constitution Principle VII)

**Target Platform**: Static site on Vercel; mobile-first, Arabic/RTL browser clients

**Project Type**: Web application (single static frontend + Supabase backend — no separate
frontend/backend split, matches existing repo layout)

**Performance Goals**: Filter panel updates the product grid in <150ms with no page reload (SC-003)
— achieved by filtering an already-fetched, in-memory product array client-side

**Constraints**: No-build-step architecture (Constitution Principle II); retail/consumer mode must
remain 100% behaviorally unchanged (SC-004); RLS required on every table, no exceptions
(Constitution Principle IX)

**Scale/Scope**: Small merchant catalog (tens of companies, hundreds of products) — no pagination
or server-side aggregation needed; all new queries follow the existing plain-PostgREST-select +
client-side-filter style already used by `searchProducts()` in `products-api.js`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-First Development | spec.md written & clarified before this plan | PASS |
| II. No-Build-Step Architecture | No bundler/framework introduced; ES modules + Supabase SDK only | PASS |
| III. Two-Phase Auto-Opening House Hero | Hero animation untouched; only the section-zone click *target URL* gains a wholesale-mode branch | PASS |
| IV. Separation of Concerns | All new Supabase calls live in `companies-api.js` / extended `products-api.js`; no inline `onclick`; new HTML built in dedicated template modules (`company-card-html.js`) | PASS |
| V. Mobile-First, Arabic-First, RTL | New pages/sections follow the same Tailwind RTL patterns as `category.html`/`index.html` | PASS |
| VI. Single Responsibility & Clean Code | Shared per-product mapping logic extracted from `products-api.js` into a reusable helper instead of duplicated in `companies-api.js` | PASS |
| VII. Testable Pure Logic | New pure logic (`product-filters.js`, `company-card-html.js`) gets Vitest coverage | PASS |
| VIII. Soft-Delete by Default | `companies.deleted_at`; `products.company_id` nullable FK (`on delete set null`) as a safety net, soft-delete is the primary path | PASS |
| IX. Security Hardening | `companies` RLS mirrors `sections`/`products` exactly (public read active/non-deleted, admin-only writes via `public.is_admin()`); admin page gated by `requireAdmin()`; logo upload reuses the existing admin-gated `store-assets` storage policy | PASS |

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-wholesale-companies-browsing/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── database-schema.md
│   ├── companies-api.md
│   └── ui-routes.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 013_companies_and_product_company.sql   # NEW — companies table, products.company_id, RLS

src/
├── js/
│   ├── constants.js                # EDIT — add TABLES.companies
│   ├── pricing-mode.js             # reused as-is (isWholesaleMode, filterWholesaleProducts)
│   ├── sections-api.js             # reused as-is (fetchActiveSections)
│   ├── products-api.js             # EDIT — export shared mapProductWithVariants() helper
│   ├── companies-api.js            # NEW — storefront + admin data-access layer for companies
│   ├── company-card-html.js        # NEW — pure template (mirrors section-nav-html.js)
│   ├── product-filters.js          # NEW — pure client-side filter logic (price/company/section)
│   ├── house-interactions.js       # EDIT — wholesale-mode routing branch on zone/label click
│   └── admin/
│       ├── auth-gate.js            # reused as-is (requireAdmin)
│       ├── admin-templates.js      # EDIT — add company row/form template helpers
│       └── companies-crud.js       # NEW — admin CRUD page controller (mirrors products-crud.js)
├── pages/
│   ├── index.html                          # EDIT — wholesale-only "Browse Companies" showcase
│   ├── category.html                       # EDIT — accepts &company=, renders filter panel
│   ├── wholesale-section-companies.html    # NEW — section's company grid + "All products" entry
│   └── admin/
│       ├── dashboard.html          # EDIT — add "إدارة الشركات" nav link
│       └── companies.html          # NEW — admin CRUD page for companies

tests/
├── product-filters.test.js         # NEW
├── company-card-html.test.js       # NEW
└── rls-admin-access.test.js        # EDIT — add companies write policy to SENSITIVE_POLICIES
```

**Structure Decision**: Single static web project (existing repo layout under `src/pages`,
`src/js`, `supabase/migrations`, `tests`) — no new top-level directories. Companies follow the
exact same three-layer pattern already established for sections/products: SQL migration → `*-api.js`
data layer → page(s) + admin CRUD controller.

## Complexity Tracking

*No entries — Constitution Check has no violations.*
