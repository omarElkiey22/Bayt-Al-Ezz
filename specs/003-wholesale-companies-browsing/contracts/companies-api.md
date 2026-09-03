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

### Second refactor: shared hidden-section context (plan-eng-review finding, resolved)

`fetchProductsBySection`, `fetchProductDetails`, and `searchProducts` each independently
compute "is this session an admin, and which section id(s) are the hidden
`library-book.svg` section" — three separate copies of the same `isAdmin` +
`hiddenSectionIds` lookup. The new `fetchProductsByCompany` and `fetchActiveCompanies`
(below) need the exact same check (a company-wide/global browse must not leak hidden-section
products to non-admins any more than a section-scoped browse does), so this is the moment to
extract it instead of writing a 4th and 5th copy:

```js
async function getHiddenSectionContext(db) {
  const { data: { session } } = await db.auth.getSession();
  const isAdmin = !!session;
  if (isAdmin) return { isAdmin, hiddenSectionIds: new Set() };
  const { data: sections } = await db.from(TABLES.sections)
    .select('id, icon_name').is('deleted_at', null).eq('is_active', true);
  const hiddenSectionIds = new Set(
    (sections || []).filter(s => s.icon_name === 'library-book.svg').map(s => s.id)
  );
  return { isAdmin, hiddenSectionIds };
}
```

`fetchProductsBySection`, `fetchProductDetails`, and `searchProducts` are refactored to call
this instead of their inline duplicate logic (behavior-preserving — same queries, same
result). `fetchProductsByCompany` and `fetchActiveCompanies` call it too, closing the leak
described below.

## Storefront functions (public, RLS-backed)

### `fetchCompaniesForSection(sectionSlug: string): Promise<{ companies: Company[], hasUnassigned: boolean }>`

> **Scale note (plan-eng-review, confirmed):** this fetches every product row *and* its
> nested `product_variants` for the section just to reduce it to a distinct `company_id`
> list — deliberately, per Decision 2 in `research.md`, to reuse `filterWholesaleProducts()`
> rather than duplicating its wholesale-price condition in a second query (Constitution
> Principle VI). Fine at today's scale. **Revisit if any single section exceeds roughly
> 500 active products**: at that point, replace this with a dedicated
> `select company_id, wholesale_price where section_id = X` query used only for the grid,
> and accept the small duplication of the wholesale-price-not-null condition.

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

Homepage direct-browsing showcase (User Story 2).

> **Hidden-section leak, fixed (plan-eng-review finding):** the original draft queried
> `wholesale_price is not null`, but `filterWholesaleProducts()` (the actual definition of
> "wholesale-eligible" used everywhere else) requires `wholesale_price > 0` — `0` is a
> DB-legal, admin-enterable value (`CHECK (wholesale_price >= 0)`, `006_wholesale_pricing.sql`)
> that would otherwise make a company's card appear on the homepage while every one of its
> listings filters that same product out. It also had no hidden-section check, so a company
> whose only wholesale inventory sits in the admin-only `library-book.svg` section could
> surface on the public homepage.

1. `const { hiddenSectionIds } = await getHiddenSectionContext(db)` (see refactor above).
2. Query `products` for `deleted_at is null, is_active = true, wholesale_price > 0,
   company_id is not null`, and — for non-admins — `.not('section_id', 'in',
   [...hiddenSectionIds])` when `hiddenSectionIds.size > 0`.
3. Select just `company_id`, dedupe client-side, then fetch matching `companies` rows
   (`deleted_at is null`, `is_active = true`, ordered by `name`).
4. Returns `[]` on any error (logs via `console.error`, matching `fetchActiveSections()`'s
   error-handling style) rather than throwing, since this powers a homepage showcase that
   should degrade gracefully, not break the page.

### `fetchCompanyDetails(id: string): Promise<Company>`

Single active, non-deleted company by id — `.eq('id', id).is('deleted_at', null).eq('is_active',
true).single()`. Throws (propagates the Supabase "no rows" error) if not found/inactive/deleted.

> **Consistency fix (plan-eng-review finding):** BOTH product-listing entry points that take a
> company id — `category.html?company=<id>` (direct/homepage-originated) and
> `category.html?section=<slug>&company=<id>` (section-grid-originated) — call
> `fetchCompanyDetails(companyId)` first and catch its "not found" error with the same
> "invalid ID" empty-state UI spec.md's Edge Cases section already requires (a descriptive
> notice + a button back to the catalog, not a raw thrown error, and not a silent
> pass-through). Previously only the direct route validated the company at all, so the
> section+company route would keep silently showing a soft-deleted/deactivated company's
> products with no indication anything changed, while the direct route hard-threw — two
> different, undocumented behaviors for the same underlying state.

### `fetchProductsByCompany(companyId: string, { sectionSlug }: { sectionSlug?: string } = {}): Promise<Product[]>`

Mirrors `fetchProductsBySection`'s shape and admin/hidden-section handling. Callers validate
the company via `fetchCompanyDetails()` first (see above) — this function itself only
handles the product-fetch side, same division of responsibility as
`fetchProductsBySection`/`fetchProductDetails` already have today (product-existence and
section-existence are each their own check, not nested inside one function).

> **Hidden-section leak, fixed (plan-eng-review finding):** the `sectionSlug` branch already
> inherits `fetchProductsBySection`'s hidden-section handling by resolving through it, but the
> no-`sectionSlug` branch (User Story 2 — a company's full catalog across *all* sections) had
> no equivalent check, unlike `searchProducts()`'s existing all-catalog query. Step 2 below
> closes that gap using the same shared helper.

1. `const db = requireSupabase()`.
2. `const { isAdmin, hiddenSectionIds } = await getHiddenSectionContext(db)` (see refactor above).
3. If `sectionSlug` given, resolve it to a section id the same way `fetchProductsBySection` does
   (including the `library-book.svg` hidden-section admin-only check, for parity — a direct
   `?section=<hidden-slug>&company=<id>` request still gets rejected for non-admins).
4. Build the query: `active(db.from(TABLES.products).select('*, product_variants(*)').eq(
   'company_id', companyId))`, `.eq('section_id', sectionId)` appended only if a section was
   resolved; when no section was resolved and `!isAdmin`, append
   `.not('section_id', 'in', [...hiddenSectionIds])` if `hiddenSectionIds.size > 0`.
5. Map every row through `mapProductWithVariants()` (see refactor above).
6. Return the array (empty array, not an error, if the company has no matching products — the
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
`update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()` —
same explicit `updated_at` stamping `customers-api.js`/`settings-api.js` already do (no DB
trigger auto-updates it, per the `updated_at` note in `database-schema.md`).

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
