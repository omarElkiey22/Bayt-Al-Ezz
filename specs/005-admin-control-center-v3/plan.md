# Implementation Plan: Admin Control Center v3 — Wholesale Storefront Wiring, Page Split & Nav Restructure

**Branch**: `005-admin-control-center-v3` | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-admin-control-center-v3/spec.md`

## Summary

Four independent slices, ordered by priority: (1) rewire the wholesale storefront's section
browsing off the retail `sections` table onto the existing-but-unused `wholesale_sections` table
— which, once traced end-to-end, also means giving `category.html` a narrow, contained
`?wholesale_section=<id>` filtering branch (product grid/cart/company-facet only — no sidebar-nav
or section-facet dropdown extension), since today's wholesale-section-companies.html deep-links
into `category.html` using the retail slug;
(2) split the feature-004 combined companies+wholesale-sections admin page into two dedicated
pages; (3) give `wholesale_sections` an `icon_name` column and a shared icon-picker module reused
by both the retail and new wholesale sections admin forms; (4) restructure every admin page's
sidebar into two collapsible groups. A fifth, pre-existing item (company logo upload) turned out
to already be fully implemented during spec-writing — carried through planning as a
verification-only task, not a build task.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES modules), HTML5, CSS3 — no transpiler/bundler
(Constitution Principle II)

**Primary Dependencies**: Supabase JS client (`@supabase/supabase-js`, loaded as-is from the
existing `supabase-client.js`), Tailwind CSS (CDN, no build step), Vitest (pure-logic tests only)

**Storage**: Supabase Postgres — extends `wholesale_sections` (added in migration 014) with one
new nullable column; no other schema change

**Testing**: Vitest, pure template/logic functions only (per Constitution Principle VII) — no
tests against functions that call Supabase directly

**Target Platform**: Static files served by Vercel; client-side Supabase SDK calls from the
browser

**Project Type**: Web application (single static frontend + Supabase backend, existing structure)

**Performance Goals**: No specific new targets — matches existing page-load/interaction
expectations already met by the storefront and admin panel

**Constraints**: No-build-step architecture (Principle II); house hero (Frame 1/Frame 2 SVG,
house-interactions.js, the fixed 12 retail zones) MUST NOT be touched or regress; retail `sections`
table and its existing consumer code paths MUST behave identically before/after this feature;
`wholesale_sections`' RLS/soft-delete/sanitize-trigger pattern from migration 014 stays unchanged

**Scale/Scope**: 7 admin pages get a sidebar rewrite; 1 admin page splits into 2; 2 storefront
pages get re-wired; `category.html` gains one narrow, contained `wholesale_section=<id>` filtering
branch (no sidebar-nav/filter-panel-facet extension — see research.md Decision 2); 1 new
migration; ~4 new/extended data-access functions; 1 new shared icon-picker module; 1 new shared
admin-nav module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Spec-First Development | spec.md → plan.md → tasks.md (next) → implement → review, in order | PASS |
| II. No-Build-Step Architecture | All new code is plain ES modules + Tailwind CDN classes; no bundler introduced | PASS |
| III. Two-Phase House Hero | Feature touches zero retail-house files (`house-interactions.js`, `Frame 1.svg`, `Frame 2.svg`, `index.html`'s hero markup); retail `sections` table reads are untouched | PASS (verify via `git diff` at implementation end, as in feature 004) |
| IV. Separation of Concerns | New Supabase calls go through `*-api.js` functions, never inline in page scripts; new nav/icon-picker rendering is DOM-building code kept out of data-access files | PASS |
| V. Mobile-First, Arabic-First, RTL | New pages/components reuse existing Tailwind RTL patterns from sections.html/companies.html; no new layout primitives introduced | PASS |
| VI. Single Responsibility & Clean Code | Icon-picker constants/rendering extracted to one shared module instead of duplicated (direct DRY fix); sidebar nav extracted to one shared module instead of copy-pasted across 7 files (fixes pre-existing duplication, not just avoids new duplication) | PASS |
| VII. Testable Pure Logic | New pure template functions (icon-picker rendering, admin-nav rendering, wholesale section-grid template) get Vitest coverage; Supabase-calling functions are not unit-tested, consistent with feature 004's precedent | PASS |
| VIII. Soft-Delete by Default | `wholesale_sections` soft-delete (from migration 014) is unchanged; the new `icon_name` column carries no delete semantics of its own | PASS |
| IX. Security Hardening | New `icon_name` column inherits the existing RLS policies and the corrected (feature-004) `sanitize_text_trigger()` automatically — no new trigger/policy needed since it's a column add, not a new table; client-side icon selection is UX-only, server-side write access is still gated by `is_admin()` | PASS |

No violations requiring Complexity Tracking justification.

## Project Structure

### Documentation (this feature)

```text
specs/005-admin-control-center-v3/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── database-schema.md
│   ├── wholesale-section-browsing.md
│   └── admin-ui.md
└── tasks.md             # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 015_wholesale_section_icon.sql        # NEW — adds wholesale_sections.icon_name

