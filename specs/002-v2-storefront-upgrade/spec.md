# Feature Specification: V2 Storefront Upgrade

**Feature Branch**: `002-v2-storefront-upgrade`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "Upgrade the Bayt Al-Ezz storefront to v2.0 with four major changes from the project PRD: (1) auto-opening house animation replacing click-to-open, (2) admin visual icon picker for section management, (3) optional product images, and (4) comprehensive security hardening including Magic Link auth, RLS, rate limiting, and server-side validation."

## Clarifications

### Session 2026-07-15

- Q: How are section icons extracted from Frame 3.svg for the admin visual icon picker? → A: Icons are pre-extracted manually by the developer into public/assets/icons/ as individual static SVG files.
- Q: How is the admin email whitelist managed for Magic Link logins? → A: No self-signup is allowed; the merchant user account is pre-created/invited manually via the Supabase Dashboard.
- Q: How is the "merchant role" verified for the authenticated user? → A: Any authenticated user is authorized (since self-registration is blocked and users are created manually).
- Q: What is the format/source of the product placeholder graphic? → A: A single static SVG file hosted at `/public/assets/placeholder.svg` (shared by all image-less products).
- Q: What is the client-side throttling interval and user feedback for interactive buttons? → A: Disable the button for 1.0 second immediately after click to prevent multiple clicks and visual spam.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Auto-Opening House Homepage (Priority: P1)

As a mobile visitor, I land on the homepage and see an inviting closed house illustration (Frame 1). Without clicking or tapping anything, the house automatically opens after a short delay, smoothly transitioning to reveal the interior (Frame 2) with 12 themed shopping sections I can browse.

**Why this priority**: The auto-opening house is the single most impactful change in v2.0. It removes the friction of requiring a click/tap to discover the store's sections — critical for casual mobile browsers who may not realize the door is interactive. This directly affects every visitor's first impression and conversion into browsing.

**Independent Test**: Can be fully tested by loading the homepage, verifying Frame 1 appears immediately, waiting ~2 seconds with no interaction, observing a smooth animation transition to Frame 2 with all 12 clickable section zones rendered with live data overlays.

**Acceptance Scenarios**:

1. **Given** a visitor loads the homepage on any device, **When** the page finishes loading, **Then** the closed house SVG (Frame 1) renders immediately as the hero element — no loading spinner, no blank space.
2. **Given** the closed house is displayed AND section data has loaded from the database, **When** at least 1.5 seconds have elapsed since page load, **Then** the house automatically transitions to the open state (Frame 2) via a smooth CSS animation (fade, slide, or morph) without any user click, tap, or interaction.
3. **Given** the house has auto-opened to Frame 2, **When** the visitor views the interior, **Then** exactly 12 individually clickable section zones are displayed in a 4-column × 3-row grid, each showing its Arabic name and icon pulled from live database data (not hardcoded text).
4. **Given** a section zone is visible after auto-open, **When** the visitor hovers over or taps it, **Then** a visible highlight effect (scale or glow) confirms the zone is interactive before navigating to the corresponding category listing page.
5. **Given** a section zone is visible, **When** the visitor uses keyboard Tab to reach it, **Then** the zone receives visible focus and has a proper `aria-label` matching the Arabic section name.
6. **Given** section data fetch from the database fails, **When** the auto-open animation completes, **Then** the zones display gracefully without breaking the layout, and a retry mechanism is available.
7. **Given** the auto-open animation has completed, **When** the visitor returns to the homepage (via back navigation or direct URL), **Then** the animation does NOT replay — the house displays in its open state directly.

---

### User Story 2 — Admin Visual Icon Picker for Sections (Priority: P1)

As the merchant (non-technical admin), when I create or edit a section in the admin panel, I can choose an icon from a visual thumbnail gallery showing the actual icon shapes — not filenames. I can see exactly what each icon looks like before selecting it, and my choice immediately appears on the live storefront.

