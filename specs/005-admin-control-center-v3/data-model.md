# Data Model: Admin Control Center v3

## Entity: `wholesale_sections` (existing, from migration 014 — extended here)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | unchanged |
| `name` | varchar, not null | unchanged |
| `display_order` | integer, not null, default 0 | unchanged |
| `is_active` | boolean, not null, default true | unchanged |
| `icon_name` | varchar, nullable | **NEW.** References one filename in the shared icon library (`public/assets/icons/`) used by both retail and wholesale sections — the same `ICONS` list, no separate wholesale icon set. `NULL` (or any value outside the known `ICONS` list) falls back to `DEFAULT_ICON` at render time — mirrors exactly how `sections.icon_name` already degrades via `sections-crud.js`'s `iconSource()`. No FK/enum constraint at the database level (retail `sections.icon_name` has none either — this is an app-layer convention, kept consistent). |
| `created_at` | timestamptz, not null | unchanged |
| `updated_at` | timestamptz, nullable | unchanged |
| `deleted_at` | timestamptz, nullable | unchanged — soft-delete, unchanged semantics |

No new indexes needed — `icon_name` is never filtered or sorted on, only selected/displayed.

No RLS policy change — the existing `"wholesale sections readable"` / `"merchant wholesale
sections writes"` policies (migration 014) already cover all columns of the row, `icon_name`
included, since Postgres RLS is row-scoped, not column-scoped.

No sanitize-trigger change — `icon_name` is a closed set of known filenames chosen from a picker
(never free-text), so it is intentionally *not* passed through `sanitize_text_trigger()`'s
`name`/`description` HTML checks, matching how `sections.icon_name` is already excluded from that
trigger's checks today.

## Entity: `companies` (existing — no schema change)

No new columns. `logo_url` already exists and is already populated via a working upload path
(Decision 6) — this feature adds no new field to this table.

## No new tables

This feature introduces zero new tables. `wholesale_sections` is extended in place; every other
entity referenced (`companies`, `products`, `sections`) is used exactly as it already exists.

## Non-persisted concept: Admin Navigation Structure

Not a database entity — a static, in-code structure consumed by `admin-nav.js`
(`renderAdminSidebarHTML`). Shape (illustrative, not the literal implementation):

```js
// [{ type: 'link', href, icon, label }, { type: 'group', id, icon, label, links: [{ href, icon, label }, ...] }, ...]
```

- Two `type: 'link'` entries (dashboard, products) — always rendered flat, never inside a group.
- Two `type: 'group'` entries (`إدارة متجر المستهلك` / `إدارة متجر الجملة`) — each rendered as a
  toggle header + a nested list of `links`.
- `activePage` (the calling page's own filename, e.g. `'products.html'`) is compared against every
  `href` in the structure to: (a) mark that one link visually active, and (b) auto-expand the
  group containing it, per FR-016. A match against a top-level `link` entry expands no group (there
  is none to expand).

## Non-persisted concept: Wholesale-section filtering context (`category.html`)

> **Revised during planning** (`/speckit.clarify` correction) — narrowed from an earlier full-parity
> design to just what `category.html`'s new `?wholesale_section=<id>` branch actually needs (see
> research.md Decision 2). No `wholesaleSectionsCache` list, and no sidebar/mobile-nav link builder
> counterpart, exist in `category.html` — only the minimum needed to fetch and label one section's
> products.
>
> **Revised again** (`/plan-eng-review` finding, US1 focus review) — `currentSlug` is no longer a
> direct copy of the URL's `slug` in wholesale mode; it's derived from a neutralized `effectiveSlug`
> (`isWholesaleMode() ? null : slug`), computed once and reused everywhere the page reads `slug` for
> scoping (the redirect guard, the initial assignment, and `resetFilters()`'s dirty-check) — not
> re-derived ad hoc at each site. See `contracts/wholesale-section-browsing.md`'s "redirect guard and
> `slug` neutralization" subsection for why patching only some of those sites is exactly how a
> retail-data leak or a stale-dirty-check bug would ship.

| Concept | Retail (existing, unchanged) | Wholesale (new, narrow) |
|---|---|---|
| Active section key | `currentSlug` (string, slug) | `currentWholesaleSectionId` (string, uuid) |
| URL param | `?section=<slug>` | `?wholesale_section=<id>` |
| Section-scoped product fetch | `fetchProductsBySection(slug)` | `fetchProductsByWholesaleSection(id)` |
| Section+company fetch | `fetchProductsByCompany(id, { sectionSlug })` | `fetchProductsByCompany(id, { wholesaleSectionId })` |
| Section list, for faceting/nav | `sectionsCache` ← `fetchActiveSections()`, drives the sidebar-nav and the filter panel's "القسم" `<select>` | **None** — the sidebar-nav and section-facet dropdown are not shown in this mode at all; the section's own name/icon for the page header is looked up via `fetchActiveWholesaleSections()` + `.find(id)`, resolved fresh inside `fetchAndLabelProducts()` on every call (initial load and every re-fetch alike), not a dedicated `category.html`-local cache |
| Sidebar/mobile nav link builder | `buildSidebarNavLinkHTML`/`buildMobileNavLinkHTML` (`section-nav-html.js`) | **None** — no wholesale counterpart exists; this UI is simply absent in wholesale-section mode |
| `fetchAndLabelProducts()` parameter | `targetSlug` (3rd positional param, existing) | `targetWholesaleSectionId` — a new, explicit 4th positional param (not a closure read), mirroring how `targetCompanyId` is already threaded explicitly so `refetchAndSync()`'s re-fetch call can pass a changed value |
| Retail `sections` fetch in `render()` | `fetchActiveSections()` always runs | **Skipped entirely** when `wholesale_section` drives the page — not merely unused, never called, per SC-001 ("zero references to retail-section data") |

Which pair is active is decided once per page load by `isWholesaleMode()` (existing,
`pricing-mode.js`) plus which of `section`/`wholesale_section` is present in the URL — never both,
never neither (outside of a no-section, no-company, search-only load, which now falls through to
the page's existing no-param redirect to `index.html` once `effectiveSlug` neutralizes a stale
retail slug — see the contract's updated table).
