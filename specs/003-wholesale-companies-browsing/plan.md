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
| III. Two-Phase Auto-Opening House Hero | Hero animation, `house-interactions.js`, and the house SVG rendering logic are completely untouched and are never invoked in wholesale mode — wholesale mode redirects to a fully separate dedicated homepage before any house code runs (corrected 2026-09-01; see `/speckit-clarify` session) | PASS |
| IV. Separation of Concerns | All new Supabase calls live in `companies-api.js` / extended `products-api.js`; no inline `onclick`; new HTML built in dedicated template modules (`company-card-html.js`) | PASS |
| V. Mobile-First, Arabic-First, RTL | New pages/sections follow the same Tailwind RTL patterns as `category.html`/`index.html` | PASS |
| VI. Single Responsibility & Clean Code | Shared per-product mapping logic extracted from `products-api.js` into a reusable helper instead of duplicated in `companies-api.js` | PASS |
| VII. Testable Pure Logic | New pure logic (`product-filters.js`, `company-card-html.js`) gets Vitest coverage | PASS |
| VIII. Soft-Delete by Default | `companies.deleted_at`; `products.company_id` nullable FK (`on delete set null`) as a safety net, soft-delete is the primary path | PASS |
| IX. Security Hardening | `companies` RLS mirrors `sections`/`products` exactly (public read active/non-deleted, admin-only writes via `public.is_admin()`); server-side `sanitize_text_trigger()` extended to `companies` (parity with `sections`/`products`); admin page gated by `requireAdmin()`, which is upgraded in this feature to actually check `public.is_admin()` rather than just session presence (plan-eng-review finding — see `contracts/ui-routes.md`); logo upload reuses the existing admin-gated `store-assets` storage policy | PASS |

No violations — Complexity Tracking table is not needed.

**Plan-eng-review addendum (2026-09-02):** a scoped review (companies table design, RLS, and
the client-side query pattern) plus an independent Codex outside-voice pass surfaced 9
findings beyond the original three-point scope — 2 CRITICAL (hidden-section product leak via
company-wide browsing; missing DB-level sanitize trigger on `companies`), the rest ranging
from real correctness gaps (`wholesale_price` predicate mismatch, inconsistent
deleted-company handling across routes, a `requireAdmin()` gap this feature inherits and now
fixes) to documentation drift (`updated_at` missing from the schema, filter API ambiguity).
All 9 were resolved and folded into `data-model.md`, `contracts/database-schema.md`,
`contracts/companies-api.md`, and `contracts/ui-routes.md` before `/speckit-tasks` runs — see
the `## GSTACK REVIEW REPORT` at the end of this file.

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
│   ├── products-api.js             # EDIT — export shared mapProductWithVariants() + getHiddenSectionContext() helpers
│   ├── companies-api.js            # NEW — storefront + admin data-access layer for companies
│   ├── company-card-html.js        # NEW — pure template (mirrors section-nav-html.js)
│   ├── product-filters.js          # NEW — pure client-side filter logic (price/company/unassignedOnly; section changes re-fetch, not filtered)
│   ├── house-interactions.js       # UNTOUCHED — never invoked in wholesale mode (index.html redirects before this module loads)
│   ├── wholesale-section-grid-html.js  # NEW — pure template for the wholesale-home.html section grid (mirrors section-nav-html.js; placeholder markup pending the separately-produced visual design)
│   └── admin/
│       ├── auth-gate.js            # EDIT — requireAdmin() now also checks public.is_admin() via RPC (plan-eng-review finding, benefits all 6 admin pages)
│       ├── admin-templates.js      # EDIT — add company row/form template helpers
│       └── companies-crud.js       # NEW — admin CRUD page controller (mirrors products-crud.js)
├── pages/
│   ├── index.html                          # EDIT — early wholesale-mode redirect (before any house SVG fetch), else fully unchanged
│   ├── category.html                       # EDIT — accepts &company=, validates it via fetchCompanyDetails() first, renders filter panel
│   ├── wholesale-home.html                 # NEW — dedicated wholesale homepage: section-grid entry view + "Browse Companies" showcase (visual design delivered separately via Claude Design; functional wiring only); redirects to index.html if wholesale mode is inactive
│   ├── wholesale-section-companies.html    # NEW — section's company grid + "All products" entry; redirects to category.html if wholesale mode is inactive
│   └── admin/
│       ├── dashboard.html          # EDIT — add "إدارة الشركات" nav link
│       └── companies.html          # NEW — admin CRUD page for companies

