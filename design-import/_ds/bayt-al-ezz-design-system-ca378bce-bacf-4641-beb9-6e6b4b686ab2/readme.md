# Bayt Al-Ezz — Design System (بيت العز)

Arabic-first, RTL-native design system for **Bayt Al-Ezz**, an Egyptian household-essentials
and cleaning-supplies store. The storefront sells laundry and cleaning powder, trash bags,
food-grade stretch wrap, insulated foil cooler bags, shampoo, soap and shower products, paper
goods and kitchen small-goods — and runs **two pricing modes on the same storefront**: retail
(قطاعي) and wholesale (جملة).

Everything here was read out of the product's real source. Nothing was invented from a screenshot.

## Sources

- **GitHub — primary source:** https://github.com/omarElkiey22/Bayt-Al-Ezz (branch `main`)
  Worth exploring further before designing: the specs folder alone (`specs/001-house-ecommerce-store`,
  `specs/002-v2-storefront-upgrade`, `doc/project-prd.md`) documents intent behind most UI decisions.
  - Tokens: `src/css/tokens.css`, `src/js/constants.js` (PALETTE)
  - Page layouts: `src/pages/{index,category,product,cart}.html`, `src/pages/admin/*.html`
  - Component templates: `src/js/{cart-line-html,section-nav-html,no-results-html,room-label-html,search-bar}.js`,
    `src/js/admin/admin-templates.js`, `src/js/admin/sections-crud.js`
  - Hero behaviour: `src/js/house-interactions.js`, `src/css/house.css`, `public/assets/house-coordinates.json`
  - Pricing modes: `src/js/pricing-mode.js`, `supabase/migrations/006_wholesale_pricing.sql`
  - Data model / real section names: `supabase/migrations/001_initial_schema.sql`, `supabase/seed/001_initial_data.sql`
- **Stack (for context):** vanilla HTML + ES modules + Tailwind via CDN + Supabase. No framework,
  no build step. Tokens live in plain CSS; layout is Tailwind utilities inline in the pages.
- **No Figma file and no design-system definition existed** — the code *is* the design system.
- **No logo file exists in the repo.** The brand mark is the name «بيت العز» set in Cairo type.
  Nothing here draws or approximates a mark. See `guidelines/brand-wordmark.card.html`.

## Product surfaces

| Surface | What it is | Repo |
|---|---|---|
| **Storefront** (customer, Arabic, RTL) | Landing page is an interactive 12-room house floorplan; each room is a category. Category grid → product detail → cart. **No checkout** — the order leaves as a formatted WhatsApp message. | `src/pages/*.html` |
| **Merchant dashboard** (admin) | Password login, stats, sections CRUD (with an icon picker that decides where a room sits in the house), products CRUD with retail + wholesale prices, invoices, customers. | `src/pages/admin/*.html` |
| **Wholesale mode** | Not a separate site: `?pricing=wholesale` (persisted in `sessionStorage`) rewrites hero copy, filters out products with no wholesale price, and recolours every price amber. The merchant shares the link from the dashboard. | `src/js/pricing-mode.js` |

## CONTENT FUNDAMENTALS

**Language.** Arabic first, always. `lang="ar" dir="rtl"` on every page; there is no English UI.
Latin appears only in placeholders (`name@domain.com`) and code.

**Register: warm Egyptian colloquial, not corporate Modern Standard Arabic.** The store talks like
a shopkeeper who knows you. Section names are jokes and household nicknames, not taxonomy:
«نص الدنيا» (women), «جنتلمان» (men), «بيت الراحة» (bathroom), «الجزامة» (shoe rack),
«رفايع المطبخ» (kitchen small-goods), «بيبي زون». Error copy slips fully into dialect:
«حصلت مشكلة في تحميل المنتجات» / «حاول تاني» / «المنتج ده مبقاش متاح حالياً».