src/
├── pages/
│   ├── category.html                         # EDITED — narrow wholesale_section=<id> filter branch
│   ├── wholesale-home.html                   # EDITED — reads wholesale_sections, not sections
│   ├── wholesale-section-companies.html      # EDITED — reads wholesale_sections, not sections
│   └── admin/
│       ├── dashboard.html                    # EDITED — sidebar → shared admin-nav module
│       ├── sections.html                     # EDITED — sidebar only (page logic untouched)
│       ├── products.html                     # EDITED — sidebar only (page logic untouched)
│       ├── companies.html                    # EDITED — sidebar + trimmed to companies-only
│       ├── invoices.html                     # EDITED — sidebar only (page logic untouched)
│       ├── customers.html                    # EDITED — sidebar only (page logic untouched)
│       └── wholesale-sections.html           # NEW — dedicated wholesale-sections admin page
│
├── js/
│   ├── constants.js                          # unchanged (TABLES.wholesaleSections already exists)
│   ├── products-api.js                       # EDITED — + fetchProductsByWholesaleSection,
│   │                                          #   fetchProductsByCompany gains wholesaleSectionId option
│   ├── companies-api.js                      # EDITED — + fetchCompaniesForWholesaleSection
│   ├── wholesale-sections-api.js             # EDITED — + fetchActiveWholesaleSections (storefront)
│   ├── wholesale-section-grid-html.js        # EDITED — links by id, not slug
│   ├── section-nav-html.js                   # unchanged (retail path stays exactly as-is;
│   │                                          #   no wholesale sidebar-nav counterpart — narrow
│   │                                          #   scope, see research.md Decision 2)
│   └── admin/
│       ├── icon-picker.js                    # NEW — shared ICONS/ICON_DIRECTORY/iconSource/
│       │                                      #   renderIconPickerHTML/wireIconPicker, extracted
│       │                                      #   from sections-crud.js
│       ├── admin-nav.js                      # NEW — shared renderAdminSidebarHTML/
│       │                                      #   initAdminSidebarBehavior, single source of
│       │                                      #   truth for all 7 admin pages' sidebars
│       ├── sections-crud.js                  # EDITED — icon picker now imported from icon-picker.js
│       ├── companies-crud.js                 # EDITED — wholesale-section CRUD block removed
│       │                                      #   (moved out, not duplicated)
│       ├── wholesale-sections-crud.js        # NEW — wholesale-sections.html's page logic
│       │                                      #   (moved out of companies-crud.js + icon picker)
│       └── admin-templates.js                # EDITED — renderWholesaleSectionRow/
│                                              #   renderWholesaleSectionFormFieldValues gain
│                                              #   icon_name support
│
tests/
├── admin-templates.test.js                   # EDITED — icon_name coverage for wholesale rows
├── icon-picker.test.js                       # NEW — shared picker rendering
├── admin-nav.test.js                         # NEW — sidebar rendering, active-link/expand logic
└── wholesale-section-grid-html.test.js       # NEW — link-by-id coverage for
                                               #   buildWholesaleSectionGridEntryHTML()
