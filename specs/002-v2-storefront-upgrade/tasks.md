# Tasks: V2 Storefront Upgrade

**Input**: Design documents from `/specs/002-v2-storefront-upgrade/`

**Prerequisites**: [plan.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/plan.md) (required), [spec.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/spec.md) (required), [research.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/research.md), [data-model.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/data-model.md), [contracts/api.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/contracts/api.md)

**Tests**: Vitest-based unit tests inside `/tests` cover custom pure logical helpers.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6)
- File paths are explicitly mentioned in descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Assets setup and baseline verification

- [ ] T001 Create folder `public/assets/icons/` and extract the 12 icons from `public/assets/Frame 3.svg` as static files (`laundry.svg`, `kitchen-shelving.svg`, `paper-goods.svg`, `bathroom.svg`, `women.svg`, `men.svg`, `reception.svg`, `baby.svg`, `footwear.svg`, `vanity.svg`, `garage.svg`, `cleaning.svg`)
- [ ] T002 Create a brand-styled fallback placeholder SVG asset at `public/assets/placeholder.svg`
- [ ] T003 [P] Configure Vitest testing environment and run existing test suite using `npm run test` to verify all baseline tests pass

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database migration and sanitization helpers that block multiple user stories

**⚠️ CRITICAL**: Setup and foundational tasks must be complete before story-level work can begin

- [ ] T004 Create database migration file `supabase/migrations/002_optional_images.sql` to drop the `NOT NULL` constraint on `products.primary_image_url`
- [ ] T005 Create database migration file `supabase/migrations/003_db_constraints_validation.sql` to add Check Constraints (name/slug length, non-negative price) and a database trigger to reject inputs containing executable script or HTML tags
- [ ] T006 [P] Add the `sanitizeInput(text)` helper function to strip HTML/script tags from strings in `src/js/utils.js`
- [ ] T007 [P] Create unit test file `tests/sanitize.test.js` to verify that `sanitizeInput` strips HTML/script tags properly
- [ ] T008 Apply the new database migration files to the Supabase instance using local CLI or dashboard

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Auto-Opening House Homepage (Priority: P1) 🎯 MVP

**Goal**: Automatically open the homepage house hero after a short delay, with smooth transition, live overlays, full keyboard navigability, and transition suppression on return.

**Independent Test**: Clear sessionStorage, open `index.html`, verify closed house transitions to open house within 2s, check clickable zones redirect, reload and verify immediate open state.

### Implementation for User Story 1

- [ ] T009 [US1] Update `src/pages/index.html` to house two layered elements (`#hero-frame-1` and `#hero-frame-2`) absolute-positioned over each other instead of rendering a single `house-hero.svg`
- [ ] T010 [P] [US1] Modify `src/css/house.css` to style the layered SVG wrappers, smooth fade transition, zone hover highlighting, and focus outlines
- [ ] T011 [US1] Update `src/js/house-interactions.js` to load both SVG frames, implement the 1.5–2.5 second delay transition timer, overlay active section titles, handle keyboard navigation (Tab and Enter support), and use `sessionStorage` caching to prevent repeating the intro on navigation
- [ ] T012 [P] [US1] Search and remove all remaining code references to the deprecated `public/assets/house-hero.svg` across the workspace

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Admin Visual Icon Picker (Priority: P1)

**Goal**: Allow merchants to select section icons visually from a preview gallery in admin section form and display thumbnails.

**Independent Test**: Open admin sections page, select an icon visually, save, verify thumbnail renders in the list table and updates the storefront homepage icon.

### Implementation for User Story 2

- [ ] T013 [US2] Update section form layout in `src/pages/admin/sections.html` to replace the `icon_name` text input with a CSS grid of 12 selectable icon thumbnail buttons linked to a hidden form field
- [ ] T014 [US2] Update `src/js/admin/sections-crud.js` to render the 12 visual preview SVGs in the form picker, handle select state style toggles, map filenames to the form submit, and display visual thumbnails in the sections table rows instead of file string names

**Checkpoint**: User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Optional Product Images (Priority: P2)

**Goal**: Allow saving products without image uploads and show a styled placeholder card on the storefront.

**Independent Test**: Create a product in admin with no image, save, verify it lists in storefront using the branded placeholder graphic.

### Implementation for User Story 3

- [ ] T015 [US3] Modify product form validator in `src/js/admin/products-crud.js` to allow form submission with a missing or empty image field
- [ ] T016 [P] [US3] Update product card rendering logic in `src/pages/category.html` to load `public/assets/placeholder.svg` when product `primary_image_url` is null
- [ ] T017 [P] [US3] Update main display rendering logic in `src/pages/product.html` to display the placeholder image when the selected product or variant has no image URL
- [ ] T018 [P] [US3] Update product thumbnail logic in `src/pages/cart.html` to render the placeholder image for image-less cart items