**Person.** The store speaks as **نحن** ("we") and addresses the customer as **أنتم/حضرتك** —
plural-polite, never singular-casual: «نسعى أن نقدم لكم منتجات جيدة يحتاجها البيت»,
«وسنعمل على توصيل الطلبات لكم سريعا». The merchant is addressed affectionately in the admin:
«أهلاً بك يا تاجرنا».

**Emoji: yes — deliberately, and only in three places.**
1. Hero copy: one emoji ending each line (😊 🛒 — 🏷️💼✨🚀📦 in wholesale mode).
2. The WhatsApp order message, heavily: 🛒 *طلب جديد من بيت العز* 🏠, numbered items with
   1️⃣2️⃣3️⃣, 📅 📦 🔢 💰 📏 🎨 📌 💵 ✅ and ━━━ rules.
3. Confirmation microcopy inside buttons: «تم ✓», «تمت الإضافة ✓», «تم النسخ ✓».
Emoji never appear in nav, headings, table copy or product names.

**Casing & punctuation.** No capitalisation concept; emphasis is carried by weight (800) not caps.
Section headings are bare noun phrases («عربة التسوق», «ملخص الطلب»). Labels end with a colon
(«الأنواع المتاحة:»). Empty states are three beats: what happened / why / one way out
(«السلة فارغة» → «تصفح أقسام بيت العز وأضف المنتجات المناسبة.» → «تصفح المتجر»).

**Numerals.** Split on purpose. Prices are Western digits + `ج.م`, rounded to whole pounds,
never decimals (`formatPrice` → `185 ج.م`). Chrome copy uses Eastern Arabic digits
(«© ٢٠٢٦», «١٢ قسم نشط»). Quantities in the WhatsApp message are Western.

**Vibe.** Family budget, not luxury. The promise is *good things for the house at a price that
respects the family budget*, delivered fast. Nothing aspirational, no lifestyle language, no
urgency tactics, no discount screaming.

## VISUAL FOUNDATIONS

**Colour.** Two brand colours do everything: **#0056B3 primary blue** (all actions, all prices,
active nav, focus) and **#1A237E secondary navy** (header bar, every heading, body text colour).
The page is **#F8F9FA**, every surface is pure white. Grey #75777E carries secondary copy;
#9E9E9E exists *only* as a border at 10–20% alpha. Fills are always alpha over the brand blue
(10% pill, 5% row hover, 25% focus ring) — never new hues. **Amber is reserved entirely for
wholesale mode**; green confirms; red destroys and warns. Max two background colours per screen.

**Type.** Cairo, one family, loaded from Google Fonts. Weights: 400 body, 600 labels, 700 buttons
and card headings, **800 for anything that matters** (page titles, prices, room labels), 900 only
for admin stat numbers. Scale: 48 hero → 30 page title → 24 → 18 panel heading → 16 → 14 default
→ 12 meta → 10 counters. Arabic body copy runs at 1.625 line-height.

**Spacing.** 4px grid. 16 / 24 / 32 do nearly all the work: 24px card padding, 24px grid gap,
32px column gap, 48px admin page padding, 64px header inline padding on desktop.

**Backgrounds.** No photography, no gradients, no illustration wallpaper. The landing page has
exactly one texture: a 40px grid of `currentColor` rules at **3% opacity**. Everything else is
flat #F8F9FA with white cards.

**Cards.** White, `1px solid rgba(158,158,158,.2)`, 16px radius, `shadow-sm`. On hover the border
turns brand blue and the shadow lifts to `shadow-md` — the border does the work, not the shadow.
Feature surfaces (product detail, modal, login card, house frame) go to 24px radius.

**Corners.** Nothing square. 8px chips/thumbnails, 12px every button and input, 16px cards,
24px feature surfaces, pill for swatches/badges/search. The one 0-radius element is the gift
label, because it is clipped to a triangle.