```

**Structure Decision**: Existing single-frontend structure (no backend/mobile split — see
constitution's Repository & Architecture Structure). All new files follow the established
`src/js/*-api.js` (data access), `src/js/*-html.js` (pure templates), `src/js/admin/*-crud.js`
(admin page controllers) conventions already in place from features 001–004.

## Complexity Tracking

*No Constitution Check violations — table not needed.*

## GSTACK REVIEW REPORT

**Scope**: `/plan-eng-review`, user-scoped to US1's implementation contract only —
`contracts/wholesale-section-browsing.md` + `data-model.md` — against 3 specific questions:
(1) is the new `category.html` `?wholesale_section=<id>` branch fully isolated from the existing
`?section=<slug>` path; (2) is Decision 3 (stale retail slug in wholesale mode) actually leak-free
as specified; (3) does moving wholesale-section CRUD out of `companies-crud.js` (T013) risk the
companies code the trim (T015) leaves behind. Ceremony (telemetry, config checks, office-hours
offer) skipped as a deliberate proportionality call, same as feature 004's review — narrow,
already-scoped verification, not a from-scratch architecture pass. Method: read the actual current
`src/pages/category.html` and `src/js/admin/companies-crud.js` source directly and traced the
contract's described changes against real line numbers/control flow, not just the design doc.

| # | Question | Verdict | Severity | Status |
|---|---|---|---|---|
| 1 | `category.html` branch isolation | Two concrete gaps found — not isolated as originally specified | CRITICAL (both) | Fixed — contract + tasks.md updated |
| 2 | Decision 3 leak-freedom | Confirmed leaky as originally specified; root cause identified (4 unhandled `slug` read-sites) | CRITICAL | Fixed — contract + data-model.md updated |
| 3 | T013/T015 move+trim side effects | Confirmed clean — no defect found | N/A (informational) | No action needed |

**Findings, detail**:

- **Redirect guard doesn't know about `wholesale_section`** (`category.html:635`). A bare
  `?wholesale_section=<id>` load — the feature's primary entry point (every "all products" banner
  and company card) — hits the existing guard's `!(isWholesaleMode() && companyId)` check, which
  has no `wholesale_section` awareness, and redirects to `index.html` before the new branch is ever
  reached. **Fixed**: guard condition extended to `!(isWholesaleMode() && (companyId || wholesaleSectionId))`.
- **Decision 3's "treat as absent" touches 4 code sites, not 1**: the redirect guard, the initial
  `currentSlug = slug` assignment, `resetFilters()`'s `currentSlug !== slug` dirty-check, and the
  filter panel's `sectionSelect.value = currentSlug || ''` (two call sites). Traced live: with the
  guard alone patched but `currentSlug = slug` left unconditional, a wholesale-mode visit to a stale
  `?section=<old-retail-slug>` (no `wholesale_section`, no `company`) falls through
  `fetchAndLabelProducts()` straight to `fetchProductsBySection(targetSlug)` — **retail products
  render inside a wholesale-mode page**, the exact leak this decision exists to prevent. **Fixed**:
  single `effectiveSlug = isWholesaleMode() ? null : slug` computed once, used at all 4 sites.
- **Filter-panel crash risk**, found while tracing the same neutralization: omitting the "القسم"
  `<select>` without guarding `wireFilterPanelEvents()`/`refetchAndSync()`'s unconditional
  `document.getElementById('filter-section').value = ...` throws `TypeError` on `null` — a hard
  crash of the *entire* filter panel (company facet, price inputs included) on the very first
  `?wholesale_section=<id>` load. **Fixed**: both sites now null-guarded in the contract's pseudocode.
- **`fetchAndLabelProducts()` parameter threading gap**: the function's existing `targetCompanyId`
  is a deliberate explicit parameter (not a closure), specifically so `refetchAndSync()` can re-fetch
  with a changed value — documented in the code's own comment. The original contract didn't specify
  whether the wholesale-section id gets the same treatment, or whether `refetchAndSync()`'s one call
  site gets updated to pass it. Left unspecified, initial load works but a company-facet change
  while on `?wholesale_section=<id>&company=<id>` silently drops the section scope. **Fixed**: added
  as an explicit 4th parameter, both call sites (`render()` and `refetchAndSync()`) specified.
- **`render()`'s unconditional `fetchActiveSections()` call** — runs today regardless of mode; left
  unconditional, a wholesale-mode `?wholesale_section=<id>` load still makes an unnecessary Supabase
  call to the retail `sections` table, a literal (if unrendered) SC-001 violation. **Fixed**: guarded
  to skip entirely in this mode.
- **T013/T015 (concern 3)**: read `companies-crud.js` directly — `editing`/`editingWholesaleSection`
  are already fully separate state, both admin tables' edit/delete wiring is already scoped to their
  own `tbody` (the exact self-caught cross-wiring bug from feature 004), and nothing in the companies
  half references the wholesale-section half. The move/trim is structurally sound. Two trivial LOW
  notes recorded but not applied to any doc (out of this review's approved edit scope, low enough
  impact that an implementer gets them right without a doc change): T015's wording names only one of
  the four now-unused `wholesale-sections-api.js` imports; removing the "أقسام الجملة" block (lines
  ~120-192) needs care to leave the template literal well-formed.

**Edits applied**: `contracts/wholesale-section-browsing.md` (explicit-parameter note on
`fetchProductsByCompany`'s extension; full rewrite of the `category.html` section — table wording,
new "redirect guard and slug neutralization" subsection, new "`render()` — no retail sections fetch"
subsection, new "filter panel" subsection with the crash-guard, new `fetchAndLabelProducts()`
subsection with the 4-parameter signature); `data-model.md` (two new rows in the browsing-context
table, a revision note); `tasks.md` (T010–T012 descriptions rewritten to carry this detail forward
so an implementer working from tasks.md alone, not the contract, still gets it right).

**VERDICT**: CLEARED for implementation on US1's `category.html` branch, contingent on T010–T012
being implemented against the now-corrected contract (not the original one-line task summaries).
No remaining open architecture questions — all three findings had one clearly correct fix, applied
directly rather than requiring a design trade-off discussion.

## IMPLEMENTATION UPDATE — T001–T012 complete

Phase 1 (Setup, T001) and Phase 3 (User Story 1, T002–T012) implemented against the corrected
contract above. Summary:

- **T001**: baseline confirmed — `npx vitest run` green (109 tests) before starting; migrations
  through `wholesale_sections` (014) applied per `mcp__supabase__list_migrations`. No feature branch
  exists for this project (no `.specify/extensions.yml` branch hook, consistent with features
  003/004) — worked directly on `main`, per established convention.
- **T002–T007**: `fetchActiveWholesaleSections()`, `fetchProductsByWholesaleSection()`,
  `fetchCompaniesForWholesaleSection()`, `fetchProductsByCompany()`'s `wholesaleSectionId` option,
  and `buildWholesaleSectionGridEntryHTML()`'s id-based link all added. T007 followed TDD per
  Constitution Principle VII: `tests/wholesale-section-grid-html.test.js` written and confirmed RED
  against the pre-change implementation, then T006 made it GREEN.
- **T008–T009**: `wholesale-home.html`/`wholesale-section-companies.html` rewired. One
  implementation-time gap found and fixed beyond the literal task text: `wholesale-section-
  companies.html`'s `!isWholesaleMode()` fallback used to bounce to `category.html?section=<slug>`
  reusing the (now wholesale-section) id as if it were a retail slug — nonsensical since the two
  keyspaces are disjoint (Decision 1). Changed to bounce to `index.html`, mirroring
  `wholesale-home.html`'s own existing fallback.
- **T010–T012**: implemented exactly against the corrected contract's pseudocode — `effectiveSlug`
  computed once and reused at every site, redirect guard extended, `fetchAndLabelProducts()`'s 4th
  parameter threaded through both call sites, filter-panel section-select omitted + null-guarded at
  both reference sites, `render()`'s retail-sections fetch skipped entirely in wholesale-section
  mode (with the sidebar `<aside>`/mobile-nav hidden via `style.display`, an implementation-time
  completion of "not rendered" beyond the contract's literal text). Also fixed, beyond the contract:
  `fetchCompanyFacetData()` now branches on `currentWholesaleSectionId` first, so the company facet's
  dropdown is scoped to the wholesale section instead of falling through to a global company list —
  the original contract's "nothing about how it's populated needs to change" undersold this.
- **Live verification** (no browser-automation tool available in this environment — verified via the
  strongest alternative available): (1) inserted a real test `wholesale_sections` row + assigned an
  existing active wholesale-priced product to it via `execute_sql`, then queried the exact REST
  shapes `fetchActiveWholesaleSections()`/`fetchProductsByWholesaleSection()`/
  `fetchCompaniesForWholesaleSection()` compile down to, anonymously (RLS-enforced, matching a real
  shopper's access) — all 8 checks passed; cleaned up immediately after (`wholesale_sections` back to
  0 rows, matching production's real starting state). (2) Extracted the actual shipped redirect-guard
  and `effectiveSlug` lines verbatim from `category.html` (grep-confirmed, not hand-paraphrased) into
  an isolated Node harness and ran all of quickstart.md §2–3's scenarios plus the Decision-3
  stale-link case and a retail-mode regression check — 9/9 passed, including the exact "bare
  `?wholesale_section=<id>` no longer redirects" and "stale retail slug in wholesale mode redirects
  instead of leaking" cases. (3) `git diff` confirms zero changes to `house-interactions.js`,
  `Frame 1.svg`, `Frame 2.svg`, `index.html`. (4) `mcp__supabase__get_advisors` (security): same 5
  pre-existing findings as baseline, nothing new (T001–T012 made no DDL changes).
- **Code review** (fresh-context subagent, uncommitted working-tree diff since nothing is committed
  yet): confirmed all three original CRITICAL findings genuinely fixed (traced by hand, not just
  comment-checked), confirmed retail-mode byte-for-byte isolation, confirmed both additive
  implementation-time fixes (company-facet scoping, sidebar hiding) were correct and necessary rather
  than scope creep. Found one real, previously-unflagged bug: `onCompanyFacetChange()`'s dead-end
  guard (`!newCompanyId && !currentSlug`) didn't account for the new `currentWholesaleSectionId` key
  — `currentSlug` is now unconditionally null in wholesale-section mode, so clearing the company
  facet on a `?wholesale_section=<id>&company=<id>` page was wrongly treated as a dead end and
  silently reverted instead of re-fetching to the valid section-only listing. **Fixed**: guard
  extended to `!newCompanyId && !currentSlug && !currentWholesaleSectionId`. Re-ran the full test
  suite (114/114 green) after the fix. Two Minor notes recorded, not blocking (a soft-deleted
  wholesale-section id leaves the breadcrumb on a loading placeholder rather than a clean not-found
  state — a gap in the contract's own pseudocode, not an implementer deviation; and a cosmetic
  `escapeHtml` vs `encodeURIComponent` convention difference in `wholesale-section-grid-html.js`).
  Final verdict: **Ready to merge: With fixes** — fix applied, suite re-verified.

**Final status**: T001–T012 complete, all tests green (114/114), zero retail-path changes, code
review fix applied and re-verified.

## IMPLEMENTATION UPDATE — T013–T016 complete

Phase 4 (User Story 2, T013–T016) implemented — the wholesale-section CRUD feature 004 stacked onto
`companies-crud.js`/`companies.html` moved into its own dedicated page.

- **T013**: `src/js/admin/wholesale-sections-crud.js` created, exporting `initializeWholesaleSectionsPage(root)`
  — the wholesale-section form/table/state/wiring moved verbatim (form fields, `sanitizeInput`/
  `Number(...) || 0` validation, both confirm/alert Arabic strings, empty-state markup,
  `#admin-wholesale-sections-tbody`-scoped edit/delete wiring) from `companies-crud.js`. Full CRUD
  (create/rename/reorder/activate-deactivate/soft-delete) preserved unchanged. One cosmetic,
  non-behavioral adaptation: the form's heading moved from `<h3>` (nested under the old combined
  page's `<h2>أقسام الجملة</h2>`) to `<h2>` (the page's own primary heading, since that wrapper no
  longer exists) — code-review-confirmed as a heading-hierarchy improvement, not a capability change.
- **T014**: `src/pages/admin/wholesale-sections.html` created, mirroring `sections.html`'s exact page
  shell (head/Tailwind config, mobile topbar, `#sidebar-backdrop`, `#admin-sidebar` structure, logout
  wiring, mobile menu-toggle script) and mounting `initializeWholesaleSectionsPage()`. Its own sidebar
  self-links with the active-state style; not yet linked from the other six admin pages'
  sidebars — correctly deferred to US4 (confirmed via repo-wide grep: no page besides
  `wholesale-sections.html` itself references it yet).
- **T015**: `companies-crud.js` trimmed to companies-only. Verified: `uploadLogo()`, the file input,
  and the `logo_url = editing?.logo_url || ''` preserve-on-edit path are completely untouched; the
  `#admin-companies-tbody`-scoped edit/delete wiring (the exact scoping that avoided feature 004's
  self-caught cross-wiring bug) remains correct now that only one table exists; grep for all eight
  removed symbols (`editingWholesaleSection`, `wsFormValues`, `fetchAllWholesaleSectionsAdmin`,
  `createWholesaleSection`, `updateWholesaleSection`, `softDeleteWholesaleSection`,
  `renderWholesaleSectionFormFieldValues`, `renderWholesaleSectionRow`) confirms zero leftover
  references or dead imports.
- **T016**: `companies.html`'s `<title>` reverted to "إدارة الشركات | لوحة التاجر" (the page's
  heading/description are rendered dynamically by `companies-crud.js`, already fixed by T015's trim).
- **Live verification** (same no-browser-tool constraint as US1, same strongest-available alternative):
  static grep confirmed `wholesale-sections-crud.js` has zero company references and
  `companies-crud.js` has zero wholesale-section UI references (quickstart §1 steps 2/6). A full
  create → list → rename+reorder → deactivate → reactivate → soft-delete → list round-trip was run
  live against the real `wholesale_sections` table via `execute_sql`, using the exact query shapes
  `fetchAllWholesaleSectionsAdmin()`/`createWholesaleSection()`/`updateWholesaleSection()`/
  `softDeleteWholesaleSection()` compile to (quickstart §1 steps 3–5) — every step behaved correctly,
  including the soft-deleted row correctly disappearing from the admin list while the row itself
  remains (zero data loss). Test data cleaned up immediately after (`wholesale_sections` back to 0
  rows). `mcp__supabase__get_advisors` (security): same 5 pre-existing findings as baseline, nothing
  new (T013–T016 made no DDL changes). `npx vitest run`: 114/114, unchanged from US1 (no new tests
  required for this phase per tasks.md).
- **Code review** (fresh-context subagent, scoped to this phase's diff): confirmed the move is
  genuinely byte-for-byte faithful (every form field, validation rule, and confirm/alert string
  diffed and matched), confirmed `companies-crud.js`'s isolation holds after the trim, confirmed zero
  bleed into US1 files, US3's icon-picker work, US4's nav module, or the protected house-hero files.
  Zero Critical, zero Important findings. One Minor, non-blocking note (the `h3→h2` heading change
  above, explicitly assessed as an improvement, not a regression). **Ready to merge: Yes** — no fixes
  required.

**Final status**: T001–T016 complete, all tests green (114/114), zero retail-path changes, US1's
code-review fix still in place and unaffected by this phase, US2's code review clean with no fixes
needed.

## IMPLEMENTATION UPDATE — T017–T023 complete

Phase 5 (User Story 3, T017–T023) implemented — `wholesale_sections` gains `icon_name`, and both
admin forms share one icon-picker module.

- **T017**: `supabase/migrations/015_wholesale_section_icon.sql` created (had not existed on disk
  yet) and applied via `mcp__supabase__apply_migration`. Verification checklist run in full:
  `list_tables` confirms `icon_name` is `character varying`, nullable, no default; a test row with
  a valid `icon_name` and one with `icon_name` omitted both inserted successfully (sanitize trigger
  unaffected, `icon_name` not required); `get_advisors` (security) shows the same 5 pre-existing
  findings as baseline, nothing new; test rows deleted immediately after (`wholesale_sections` back
  to 0 rows).
- **T018/T022 (TDD)**: `tests/icon-picker.test.js` written first against the intended
  `icon-picker.js` API (11 cases: `iconSource()` fallback for known/unknown/null/undefined names,
  full-grid rendering, selected-icon marking, hidden-input defaulting, `special` config
  present/absent, special styling scoped to only the configured icon, tag-injection escaping of
  `special.label`/`special.hint`) — confirmed RED (`Cannot find module`, i.e. the feature genuinely
  didn't exist yet). `src/js/admin/icon-picker.js` then created — `ICONS`/`ICON_DIRECTORY`/
  `DEFAULT_ICON`/`iconSource()` moved verbatim from `sections-crud.js`, plus `renderIconPickerHTML`
  and `wireIconPicker` — confirmed GREEN (11/11).
- **T019**: `sections-crud.js` refactored to import from `icon-picker.js` instead of its own local
  copies; the inline picker markup replaced with `renderIconPickerHTML(editing.icon_name, {
  special: {...} })`, the inline click-handling replaced with `wireIconPicker(root,
  '#selected-icon-input')`. Byte-identical-output verification: a scratch Node harness
  reconstructed the *original* inline block verbatim (from the pre-edit file) and diffed it
  (whitespace-normalized) against the new shared module's output across 5 scenarios (known icon,
  the special Gift_Home.svg icon, another known icon, `null`, and an unknown icon name) — all 5
  matched exactly. `wireIconPicker`'s click-handling logic is a verbatim line-for-line port of the
  original inline handler (including its pre-existing quirk of always applying the retail-blue
  selected styling on click regardless of which icon, special or not, was clicked — preserved
  as-is, not "fixed", since this is a pure extraction).
- **T020/T023 (TDD)**: new test cases added first to `tests/admin-templates.test.js`
  (`renderWholesaleSectionFormFieldValues`: defaults `icon_name` to `DEFAULT_ICON` for no-editing/
  absent/unknown icon, preserves a known one; `renderWholesaleSectionRow`: icon thumbnail via
  `iconSource()`, default-icon fallback, never renders the retail-only "مميز" badge, tag-injection
  defense-in-depth) — confirmed RED (6 failures) against the pre-change `admin-templates.js`.
  `admin-templates.js` then extended to import `ICONS`/`DEFAULT_ICON`/`iconSource` from
  `icon-picker.js` and apply them in both functions — confirmed GREEN (31/31 in this file).
- **T021**: `wholesale-sections-crud.js`'s form wired to `renderIconPickerHTML(
  editingWholesaleSection?.icon_name, {})` (no `special` config, matching the contract's exact
  call shape — the raw `editing?.icon_name`, not the already-defaulted `wsFormValues.icon_name`,
  since passing the pre-defaulted value would have wrongly pre-selected `DEFAULT_ICON`'s button
  for a brand-new section that hasn't chosen an icon yet) + `wireIconPicker(root,
  '#selected-icon-input')`; submit payload gains `icon_name: rawData.icon_name`. Table header/
  empty-state `colspan` updated from 4 to 5 columns for the new icon thumbnail column.
- **Live verification** (same no-browser-tool constraint as US1/US2): full quickstart §1 round-trip
  run live against `wholesale_sections` via `execute_sql`, using the exact query shapes
  `fetchAllWholesaleSectionsAdmin()`/`createWholesaleSection()`/`updateWholesaleSection()`/
  `softDeleteWholesaleSection()` compile to — created a section with an icon, confirmed it appears
  immediately in the admin-list shape with that icon; renamed + reordered + changed its icon,
  confirmed the new icon persists on reopen; toggled inactive then active; created and
  soft-deleted a second throwaway section, confirmed it disappears from the non-deleted list while
  the first section's data (including its changed icon) remains correct. Quickstart §2 (storefront
  reflects the created section): queried `wholesale_sections` as the `anon` role (the same RLS path
  `fetchActiveWholesaleSections()` uses) and confirmed the section's `icon_name` is readable
  end-to-end. All test data cleaned up immediately after each check (`wholesale_sections` back to 0
  rows, matching production's real starting state). `git diff` confirms zero changes to
  `house-interactions.js`, `Frame 1.svg`, `Frame 2.svg`, `index.html`. `mcp__supabase__get_advisors`
  (security): same 5 pre-existing findings as baseline, nothing new. `npx vitest run`: 133/133 (up
  from 114 at the end of US2 — 11 new in `icon-picker.test.js`, 8 new in the extended
  `admin-templates.test.js`).
- Static verification: grep confirms `ICONS`/`ICON_DIRECTORY`/`DEFAULT_ICON`/`iconSource` are now
  defined in exactly one place (`icon-picker.js`) across the whole `src/` tree — no duplicate copy
  survived the extraction anywhere. Grep of `companies-crud.js` for `wholesale`/`icon` (case
  insensitive) turns up only a pre-existing explanatory comment, zero actual UI/wiring — US2's trim
  holds after this phase's changes to the shared `admin-templates.js` it also imports from.

- **Code review** (fresh-context subagent, uncommitted working-tree diff scoped to this phase's
  seven files only — US1/US2's already-reviewed diffs excluded): independently re-verified the
  migration live (`list_migrations`/`list_tables`), independently line-by-line compared the deleted
  inline picker block against `icon-picker.js`'s output and confirmed the T019 extraction is
  genuinely behavior-preserving, independently traced `icon_name`'s missing DB-level constraint
  against `sanitize_text_trigger()`'s actual source and confirmed the app-layer `ICONS.includes()`
  allow-list is the sole (and sufficient, tested) safeguard, confirmed `special` stays retail-only,
  confirmed the wholesale table's header/colspan match `renderWholesaleSectionRow`'s cell count,
  and re-ran `npx vitest run` (133/133) itself. Zero Critical, zero Important findings. Two Minor,
  non-blocking notes: (1) `renderWholesaleSectionFormFieldValues`'s new `icon_name` field has no
  live production reader in `wholesale-sections-crud.js` (which reads `editing?.icon_name` straight
  off the record instead, matching the pre-existing retail convention) — addressed with a
  clarifying comment rather than a code change, since the field is still correctly part of the
  function's tested contract; (2) `research.md`'s Decision 5 sketch names an earlier, superseded
  API shape (`wireIconPicker(root, onSelect)`, flat `specialIcon`/`specialLabel`/`specialHint`) that
  the actually-shipped code correctly diverges from in favor of the authoritative `admin-ui.md`
  contract — doc-only drift, not addressed (out of this phase's edit scope; `admin-ui.md` remains
  accurate). **Ready to merge: Yes** — no fixes required beyond the one clarifying comment.

**Final status**: T001–T023 complete, all tests green (133/133), zero retail-path changes, US1 and
US2's prior fixes/verifications unaffected by this phase, code review clean (Ready to merge: Yes).

## IMPLEMENTATION UPDATE — T024–T032 complete

Phase 6 (User Story 4, T024–T032) implemented — every admin page's hand-copied sidebar `<nav>`
block replaced by one shared module.

- **T024/T025 (TDD)**: `tests/admin-nav.test.js` written first against the intended
  `admin-nav.js` API (21 cases across four groups: all 7 links present/correctly ordered, flat
  links never nested inside a group panel, each group's own links correctly scoped to only that
  group's panel, exactly one link marked active per `activePage` value including an unknown-page
  case, and FR-016 auto-expand for every one of the 7 real page identities plus the two flat-link
  and one unknown-page no-expand cases) — confirmed RED (`Cannot find module`). `src/js/admin/
  admin-nav.js` then created — `renderAdminSidebarHTML(activePage)` (pure template) and
  `initAdminSidebarBehavior(root, activePage)` (DOM wiring) — confirmed GREEN (21/21) on the first
  implementation pass. Structure matches `contracts/admin-ui.md` exactly: two flat links
  (`dashboard.html`, `products.html`), group "إدارة متجر المستهلك" (`sections.html`), group "إدارة
  متجر الجملة" (`wholesale-sections.html`, `companies.html`, `invoices.html`, `customers.html` in
  that order). FR-016's auto-expand state is baked into `renderAdminSidebarHTML()`'s own output
  (testable without a DOM), mirroring how `icon-picker.js`'s `renderIconPickerHTML()` already
  splits initial-state rendering from `wireIconPicker()`'s click-time-only behavior —
  `initAdminSidebarBehavior()` only wires the click-to-toggle transition, it doesn't need to
  re-derive the initial expand state since render already got it right.
- **T026–T032**: all seven admin pages (`dashboard.html`, `products.html`, `sections.html`,
  `companies.html`, `wholesale-sections.html`, `invoices.html`, `customers.html`) had their
  hand-written `<nav class="flex-grow p-4 flex flex-col gap-2">...</nav>` block replaced with
  `<nav class="flex-grow p-4 flex flex-col gap-2" id="admin-nav"></nav>`, and their module script
  gained `import { renderAdminSidebarHTML, initAdminSidebarBehavior } from
  '../../js/admin/admin-nav.js'` plus the two-call wiring, each using that page's own filename as
  the `activePage` literal. `invoices.html` (the one page with a structurally different
  script/layout, including `no-print` classes on the sidebar chrome) required locating the
  insertion points by grep rather than by a fixed line offset — its `no-print` classes on
  `<aside>`/backdrop were left untouched, confirmed by direct inspection after the edit. No other
  part of any of the 7 pages changed — mobile-topbar, logout wiring, sidebar-backdrop toggle, and
  each page's own main-content logic are all byte-for-byte as before except for the one nav block
  and one import/wiring addition.
- **Live verification** (same no-browser-tool constraint as prior phases): (1) grep confirms zero
  hand-written sidebar `<a>` links remain anywhere under `src/pages/admin/` — the old markup is
  fully gone, not just shadowed; (2) grep confirms all 7 pages pass the *correct* per-page
  `activePage` literal to *both* `renderAdminSidebarHTML()` and `initAdminSidebarBehavior()` (own
  filename, no copy-paste mismatches); (3) a scratch Node harness imported the actual shipped
  `admin-nav.js` and ran it with each of the 7 real literals grepped from the real pages (not
  hand-retyped), checking every quickstart.md §4 assertion (steps 1–5: both flat links + both
  group labels present and correctly ordered on every page; `sections.html` auto-expands the
  consumer group only, with its own link active; each of `companies.html`/`wholesale-
  sections.html`/`invoices.html`/`customers.html` auto-expands the wholesale group only, with only
  its own link active among the group's four; `dashboard.html`/`products.html` force-expand
  neither group) — all 36 checks passed. Step 6 (manual expand/collapse click behavior) is DOM
  wiring code (`initAdminSidebarBehavior`'s `toggle.onclick`) verified by direct code inspection
  rather than executed, per Constitution Principle VII precedent (DOM-wiring functions aren't
  unit-tested; this is the same class of code as `wireIconPicker()`, already reviewed correct in
  US3) — it toggles the `hidden` class on the group's panel and a `rotate-180` class on its
  chevron, both already exercised structurally by the render-time tests above. `npx vitest run`:
  154/154 (up from 133 — 21 new in `admin-nav.test.js`). `git diff` confirms zero changes to
  `house-interactions.js`, `Frame 1.svg`, `Frame 2.svg`, `index.html`, and zero further changes to
  any US1/US2/US3 file. `mcp__supabase__get_advisors` (security): same 5 pre-existing findings as
  baseline (this phase made no DDL changes).

- **Code review** (fresh-context subagent, uncommitted working-tree diff scoped to this phase's
  files only — US1/US2/US3's already-reviewed diffs excluded): independently cross-checked all 7
  pages' `activePage` literals against their own filenames (the specific copy-paste-mismatch risk
  the review was asked to hunt for) and found zero mismatches; independently confirmed via grep
  that no hand-written sidebar `<a>` markup survives anywhere under `src/pages/admin/`; confirmed
  `invoices.html`'s `no-print` classes and all other pages' mobile-topbar/logout/backdrop wiring
  are untouched; re-ran `npx vitest run` itself (154/154). Zero Critical, zero Important findings.
  Three Minor, non-blocking notes, none requiring a change: (1) `initAdminSidebarBehavior` (the
  click-toggle DOM wiring) has no direct test coverage — consistent with this codebase's existing
  precedent of not unit-testing DOM-wiring functions (same treatment as `wireIconPicker()` in US3),
  noted as cheap future insurance rather than a gap; (2) `groupContainingActivePage()` recomputes
  once per group per render call — trivial at this scale (2 static groups), not worth restructuring;
  (3) no `aria-expanded` attribute on the group toggle buttons — cosmetic a11y polish, consistent
  with the rest of the codebase's current baseline, out of this feature's stated FRs. **Ready to
  merge: Yes** — no fixes required.

**Final status**: T001–T032 complete, all tests green (154/154), zero retail-path changes, US1/US2/
US3's prior fixes/verifications unaffected by this phase, code review clean (Ready to merge: Yes).

## IMPLEMENTATION UPDATE — T033–T037 complete (Polish & Cross-Cutting Concerns)

Phase 7 implemented — final verification spanning all four user stories.

- **T033**: `companies-crud.js` re-read post-US2-trim: `uploadLogo()` (storage upload to
  `store-assets`, `companies/<uuid>.<ext>` path), the file input, and the
  `logoUrl = editing?.logo_url || ''` preserve-on-edit path (only overwritten when
  `form.logo.files[0]` is present) are all byte-for-byte unchanged by the trim. Live-verified:
  created a company with a `logo_url`, then updated it sending the exact payload shape the page's
  submit handler builds for a no-new-file edit (name changed, `logo_url` re-sent unchanged) —
  `logo_url` persisted correctly. `company-card-html.js` (unrelated file, not touched by this
  feature) already has test coverage for the image-vs-monogram fallback. No code change needed —
  matches research.md Decision 6.
- **T034**: `npx vitest run` — **154/154 green**, including every phase's new coverage
  (`wholesale-section-grid-html.test.js` +5, `icon-picker.test.js` +11, `admin-nav.test.js` +21,
  extended `admin-templates.test.js` +8).
- **T035**: `git diff --stat` against `house-interactions.js`, `Frame 1.svg`, `Frame 2.svg`,
  `index.html` — empty output across the entire feature's full T001–T037 diff, not just this
  phase's.
- **T036**: `mcp__supabase__get_advisors` (security) — same 5 pre-existing baseline findings,
  nothing new.
- **T037**: quickstart §6 run as one consolidated live walkthrough threading §1→§2→§3 together
  (not just isolated per-phase checks, since quickstart explicitly calls for confirming the
  sections hold together): created a wholesale section with an icon, a company, and a product
  placed in both — then, as the `anon` role (matching real shopper RLS access), replayed the exact
  query shapes `fetchActiveWholesaleSections()` (wholesale-home.html) →
  `fetchProductsByWholesaleSection()`/`fetchCompaniesForWholesaleSection()`
  (wholesale-section-companies.html) → `fetchProductsByCompany(id, { wholesaleSectionId })`
  (category.html's company+section drill-down) — the section, its icon, the company, and the
  product surfaced correctly at every step. A retail-regression spot check (`fetchActiveSections()`
  shape) confirmed 12 active retail sections, untouched. All test data cleaned up immediately
  after.
- **Additional item 1 (US3 code-review Minor note)**: the "pre-existing doc drift in research.md,
  not code" note was investigated and fixed earlier in this session, ahead of this Polish phase —
  Decision 5's `wireIconPicker(root, onSelect)` → `wireIconPicker(root, hiddenInputSelector)` and
  `{ specialIcon, specialLabel, specialHint }` → `{ special: { icon, label, hint } }`, now matching
  `contracts/admin-ui.md` and the shipped `icon-picker.js` exactly. Re-confirmed still correct as
  part of this phase — no further action needed.
- **Additional item 2 (SC-006 verification)**: SC-006 ("splitting companies.html into two pages
  does not drop, duplicate, or corrupt any existing company or wholesale-section row") is satisfied
  by construction — T013/T015 (US2) is a pure client-side code move (JS function/markup relocated
  between files), with zero database operations of any kind; no migration in this feature (015,
  016) performs DML on `companies` or `wholesale_sections`, only DDL (an added column, and unrelated
  triggers on other tables). There is no code path by which relocating JS definitions between files
  could touch a database row, so no data-loss/duplication mechanism exists for this change to
  trigger. As live supporting evidence (not the primary guarantee, since this pre-launch project
  has no real company/wholesale-section data yet): `companies` and `wholesale_sections` both sit at
  0 rows with 0 duplicate names, matching the same baseline every prior phase's cleanup left them
  at — confirming no orphaned/duplicate rows leaked from this feature's own test-data cycles
  either.
- **Final full-feature code review** (fresh-context subagent, no session history, full T001–T037
  diff, standalone `TODOS.md`/migration-016 security fix explicitly excluded from scope — same
  final-review pattern as features 003/004): independently re-derived and re-verified, against the
  live diff rather than the plan's own narrative, all three CRITICAL findings from US1's
  mid-implementation `/plan-eng-review` (redirect-guard gap, 4-site slug leak, filter-panel crash) —
  confirmed genuinely fixed, not just claimed fixed. Independently confirmed: `ICONS`/
  `ICON_DIRECTORY`/`DEFAULT_ICON`/`iconSource` exist in exactly one place; zero hand-written sidebar
  markup remains in any of the 7 admin pages with correct per-page `activePage` literals;
  escaping is consistent at every render boundary touched by this feature; migration 015 is exactly
  as specified (re-verified live via `list_migrations`/`list_tables`/`get_advisors`); US2's
  `companies.html` trim left FR-010/FR-011 untouched; all 37 tasks in `tasks.md` are marked `[X]`
  and the code backs up every one on inspection. Re-ran `npx vitest run` itself (154/154). Zero
  Critical, zero Important findings. Three Minor, non-blocking notes: (1) a stale comment in
  `wholesale-sections-api.js` still said "called from companies-crud.js" (pre-US2-move wording) —
  **fixed**, updated to `wholesale-sections-crud.js`; (2) `admin-nav.js`'s
  `initAdminSidebarBehavior(root, activePage)` never reads its `activePage` parameter (FR-016's
  expand state is fully baked into `renderAdminSidebarHTML()`'s output already) — left as-is, since
  the two-arg signature matches `contracts/admin-ui.md` exactly and removing it would deviate from
  the documented contract for no functional gain; (3) a soft-deleted `?wholesale_section=<id>`
  leaves the breadcrumb on a static loading placeholder rather than a clean not-found state — already
  identified and consciously deferred as non-blocking during US1's own phase review (a gap in the
  contract's own pseudocode, not an implementer deviation); reviewer independently confirmed it's
  still cosmetic-only (no data leak, no crash). **Ready to merge: Yes.**

**Final status**: T001–T037 complete — all four user stories (US1–US4) plus Polish. All tests green
(154/154). Zero retail-path/house-hero changes across the entire feature. Security advisors:
unchanged baseline. SC-006 satisfied by construction, confirmed with live row-count evidence.
Final full-feature fresh-context code review: **Ready to merge: Yes**, zero Critical/Important
findings, one Minor fix applied, two Minor notes consciously deferred (non-blocking).

NO UNRESOLVED DECISIONS