**Why this priority**: The merchant cannot identify icons by filename and explicitly requested visual previews. Without this, the merchant cannot effectively manage section icons, which are a core visual element of the house homepage. This is a client-mandated requirement.

**Independent Test**: Can be fully tested by logging into the admin panel, navigating to section management, creating or editing a section, verifying the icon picker displays visual thumbnails (not filenames), selecting an icon, saving, and confirming the selected icon appears correctly on the storefront homepage.

**Acceptance Scenarios**:

1. **Given** the admin is on the section create or edit form, **When** they reach the icon selection field, **Then** a visual picker displays all available icons as rendered thumbnails (inline SVG or image tags) — NOT as text filenames like `kitchen.svg`.
2. **Given** the visual icon picker is displayed, **When** the admin views the available icons, **Then** each icon is sourced from the `Frame 3.svg` reference design and rendered at a size large enough to distinguish individual shapes (minimum 48×48px thumbnail).
3. **Given** the admin selects an icon from the picker, **When** they save the section, **Then** the selected icon reference is stored in the sections table and immediately retrievable by the storefront.
4. **Given** a section has a selected icon, **When** the section list view is displayed in the admin panel, **Then** the current icon is shown as a visual thumbnail next to the section name — not as a filename string.
5. **Given** the admin changes a section's icon and saves, **When** a visitor reloads the storefront homepage, **Then** the updated icon appears on the corresponding zone overlay.

---

### User Story 3 — Optional Product Images (Priority: P2)

As the merchant, I can create and save products in the admin panel without uploading any image. Products without images display a tasteful branded placeholder on the storefront instead of broken image tags or blank space.

**Why this priority**: This removes a blocking requirement that previously prevented the merchant from quickly adding products. Many products may not have photos ready at listing time — the merchant needs to get inventory listed fast and add images later. This is a client-mandated requirement.

**Independent Test**: Can be fully tested by creating a product in the admin panel with no image uploaded, saving successfully, viewing the product on the storefront category page and product detail page, and verifying a styled placeholder appears instead of a broken image.

**Acceptance Scenarios**:

1. **Given** the admin is on the product creation form, **When** they fill in the product name, description, section, price, and at least one variant but provide NO image, **Then** the form allows submission without validation errors — the image field does not block saving.
2. **Given** a product and its variants have no images, **When** the product appears in the category listing grid on the storefront, **Then** a tasteful brand-colored placeholder graphic is displayed (styled with the brand design tokens) rather than a broken `<img>` tag, blank space, or generic browser error icon.
3. **Given** a product with no images is opened on the product detail page, **When** the visitor views it, **Then** the placeholder graphic is displayed in the main image area with consistent styling, and the "add to cart" functionality works normally.
4. **Given** a variant has no image but another variant of the same product does, **When** the visitor switches to the image-less variant via the swatch selector, **Then** the display updates to show the placeholder for that specific variant, not the other variant's image.
5. **Given** the merchant later uploads an image for a previously image-less product, **When** the storefront is reloaded, **Then** the real image replaces the placeholder seamlessly.

---

### User Story 4 — Secure Admin Authentication via Magic Link (Priority: P1)

As the system, the admin panel is protected by Supabase Magic Link (passwordless email login). No traditional username/password form exists. Only authenticated users with the merchant role can access any admin route, and sessions are validated on every admin operation.

**Why this priority**: Security is non-negotiable for the admin panel — without authentication, anyone could modify products and sections. Magic Link was explicitly chosen by the client over password-based auth. This gates all other admin functionality.

**Independent Test**: Can be fully tested by navigating to any `/admin/*` URL without authentication and verifying redirect to login, requesting a Magic Link email, clicking the link, verifying session creation, accessing admin features, and verifying session expiry behavior.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor navigates to any `/admin/*` route, **When** the page loads, **Then** they are redirected to the Magic Link login page — no admin content is visible.
2. **Given** the admin is on the login page, **When** they enter their email and submit, **Then** a Magic Link email is sent via Supabase Auth, and the UI shows a "check your email" confirmation message — NO password field is present anywhere on the form.
3. **Given** the admin receives the Magic Link email, **When** they click the link within its validity window, **Then** they are authenticated and redirected to the admin dashboard with a valid session.
4. **Given** the admin has a valid session, **When** they perform any admin operation (create, edit, delete sections or products), **Then** the session token is validated before the operation proceeds.
5. **Given** the admin's session has expired, **When** they attempt any admin operation, **Then** they are redirected to the login page with a clear message indicating their session has expired.

