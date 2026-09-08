---

description: "Task list template for feature implementation"
---

# Tasks: Admin Control Center v2 — Retail/Wholesale Section Independence

**Input**: Design documents from `/specs/004-admin-control-center-v2/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks were requested in spec.md beyond the project's existing pure-logic/template convention (Constitution Principle VII). Each user story instead carries a manual verification task against its `quickstart.md` scenario, plus the two existing test files this feature must update.

**Organization**: Tasks are grouped by user story (spec.md priorities: US1/US2 = P1, US3/US4 = P2, US5 = P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths are included in every task description

## Path Conventions

Single static web project (no `backend/`/`frontend/` split) — paths are `src/`, `supabase/`, `tests/` at the repository root, per [plan.md](./plan.md)'s Project Structure.

---

## Phase 1: Setup

**Purpose**: Nothing new to scaffold — this feature extends an existing, already-initialized project (no new top-level directories, no new dependencies). Setup is a single verification task.

- [ ] T001 Verify local environment can reach the Supabase project used by prior features (`supabase/migrations/` numbering continues from `013`; confirm via `mcp__supabase__list_migrations` or `supabase migration list` that `013_companies_and_product_company.sql` is the latest applied migration before starting T002)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `wholesale_sections` table and its data-access layer are shared infrastructure required by both P1 stories (US1 creates/manages these rows; US2 reads them into the product form's `<select>`). Nothing in US1 or US2 can be implemented until this phase is done.

**⚠️ CRITICAL**: No US1 or US2 work can begin until this phase is complete. US3, US4, and US5 have no dependency on this phase and MAY be implemented in parallel with it (see Dependencies section).

- [ ] T002 Create migration `supabase/migrations/014_wholesale_sections.sql` — `wholesale_sections` table, `products.wholesale_section_id` column, `idx_products_wholesale_section_active_deleted` index, RLS policies (`"wholesale sections readable"`, `"merchant wholesale sections writes"`), and `prevent_html_in_wholesale_sections` trigger, exactly per [contracts/database-schema.md](./contracts/database-schema.md)
- [ ] T003 Apply migration T002 to the Supabase project (`apply_migration` / `supabase db push`) and verify with `get_advisors` (security) that no new findings appear beyond the already-accepted `is_admin()`-executable-by-anon/authenticated pattern already present for `companies`/`is_admin()`
- [ ] T004 [P] Add `wholesaleSections: 'wholesale_sections'` to `TABLES` in `src/js/constants.js`
- [ ] T005 [P] Create `src/js/wholesale-sections-api.js` with `fetchAllWholesaleSectionsAdmin()`, `createWholesaleSection()`, `updateWholesaleSection()`, `softDeleteWholesaleSection()`, exactly per [contracts/wholesale-sections-api.md](./contracts/wholesale-sections-api.md) (depends on T004 for `TABLES.wholesaleSections`)
- [ ] T006 [P] Add `['wholesale_sections', 'merchant wholesale sections writes']` to the `SENSITIVE_POLICIES` array in `tests/rls-admin-access.test.js` and run `npm test` to confirm it now passes against the applied migration (depends on T003)

**Checkpoint**: `wholesale_sections` exists, is RLS-protected, and has a working admin data-access module. US1 and US2 implementation can now begin.

---

## Phase 3: User Story 1 - Independent Wholesale Sections (Priority: P1) 🎯 MVP

**Goal**: The merchant can freely create, rename, reorder, and soft-delete wholesale sections through the admin UI, with zero effect on the retail `sections` table.

**Independent Test**: On the wholesale-sections area of `companies.html`, create a wholesale section, rename it, change its display order, and soft-delete another — confirm none of this touches `sections` (per [quickstart.md](./quickstart.md) Scenario 1).

### Implementation for User Story 1

- [ ] T007 [P] [US1] Add `renderWholesaleSectionFormFieldValues(editing)` and `renderWholesaleSectionRow(section)` to `src/js/admin/admin-templates.js`, mirroring `renderCompanyFormFieldValues`/`renderCompanyRow` (name, `display_order` display, active/inactive status badge, edit/delete buttons; no logo column), per [contracts/admin-ui.md](./contracts/admin-ui.md) §3
- [ ] T008 [US1] Extend `initializeCompaniesPage()` in `src/js/admin/companies-crud.js` to render a second, clearly separated "أقسام الجملة" section (form: name, `is_active` checkbox, `display_order` number input; list: table using T007's row template) below the existing companies section, wired to `fetchAllWholesaleSectionsAdmin()` / `createWholesaleSection()` / `updateWholesaleSection()` / `softDeleteWholesaleSection()` from `wholesale-sections-api.js` (depends on T005, T007)
- [ ] T009 [US1] Update `src/pages/admin/companies.html`'s `<title>` and `<h1>`/description copy to reflect both companies and wholesale-section management (e.g. "إدارة الشركات وأقسام الجملة"), per [contracts/admin-ui.md](./contracts/admin-ui.md) §3
- [ ] T010 [US1] Manually run [quickstart.md](./quickstart.md) Scenario 1 end-to-end (create/rename/reorder/soft-delete a wholesale section; confirm `sections` row count is unaffected before/after) and fix any issues found

**Checkpoint**: Wholesale sections are a fully independent, admin-manageable entity. User Story 1 is demoable on its own.

---

## Phase 4: User Story 2 - Independent Retail and Wholesale Product Placement (Priority: P1) 🎯 MVP

**Goal**: Each product's retail placement (section + `base_price`) and wholesale placement (wholesale section + company + `wholesale_price`) can be set and changed completely independently from the product admin form and seen at a glance in the product list.

**Independent Test**: Edit a product to set a retail section different from its wholesale section, assign a company and wholesale price, save, reload, and confirm both placements persisted and remain independently editable (per [quickstart.md](./quickstart.md) Scenario 2).

### Implementation for User Story 2

- [ ] T011 [US2] In `src/js/admin/products-crud.js`, import `fetchAllWholesaleSectionsAdmin` from `wholesale-sections-api.js`, fetch the list alongside the existing `sections`/`companies` fetches in `initializeProductsPage()`, and add a wholesale-section `<select name="wholesale_section_id">` to the form immediately alongside the existing company `<select>`, with a "بدون قسم جملة" empty option and pre-selection of `editing?.wholesale_section_id`, per [contracts/admin-ui.md](./contracts/admin-ui.md) §4 (depends on T005)
- [ ] T012 [US2] In the same form, visually group the company `<select>`, new wholesale-section `<select>`, and `wholesale_price` input under a "بيانات البيع بالجملة (اختياري)" sub-heading, separated from the retail fields (name, description, retail `section_id` `<select>`, `base_price`), per [contracts/admin-ui.md](./contracts/admin-ui.md) §4 (depends on T011)
- [ ] T013 [US2] In `products-crud.js`'s form submit handler, add `wholesale_section_id: data.wholesale_section_id || null` to the `updates` object alongside the existing `company_id`/`wholesale_price` lines (depends on T011)
- [ ] T014 [P] [US2] Extend `renderProductRow(product, sectionName)` in `src/js/admin/admin-templates.js` to `renderProductRow(product, sectionName, wholesaleSectionName, companyName)`, adding a second badge row showing the wholesale section and company names (or a muted "لا يوجد تصنيف جملة" placeholder when all three of wholesale section, company, and wholesale price are unset), per [contracts/admin-ui.md](./contracts/admin-ui.md) §4
- [ ] T015 [US2] In `products-crud.js`, build id→name lookup maps for wholesale sections and companies (from the lists already fetched in T011) and pass the resolved names into every `renderProductRow()` call site (depends on T011, T014)
- [ ] T016 [US2] Manually verify FR-017 end-to-end: the existing company `<select>` persists its value on create, pre-selects the product's current company on edit, and correctly clears back to "بدون شركة" — confirming research.md Decision 1's finding holds under the changes made in T011–T015
- [ ] T017 [US2] Manually run [quickstart.md](./quickstart.md) Scenario 2 end-to-end (independent retail/wholesale placement, round-trip after reload, clearing one placement leaves the other untouched, list view shows both) and fix any issues found

**Checkpoint**: Products carry two fully independent placements, visible and editable from the admin. User Stories 1 AND 2 both work independently — this is the feature's MVP.

---

## Phase 5: User Story 3 - Retail Storefront Section Metadata Management (Priority: P2)

**Goal**: The merchant can rename, reorder, enable/disable, and soft-delete the existing fixed set of retail sections, with no way to create new ones and no risk to the house hero.

**Independent Test**: Rename a section, reorder it, disable it, and soft-delete another on the retail sections admin page; confirm the house hero renders unchanged and no "add new section" control exists (per [quickstart.md](./quickstart.md) Scenario 3).

### Implementation for User Story 3

- [ ] T018 [P] [US3] Fix `softDeleteSection(id)` in `src/js/sections-api.js` to perform a real soft-delete (`update({deleted_at: new Date().toISOString()})` on the section row only, keeping the existing active-products guard, removing both hard `.delete()` calls), exactly per [contracts/wholesale-sections-api.md](./contracts/wholesale-sections-api.md)'s `sections-api.js` fix section
- [ ] T019 [P] [US3] Extend `renderSectionRow(section, index, iconSrc)` in `src/js/admin/admin-templates.js` to also accept and render `is_active` as a status badge (same badge markup as `renderCompanyRow`), per [contracts/admin-ui.md](./contracts/admin-ui.md) §2
- [ ] T020 [US3] In `src/js/admin/sections-crud.js`'s `initializeSectionsPage()`, remove the create path: default `editing` to the first fetched section (or show a clear "اختر قسمًا للتعديل" empty state if the list is empty) instead of `null`, and delete the submit handler's `createSection(...)` branch so only `updateSection(...)` is ever called, per [contracts/admin-ui.md](./contracts/admin-ui.md) §2 (depends on T019)
- [ ] T021 [US3] Add an `is_active` checkbox and a `display_order` numeric input to the section form in `sections-crud.js`, wired into the same `data` object passed to `updateSection()`, and pass `section.is_active` into T019's updated `renderSectionRow()` call (depends on T019, T020)
- [ ] T022 [US3] Update the delete-confirm dialog copy in `sections-crud.js` from "سيتم حذف القسم والمنتجات غير النشطة التابعة له" to "هل تريد حذف هذا القسم؟ سيتم إخفاؤه فقط، ولا يمكن حذفه إذا كان يحتوي على منتجات نشطة." to match the corrected behavior from T018 (depends on T018)
- [ ] T023 [US3] Manually run [quickstart.md](./quickstart.md) Scenario 3 end-to-end (no create control reachable; rename/reorder/disable a section and confirm the house hero's Frame 1/Frame 2 SVGs and zone shapes are pixel-identical to before; soft-delete a section with no active products and confirm its products are NOT removed) and fix any issues found

**Checkpoint**: Retail section metadata is admin-editable and the hard-delete bug is fixed, with the house hero fully unaffected. User Stories 1, 2, AND 3 all work independently.

---

## Phase 6: User Story 4 - Hybrid Invoice Item Entry (Priority: P2)

**Goal**: Confirm the already-working hybrid picker/manual invoice flow (research.md Decision 1) still behaves correctly, and add a `product_id` traceability pointer to picker-added line items.

**Independent Test**: Search and add a wholesale-priced product to a new invoice (name/price pre-fill, price editable), add a second manual line item, confirm both save correctly and only the picker-added one carries `product_id` (per [quickstart.md](./quickstart.md) Scenario 4).

### Implementation for User Story 4

- [ ] T024 [US4] Manually verify the existing invoice picker in `src/pages/admin/invoices.html` against spec.md's User Story 4 acceptance scenarios 1–5 (wholesale-only search results, pre-fill + editable price, manual entry still available, both mixable, empty-search state) with no code change — per research.md Decision 1, this flow already works; this task exists to catch any regression before T025 touches the same file
- [ ] T025 [US4] In `invoices.html`'s `btnAddCatalog.onclick` handler, add `product_id: selectedProduct.id` to the object pushed into `invoiceItems` (leave `btnAddCustom.onclick`'s pushed object unchanged, with no `product_id` key), per [contracts/admin-ui.md](./contracts/admin-ui.md) §5 (depends on T024 passing)
- [ ] T026 [US4] Manually run [quickstart.md](./quickstart.md) Scenario 4 step 6 (save an invoice with one picker-added and one manual line item; inspect the saved `invoices.items` jsonb and confirm exactly the picker-added line carries `product_id`) and fix any issues found

**Checkpoint**: Invoice line items are traceable to their source product where applicable, with the existing hybrid entry UX fully preserved. User Stories 1–4 all work independently.

---

## Phase 7: User Story 5 - Consistent Admin Navigation (Priority: P3)

**Goal**: The "إدارة الشركات" sidebar link appears on every admin page, not just the dashboard and companies page.

**Independent Test**: Visit `sections.html`, `products.html`, `invoices.html`, and `customers.html`; confirm each sidebar shows a working "إدارة الشركات" link (per [quickstart.md](./quickstart.md) Scenario 5).

### Implementation for User Story 5

- [ ] T027 [P] [US5] Insert the "إدارة الشركات" `<a>` nav block (inactive-state classes, `href="companies.html"`, `store` icon) into `src/pages/admin/sections.html`'s sidebar `<nav>`, immediately after the "إدارة المنتجات" link and before "إنشاء وطباعة فاتورة", per [contracts/admin-ui.md](./contracts/admin-ui.md) §1
- [ ] T028 [P] [US5] Insert the same nav block into `src/pages/admin/products.html`'s sidebar `<nav>` in the same position
- [ ] T029 [P] [US5] Insert the same nav block into `src/pages/admin/invoices.html`'s sidebar `<nav>` in the same position (note this `<aside>` carries an additional `no-print` class already — do not remove it)
- [ ] T030 [P] [US5] Insert the same nav block into `src/pages/admin/customers.html`'s sidebar `<nav>` in the same position
- [ ] T031 [US5] Manually run [quickstart.md](./quickstart.md) Scenario 5 (visit all four pages, confirm link position/style matches `dashboard.html`, confirm it navigates to `companies.html`)

**Checkpoint**: All five user stories are independently functional. Feature complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final regression pass across the whole feature.

- [ ] T032 [P] Add/update Vitest cases in `tests/admin-templates.test.js` covering `renderWholesaleSectionRow()`, `renderWholesaleSectionFormFieldValues()`, `renderSectionRow()`'s new `is_active` parameter, and `renderProductRow()`'s new `wholesaleSectionName`/`companyName` parameters (both populated and "no wholesale placement" cases)
- [ ] T033 Run `npm test` and confirm the full suite passes, including the updated `tests/rls-admin-access.test.js` (T006) and `tests/admin-templates.test.js` (T032)
- [ ] T034 Run `mcp__supabase__get_advisors` (security) one final time against the fully implemented feature and confirm no new findings beyond those already accepted for `companies`/`is_admin()` in prior features
- [ ] T035 Run the full [quickstart.md](./quickstart.md) top-to-bottom in one pass (all 5 scenarios) as a final end-to-end sanity check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS User Story 1 and User Story 2 only (US3, US4, US5 touch no part of `wholesale_sections`)
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2). Does NOT depend on User Story 1's admin-CRUD-page tasks (T007–T010) — it only needs `wholesale-sections-api.js`'s `fetchAllWholesaleSectionsAdmin()` (T005) to populate its `<select>`. In practice, having a few wholesale sections to choose from (created via US1) makes US2 easier to demo, so sequential delivery (US1 then US2) is the practical path even though the two are technically independent.
- **User Story 3 (Phase 5)**: No dependency on Foundational — can start in parallel with Phase 2/3/4
- **User Story 4 (Phase 6)**: No dependency on Foundational — can start in parallel with Phase 2/3/4/5
- **User Story 5 (Phase 7)**: No dependency on anything — can start immediately, in parallel with every other phase
- **Polish (Phase 8)**: Depends on all five user stories being complete

### Within Each User Story

- US1: T007 (templates) before T008 (page controller); T009 is a small independent copy edit; T010 last
- US2: T011 before T012/T013 (same file, sequential edits); T014 can run in parallel with T011–T013 (different file); T015 depends on both T011 and T014; T016/T017 last
- US3: T018 and T019 are independent ([P], different files); T020 depends on T019; T021 depends on T019+T020; T022 depends on T018; T023 last
- US4: T024 before T025 (same file — verify first, then edit); T026 last
- US5: T027–T030 are fully parallel (four different files, identical isolated edit); T031 last

### Parallel Opportunities

- T004 and T005 (Foundational) can run in parallel with each other once T002/T003 land, but T005 needs T004's constant
- T007 (US1) and T014 (US2) can run in parallel — different files, no shared state
- T018 and T019 (US3) can run in parallel — different files
- T027, T028, T029, T030 (US5) are all parallelizable — four independent files with an identical, isolated change
- Once Foundational (Phase 2) is done, US1 and US2 can be staffed in parallel; US3, US4, and US5 need no wait at all and can start from T001

---

## Parallel Example: Foundational + User Story 5 (no shared dependencies)

```bash
# These can all be dispatched together right after T001:
Task: "Insert nav link into src/pages/admin/sections.html (T027)"
Task: "Insert nav link into src/pages/admin/products.html (T028)"
Task: "Insert nav link into src/pages/admin/invoices.html (T029)"
Task: "Insert nav link into src/pages/admin/customers.html (T030)"
Task: "Fix softDeleteSection() in src/js/sections-api.js (T018)"
Task: "Extend renderSectionRow() in src/js/admin/admin-templates.js (T019)"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T006) — CRITICAL, blocks US1/US2
3. Complete Phase 3: User Story 1 (T007–T010)
4. Complete Phase 4: User Story 2 (T011–T017)
5. **STOP and VALIDATE**: run quickstart.md Scenarios 1–2 independently
6. Deploy/demo — this is the feature's real MVP (independent wholesale taxonomy + dual product placement); US3–US5 are polish/fixes on top

### Incremental Delivery

1. Setup + Foundational → wholesale sections exist and are queryable
2. User Story 1 → merchant can manage wholesale sections → Demo
3. User Story 2 → products carry independent dual placement → Demo (MVP complete)
4. User Story 3 → retail section metadata editable, hard-delete bug fixed → Demo
5. User Story 4 → invoice line items traceable, hybrid flow re-verified → Demo
6. User Story 5 → nav consistency → Demo
7. Polish (Phase 8) → final regression pass

### Parallel Team Strategy

With multiple developers:

1. One developer: T001–T006 (Setup + Foundational)
2. In parallel with the above, a second developer can immediately start US5 (T027–T031, zero dependencies) and a third can start US3 (T018–T023, zero dependencies) and US4 (T024–T026, zero dependencies)
3. Once Foundational lands: Developer A takes US1 (T007–T010), Developer B takes US2 (T011–T017)
4. All stories converge at Phase 8 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- research.md Decision 1 means T016 and T024 are verification tasks, not build tasks — do not re-implement the company `<select>` or the invoice picker from scratch; if either is found broken during verification, file it as a targeted bug-fix task against the specific line(s) found broken, not a rewrite
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
