# Feature Specification: House-Concept E-commerce Store

**Feature Branch**: `001-house-ecommerce-store`

**Created**: 2026-07-14

**Status**: Draft

**Input**: User description: "Build a mobile-first, Arabic RTL e-commerce storefront with a 'house' homepage metaphor (12 clickable room-sections via coded SVG), category listings, product detail with variant switcher, localStorage cart with WhatsApp checkout, and a merchant admin panel for sections and products management."

## Clarifications

### Session 2026-07-14

- Q: How should products be sorted/ordered on the category listing page? → A: Newest first (most recently added products appear at top)
- Q: What should the "house opening" transition look like when the visitor clicks the front door? → A: Smooth CSS fade/slide transition (~0.5s) with a subtle scale/open CSS transform on the door in parallel — pure CSS, no SVG keyframe sequence
- Q: What currency and price format should be used throughout the storefront? → A: Egyptian Pound — `150 ج.م` (no decimals, symbol after number)
- Q: What should the max file size and accepted image formats be for admin uploads? → A: 2MB max, JPEG/PNG/WebP; auto client-side canvas-based compression before upload for raw phone photos
- Q: How should the storefront handle WhatsApp deep link failure? → A: Always-visible formatted order text with copy-to-clipboard + tappable tel: link alongside the WhatsApp button (not conditional fallback)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse the House Homepage (Priority: P1)

As a casual mobile shopper, I land on the homepage and see an inviting isometric house graphic. I click the glowing front door, the house opens to reveal 12 themed room-sections. I tap a room that interests me and I'm taken to that category's products.

**Why this priority**: The house-browsing experience is the core differentiator of this store. Without it, the product is a generic grid — the entire brand identity hinges on this interaction.

**Independent Test**: Can be fully tested by loading the homepage on a mobile device, clicking the door, seeing all 12 sections with their correct Arabic names and icons, tapping a section, and landing on the correct category page.

**Acceptance Scenarios**:

1. **Given** a visitor loads the homepage on a mobile device, **When** the page finishes loading, **Then** an isometric SVG house renders immediately with a glowing entrance door as the most prominent interactive element.
2. **Given** the house is displayed, **When** the visitor clicks the entrance door, **Then** the door plays a CSS transform opening animation (scale(1.05) and rotateY(-110deg) with perspective) while all 12 section zones fade and slide into view over ~0.5s (pure CSS transition, no SVG keyframe sequence), each showing its Arabic name and icon pulled from live data (not hardcoded).
3. **Given** a section zone is visible, **When** the visitor taps it, **Then** a visual confirmation highlight (scale of 1.02 and Secondary Navy #1A237E shadow glow) confirms the selection before navigating to the correct category listing page.
4. **Given** a section zone is visible, **When** the visitor uses keyboard Tab to reach it, **Then** the zone receives focus with a visible indicator and has an `aria-label` matching the Arabic section name.
5. **Given** the merchant renames a section via the admin panel, **When** a visitor reloads the homepage, **Then** the updated name appears on the corresponding zone overlay.

---

### User Story 2 — Browse Products in a Category (Priority: P1)

As a visitor, after clicking a section (e.g. "جنتلمان"), I see all products in that section displayed as a responsive card grid where similar items are grouped under a single card.

**Why this priority**: Without category listing, the browsing journey dead-ends after the house — visitors cannot reach products.

**Independent Test**: Can be fully tested by navigating to a category page by slug, verifying the product grid renders with grouped items (one card per parent product), skeleton loading states, empty states, and error-retry states.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to a category page for a section slug, **When** products are loading, **Then** skeleton placeholder cards are displayed (not a blank white screen).
2. **Given** a section has products with variants, **When** the category page loads, **Then** only one card per parent product is shown, using the parent product's primary image and name, with "starting from X" pricing if variants differ in price.
3. **Given** a section has zero active products, **When** the category page loads, **Then** a friendly empty state message is displayed in Arabic ("لسه مفيش منتجات هنا") with a link back to the house.
4. **Given** a data fetch fails, **When** the category page attempts to load, **Then** a retry option is shown to the visitor, not a silent failure or blank screen.
5. **Given** a product has been soft-deleted or deactivated by the merchant, **When** the category page loads, **Then** that product never appears in the grid.

---

### User Story 3 — View Product Details and Switch Variants (Priority: P1)

As a visitor, I open a product and, if it comes in multiple similar versions (e.g. different color or pattern), I can switch between them on the same page and see the image and price update without a page reload.

**Why this priority**: The variant switcher directly impacts purchase decisions — a visitor must see exactly what they're adding to the cart.

**Independent Test**: Can be fully tested by opening a product with multiple variants, switching between variant swatches, verifying the main image and price update without reload, confirming out-of-stock variants are visually indicated, and verifying "add to cart" targets the selected variant.

**Acceptance Scenarios**:

1. **Given** a visitor opens a product with 3 variants, **When** the page loads, **Then** a swatch/thumbnail row displays all 3 variants, and the first in-stock variant is pre-selected.
2. **Given** a variant swatch is clicked, **When** the variant differs in price and image, **Then** the main image and displayed price update immediately without a full page reload.
3. **Given** a variant is out of stock, **When** the product page loads, **Then** that variant's swatch is visually greyed out but still visible and selectable (to show it exists).
4. **Given** a visitor clicks "add to cart," **When** a specific variant is selected, **Then** the cart stores that specific variant (label, price, image) — never just the parent product.

---

### User Story 4 — Build a Cart and Checkout via WhatsApp (Priority: P1)

As a visitor, I add products to my cart as I browse, review my cart with full details (variant, quantity, price), and send the complete order to the seller via WhatsApp — with no account creation and no online payment required.

**Why this priority**: Without the cart and WhatsApp handoff, there is no way to complete a purchase — this is the revenue-generating step.

**Independent Test**: Can be fully tested by adding items to the cart, adjusting quantities, removing items, verifying totals, clicking the WhatsApp button, and confirming the correct pre-filled message opens in WhatsApp.

**Acceptance Scenarios**:

1. **Given** a visitor adds a product variant to the cart, **When** they navigate away and return or refresh the page, **Then** the cart contents persist via localStorage without requiring any login.
2. **Given** a visitor opens the cart page with items, **When** the cart renders, **Then** each line shows product name, selected variant label, quantity, unit price, line subtotal, and a running total.
3. **Given** a visitor adjusts the quantity of a cart item, **When** the quantity changes, **Then** the line subtotal and running total update immediately.
4. **Given** a cart item references a product or variant that has been soft-deleted or deactivated by the merchant, **When** the visitor opens the cart, **Then** that line displays a clear Arabic notice ("المنتج ده مبقاش متاح") rather than silently breaking the total.
5. **Given** the visitor clicks "إرسال الطلب عبر واتساب", **When** the button is pressed, **Then** a `wa.me` deep link opens in a new tab/app with a URL-encoded, human-readable Arabic summary of the order (product names, variants, quantities, total), directed to the merchant's configurable WhatsApp number.
6. **Given** the visitor is on the cart page with items, **When** the checkout area renders, **Then** the formatted order summary text is always visible alongside the WhatsApp button, with a copy-to-clipboard button and the merchant's phone number as a tappable `tel:` link — providing a persistent secondary path to complete the order regardless of whether WhatsApp is installed.

---

### User Story 5 — Manage Sections via Admin Panel (Priority: P2)

As the merchant (non-technical user), I can log into the admin panel and add, rename, or soft-delete sections (the 12 "rooms") without needing a developer, and see changes reflected on the live storefront immediately.

**Why this priority**: The merchant needs to be self-sufficient in maintaining the store's category structure, but this is secondary to the shopper-facing experience.

**Independent Test**: Can be fully tested by logging into the admin panel, creating a new section, verifying it appears on the storefront homepage, renaming it, verifying the name updates, and soft-deleting it, verifying it disappears from the storefront without data loss.

**Acceptance Scenarios**:

1. **Given** the merchant is logged in, **When** they create a new section with an Arabic name and icon, **Then** the section appears on the live storefront homepage without a code deploy.
2. **Given** the merchant edits a section's slug, **When** the edit form is shown, **Then** a warning is displayed that changing the slug changes the section's URL and existing shared links would break.
3. **Given** the merchant tries to delete a section that still has assigned products, **When** they initiate deletion, **Then** they are warned and must either reassign the products or explicitly confirm before the soft-delete proceeds.
4. **Given** the merchant renames a section, **When** a visitor reloads the storefront, **Then** the updated name is reflected immediately on the homepage overlay text.

---

### User Story 6 — Manage Products via Admin Panel (Priority: P2)

As the merchant, I can add, edit, or soft-delete products and their variants, assign them to sections, and toggle their visibility — all without needing a developer.

**Why this priority**: Merchants need to manage their catalog independently, but this is secondary to the customer-facing browsing and checkout experience.

**Independent Test**: Can be fully tested by creating a product with multiple variants, verifying it appears correctly on the storefront (as one card, with variant switcher), toggling it inactive, verifying it disappears from the storefront, and adding a new variant to the existing product.

**Acceptance Scenarios**:

1. **Given** the merchant creates a product with 3 variants in the admin panel, **When** a visitor views the corresponding category page, **Then** exactly one card appears for that product (not 3 separate cards).
2. **Given** the merchant toggles a product to "inactive," **When** a visitor browses the storefront, **Then** the product is hidden from the storefront immediately without deleting its data.
3. **Given** the merchant opens an existing product for editing, **When** they add a new variant, **Then** the variant is added under the same product entry without creating a duplicate product.

---

### Edge Cases

- What happens when a visitor's localStorage cart references a product variant that the merchant has since soft-deleted? → The cart line item displays an Arabic notice ("المنتج ده مبقاش متاح") and is excluded from the WhatsApp order total.
- What happens when the merchant tries to add a 13th section beyond the SVG's 12-zone layout? → The admin panel flags that the homepage supports a maximum of 12 visible sections and prevents exceeding that limit (out of scope for v1 layout changes).
- What happens when a visitor clicks "add to cart" on an out-of-stock variant? → The add-to-cart action is disabled; the variant swatch is visually greyed out.
- What happens if the Supabase connection fails mid-browse? → Error states with Arabic-language retry options are displayed on category and product pages; the cart (localStorage) continues to function offline.
- What happens when the WhatsApp number is not configured? → The WhatsApp button and tappable phone link are both disabled; the order summary text area is still shown with a copy button, and an Arabic notice explains that the merchant has not set up ordering yet.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST render a coded SVG isometric house with exactly 12 individually clickable zone groups and a glowing entrance door, all strictly within the approved color palette.
- **FR-002**: Section names, icons, and order MUST be fetched from live data and overlaid as real, accessible text on the SVG zones — never hardcoded in the frontend or baked into the SVG.
- **FR-003**: All 12 house zones and the entrance door MUST be navigable via keyboard (Tab key) and have `aria-label` attributes matching the visible Arabic section name.
- **FR-004**: The category listing page MUST group products by parent product — if a product has variants, only one card is shown per parent, using the parent's primary image and name.
- **FR-005**: The category listing page MUST display "بداية من X ج.م" (starting from) pricing when a product's variants have different prices, using whole numbers with no decimal places.
- **FR-006**: The category listing page MUST handle loading (skeleton cards), empty (friendly Arabic message with link back), and error (retry option) states explicitly.
- **FR-007**: Inactive or soft-deleted products and sections MUST never appear on the storefront.
- **FR-008**: The product detail page MUST display a swatch/thumbnail row for all variants, defaulting to the first in-stock variant.
- **FR-009**: Variant switching MUST update the main image and displayed price without triggering a full page navigation or reload.
- **FR-010**: Out-of-stock variants MUST be visible (greyed out) but not addable to the cart.
- **FR-011**: The cart MUST persist in client-side storage without requiring any login or account creation.
- **FR-012**: The cart page MUST display product name, selected variant label, quantity, unit price, line subtotal, and a running total for each item.
- **FR-013**: Cart items referencing soft-deleted or deactivated products MUST display a clear Arabic notice rather than silently breaking the total or disappearing.
- **FR-014**: The "send via WhatsApp" button MUST construct a WhatsApp deep link with a human-readable Arabic order summary (all line items, variants, quantities, total) directed to a merchant-configurable WhatsApp number.
- **FR-015**: The WhatsApp phone number MUST be configurable by the merchant (stored in data, not hardcoded in frontend code).
- **FR-016**: The admin panel MUST be accessible only to an authenticated merchant (single role, no multi-role permissions).
- **FR-017**: The admin panel MUST support creating, renaming, and soft-deleting sections with icon upload or selection from a preset library.
- **FR-018**: The admin panel MUST warn the merchant when changing a section slug (URL impact) or deleting a section with assigned products.
- **FR-019**: The admin panel MUST support creating, editing, toggling active/inactive, and soft-deleting products with their variants.
- **FR-020**: The admin panel MUST allow adding or removing variants under an existing product without creating a duplicate product entry.
- **FR-021**: The entire storefront and admin panel MUST use RTL layout with Arabic as the primary UI language and Cairo as the font.
- **FR-022**: The homepage SVG house MUST NOT use any AI-generated raster images — coded SVG only.
- **FR-023**: All colors used anywhere in the product MUST be limited to the approved palette (Primary Blue #0056B3, Secondary Navy #1A237E, Tertiary Gray #9E9E9E, Neutral Gray #75777E, Base White #F8F9FA) — no other hues in backgrounds, buttons, badges, or shadows.
- **FR-024**: The category listing page MUST display products sorted by newest first (most recently added at top) as the default order.
- **FR-025**: Clicking the entrance door MUST trigger a smooth CSS transition (~0.5s): the door plays a CSS transform opening animation (scale(1.05) and rotateY(-110deg) with perspective) while the 12 section zones fade and slide into view in parallel — pure CSS transforms only, no SVG keyframe animation sequences.
- **FR-026**: All prices throughout the storefront and WhatsApp order messages MUST be displayed in Egyptian Pounds with the format `{amount} ج.م` (symbol after number, no decimal places, whole numbers only).
- **FR-027**: The admin panel MUST accept only JPEG, PNG, and WebP image formats for product and section image uploads, with a maximum file size of 2MB per image.
- **FR-028**: The admin panel MUST automatically compress and resize oversized images client-side (canvas-based) before upload, so non-technical merchants uploading raw phone-camera photos are not blocked by file-size errors — compression MUST happen silently without requiring manual intervention.
- **FR-029**: The cart checkout area MUST always display the formatted order summary text alongside the WhatsApp button, with a copy-to-clipboard button and the merchant's phone number as a tappable `tel:` link — this is a persistent secondary order path, not a conditional fallback triggered by failure detection.

### Key Entities

- **Section**: Represents a product category displayed as a "room" on the house homepage. Key attributes: Arabic name, URL-safe slug, icon, display order, active/deleted status. Maximum 12 visible sections on the homepage.
- **Product**: Represents a parent product listing assigned to a section. Key attributes: name, description, section assignment, primary image, active/deleted status. A product is always displayed as a single card in the category grid regardless of how many variants it has.
- **Product Variant**: Represents a specific version of a product (e.g. a color or pattern). Key attributes: label, optional price override (inherits parent price if null), image(s), stock/availability flag, parent product reference. A product with no real variants still has a single "default" variant.
- **Cart Item**: Represents a visitor's selection stored in localStorage. Key attributes: product reference, specific variant reference, variant label, price, quantity. Always references a specific variant, never just the parent product.
- **Merchant Settings**: Store-level configuration managed by the merchant. Key attributes: WhatsApp phone number for order handoff.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visitors can navigate from homepage to a product detail page in 3 taps or fewer (door → section → product).
- **SC-002**: The homepage house SVG with all 12 zones renders correctly and is fully interactive on screens as small as 360px wide.
- **SC-003**: Visitors can complete the full shopping flow (browse → add to cart → send via WhatsApp) in under 5 minutes on a first visit.
- **SC-004**: Variant switching on the product detail page updates image and price within 200ms with no visible page reload or navigation.
- **SC-005**: Cart contents persist across browser sessions and page reloads with 100% reliability (no data loss).
- **SC-006**: The WhatsApp order message includes every line item, its variant, quantity, and the correct total — zero discrepancies.
- **SC-007**: Section and product changes made in the admin panel are reflected on the live storefront within seconds, with no code deploy required.
- **SC-008**: All interactive elements (house zones, cart controls, admin forms) are operable via keyboard navigation with correct Arabic `aria-label`s.
- **SC-009**: The storefront renders correctly in RTL layout across all pages on both mobile and desktop viewports.
- **SC-010**: All section and product names/descriptions are crawlable as real HTML text by search engines (not embedded in images or canvas).

## Assumptions

- Visitors have a stable internet connection for initial page load and Supabase data fetches; the cart (localStorage) functions offline after items are added.
- The store serves a single merchant — there is no multi-merchant or multi-tenant requirement in this phase.
- The maximum number of homepage sections is 12; exceeding this requires a design revision (out of scope for v1).
- Arabic is the only UI language; no internationalization or language switching is needed.
- No online payment gateway is needed — all transactions are completed via WhatsApp conversation with the merchant.
- No customer accounts or login are needed — all shopping is guest-based with localStorage cart persistence.
- Supabase provides sufficient performance for the expected traffic volume without additional caching layers.
- The merchant's WhatsApp number is always reachable and can handle incoming order messages.
- Product images are uploaded by the merchant via the admin panel and stored in Supabase Storage.
- The approved brand identity sheet (Cairo font, 5-color palette, button variants) is the definitive design reference — no additional design system is needed.