---

### User Story 5 — Row-Level Security on All Tables (Priority: P1)

As the system, all database tables enforce Row-Level Security policies. Public storefront queries can only read active, non-deleted records. Admin write operations require an authenticated merchant session. No table is accessible without an RLS policy.

**Why this priority**: RLS is the foundational security layer that prevents data leaks and unauthorized modifications. Without RLS, a malicious client could read deleted/inactive data or modify records directly through the Supabase API. This is a non-negotiable security requirement.

**Independent Test**: Can be fully tested by attempting direct Supabase API calls without authentication (verifying only active/non-deleted records are returned), attempting write operations without auth (verifying rejection), and attempting write operations with a valid merchant session (verifying success).

**Acceptance Scenarios**:

1. **Given** no authentication is provided, **When** a public query is made to the sections table, **Then** only records where `is_active = true` AND `deleted_at IS NULL` are returned.
2. **Given** no authentication is provided, **When** a public query is made to the products table, **Then** only records where `is_active = true` AND `deleted_at IS NULL` are returned.
3. **Given** no authentication is provided, **When** an INSERT, UPDATE, or DELETE operation is attempted on any table, **Then** the operation is rejected with an authorization error.
4. **Given** a valid authenticated merchant session, **When** write operations (insert, update, soft-delete) are performed on sections or products, **Then** the operations succeed.
5. **Given** RLS policies exist on all tables, **When** the database schema is audited, **Then** every table (sections, products, product_variants) has at least one RLS policy enabled — no table has RLS disabled.

---

### User Story 6 — Rate Limiting and Server-Side Validation (Priority: P2)

As the system, public-facing interactions are throttled to prevent automated abuse, and all admin form data is validated server-side to prevent injection attacks and data corruption — client-side validation is only a UX convenience.

**Why this priority**: Rate limiting prevents abuse (e.g., cart spam, WhatsApp button hammering) and server-side validation is the last line of defense against malicious input. While not as immediately visible as auth or RLS, these protections are essential for production readiness.

**Independent Test**: Can be fully tested by rapidly clicking the "add to cart" and "send via WhatsApp" buttons and verifying throttling, submitting admin forms with malicious HTML/script payloads and verifying sanitization, and confirming that server-side constraints reject invalid data even when client-side validation is bypassed.

**Acceptance Scenarios**:

1. **Given** a visitor rapidly clicks the "add to cart" button multiple times within 1 second, **When** the clicks are processed, **Then** client-side throttling prevents duplicate additions — only one addition is processed per debounce interval.
2. **Given** a visitor rapidly clicks the "send order via WhatsApp" button, **When** the clicks are processed, **Then** client-side throttling prevents multiple WhatsApp windows from opening — only one deep link is triggered per reasonable interval.
3. **Given** the admin submits a section name containing `<script>alert('xss')</script>`, **When** the data is processed server-side, **Then** the HTML/script content is sanitized or rejected — it MUST NOT be stored as executable markup.
4. **Given** the admin bypasses client-side validation (e.g., via browser dev tools), **When** they submit a form with invalid data (empty name, negative price, invalid slug), **Then** server-side validation (via database constraints, RLS policies, or Edge Functions) rejects the submission with a clear error.
5. **Given** server-side rate limiting is configured, **When** excessive requests are made to admin API endpoints, **Then** the server responds with appropriate rate-limit responses.

---

### Edge Cases