**Checkpoint**: User Story 3 is fully functional and testable independently.

---

## Phase 6: User Story 4 - Secure Admin Authentication via Magic Link (Priority: P1)

**Goal**: Secure admin pages with passwordless email Magic Link auth and validate session tokens on all admin database operations.

**Independent Test**: Navigate to `/admin/dashboard.html` logged out (redirects to login), request Magic Link login, verify dashboard access on success.

### Implementation for User Story 4

- [ ] T019 [US4] Modify `src/pages/admin/login.html` to remove password fields and supply a passwordless email submission form triggering Magic Link auth
- [ ] T020 [US4] Update mock authentication client in `src/js/supabase-client.js` to support mock `signInWithOtp` passwordless simulation for local storage testing
- [ ] T021 [US4] Modify `src/js/admin/auth-gate.js` to validate session token state and redirect expired or unauthenticated sessions to `login.html`
- [ ] T022 [US4] Update auth constraints in `src/js/admin/products-crud.js` and `src/js/admin/sections-crud.js` to verify authenticated session token validity before executing database queries

**Checkpoint**: User Story 4 is fully functional and testable independently.

---

## Phase 7: User Story 5 - Row-Level Security on All Tables (Priority: P1)

**Goal**: Database-level enforcement of RLS policies ensuring public queries only access active, non-deleted entries and admin requires auth session.

**Independent Test**: Perform anonymous reads (verify deleted/inactive data is hidden) and writes (verify writes fail) to sections, products, and variants tables.

### Implementation for User Story 5

- [ ] T023 [US5] Verify and execute standard RLS configuration updates for anonymous/authenticated roles across all tables (`sections`, `products`, `product_variants`, `merchant_settings`) in `supabase/migrations/001_initial_schema.sql`

**Checkpoint**: User Story 5 is fully functional and testable independently.

---

## Phase 8: User Story 6 - Rate Limiting & Validation (Priority: P2)

**Goal**: Implement click throttling for checkout and cart operations and sanitization on all text inputs.

**Independent Test**: Double-click "add to cart", verify action debounces. Input HTML scripts in admin name, verify strings are sanitized.

### Implementation for User Story 6

- [ ] T024 [P] [US6] Add click-throttling logic in `src/js/cart.js` for cart actions
- [ ] T025 [P] [US6] Modify "Add to Cart" button in `src/pages/product.html` to disable itself for exactly 1.0 second after a user click
- [ ] T026 [P] [US6] Modify "Send Order" button in `src/pages/cart.html` to disable itself for exactly 1.0 second after a user click
- [ ] T027 [US6] Inject input sanitization helper `sanitizeInput` from `utils.js` into admin input processing in `src/js/admin/products-crud.js` and `src/js/admin/sections-crud.js`

**Checkpoint**: User Story 6 is fully functional and testable independently.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: System documentation, validation, and manual test cleanup

- [ ] T028 Update developer documentation or README to reflect v2 auth and assets structure
- [ ] T029 Execute Vitest suite (`npm run test`) and verify all logic tests pass
- [ ] T030 Execute all manual verification procedures outlined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - Can proceed sequentially in priority order (US1 → US2 → US4 → US5 → US3 → US6).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003).
- Foundational helper tasks marked [P] can run in parallel (T006, T007).
- In Story 1: Layered HTML/CSS tasks can run in parallel (T010, T012).
- Once Foundation is complete, Story 1 (P1) and Story 2 (P1) can be implemented in parallel.
- In Story 3: Storefront rendering tasks for placeholders can run in parallel (T016, T017, T018).
- In Story 6: Click-throttling button tasks can run in parallel (T024, T025, T026).

---

## Parallel Example: User Story 3

```bash
# Developer A:
Task: "Update product card rendering logic in src/pages/category.html to load public/assets/placeholder.svg when primary_image_url is null"

# Developer B:
Task: "Update main display rendering logic in src/pages/product.html to display the placeholder image when the selected product or variant has no image URL"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 (Auto-Opening House Hero) independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Auto-Opening Hero) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Admin Visual Icon Picker) → Test independently → Deploy/Demo
4. Add User Story 4 (Magic Link Auth) → Test independently → Deploy/Demo
5. Add User Story 5 (RLS Policies) → Test independently → Deploy/Demo
6. Add User Story 3 (Optional Images) → Test independently → Deploy/Demo
7. Add User Story 6 (Rate Limiting & sanitization) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories.
