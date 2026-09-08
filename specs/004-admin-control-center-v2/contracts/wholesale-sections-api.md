# Contract: `src/js/wholesale-sections-api.js` (new) + `sections-api.js` fix + `products-api.js` addition

Follows the exact conventions of `src/js/companies-api.js`: `requireSupabase()` for the client,
`TABLES.*` from `constants.js` for table names, each function throws on Supabase error (caught by
callers), admin functions read/write without the active-only filter (RLS still enforces
`is_admin()` server-side for writes).

## Required addition to `constants.js`

```js
export const TABLES = {
  settings: 'merchant_settings',
  sections: 'sections',
  products: 'products',
  variants: 'product_variants',
  invoices: 'invoices',
  companies: 'companies',
  wholesaleSections: 'wholesale_sections'   // NEW
};
```

## New file: `src/js/wholesale-sections-api.js`

Mirrors `companies-api.js`'s admin section exactly (no storefront-facing functions in this plan —
nothing in spec.md routes the public storefront through wholesale sections yet; only the admin UI
consumes this module):

```js
import { requireSupabase } from './supabase-client.js';
import { TABLES } from './constants.js';

export async function fetchAllWholesaleSectionsAdmin() {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .select('*')
    .is('deleted_at', null)
    .order('display_order');
  if (error) throw error;
  return data || [];
}

export async function createWholesaleSection(section) {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .insert(section)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWholesaleSection(id, updates) {
  const { data, error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteWholesaleSection(id) {
  const { error } = await requireSupabase()
    .from(TABLES.wholesaleSections)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return true;
}
```

No `fetchActiveWholesaleSections()` storefront function in this plan's scope — the product form's
wholesale-section `<select>` (admin-only, gated by `requireAdmin()`) uses
`fetchAllWholesaleSectionsAdmin()` directly, same as it already uses
`fetchAllSectionsAdmin()`/`fetchAllCompaniesAdmin()` for the retail-section and company
`<select>`s.

## Required fix to `sections-api.js`: `softDeleteSection()`

Per `research.md` Decision 2, replace the current hard-delete body with a real soft-delete,
matching `softDeleteCompany()`'s shape exactly:

```js
export async function softDeleteSection(id) {
  const db = requireSupabase();
  const { count, error: countError } = await db.from(TABLES.products)
    .select('*', { count: 'exact', head: true })
    .eq('section_id', id).is('deleted_at', null).eq('is_active', true);
  if (countError) throw countError;
  if (count) throw new Error('لا يمكن حذف قسم به منتجات نشطة قبل نقلها أو إيقافها.');
  const { error } = await db.from(TABLES.sections)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
  return true;
}
```

The active-products guard (and its error message, already surfaced verbatim by
`sections-crud.js`'s `catch` block) is unchanged — only the final action changes from two
`.delete()` calls to one `.update({deleted_at})` call, and no product rows are touched at all
(matching `softDeleteCompany()`, which never cascades into `products`).

**Required addition to `sections-api.js`**: `updateSection()` already accepts an arbitrary
`updates` object and is reused as-is for the new `is_active`/`display_order` admin controls — no
function signature change needed, only new callers from `sections-crud.js` (see
`admin-ui.md`).

## Required addition to `products-api.js`

No new function — `createProduct(product, variants)` and `updateProduct(id, updates, variants)`
already accept an arbitrary product object/updates map and pass it straight to Supabase
(`db.from(TABLES.products).insert(product)` / `.update(updates)`), exactly like `company_id` and
`wholesale_price` already flow through today. `products-crud.js` including
`wholesale_section_id` in its submitted `updates` object (contracts/admin-ui.md) is sufficient —
no `products-api.js` change required.

## Invoice line item `product_id` — no new API function

Per `data-model.md`, `product_id` is a plain optional key added to the line-item objects already
pushed into `invoiceItems` by `invoices.html`'s inline script (`btnAddCatalog.onclick`). No
`invoice-helper.js` or `*-api.js` change is needed — `calculateItemTotal()`/
`calculateInvoiceTotals()` only read `unitPrice`/`quantity` and are unaffected by the extra key,
and the existing save-to-history call already serializes the whole `invoiceItems` array into
`invoices.items` as-is.

## Required test updates

- `tests/rls-admin-access.test.js`: add `['wholesale_sections', 'merchant wholesale sections writes']`
  to `SENSITIVE_POLICIES` (contracts/database-schema.md).
- New `tests/wholesale-sections-api.test.js` is **not** planned — the existing project has no
  `companies-api.test.js` either (Supabase-calling functions aren't unit-tested per Constitution
  Principle VII, which scopes automated tests to pure logic only). Any pure logic this feature
  introduces (none beyond what already exists — reordering/toggling are plain field updates) does
  not need new pure-logic test files beyond what's already noted for `invoice-helper.js`
  (unchanged) and `admin-templates.js` (new row-template functions, see `admin-ui.md`, covered by
  the existing `tests/admin-templates.test.js` pattern).