**Shadows.** Soft and low-contrast (`sm` cards → `2xl` dropdowns and modals). Only the house
hero uses brand-tinted shadows: `0 4px 15px rgba(117,119,126,.15)` at rest,
`0 6px 20px rgba(0,86,179,.3)` on hover, `0 8px 32px rgba(30,33,84,.4)` for the gift roof.
Inner shadow appears once: the translucent header search field.

**Transparency & blur.** Used sparingly and only where content sits over content: room labels are
`rgba(248,249,250,.95)` + `blur(4px)`; the header search is white at 15% with a 30% border;
modals sit on `rgba(0,0,0,.5)` + `blur(4px)`. Note the source's own rule: **no `backdrop-filter`
on a clip-path element** — it bleeds outside the clip (that is why the gift label sets
`backdrop-filter:none`).

**Animation.** One signature curve, `cubic-bezier(0.16,1,0.3,1)`, for entrances: room labels rise
15px and fade in over 500ms on a **35ms-per-room stagger**; the house "opens" **2 seconds** after
landing and the two hero frames crossfade over 1000ms. State changes are 200ms; card hover and the
mobile sidebar are 300ms. Product images zoom to 1.05 over 500ms on card hover.

**Hover states.** Cards: border → brand blue + shadow up. Buttons: darker fill (#0056B3 → #004491).
Header icons: white at 10%. Admin rows and sidebar items: grey-100 fill + navy text. Room labels:
invert to solid brand blue with white content and lift −2px. Footer/nav links: recolour to blue,
never underline.

**Press states.** `scale(0.95)` on buttons and steppers (0.98 on wide admin submits). No colour
change on press — the shrink *is* the feedback.

**Focus.** `focus:border-[#0056B3]` + a 1px blue ring on inputs; selected swatches carry a 2px
25%-blue ring; the SVG house zones take a 3px blue outline with 2px offset.

**Borders.** The system's real separator. `rgba(158,158,158,.2)` outlines every card;
`rgba(158,158,158,.1)` divides inside one. Active nav items carry a **4px inline-end bar**
(`border-r-4` in RTL) rather than a background-only state.

**Layout rules.** Sticky navy header, 64px, `z-50`, full-bleed. Storefront content is centred
with a max width per page type (1024 product, 1152 cart, 1280 category). Category sidebar is
256px; the admin sidebar is **288px fixed to the RTL inline-start (right) edge** with the content
margin-shifted to clear it. The cart's 380px summary sticks at `top:96px`. Mobile swaps the
sidebar for a horizontally-scrolling pill row and the admin sidebar for an off-canvas drawer.

**Imagery.** There is none in the repo — no photography, no illustration, no stock. Product images
come from Supabase storage at runtime and fall back to `assets/placeholder.svg`. The only art the
brand owns is the room icon set and the two house frames. In the UI kits, products stand in with
their room's silhouette icon (documented substitution, not a design decision).

## ICONOGRAPHY

Two systems, cleanly separated:

1. **Room icons — the brand's own art.** 12 hand-drawn, **pure-black silhouette SVGs**
   (`assets/icons/*.svg`), one per room: laundry, kitchen-shelving, paper-goods, bathroom, women,
   men, reception, baby, footwear, vanity, garage, cleaning. Solid fills, no stroke, no colour,
   no rounded-icon container. Sized 28px in nav, 56px in admin tables, and fluidly up to
   `clamp(1.5rem,10cqi,5rem)` on the hero. They are what makes the store look like itself.
2. **UI glyphs — Material Symbols Outlined**, loaded from Google Fonts, `FILL 0, wght 400,
   GRAD 0, opsz 24`. Every interface affordance is a glyph name in markup: `shopping_cart`,
   `account_circle`, `search`, `delete`, `add`, `remove`, `done`, `send`, `content_copy`, `home`,
   `layers`, `inventory_2`, `receipt_long`, `group`, `logout`, `chevron_left`, `sell`, `favorite`,
   `search_off`, `shopping_cart_off`, `folder_open`, `error`, `gpp_maybe`, `edit`, `save`, `menu`,
   `dashboard`, `arrow_back`, `refresh`, `sync`, `hourglass_empty`, `info`. Sizes: 14 inside small
   buttons, 20 default, 24 in the header/sidebar, 48–60 in empty states. `.fill-icon` switches the
   FILL axis. Never mix a second icon library in.

**Unicode as icon.** Rare but real: `➔` ends the search dropdown's "view all" row, `✓` ends
confirmation labels, `━━━` rules the WhatsApp message, `⚠️` prefixes the admin icon-picker warning.

**Emoji as icon:** only in hero copy and the WhatsApp message (see CONTENT FUNDAMENTALS). Never in
navigation or as a UI affordance.

**Missing assets (needs you).** `Gift_Home.svg`, `Medications.svg` and `library-book.svg` are
raster-embedded SVGs upstream; their base64 image data did not survive import, so only the three
vector-free wrappers came across. The admin icon picker therefore shows the 12 vector rooms plus a
flagged stand-in (Material `redeem`) for the gift slot, and the house hero's roof label renders
text-only. **Please re-supply those three files.**

## Index

| Path | What |
|---|---|
| `styles.css` | The single entry point consumers link. `@import` lines only. |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `radii`, `shadows`, `motion`, `layout`, `base`. |
| `assets/icons/` | 12 room silhouette SVGs (+ 3 flagged incomplete files). |
| `assets/` | `Frame 1.svg` / `Frame 2.svg` (house hero frames), `house-coordinates.json`, `house-hero.svg`, `placeholder.svg`. |
| `guidelines/*.card.html` | 18 foundation specimen cards (Colors, Type, Spacing, Brand). |
| `components/` | React primitives, grouped by concern. |
| `ui_kits/storefront/` | Interactive customer storefront recreation. |
| `ui_kits/admin/` | Interactive merchant dashboard recreation. |
| `SKILL.md` | Agent-skill entry point. |
| `github.md` | Upstream repo association + screen map for one-click sync. |

### Components

Grouped by concern; each has a `.d.ts` props contract and a `.prompt.md` usage note.

- **core/** — `Button`, `IconButton`, `Icon`, `Badge`, `Card` (+ `CardTitle`), `StatCard`
- **forms/** — `Input`, `SwatchGroup`, `QuantityStepper`
- **commerce/** — `ProductCard`, `PriceTag`, `CartLine`, `OrderSummary`, `EmptyState`
- **navigation/** — `StoreHeader`, `SearchBar`, `Breadcrumbs`, `SectionNav`, `AdminSidebar`, `StoreFooter`
- **feedback/** — `Skeleton`, `SkeletonProductCard`, `Modal`
- **house/** — `HouseHero` (+ `ROOM_BOUNDS`), `RoomLabel`

The inventory is derived from the source: every family above corresponds to markup that repeats
across `src/pages/` or lives in one of the extracted `*-html.js` templates.

**Intentional additions** (no 1:1 file upstream, but the pattern is everywhere):
- `Icon` — a wrapper over the Material Symbols glyph span, so consumers never hand-write the class.
- `Card` / `CardTitle` — the white-surface + hairline + heading-rule pattern, repeated on ~12 panels.
- `StatCard`, `OrderSummary`, `EmptyState` — each is one upstream block lifted into a component.

**Not rebuilt:** the invoice builder (`src/pages/admin/invoices.html`, 81 KB, includes A4 print
CSS) and the customers screen. Both are stubbed in the admin kit with a note.

## Working with this system

- Retail is blue, wholesale is amber. If you are showing a price, decide which mode you are in.
- Reach for a border before a shadow, and a weight before a colour.
- Room names are brand voice — never "fix" «نص الدنيا» to «قسم النساء».
- `dir="rtl"` and logical properties (`insetInlineStart`, `borderInlineEnd`, `marginInlineEnd`)
  everywhere. A physical `left`/`right` in new code is almost always a bug.
- Prices: `${Math.round(value)} ج.م`. No decimals, no thousands separator.
