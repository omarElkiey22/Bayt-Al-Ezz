# Phase 0 Research: Admin Control Center v2

## Decision 1: Two of the seven requested items are already implemented — verified, not rebuilt

**Decision**: Before designing anything new, the current codebase was read against every item in
the feature description. Two full pieces of the requested scope already exist and work correctly:

1. **The product form's company `<select>` (originally reported as a T014 gap)** —
   `src/js/admin/products-crud.js` lines 82-86 already render a company dropdown wired to
   `name="company_id"`, pre-selecting `editing?.company_id` on edit, and line 393 already saves
   `company_id: data.company_id || null` on create/update. `fetchAllCompaniesAdmin()` is already
   imported and called.
2. **The hybrid invoice item-entry flow (User Story 4 / item 7 in the request)** —
   `src/pages/admin/invoices.html`'s inline script already implements this in full:
   `loadCatalogProducts()` filters to `wholesale_price !== null/undefined && > 0` (FR-011),
   `selectCatalogProduct()` pre-fills name/price into an editable `#input-catalog-price` field
   (FR-012), a separate "بند يدوي مخصص" block adds fully manual line items (FR-013), and both push
   into the same `invoiceItems` array used for totals (FR-014).

**Rationale**: Building either of these from scratch would duplicate working code, violate
Constitution Principle VI (no duplicated logic), and waste implementation effort on FRs that
already pass their acceptance scenarios today.

**Alternatives considered**: Re-implement per the original request text anyway, in case the
report of "never implemented" reflected a subtlety not visible from a static read (e.g., a
runtime error masking otherwise-correct-looking code). Rejected for this plan — the code paths
are straightforward (no dynamic imports, no conditional branches that would silently disable
them) and read as fully wired. If a runtime issue surfaces during implementation, it becomes a
bug-fix task against this already-correct code, not a rebuild.

