# Research: House-Concept E-commerce Store

**Branch**: `001-house-ecommerce-store` | **Date**: 2026-07-14

## 1. Supabase Client-Side SDK Integration in Vanilla JS

**Decision**: 
Initialize the Supabase client-side SDK directly in the browser using the official ES module bundle from a reliable CDN (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm`). Store initialization logic in `src/js/supabase-client.js` and export a single configured `supabase` client instance.

**Rationale**: 
Since the project enforces a strict "no-build-step" principle, we cannot use NPM imports or local bundling. Importing the Supabase SDK as a native ES Module via a modern CDN allows clean, modular JavaScript imports without requiring compile-time tooling.

**Alternatives Considered**:
- *npm install + bundler*: Rejected because it directly violates Principle II (No-Build-Step).
- *Classic script tags (UMD)*: Rejected because standard script tags load Supabase globally (`window.supabase`), which goes against clean modular design (Principle IV) and makes modern module imports more difficult.

---

## 2. SVG Isometric House Construction Patterns

**Decision**:
Implement the isometric house as a hand-drawn SVG component embedded directly in `src/pages/index.html` (viewBox `0 0 1200 900`). The SVG will contain 12 distinct `<g>` groups representing rooms/zones, using pseudo-isometric coordinates (~30-degree angles). The center coordinates of each room will be exported to a static JSON file (`public/assets/house-coordinates.json`) mapping room slugs to coordinate records. A JavaScript module `src/js/house-interactions.js` will fetch this JSON and programmatically overlay HTML elements (Arabic text labels and flat icons) exactly over the centers of the rooms using CSS `position: absolute` and `transform: translate(-50%, -50%)`.

**Rationale**:
Inline SVG allows styling hover states, active transitions, and accessibility hooks (like `tabindex` and `aria-label`) directly on the SVG nodes. Decoupling the text labels and icons from the SVG paths and overlaying them as real HTML elements guarantees perfect rendering of the Cairo font, keeps section names crawlable by search engine bots for SEO, and enables dynamic updates of room names and icons from the database.

**Alternatives Considered**:
- *AI-Generated Raster Image*: Rejected because it violates Principle III and cannot guarantee precise, clickable vector regions.
- *Text baked inside the SVG using `<text>`*: Rejected because font scaling, centering, and RTL support inside SVG elements is inconsistent across mobile browsers compared to standard CSS/HTML positioning.

---

## 3. Client-Side Image Compression

**Decision**:
Create `src/js/image-compressor.js` containing a pure utility function that handles file resizing via the HTML5 Canvas API. When an admin uploads an image, the file is loaded into an in-memory `HTMLImageElement`. If its dimensions or file size exceed limits, a canvas is created to resize the image to a maximum width/height of 1200px while maintaining the aspect ratio, then exported using `canvas.toBlob(blob, 'image/webp', 0.8)` or `image/jpeg`.

**Rationale**:
This client-side resizing allows raw phone photos (often 5MB to 12MB) to be silently and automatically compressed to under 500KB before being uploaded to Supabase Storage. It avoids upload timeouts, saves bandwidth for both the merchant and client, and ensures compliance with the 2MB limit without throwing frustrating validation errors at the merchant. WebP/JPEG format provides high visual quality at low size.

**Alternatives Considered**:
- *Edge Function resizing*: Rejected because it would process the file *after* it was uploaded, meaning large raw uploads would still consume massive bandwidth and trigger slow upload times.
- *Simple size validation (blocking)*: Rejected because rejecting 5MB files with an error message ruins the UX for a non-technical merchant who expects phone camera photos to "just work".

---

## 4. LocalStorage Cart Persistence & Stale Detection

**Decision**:
Use a unified module `src/js/cart.js` that wraps cart access and manipulation, persisting state in `localStorage` under the key `bayt_al_ezz_cart` as an array of items. Each item stores `product_id`, `variant_id`, `variant_label`, `price`, `quantity`, `product_name`, and `variant_image` to support offline operation. To prevent displaying stale data or selling deactivated/soft-deleted items, every time the cart page is loaded, the page will query the products and variants data-access API to check if the items are still active and exist. Any stale item is marked as unavailable ("المنتج ده مبقاش متاح"), disabled from checkout, and excluded from order total calculations.

**Rationale**:
Client-side cart storage eliminates the need for user sessions/accounts, satisfying constraints. Validating item availability on load prevents checkout issues if a merchant soft-deletes a product while a customer is browsing.

**Alternatives Considered**:
- *Database-backed Cart*: Rejected because it requires customer accounts or cookie-based session tracking, which goes against the simple checkout constraints.
- *Silent Removal of Stale Items*: Rejected because silently deleting items from a user's cart without explanation causes user confusion and frustration.

---

## 5. WhatsApp Order Construction & URL Encoding

**Decision**:
Utilize the standard `https://wa.me/{phone}?text={encodedText}` deep linking API to initiate checkout. The formatted message will be generated in Arabic using a standard layout (header with date/time, itemized table of products, variants, quantities, prices, total, and footer). The entire string will be encoded using the native browser `encodeURIComponent()` function to support Arabic characters. A persistent text area showing the exact same formatted text with a "Copy Order" (`navigator.clipboard.writeText`) button and a `tel:` link to the merchant will be positioned alongside the main WhatsApp checkout button.

**Rationale**:
Relying solely on app deep links is risky since desktop browsers or clients without WhatsApp might fail silently. A persistent, always-visible order text box with copy-to-clipboard guarantees a fallback path: the user copies the text, clicks the `tel:` link or dials the number, and completes the transaction manually. Native `encodeURIComponent()` handles Arabic characters correctly.

**Alternatives Considered**:
- *JavaScript Link Failure Detection*: Rejected because modern web browsers block detection of whether a custom URI protocol or external window target successfully launched an app due to security sandbox designs.

---

## 6. Supabase Row-Level Security (RLS) for Admin vs Storefront

**Decision**:
Apply Postgres RLS on all tables:
- `sections`, `products`, `product_variants`, `merchant_settings`:
  - `SELECT` policies: Allow `anon` (public) access with a filter check: `deleted_at IS NULL AND is_active = true` (storefront view). 
  - For the admin dashboard, create an override database view or use Supabase authenticated select queries that bypass the storefront filters but still restrict modifications.
  - `INSERT`, `UPDATE`, `DELETE` policies: Only allow `authenticated` users (the logged-in merchant).
Authentication is handled via Supabase Auth (email/password).

**Rationale**:
Enforcing RLS at the database level prevents unauthorized users from altering products or sections, even if they inspect the client-side JavaScript. It keeps client-side reads simple.

**Alternatives Considered**:
- *No RLS (relying on API route secrecy)*: Rejected because client-side APIs expose keys and endpoint structures, allowing anyone to modify records if RLS is disabled.

---

## 7. RTL CSS Layout Patterns & Cairo Font Integration

**Decision**:
Implement CSS logical properties (`margin-inline-start`, `padding-inline-end`, `border-start-start-radius`) and standard CSS Flexbox/Grid layouts inside `src/css/tokens.css` and page stylesheets. The primary layout container will have the attribute `dir="rtl"` applied to the `<html>` node. The Cairo font family will be integrated globally using font-weight variants 400 (regular), 600 (semi-bold), and 700 (bold).

**Rationale**:
Using CSS logical properties alongside modern Flexbox/Grid automatically handles RTL flow layouts cleanly, preventing the need to write separate stylesheets for different text directions or manually mirror margins.

**Alternatives Considered**:
- *Float layouts with left/right overrides*: Rejected because floats are harder to maintain, less responsive, and require complex override logic for RTL.

---

## 8. Soft-Delete Query Patterns

**Decision**:
In all data-access methods for the storefront (`src/js/sections-api.js` and `src/js/products-api.js`), queries must explicitly include `.is('deleted_at', null)` and `.eq('is_active', true)`. For admin operations, the data-access functions will filter by `.is('deleted_at', null)` but omit the `is_active` filter to allow editing draft products. Soft-delete is performed by setting the `deleted_at` field to the current database timestamp using `UPDATE`.

**Rationale**:
Soft-deleting ensures that if a URL is shared, or saved in a cart, it does not throw database foreign-key constraint crashes or return 404 page errors. Instead, the application layer can gracefully indicate the item is no longer active.

**Alternatives Considered**:
- *Hard Delete with database cascade*: Rejected because it would break existing customer carts (localStorage references) and shared links, violating Principle VIII.
