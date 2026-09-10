---

description: "Task list for feature 005-admin-control-center-v3"
---

# Tasks: Admin Control Center v3 — Wholesale Storefront Wiring, Page Split & Nav Restructure

**Input**: Design documents from `specs/005-admin-control-center-v3/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included, scoped per Constitution Principle VII — pure template/logic functions only (icon-picker rendering, admin-nav rendering, the wholesale section-grid template, icon_name coverage in admin-templates). Functions that call Supabase directly (every `*-api.js` addition) are **not** unit-tested, consistent with every prior feature's precedent in this codebase.

**Organization**: Tasks are grouped by user story (US1–US4, priority order from spec.md), matching the dependency chain spec.md itself documents: US1 is independent; US2 is independent; US3 depends on US2 (the icon field is added to the page US2 creates); US4 depends on US2 (one of its links targets the page US2 creates).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with sibling tasks in the same wave (different files, prerequisites already satisfied)
- **[Story]**: Which user story this task belongs to (US1–US4)
- File paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Confirm the baseline this feature builds on, before any code changes.

- [x] T001 Confirm branch `005-admin-control-center-v3` is checked out, migrations through `014_wholesale_sections.sql` are applied (`mcp__supabase__list_migrations`), and `npx vitest run` is green on the current baseline.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by every user story.

**None for this feature.** Unlike feature 004 (which needed a shared trigger fix before any table could safely use it), this feature has no schema change, shared module, or fix that more than one user story depends on — each story's own prerequisites are scoped to that story's phase below (e.g., migration 015 is US3-only; `admin-nav.js` is US4-only). Proceed directly to Phase 3.

---

## Phase 3: User Story 1 - Wholesale storefront shows merchant-curated wholesale sections (Priority: P1) 🎯 MVP

**Goal**: wholesale-home.html, wholesale-section-companies.html, and category.html's new filtering branch all read from `wholesale_sections`, never from the retail `sections` table — while the retail house/consumer storefront stays provably untouched.

**Independent Test**: Per spec.md — with `wholesale_sections` populated (or empty, production's actual starting state), load wholesale-home.html and confirm it lists wholesale sections only; drill into one, confirm wholesale-section-companies.html and its onward links into category.html filter by that wholesale section's id, never a retail slug; separately confirm the retail house page is pixel- and behavior-identical before/after.

### Data-access layer for User Story 1

- [x] T002 [P] [US1] Add `fetchActiveWholesaleSections()` to `src/js/wholesale-sections-api.js` — storefront-facing, mirrors `fetchActiveSections()` exactly (active + non-deleted, ordered by `display_order`, no hidden-section gating per research.md Decision 4). See `contracts/wholesale-section-browsing.md`.
- [x] T003 [P] [US1] Add `fetchProductsByWholesaleSection(wholesaleSectionId)` to `src/js/products-api.js` — mirrors `fetchProductsBySection(slug)` keyed by id + `wholesale_section_id`, no hidden-section check. See `contracts/wholesale-section-browsing.md`.
- [x] T004 [US1] Add `fetchCompaniesForWholesaleSection(wholesaleSectionId)` to `src/js/companies-api.js` — mirrors `fetchCompaniesForSection(slug)`, built on `fetchProductsByWholesaleSection()`. Same file as T005 — do after T003. (depends on: T003)
- [x] T005 [US1] Extend `fetchProductsByCompany(companyId, options)` in `src/js/companies-api.js` with a new mutually-exclusive `wholesaleSectionId` option alongside the existing `sectionSlug`. Same file as T004 — do sequentially after it. (depends on: T003, T004)
- [x] T006 [P] [US1] Update `buildWholesaleSectionGridEntryHTML(section)` in `src/js/wholesale-section-grid-html.js` — link target changes from `wholesale-section-companies.html?section=<slug>` to `wholesale-section-companies.html?wholesale_section=<id>` (`section.slug` no longer exists on the row — Decision 1).
- [x] T007 [P] [US1] Create `tests/wholesale-section-grid-html.test.js` — pure-template coverage for `buildWholesaleSectionGridEntryHTML()`: links by id (not slug), escapes name against tag injection, falls back gracefully when `icon_name` is absent.

### Storefront page rewiring for User Story 1

- [x] T008 [P] [US1] Rewire `src/pages/wholesale-home.html`: `fetchActiveSections()` → `fetchActiveWholesaleSections()`. Everything else (skeleton, empty state, "Browse Companies" showcase) unchanged. (depends on: T002, T006)
- [x] T009 [P] [US1] Rewire `src/pages/wholesale-section-companies.html`: query param `?section=<slug>` → `?wholesale_section=<id>`; data source `fetchActiveWholesaleSections()` + `.find(s => s.id === id)`; companies fetch → `fetchCompaniesForWholesaleSection(id)`; the "all products" banner and every company card link to `category.html?wholesale_section=<id>[&company=<id>]` instead of the retail-slug URL. See `contracts/wholesale-section-browsing.md`. (depends on: T002, T004)

### `category.html`'s narrow wholesale-section filtering branch (FR-019) — same file, sequential

> Detailed per `/plan-eng-review` (US1 focus review): the three tasks below implement the concrete
> pseudocode in `contracts/wholesale-section-browsing.md`'s `category.html` section exactly —
> follow it line-by-line, not just the one-line task summaries, since the summaries were the level
> that review found underspecified (a guaranteed crash and a real retail-data-leak path both trace
> back to gaps at this level of detail).

- [x] T010 [US1] In `src/pages/category.html`: parse `wholesaleSectionId = getQueryParam('wholesale_section')`; compute `effectiveSlug = isWholesaleMode() ? null : slug` **once** and use it everywhere `slug` is currently read for scoping (the redirect guard, the initial `currentSlug` assignment, `resetFilters()`'s dirty-check) — not just in a new branch elsewhere (research.md Decision 3; contract's "redirect guard and `slug` neutralization" subsection has the exact before/after). Extend the redirect guard's condition to also allow a bare `wholesale_section` through — see the contract; without this, the feature's primary entry point (a bare `?wholesale_section=<id>` load) redirects to `index.html` before ever reaching T011. (depends on: T003, T004, T005)
- [x] T011 [US1] In `src/pages/category.html`'s `fetchAndLabelProducts()`: add `targetWholesaleSectionId` as an explicit 4th parameter (after the existing three — mirrors how `targetCompanyId` is already explicit, not a closure read) with a wholesale-section branch checked first, calling `fetchProductsByWholesaleSection()` / `fetchProductsByCompany(id, { wholesaleSectionId })` and labeling the header/breadcrumb via `fetchActiveWholesaleSections()` + `.find(id)` resolved fresh inside the branch. Update **both** call sites — `render()`'s initial call and `refetchAndSync()`'s re-fetch call — to pass `currentWholesaleSectionId` as that 4th argument; missing it on `refetchAndSync()` specifically silently drops the section scope on a company-facet change while the initial load still works, so test that interaction explicitly, not just the initial load. Also guard `render()`'s `fetchActiveSections()`/`loadNavigation()` call to not run at all in this mode (SC-001 — see contract). (depends on: T010)
- [x] T012 [US1] In `src/pages/category.html`: make `buildFilterPanelHTML()` omit the "القسم" `<select>` block entirely (not just leave it unpopulated) when `currentWholesaleSectionId` is set, **and** null-guard every existing reference to `document.getElementById('filter-section')` (`wireFilterPanelEvents()` and `refetchAndSync()`) — omitting the element without guarding those references throws a `TypeError` on the very first `?wholesale_section=<id>` load and crashes the whole filter panel, including the company facet and price inputs this mode must keep working. The "الشركة" `<select>` and price inputs need no changes — they already work generically. (depends on: T011)

**Checkpoint**: User Story 1 is fully functional and independently testable — run quickstart.md sections 2–3, plus the retail-regression check in section 2 step 5.

---

## Phase 4: User Story 2 - Admin manages wholesale sections on their own dedicated page (Priority: P2)

**Goal**: wholesale-sections.html is a standalone admin page with full wholesale-section CRUD (create/rename/reorder/activate-deactivate/soft-delete); companies.html reverts to companies-only.

**Independent Test**: Per spec.md — navigate to wholesale-sections.html directly, create/rename/reorder/soft-delete a wholesale section with no dependency on companies.html being open; separately confirm companies.html shows no wholesale-section UI.

- [x] T013 [US2] Create `src/js/admin/wholesale-sections-crud.js` exporting `initializeWholesaleSectionsPage(root)` — **move** (not copy) the wholesale-section CRUD block feature 004 built inside `companies-crud.js` (form, list, `editingWholesaleSection` state, `fetchAllWholesaleSectionsAdmin`/`createWholesaleSection`/`updateWholesaleSection`/`softDeleteWholesaleSection` calls) into this new file, unchanged in capability. See `contracts/admin-ui.md` / research.md Decision 8.
- [x] T014 [P] [US2] Create `src/pages/admin/wholesale-sections.html` — page shell mirroring `sections.html`'s (same head/mobile-topbar/sidebar/logout wiring pattern), mounting `initializeWholesaleSectionsPage()` from T013. (depends on: T013)
- [x] T015 [P] [US2] Trim `src/js/admin/companies-crud.js`: remove the wholesale-section form/table block, `editingWholesaleSection` state, and the now-unused `fetchAllWholesaleSectionsAdmin`/`renderWholesaleSectionFormFieldValues`/`renderWholesaleSectionRow` imports — companies-only CRUD (including the existing logo upload) remains exactly as-is. (depends on: T013)
- [x] T016 [P] [US2] Update `src/pages/admin/companies.html`: revert `<title>` and page heading/description from "إدارة الشركات وأقسام الجملة" back to companies-only copy ("إدارة الشركات"). (depends on: T015)

**Checkpoint**: User Stories 1 AND 2 both work independently — run quickstart.md section 1 (steps 1–6, ignoring the icon-picker specifics until US3).

---

## Phase 5: User Story 3 - Wholesale sections carry an icon, drawn from the same set retail sections use (Priority: P3)

**Goal**: `wholesale_sections` gains `icon_name`; wholesale-sections.html's form gets the same icon-picker UI/data retail sections already use, via one shared module (no duplicated `ICONS` array).

**Independent Test**: Per spec.md — on wholesale-sections.html, open the icon picker, confirm it lists the same fixed icon set as sections.html's picker, select and save one, confirm it persists on reopen; confirm a section with no icon falls back to a default rather than a broken image.

**Depends on**: User Story 2 (T013/T014 — this story adds fields to the page and controller US2 creates).

- [X] T017 [US3] Apply migration `supabase/migrations/015_wholesale_section_icon.sql` (adds `wholesale_sections.icon_name`, nullable varchar — see `contracts/database-schema.md`) via `mcp__supabase__apply_migration`, then run its verification checklist (column shape via `list_tables`, insert-with/insert-without-icon test rows, `get_advisors` clean, cleanup).
- [X] T018 [P] [US3] Create `src/js/admin/icon-picker.js` — extract `ICONS`/`ICON_DIRECTORY`/`DEFAULT_ICON`/`iconSource()` out of `sections-crud.js`, plus new `renderIconPickerHTML(selectedIcon, { special } = {})` and `wireIconPicker(root, hiddenInputSelector)`. The `special` config (icon/label/hint) is optional, used only by the retail "مميز" Gift_Home.svg callout. See `contracts/admin-ui.md` / research.md Decision 5. (parallel-capable with T017 — different systems, no functional dependency)
- [X] T019 [US3] Refactor `src/js/admin/sections-crud.js` to import `ICONS`/`ICON_DIRECTORY`/`DEFAULT_ICON`/`iconSource` from `icon-picker.js` instead of its own local copies, and call `renderIconPickerHTML(editing.icon_name, { special: { icon: 'Gift_Home.svg', label: 'مميز', hint: '...' } })` + `wireIconPicker(root, '#selected-icon-input')` in place of its inline picker markup/click-handling. Verify the retail sections admin page's rendered HTML/behavior is unchanged before/after (pure extraction, no functional change). (depends on: T018)
- [X] T020 [P] [US3] Extend `renderWholesaleSectionFormFieldValues(editing)` and `renderWholesaleSectionRow(section, index)` in `src/js/admin/admin-templates.js` to support `icon_name` — form defaulting (falls back to `DEFAULT_ICON` from `icon-picker.js`) and a list-row icon thumbnail (via `iconSource()`), no "مميز" badge. (depends on: T018)
- [X] T021 [US3] Wire the icon picker into `src/js/admin/wholesale-sections-crud.js`'s form: `renderIconPickerHTML(editing?.icon_name, {})` (no `special` config — plain grid) + `wireIconPicker(root, '#selected-icon-input')`; add `icon_name: rawData.icon_name` to the create/update submit payload. (depends on: T013, T018, T020)
- [X] T022 [P] [US3] Create `tests/icon-picker.test.js` — pure rendering coverage: default grid renders all `ICONS`, selected icon marked, `special` config renders the callout only when passed, `iconSource()` falls back to `DEFAULT_ICON` for an unknown/`null` name, tag-injection escaping.
- [X] T023 [P] [US3] Extend `tests/admin-templates.test.js`: `renderWholesaleSectionFormFieldValues`/`renderWholesaleSectionRow` `icon_name` coverage (default fallback, thumbnail render, tag-injection escaping) — mirrors the existing retail `renderSectionRow`/icon coverage already in this file.

**Checkpoint**: All three of US1, US2, US3 are independently functional — run quickstart.md section 1 in full (icon picker included) and section 2 (confirming the created section's icon shows on the storefront).

---

## Phase 6: User Story 4 - Admin sidebar organized into consumer-store and wholesale-store groups (Priority: P4)

**Goal**: every admin page's sidebar shows two always-visible top-level links plus two collapsible groups, rendered from one shared module instead of seven hand-copied blocks.

**Independent Test**: Per spec.md — open any admin page, confirm the flat top-level links and the two named collapsible groups with the correct links in the correct order; confirm the group containing the current page auto-expands; confirm this structure is identical across all seven admin pages.

**Depends on**: User Story 2 (T014 — "إدارة أقسام متجر الجملة" must have a real page to link to).

- [X] T024 [US4] Create `src/js/admin/admin-nav.js` exporting `renderAdminSidebarHTML(activePage)` and `initAdminSidebarBehavior(root, activePage)` — the `NAV_GROUPS` structure (two flat links, two labeled groups with their links in the order FR-012–FR-014 specify) and the FR-016 auto-expand-active-group behavior. See `contracts/admin-ui.md` / research.md Decision 7.
- [X] T025 [P] [US4] Create `tests/admin-nav.test.js` — pure rendering coverage: all seven links present with correct hrefs/labels/order, the flat links never nest inside a group, the correct link is marked active for a given `activePage`, the group containing `activePage` is the one flagged for auto-expand while the other is not. (depends on: T024)
- [X] T026 [P] [US4] Replace the hand-written `<nav>` sidebar block in `src/pages/admin/dashboard.html` with an `#admin-nav` mount point + a call to `renderAdminSidebarHTML('dashboard.html')` / `initAdminSidebarBehavior(...)`, alongside the page's existing `requireAdmin()`/logout/mobile-toggle wiring. (depends on: T024)
- [X] T027 [P] [US4] Same replacement in `src/pages/admin/products.html` (`activePage = 'products.html'`). (depends on: T024)
- [X] T028 [P] [US4] Same replacement in `src/pages/admin/sections.html` (`activePage = 'sections.html'`). (depends on: T024)
- [X] T029 [P] [US4] Same replacement in `src/pages/admin/companies.html` (`activePage = 'companies.html'`). (depends on: T024)
- [X] T030 [P] [US4] Same replacement in `src/pages/admin/wholesale-sections.html` (`activePage = 'wholesale-sections.html'`). (depends on: T024, T014)
- [X] T031 [P] [US4] Same replacement in `src/pages/admin/invoices.html` (`activePage = 'invoices.html'`). (depends on: T024)
- [X] T032 [P] [US4] Same replacement in `src/pages/admin/customers.html` (`activePage = 'customers.html'`). (depends on: T024)