- What happens if the database is unreachable during the auto-open animation? → The house opens visually (Frame 2 renders) but section overlays show loading indicators or a retry prompt, preserving the visual experience.
- What happens if Frame 1.svg or Frame 2.svg fails to load? → A fallback brand-colored container with the store name is shown, with a prominent link to browse sections as a text list.
- What happens if the admin tries to create a 13th section? → The system warns the admin that the homepage only supports 12 visual zones and prevents creation until a section is removed.
- What happens if a Magic Link is clicked after expiration? → The user is shown a clear "link expired" message with a button to request a new Magic Link.
- What happens if the admin uploads an image that exceeds the size limit? → Client-side compression attempts to reduce it; if still too large, a clear error message with the size limit is shown.
- What happens if two admin sessions are active simultaneously? → Each session operates independently; the latest write wins (last-write-wins), consistent with single-merchant architecture.

## Requirements *(mandatory)*

### Functional Requirements

**Auto-Opening House Animation**:
- **FR-001**: The homepage MUST display the closed house SVG (Frame 1) immediately on page load with no interaction required from the visitor.
- **FR-002**: The house MUST automatically transition to the open state (Frame 2) after a timed delay of 1.5–2.5 seconds, using a smooth CSS animation (fade, slide, or morph).
- **FR-003**: The transition MUST NOT require any user click, tap, scroll, or other interaction — it is fully automatic.
- **FR-004**: After the house opens, exactly 12 section zones MUST be individually clickable, each navigating to the corresponding category listing page.
- **FR-005**: Section zone names and icons MUST be fetched from the live database and rendered as HTML text overlays — not hardcoded in the frontend.
- **FR-006**: Each zone MUST be keyboard-navigable (Tab) and have a correct `aria-label` matching the visible Arabic section name.
- **FR-007**: The auto-open animation MUST wait for section data to load before revealing zone overlays; if data is delayed, the visual transition still occurs and overlays appear when data arrives.

**Admin Visual Icon Picker**:
- **FR-008**: The admin section create/edit form MUST include a visual icon picker that displays icons as rendered thumbnails (inline SVG or `<img>` tags), NOT as text filenames.
- **FR-009**: The icon picker MUST source available icon designs from `public/assets/icons/` which are pre-extracted static SVG files matching the shapes in `Frame 3.svg`.
- **FR-010**: The admin section list view MUST display the currently selected icon as a visual thumbnail next to each section name.
- **FR-011**: Selected icon references MUST be stored in the sections database table for dynamic retrieval by the storefront.

**Product Image Optionality**:
- **FR-012**: The product creation and edit forms MUST allow saving without any image — image fields are optional, not required.
- **FR-013**: Products and variants without images MUST display a tasteful placeholder graphic using a static SVG hosted at `/public/assets/placeholder.svg` on the storefront (category grid and product detail page).
- **FR-014**: The database MUST allow NULL values for image columns in both the products and product_variants tables.

**Magic Link Authentication**:
- **FR-015**: The admin panel MUST use Supabase Magic Link as the sole authentication method — no username/password form MUST exist.
- **FR-016**: All `/admin/*` routes MUST redirect unauthenticated visitors to the Magic Link login page.
- **FR-017**: Session tokens MUST be validated on every admin API call (read and write operations).
- **FR-018**: Expired or invalid sessions MUST redirect the user to the login page with a clear expiration message.
- **FR-026**: The system MUST block new admin self-registrations; access is restricted to accounts manually created or invited via the Supabase Dashboard.

**Row-Level Security**:
- **FR-019**: ALL database tables (sections, products, product_variants) MUST have RLS policies enabled — no exceptions.
- **FR-020**: Public read queries MUST be restricted to active, non-deleted records only (WHERE `is_active = true AND deleted_at IS NULL`).
- **FR-021**: Admin write operations (insert, update, delete) MUST require a valid authenticated user session (since self-signup is blocked, any authenticated user is authorized).

