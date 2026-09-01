# Contract: `src/js/companies-api.js` (+ small `products-api.js` addition)

Follows the exact conventions of `src/js/sections-api.js` and `src/js/products-api.js`:
`requireSupabase()` for the client, `TABLES.*` from `constants.js` for table names, each function
throws on Supabase error (caught by callers), storefront functions filter to
`deleted_at is null` / `is_active = true` (RLS enforces this server-side too — defense in depth,
matching existing code).

## Required addition to `constants.js`

```js
export const TABLES = {
  settings: 'merchant_settings',
  sections: 'sections',
  products: 'products',
  variants: 'product_variants',
  invoices: 'invoices',
  companies: 'companies'   // NEW
};
```

## Required refactor to `products-api.js`

Extract the per-product mapping logic currently duplicated inline in `fetchProductsBySection`,
`fetchProductDetails`, and `searchProducts` (variants filter/sort + `has_different_prices` +
`starting_price` computation) into one exported helper:

```js
export function mapProductWithVariants(product) {
  const variants = (product.product_variants || [])
    .filter(v => !v.deleted_at)
    .sort((a, b) => a.display_order - b.display_order);
  const prices = [product.base_price, ...variants.map(v => v.price_override ?? product.base_price)];
  return {
    ...product,
    variants,
    has_different_prices: new Set(prices).size > 1,
    starting_price: Math.min(...prices)
  };
}
```

`fetchProductsBySection`, `fetchProductDetails`, `searchProducts`, and the new
`fetchProductsByCompany` (below) all call this instead of duplicating the logic —
Constitution Principle VI.

## Storefront functions (public, RLS-backed)

### `fetchCompaniesForSection(sectionSlug: string): Promise<{ companies: Company[], hasUnassigned: boolean }>`

1. `const products = await fetchProductsBySection(sectionSlug)` (existing function — already
   resolves the slug → section, applies active/non-deleted filtering, throws if section
   invalid/inactive, same as `category.html` already relies on).
2. `const wholesale = filterWholesaleProducts(products)` (from `pricing-mode.js`).
3. `hasUnassigned = wholesale.some(p => !p.company_id)`.
4. `companyIds = [...new Set(wholesale.map(p => p.company_id).filter(Boolean))]`.
5. If `companyIds.length === 0`, return `{ companies: [], hasUnassigned }` without a second query.
6. Else fetch `companies` where `id in companyIds`, `deleted_at is null`, `is_active = true`,
   ordered by `name`; return `{ companies, hasUnassigned }`.

Errors: propagates whatever `fetchProductsBySection` throws (e.g. invalid/soft-deleted section slug)
— callers (the new `wholesale-section-companies.html`) reuse `category.html`'s existing
catch-block pattern for the "invalid ID" edge case.

### `fetchActiveCompanies(): Promise<Company[]>`

Homepage direct-browsing showcase (User Story 2). Query `products` for
`deleted_at is null, is_active = true, wholesale_price is not null, company_id is not null`,
select just `company_id`, dedupe client-side, then fetch matching `companies` rows
(`deleted_at is null, is_active = true`, ordered by `name`). Returns `[]` on any error (logs via
`console.error`, matching `fetchActiveSections()`'s error-handling style) rather than throwing,
since this powers a homepage showcase that should degrade gracefully, not break the page.

### `fetchCompanyDetails(id: string): Promise<Company>`

Single active, non-deleted company by id — `.eq('id', id).is('deleted_at', null).eq('is_active',
true).single()`. Throws (propagates the Supabase "no rows" error) if not found/inactive/deleted —
used by `category.html`'s `?company=` branch for the listing header and for the invalid-id edge
case (caught the same way `category.html` already catches section-fetch errors).

### `fetchProductsByCompany(companyId: string, { sectionSlug }: { sectionSlug?: string } = {}): Promise<Product[]>`

Mirrors `fetchProductsBySection`'s shape and admin/hidden-section handling:

1. `const db = requireSupabase()`.
2. If `sectionSlug` given, resolve it to a section id the same way `fetchProductsBySection` does
   (including the `library-book.svg` hidden-section admin-only check, for parity).
3. Build the query: `active(db.from(TABLES.products).select('*, product_variants(*)').eq(
   'company_id', companyId))`, `.eq('section_id', sectionId)` appended only if a section was
   resolved.
4. Map every row through `mapProductWithVariants()` (see refactor above).
5. Return the array (empty array, not an error, if the company has no matching products — the
   empty-state UI in `category.html` already handles a zero-length product array).

## Admin functions (write-gated by RLS `is_admin()`, called from `companies-crud.js`)

Mirror `sections-api.js`'s admin functions exactly:

### `fetchAllCompaniesAdmin(): Promise<Company[]>`
`select('*').is('deleted_at', null).order('name')` — no `is_active` filter, so admins see
deactivated-but-not-deleted companies too (matches `fetchAllSectionsAdmin()`).

### `createCompany(company): Promise<Company>`
`insert(company).select().single()`. Caller (`companies-crud.js`) is responsible for
`sanitizeInput()` on `name`/`description` and `slugify()` for `slug`, same division of labor as
`products-crud.js`'s form-submit handler.

### `updateCompany(id, updates): Promise<Company>`
`update(updates).eq('id', id).select().single()`.

### `softDeleteCompany(id): Promise<true>`
`update({ deleted_at: new Date().toISOString() }).eq('id', id)` — **does not** touch or count
referencing products (Decision 3 in `research.md` — deliberately different from
`softDeleteSection()`'s cascade-then-hard-delete behavior).

## Admin logo upload helper (in `companies-crud.js`, not `companies-api.js` — mirrors `products-crud.js`'s co-located `upload()`)

```js
async function uploadLogo(file) {
  if (!file) return '';
  const compressed = await compressImage(file);
  const { supabase } = await import('../supabase-client.js');
  const extension = compressed.name.split('.').pop() || 'webp';
  const path = `companies/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('store-assets').upload(path, compressed);
  if (error) throw error;
  return supabase.storage.from('store-assets').getPublicUrl(path).data.publicUrl;
}
```

Identical to `products-crud.js`'s `upload()` except the path prefix — confirms Decision 4 (no new
bucket/policy needed).
