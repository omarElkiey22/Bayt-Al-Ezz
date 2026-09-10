# Research: Admin Control Center v3

## Decision 1: `wholesale_sections` is keyed by `id` in URLs, not a new `slug` column

**Decision**: Every new query-param/link that scopes to a wholesale section uses its uuid
(`?wholesale_section=<id>`), not a slug. No `slug` column is added to `wholesale_sections`.

**Rationale**: `wholesale_sections` (migration 014) was deliberately built without a `slug` column
— its own header comment says so explicitly: *"No slug (nothing routes to a wholesale section by
URL — it's selected by id in the product form, same as `company_id` already is)"*. This feature is
the first to route to a wholesale section by URL, but the codebase already has a live precedent
for id-keyed (not slug-keyed) routing to a comparable entity: `companies` has no dedicated
slug-based route either — every company-scoped link in the codebase today is `?company=<id>`
(`category.html`, `wholesale-home.html`'s company showcase, `wholesale-section-companies.html`'s
company cards). Following that precedent keeps this feature's schema footprint to exactly the one
column the spec actually asked for (FR-008's `icon_name`) and avoids a second uniqueness/slug-
collision concern migration 014 explicitly chose not to take on.

**Alternatives considered**:
- *Add a `slug` column to `wholesale_sections`*: rejected — no functional benefit over an id (no
  SEO requirement was stated for wholesale URLs, unlike the retail storefront's Principle V/SEO
  non-functional requirement), and it would need its own uniqueness handling that migration 014's
  author deliberately avoided.

## Decision 2: `category.html` gains a narrow `wholesale_section=<id>` filtering branch (not full parity)

> **Revised during planning** (`/speckit.clarify` correction, superseding this decision's initial
> "full filter-panel parity" conclusion reached earlier in the same planning session). The scope
> below is the one actually implemented; the full-parity option is kept in "Alternatives
> considered" for the record, along with why it was reconsidered.

**Decision**: `category.html` learns a second, wholesale-mode-only query parameter —
`?wholesale_section=<id>` — that filters the fetched products by `wholesale_section_id`,
optionally combined with `&company=<id>` to further narrow to one company. This branch reuses the
existing product grid, cart, and company facet as-is, but does **not** extend the retail-only
sidebar section navigation or the slug-based filter-panel section-facet dropdown to wholesale
sections — those stay exactly as they are today, simply not shown/populated in this mode.
`?section=<slug>` keeps its exact current meaning and code path in retail mode, completely
untouched. In wholesale mode, `?section=<slug>` is no longer honored as a section-scoping key (see
Decision 3) — `?wholesale_section=<id>` replaces it for every wholesale-mode link this feature
produces.

**Rationale**: tracing the actual dependency revealed that `wholesale-section-companies.html`'s
"all products in this section" banner and its per-company cards both link into `category.html`
using the *retail* section's slug today (`category.html?section=<slug>[&company=<id>]`) — a
leftover from before `wholesale_sections` existed, when there was nothing else to key by. Fixing
US1 without also fixing this leaves those two links either dead or (if the retail slug happens to
coincidentally still resolve) silently serving retail-section inventory inside a "wholesale
section" page — precisely the class of defect this feature exists to eliminate. Of the options
below, the narrow branch was chosen as a contained, testable change that resolves both links
without teaching `category.html`'s deeply retail-coupled filter-panel/sidebar-nav logic
(`sectionsCache`, `buildSidebarNavLinkHTML`, the "القسم" `<select>`, `loadNavigation()`, and every
call site that assumes a slug) about a second, differently-shaped entity throughout. That logic is
large, already intricate (see its own in-code state-management comments), and touching it broadly
carries real regression risk to the retail path this feature must leave provably unchanged
(spec.md Acceptance Scenario 4, SC-002) for a capability (switching wholesale sections mid-browse
from within the filter panel) nothing in the spec actually asks for.

**Alternatives considered**:
- *Full filter-panel parity* (the option initially chosen, then reconsidered): in wholesale mode,
  source the sidebar-nav and the filter panel's "القسم" dropdown from `wholesale_sections`, exactly
  mirroring how they're sourced from `sections` in retail mode. Rejected on reconsideration — it is
  substantially larger and riskier (new `wholesaleSectionsCache` state, a new
  `wholesale-section-nav-html.js` module, mode-branching through `loadNavigation()` and the filter
  panel's section-select construction) than the actual problem requires: the two broken links only
  need a valid *fetch* target, not a full section-switching UI inside `category.html` — nothing in
  spec.md's User Story 1 or its acceptance scenarios asks for that, only that the two links resolve
  correctly against `wholesale_sections`.
- *Avoid touching `category.html`, fall back both links to `?company=<id>` only*: rejected — loses
  the "just this wholesale section, from this company" narrowing entirely, a real capability
  regression from what the (admittedly slug-broken) links attempt today.
- *Drop the "all products" banner*: rejected — removes a working, spec-adjacent capability
  (Edge Cases in spec.md explicitly discusses section deletion mid-browse, implying the "browse a
  section's full catalog" flow is expected to keep working).

## Decision 3: In wholesale mode, a stale `?section=<slug>` is treated as absent, not as an error

**Decision**: If a wholesale-mode page load carries a `?section=<slug>` param (an old link/bookmark
predating this feature), `category.html` does not attempt to resolve it against `wholesale_sections`
(it's a slug, not an id, and wouldn't resolve) nor against retail `sections` (would leak retail
inventory into a wholesale-mode page, the exact class of bug this feature fixes). It is treated
exactly like no section param at all — the page falls back to its no-section-context listing
(search results, or the company-only / fully-unscoped listing), never to a retail fetch.

**Rationale**: `wholesale_sections` starts empty in production (per spec.md's explicit assumption)
and this is the *first* feature to ever produce a `wholesale_section`-keyed or even a
wholesale-meaningful `section`-keyed link — so no real deep link anyone has actually bookmarked or
shared depends on the old (broken) `?section=<slug>` behavior in wholesale mode. Silently no-op'ing
it is strictly safer than resolving it against the wrong table.

## Decision 4: Hidden-section gating (`library-book.svg`) does not extend to wholesale sections

**Decision**: The retail-only "hidden section" convention — a section whose `icon_name` is
`library-book.svg` is invisible to non-admin storefront visitors (`getHiddenSectionContext()` in
`products-api.js`) — is not replicated for `wholesale_sections` in this feature. Every active,
non-deleted wholesale section is visible to every wholesale-mode visitor, admin or not.

**Rationale**: nothing in spec.md's Functional Requirements, Edge Cases, or Assumptions asks for an
admin-only wholesale section, and introducing the concept silently (by reusing the same icon-based
convention) would be scope creep the spec never requested. `fetchProductsByWholesaleSection()` and
`fetchActiveWholesaleSections()` therefore skip the `getHiddenSectionContext()` check entirely —
simpler than the retail equivalents, not a partial/buggy port of them.

## Decision 5: Icon-picker logic is extracted into a shared module, reused (not duplicated) by both admin forms

**Decision**: `ICONS`, `ICON_DIRECTORY`, `DEFAULT_ICON`, and `iconSource()` — currently private to
`sections-crud.js` — move to a new `src/js/admin/icon-picker.js`, alongside two new pure/DOM
helpers: `renderIconPickerHTML(selectedIcon, options)` (the picker grid markup) and
`wireIconPicker(root, hiddenInputSelector)` (click-handling, selected-state toggling, writing the
chosen filename into the hidden input named by that selector). `sections-crud.js` is refactored to
import from this module instead of defining its own copies. The new `wholesale-sections-crud.js`
imports the same module for its own icon field.

One piece of `sections-crud.js`'s current picker is retail-specific and does **not** move: the
`Gift_Home.svg` "مميز" (special triangle-position) callout — that visual/copy special-case is about
the retail house hero's triangle slot, which has no wholesale equivalent. `renderIconPickerHTML()`
accepts an optional `{ special: { icon, label, hint } }` config so `sections-crud.js` can keep
passing that callout in, while `wholesale-sections-crud.js` simply omits it and gets a plain grid.

**Rationale**: the user's plan-phase instruction explicitly asks to reuse "the exact icon-picker
pattern... do not build a separate icon system," and Constitution Principle VI requires shared
logic to live in one place rather than be copy-pasted. The click-handling logic itself
(toggle-selected-classes, write to a hidden input) has nothing retail-specific about it, so it
belongs in the shared module along with the data; only the one cosmetic special-case stays local
to its one caller.

**Alternatives considered**:
- *Copy-paste the picker into `wholesale-sections-crud.js`*: rejected outright — directly violates
  both the user's explicit instruction and Constitution VI, and is exactly the kind of duplication
  the plan-eng-review process in prior features has flagged as a finding after the fact.

## Decision 6: Company logo upload (FR-010/FR-011) is a verification task, not a build task

**Decision**: No new code is written for company logo upload. Implementation re-confirms that
`src/js/admin/companies-crud.js`'s existing `uploadLogo()` function and its `<input type="file"
name="logo">` field (already wired to `logo_url` via `compressImage()`, same pattern as product
images) satisfy FR-010/FR-011/SC-005 as written, and records that confirmation.

**Rationale**: confirmed during spec-writing (grep + direct code read of
`src/js/admin/companies-crud.js` lines 1–20 and 60–65) — the upload input, the `compressImage()`
call, and the `logo_url` write-back on submit are all already present and match the spec's
described end state exactly. Re-implementing working code would be pure waste and risks
introducing a regression into code that already works. This mirrors how feature 004 handled its
own stale T014 gap (found already implemented, converted to a verification task).

**Alternatives considered**: none — this is a factual finding, not a design choice.

## Decision 7: Sidebar navigation is extracted into a shared module, reused (not duplicated) by all 7 admin pages

**Decision**: A new `src/js/admin/admin-nav.js` exports `renderAdminSidebarHTML(activePage)` (pure
template, given the current page's filename) and `initAdminSidebarBehavior(root)` (wires the two
collapsible groups' toggle behavior, and expand-by-default for whichever group contains
`activePage`). Every admin page's `<nav class="flex-grow p-4 flex flex-col gap-2">...</nav>` block
is replaced with a call to this module instead of its own copy-pasted link markup.

**Rationale**: the sidebar's link markup was already duplicated across all 6 pre-existing admin
pages before this feature (a pre-existing Constitution VI gap, not one this feature introduces),
and this feature both adds a 7th page and meaningfully increases the markup's complexity
(collapsible groups, active-group-expansion logic) — making the duplication cost of *not*
extracting it now substantially higher than it was. Centralizing it also directly serves FR-015
("MUST be identical across all seven admin pages") — a single render function is definitionally
identical everywhere it's called, whereas seven independently-maintained copies are not.

**Alternatives considered**:
- *Copy-paste the new collapsible markup into all 7 pages, matching the existing (pre-feature)
  pattern*: rejected — compounds an existing DRY gap right as the feature explicitly requires
  perfect cross-page consistency (FR-015), which is exactly the property a shared module
  guarantees structurally and copy-paste does not.

## Decision 8: `wholesale-sections.html` (new page) gets its own CRUD controller, moved out of `companies-crud.js`

**Decision**: The wholesale-section CRUD logic feature 004 added inside `companies-crud.js`
(`fetchAllWholesaleSectionsAdmin`/`createWholesaleSection`/`updateWholesaleSection`/
`softDeleteWholesaleSection` calls, the `editingWholesaleSection` state, the second form+table
block) is moved — not copied — into a new `src/js/admin/wholesale-sections-crud.js` exporting
`initializeWholesaleSectionsPage(root)`, mirroring `sections-crud.js`'s shape. `companies-crud.js`
reverts to companies-only, as it would have looked before feature 004 stacked the two concerns
onto one page for expediency.

**Rationale**: directly implements spec.md FR-005/FR-006/FR-007. Moving (not copying) means the
existing wholesale-section create/rename/reorder/deactivate/soft-delete behavior FR-007 requires
carries over with zero re-implementation risk — only its file location and the icon field (Decision
5) are new.
