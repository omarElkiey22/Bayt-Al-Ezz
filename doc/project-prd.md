# Product Requirements Document — House-Concept E-commerce Store

> Companion document to `project-constitution.md`. The constitution defines
> principles, tech stack, and code-quality rules; this document defines
> **every feature** in full product detail — user flows, UI states, edge
> cases, and acceptance criteria — so speckit can generate accurate specs
> and tasks without guessing.

---

## 1. Executive summary

A mobile-first, Arabic (RTL) e-commerce storefront for a general household/
fashion retailer. The signature experience is a "house" homepage: the
customer clicks a front door, the house opens to reveal 12 themed sections
(rooms), each mapping to a product category. Customers build a cart and
check out by sending their order via WhatsApp — no online payment, no
customer accounts. A merchant admin panel manages sections and products,
including grouping similar items into one listing with a variant switcher.

## 2. Target users

- **Primary (storefront):** everyday consumers, Arabic-speaking, majority on
  mobile devices, browsing casually rather than searching with intent —
  the house/room metaphor is meant to make browsing feel like exploring,
  not filling out a form.
- **Secondary (admin panel):** the merchant/business owner — non-technical,
  needs a simple CRUD interface, not a developer tool.

## 3. Tech stack recap

Vanilla HTML/CSS/JS frontend, Supabase (Postgres + Auth + Storage) backend,
Vercel hosting, coded SVG for the house hero (not AI-generated image), Cairo
font, RTL throughout. Full architecture detail lives in `project-constitution.md`.

---

## 4. Information architecture / user journey

```
Homepage (house exterior, door glowing)
   |
   v (click door)
House interior (12 clickable sections)
   |
   v (click a section)
Category listing page (products in that section, grouped by parent product)
   |
   v (click a product)
Product detail page (images, description, variant switcher, add to cart)
   |
   v (add to cart, repeat browsing as needed)
Cart page (review items, quantities, variants)
   |
   v (Send via WhatsApp)
WhatsApp opens with pre-filled order message -> conversation continues with the merchant
```

Admin panel is a fully separate authenticated area, not linked from the
public storefront navigation.

---

## 5. Feature: Homepage hero — the house

### 5.1 User story
As a visitor, I land on the homepage and see an inviting isometric house.
I click the front door and the house "opens" to show 12 sections I can
browse.

### 5.2 Visual/technical spec (locked — do not regenerate as an AI image)

Built as **coded SVG** (or a component wrapping inline SVG), not an
AI-generated raster image, so all 12 zones are guaranteed to exist and be
precisely clickable.

- Canvas: `viewBox="0 0 1200 900"`, transparent background, isometric
  projection (2:1 diamond grid, ~30° pseudo-isometric), house centered with
  generous negative space.
- Exactly 12 `<g>` groups, one per section, each with a stable, unique id
  (`zone-1-laundry` ... `zone-12-cleaning` — see §5.4 for the full id map).
  Arranged on a real coordinate grid (3x4 or 4x3), not randomly placed.
- Each zone group contains:
  1. A floor-tile shape (rounded isometric parallelogram, ~180x140px).
  2. A back-wall shape, 10–15% darker than the floor tile (same hue, no
     black shadows) for cutaway depth.
  3. An empty icon-slot placeholder (~60x60px, centered) — left empty in the
     SVG; the actual icon + text label is overlaid via HTML/CSS on top so it
     stays real, accessible, SEO-friendly, and independently editable text
     (not baked into the graphic).
  4. A subtle divider stroke (`#75777E` at ~40% opacity) between neighboring
     zones.
- No text, numbers, or labels drawn inside the SVG itself — ever.
- A separate, larger door element, `id="main-entrance-cta"`, Primary Blue
  (`#0056B3`), rounded top corners, with a soft glow (SVG `<filter>` with
  `feGaussianBlur`, low-opacity Primary Blue halo) marking it as the main CTA.
- Icon-slot center coordinates (cx, cy) for all 12 zones + the entrance are
  exported as a JSON/JS array alongside the SVG so click handlers and icon
  overlay positioning are done in JS without re-parsing SVG geometry.

