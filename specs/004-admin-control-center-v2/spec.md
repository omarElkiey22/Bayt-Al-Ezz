# Feature Specification: Admin Control Center v2 — Retail/Wholesale Section Independence

**Feature Branch**: `004-admin-control-center-v2`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Admin control center v2 — retail/wholesale section independence, product dual-placement, and wholesale-aware invoicing. Fix the T014 company-select gap in the product admin form; add the companies nav link to every admin page; let the admin manage retail storefront sections (rename/reorder/enable-disable/soft-delete only, no new sections); introduce a fully independent wholesale sections entity with its own table and free create/rename/reorder/delete; split retail-section management and wholesale-sections-plus-companies management into two dedicated admin pages; let each product carry two independent placements (retail section + retail price, wholesale section + company + wholesale price); and support a hybrid invoice item-entry flow that mixes searching real wholesale products with free-text manual entry. The house hero's SVG rendering and fixed retail zones must not change, and new tables must reuse the companies feature's soft-delete + RLS + sanitize-trigger pattern."

## Clarifications

### Session 2026-09-08

- Q: The request asks to "fix" the T014 company-select gap in the product admin form (tasks.md marks it complete but claims it was never implemented). Verification of the current codebase found the company `<select>` already present and wired into `company_id` on create/update in `products-crud.js`. → A: Treat T014 as already resolved. This spec keeps the nav-link consistency fix (item 2) as an in-scope user story, but reframes the product-form item as "verify and finish wiring the company selector end-to-end as part of the dual-placement work" rather than building it from scratch, since the placement work in User Story 2 touches the same form anyway.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Independent Wholesale Sections (Priority: P1)

As the merchant, I want to freely create, rename, reorder, and delete wholesale sections without any constraint from the retail storefront's fixed section list, so that I can organize my wholesale catalog by whatever categories make sense for my suppliers and buyers, independent of the consumer-facing house layout.

**Why this priority**: Every other piece of this feature (product wholesale placement, invoice product search grouped by section) depends on wholesale sections existing as their own taxonomy. Without this, there is no wholesale organizing structure at all.

**Independent Test**: On the wholesale/companies admin page, create a new wholesale section, rename it, change its display order relative to others, and soft-delete one. Verify none of these actions read, write, or otherwise affect the retail `sections` table, the house hero SVGs, or the retail sections admin page.

**Acceptance Scenarios**:

1. **Given** the wholesale sections management area, **When** the admin creates a new wholesale section with a name, **Then** it appears in the wholesale sections list immediately, with no corresponding row created in the retail sections table.
2. **Given** an existing wholesale section, **When** the admin renames it or changes its display order, **Then** the change is saved and reflected wherever wholesale sections are listed (this admin area and any wholesale-mode storefront views), without altering any retail section.
3. **Given** a wholesale section with products currently placed in it, **When** the admin deletes that wholesale section, **Then** the section is soft-deleted (hidden from selection everywhere) and existing products that referenced it no longer display that section as their wholesale placement, without those products or their retail placement being affected in any way.
4. **Given** the retail sections table has 12 fixed entries tied to the house hero, **When** any wholesale section action is performed, **Then** the count and content of the retail sections table remain unchanged.

---

### User Story 2 - Independent Retail and Wholesale Product Placement (Priority: P1)

As the merchant, I want each product's retail placement (section + retail price) and wholesale placement (wholesale section + company + wholesale price) to be set and changed completely independently, so that the same product can live in different categories for consumer shoppers versus wholesale buyers, or be wholesale-only, retail-only, or both.

**Why this priority**: This is the core data-modeling change the rest of the admin (and the invoice picker in User Story 4) depends on. It also finally closes the previously-incomplete company-linking work on the product form.

**Independent Test**: On the products admin page, edit a product to set a retail section different from its wholesale section, assign it to a company, and give it a wholesale price. Save, reload the page, and verify both placements persisted independently. Then clear the wholesale section/company/price only, and verify the retail placement is untouched.

**Acceptance Scenarios**:

1. **Given** the product create/edit form, **When** the admin fills in a retail section and retail price, **Then** the product is saved with that retail placement regardless of whether any wholesale fields are filled in.
2. **Given** the same form, **When** the admin separately selects a wholesale section, a company, and a wholesale price, **Then** all three are saved as the product's wholesale placement, independent of and possibly different from its retail section.
3. **Given** a product with both placements set, **When** the admin changes only the retail section, **Then** the wholesale section, company, and wholesale price remain unchanged, and vice versa.
4. **Given** a product with no wholesale price, wholesale section, or company set, **When** it is viewed anywhere in the admin, **Then** it is clearly presented as retail-only with no wholesale placement, without errors.
5. **Given** the product list view in the admin, **When** the admin looks at any product row, **Then** both its retail placement (section, retail price) and wholesale placement (section, company, wholesale price, or "no wholesale placement") are visible at a glance.

---

### User Story 3 - Retail Storefront Section Metadata Management (Priority: P2)

As the merchant, I want to rename, reorder, enable/disable, and soft-delete the existing retail storefront sections through the admin UI, so that I can keep section names and ordering current without ever risking the house hero's fixed visual layout.

**Why this priority**: Useful ongoing catalog maintenance, but lower urgency than establishing the wholesale taxonomy and product placement model, since the retail sections already exist and function today.

**Independent Test**: On the dedicated retail sections admin page, rename a section, change its order, disable it, and soft-delete another. Confirm the house hero's illustration, its Frame 1/Frame 2 assets, and its fixed set of clickable zones render exactly as before, and that no control on this page allows adding a section beyond the existing fixed set.

**Acceptance Scenarios**:

1. **Given** the retail sections admin page, **When** the admin renames a section, **Then** the new name is saved and appears on the storefront's house hero overlay text for that zone.
2. **Given** the retail sections admin page, **When** the admin changes the display order of two sections, **Then** their storefront presentation order updates accordingly, with no change to the underlying house hero SVG or zone shapes.
3. **Given** an active retail section, **When** the admin disables it, **Then** it is hidden from the storefront (its house hero zone no longer links to it, or is visibly inactive) without deleting its data.
4. **Given** a retail section, **When** the admin soft-deletes it, **Then** it is excluded from active storefront and admin listings while its historical data is retained, consistent with how products are soft-deleted elsewhere in the system.
5. **Given** the retail sections admin page, **When** the admin looks for a way to add a brand-new section, **Then** no such control exists on this page — only editing of the existing fixed set is possible.

---

### User Story 4 - Hybrid Invoice Item Entry (Priority: P2)

As the merchant creating an invoice, I want to search for and select real wholesale products as line items (with their name and price pre-filled but still editable), while also being able to type in free-text line items for goods not yet in the system, mixing both freely on the same invoice, so that invoicing stays fast for catalog items without blocking me from selling things I haven't added to the system yet.

**Why this priority**: Meaningfully speeds up day-to-day invoice creation once wholesale products and pricing exist (User Story 2), but the manual entry path already works today, so this is an enhancement rather than a blocker.

**Independent Test**: Start a new invoice. Search for and add a product that has a wholesale price, confirm its name/price pre-fill and can be edited afterward, then add a second line item by typing a name/price/quantity manually. Confirm both line items save correctly on the same invoice.

**Acceptance Scenarios**:

1. **Given** the invoice creation screen, **When** the admin searches the product picker, **Then** only products with a valid wholesale price appear as selectable results.
2. **Given** a search result, **When** the admin selects it, **Then** a new line item is added with its name and wholesale price pre-filled, and a quantity field ready for input.
3. **Given** a pre-filled line item from the picker, **When** the admin edits its price, **Then** the edited price is used for that invoice's calculations instead of the catalog price, without altering the product's stored wholesale price.
4. **Given** an invoice already containing a picker-added line item, **When** the admin also adds a manually-typed line item (name, price, quantity with no catalog link), **Then** both line items coexist on the same invoice and are included in its totals.
5. **Given** the product search returns no matches, **When** the admin has typed a search term, **Then** a clear empty state is shown and the manual entry fields remain available as a fallback.

---

### User Story 5 - Consistent Admin Navigation (Priority: P3)