tests/
├── product-filters.test.js         # NEW
├── company-card-html.test.js       # NEW
├── auth-gate.test.js               # EDIT — add is_admin RPC mock + non-admin-session-rejected case
└── rls-admin-access.test.js        # EDIT — add companies write policy to SENSITIVE_POLICIES
```

**Structure Decision**: Single static web project (existing repo layout under `src/pages`,
`src/js`, `supabase/migrations`, `tests`) — no new top-level directories. Companies follow the
exact same three-layer pattern already established for sections/products: SQL migration → `*-api.js`
data layer → page(s) + admin CRUD controller.

## Complexity Tracking

*No entries — Constitution Check has no violations.*

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | not run |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | issues_found | 11 problems found (outside-voice pass, folded into Eng Review below) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean (SCOPE_REDUCED) | 9 issues found, 9 resolved |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | not run |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | not run |

**Scope note:** this review was explicitly narrowed to the user's three named focus areas
(`companies` table + nullable `company_id` FK design, RLS compatibility with the existing
`sections`/`products` pattern, and the client-side query/filter pattern) across `plan.md`,
`data-model.md`, and `contracts/database-schema.md` — not the full 4-section ceremony across
all 17 planned files. Code Quality and full Test-coverage-diagram review sections were not
run in full; `rls-admin-access.test.js` and `auth-gate.test.js` updates are noted as required
but not diagrammed branch-by-branch.

**CODEX:** independent outside-voice pass (gpt-5.5, read-only against the actual repo) found
11 problems the scoped review's original 2 findings didn't cover — 2 verified CRITICAL, the
rest real correctness/consistency gaps or documentation drift. All 11 were walked through
individually via AskUserQuestion and resolved.

**CROSS-MODEL:** No disagreement — Codex's findings were independently verified against
actual repository code (`pricing-mode.js`, `auth-gate.js`, `products-api.js`,
`006_wholesale_pricing.sql`) before being presented, and one additional finding (missing
`companies` sanitize trigger, parity with `003_db_constraints_validation.sql`) was found by
the reviewer during that verification pass, independent of Codex.

**Findings resolved this review (11 total):**
1. `companies.slug` unique constraint would collide with soft-deleted rows → partial unique index scoped to `deleted_at is null` (`contracts/database-schema.md`)
2. `fetchCompaniesForSection()` over-fetches full product+variant rows for the grid → kept as-is with an explicit ~500-products-per-section revisit threshold documented (`contracts/companies-api.md`)
3. **CRITICAL** — hidden-section product leak via `fetchProductsByCompany()`/`fetchActiveCompanies()` → shared `getHiddenSectionContext()` helper extracted (also fixes a pre-existing 3x DRY violation) and applied to both new functions (`contracts/companies-api.md`)
4. **CRITICAL** — no DB-level sanitize trigger on `companies` (Constitution IX) → `prevent_html_in_companies` trigger added, shared function extended (`contracts/database-schema.md`)
5. `wholesale-section-companies.html` doesn't check `isWholesaleMode()` before rendering → redirects to `category.html?section=<slug>` when inactive (`contracts/ui-routes.md`)
6. Inconsistent deleted/inactive-company handling across the two company-scoped routes → both now validate via `fetchCompanyDetails()` first with the spec's existing friendly empty-state (`contracts/companies-api.md`, `contracts/ui-routes.md`)
7. Filter panel's "150ms, no reload" claim doesn't hold for section/company facet changes → documented as a real re-fetch, only price/company-narrowing stay pure client-side (`data-model.md`, `contracts/ui-routes.md`)
8. `fetchActiveCompanies()`'s `wholesale_price is not null` vs. `filterWholesaleProducts()`'s `> 0` → aligned to `> 0` (`contracts/companies-api.md`)
9. `requireAdmin()` mischaracterized as an admin gate; only checks session, not `is_admin()` → upgraded to call `public.is_admin()` via RPC, benefiting all 6 admin pages (`plan.md`, `contracts/ui-routes.md`)
10. `updated_at` in spec.md's Key Entities but missing from the schema → added, set explicitly by `updateCompany()` (`contracts/database-schema.md`, `contracts/companies-api.md`)
11. `applyProductFilters()`'s `companyId` overloaded for both "no filter" and "unassigned" → split into separate `companyId`/`unassignedOnly` parameters (`data-model.md`)

**VERDICT:** ENG REVIEW CLEARED (scope-reduced) — the three areas the user asked about, plus
everything the outside-voice pass surfaced in verifying them, are resolved in the design
docs.

**Decision (2026-09-02): remaining-file review method.** Code-quality review for the files
not covered by this scoped pass — the admin CRUD pages, `company-card-html.js`,
`product-filters.js`, and `wholesale-home.html`'s full contract beyond the gating fix above —
will happen via Superpowers' `requesting-code-review` during implementation (one dispatch per
completed task/component, against the actual diff), not via an additional `/plan-eng-review`
pass before `/speckit-tasks` runs. `/speckit-tasks` can proceed straight from the current
design docs.

NO UNRESOLVED DECISIONS
