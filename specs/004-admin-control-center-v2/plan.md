# Implementation Plan: Admin Control Center v2 — Retail/Wholesale Section Independence

**Branch**: `004-admin-control-center-v2` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-admin-control-center-v2/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Two of the seven originally-reported gaps (the product form's company `<select>`, and the hybrid
invoice item-entry flow) were found already fully implemented during research and are treated as
verification-only (`research.md` Decision 1). The real remaining work: a new `wholesale_sections`
table — structurally mirroring `companies`, with zero coupling to retail `sections`
(`research.md` Decision 3) — plus a new `products.wholesale_section_id` column so each product
carries independent retail (`section_id`, `base_price`) and wholesale (`wholesale_section_id`,
`company_id`, `wholesale_price`) placements; a corrected `softDeleteSection()` that was silently
hard-deleting rows despite its name (`research.md` Decision 2); a consistent "إدارة الشركات" nav
link across all admin pages; wholesale-section CRUD folded into the existing `companies.html`
page; and retail section management on the existing `sections.html` page narrowed to
edit-only (rename/reorder/toggle/soft-delete — no create). The house hero, its SVG rendering, and
the fixed 12-zone retail layout are never touched.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES modules, no transpilation), HTML5, CSS3

**Primary Dependencies**: Supabase JS SDK (client-side, via `supabase-client.js`), Tailwind CSS
(CDN, no build step), Vitest (unit tests)

**Storage**: Supabase Postgres — new `wholesale_sections` table, new `products.wholesale_section_id`
column, and one new optional key (`product_id`) in the existing `invoices.items` jsonb shape; no
new Storage buckets (wholesale sections have no logo/binary asset)

**Testing**: Vitest, following existing `tests/*.test.js` conventions (pure-logic and template
unit tests only, per Constitution Principle VII)

**Target Platform**: Static site on Vercel; mobile-first, Arabic/RTL browser clients (admin panel
only for this feature — no storefront-facing pages change)

**Project Type**: Web application (single static frontend + Supabase backend — no separate
frontend/backend split, matches existing repo layout)

**Performance Goals**: No new performance target — admin CRUD screens at existing catalog scale
(tens of sections/companies, hundreds of products); no pagination or server-side aggregation
introduced, consistent with every existing admin page

**Constraints**: No-build-step architecture (Constitution Principle II); house hero SVG rendering,
`house-interactions.js`, and the fixed 12 retail zones MUST remain completely untouched
(spec.md Constraints); new tables MUST reuse the exact soft-delete + RLS + sanitize-trigger
pattern established by `013_companies_and_product_company.sql`, not a new pattern (spec.md
Constraints; `research.md` Decision 3)