### 5.3 Per-zone visual differentiation (hardcoded, not left to guesswork)

| Zone | Differentiation detail |
|---|---|
| Women's section (نص الدنيا) | All corners extra-rounded; back-wall top edge is a soft bezier curve (not straight) — reads "elegant/soft" |
| Men's section (جنتلمان) | Sharp angular straight-line back-wall, more pronounced dark edge stroke in Secondary Navy — reads "structured/sharp" |
| Baby zone (بيبي زون) | Fully rounded, blob-like tile edges — the softest corners of all 12 zones |
| Garage (الجراج) | Includes an actual segmented garage-door shape: 3–4 horizontal panel lines in Secondary Navy, positioned at one edge of the house |
| Pharmacy → now "التسريحة" (vanity) | See §5.4 change log — icon and treatment updated |
| Reception (الريسبشن) | Largest tile of the 12, positioned adjacent to the main entrance |
| All other zones | Standard rounded tile with a subtle motif (shelf lines, division lines) per the base spec — no literal furniture icons baked into the SVG itself |

### 5.4 Section list, slugs, and icons (current approved — 12 total)

> This table is the **initial seed data** for the `sections` table (§10),
> not a hardcoded app constant — sections must remain fully editable from
> the admin panel (see §9).

| # | Section (Arabic) | Slug | Icon (Flat Design, matches brand palette) |
|---|---|---|---|
| 1 | الغسالة | `laundry` | Washing machine |
| 2 | رفايع المطبخ | `kitchen-shelving` | Kitchen shelf with jars/utensils |
| 3 | ورقيات | `paper-goods` | Foil roll / stretch wrap / paper roll (not a document/paper sheet icon) |
| 4 | بيت الراحة | `bathroom` | Simple bathroom icon |
| 5 | نص الدنيا | `women` | Elegant female head silhouette |
| 6 | جنتلمان | `men` | Razor or simple necktie |
| 7 | الريسبشن | `reception` | Reception desk / bell |
| 8 | بيبي زون | `baby` | Baby bottle or simple toy |
| 9 | الجزامة | `footwear` | Shoe |
| 10 | التسريحة | `vanity` | Vanity/dressing-table icon (hairbrush + mirror motif) |
| 11 | الجراج | `garage` | Simple car front view or garage door |
| 12 | منظفات | `cleaning` | Spray bottle + cloth |

**Change log:** section 10 was originally "الصيدلية" (pharmacy, pill icon) —
the client renamed it to "التسريحة" (vanity). Icon must be a hairbrush/vanity
motif, not a pill.

### 5.5 UI states
- **Loading:** house SVG should render its static shapes immediately (no
  network dependency for the graphic itself); only the icon/label overlays
  wait on any dynamic data (in case sections were renamed via admin panel —
  see §5.6).
- **Interaction:** hover/tap on a zone gives a visible highlight (scale or
  glow) before navigating, so the click target is confirmed before the page
  changes.
- **Accessibility:** every zone and the entrance door must be reachable via
  keyboard (Tab) and have a proper `aria-label` matching the visible Arabic
  section name.

### 5.6 Dynamic section data (important)
Because the admin panel allows renaming/adding/removing sections (§9), the
homepage must **fetch the current section list from Supabase** to populate
the icon-slot overlays (names + icon URLs), rather than hardcoding the 12
names in the frontend. The 12 `<g>` zone slots in the SVG are the maximum
visual layout; if the merchant adds a 13th section, product/design decisions
about layout must be revisited (out of scope for v1 — flag to the merchant
if they try to exceed 12 from the admin panel).

### 5.7 Acceptance criteria
- [ ] Exactly 12 visually distinct, individually clickable zones render correctly on mobile and desktop.
- [ ] Door element is visually the most prominent element and has a glow effect.
- [ ] No AI-generated raster image is used for the house — SVG only.
- [ ] Zone names/icons pull from live Supabase data, not hardcoded text.
- [ ] Full keyboard navigability and correct `aria-label`s.
- [ ] All colors strictly limited to the palette in §11 — no other hues anywhere.

---

## 6. Feature: Category listing page

