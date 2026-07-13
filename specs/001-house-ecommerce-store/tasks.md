# Tasks: House-Concept E-commerce Store

**Input**: Design documents from `/specs/001-house-ecommerce-store/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests are required for pure logic functions (cart, WhatsApp message formatting, slug generation, variant price/image inheritance) as specified in `spec.md` and `plan.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume a single static site project served from `src/` and tested via `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project directories and empty files per the implementation plan repository structure (`src/pages/`, `src/js/`, `src/css/`, `public/assets/`, `supabase/`, `tests/`)
- [ ] T002 Initialize npm project with dependencies for Vitest (`npm install -D vitest`) and local server (`npm install -D serve`) in package.json at the repository root
- [ ] T003 [P] Configure global CSS font integration using Google Fonts Cairo CDN stylesheet links inside the `<head>` of all storefront and admin HTML documents

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and database schema that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Setup database schema and migrations for tables (`merchant_settings`, `sections`, `products`, `product_variants`) including indexes, foreign keys, and soft-delete columns in `supabase/migrations/`
- [ ] T004b [P] Configure 'store-assets' public Supabase Storage bucket and its associated RLS upload policies (public read, authenticated write)
- [ ] T005 Create SQL seed script to initialize the 12 room-sections and default merchant settings in `supabase/seed/`
- [ ] T006 [P] Create the design tokens stylesheet containing custom properties for the 5-color palette, Cairo typography, and RTL flow layouts in `src/css/tokens.css`
- [ ] T007 [P] Initialize Supabase Client instance using ESM import from npm CDN and environment keys in `src/js/supabase-client.js`
- [ ] T008 [P] Define application shared variables (table names, color palette constants, section counts) in `src/js/constants.js`
- [ ] T009 [P] Implement query parameter parsing, UUID validation, and slug generator utilities in `src/js/utils.js`
- [ ] T010 [P] Write unit tests using Vitest to validate Arabic-compatible slug generation and special character sanitization in `tests/slug.test.js`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse the House Homepage (Priority: P1) 🎯 MVP

**Goal**: A casual mobile shopper lands on the homepage, clicks the glowing entrance door to open the house, and reveals 12 clickable room-sections showing Arabic names/icons which navigate to categories.

**Independent Test**: Load `src/pages/index.html` on a mobile viewport (360px+), verify the house SVG renders and the door glows. Click the door; all 12 zones must fade/slide into view over ~0.5s via CSS transitions. Each zone overlay must show its Arabic name and icon. Verify keyboard accessibility (Tab index + Arabic aria-labels) and click navigation to `category.html?section={slug}`.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create coordinates JSON file mapping section slugs to their center positioning percentages (`cx`, `cy`) in `public/assets/house-coordinates.json`
- [ ] T012 [P] [US1] Create hand-built isometric house SVG with 12 room groups (`<g>` with stable IDs) and a glowing entrance door in `public/assets/house-hero.svg`
- [ ] T013 [P] [US1] Define CSS transitions (0.5s fade/slide), hover glows, and door open transforms in `src/css/house.css`
- [ ] T014 [US1] Implement active sections data-fetching method (`fetchActiveSections`) in the sections data-access API wrapper in `src/js/sections-api.js`
- [ ] T015 [US1] Implement house SVG interactive overlay placement engine, click transitions, and keyboard/RTL accessibility hooks in `src/js/house-interactions.js`
- [ ] T016 [US1] Build storefront homepage skeleton container and script linkages in `src/pages/index.html`

**Checkpoint**: User Story 1 is functional. Visitors can click the door, view room overlays, and navigate to category pages.

---

## Phase 4: User Story 2 - Browse Products in a Category (Priority: P1)

**Goal**: Shoppers can view products in a category as a responsive card grid, with parent products grouped (one card per parent), displaying "starting from" price ranges and skeleton loading/empty/error states.

**Independent Test**: Navigate to `src/pages/category.html?section=men` in browser. Verify skeleton loader cards display while fetching. Confirm products with different variant prices display "بداية من X ج.م". Test empty state layout for categories with zero active items and verify error retry actions.

### Implementation for User Story 2

- [ ] T017 [US2] Implement active section product list query method (`fetchProductsBySection`) returning parent listings sorted by newest first in `src/js/products-api.js`
- [ ] T018 [P] [US2] Style responsive product cards, skeleton templates, Arabic typography layout, and error-retry prompts in `src/css/store.css`
- [ ] T019 [P] [US2] Create category page layout frame containing page headers, skeleton placeholders, grids, and error wrappers in `src/pages/category.html`
- [ ] T020 [US2] Implement category controller script parsing URL parameters, executing data-access methods, and updating UI states in `src/pages/category.html`

**Checkpoint**: User Story 2 is functional. Category product listing is dynamic and displays grouped parent listings.

---

## Phase 5: User Story 3 - View Product Details and Switch Variants (Priority: P1)

**Goal**: Shoppers can view detailed descriptions for a single product, switch variant swatch thumbnails to update primary image and price inline without page reload (<200ms), and see out-of-stock items greyed out.

**Independent Test**: Load `src/pages/product.html?id=[uuid]`. Swapping variant swatches must immediately update price and image. Verify out-of-stock variants display greyed out and disable "Add to Cart" action.

### Tests for User Story 3

- [ ] T021 [P] [US3] Write unit tests to validate variant price and image inheritance algorithms (inheriting parent values if variant overrides are null) in `tests/variants.test.js`

### Implementation for User Story 3

- [ ] T022 [US3] Implement single product details query method (`fetchProductDetails`) returning parent details and active child variant objects in `src/js/products-api.js`
- [ ] T023 [P] [US3] Create product detail page structure containing galleries, swatch selectors, stock badges, and descriptions in `src/pages/product.html`
- [ ] T024 [US3] Implement product detail page controller managing swatch clicks, image updates, and out-of-stock visual overlays in `src/pages/product.html`

**Checkpoint**: User Story 3 is functional. Product page handles dynamic details, variant switching, and stock status.

---

## Phase 6: User Story 4 - Build a Cart and Checkout via WhatsApp (Priority: P1)

**Goal**: Shoppers can add variants to a localStorage guest cart, edit item quantities, view live-updated totals, and checkout via WhatsApp with a persistent text fallback and tap-to-call link.

**Independent Test**: Add items to cart and load `src/pages/cart.html`. Refresh the page to check cart persistence. Adjust quantity to verify subtotal/totals. Confirm soft-deleted items display warnings. Copy order text to clipboard and click WhatsApp checkout to check prefilled text.

### Tests for User Story 4

- [ ] T025 [P] [US4] Write unit tests verifying cart totals calculations and WhatsApp pre-filled Arabic message construction layout in `tests/cart.test.js` and `tests/whatsapp.test.js`

### Implementation for User Story 4

- [ ] T026 [P] [US4] Implement localStorage guest cart wrapper functions (`getCartItems`, `addToCart`, `updateQuantity`, `removeFromCart`, `calculateCartTotals`) in `src/js/cart.js`
- [ ] T027 [US4] Implement settings data-fetching method (`fetchMerchantNumber`) to retrieve E.164 phone numbers from settings in `src/js/settings-api.js`
- [ ] T028 [P] [US4] Create cart page tables layout, quantity modifiers, and fallback checkout inputs in `src/pages/cart.html`
- [ ] T029 [US4] Implement cart controller handling database validation for stale items, copy-to-clipboard actions, and WhatsApp URL generation in `src/pages/cart.html`

**Checkpoint**: User Story 4 is functional. Complete checkout lifecycle is operational with cart persistence and fail-safe copy clipboard options.

---

## Phase 7: User Story 5 - Manage Sections via Admin Panel (Priority: P2)

**Goal**: Logged-in merchants can CRUD sections (rooms) from the dashboard, receiving warnings on slug modifications and deletes affecting active products.

**Independent Test**: Access `src/pages/admin/login.html`, authenticate, and navigate to Sections list. Create, edit, and soft-delete a section. Check warning prompts on slug editing and assigned products. Verify homepage updates immediately.

### Implementation for User Story 5

- [ ] T030 [US5] Implement CRUD section database mutation queries (`fetchAllSectionsAdmin`, `createSection`, `updateSection`, `softDeleteSection`) in `src/js/sections-api.js`
- [ ] T031 [P] [US5] Create admin session routing validation guard in `src/js/admin/auth-gate.js`
- [ ] T032 [P] [US5] Create merchant credential login portal interface and validation in `src/pages/admin/login.html`
- [ ] T033 [P] [US5] Design primary dashboard container layout with navigation menus in `src/pages/admin/dashboard.html`
- [ ] T034 [P] [US5] Implement CSS styles for admin layouts, tables, modals, and sidebar configurations in `src/css/admin.css`
- [ ] T035 [P] [US5] Create sections CRUD list interface, modals, inputs, and slug warnings in `src/pages/admin/sections.html`
- [ ] T036 [US5] Implement sections admin controller logic, validating inputs and intercepting dangerous deletions in `src/js/admin/sections-crud.js`

**Checkpoint**: User Story 5 is functional. Section management is protected and operates securely from the admin panel.

---

## Phase 8: User Story 6 - Manage Products via Admin Panel (Priority: P2)

**Goal**: Merchants can create, update, soft-delete, and toggle visibility of products and variants, using client-side canvas resizing to automatically compress oversized image uploads under 2MB.

**Independent Test**: Open admin panel, go to Products list, upload a 5MB image, verify it compresses to <500KB and uploads successfully. Add a product with variants, update details, toggle visibility off, and check that it disappears from category.html.

### Implementation for User Story 6

- [ ] T037 [P] [US6] Implement canvas-based image resizing and compression helper functions in `src/js/image-compressor.js`
- [ ] T038 [US6] Implement product and variant transaction database mutations (`createProduct`, `updateProduct`, `softDeleteProduct`) in `src/js/products-api.js`
- [ ] T039 [P] [US6] Create products list dashboard and nested variant modification modals in `src/pages/admin/products.html`
- [ ] T040 [US6] Implement products CRUD controller logic, file upload listeners, and sub-variant sync states in `src/js/admin/products-crud.js`

**Checkpoint**: User Story 6 is functional. Merchants can manage their inventory, add variants, toggle active flags, and compress uploaded files seamlessly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and optimization steps affecting all user stories before release.

- [ ] T041 Run automated unit tests using Vitest and verify all pass successfully
- [ ] T042 Perform design review checking Cairo typography, RTL compliance, and 5-color palette constraints across all storefront pages
- [ ] T043 Conduct end-to-end local validation scenarios from `specs/001-house-ecommerce-store/quickstart.md`
- [ ] T044 Deploy production static web files onto Vercel and verify live domain

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Homepage browsing. Can start after Foundational completion.
- **User Story 2 (P1)**: Category browsing. Can start after Foundational completion.
- **User Story 3 (P1)**: Product details. Can start after Foundational completion.
- **User Story 4 (P1)**: Cart and checkout. Can start after Foundational completion.
- **User Story 5 (P2)**: Sections admin management. Can start after storefront browsability (US1) is functional.
- **User Story 6 (P2)**: Products admin management. Can start after storefront catalog display (US2/US3) is functional.

### Within Each User Story

- Pure logic unit tests are written and verified first.
- Data API and back-end interface functions before page markup structure.
- DOM and controller JS modules before final page integrations.

### Parallel Opportunities

- Setup tasks (T001-T003) can be worked on in parallel.
- Foundational assets, utilities, and client configurations (T006-T010) can be implemented in parallel.
- Story tasks marked with `[P]` (T011, T012, T013, T018, T019, T021, T023, T025, T026, T028, T031, T032, T033, T034, T035, T037, T039) do not depend on sibling task implementations and can be developed simultaneously.
- Storefront user stories (US1, US2, US3, US4) can be developed in parallel since they touch separate pages and modules.
- Admin user stories (US5, US6) can be built in parallel.

---

## Parallel Example: User Story 1

```bash
# Implement the coordinates database and assets in parallel:
Task: "Create coordinates JSON file mapping section slugs to their center positions in public/assets/house-coordinates.json"
Task: "Create hand-built isometric house SVG with 12 room groups and door in public/assets/house-hero.svg"
Task: "Define CSS transitions (0.5s fade/slide), hover glows, and door open transforms in src/css/house.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 to 4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Homepage)
4. Complete Phase 4: User Story 2 (Category Listings)
5. Complete Phase 5: User Story 3 (Product details and variants)
6. Complete Phase 6: User Story 4 (Cart and WhatsApp checkout)
7. **STOP and VALIDATE**: Verify storefront browse-to-checkout flow end-to-end.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test house interactions → Storefront home ready
3. Add User Story 2 & 3 → Test listing and switcher → Shoppers browse catalog
4. Add User Story 4 → Test cart and WhatsApp checkout → Shoppers can purchase items (MVP launch ready!)
5. Add User Story 5 & 6 → Test admin CRUD and image compressor → Merchant manages inventory autonomously

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
