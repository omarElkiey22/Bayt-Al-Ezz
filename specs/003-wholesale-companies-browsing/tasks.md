---

description: "Task list template for feature implementation"
---

# Tasks: Wholesale Companies Catalog and Filtering

**Input**: Design documents from `/specs/003-wholesale-companies-browsing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/database-schema.md, contracts/companies-api.md, contracts/ui-routes.md, quickstart.md

**Regenerated 2026-09-02**: superseded the first version of this file to incorporate the
`/plan-eng-review` + Codex outside-voice pass (11 findings resolved — see `plan.md`'s
`## GSTACK REVIEW REPORT`): a `getHiddenSectionContext()` refactor and hidden-section leak fixes
in `fetchActiveCompanies()`/`fetchProductsByCompany()`, a `requireAdmin()` upgrade to a real
`is_admin()` RPC check (shared by all 6 admin pages), a DB-level sanitize trigger on `companies`,
a partial-unique slug index, `updated_at` on the schema, `isWholesaleMode()` gating redirects on
both new wholesale pages, mandatory `fetchCompanyDetails()` validation on both company-scoped
`category.html` routes, and a split `companyId`/`unassignedOnly` filter signature.

**Tests**: Automated tests are included only for the pure, dependency-free logic modules this
feature introduces (`product-filters.js`, `company-card-html.js`) and two existing regression
suites this feature must extend (`tests/rls-admin-access.test.js`, `tests/auth-gate.test.js`), per
Constitution Principle VII. DOM/page work is verified manually via `quickstart.md` instead.

**Organization**: Tasks are grouped by user story (US1 = P1, US2 = P2, US3 = P3 from spec.md) to
enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no unresolved same-phase dependency)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes the exact file path(s) it touches

## Path Conventions

Existing single-project layout (`plan.md` Structure Decision) — `src/pages/`, `src/js/`, `src/js/admin/`, `supabase/migrations/`, `tests/` at repository root. No new top-level directories.

---

## Phase 1: Setup

**Purpose**: Confirm preconditions — this is an existing codebase (no-build-step, Constitution Principle II), so there is no dependency install/scaffold step.