### 6.1 User story
As a visitor, after clicking a section (e.g. "جنتلمان"), I see all products
in that section, with similar items already grouped (not shown as separate
duplicate cards).

### 6.2 Behavior
- Products are fetched by section slug.
- **Grouped display rule:** if a product has variants (§7.3), only ONE card
  is shown for the group, using the parent product's primary image/name; the
  variant choice happens on the product detail page, not in the grid.
- Each card shows: primary image, name, starting price (if variants have
  different prices, show "starting from X").
- Grid is responsive: fewer columns on mobile, more on desktop.

### 6.3 UI states
- **Loading:** skeleton cards (not a blank white screen).
- **Empty:** if a section currently has zero active products, show a
  friendly empty state ("لسه مفيش منتجات هنا" + a link back to the house),
  not a broken-looking blank grid.
- **Error:** if the Supabase fetch fails, show a retry option, not a silent
  failure.

### 6.4 Acceptance criteria
- [ ] Similar items never appear as separate duplicate cards in the grid.
- [ ] Inactive/soft-deleted products never appear on the storefront.
- [ ] Empty and error states are handled explicitly, not left blank.

---

## 7. Feature: Product detail page + variant switcher

### 7.1 User story
As a visitor, I open a product and, if it comes in multiple similar
versions (e.g. different color/pattern), I can switch between them on the
same page and see the image/price update — without it being a separate
product listing.

### 7.2 UI behavior
- A swatch/thumbnail row shows all available variants of the current
  product.
- Clicking a variant swatch updates: the main image, the displayed price (if
  variant prices differ), and the "add to cart" action target — all without
  a full page reload.
- If a variant is out of stock, it's visually indicated (e.g. greyed out)
  but still visible/selectable to show it exists (not hidden entirely).
- "Add to cart" always adds the **currently selected variant**, never the
  parent product ambiguously.

### 7.3 Data model implication (see also §10)
- A `products` table holds the shared/parent listing data (name,
  description, section).
- A `product_variants` table holds per-variant data: label (e.g. color or
  pattern name), price (nullable = inherits parent price), image(s), stock
  flag, foreign key to parent.
- The product detail page always resolves to a specific variant selection,
  defaulting to the first available (in-stock) variant.

### 7.4 Acceptance criteria
- [ ] Switching variants never triggers a full page navigation/reload.
- [ ] Out-of-stock variants are visible but not addable to cart.
- [ ] The cart always stores which specific variant was chosen, never just
      the parent product.

---

## 8. Feature: Cart + WhatsApp checkout

### 8.1 User story
As a visitor, I collect products in a cart, review my choices, and send the
final order to the seller via WhatsApp — with no account creation and no
online payment.

### 8.2 Cart behavior
- Cart state persists in `localStorage` (guest cart, no login required).
- Cart page lists: product name, selected variant label, quantity, unit
  price, line subtotal, and a running total.
- Quantity can be adjusted or the item removed directly from the cart page.
- If a cart item references a product/variant that has since been
  soft-deleted or deactivated by the merchant, show a clear notice on that
  line ("المنتج ده مبقاش متاح") rather than silently breaking the total.

### 8.3 WhatsApp handoff
- A prominent "إرسال الطلب عبر واتساب" button builds a `wa.me` deep link
  with a URL-encoded, human-readable summary of the order (product names,
  variants, quantities, total) and opens it in a new tab/app.
- This is the final step of the customer-facing flow — no in-app order
  confirmation/tracking screen beyond a short "تم تجهيز طلبك، كمّل من واتساب"
  message.
- The WhatsApp number is configurable (stored in Supabase or an admin
  setting), not hardcoded in the frontend, so the merchant can update it
  without a code change.

### 8.4 Acceptance criteria
- [ ] Cart persists across page reloads (localStorage) without requiring login.
- [ ] WhatsApp message includes every line item, its variant, quantity, and the total.
- [ ] Stale/deactivated cart items are flagged, not silently dropped or miscalculated.

---

## 9. Feature: Admin panel — sections management

### 9.1 User story
As the merchant, I can add, rename, or remove sections (the 12 "rooms")
without needing a developer.

