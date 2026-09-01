# Phase 1 Data Model: Wholesale Companies Catalog and Filtering

## Company (new table: `companies`)

Represents a manufacturer, brand, or wholesale vendor (Key Entity from spec.md).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | primary key, default `gen_random_uuid()` | matches `sections`/`products` id style |
| `name` | varchar | not null | Arabic display name; sanitized via `sanitizeInput()` on write |
| `slug` | varchar | unique, not null | generated via existing `slugify()` (`utils.js`); used for future-proofing (not required by any FR, but kept consistent with `sections.slug`) |
| `logo_url` | varchar | nullable | **URL only** (Supabase Storage `store-assets/companies/...` public URL) — never binary data, per design constraint |
| `description` | text | nullable | optional company description |
| `is_active` | boolean | not null, default `true` | admin can deactivate without deleting |
| `created_at` | timestamptz | not null, default `now()` | |
| `deleted_at` | timestamptz | nullable | soft-delete marker (Constitution Principle VIII) |

**Validation rules**:
- `name` required, non-empty after `sanitizeInput()` strips any HTML tags.
- `slug` unique; auto-derived from `name` via `slugify()`, editable like `sections.slug` — but no
  feature currently routes by company slug (all company links use `id`), so uniqueness is enforced
  at the DB level primarily as a data-hygiene guardrail, matching the `sections` precedent.
- `logo_url`, if present, must be a URL (no server-side format validation beyond what
  `image-compressor.js`'s `compressImage()` already enforces client-side: JPEG/PNG/WebP, ≤2MB).

**State transitions**:
- `is_active = true, deleted_at = null` → **active** (visible in all public queries described in
  `contracts/companies-api.md`).
- Admin soft-delete → `deleted_at = now()` set, `is_active` left as-is → **deleted** (excluded from
  every public `select` via RLS `using (deleted_at is null and is_active = true)`, and from
  `fetchAllCompaniesAdmin()`'s `.is('deleted_at', null)` filter). Per Decision 3 in `research.md`,
  **no cascade** — any `products.company_id` still pointing at this row is left untouched.
- Admin toggle `is_active = false` (without deleting) → same visibility effect as deleted, but
  reversible and distinguishable in the admin list (mirrors how `products.is_active` already works
  for products).

## Product (`products`) — updated

Existing table (`001_initial_schema.sql`, extended by `004`/`006`); this feature adds one column.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `company_id` | uuid | nullable, `references companies(id) on delete set null` | **NEW**. Nullable to support the explicit "unassigned product" state (spec Clarifications session) |

**Validation rules**:
- No new constraint beyond the FK — `company_id` may be `null` (unassigned) or must reference an
  existing `companies.id`. There is intentionally no `check` tying `company_id`'s active/deleted
  state to the product, matching Decision 3 (soft-deleted companies don't corrupt existing
  associations).

**Existing fields unaffected**: `id`, `name`, `description`, `section_id`, `primary_image_url`,
`base_price`, `wholesale_price` (from `006_wholesale_pricing.sql`), `is_active`, `created_at`,
`deleted_at`, plus `sizes`/`colors` (from `004`) — none change shape or semantics.

## Section (`sections`) — unchanged

Existing entity, referenced only for FK/query joins (`products.section_id`). No schema change; the
new `wholesale-section-companies.html` page and `category.html`'s filter panel both read from the
existing `fetchActiveSections()` (`sections-api.js`) for section names/slugs.

## Relationships

```text
Company (1) ──< (N) Product      via products.company_id  (nullable FK, ON DELETE SET NULL)
Section (1) ──< (N) Product      via products.section_id   (existing, not null FK)
```

A product has **at most one** company (optional) and **exactly one** section (required, unchanged).
A company can have products across many sections — this is exactly what enables User Story 2
("direct company browsing... shows all of its products across every section").

## Derived / computed shapes (not stored — produced by the API layer)

These are documented fully in `contracts/companies-api.md`; noted here for data-model completeness:

- **Section company grid entry**: `{ companies: Company[], hasUnassigned: boolean }` — derived from
  filtering a section's active wholesale products and reducing to distinct non-null `company_id`s
  (`hasUnassigned` is `true` if any filtered product has `company_id === null`).
- **Product listing row** (used by both `fetchProductsBySection` and the new
  `fetchProductsByCompany`): `{ ...product, variants, has_different_prices, starting_price }` —
  unchanged shape, just also filterable/groupable by the new `company_id` field.