- [X] T001 Confirm branch `003-wholesale-companies-browsing` is checked out and that `supabase/migrations/012_admin_role_access_control.sql` is still the latest migration, so the new migration is safely numbered `013` (verification only — no file changes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, RLS + sanitize trigger, the shared data-access layer (with the hidden-section-safe helpers the review pass added), a real admin gate, admin CRUD (companies + product-company assignment), and the wholesale-mode homepage shell — every user story needs these to exist first.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `supabase/migrations/013_companies_and_product_company.sql`: `companies` table (including `updated_at timestamptz`), `products.company_id` nullable FK (`on delete set null`), the partial **unique** index `idx_companies_slug_unique` on `companies(slug) where deleted_at is null` (NOT a plain unique constraint — see the Uniqueness note in `contracts/database-schema.md`), `idx_products_company_active_deleted`, RLS enable + `"companies readable"` (public, active/non-deleted) + `"merchant companies writes"` (`to authenticated using/with check (public.is_admin())`), **and** the server-side sanitize trigger: `CREATE OR REPLACE FUNCTION sanitize_text_trigger()` extended so its `description` check also fires for `TG_TABLE_NAME = 'companies'` (not just `'products'`), plus `CREATE TRIGGER prevent_html_in_companies BEFORE INSERT OR UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION sanitize_text_trigger()` — exact SQL per `contracts/database-schema.md` (this trigger addition was a CRITICAL finding — do not skip it)
- [X] T003 [P] Add `companies: 'companies'` to the `TABLES` export in `src/js/constants.js` per `contracts/companies-api.md`
- [X] T004 Add `['companies', 'merchant companies writes']` to the `SENSITIVE_POLICIES` array in `tests/rls-admin-access.test.js` so the existing regression guard covers the new table (depends on T002)
- [X] T005 [P] Refactor `src/js/products-api.js` — two extractions in one pass: (1) extract the per-product variants/pricing mapping duplicated in `fetchProductsBySection`, `fetchProductDetails`, and `searchProducts` into an exported `mapProductWithVariants(product)` helper; (2) extract the "is this session an admin, and which section id(s) are the hidden `library-book.svg` section" logic duplicated across those same three functions into an exported/shared `async function getHiddenSectionContext(db)` returning `{ isAdmin, hiddenSectionIds }`; refactor all three call sites to use both helpers (pure refactor, behavior-preserving) — exact shapes per `contracts/companies-api.md`
- [X] T006 Create `src/js/companies-api.js`: storefront functions `fetchCompaniesForSection(sectionSlug)`, `fetchActiveCompanies()` (query `wholesale_price > 0`, **not** `is not null` — matches `filterWholesaleProducts()`'s actual condition — and exclude hidden-section products for non-admins via `getHiddenSectionContext()`), `fetchCompanyDetails(id)`, `fetchProductsByCompany(companyId, { sectionSlug })` (also excludes hidden-section products via `getHiddenSectionContext()` on the no-`sectionSlug` branch, and still applies the `library-book.svg` check when resolving a given `sectionSlug`); and admin functions `fetchAllCompaniesAdmin()`, `createCompany()`, `updateCompany()` (stamps `updated_at: new Date().toISOString()` explicitly — no DB trigger does this), `softDeleteCompany()` — exact signatures/behavior per `contracts/companies-api.md` (depends on T003, T005)
- [X] T007 [P] Create `src/js/company-card-html.js`: pure `buildCompanyCardHTML(company)` template (logo + name, HTML-escaped) with a branded fallback monogram when `logo_url` is absent — mirrors `src/js/section-nav-html.js`
- [X] T008 Create `tests/company-card-html.test.js`: cover HTML escaping and the fallback-monogram-when-no-logo case (depends on T007)
- [X] T009 [P] Upgrade `requireAdmin()` in `src/js/admin/auth-gate.js` to actually check admin membership, not just session presence: after confirming a session exists, call `const { data: isAdmin } = await supabase.rpc('is_admin')`; if falsy, `window.location.replace('login.html')` and throw `'Not authorized'` — exact code per `contracts/ui-routes.md`'s `admin/companies.html` section. This is a pure `auth-gate.js` edit (the RPC is already `GRANT EXECUTE ... TO authenticated` from migration `012`, no new migration needed) and benefits all 6 admin pages that import `requireAdmin()` from this shared module
- [X] T010 Update `tests/auth-gate.test.js`: extend the mocked `supabase` object with `rpc: vi.fn()`; add a case where a session exists but `rpc('is_admin')` resolves falsy → `requireAdmin()` redirects to `login.html` and rejects with `'Not authorized'`; update the existing "returns true if session exists" case to also mock `rpc('is_admin')` resolving truthy (depends on T009)
- [X] T011 Create `src/js/admin/companies-crud.js`: admin page controller mirroring `src/js/admin/products-crud.js` (list/create/edit/soft-delete via `requireAdmin()` + T006's admin functions), including a `uploadLogo(file)` helper identical in shape to `products-crud.js`'s `upload()` but writing to `companies/{uuid}.{ext}` in the `store-assets` bucket; add matching company row/form template helpers to `src/js/admin/admin-templates.js` (depends on T006, T007)
- [X] T012 Create `src/pages/admin/companies.html`: admin CRUD page (form column + list column, `requireAdmin()` gate), structurally mirroring `src/pages/admin/products.html`, wired to `companies-crud.js` (depends on T011)
- [X] T013 [P] Add an "إدارة الشركات" nav link to the sidebar in `src/pages/admin/dashboard.html`, alongside the existing "إدارة الأقسام"/"إدارة المنتجات" links, pointing at `companies.html`
- [X] T014 Add a "الشركة" company `<select>` (default/blank option "بدون شركة") to the product form in `src/pages/admin/products.html`, and wire its value into the submit handler in `src/js/admin/products-crud.js` (populate options via `fetchAllCompaniesAdmin()`, include on create/update payload as `company_id`) — this is how FR-002's `company_id` assignment actually happens (depends on T006)
- [X] T015 [P] Add an early wholesale-mode redirect to `src/pages/index.html`: at the very top of its module script — before the existing `fetch('Frame 1.svg')`/`fetch('Frame 2.svg')` calls — check `isWholesaleMode()` (from `src/js/pricing-mode.js`); if true, `location.replace('wholesale-home.html')` and `return` immediately. No other change to `index.html`; `src/js/house-interactions.js` and the house SVG rendering logic are **not modified** and must remain byte-identical (per `research.md` Decision 7)
- [X] T016 [P] Create `src/js/wholesale-section-grid-html.js`: pure template for one section's entry on the wholesale homepage grid (mirrors `section-nav-html.js`) — placeholder-level markup; the final visual design is delivered separately via Claude Design and will replace this markup without changing its data/click contract
- [X] T017 Create `src/pages/wholesale-home.html`: at the very top of its script, check `isWholesaleMode()`; if **false**, `location.replace('index.html')` immediately (a direct/bookmarked visit outside wholesale mode belongs on the retail homepage — plan-eng-review finding, symmetric with T015's redirect so the two pages can never loop). Otherwise render the shell: standard header/cart-badge/search-bar wiring (mirrors `index.html`/`category.html`), fetch `fetchActiveSections()` and render one entry per section via T016's template, each linking to `wholesale-section-companies.html?section=<slug>` (the "Browse Companies" showcase itself is added in Phase 4 / US2) (depends on T016)

**Checkpoint**: Companies exist in the DB with RLS + server-side sanitization enforced, are creatable/assignable via a genuinely admin-gated panel, and `?pricing=wholesale` on the homepage lands on the wholesale homepage shell with zero house-hero rendering — while a direct wholesale-page visit outside wholesale mode correctly bounces back to retail. User story implementation can now begin.

---

## Phase 3: User Story 1 - Section-to-Company Wholesale Browsing (Priority: P1) 🎯 MVP

**Goal**: In wholesale mode, tapping a section shows only the companies with active wholesale products in that section (plus an "All products in this section" entry); tapping a company shows that company's products in that section; tapping "All products" shows every active product in the section, including unassigned ones.

**Independent Test**: In wholesale mode, tap any store section. Verify a grid of companies having active products in that section is displayed with their logos, alongside a prominent "All products in this section" entry. Tapping a company opens a listing with only that company's products in that section; tapping the section entry opens all products in that section.

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create `src/pages/wholesale-section-companies.html`: at the very top, check `isWholesaleMode()`; if **false**, `location.replace('category.html?section=' + slug)` (a direct/bookmarked visit outside wholesale mode must not build a "wholesale companies" grid from the section's entire non-wholesale-filtered catalog — plan-eng-review finding). Otherwise: read required `?section=<slug>` (redirect to `wholesale-home.html` if missing); call `fetchCompaniesForSection(slug)`; render the company grid via `company-card-html.js` (T007) linking each card to `category.html?section=<slug>&company=<id>`; render the "All products in this section" entry labeled with the section's name (via `fetchActiveSections()`) linking to `category.html?section=<slug>`; render the empty state (`companies.length === 0`) with a link back to `wholesale-home.html`; render the error state for an invalid/soft-deleted section slug by reusing `category.html`'s existing catch-block copy/markup style — per `contracts/ui-routes.md`
- [ ] T019 [P] [US1] Extend `src/pages/category.html`: read an optional `&company=<id>` query param; in wholesale mode, when both `section` and `company` are present, call `fetchCompanyDetails(companyId)` **first** — an invalid/soft-deleted/deactivated company falls through to the page's existing top-level catch block (same "حصلت مشكلة..." error-state markup already used for a bad section slug, per the spec's "Direct URL tampering / invalid IDs" edge case) — then fetch products via `fetchProductsByCompany(companyId, { sectionSlug: slug })` instead of `fetchProductsBySection(slug)`; the existing `section`-only path (retail and wholesale) is completely unchanged — per `contracts/ui-routes.md`'s params table and its "Invalid company id" note
- [ ] T020 [US1] Manually validate User Story 1 against `quickstart.md`'s "Wholesale homepage entry" + "User Story 1" sections (section→company grid→listing flow, the no-companies empty state, unassigned-product inclusion in "All products", and — new — that visiting `wholesale-section-companies.html?section=<slug>` directly with wholesale mode inactive bounces to `category.html?section=<slug>` instead of showing a wholesale grid) (depends on T018, T019)

**Checkpoint**: User Story 1 is fully functional and independently testable/demoable (MVP).

---

## Phase 4: User Story 2 - Direct Company Browsing on Wholesale Homepage (Priority: P2)

**Goal**: The wholesale homepage has a dedicated area to browse all partner companies directly; tapping one shows that company's full catalog across every section. Retail mode never shows this area.

**Independent Test**: From the wholesale homepage, navigate to the dedicated companies section and select a company. Verify the product listing displays all wholesale products from that company across every section.

### Implementation for User Story 2

- [X] T021 [P] [US2] Add the "شركاء النجاح والشركات" / "Browse Companies" showcase to `src/pages/wholesale-home.html`: fetch `fetchActiveCompanies()` (already hidden-section-safe and `wholesale_price > 0`-correct per T006), render cards via `company-card-html.js` (T007), each linking to `category.html?company=<id>` (no `section` param) — per `contracts/ui-routes.md`
- [X] T022 [P] [US2] Extend `src/pages/category.html`: when `company` is present **without** `section` (wholesale mode), call `fetchCompanyDetails(id)` **first** — same invalid/inactive/deleted-company handling as T019, falling through to the existing top-level catch block, so both company-scoped routes now behave identically for a bad id (plan-eng-review finding) — then fetch via `fetchProductsByCompany(companyId)` (no section scoping); show the listing header/title using the already-fetched `fetchCompanyDetails()` result (no second lookup) (depends on T019 for the shared query-param branching pattern this reuses)
- [X] T023 [US2] Manually validate User Story 2 against `quickstart.md`'s "User Story 2" section, including the retail-mode isolation check (no showcase shown, no redirect, house hero unaffected) (depends on T021, T022)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Multi-Criteria Product Filter Panel (Priority: P3)

**Goal**: Every wholesale product listing page (reached via section+company, section-only, or company-only) offers a price/company/section filter panel. Price-range and company/unassigned changes refine the already-loaded grid instantly with no fetch; changing the section triggers a real (but still in-page) re-fetch. The panel is pre-seeded from entry context, offers an "unassigned" company option on section-wide listings, and a reset control.

**Independent Test**: Open any wholesale product listing page (reached via section+company or directly via company). Interact with the filter panel by changing price range boundaries, toggling company selections, or changing sections. Verify product results update to reflect the active filters — instantly for price/company, via a fresh fetch for section changes.

### Tests for User Story 3

- [X] T024 [P] [US3] Create `src/js/product-filters.js`: pure `applyProductFilters(products, { minPrice, maxPrice, companyId, unassignedOnly, sectionId })` — `companyId` and `unassignedOnly` are **separate** parameters (not one overloaded value); when `unassignedOnly` is true it takes precedence over `companyId` — exact signature per `data-model.md`'s "Filter panel shape" note
- [X] T025 [US3] Create `tests/product-filters.test.js`: price range combinations, `companyId` filtering, `unassignedOnly` filtering (including that it takes precedence when both `unassignedOnly` and `companyId` are set), combined price+company filters, and a zero-match case (depends on T024)

### Implementation for User Story 3

- [X] T026 [US3] Add the filter panel to `src/pages/category.html` (wholesale mode only): price min/max inputs, a company `<select>`/checklist (options from `fetchCompaniesForSection(slug)`'s `companies` when a section is in context, else `fetchActiveCompanies()`, plus a synthetic "بدون شركة" option appended when the current listing's `hasUnassigned` is true per FR-013), and a section `<select>` (options from `fetchActiveSections()`); pre-seed all three from the URL's `section`/`company` params. **Price-range and company/"بدون شركة" changes** call `applyProductFilters()` (T024) against the already-fetched in-memory array and re-render in place — genuinely no network request, per `contracts/ui-routes.md`'s clarified filter-panel note. **Section-select changes** are NOT routed through `applyProductFilters()` as a pure filter — they trigger a real `fetchProductsBySection(newSlug)` (or `fetchProductsByCompany(companyId, { sectionSlug: newSlug })` if a company is also active) call, then re-render (re-applying any active price/company filter to the freshly-fetched array); do not present this as instant in the UI. Add a "reset filters" control and a "لا توجد منتجات مطابقة" zero-match state with its own reset action (depends on T019, T022, T024)
- [X] T027 [US3] Manually validate User Story 3 against `quickstart.md`'s "User Story 3" section (pre-selection from entry context, sub-150ms live updates for price/company with no reload, a genuine re-fetch on section change, the "بدون شركة" option on the section-wide listing, and the zero-match reset flow) (depends on T026)

**Checkpoint**: All three user stories are independently functional and can be demoed together.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full-feature verification and sign-off across all stories.

- [ ] T028 [P] Run the complete `quickstart.md` validation end-to-end: all three user stories plus every listed edge case (company without logo → monogram fallback, invalid section/company id in URL on both company-scoped `category.html` routes, retail-mode isolation, zero house-hero flash on wholesale entry, and both new wholesale pages' out-of-mode redirect behavior)
- [ ] T029 [P] Run `npm test`; confirm `tests/product-filters.test.js`, `tests/company-card-html.test.js`, the updated `tests/rls-admin-access.test.js`, and the updated `tests/auth-gate.test.js` all pass, and no existing suite regresses
- [ ] T030 Constitution + eng-review compliance sign-off: confirm Principle III (house hero / `house-interactions.js` untouched), Principle VIII (companies soft-deleted via `deleted_at`, not hard-deleted, with the partial-unique slug index correctly scoped), and Principle IX (RLS + sanitize trigger on `companies` mirror `sections`/`products`; `requireAdmin()` now genuinely gates all 6 admin pages; the hidden-section leak is closed in both `fetchActiveCompanies()` and `fetchProductsByCompany()`) before merge (depends on T028, T029)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phase 3–5)**: All depend on Foundational completion.
  - US1 (P1) has no dependency on US2/US3 — it is the MVP.
  - US2 (P2) reuses the `category.html` query-param/`fetchCompanyDetails()`-validation pattern US1 adds (T019) but is otherwise independent — it can be demoed on its own once T019 exists.
  - US3 (P3) layers the filter panel onto the `category.html` branches US1/US2 already added (T019, T022) — independent story, but built last since it enhances listings both prior stories produce.
- **Polish (Phase 6)**: Depends on all three user stories being complete.

### Within Each Phase

- Foundational: schema+trigger (T002) before the RLS regression-test update (T004); `constants.js`/`products-api.js` helpers (T003, T005) before `companies-api.js` (T006); `auth-gate.js` upgrade (T009) before its test update (T010); `companies-api.js` + `company-card-html.js` (T006, T007) before admin CRUD (T011–T014) and before the wholesale homepage shell (T016, T017).
- Each user story: page/feature implementation before its manual `quickstart.md` validation task.

### Parallel Opportunities

- Foundational phase-start: T002, T003, T005, T007, T009, T013, T015, T016 (different files, no interdependency) can run in parallel.
- US1: T018 and T019 touch different files and both only depend on Foundational — run in parallel.
- US2: T021 and T022 touch different files and both only depend on Foundational + T019 (already complete once US2 starts) — run in parallel.
- US3: T024 has no same-phase dependency — can start alongside US1/US2 work once Foundational is done, though it isn't useful standalone until T026 wires it into `category.html`.
- Polish: T028 and T029 are independent verification activities — run in parallel.

---

## Parallel Example: Foundational Phase

```bash
# Launch together at the start of Phase 2:
Task: "Create supabase/migrations/013_companies_and_product_company.sql (schema + RLS + sanitize trigger)"
Task: "Add companies to TABLES in src/js/constants.js"
Task: "Refactor products-api.js: mapProductWithVariants() + getHiddenSectionContext()"
Task: "Create src/js/company-card-html.js"
Task: "Upgrade requireAdmin() in src/js/admin/auth-gate.js to check public.is_admin() via RPC"
Task: "Add إدارة الشركات nav link to src/pages/admin/dashboard.html"
Task: "Add early wholesale-mode redirect to src/pages/index.html"
Task: "Create src/js/wholesale-section-grid-html.js"
```

## Parallel Example: User Story 1

```bash
# Launch together once Foundational is complete:
Task: "Create src/pages/wholesale-section-companies.html (with its own isWholesaleMode() gate)"
Task: "Extend src/pages/category.html to support &company= (via fetchCompanyDetails() first) alongside &section="
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (companies schema/RLS/sanitize trigger, real admin gate, admin CRUD + product assignment, wholesale homepage shell + both redirects) — critical, blocks everything.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run `quickstart.md`'s "Wholesale homepage entry" + "User Story 1" sections independently.
5. Deploy/demo if ready — this alone delivers the core "section → company → products" wholesale navigation.

### Incremental Delivery

1. Setup + Foundational → foundation ready (schema, admin, wholesale homepage shell).
2. Add User Story 1 → validate independently → deploy/demo (MVP).
3. Add User Story 2 → validate independently → deploy/demo (adds direct company browsing).
4. Add User Story 3 → validate independently → deploy/demo (adds the filter panel to all listings from US1 + US2).
5. Phase 6 Polish → full regression pass before merge.

---

## Notes

- [P] tasks = different files, no unresolved same-phase dependency.
- [US1]/[US2]/[US3] labels map each task to its spec.md user story for traceability.
- No contract/integration test tasks are included for page-level (DOM) work — Constitution Principle VII only requires automated coverage for pure logic (`product-filters.js`, `company-card-html.js`) and this feature's two regression-suite extensions (`rls-admin-access.test.js`, `auth-gate.test.js`); DOM work is verified manually via `quickstart.md`, as the constitution allows.
- `house-interactions.js` and the Frame 1/Frame 2 SVG rendering logic have **no task that modifies them** anywhere in this list — this is intentional (see T015, `research.md` Decision 7).
- `wholesale-home.html` and `wholesale-section-companies.html` each check `isWholesaleMode()` before rendering and redirect to their retail equivalent when it's false (T017, T018) — this is a plan-eng-review finding, not present in the first draft of this task list.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently before moving on.