### 9.2 Behavior
- List view of all current sections (name, slug, icon, active/inactive).
- **Create:** name (Arabic), auto-generated slug (editable), icon (upload
  custom or pick from a preset flat-icon library matching the existing
  style).
- **Edit:** rename, change icon, change slug (warn the merchant that
  changing the slug changes the section's URL — existing shared links would
  break).
- **Delete:** soft-delete only (see constitution §8 rationale — avoids
  breaking existing cart links or shared product URLs). If products are
  still assigned to a section being deleted, the admin must be warned and
  either reassign them or explicitly confirm.
- Drag-to-reorder is a nice-to-have, not a v1 blocker.

### 9.3 Acceptance criteria
- [ ] A newly created section appears on the live storefront homepage without a code deploy.
- [ ] Deleting a section never breaks an existing product's data (soft-delete only).
- [ ] Renaming a section immediately reflects on the homepage overlay text.

---

## 10. Feature: Admin panel — products management

### 10.1 User story
As the merchant, I can add, edit, or remove products and their variants,
and assign them to a section.

### 10.2 Behavior
- List view of all products (filterable by section, searchable by name).
- **Create:** name, description, section (dropdown of live sections),
  images, and one or more **variants** (each variant: label, optional
  price override, image(s), stock flag). A product can be created with a
  single "default" variant if it has no real variants.
- **Edit:** same fields; add/remove variants under the same product entry
  without recreating the product; toggle active/inactive (hides from
  storefront without deleting).
- **Delete:** soft-delete, same rationale as sections.

### 10.3 Acceptance criteria
- [ ] A product with 3 variants shows as exactly one card on the storefront grid.
- [ ] Deactivating a product removes it from the storefront immediately without deleting its data.
- [ ] Admin can add a new variant to an existing product without creating a duplicate product entry.

---

## 11. Design system (from approved brand identity)

```
--primary-blue: #0056B3
--secondary-navy: #1A237E
--tertiary-gray: #9E9E9E
--neutral-gray: #75777E
--base-white: #F8F9FA
```

- No other hues anywhere in the product — no green/red/yellow/orange in
  backgrounds, buttons, badges, or shadows. Shadows are dark tints of
  Secondary Navy, never pure black.
- Typography: **Cairo**, for both headings and body text.
- Button variants (per approved identity sheet): Primary (filled blue),
  Secondary (light/outlined), Inverted (dark bg), Outlined.
- Icon style: flat design, minimal, filled or outlined consistently across
  all 12 section icons plus any UI icons (home, search, user/account,
  edit/pencil, tag, trash) — all icons share the same visual weight and
  corner-rounding as the section icons in §5.4.
- Corner radius: consistently rounded across cards, buttons, and inputs —
  matches the soft-UI aesthetic shown in the approved identity sheet.

---

## 12. Non-functional requirements

- **Mobile-first:** design and test small viewports first; desktop is the
  secondary target, not the primary one.
- **Language/direction:** Arabic-first UI, RTL layout across storefront and
  admin — including mirrored icons/arrows where direction is meaningful.
- **Performance:** no WebGL/3D assets; SVG + CSS/JS only; homepage hero
  must stay lightweight since it's the highest-traffic page.
- **Accessibility:** all interactive elements (house zones, cart controls,
  admin forms) operable via keyboard with correct `aria-label`s.
- **SEO:** section and product names/descriptions are real HTML text (never
  baked into images or canvas), so they're crawlable and indexable.
- **No online payment, no customer accounts** in this phase — explicitly
  out of scope, do not build placeholder UI for either.

---

## 13. Explicit out-of-scope items (do not build in this phase)

- True 3D/WebGL interactive house (superseded by the coded-SVG isometric
  approach in §5 — see constitution §2 for the full rationale).
- Online payment integration of any kind.
- Customer accounts / login (guest checkout via WhatsApp only).
- Multi-merchant or multi-role admin permissions (single merchant role only).
- Support for more than 12 homepage sections without a design revisit.

---

## 14. Cross-reference

For coding standards, clean-code rules, testing requirements, and the
technical file/folder structure, see `project-constitution.md` §3–§4 and
§12 — every feature above must be implemented in line with those rules.