**Checkpoint**: All four user stories are independently functional — run quickstart.md section 4 in full (all seven pages).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification spanning every story, per Constitution Principle I step 5 ("a feature is not complete until checked against its original spec").

- [X] T033 [P] Verify FR-010/FR-011 (company logo upload) against the current `src/js/admin/companies-crud.js` (Decision 6) — re-confirm `uploadLogo()`, the file input, and `logo_url` preservation-on-edit still behave as spec'd after US2's trim (T015); no code change expected. Run quickstart.md section 5.
- [X] T034 Run `npx vitest run` — full suite green, including all new coverage from T007, T022, T023, T025.
- [X] T035 [P] `git diff` verification — zero changes to `src/js/house-interactions.js`, `public/assets/Frame 1.svg`, `public/assets/Frame 2.svg`, and `index.html`'s hero markup (Constitution Principle III, SC-002).
- [X] T036 [P] `mcp__supabase__get_advisors` (security) — no new findings versus the pre-feature baseline.
- [X] T037 Run quickstart.md section 6 (full regression pass) end-to-end and confirm every earlier section's scenarios still hold together on the finished feature.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty for this feature — nothing blocks Phase 3.
- **User Story 1 (Phase 3)**: Depends only on Setup. No dependency on any other story.
- **User Story 2 (Phase 4)**: Depends only on Setup. No dependency on US1 or US3/US4.
- **User Story 3 (Phase 5)**: Depends on **User Story 2** (T013/T014) — adds the icon field to the page/controller US2 creates.
- **User Story 4 (Phase 6)**: Depends on **User Story 2** (T014) — one sidebar link targets the page US2 creates. Does not depend on US3 (the sidebar link works whether or not that page's sections have icons yet).
- **Polish (Phase 7)**: Depends on all four user stories being complete.

### Recommended Order

Given the dependency graph above, US1 and US2 can be built in either order (or in parallel by two people); US3 and US4 both require US2 first, but not each other — so a viable sequence is **US1 → US2 → {US3, US4 in either order or in parallel} → Polish**, matching the spec's own priority order (P1 → P2 → P3 → P4).

### Within Each User Story

- User Story 1: T002/T003 (parallel) → T004 → T005 (same file, sequential) → T006/T007 (parallel) → T008/T009 (parallel) → T010 → T011 → T012 (all three same file, strictly sequential).
- User Story 2: T013 → T014/T015 (parallel) → T016.
- User Story 3: T017/T018 (parallel) → T019 (needs T018) and T020 (needs T018, parallel with T019) → T021 (needs T013, T018, T020) → T022/T023 (parallel, anytime after their respective source files exist).
- User Story 4: T024 → T025 (needs T024) and T026–T032 (all need only T024, all parallel with each other and with T025).

### Parallel Opportunities

- T002 + T003 (Phase 3)
- T006 + T007 (Phase 3)
- T008 + T009, once their prerequisites land (Phase 3)
- T014 + T015, once T013 lands (Phase 4)
- T017 + T018 (Phase 5 — different systems, no functional dependency)
- T019 + T020, once T018 lands (Phase 5)
- T022 + T023 (Phase 5 — independent test files)
- T025 through T032, once T024 lands (Phase 6 — one shared module, seven independent page edits plus one independent test file)
- T033 + T035 + T036 (Phase 7 — three independent verification checks)

---

## Parallel Example: User Story 1

```bash
# Once Setup (T001) is done, launch the two independent data-access additions together:
Task: "Add fetchActiveWholesaleSections() to src/js/wholesale-sections-api.js"
Task: "Add fetchProductsByWholesaleSection(wholesaleSectionId) to src/js/products-api.js"

# Once those + T006 land, the two storefront page rewires are independent:
Task: "Rewire src/pages/wholesale-home.html to fetchActiveWholesaleSections()"
Task: "Rewire src/pages/wholesale-section-companies.html to wholesale_section=<id>"
```

## Parallel Example: User Story 4

```bash
# Once admin-nav.js (T024) exists, every page wiring task is independent:
Task: "Wire admin-nav.js into src/pages/admin/dashboard.html"
Task: "Wire admin-nav.js into src/pages/admin/products.html"
Task: "Wire admin-nav.js into src/pages/admin/sections.html"
Task: "Wire admin-nav.js into src/pages/admin/companies.html"
Task: "Wire admin-nav.js into src/pages/admin/wholesale-sections.html"
Task: "Wire admin-nav.js into src/pages/admin/invoices.html"
Task: "Wire admin-nav.js into src/pages/admin/customers.html"
Task: "Create tests/admin-nav.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 3: User Story 1 (Phase 2/Foundational is empty — nothing to do there).
3. **STOP and VALIDATE**: run quickstart.md sections 2–3; confirm zero retail regression via `git diff`.
4. This alone fixes the feature's core, most-urgent defect (spec.md's stated priority ordering) — a merchant can already populate `wholesale_sections` directly via Supabase/the existing feature-004 combined admin page and see it correctly reflected on the storefront, even before US2 splits that admin page.

### Incremental Delivery

1. Setup → Foundational (empty) → Foundation ready.
2. Add User Story 1 → validate independently → deploy/demo (MVP).
3. Add User Story 2 → validate independently → deploy/demo (dedicated admin pages).
4. Add User Story 3 → validate independently → deploy/demo (icons).
5. Add User Story 4 → validate independently → deploy/demo (sidebar restructure).
6. Polish → full regression, security check, final quickstart pass.

### Parallel Team Strategy

With two developers: one takes US1 (storefront wiring), the other takes US2 (admin page split) — both depend only on Setup, so both can start immediately after T001. Once US2 lands, US3 (icons) and US4 (sidebar) can likewise be split between two developers, since neither depends on the other.

---

## Notes

- [P] tasks touch different files and have their stated prerequisites already satisfied.
- [Story] label maps every implementation task to its user story for traceability.
- Every `*-api.js` addition is deliberately left untested per Constitution Principle VII / this codebase's established precedent (feature 004 and earlier) — only pure template/logic functions get Vitest coverage.
- T010–T012 all edit `src/pages/category.html` and are listed strictly sequential — do not parallelize them even though the [P] marker is absent, per the "same file" rule.
- Constitution Principle III (house hero) is a hard constraint on every task in this file, not just T035 — no task in Phases 3–7 touches `house-interactions.js`, `Frame 1.svg`, `Frame 2.svg`, or `index.html`'s hero markup; T035 is the final proof, not the only enforcement point.