**Scale/Scope**: Small merchant admin panel — 5 admin pages touched (4 get a one-block nav-link
addition, 2 get substantive CRUD changes), 1 new migration, 1 new `*-api.js` module, no new pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-First Development | spec.md written and validated (all checklist items pass) before this plan | PASS |
| II. No-Build-Step Architecture | No bundler/framework/drag-and-drop library introduced; reordering uses a plain numeric input (`research.md` Decision 7), not a new dependency | PASS |
| III. Two-Phase Auto-Opening House Hero | `house-interactions.js`, Frame 1/Frame 2 SVG rendering, and the fixed 12-zone set are not touched by any task in this plan — retail section admin changes only edit existing row metadata (name/order/active/deleted_at), never the SVGs or zone count | PASS |
| IV. Separation of Concerns | New Supabase calls live in `wholesale-sections-api.js`, following `sections-api.js`/`companies-api.js` conventions exactly; no inline `onclick`; new templates added to `admin-templates.js` alongside existing ones | PASS |
| V. Mobile-First, Arabic-First, RTL | All UI changes reuse existing Tailwind RTL admin patterns (`companies.html`/`sections.html`'s existing form/list layout) — no new visual language introduced | PASS |
| VI. Single Responsibility & Clean Code | Wholesale sections get their own table/module instead of overloading `sections`/`companies` (`research.md` Decision 3); `renderProductRow`/`renderSectionRow` gain additive parameters rather than duplicating near-identical row templates | PASS |
| VII. Testable Pure Logic | `admin-templates.js`'s new/changed template functions get Vitest coverage, following the existing `tests/admin-templates.test.js` pattern; no Supabase-calling function gets a new test file, consistent with how `companies-api.js`/`sections-api.js` are untested today (Principle VII scopes automated tests to pure logic, not network calls) | PASS |
| VIII. Soft-Delete by Default | `wholesale_sections.deleted_at` from day one; `softDeleteSection()`'s hard-delete bug is fixed to match this principle, not left in place (`research.md` Decision 2) | PASS |
| IX. Security Hardening | `wholesale_sections` RLS mirrors `companies`/`sections` exactly (public read active/non-deleted, admin-only writes via `public.is_admin()`, gated from its first version — never has a vulnerable bare-`authenticated` window); `sanitize_text_trigger()` attached from creation; `rls-admin-access.test.js`'s `SENSITIVE_POLICIES` regression guard extended to cover it | PASS |

No violations — Complexity Tracking table is not needed.

**Research-driven scope correction**: `research.md` Decision 1 found two of the seven originally-
reported items (product-form company select; hybrid invoice picker) already correctly
implemented. Per Constitution Principle VI ("No duplicated logic was introduced that already
exists elsewhere"), this plan treats them as verification tasks, not build tasks — see Summary.

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-control-center-v2/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── database-schema.md
│   ├── wholesale-sections-api.md
│   └── admin-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 014_wholesale_sections.sql      # NEW — wholesale_sections table, products.wholesale_section_id, RLS

src/
├── js/
│   ├── constants.js                    # EDIT — add TABLES.wholesaleSections
│   ├── sections-api.js                 # EDIT — fix softDeleteSection() to actually soft-delete
│   ├── companies-api.js                # reused as-is
│   ├── products-api.js                 # reused as-is (createProduct/updateProduct already pass arbitrary fields through)
│   ├── wholesale-sections-api.js       # NEW — admin CRUD data-access layer for wholesale sections
│   └── admin/
│       ├── admin-templates.js          # EDIT — renderSectionRow()/renderProductRow() gain params; new renderWholesaleSectionRow()/renderWholesaleSectionFormFieldValues()
│       ├── sections-crud.js            # EDIT — remove create path; add is_active/display_order controls
│       ├── companies-crud.js           # EDIT — add wholesale-sections CRUD section alongside existing companies CRUD
│       └── products-crud.js            # EDIT — add wholesale-section <select>; wire into submit; verify existing company <select> (FR-017)
├── pages/admin/
│   ├── dashboard.html                  # unchanged (nav link already present)
│   ├── sections.html                   # EDIT — add nav link
│   ├── products.html                   # EDIT — add nav link
│   ├── invoices.html                   # EDIT — add nav link; add product_id to catalog-picker line items
│   ├── customers.html                  # EDIT — add nav link
│   └── companies.html                  # EDIT — host new wholesale-sections CRUD area (nav link already present, self-referencing)

tests/
├── rls-admin-access.test.js            # EDIT — add wholesale_sections to SENSITIVE_POLICIES
└── admin-templates.test.js             # EDIT — cover new/changed row-template functions
```

**Structure Decision**: Single static web project (existing repo layout under `src/pages`,
`src/js`, `supabase/migrations`, `tests`) — no new top-level directories, no new pages. Wholesale
sections follow the exact three-layer pattern already established for companies: SQL migration →
`*-api.js` data layer → existing admin page(s) extended with a CRUD section, per `research.md`
Decision 6 (reusing `companies.html` and `sections.html` rather than adding a third page).

## Complexity Tracking

*No entries — Constitution Check has no violations.*

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | not run |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | not run (skipped by proportionality — see below) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clean (SCOPE_REDUCED) | 2 issues found, 2 resolved |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | not run |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | not run |

**Scope note:** this review was explicitly narrowed to the user's three named focus areas
(`softDeleteSection()` correctness, `wholesale_sections` RLS parity with `companies`, and the
blast radius of the `renderProductRow()`/`renderSectionRow()` signature changes) across
`contracts/database-schema.md` and `contracts/wholesale-sections-api.md` — not a full re-review
of all 004 planning artifacts, which already passed Constitution Check in `/speckit-plan`.

**Outside voice:** skipped for this pass. Finding 1 below was verified by executing the actual
migration logic live against the project's Supabase instance (in a rolled-back transaction) —
a stronger evidence class than a text-only second-model read — so a Codex pass was judged
disproportionate to a 2-file, 3-question review. Available on request for a broader pass.

**Findings resolved this review (2 total):**

1. **CRITICAL** (confidence 10/10, verified live) — `sanitize_text_trigger()` as originally
   contracted would fail every `INSERT`/`UPDATE` on `wholesale_sections` with
   `record "new" has no field "description"`, because the shared function's single boolean OR
   expression does not reliably short-circuit around a field that doesn't exist on the record —
   proven by running the exact trigger against a live temp table in a rolled-back transaction.
   `wholesale_sections` would have been the first table ever attached to this trigger without a
   `description` column (`products`/`companies` both have one, so this path was never exercised
   before). **Fix (also verified live):** restructured into nested `IF`/`END IF` statements,
   which PL/pgSQL genuinely skips when unentered, unlike a boolean expression →
   `contracts/database-schema.md`
2. (confidence 9/10, verified via grep across the full repo) — `renderProductRow()` has exactly
   two call sites in `products-crud.js` (initial render, live-filter re-render), both duplicating
   an identical lookup expression; the plan's original phrasing ("pass resolved names into every
   call site") risked either missing the second site or making the existing duplication worse. →
   extracted a shared `rowFor()` row-builder (fixes the pre-existing DRY violation instead of
   compounding it) and specified null-safe placeholder rendering for missing wholesale-placement
   names → `contracts/admin-ui.md`, `tasks.md` (T014, T015)

**What already exists (reused, not rebuilt):** `companies` table's exact soft-delete + RLS +
sanitize-trigger pattern (reused verbatim for `wholesale_sections`, per `research.md` Decision 3);
`softDeleteCompany()`'s soft-delete shape (reused as the fix template for `softDeleteSection()`);
`renderCompanyRow()`/`renderCompanyFormFieldValues()` (reused as the template for the new
wholesale-section row/form templates); `mapProductWithVariants()` in `products-api.js` (cited as
the existing precedent for the new `rowFor()` extraction, so this isn't a novel pattern for the
codebase).

**NOT in scope for this review pass:**
- Full 4-section review (Architecture/Code Quality/Test/Performance) of every 004 planning
  artifact — deferred; this pass targeted the 3 named questions only, and Test/Performance raised
  nothing beyond what `tasks.md`'s existing T032/T033 already cover at this feature's scale.
- A live database check found only `prevent_html_in_companies` currently attached in production —
  no `prevent_html_in_products` or `prevent_html_in_sections` trigger exists despite
  `003_db_constraints_validation.sql`'s function supporting both. This is a **pre-existing gap
  unrelated to this feature** (server-side XSS protection is currently missing for `products` and
  `sections` writes) — flagged per "see something, say something," not fixed here since it's
  outside the 2 files this review was scoped to and outside the 004 migration's blast radius.
  Worth a dedicated follow-up.

**VERDICT:** ENG REVIEW CLEARED (scope-reduced) — both findings resolved and folded into
`contracts/database-schema.md`, `contracts/admin-ui.md`, and `tasks.md` before implementation
begins.

NO UNRESOLVED DECISIONS