**Rate Limiting & Validation**:
- **FR-022**: Client-side throttling MUST be implemented on repeated user actions (add to cart, WhatsApp send button) by disabling the button for 1.0 second immediately after click.
- **FR-023**: All admin form data MUST be validated server-side (via database constraints, RLS policies, and/or Edge Functions) — client-side validation is supplementary only.
- **FR-024**: Input sanitization MUST be applied to all admin form fields to prevent XSS and injection attacks.
- **FR-025**: Server-side rate limiting SHOULD be applied via Supabase Edge Functions or Vercel middleware for admin API endpoints.

### Key Entities

- **Section**: A themed shopping category ("room") displayed as a zone on the house homepage. Key attributes: Arabic name, URL slug, icon reference (visual), sort order, active/inactive status, soft-delete timestamp.
- **Product**: A sellable item assigned to one section, optionally with images. Key attributes: name, description, section assignment, primary image (nullable), base price, active/inactive toggle, soft-delete timestamp.
- **Product Variant**: A specific version of a product (color, pattern, size). Key attributes: variant label, price override (nullable — inherits parent), image (nullable), stock availability flag, sort order, parent product reference.
- **Admin Session**: An authenticated merchant session created via Magic Link. Key attributes: email, session token, expiry timestamp, role (merchant).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-time visitors see the house open automatically without any interaction — zero visitors are stuck on the closed house waiting for a click prompt.
- **SC-002**: The auto-open animation completes within 3 seconds of page load (including data fetch and minimum delay), maintaining a smooth visual experience on mobile devices.
- **SC-003**: The merchant can select a section icon from the visual picker and see it reflected on the live storefront within one page reload — total icon change workflow under 30 seconds.
- **SC-004**: Products can be created and listed on the storefront without any images — 100% of image-less products display a branded placeholder, zero broken image tags.
- **SC-005**: Zero unauthorized write operations succeed against the database — all unauthenticated INSERT/UPDATE/DELETE attempts are rejected by RLS policies.
- **SC-006**: Zero admin pages are accessible without a valid Magic Link session — 100% of unauthenticated `/admin/*` requests redirect to login.
- **SC-007**: Repeated rapid actions (add to cart, WhatsApp send) are throttled to a maximum of one processed action per second per user, preventing UI abuse.
- **SC-008**: Zero stored records contain unsanitized HTML or script payloads — 100% of admin form inputs are sanitized server-side before storage.
- **SC-009**: Every section zone on the homepage is keyboard-navigable (Tab + Enter) with correct `aria-label` — meeting WCAG 2.1 Level A for interactive elements.
- **SC-010**: The storefront loads and renders the house hero (Frame 1 + auto-open to Frame 2) with a total page weight under 500KB, maintaining the lightweight SVG-only approach.

## Assumptions

- The client-provided SVG files (`Frame 1.svg`, `Frame 2.svg`, `Frame 3.svg`) are already finalized and available in `public/assets/`. No further design changes to these files are expected during implementation.
- The merchant has a single email address for Magic Link authentication. Multi-merchant or multi-admin support is explicitly out of scope for this phase.
- The 12-section maximum is a fixed visual constraint of the house layout. Adding a 13th section requires a design revisit (out of scope).
- Client-side image compression (canvas-based, max 2MB, JPEG/PNG/WebP) is already specified in v1 and carries forward — this spec does not change the compression behavior.
- Egyptian Pound pricing format (`150 ج.م`) and newest-first product sorting carry forward from v1 and are not re-specified here.
- The WhatsApp checkout flow (number `+201555077347`, pre-filled message, localStorage cart) carries forward from v1; this spec only adds rate-limiting to the send button.
- The deprecated `house-hero.svg` file MUST NOT be referenced anywhere — only Frame 1.svg and Frame 2.svg are used for the house animation.
- The existing database schema (sections, products, product_variants tables) is already partially defined in v1; this spec's RLS and nullable-image requirements are additive, not replacements.
- Server-side rate limiting via Edge Functions or Vercel middleware is a SHOULD (best-effort) requirement — client-side throttling is the minimum mandatory implementation.
