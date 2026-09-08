# Phase 1 Data Model: Admin Control Center v2

## Wholesale Section (new table: `wholesale_sections`)

Represents a merchant-defined wholesale category (Key Entity from spec.md), fully independent of
retail `sections` (research.md Decision 3).

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | primary key, default `gen_random_uuid()` | matches `sections`/`companies` id style |
| `name` | varchar | not null | Arabic display name; sanitized via `sanitizeInput()` on write, DB-level `sanitize_text_trigger()` backstop |
| `display_order` | integer | not null, default `0` | admin-editable sort key (research.md Decision 7) |
| `is_active` | boolean | not null, default `true` | inactive wholesale sections are excluded from the product form's section `<select>` and any wholesale-mode storefront listing that reads this table |
| `created_at` | timestamptz | not null, default `now()` | |
| `updated_at` | timestamptz | nullable | set explicitly by `updateWholesaleSection()`, same pattern as `updateCompany()` |
| `deleted_at` | timestamptz | nullable | soft-delete marker (Constitution Principle VIII) |

No `slug`, no `logo_url` — see research.md Decision 4.

**Validation rules**:
- `name` required, non-empty after `sanitizeInput()` strips HTML tags; DB trigger rejects any
  remaining `<tag>` pattern regardless of client-side sanitization (Constitution Principle IX).
- No uniqueness constraint on `name` — nothing in spec.md requires unique wholesale section names,
  and unlike `companies`/`sections` there's no slug-based routing to protect.

**State transitions**:
- `is_active = true, deleted_at = null` → **active**: selectable in the product form's wholesale
  placement, listed in the wholesale sections admin area.
- Admin soft-delete → `deleted_at = now()` set → **deleted**: excluded from every admin list and
  every product-form `<select>`; existing products that referenced it keep the FK value until the
  application explicitly clears it (see Product below) — no cascade, mirroring `companies`.
- Admin toggle `is_active = false` → same selectability effect as deleted, but reversible.

## Product (`products`) — updated

Existing table (extended across `001`, `004`, `006`, `013`); this feature adds one column.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `wholesale_section_id` | uuid | nullable, `references wholesale_sections(id) on delete set null` | **NEW**. A product's wholesale placement section — independent of `section_id` (its retail placement, unchanged). `on delete set null` is the defense-in-depth safety net; the application layer soft-deletes wholesale sections, never hard-deletes (mirrors `company_id`'s existing FK, research.md Decision 3). |

**Existing fields relevant to this feature, unchanged in shape**:
- `section_id` (not null FK to `sections`) — the product's **retail** placement. Unaffected by
  this feature; continues to drive house-hero storefront browsing.
- `company_id` (nullable FK to `companies`, from `013`) — part of the product's **wholesale**
  placement, already implemented (research.md Decision 1).
- `base_price` (not null) — retail price, unaffected.
- `wholesale_price` (nullable, from `006`) — part of the product's wholesale placement, already
  implemented and already the exact field the invoice search filters on (research.md Decision 1).

**Validation rules**:
- No new constraint beyond the FK — `wholesale_section_id` may be `null` (no wholesale placement,
  or a wholesale product not yet categorized) or must reference an existing
  `wholesale_sections.id`. No `check` ties `wholesale_section_id`/`company_id`/`wholesale_price`
  together — spec.md FR-008 explicitly requires a product to be able to have any wholesale price
  with a `wholesale_section_id`, company both alone, both set, or neither.
- Retail placement (`section_id`, `base_price`) and wholesale placement
  (`wholesale_section_id`, `company_id`, `wholesale_price`) are written independently: the
  product form's submit handler includes all five fields in one `update()`/`insert()` call (same
  as it already does for `company_id`/`wholesale_price` today), so editing one placement's fields
  in the UI never requires reading or re-submitting the other placement's current values from a
  stale copy — each field keeps whatever value the form currently holds for it (FR-009).

## Invoice line item shape (`invoices.items` jsonb array) — updated

Existing jsonb column (`008_invoice_payments_and_debts.sql` onward); no new database column, one
new optional key in each array element's shape (research.md Decision 5).

| Field | Type | Notes |
|---|---|---|
| `title` | string | existing — line item display name (product name, optionally suffixed with variant/size/color detail) |
| `unitPrice` | number | existing — frozen at invoice-creation time; editable before save regardless of source |
| `quantity` | number | existing |
| `product_id` | uuid \| absent | **NEW, optional** — the source product's id when added via the search picker; omitted entirely for manual/custom line items. Never read back to re-fetch live price/name — it is a traceability pointer only, per the snapshot rule below. |

**Validation rules**:
- A line item is valid with or without `product_id`; its presence/absence is exactly how the UI
  (and any future reporting) distinguishes catalog-sourced vs. manual entries, without needing a
  separate boolean flag.
- Once an invoice is saved, none of its line items' `title`/`unitPrice`/`product_id` change even
  if the referenced product is later edited, its wholesale price changed, or it is soft-deleted —
  invoices are immutable snapshots (existing behavior, unchanged by this feature; spec.md Key
  Entities and Edge Cases both restate this explicitly for the new hybrid flow).

## Relationships

```text
WholesaleSection (1) ──< (N) Product   via products.wholesale_section_id (nullable FK, ON DELETE SET NULL)
Company (1)          ──< (N) Product   via products.company_id           (existing, nullable FK)
Section (1)           ──< (N) Product   via products.section_id           (existing, required FK — retail placement, unchanged)
Product (1)           ──< (N) InvoiceLineItem   via items[].product_id (jsonb, not a DB-level FK — traceability only, snapshot semantics)
```

A product has **at most one** wholesale section, **at most one** company, and **exactly one**
retail section — all four relationships are independent of one another (FR-007–FR-009). Retail
`Section` and `WholesaleSection` have **no relationship to each other** — this is the entire point
of FR-001.

## Retail Section (`sections`) — behavior fix, no schema change

Existing entity (`001_initial_schema.sql` onward). This feature does not alter its columns, but
corrects `sections-api.js`'s `softDeleteSection()` to actually set `deleted_at` instead of hard-
deleting rows (research.md Decision 2), and adds admin-UI-level support for editing
`is_active`/`display_order` on existing rows (no new columns — both already exist and are already
read by `fetchAllSectionsAdmin()`/the storefront; only the admin form/list previously had no
control for them).

**Validation rules (unchanged)**: `MAX_SECTIONS = 13` cap in `createSection()` remains in the data
layer as a defense-in-depth backstop, but per FR-004 the retail sections admin page itself no
longer exposes any control that calls `createSection()` at all.
