# Product Requirements Document — Bayt Al-Ezz (v2.0)

> Companion document to the project constitution (`constitution.md`).
> The constitution defines principles, tech stack, and code-quality rules;
> this document defines **every feature** in full product detail — user flows,
> UI states, edge cases, and acceptance criteria — so speckit can generate
> accurate specs and tasks without guessing.
>
> **Last Updated**: 2026-07-15
> **Constitution Version**: 2.0.0

---

## 1. Executive Summary

A mobile-first, Arabic (RTL) e-commerce storefront for a general household /
fashion retailer operating under the brand **"بيت العز" (Bayt Al-Ezz)**.

The signature experience is a **"house" homepage**: when a consumer opens
the website, they see a closed house illustration. The house **automatically
opens** (no user click required) after a brief animation delay, revealing
12 themed sections (rooms), each mapping to a product category. Consumers
build a cart and check out by sending their order via WhatsApp to the
merchant's number **+201555077347** — no online payment, no customer accounts.

A merchant admin panel manages sections (with visual icons) and products
(images are optional), including grouping similar items into one listing
with a variant switcher. The admin panel is secured via Magic Link
authentication, Row-Level Security, rate limiting, and server-side
validation.

---

## 2. Target Users

- **Primary (storefront):** everyday consumers, Arabic-speaking, majority on
  mobile devices, browsing casually rather than searching with intent —
  the house/room metaphor is meant to make browsing feel like exploring,
  not filling out a form.
- **Secondary (admin panel):** the merchant/business owner — non-technical,
  needs a simple CRUD interface, not a developer tool. Cannot identify icons
  by filename — needs visual previews.

---

## 3. Tech Stack Recap

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (no framework, no bundler) |
| Backend / Database | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Hosting | Vercel (static deployment) |
| Homepage Hero | Two client-designed SVGs: `Frame 1.svg` → `Frame 2.svg` (auto-animation) |
| Authentication | Supabase Magic Link (passwordless email login) |
| Font | Cairo (Arabic-first) |
| Layout | RTL throughout |
| Planning | Spec-Kit (spec → plan → tasks → implement) |

Full architecture detail lives in `constitution.md` (v2.0.0).

---

## 4. Information Architecture / User Journey

```
Homepage
  ├─ Phase 1: Consumer sees closed house (Frame 1.svg)
  │
  ├─ Phase 2: House auto-opens after ~2 seconds (Frame 2.svg)
  │            12 clickable section zones appear
  │
  ├─ Consumer clicks a section zone
  │
  ▼
Category Listing Page
  ├─ Products in that section (grouped by parent product)
  │
  ├─ Consumer clicks a product card
  │
  ▼
Product Detail Page
  ├─ Images (optional), description, variant switcher, "Add to Cart"
  │
  ├─ Consumer adds to cart, continues browsing
  │
  ▼
Cart Page
  ├─ Review items, adjust quantities, see totals
  │
  ├─ Consumer clicks "إرسال الطلب عبر واتساب"
  │
  ▼
WhatsApp opens with pre-filled order message → +201555077347
  └─ Conversation continues with the merchant
```

Admin panel is a **fully separate authenticated area**, not linked from the
public storefront navigation.

---

## 5. Feature: Homepage Hero — The Auto-Opening House

### 5.1 User Story

**As a visitor**, I land on the homepage and see an inviting house illustration.
Without clicking or tapping anything, the house **automatically opens** after
a short delay, revealing 12 themed shopping sections I can browse.

> **UPDATED (v2.0)**: The client changed the requirement. Previously, the user
> had to click the front door to open the house. Now, the house opens
> **automatically** — the consumer should NOT have to interact to see the
> sections.

### 5.2 Visual / Technical Spec

The homepage hero uses **two client-designed SVG files** for a two-phase
animation. No AI-generated raster images — only the client-provided SVGs.

#### Phase 1 — Closed House (`Frame 1.svg`)

When the consumer first loads the homepage, they see the house in its
closed state:

- `viewBox="0 0 2048 2048"`, white background
- Triangular navy roof (`#1C1F53`)
- Main rectangular house body with border (`#164D85`)
- A prominent blue door (`#06529E`) with a golden doorknob (`#EFB42A`)
- Four interior window/room panels visible through the front wall
- File location: `public/assets/Frame 1.svg`

#### Phase 2 — Open House (`Frame 2.svg`)

After a short timed delay (**1.5–2.5 seconds**), the house automatically
transitions to reveal the interior layout:

- Same `viewBox="0 0 2048 2048"`, same roof and house structure
- Interior is divided into a **4-column × 3-row grid** of 12 section zones
- Each zone contains a **detailed, hand-drawn category illustration**
  (person icons, appliance drawings, product sketches, etc.)
- Zones are separated by navy-blue divider lines (`#164D85`, 21px stroke)
- Vertical dividers at x≈537, x≈1018, x≈1499
- Horizontal dividers at y≈1040, y≈1511
- File location: `public/assets/Frame 2.svg`

#### Animation Requirements

- The transition from Frame 1 to Frame 2 MUST be **smooth** (e.g., CSS
  fade, slide, or morph animation) to give a "door opening" feeling.
- The consumer MUST NOT be required to click, tap, or interact.
- After the house is fully open, each of the 12 section zones becomes
  **clickable**, navigating to the corresponding category page.

### 5.3 Section List, Slugs, and Icons (12 total)

> This table is the **initial seed data** for the `sections` table,
> not a hardcoded app constant — sections MUST remain fully editable
> from the admin panel (see §9).

| # | Section (Arabic) | Slug | Icon Description |
|---|---|---|---|
| 1 | الغسالة | `laundry` | Washing machine |
| 2 | رفايع المطبخ | `kitchen-shelving` | Kitchen shelf with jars/utensils |
| 3 | ورقيات | `paper-goods` | Foil roll / stretch wrap / paper roll |
| 4 | بيت الراحة | `bathroom` | Simple bathroom icon |
| 5 | نص الدنيا | `women` | Elegant female head silhouette |
| 6 | جنتلمان | `men` | Razor or simple necktie |
| 7 | الريسبشن | `reception` | Reception desk / bell |
| 8 | بيبي زون | `baby` | Baby bottle or simple toy |
| 9 | الجزامة | `footwear` | Shoe |
| 10 | التسريحة | `vanity` | Vanity/dressing-table (hairbrush + mirror) |
| 11 | الجراج | `garage` | Simple car or garage door |
| 12 | منظفات | `cleaning` | Cleaning spray bottle |

**Change log:** section 10 was originally "الصيدلية" (pharmacy, pill icon) —
the client renamed it to "التسريحة" (vanity). Icon MUST be a hairbrush/vanity
motif, not a pill.

### 5.4 Dynamic Section Data

Because the admin panel allows renaming/adding/removing sections (§9), the
homepage MUST **fetch the current section list from Supabase** to populate
the icon/label overlays on top of Frame 2, rather than hardcoding the 12
names in the frontend.

The 12 zone slots in the SVG grid are the maximum visual layout; if the
merchant adds a 13th section, a design revisit is needed (out of scope for
v1 — flag it to the merchant if they try to exceed 12 from the admin panel).

### 5.5 UI States

- **Loading:** Frame 1 SVG renders immediately (no network dependency for
  the graphic itself); icon/label overlays wait on Supabase data.
- **Auto-open animation:** after data is loaded AND a minimum 1.5s delay,
  transition to Frame 2 with section name overlays.
- **Interaction:** hover/tap on a zone gives a visible highlight (scale or
  glow) before navigating.
- **Accessibility:** every zone MUST be reachable via keyboard (Tab) and
  have a proper `aria-label` matching the visible Arabic section name.

### 5.6 Acceptance Criteria

- [ ] Consumer sees the closed house (Frame 1) on page load.
- [ ] House auto-opens to Frame 2 after ~2 seconds without any user interaction.
- [ ] The transition animation is smooth (fade, slide, or morph).
- [ ] Exactly 12 individually clickable zones render correctly on mobile and desktop.
- [ ] No AI-generated raster image is used — client SVGs only.
- [ ] Zone names/icons pull from live Supabase data, not hardcoded text.
- [ ] Full keyboard navigability and correct `aria-label`s.
- [ ] All colors strictly limited to the design token palette.
- [ ] The deprecated `house-hero.svg` file is NOT used anywhere.