As the merchant navigating the admin panel, I want the "إدارة الشركات" (Manage Companies) link to appear in the sidebar on every admin page, not just the dashboard, so that I can reach company and wholesale-section management from anywhere without returning to the dashboard first.

**Why this priority**: A usability/consistency fix with no dependency on the other stories and no business-logic risk; lowest priority because it doesn't unblock any other functionality.

**Independent Test**: Visit each of the sections, products, invoices, and customers admin pages and confirm the sidebar shows a working "إدارة الشركات" link on each, navigating to the same destination as the one already on the dashboard.

**Acceptance Scenarios**:

1. **Given** any admin page (sections, products, invoices, customers, dashboard), **When** the sidebar renders, **Then** it includes an "إدارة الشركات" link in the same position/style as the other nav items.
2. **Given** the admin clicks that link from any of those pages, **Then** they land on the same companies/wholesale-sections management destination reached from the dashboard.

---

### Edge Cases

- What happens when the admin tries to soft-delete a wholesale section that is still assigned to one or more products? The section is soft-deleted and hidden from all selection UI; affected products keep their other data but show "no wholesale section" until reassigned (mirrors existing soft-delete behavior for other entities).
- What happens when a product has a wholesale price but has never been assigned a wholesale section or company? It still appears in the User Story 4 invoice search (which only checks for a valid wholesale price), and its wholesale placement displays as "no section / no company" wherever shown.
- What happens if the admin disables or soft-deletes a retail section that still has products assigned to it? The section is hidden from the storefront while products retain their reference to it; this mirrors existing behavior for section deactivation elsewhere in the system.
- What happens if two wholesale sections or two retail sections are given the same display order value? The system accepts it and falls back to a secondary stable ordering (e.g., creation order) so the list never renders ambiguously.
- What happens when the admin tries to add more than the fixed set of retail sections? The retail sections admin page provides no create control, so this is prevented by the interface itself, not by an error message.
- What happens when an invoice line item's linked product is later soft-deleted or has its wholesale price removed? Already-created invoice line items are unaffected snapshots; only future searches stop surfacing that product.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a wholesale sections entity that is stored, created, renamed, reordered, and deleted entirely independently of the retail sections entity — no shared rows, foreign keys, or required parity between the two.
- **FR-002**: Admins MUST be able to create new wholesale sections at will, with no fixed upper limit tied to the retail storefront's layout.
- **FR-003**: Admins MUST be able to rename, reorder, and soft-delete any wholesale section.
- **FR-004**: Admins MUST NOT be able to create new retail sections through the admin UI in this feature — retail section management is limited to renaming, reordering, enabling/disabling, and soft-deleting the existing fixed set.
- **FR-005**: Admins MUST be able to rename, reorder, enable/disable, and soft-delete existing retail sections without altering the house hero's illustration, its Frame 1/Frame 2 rendering, or the fixed set of clickable zones.
- **FR-006**: System MUST provide two separate, dedicated admin destinations: one scoped to retail section management only, and one scoped to wholesale section management together with company management.
- **FR-007**: The product create/edit form MUST let the admin independently set a retail placement (retail section, retail price) and a wholesale placement (wholesale section, company, wholesale price), where the wholesale section is drawn from the independent wholesale sections entity, not the retail one.
- **FR-008**: System MUST allow a product to have a wholesale placement that differs from its retail placement, no wholesale placement at all, or (in principle) no retail placement, without validation errors tying the two together.
- **FR-009**: Changing a product's retail placement MUST NOT alter its wholesale placement, and changing its wholesale placement (section, company, or wholesale price) MUST NOT alter its retail placement.
- **FR-010**: The products admin list view MUST display, per product, both its retail placement and its wholesale placement (or a clear "no wholesale placement" indicator) without requiring the admin to open the edit form.
- **FR-011**: The invoice creation screen MUST offer a product search that returns only products with a valid (non-empty) wholesale price.
- **FR-012**: Selecting a searched product MUST add it as a line item with its name and wholesale price pre-filled, and MUST allow the admin to subsequently edit that line item's price without changing the underlying product's stored wholesale price.
- **FR-013**: The invoice creation screen MUST continue to support fully manual line item entry (name, price, quantity typed by hand, with no catalog product reference).
- **FR-014**: An invoice MUST support any mix of picker-selected and manually-entered line items simultaneously, with both counted correctly in the invoice's totals.
- **FR-015**: The "إدارة الشركات" navigation link MUST appear in the sidebar of every admin page (dashboard, sections, products, invoices, customers), pointing to the same destination.
- **FR-016**: The wholesale sections entity MUST follow the same data-protection pattern already established for companies — public visitors can only see active, non-deleted sections; deletions never destroy history; only the authenticated merchant can create, edit, or delete; and all admin-entered text is checked for malicious content before saving. No separate or weaker protection approach may be introduced for wholesale sections.
- **FR-017**: The product admin form's company selector MUST be verified end-to-end (selection persists on create, on edit it pre-selects the product's current company, and clearing it back to "no company" is supported) as part of implementing the wholesale placement work in this feature.

