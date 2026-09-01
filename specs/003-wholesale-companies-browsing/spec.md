# Feature Specification: Wholesale Companies Catalog and Filtering

**Feature Branch**: `003-wholesale-companies-browsing`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "In wholesale mode only (not the regular consumer mode), the merchant browses sections (same existing store sections), and when they tap a section, they see a grid of companies that have active products in that section, each company shown with its logo. When they tap a company, they see that company's products filtered to the section they entered from. Also, on the wholesale homepage, there is a separate area for browsing companies directly (without going through a section) – tapping a company here shows all of its products across every section. On any product listing page (whether reached via section+company or via a company directly), there is a filter panel covering: price range, company name, and section. Constraints: - Rating is out of scope for this phase – there is no ratings system in the project currently. - This change is scoped to wholesale mode only; the regular consumer interface (the current interactive house) stays completely unchanged. - Companies are a standalone entity (a new table), and each product links to one company via a new company_id column on the products table."

## Clarifications

### Session 2026-09-01

- Q: How are products without an assigned company handled in wholesale section browsing? → A: Products can exist without an assigned company and are never hidden; alongside the company grid, each section features an "All products in this section" entry (labeled with the section's name) showing every active product in that section (including unassigned ones), and the filter panel includes an explicit "unassigned" company option when browsing this list.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Section-to-Company Wholesale Browsing (Priority: P1)

As a wholesale buyer/merchant in wholesale mode, I want to select a store section and see only the partner companies offering products in that section, so that I can quickly discover relevant manufacturers and view their section-specific catalog.

**Why this priority**: This is the core navigation flow requested for wholesale mode, enabling suppliers/merchants to browse structured inventory company by company within a specific category.

**Independent Test**: In wholesale mode, tap any store section. Verify that a grid of companies having active products in that section is displayed with their logos, alongside a prominent "All products in this section" entry. Tapping a company opens a product listing containing only that company's products within the selected section, while tapping the section entry opens all products in that section.

**Acceptance Scenarios**:

1. **Given** a user in wholesale mode on the storefront, **When** they tap a store section (e.g., "الغسالة"), **Then** they are presented with a company selection view displaying all companies that have active wholesale products in that section (with logo and name) alongside a dedicated "All products in this section" entry labeled with the section's name.
2. **Given** a company grid for a section, **When** the user taps a specific company card, **Then** the product listing page loads showing only active products associated with both that selected company and the chosen section.
3. **Given** a section has no companies with active wholesale products, **When** the merchant opens that section, **Then** a clear empty state message is displayed indicating no wholesale suppliers currently exist for that section with a clean way to return to all sections.
4. **Given** a user on a section's wholesale company grid, **When** they tap the section's own "All products in this section" entry, **Then** the product listing page loads displaying every active wholesale product in that section regardless of company assignment, including unassigned products.

---

### User Story 2 - Direct Company Browsing on Wholesale Homepage (Priority: P2)

As a wholesale buyer/merchant on the wholesale homepage, I want a dedicated area to browse all partner companies directly without selecting a section first, so that I can view a specific supplier's entire wholesale catalog across all categories.

**Why this priority**: Merchants often have preferred manufacturing partners or brand relationships and want a direct brand-first shopping path rather than navigating through individual room sections.

**Independent Test**: From the wholesale homepage, navigate to the dedicated companies section and select a company. Verify that the product listing displays all wholesale products from that company across every section.

**Acceptance Scenarios**:

1. **Given** a user in wholesale mode on the homepage, **When** they view the homepage, **Then** they see a dedicated "Browse Companies" / "شركاء النجاح والشركات" showcase displaying company logos/cards.
2. **Given** the direct company showcase, **When** the merchant clicks or taps a company, **Then** they are taken to a product listing page containing all active wholesale products belonging to that company across all store sections.
3. **Given** a regular retail user (not in wholesale mode), **When** they visit the homepage, **Then** the direct company browsing section is not displayed or does not alter the retail consumer interactive house experience.

---

### User Story 3 - Multi-Criteria Product Filter Panel (Priority: P3)

As a wholesale buyer viewing a product listing, I want to refine displayed products using a filter panel (by price range, company, and section), so that I can quickly pinpoint items meeting my exact wholesale procurement requirements.

**Why this priority**: Provides essential discovery and refinement tools on all wholesale product listing pages, allowing merchants to adjust facets dynamically regardless of how they reached the listing.

**Independent Test**: Open any wholesale product listing page (reached via section+company or directly via company). Interact with the filter panel by changing price range boundaries, toggling company selections, or changing sections. Verify that product results update immediately to reflect the active filters.

**Acceptance Scenarios**:

1. **Given** any wholesale product listing page, **When** the page renders, **Then** a visible and accessible filter panel is available containing controls for price range (min/max), company selection, and section selection.
2. **Given** a product listing entered via Section A and Company X, **When** the filter panel is opened, **Then** Section A and Company X are pre-selected in their respective filter facets.
3. **Given** active filter selections, **When** the merchant modifies the price range, checks/unchecks companies, or selects a different section, **Then** the product grid updates to show matching products with an option to reset/clear filters back to defaults.
4. **Given** filter criteria that match zero products, **When** filters are applied, **Then** a friendly "No matching products" message is shown with a clear button to reset filters.

---

### Edge Cases

- **Company without logo**: If a company entity lacks an uploaded logo image, the company card displays a branded fallback monogram/icon with the company's name.
- **Product with unassigned company**: Products without an assigned company are never hidden; they appear in the section's "All products in this section" listing and can be specifically filtered using the explicit "unassigned" option in the company filter facet.
- **Direct URL tampering / invalid IDs**: If a user navigates to a section or company URL parameter with an invalid or soft-deleted ID, the page handles it gracefully with a descriptive notification and a button to return to the catalog.
- **Consumer mode isolation**: Regular consumer mode (`pricing=normal` or default retail) remains 100% untouched: no company intermediary grid after section click, and standard house hero navigation functions exactly as defined in Constitution Principle III.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a standalone `companies` entity with name, logo URL, description, and active status.
- **FR-002**: System MUST associate each product to at most one company via a nullable `company_id` relationship on the product record.
- **FR-003**: In wholesale mode, when a user selects a section, the system MUST display a grid of companies that have active wholesale products belonging to that section, alongside an "All products in this section" entry labeled with the section's name.
- **FR-004**: Each company in the section company grid MUST display the company logo, name, and visual affordance to open the company's section catalog.
- **FR-005**: Tapping a company from a section-specific grid MUST display only products from that company within the entered section, while tapping the section's own "All products" entry MUST display every active product in that section regardless of company assignment.
- **FR-006**: In wholesale mode, the homepage MUST feature a dedicated direct company browsing area displaying all active partner companies.
- **FR-007**: Tapping a company from the homepage direct browsing area MUST display a product listing of all active wholesale products for that company across all sections.
- **FR-008**: Every wholesale product listing page MUST provide an interactive filter panel supporting price range filtering, company filtering, and section filtering.
- **FR-009**: The filter panel MUST reflect the current navigation context as initial filter values (e.g., initial section and company selections).
- **FR-010**: The regular retail consumer experience (interactive auto-opening house hero and standard retail category browsing) MUST remain completely unchanged and operational.
- **FR-011**: Product ratings MUST NOT be included anywhere in this phase.
- **FR-012**: System MUST support soft deletion for companies so that removing a company does not corrupt historical associations or break direct bookmarks.
- **FR-013**: The filter panel's company facet MUST include an explicit "unassigned" / "بدون شركة" option when viewing a section's "All products" listing to allow merchants to isolate products without an assigned company.

### Key Entities *(include if feature involves data)*

- **Company**: Represents a manufacturer, brand, or wholesale vendor. Contains fields for `id`, `name` (Arabic), `slug`, `logo_url`, `description`, `is_active`, `created_at`, `updated_at`, and soft-delete flag (`is_deleted` or `deleted_at`).
- **Product (`products`)**: Existing catalog entity updated to include an optional foreign reference `company_id` linking to `Company` (nullable to support unassigned products).
- **Section (`sections`)**: Existing category entity representing house rooms/store sections, linked to products.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In wholesale mode, 100% of section clicks present only the companies that actually contain active wholesale inventory in that section, along with the section's "All products" entry.
- **SC-002**: Merchants can navigate from the wholesale homepage directly to a company's full catalog in 1 tap/click.
- **SC-003**: Applying or clearing any filter in the product filter panel updates the listing within 150 milliseconds without a full page reload.
- **SC-004**: 0% regression in standard consumer retail browsing (interactive house hero, section navigation, and cart behavior remain intact).
- **SC-005**: Wholesale buyers can complete product discovery using any combination of section, company, and price range filters with zero dead-end screens and 100% visibility of unassigned products.

## Assumptions

- Wholesale mode is detected and activated via the established application pricing state (`sessionStorage` / `pricing=wholesale` query parameter).
- Wholesale prices are defined on products (`wholesale_price`), and wholesale views filter for products with valid wholesale pricing.
- Admin management for creating, editing, and associating companies with products will leverage standard soft-delete and RLS access control patterns established in Constitution Principles VIII & IX.
- Retail consumer users browsing without wholesale mode continue to see direct product listings under each section as currently designed.