---

## 6. Feature: Category Listing Page

### 6.1 User Story

**As a visitor**, after clicking a section (e.g. "جنتلمان"), I see all
products in that section, with similar items already grouped (not shown as
separate duplicate cards).

### 6.2 Behavior

- Products are fetched by section slug.
- **Grouped display rule:** if a product has variants (§7.3), only ONE card
  is shown for the group, using the parent product's primary image/name; the
  variant choice happens on the product detail page, not in the grid.
- Each card shows: primary image (or placeholder if none — see §10.4),
  name, starting price (if variants have different prices, show
  "يبدأ من X ج.م").
- Grid is responsive: fewer columns on mobile, more on desktop.

### 6.3 UI States

- **Loading:** skeleton cards (not a blank white screen).
- **Empty:** if a section currently has zero active products, show a
  friendly empty state ("لسه مفيش منتجات هنا" + a link back to the house),
  not a broken-looking blank grid.
- **Error:** if the Supabase fetch fails, show a retry option, not a silent
  failure.

### 6.4 Acceptance Criteria

- [ ] Similar items never appear as separate duplicate cards in the grid.
- [ ] Inactive/soft-deleted products never appear on the storefront.
- [ ] Products without images display a tasteful placeholder, not broken `<img>`.
- [ ] Empty and error states are handled explicitly, not left blank.

---

## 7. Feature: Product Detail Page + Variant Switcher

### 7.1 User Story

**As a visitor**, I open a product and, if it comes in multiple similar
versions (e.g. different color/pattern), I can switch between them on the
same page and see the image/price update — without it being a separate
product listing.

### 7.2 UI Behavior

- A swatch/thumbnail row shows all available variants of the current product.
- Clicking a variant swatch updates: the main image, the displayed price (if
  variant prices differ), and the "add to cart" action target — all without
  a full page reload.
- If a variant is out of stock, it's visually indicated (e.g. greyed out)
  but still visible/selectable to show it exists (not hidden entirely).
- "Add to cart" always adds the **currently selected variant**, never the
  parent product ambiguously.
- Products without images show a styled brand placeholder.

### 7.3 Data Model

- A `products` table holds the shared/parent listing data (name,
  description, section). **Image columns are nullable** (see §10.4).
- A `product_variants` table holds per-variant data: variant label
  (color/pattern), price override (nullable = inherits parent price),
  image(s) (nullable), stock/availability flag, FK to parent product.
- The product detail page always resolves to a specific variant selection,
  defaulting to the first available (in-stock) variant.

### 7.4 Acceptance Criteria

- [ ] Switching variants never triggers a full page navigation/reload.
- [ ] Out-of-stock variants are visible but not addable to cart.
- [ ] The cart always stores which specific variant was chosen, never just
      the parent product.

---

## 8. Feature: Cart + WhatsApp Checkout

### 8.1 User Story

**As a visitor**, I collect products in a cart, review my choices, and send
the final order to the seller via WhatsApp — with no account creation and
no online payment.

### 8.2 Cart Behavior

- Cart state persists in `localStorage` (guest cart, no login required).
- Cart page lists: product name, selected variant label, quantity, unit
  price, line subtotal, and a running total.
- Quantity can be adjusted or the item removed directly from the cart page.
- If a cart item references a product/variant that has since been
  soft-deleted or deactivated by the merchant, show a clear notice on that
  line ("المنتج ده مبقاش متاح") rather than silently breaking the total.

### 8.3 WhatsApp Handoff

- A prominent "إرسال الطلب عبر واتساب" button builds a `wa.me` deep link
  with a URL-encoded, human-readable summary of the order (product names,
  variants, quantities, total) and opens it in a new tab/app.
- **WhatsApp number: `+201555077347`** — this is the fixed merchant number.
  It MUST be stored in a configurable location (e.g., `constants.js` or a
  Supabase `settings` table) so it can be updated without code changes, but
  the initial value MUST be `+201555077347`.