### Key Entities

- **Wholesale Section**: An independent, merchant-defined category used only for organizing wholesale-mode browsing and product placement. Attributes: name, display order, active/inactive status, soft-delete marker. Has no structural relationship to the retail `sections` entity.
- **Retail Section** *(existing entity, metadata-editable in this feature)*: The fixed set of storefront categories tied to the house hero's clickable zones. This feature adds editable name, display order, active status, and soft-delete to the existing set — it does not add the ability to create additional ones.
- **Product Wholesale Placement**: The combination, per product, of a wholesale section reference, a company reference, and a wholesale price — stored and edited independently of that same product's retail section and retail price.
- **Invoice Line Item**: An entry on an invoice with a name, price, and quantity, optionally originating from a searched wholesale product (name/price pre-filled from the catalog at selection time) or entered entirely by hand; once saved, a line item's price is fixed to what was on the invoice at creation time regardless of later catalog changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The merchant can build out an entire wholesale section taxonomy (create, rename, reorder, remove) without a developer ever needing to touch the retail sections table or the house hero assets.
- **SC-002**: 100% of admin pages (dashboard, sections, products, invoices, customers) display a working companies navigation link, verified by visiting each page.
- **SC-003**: For any given product, the admin can determine its complete retail and wholesale placement (or lack of one) by looking at a single screen, without cross-referencing other pages.
- **SC-004**: Adding an existing wholesale product to an invoice requires only choosing it from search results — the admin types no name or price by hand for that line item — while manual entry remains just as available for uncatalogued items on the same invoice.
- **SC-005**: After this feature ships, the consumer-facing house hero (Frame 1/Frame 2 animation and its 12 clickable zones) is visually and functionally identical to before, confirmed by side-by-side review.
- **SC-006**: Retail section edits (rename, reorder, enable/disable, soft-delete) take effect on the storefront without requiring a code deployment.

## Assumptions

- The existing `companies` admin page (built in the prior wholesale-companies feature) is extended to also host wholesale section management, satisfying "two separate, dedicated admin pages" (item 5) without introducing a third page or duplicating the companies UI elsewhere.
- The existing retail sections admin page continues to serve as the dedicated retail-section-management destination referenced in item 5; its scope is narrowed in this feature to remove section creation, per FR-004.
- Reordering (both retail and wholesale sections) uses a numeric display-order value editable per row, consistent with the existing `display_order` pattern already used by the retail `sections` table — no drag-and-drop interaction is required.
- Wholesale section deletion is soft-delete, consistent with the project's soft-delete-by-default rule for all catalog entities.
- Verification of the current codebase during specification found the product form's company `<select>` already implemented and wired to `company_id` (contrary to the originally reported gap); FR-017 keeps a lightweight verification/completion step in scope rather than treating it as unimplemented from scratch, since User Story 2's placement work touches the same form regardless.
- Invoice line items store a snapshot of name/price at the time they're added to the invoice; later edits to a product's catalog wholesale price do not retroactively change previously-created invoices.
- No new user roles or permission tiers are introduced; all functionality described here remains behind the existing single-admin authentication gate.
