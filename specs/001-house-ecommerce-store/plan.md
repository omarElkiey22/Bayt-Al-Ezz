# Implementation Plan: House-Concept E-commerce Store

**Branch**: `001-house-ecommerce-store` | **Date**: 2026-07-14 | **Spec**: [spec.md](file:///D:/%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%D8%B9/Bayt%20Al-Ezz/specs/001-house-ecommerce-store/spec.md)

**Input**: Feature specification from `/specs/001-house-ecommerce-store/spec.md`

## Summary

Build a mobile-first, Arabic RTL e-commerce storefront with a coded SVG "house" homepage featuring 12 clickable room-sections, category product listings with variant grouping, a product detail page with an inline variant switcher, a localStorage-based guest cart with WhatsApp checkout (plus always-visible copy-to-clipboard fallback), and a merchant admin panel for managing sections and products. The entire stack is vanilla HTML/CSS/JS with Supabase backend, deployed as static files on Vercel — no build step, no framework, no customer accounts, no online payment.

## Technical Context

**Language/Version**: Vanilla HTML5, CSS3, JavaScript (ES Modules via `<script type="module">`) — no transpilation, no build step

**Primary Dependencies**:
- Supabase JS SDK v2 (loaded via CDN `esm.sh` or `cdn.jsdelivr.net` for ES module import — no npm/bundler)
- Cairo font (Google Fonts CDN)

**Storage**:
- Supabase Postgres (sections, products, product_variants, merchant_settings tables)
- Supabase Storage (product and section images, max 2MB, JPEG/PNG/WebP)
- Supabase Auth (merchant admin login, single role)
- localStorage (guest cart state, client-side only)

**Testing**: Vitest or Node.js `assert` scripts for pure logic tests (cart totals, WhatsApp message generation, slug generation, variant selection logic). Manual testing for DOM/visual features.

**Target Platform**: Mobile-first web (static files hosted on Vercel). Primary target: mobile browsers (360px+ viewport). Secondary: desktop browsers. Arabic RTL layout throughout.

**Project Type**: Static web application (storefront + admin panel, no server-side rendering)

**Performance Goals**:
- Variant switching: <200ms image/price update (FR-009, SC-004)
- Homepage SVG: renders immediately without network dependency for the graphic (FR-001)
- No WebGL/3D assets — SVG + CSS/JS only
- Door transition: ~0.5s CSS fade/slide with scale(1.05) and rotateY(-110deg) door transform (FR-025)

**Constraints**:
- No build step (Constitution II) — static HTML/CSS/JS files only
- SVG only for house hero (Constitution III) — no AI-generated raster
- 5-color palette only (FR-023): #0056B3, #1A237E, #9E9E9E, #75777E, #F8F9FA
- RTL/Arabic-first (Constitution V) — Cairo font, RTL layout everywhere
- Soft-delete only (Constitution VIII) — `deleted_at` column, never hard-delete
- Egyptian Pounds pricing — `{amount} ج.م`, no decimals, whole numbers (FR-026)
- Image uploads: 2MB max, JPEG/PNG/WebP, auto client-side compression (FR-027, FR-028)
- Single merchant — no multi-tenant/multi-role (Assumptions)

**Scale/Scope**: Single merchant store, max 12 homepage sections, guest-only shopping, expected low-to-moderate traffic handled by Supabase without caching layers.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Spec-First Development | ✅ PASS | spec.md complete (29 FRs, 10 SCs, 5 clarifications, 5 edge cases) |
| II | No-Build-Step Architecture | ✅ PASS | Static HTML/CSS/JS, ES module imports via CDN, Vercel static deploy |
| III | Hand-Built SVG House Hero | ✅ PASS | Coded SVG with 12 `<g>` groups, JSON coordinate export, HTML text overlays |
| IV | Separation of Concerns | ✅ PASS | Data-access layer (*-api.js), no inline onclick, CSS in dedicated files |
| V | Mobile-First, Arabic-First, RTL | ✅ PASS | Mobile-first design, Arabic UI, Cairo font, RTL layout throughout |
| VI | Single Responsibility & Clean Code | ✅ PASS | Modular JS files per constitution architecture, constants.js for shared values |
| VII | Testable Pure Logic | ✅ PASS | Pure functions for cart, pricing, WhatsApp, slugs with Vitest/assert tests |
| VIII | Soft-Delete by Default | ✅ PASS | `deleted_at` column on sections and products, no hard-delete |

**Gate Result**: ✅ ALL PASS — no violations, proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-house-ecommerce-store/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── data-access-api.md
│   ├── cart-state.md
│   ├── whatsapp-message.md
│   └── url-routing.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
public/
├── assets/
│   ├── house-hero.svg              # Coded isometric house (12 zones + entrance)
│   ├── house-coordinates.json      # Zone center coordinates (cx, cy) for JS overlay positioning
│   └── icons/                      # Flat design section icons (one per section)
src/
├── pages/
│   ├── index.html                  # Homepage (house hero + section overlays)
│   ├── category.html               # Product listing (query: ?section={slug})
│   ├── product.html                # Product detail + variant switcher (query: ?id={id})
│   ├── cart.html                   # Cart review + WhatsApp checkout + copy fallback
│   └── admin/
│       ├── login.html              # Merchant authentication
│       ├── dashboard.html          # Admin landing page
│       ├── sections.html           # Sections CRUD
│       └── products.html           # Products + variants CRUD
├── js/
│   ├── supabase-client.js          # Supabase SDK initialization
│   ├── constants.js                # Shared constants (palette, table names, config)
│   ├── utils.js                    # Shared helpers (price formatting, slug gen, etc.)
│   ├── cart.js                     # Cart state management (localStorage, guest-only)
│   ├── house-interactions.js       # Door click, zone hover/click, CSS transitions
│   ├── sections-api.js             # Data-access layer: sections (Supabase queries)
│   ├── products-api.js             # Data-access layer: products + variants (Supabase queries)
│   ├── settings-api.js             # Data-access layer: merchant settings (Supabase queries)
│   ├── image-compressor.js         # Client-side canvas-based image compression
│   └── admin/
│       ├── sections-crud.js        # Admin sections management logic
│       └── products-crud.js        # Admin products + variants management logic
├── css/
│   ├── tokens.css                  # Design tokens: colors, spacing, typography, Cairo font
│   ├── house.css                   # House hero SVG styles, zone transitions, door animation
│   ├── store.css                   # Storefront pages (category, product, cart)
│   └── admin.css                   # Admin panel styles
supabase/
├── migrations/                     # SQL schema migrations (sections, products, variants, settings)
└── seed/                           # Seed data (12 initial sections, merchant settings)
tests/
├── cart.test.js                    # Cart total calculation, add/remove/update
├── whatsapp.test.js                # WhatsApp message generation, URL encoding
├── slug.test.js                    # Slug generation and validation
└── variants.test.js                # Variant selection logic, price inheritance
```

**Structure Decision**: Follows the constitution's Repository & Architecture Structure (§ Repository & Architecture Structure) exactly. Added `image-compressor.js` for the client-side compression requirement (FR-028) and `house-coordinates.json` for the SVG zone coordinate export (Constitution III). No deviation from the locked structure.

## Complexity Tracking

> No constitution violations detected — this table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