- This is the final step of the customer-facing flow — no in-app order
  confirmation/tracking screen beyond a short "تم تجهيز طلبك، كمّل من واتساب"
  message.

### 8.4 Acceptance Criteria

- [ ] Cart persists across page reloads (localStorage) without requiring login.
- [ ] WhatsApp message includes every line item, its variant, quantity, and the total.
- [ ] WhatsApp link opens a chat with `+201555077347`.
- [ ] Stale/deactivated cart items are flagged, not silently dropped or miscalculated.

---

## 9. Feature: Admin Panel — Sections Management

### 9.1 User Story

**As the merchant**, I can add, rename, or remove sections (the 12 "rooms")
and **change their icons** without needing a developer.

### 9.2 Behavior

- List view of all current sections (name, slug, icon preview, active/inactive).
- **Create:** name (Arabic), auto-generated slug (editable), icon (pick from
  **visual icon picker** — see §9.4).
- **Edit:** rename, change icon (with visual preview), change slug (warn the
  merchant that changing the slug changes the section's URL — existing shared
  links would break).
- **Delete:** soft-delete only (see constitution §VIII rationale — avoids
  breaking existing cart links or shared product URLs). If products are
  still assigned to a section being deleted, the admin must be warned and
  either reassign them or explicitly confirm.
- Drag-to-reorder is a nice-to-have, not a v1 blocker.

### 9.3 Admin Authentication (Magic Link)

- The admin panel MUST use **Supabase Magic Link** authentication
  (passwordless email login). No traditional username/password flow.
- Only authenticated users with the merchant role can access `/admin/*`.
- See §12 (Security) for full details.

### 9.4 Visual Icon Picker (NEW — client requirement)

> **IMPORTANT**: The client explicitly requested that icons MUST be displayed
> as **visual thumbnails** in the admin panel — NOT as filenames like
> `kitchen.svg`. The merchant is non-technical and cannot identify icons by
> filename alone.

The icon selection interface MUST:

1. Display each available icon as a **small visual thumbnail** (rendered
   inline SVG or `<img>` tag) so the admin can see the actual shape.
2. Source the available icon designs from `public/assets/Frame 3.svg`, which
   is the same as Frame 2.svg but includes an additional section with its
   icon as a design reference.
3. Store selected icon references in the `sections` table so the storefront
   can fetch and display them dynamically.
4. Show the currently selected icon next to each section in the list view.

### 9.5 Acceptance Criteria

- [ ] A newly created section appears on the live storefront homepage without
      a code deploy.
- [ ] Deleting a section never breaks an existing product's data (soft-delete only).
- [ ] Renaming a section immediately reflects on the homepage overlay text.
- [ ] The icon picker shows visual thumbnails, NOT filenames.
- [ ] The admin can change a section's icon and see it update on the storefront.
- [ ] Admin login uses Magic Link only — no username/password form exists.

---

## 10. Feature: Admin Panel — Products Management

### 10.1 User Story

**As the merchant**, I can add, edit, or remove products and their variants,
and assign them to a section. I do **NOT** have to upload an image — it is
optional.

### 10.2 Behavior

- List view of all products (filterable by section, searchable by name).
- **Create:** name, description, section (dropdown of live sections),
  images (**optional** — the product can be saved without uploading any
  image), and one or more **variants** (each variant: label, optional price
  override, image(s) — also optional, stock flag). A product can be created
  with a single "default" variant if it has no real variants.
- **Edit:** same fields; add/remove variants under the same product entry
  without recreating the product; toggle active/inactive (hides from
  storefront without deleting).
- **Delete:** soft-delete, same rationale as sections.

### 10.3 Product Variants Data Model

- `products` table holds the parent listing (shared name, description, section).
  Image columns are **nullable**.
- `product_variants` table holds per-variant data: variant label (color/pattern),
  price override (nullable = inherits parent price), image(s) (nullable),
  stock/availability flag, FK to parent product.
- Product detail page renders a swatch/thumbnail selector; variant switching
  updates image/price without full page reload.
