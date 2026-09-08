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