**Consequence for scope**: `tasks.md` (next phase) MUST NOT include "build the company select" or
"build the hybrid invoice picker" as net-new work. It should include a lightweight verification
task for each (matching spec.md's FR-017), plus — for the invoice flow specifically — the one
real gap found: line items carry no reference back to which catalog product/company/wholesale
section they came from, which matters once wholesale sections exist (Decision 5 below).

## Decision 2: `sections-api.js`'s `softDeleteSection()` does not actually soft-delete — this is a real bug in scope for User Story 3

**Decision**: `softDeleteSection(id)` currently (a) blocks if the section has active products,
then (b) **hard-deletes** every product row referencing the section (`db.from(products).delete()`,
no `deleted_at` filter — even already-soft-deleted products are purged) and (c) **hard-deletes**
the section row itself (`db.from(sections).delete()`). This contradicts its own name, contradicts
Constitution Principle VIII ("Deleting sections or products MUST use soft-delete... Hard-delete
MAY only be used for data with no external references and with explicit approval"), and
contradicts spec.md's FR-005 and edge cases, which require retail section deletion to be a real
soft-delete consistent with `softDeleteCompany()`'s correct pattern (`update({deleted_at: ...})`).

**Rationale**: This feature explicitly asks for retail sections to be "soft-delet[able]" (item 3)
— shipping a "soft delete" admin action that actually hard-deletes rows would fail SC-005/FR-005
outright and is a pre-existing correctness bug this feature is positioned to fix, since it's
already touching this exact function's call site (User Story 3's admin page).

**Alternatives considered**: Leave `softDeleteSection()` untouched and only add rename/reorder/
enable-disable on top of it. Rejected — the spec's edge case ("soft-deleted while products still
assigned") and FR-005 are unambiguous about the expected behavior, and leaving a function named
"soft delete" doing a hard delete is exactly the kind of latent data-loss bug that should be fixed
when its behavior becomes spec'd, not left for a future incident.

**Fix**: `softDeleteSection(id)` becomes: keep the existing active-products guard (still blocks
deleting a section that has active products — matches the existing confirm-dialog copy in
`sections-crud.js`), then `update({ deleted_at: new Date().toISOString() })` on the section row
only. No product rows are touched (mirrors `softDeleteCompany()` exactly, which never cascades
into `products`).

## Decision 3: Wholesale sections get their own table, mirroring `companies` exactly — not a `type` column on `sections`

**Decision**: New `wholesale_sections` table, structurally identical to `companies`
(`id, name, display_order, is_active, created_at, updated_at, deleted_at` — no `slug`/`logo_url`,
see Decision 4), with its own RLS policies and its own sanitize trigger attachment, plus a new
nullable `products.wholesale_section_id` column.

**Rationale**: Spec.md (FR-001) requires wholesale sections to share **zero** rows, foreign keys,
or parity constraints with retail `sections` — a `type` discriminator column on the existing
`sections` table would still force both concepts through the same table (same `MAX_SECTIONS`
cap, same slug-uniqueness index, same icon-picker assumptions baked into `sections-crud.js`),
recreating exactly the coupling the spec explicitly rules out. A dedicated table is also the
established project pattern: `companies` (013) was added as its own table rather than folded into
`sections` for the same independence reason, and the constraint in spec.md explicitly asks to
reuse that same pattern.

**Alternatives considered**:
- *Discriminator column on `sections`* — rejected per FR-001 (see above).
- *Reuse the `companies` table with a `type: 'wholesale_section'` row* — rejected; companies and
  wholesale sections are different entities (a wholesale section has no logo/description-driven
  browsing role), and conflating them would break the existing `companies-api.js` query shapes
  that assume every row is a real company.

## Decision 4: `wholesale_sections` has no `slug` or `logo_url` column

**Decision**: Unlike `companies` and retail `sections`, `wholesale_sections` does not get a
`slug` column, and has no logo concept.

**Rationale**: Nothing in spec.md routes to a wholesale section by URL slug — products reference
it by `wholesale_section_id` (uuid), and the admin UI lists/selects it by name, same as how the
product form's existing company `<select>` and section `<select>` already work by id, not slug.
Adding an unused slug column (with its own partial-unique-index ceremony) would be speculative
complexity with no FR behind it (Constitution Principle VI). A logo has no described purpose for
a wholesale section (companies have logos because they're browsable brand cards in wholesale
storefront mode; wholesale sections are a plain organizing taxonomy per FR-001/FR-002).

**Alternatives considered**: Add `slug` now for future-proofing (in case a future feature wants
wholesale-section-scoped storefront URLs, mirroring `wholesale-section-companies.html`'s existing
`?section=<slug>` pattern for retail sections). Rejected for this plan — no current FR needs it,
and it can be added later as a normal migration (`ADD COLUMN IF NOT EXISTS`) without breaking
anything, exactly as `products.wholesale_price` and `products.company_id` were both added
incrementally over the project's history.

## Decision 5: Invoice line items gain an optional `product_id` reference; no other invoice-schema change

**Decision**: The `invoices.items` jsonb array's per-item shape gains one new optional key,
`product_id` (the source product's id when the line item came from the search picker; absent for
manual entries). No new column on `invoices` itself, no new table.

**Rationale**: User Story 4's acceptance scenarios (spec.md) only require that a picker-added
line item pre-fills name/price and stays editable, and that manual/picker items can mix — both
already work today per Decision 1. The one gap worth closing while this feature is already
touching product placement: today a saved invoice line item is a bare `{title, unitPrice,
quantity}` snapshot with no traceable link back to the catalog product, company, or wholesale
section it came from, which forecloses any future "wholesale sales by section/company" reporting
without this plan needing to build that reporting now. Adding the id is a one-field, backward-
compatible addition (existing manual-entry items simply omit it, same as today) that keeps that
door open at near-zero cost, consistent with Constitution Principle VIII's snapshot-at-creation
approach (the id is stored for traceability; price/name remain frozen at invoice-creation time
regardless of later catalog edits, per spec.md's Key Entities section).

**Alternatives considered**: Normalize invoice line items into their own table
(`invoice_line_items`) with a real FK to `products`. Rejected as disproportionate to what any
current FR asks for — `invoices.items` as a jsonb blob is the established pattern
(`008_invoice_payments_and_debts.sql` onward) and no spec requirement here needs relational
querying over line items.

## Decision 6: Retail sections admin page loses its "create" form entirely; wholesale sections and companies share one admin page

**Decision**: `sections.html`/`sections-crud.js` (existing retail-sections admin page) is edited
to remove the "add new section" form path — the form only ever renders in edit mode, and the
`display_order`/`is_active` controls (new) and delete action operate on the existing 12+1 rows
only. `companies.html`/`companies-crud.js` (existing companies admin page) is extended with a
second, clearly separated management area for `wholesale_sections` CRUD, alongside its existing
companies CRUD — no third page is created.

**Rationale**: Directly implements spec.md item 5 / FR-006 ("two separate, dedicated admin
pages: one for retail sections only, one for wholesale sections + companies together") using the
two admin pages that already exist for exactly those two domains, rather than standing up a new
page and duplicating either page's list/form chrome (Constitution Principle VI).

**Alternatives considered**: A brand-new `wholesale-sections.html` page, separate from
`companies.html`. Rejected — spec.md explicitly groups wholesale sections with companies on one
page ("AND companies together"), and `companies.html` already has the exact list+form layout
pattern this reuses.

## Decision 7: Reordering uses a numeric `display_order` field editable per row, not drag-and-drop

**Decision**: Both retail sections (existing `display_order` column) and the new
`wholesale_sections.display_order` column are reordered via a small numeric input (or up/down
step buttons) per row that persists immediately via `updateSection()`/`updateWholesaleSection()`.

**Rationale**: `sections.display_order` already exists and is already the sort key
(`fetchAllSectionsAdmin()` orders by it); there is no drag-and-drop infrastructure anywhere in
this vanilla-JS, no-build-step codebase (Constitution Principle II rules out pulling in a
drag-and-drop library for this). A numeric control is the minimal UI that satisfies FR-003's
"reorder" requirement without new dependencies.

**Alternatives considered**: HTML5 native drag-and-drop (`draggable="true"` + `dragstart`/`drop`
handlers, no external library). Technically possible without a new dependency, but meaningfully
more code/testing surface for a low-frequency admin action (sections/wholesale sections change
order rarely, not per-visit); deferred as a future enhancement, documented here rather than
silently dropped.
