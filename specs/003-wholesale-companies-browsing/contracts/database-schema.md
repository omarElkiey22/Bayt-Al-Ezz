# Contract: Database Schema — `companies` + `products.company_id`

**Migration file**: `supabase/migrations/013_companies_and_product_company.sql`
(next sequential number after `012_admin_role_access_control.sql`)

This documents the schema contract the `/speckit-tasks` + `/speckit-implement` steps must produce.
It follows the exact structural style of `001_initial_schema.sql` (table + index + RLS in one
migration) and the admin-gating style of `012_admin_role_access_control.sql`.

## Table: `companies`

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  slug varchar unique not null,
  logo_url varchar,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

## Column addition: `products.company_id`

```sql
alter table products
  add column if not exists company_id uuid references companies(id) on delete set null;
```

`on delete set null` is a defense-in-depth safety net only — the application-level contract
(`companies-api.md`) never hard-deletes a company row, so this should not fire in normal operation.

## Indexes

```sql
create index idx_companies_slug
  on companies(slug) where deleted_at is null and is_active = true;

create index idx_products_company_active_deleted
  on products(company_id) where deleted_at is null and is_active = true;
```

Mirrors the existing partial-index style (`idx_sections_slug`, `idx_products_section_active_deleted`
in `001_initial_schema.sql`) — indexes only the rows the storefront actually queries.

## Row-Level Security

```sql
alter table companies enable row level security;

create policy "companies readable" on companies
  for select using (deleted_at is null and is_active = true);

create policy "merchant companies writes" on companies
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
```

- The `select` policy is public (no `to` clause — same as `"sections readable"` /
  `"products readable"` in `001`), restricted to active, non-deleted rows only, per Constitution
  Principle IX ("Storefront queries (public read) MUST be restricted to active, non-deleted records
  only").
- The write policy uses `public.is_admin()` **from this migration's first version** — unlike
  `sections`/`products`/etc., which started with the vulnerable bare-`authenticated` pattern in
  `001` and had to be patched in `012`, `companies` never has that vulnerable window.
- No RLS changes needed on `products` itself for the new column — the existing `"products
  readable"` / `"merchant products writes"` policies (already gated behind `is_admin()` as of
  `012`) apply to the whole row, `company_id` included.

## Storage (no new bucket/policy)

Company logos upload to the existing `store-assets` bucket (created in `001_initial_schema.sql`)
under a new `companies/` path prefix — see `contracts/companies-api.md`'s upload helper. The
existing bucket-scoped policies already cover it:

```sql
-- already exist, from 001 + 012 — no migration change needed:
-- create policy "public asset read" on storage.objects for select using (bucket_id='store-assets');
-- create policy "merchant asset write" on storage.objects for all to authenticated
--   using (bucket_id='store-assets' and public.is_admin())
--   with check (bucket_id='store-assets' and public.is_admin());
```

## Required test update (not part of the migration file, but part of this contract)

`tests/rls-admin-access.test.js` statically parses every migration for `is_admin()`-gated policies
on a hardcoded `SENSITIVE_POLICIES` list. This feature's implementation task list MUST add:

```js
['companies', 'merchant companies writes'],
```

to that array, so the existing regression guard (protecting against the exact vulnerability class
`012` fixed) covers the new table from day one.
