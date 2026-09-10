# Feature Specification: Admin Control Center v3 — Wholesale Storefront Wiring, Page Split & Nav Restructure

**Feature Branch**: `005-admin-control-center-v3`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Admin Control Center v3 — wholesale storefront wiring, page split, and navigation restructure: (1) wire wholesale-home.html and wholesale-section-companies.html to read wholesale_sections instead of the retail sections table, leaving the retail house/12-zone interface untouched; (2) split companies.html (companies + wholesale sections CRUD) into companies.html (companies only) and a new wholesale-sections.html; (3) add icon_name to wholesale_sections, reusing the retail sections icon set/picker; (4) add a real logo upload control to the companies admin form, wired to logo_url, mirroring the product-image upload pattern; (5) restructure the admin sidebar into two collapsible groups — 'إدارة متجر المستهلك' and 'إدارة متجر الجملة' — alongside always-visible top-level links for the dashboard and products page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Wholesale storefront shows merchant-curated wholesale sections (Priority: P1)

A shopper browsing the wholesale storefront (wholesale-home.html, then wholesale-section-companies.html) sees the sections the merchant specifically curated for wholesale buyers — not a leaked view of the unrelated retail house sections. Today both pages call `fetchActiveSections()` against the retail `sections` table, so a wholesale visitor sees categories meant for the retail house UI, which is incorrect and confusing (and currently pointless, since retail sections have nothing to do with wholesale products).

**Why this priority**: This is the core data-correctness bug the feature exists to fix. Every other item in this feature is either supporting infrastructure for it (the icon column, the admin page to manage it) or an unrelated cleanup riding along. Without this fix, wholesale sections created in the admin (per feature 004) are invisible to actual wholesale shoppers.

**Independent Test**: With at least one active `wholesale_sections` row (and zero rows initially, since production starts empty), load wholesale-home.html and confirm it lists wholesale sections, not retail ones; drill into one and confirm wholesale-section-companies.html filters companies/products by that wholesale section. Separately, load the retail house page and confirm its 12 zones and behavior are unchanged.

**Acceptance Scenarios**:

1. **Given** `wholesale_sections` has two active rows ("مواد غذائية", "منظفات") and the retail `sections` table has its usual unrelated retail categories, **When** a shopper opens wholesale-home.html, **Then** they see exactly "مواد غذائية" and "منظفات" (and any other active wholesale sections) — none of the retail section names appear.
2. **Given** `wholesale_sections` is empty (production's starting state), **When** a shopper opens wholesale-home.html, **Then** the page shows an empty/no-sections state rather than falling back to retail sections or erroring.
3. **Given** a shopper clicks into a wholesale section on wholesale-home.html, **When** wholesale-section-companies.html loads, **Then** it resolves and filters by that wholesale section's id from `wholesale_sections`, independent of any retail section with a similar name.
4. **Given** the retail house page (the interactive consumer storefront) is loaded before and after this feature ships, **When** comparing its 12 clickable zones and their behavior, **Then** they are pixel- and behavior-identical — it continues reading the retail `sections` table exactly as before.
5. **Given** a shopper is on wholesale-section-companies.html for a given wholesale section, **When** they tap the "كل منتجات القسم" banner or one of the company cards, **Then** category.html loads and shows products filtered by that `wholesale_sections` id (and by the selected company, if a company card was tapped) — never by any retail section slug. *(Discovered during planning — see Assumptions.)*

---

### User Story 2 - Admin manages wholesale sections on their own dedicated page (Priority: P2)

A merchant admin who wants to add, rename, reorder, or remove a wholesale section goes to a page dedicated to that job, separate from the companies list — mirroring how retail sections already have their own dedicated admin page distinct from products.

**Why this priority**: Directly enables User Story 1 to have any content (an admin must be able to populate `wholesale_sections`) and cleans up the admin UX debt from feature 004, where two unrelated CRUD tables were stacked on one page for expediency. Ranked below US1 because the *storefront* read-bug is the more urgent defect; this is the write-side companion.

**Independent Test**: Navigate to the new wholesale-sections.html directly; create, rename, reorder, and soft-delete a wholesale section entirely from that page, with no dependency on companies.html being open. Separately confirm companies.html no longer shows any wholesale-section UI.

**Acceptance Scenarios**:

1. **Given** an admin is on wholesale-sections.html, **When** they create a new wholesale section with a name and an icon chosen from the shared icon set, **Then** it is saved and immediately appears in the page's list, and (per US1) becomes visible on wholesale-home.html once active.
2. **Given** an admin is on wholesale-sections.html, **When** they rename, reorder, deactivate, or soft-delete an existing wholesale section, **Then** the change is saved and reflected in the list without requiring a page reload.
3. **Given** an admin opens companies.html, **When** the page renders, **Then** it shows only the companies CRUD (form + list) — no wholesale-sections form, list, or table is present anywhere on the page.
4. **Given** an admin opens wholesale-sections.html, **When** the page renders, **Then** it shows only the wholesale-sections CRUD — no companies form, list, or table is present.

---

### User Story 3 - Wholesale sections carry an icon, drawn from the same set retail sections use (Priority: P3)

When creating or editing a wholesale section, the admin picks an icon from the same fixed icon library already used for retail sections (the same files, the same picker widget), so wholesale sections look and feel consistent with the rest of the admin rather than introducing a second, disconnected icon system.

**Why this priority**: A real but secondary need — wholesale sections are usable without icons (US2 alone already delivers create/rename/reorder/delete), but the storefront section list reads better with an icon per section, matching the retail house's visual language. Depends on US2's page existing.

**Independent Test**: On wholesale-sections.html, open the icon picker for a section, confirm it lists the same fixed icon set (same file names) used on the retail sections admin page, select one, save, and confirm the chosen icon persists and displays both in the admin list and (once wired by US1) on the wholesale storefront.

**Acceptance Scenarios**:

1. **Given** an admin opens the icon picker while creating/editing a wholesale section, **When** the picker renders, **Then** it offers the exact same list of icons (same files) as the retail sections admin page's picker.
2. **Given** an admin selects an icon and saves a wholesale section, **When** they reopen it for editing, **Then** the previously selected icon is shown as selected.
3. **Given** a wholesale section has no icon chosen (e.g. one created before this feature, or left blank), **When** it is displayed in the admin list or on the storefront, **Then** it falls back to a sensible default rather than showing a broken image.

---

### User Story 4 - Admin sidebar organized into consumer-store and wholesale-store groups (Priority: P4)

An admin opens any admin page and sees a sidebar organized into two clearly-labeled, collapsible groups — one for everything related to the consumer (retail) storefront, one for everything related to the wholesale storefront — instead of today's flat list of links, making it obvious which tools belong to which side of the business as the admin surface grows.

**Why this priority**: Pure navigation/organization — valuable for usability as the number of admin pages grows (this feature alone adds a new one), but nothing else in the feature functionally depends on it, and existing flat links remain clickable in the meantime. Ordered last because it is naturally the final integration step: it links to pages introduced by US2 (wholesale-sections.html) and reorganizes links to pages already reachable today.

**Independent Test**: Open any admin page, confirm the sidebar shows "الرئيسية" and "إدارة المنتجات" as always-visible top-level links, and two collapsible groups ("إدارة متجر المستهلك", "إدارة متجر الجملة"); expand each group and confirm its links navigate to the correct pages; confirm this structure is identical across dashboard.html, products.html, sections.html, companies.html, wholesale-sections.html, invoices.html, and customers.html.

**Acceptance Scenarios**:

1. **Given** an admin is on any admin page, **When** the sidebar renders, **Then** "الرئيسية" (→ dashboard.html) and "إدارة المنتجات" (→ products.html) are always visible, not nested inside a group.
2. **Given** an admin clicks "إدارة متجر المستهلك", **When** the group expands, **Then** it reveals exactly one link, "إدارة أقسام متجر المستهلك", pointing to the existing retail sections admin page (sections.html), unchanged in function from feature 004.
3. **Given** an admin clicks "إدارة متجر الجملة", **When** the group expands, **Then** it reveals four links in this set: "إدارة أقسام متجر الجملة" (→ wholesale-sections.html), "إدارة شركات متجر الجملة" (→ companies.html), "إنشاء وطباعة فاتورة" (→ invoices.html), "إدارة العملاء" (→ customers.html).
4. **Given** an admin is on a given admin page (e.g. products.html), **When** the sidebar renders, **Then** the link corresponding to the current page is visually marked as active, and if that link lives inside a collapsible group, that group is expanded by default so the active link is visible without an extra click.
5. **Given** the sidebar restructure ships, **When** an admin visits any of the seven admin pages, **Then** every one of them presents the identical two-group sidebar structure — none are left with the old flat list.

---

### Edge Cases

- What happens when a wholesale section is soft-deleted while a shopper has wholesale-section-companies.html open for it? (Follow the existing soft-delete convention from feature 004: the page should treat it as "not found"/empty rather than erroring, matching how retail sections already handle this case.)
- What happens if two wholesale sections are created with the same name? (No uniqueness constraint is implied by this feature; mirrors retail sections, which also permit duplicate names.)
- What happens to a company's existing `logo_url` value (already populated via the upload control that turns out to already exist in the admin form) when the admin edits that company without touching the logo field? (Must be preserved unchanged — this is existing, tested behavior being carried forward, not new behavior.)
- What happens on wholesale-sections.html when the list is empty (first run, nothing created yet)? (Show a clear empty state with a way to create the first section, not a blank page.)
- What happens to companies.html's URL/bookmarks and any other admin page's now-stale link to the combined companies+wholesale-sections page from feature 004? (companies.html keeps its filename and continues to exist; only its content changes to companies-only. No redirect is needed since the URL is unchanged.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The wholesale storefront's section-listing page (wholesale-home.html) MUST read active sections from the `wholesale_sections` table, not the retail `sections` table.
- **FR-002**: The wholesale storefront's per-section companies/products page (wholesale-section-companies.html) MUST resolve and filter by a `wholesale_sections` row, not a retail `sections` row.
- **FR-003**: The retail consumer storefront (the interactive house, its fixed set of clickable zones, and any code reading the retail `sections` table for that purpose) MUST remain functionally and visually unchanged by this feature.
- **FR-004**: The system MUST NOT perform any automatic data migration or copy from the retail `sections` table into `wholesale_sections`; an empty `wholesale_sections` table is an expected, valid starting state that the wholesale storefront must handle gracefully (empty-state UI, not an error).
- **FR-005**: The admin MUST have a dedicated page for managing companies only (companies.html), containing no wholesale-section management UI.
- **FR-006**: The admin MUST have a dedicated page for managing wholesale sections only (wholesale-sections.html), containing no company management UI.
- **FR-007**: The wholesale-sections.html page MUST support the same set of operations the companies+wholesale-sections combined page already supports for wholesale sections as of feature 004: create, rename, reorder, activate/deactivate, and soft-delete — with no loss of capability from the move.
- **FR-008**: The `wholesale_sections` table MUST gain an `icon_name` column, and the wholesale-sections.html admin form MUST let the admin choose an icon for each section from the same fixed icon set/picker UI already used by the retail sections admin page — not a separate icon set and not a free-form upload.
- **FR-009**: A wholesale section with no `icon_name` set MUST render with a defined fallback/placeholder icon everywhere it is displayed (admin list and storefront), never a broken image.
- **FR-010**: The companies admin form MUST let the admin upload a real image file for a company's logo, and that upload MUST be saved into the company's `logo_url` field, following the same client-side image-compression step already used for product image uploads before any file reaches storage.
- **FR-011**: Editing a company without changing its logo MUST preserve the company's existing `logo_url` value unchanged.
- **FR-012**: Every admin page's sidebar navigation MUST present "الرئيسية" and "إدارة المنتجات" as always-visible, non-collapsible top-level links.
- **FR-013**: Every admin page's sidebar navigation MUST present an "إدارة متجر المستهلك" collapsible group containing exactly one link, "إدارة أقسام متجر المستهلك", pointing to the existing retail-sections admin page.
- **FR-014**: Every admin page's sidebar navigation MUST present an "إدارة متجر الجملة" collapsible group, listed after "إدارة متجر المستهلك", containing exactly these links in order: "إدارة أقسام متجر الجملة" (wholesale-sections.html), "إدارة شركات متجر الجملة" (companies.html), "إنشاء وطباعة فاتورة" (invoices.html), "إدارة العملاء" (customers.html).
- **FR-015**: The sidebar structure defined by FR-012 through FR-014 MUST be identical across all seven admin pages (dashboard.html, products.html, sections.html, companies.html, wholesale-sections.html, invoices.html, customers.html).
- **FR-016**: When an admin is on a page whose sidebar link lives inside a collapsible group, that group MUST be expanded by default on load so the current-page link is visible without requiring the admin to click to expand it.
- **FR-017**: The retail sections admin page (sections.html) and its existing edit-only behavior (rename/reorder/enable-disable/soft-delete, no create) from feature 004 MUST remain functionally unchanged by this feature — only its position in the sidebar changes.
- **FR-018**: `wholesale_sections`' existing RLS policies, soft-delete convention, and sanitize-trigger protection (established in feature 004) MUST continue to apply unchanged to the new `icon_name` column — no relaxation of write access or validation.
- **FR-019**: category.html MUST support a `?wholesale_section=<id>` query parameter that filters the products shown by `wholesale_section_id`, optionally combined with `&company=<id>` to further narrow to one company within that wholesale section, reusing the existing product grid and cart — without exposing the retail-only sidebar section navigation or the slug-based section-facet dropdown in this mode. *(Discovered during planning, not part of the original request — see Assumptions.)*

### Key Entities

- **Wholesale Section** (`wholesale_sections`, existing from feature 004, extended here): gains `icon_name` — a string referencing one file in the shared icon library also used by retail sections; nullable, with a defined fallback when absent. All other columns (id, name, display_order, is_active, deleted_at, timestamps) and its RLS/soft-delete/sanitize-trigger behavior are unchanged.
- **Company** (`companies`, existing from feature 003/004): no schema change; `logo_url` gains a real UI-driven write path via file upload, where previously the column existed but had no admin control to populate it through the UI (contingent on the Assumptions note below).
- **Admin Navigation Structure**: not a database entity — a UI-level grouping of existing admin page links into two named, collapsible sections plus two always-visible top-level links, applied consistently across all admin pages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of wholesale storefront page loads (wholesale-home.html and wholesale-section-companies.html) reflect the contents of `wholesale_sections`, with zero references to retail-section data appearing anywhere in that flow.
- **SC-002**: The retail house/consumer storefront's 12-zone interactive behavior shows zero regressions — verified by direct before/after comparison — after this feature ships.
- **SC-003**: An admin can go from "no wholesale sections exist" to "a wholesale section with a name and icon is live on the wholesale storefront" using only wholesale-sections.html, in under 2 minutes, with no other page or manual database step required.
- **SC-004**: 100% of the seven admin pages present the identical sidebar structure (two always-visible top-level links, two collapsible groups with the specified links in the specified order).
- **SC-005**: An admin can upload a company logo image and see it reflected in that company's storefront-facing logo display without any manual URL entry or file-hosting step outside the admin UI.
- **SC-006**: Zero data loss or duplication: splitting companies.html into two pages does not drop, duplicate, or corrupt any existing company or wholesale-section row.

## Assumptions

- **Logo upload may already exist.** Investigation during spec-writing found that companies.html's admin form (built in feature 004) already contains a working file-upload input wired to `logo_url` via the same `compressImage()` pattern used for product images (`src/js/admin/companies-crud.js`, `uploadLogo()`). FR-010/FR-011 and SC-005 are written as the desired end state regardless; the planning phase MUST re-verify this against the current codebase and, if confirmed already correct, treat this item as verification-only (matching how feature 004 handled a similarly stale gap in its own scoping) rather than re-implementing working code.
- **`icon_name` is genuinely new.** Unlike the logo upload, no `icon_name` (or equivalent) column exists on `wholesale_sections` today — this is a real gap, not a stale one.
- Retail sections' icon set is a small, fixed, developer-maintained list of SVG files under `public/assets/icons/` (not a database table) — wholesale sections reuse this same static list, not a database-driven icon catalog.
- "Collapsible/expandable" sidebar groups are a client-side UI state (no persistence of expand/collapse choice across page loads is required beyond FR-016's active-page auto-expand rule).
- No new admin role or permission tier is introduced; access to all pages in this feature continues to be gated by the existing admin-only check (`requireAdmin()` / `is_admin()`) established in prior features.
- Companies.html and wholesale-sections.html are both reachable only from the admin sidebar (and direct URL, for an authenticated admin) — no public-facing link to either exists, consistent with all other admin pages.
- The retail sections admin page keeps its current filename and URL (sections.html); only its label/position within the new sidebar grouping changes.
- **FR-019 was discovered during planning, not part of the original request.** Tracing FR-001/FR-002 to completion revealed that wholesale-section-companies.html's "all products in this section" banner and its per-company cards both link into category.html using the *retail* section's slug — a leftover from before `wholesale_sections` existed, when there was nothing else to key by. Once the page is keyed by a `wholesale_sections` id instead of a retail slug, those two links have no valid target unless category.html itself learns to filter by `wholesale_section_id`. This is now in-scope as a necessary consequence of US1, not an independent feature request. The chosen resolution is a narrow, contained `?wholesale_section=<id>` branch — reusing the existing product grid, cart, and company facet, but explicitly NOT extending the retail-only sidebar-nav or slug-based section-facet dropdown to wholesale sections — rather than giving category.html full filter-panel parity with retail (see research.md for the full option comparison and rationale).
