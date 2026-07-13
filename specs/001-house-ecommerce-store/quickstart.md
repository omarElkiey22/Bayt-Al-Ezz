# Quickstart & Validation Guide: House-Concept E-commerce Store

**Branch**: `001-house-ecommerce-store` | **Date**: 2026-07-14

This guide outlines setup requirements, local serving instructions, and interactive test scenarios to validate the application end-to-end. Since the project uses a **No-Build-Step Architecture** (Principle II), local setup is lightweight.

---

## 1. Prerequisites
- **Node.js** (v18 or higher) — Only required for running local development server and unit test scripts.
- **Supabase Account** — A Supabase project to host Postgres, Storage, and Auth.
- **Vercel Account** — For hosting the static frontend deployment.

---

## 2. Database Setup

1. Create a new Supabase project.
2. In the Supabase SQL Editor, copy and run the SQL schema definitions from [data-model.md](file:///D:/%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%D8%B9/Bayt%20Al-Ezz/specs/001-house-ecommerce-store/data-model.md#1-table-schemas) to create the tables (`merchant_settings`, `sections`, `products`, `product_variants`).
3. Set up performance indexes and enable Row-Level Security (RLS) policies by executing the SQL in [data-model.md](file:///D:/%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%D8%B9/Bayt%20Al-Ezz/specs/001-house-ecommerce-store/data-model.md#3-row-level-security-rls-policies).
4. Execute the SQL Seed Script from [data-model.md](file:///D:/%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%D8%B9/Bayt%20Al-Ezz/specs/001-house-ecommerce-store/data-model.md#5-seed-data-sql) to initialize the 12 default room-sections.
5. Create a public Supabase Storage bucket named `store-assets` and configure write/upload permissions for `authenticated` users only.
6. Retrieve your Supabase API credentials:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
7. Fill these credentials into `src/js/supabase-client.js`.
8. Create the initial merchant account: Since public sign-ups are disabled, navigate to the **Authentication -> Users** page in your Supabase project dashboard, click **Add User -> Create User**, and input the email and password coordinates which the merchant will use to log into `/admin/login.html`.

---

## 3. Local Development Server

Because we use ES Modules (`type="module"`), files must be served over HTTP rather than opened as raw local files (`file://`).

Start a local static server:
```bash
# Using npm's serve tool
npx serve src/
```
The application will be accessible at: `http://localhost:3000` (or the port indicated by the terminal output).

---

## 4. End-to-End Validation Scenarios

Follow these scenarios to verify that the implementation matches all functional requirements and acceptance criteria:

### Scenario 1: Homepage & Isometric House Opening (FR-001, FR-025)
1. Load `http://localhost:3000/pages/index.html` on a mobile device or responsive inspector (width ~360px).
2. Verify the isometric SVG house renders cleanly, and the Cairo font is correctly loaded.
3. Click the glowing entrance door.
4. **Expected Outcome**: The door plays a subtle scale/open CSS transition, and the 12 section zones fade and slide into view over ~0.5s. Names and icons appear exactly over the center of each room.
5. Press `Tab` and confirm all 12 zones receive focus with a visible border and include correct Arabic `aria-label` tags.

### Scenario 2: Category Listing & Grouping (FR-004, FR-005, FR-024)
1. In the open house homepage, tap the "جنتلمان" (Men's) section.
2. **Expected Outcome**: You are redirected to `/category.html?section=men`.
3. Confirm that similar product listings are grouped (exactly one card per parent product).
4. Verify that products with multiple variant prices display "بداية من X ج.م" with whole numbers and no decimals.
5. Verify cards are sorted by newest first (most recently added appear at the top).

### Scenario 3: Product Detail & Variant Switching (FR-008, FR-009, FR-010)
1. Tap a product card containing multiple variants to open `/product.html?id=[id]`.
2. Confirm all variant thumbnail swatches display.
3. Click a variant swatch.
4. **Expected Outcome**: The primary product photo and price tag update immediately (<200ms) without triggering a page reload.
5. If a variant is out of stock, verify its swatch is greyed out and the "Add to Cart" button is disabled when clicked.

### Scenario 4: Shopping Cart & Checkout (FR-012, FR-026, FR-029)
1. Add 2 distinct product variants to the cart and navigate to `/cart.html`.
2. Verify line items display correctly with product names, variant labels, quantities, unit prices, line subtotals, and total.
3. Refresh the browser page. Confirm the cart items persist.
4. Verify the Arabic checkout section shows the formatted order textarea with the merchant phone number (`tel:` link) and copy button.
5. Click "إرسال الطلب عبر واتساب".
6. **Expected Outcome**: A new browser window launches a `wa.me` URL-encoded link prefilled with the Arabic order details directed to the merchant phone number.

### Scenario 5: Merchant Admin Panel CRUD (FR-017, FR-019, FR-028)
1. Navigate to `/admin/login.html` and sign in using your Supabase Auth merchant credentials.
2. Go to Sections and create a new section. Confirm the URL slug is auto-generated.
3. Go back to storefront homepage. Verify the new section details display correctly.
4. Go to Products, upload an oversized phone-camera photo (e.g. 5MB) for a product image.
5. **Expected Outcome**: The file compresses client-side to <500KB and uploads successfully to Storage without errors.

---

## 5. Running Tests

Run the test suite to validate the pure JS algorithms:
```bash
# Run unit tests using Vitest
npm test
```
The test suite validates:
- Cart quantity adjustment and total calculations (`tests/cart.test.js`)
- WhatsApp text layout and URL encoding (`tests/whatsapp.test.js`)
- Slug generator handling special characters (`tests/slug.test.js`)
- Variant price inheritance behavior (`tests/variants.test.js`)

---

## 6. Vercel Deployment

Deploy the static codebase directly to Vercel:
```bash
# Run Vercel CLI deployment
npx vercel --prod
```
Verify the production domain works correctly.