- Admin product form MUST support adding/removing variants under a single
  product entry.

### 10.4 Product Image Optionality (NEW — client requirement)

> **IMPORTANT**: Product images are NOT mandatory. The client explicitly
> requested that the admin should be able to create and save a product
> without uploading any image.

- The product form MUST NOT block submission if no image is provided.
- On the storefront, products without images MUST display a **tasteful
  placeholder graphic** (e.g., a styled brand-colored icon or "no image
  available" card) rather than a broken `<img>` tag or blank space.
- The `products` and `product_variants` tables MUST allow **NULL** values
  for image columns.

### 10.5 Acceptance Criteria

- [ ] A product with 3 variants shows as exactly one card on the storefront grid.
- [ ] Deactivating a product removes it from the storefront immediately without
      deleting its data.
- [ ] Admin can add a new variant to an existing product without creating a
      duplicate product entry.
- [ ] A product can be created and saved without any image.
- [ ] Products without images show a styled placeholder on the storefront.

---

## 11. Design System (from Approved Brand Identity)

### 11.1 Color Palette (Design Tokens)

```css
--primary-blue:    #0056B3;
--secondary-navy:  #1A237E;
--tertiary-gray:   #9E9E9E;
--neutral-gray:    #75777E;
--base-white:      #F8F9FA;
```

- **No other hues** anywhere in the product — no green/red/yellow/orange in
  backgrounds, buttons, badges, or shadows.
- Shadows are dark tints of Secondary Navy, never pure black.

### 11.2 Typography

- **Font:** Cairo (Google Fonts), for both headings and body text.
- Arabic-first; the font must support Arabic character rendering properly.

### 11.3 Button Variants

Per the approved identity sheet:
- **Primary:** filled blue (`#0056B3`)
- **Secondary:** light/outlined
- **Inverted:** dark background
- **Outlined:** border only

### 11.4 Icon Style

- Flat design, minimal, filled or outlined consistently across all 12
  section icons plus any UI icons (home, search, user/account, edit/pencil,
  tag, trash).
- All icons share the same visual weight and corner-rounding as the section
  icons.
- Icons MUST be rendered visually in the admin panel (see §9.4).

### 11.5 Corner Radius

Consistently rounded across cards, buttons, and inputs — matches the soft-UI
aesthetic shown in the approved identity sheet.

---

## 12. Feature: Security (NEW in v2.0)

### 12.1 User Story

**As the system**, I ensure that the admin panel is protected from
unauthorized access, data manipulation, and automated abuse, using
industry-standard security practices.

### 12.2 Authentication — Magic Link

- Admin panel access MUST use **Supabase Magic Link** authentication
  (passwordless email login).
- No traditional username/password flow exists.
- Only authenticated users with the merchant role can access admin
  routes (`/admin/*`).
- Session tokens MUST be validated on every admin API call.
- Expired or invalid sessions redirect to the login page.

### 12.3 Rate Limiting

- All public-facing endpoints and form submissions MUST be protected by
  rate limiting to prevent abuse.
- Implement **client-side throttling** for repeated actions (e.g., add to
  cart button, WhatsApp send button).
- **Server-side rate limiting** SHOULD be applied via Supabase Edge
  Functions or Vercel middleware when available.

### 12.4 Row-Level Security (RLS)

- All Supabase tables MUST have RLS policies enabled — **no exceptions**.
- Storefront queries (public read) MUST be restricted to active,
  non-deleted records only.
- Admin write operations (insert, update, delete) MUST require a valid
  authenticated session with the merchant role.
- No table should ever be accessible without an RLS policy — even if
  the policy is "allow public read."

### 12.5 Server-Side Validation

- All data submitted by admin forms (section names, product data, prices,
  images) MUST be validated server-side (via Supabase RLS policies,
  database constraints, and/or Edge Functions).
- Client-side validation is for UX convenience only — it MUST NOT be
  the sole line of defense.
- Input sanitization MUST be applied to prevent XSS and injection attacks.

### 12.6 Acceptance Criteria

- [ ] Admin login works exclusively via Magic Link — no password form exists.
- [ ] Invalid or expired sessions redirect to login.
- [ ] All Supabase tables have RLS policies enabled.
- [ ] Public queries can only read active, non-deleted records.
- [ ] Admin write operations require authenticated merchant session.
- [ ] Rapid repeated form submissions are throttled client-side.
- [ ] All admin form inputs are validated server-side (not just client-side).
- [ ] HTML/script injection in admin form fields is blocked.

---

## 13. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| **Mobile-first** | House hero and all pages tested on small viewports first; desktop is the secondary target. |
| **Arabic-first / RTL** | Entire UI in Arabic, RTL layout across storefront and admin — including mirrored icons/arrows where direction is meaningful. |
| **Performance** | No heavy 3D/WebGL assets; SVG + CSS/JS only; homepage hero must stay lightweight since it's the highest-traffic page. |
| **Accessibility** | All 12 zones + all interactive elements operable via keyboard with correct `aria-label`s. Section names are real HTML text overlays. |
| **SEO** | Category and product pages MUST have real, crawlable text content — section names, product names/descriptions are HTML, not images. |
| **Security** | Magic Link auth, RLS on all tables, rate limiting, server-side validation — all non-negotiable (see §12). |
| **No online payment** | Explicitly out of scope for this phase. |
| **No customer accounts** | Guest checkout via WhatsApp only. |

---

## 14. Database Schema Overview

### 14.1 `sections` Table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `name` | TEXT | Arabic section name |
| `slug` | TEXT (unique) | URL-safe identifier |
| `icon_ref` | TEXT (nullable) | Reference to icon asset |
| `sort_order` | INTEGER | Display order |
| `is_active` | BOOLEAN | Soft-delete flag |
| `deleted_at` | TIMESTAMP (nullable) | Null = not deleted |
| `created_at` | TIMESTAMP | Auto-set |
| `updated_at` | TIMESTAMP | Auto-updated |

### 14.2 `products` Table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `name` | TEXT | Product name |
| `description` | TEXT (nullable) | Product description |
| `section_id` | UUID (FK → sections) | Assigned section |
| `primary_image` | TEXT (nullable) | **Optional** — can be NULL |
| `base_price` | DECIMAL | Base price (overridable per variant) |
| `is_active` | BOOLEAN | Active/inactive toggle |
| `deleted_at` | TIMESTAMP (nullable) | Soft-delete |
| `created_at` | TIMESTAMP | Auto-set |
| `updated_at` | TIMESTAMP | Auto-updated |

### 14.3 `product_variants` Table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `product_id` | UUID (FK → products) | Parent product |
| `label` | TEXT | Variant name (color, pattern, etc.) |
| `price_override` | DECIMAL (nullable) | Null = inherits parent price |
| `image` | TEXT (nullable) | **Optional** — can be NULL |
| `is_in_stock` | BOOLEAN | Stock availability |
| `sort_order` | INTEGER | Display order in swatch row |
| `created_at` | TIMESTAMP | Auto-set |

### 14.4 RLS Policies (Required)

| Table | Public Read | Admin Write |
|---|---|---|
| `sections` | Active + non-deleted only | Authenticated merchant |
| `products` | Active + non-deleted only | Authenticated merchant |
| `product_variants` | Via parent product join | Authenticated merchant |

---

## 15. Repository & Architecture Structure

```
/public
  /assets
    Frame 1.svg                 — closed house (Phase 1 of hero animation)
    Frame 2.svg                 — open house with 12 section zones (Phase 2)
    Frame 3.svg                 — reference design for sections with icons
    house-coordinates.json      — zone coordinate map for overlay positioning
    icons/                      — flat icons, one per section
/src
  /pages
    index.html                  — homepage (two-phase house hero animation)
    category.html               — product listing (query param: section slug)
    product.html                — single product detail + variant switcher
    cart.html                   — cart review + "Send via WhatsApp" action
    /admin
      login.html                — Magic Link login page
      dashboard.html
      sections.html             — CRUD for sections (with visual icon picker)
      products.html             — CRUD for products (image is OPTIONAL)
  /js
    supabase-client.js          — Supabase SDK initialization
    constants.js                — shared constants (palette, table names, WhatsApp number)
    utils.js                    — shared helpers (price formatting, slug gen, etc.)
    cart.js                     — cart state (localStorage, guest-only)
    house-interactions.js       — auto-open animation, zone click, navigation
    sections-api.js             — data-access layer for sections
    products-api.js             — data-access layer for products
    image-compressor.js         — client-side image compression
    admin/
      sections-crud.js          — sections admin logic + icon picker
      products-crud.js          — products admin logic
  /css
    tokens.css                  — design tokens: colors, spacing, typography
    house.css                   — house hero animation styles
    store.css                   — storefront pages
    admin.css                   — admin panel
/supabase
  /migrations                  — SQL schema migrations (includes RLS policies)
  /seed                        — seed data for the 12 sections
/tests
  cart.test.js                  — cart total, add/remove/update
  whatsapp.test.js              — message generation (includes +201555077347)
  slug.test.js                  — slug generation
  variants.test.js              — variant selection logic
/doc
  project-prd.md                — this file (comprehensive project PRD v2.0)
```

**Deprecated files** (do NOT use):
- `public/assets/house-hero.svg` — replaced by Frame 1.svg + Frame 2.svg

---

## 16. SVG Asset Reference

### 16.1 Frame 1.svg (Closed House)

- **Purpose:** Phase 1 of the homepage hero — the first thing the consumer sees.
- **Content:** Flat-front house with navy roof, blue door with golden knob,
  four window/room panels.
- **ViewBox:** `0 0 2048 2048`
- **Key colors:** Roof `#1C1F53`, Door `#06529E`, Knob `#EFB42A`,
  Border `#164D85`

### 16.2 Frame 2.svg (Open House — 12 Sections)

- **Purpose:** Phase 2 — the house interior with 12 clickable section zones.
- **Content:** Same house structure, interior divided into 4×3 grid with
  detailed hand-drawn illustrations per section.
- **ViewBox:** `0 0 2048 2048`
- **Grid lines:** Navy-blue (`#164D85`, 21px stroke)
- **Zone count:** 12 (each with clip-path groups for illustrations)

### 16.3 Frame 3.svg (Sections with Icons Reference)

- **Purpose:** Design reference for admin icon picker. Identical to Frame 2
  but includes an **additional section with its icon** as a design example.
- **Usage:** Extract individual icon shapes from this file for the admin
  panel's visual icon picker.

---

## 17. Explicitly Out of Scope (This Phase)

- True 3D/WebGL interactive house (superseded by two-phase SVG animation).
- Online payment integration of any kind.
- Customer accounts / login (guest checkout via WhatsApp only).
- Multi-merchant or multi-role admin permissions (single merchant role only).
- Support for more than 12 homepage sections without a design revisit.
- Traditional password-based admin login (Magic Link only).

---

## 18. Change Log

| Date | Version | Changes |
|---|---|---|
| 2026-07-14 | 1.0.0 | Initial PRD — single SVG house with door-click interaction |
| 2026-07-15 | 2.0.0 | **Client-requested changes:** (1) Auto-opening house (Frame 1 → Frame 2, no click required), (2) Admin section icon management with visual previews from Frame 3, (3) Product images made optional, (4) Security hardening added (Magic Link, Rate Limiting, RLS, Server-side validation), (5) WhatsApp number fixed to +201555077347 |

---

## 19. Cross-Reference

| Document | Path | Purpose |
|---|---|---|
| Constitution | `.specify/memory/constitution.md` | Coding principles, tech stack, architecture rules |
| This PRD | `doc/project-prd.md` | Complete feature specification (this file) |
| Feature Specs | `specs/001-house-ecommerce-store/spec.md` | Generated feature spec |
| Implementation Plan | `specs/001-house-ecommerce-store/plan.md` | Implementation plan |
| Tasks | `specs/001-house-ecommerce-store/tasks.md` | Task checklist |

Every feature above MUST be implemented in line with the constitution's
principles — especially Spec-First Development (§I), Security Hardening
(§IX), and Soft-Delete (§VIII).
