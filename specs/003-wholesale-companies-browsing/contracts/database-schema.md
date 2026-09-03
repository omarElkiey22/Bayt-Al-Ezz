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
  slug varchar not null,
  logo_url varchar,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
```

**`updated_at` note (plan-eng-review finding, resolved):** spec.md's Key Entities list
includes `updated_at`; this table was missing it. Added as nullable, set explicitly by
`updateCompany()` on every write (`updated_at: new Date().toISOString()`) — the same
pattern `customers-api.js` and `settings-api.js` already use for their `updated_at`
columns. There is no trigger-based auto-update anywhere in the existing schema, so this
migration doesn't introduce one either.

**Uniqueness note (plan-eng-review finding, resolved):** `slug` is intentionally NOT a
plain `unique` column constraint. Companies are truly soft-deleted (Decision 3 —
`deleted_at` set, row never removed), so a plain `unique not null` would let a
soft-deleted row's slug permanently block re-creating or renaming a company to the same
Arabic name, with no way for the admin to see why (RLS hides the blocking row). Instead,
uniqueness is enforced only among *live* rows via the partial unique index below —
see Indexes.

## Column addition: `products.company_id`

```sql
alter table products
  add column if not exists company_id uuid references companies(id) on delete set null;
```

`on delete set null` is a defense-in-depth safety net only — the application-level contract
(`companies-api.md`) never hard-deletes a company row, so this should not fire in normal operation.

## Indexes

```sql
create unique index idx_companies_slug_unique
  on companies(slug) where deleted_at is null;

create index idx_products_company_active_deleted
  on products(company_id) where deleted_at is null and is_active = true;
```

`idx_companies_slug_unique` does double duty: it's the uniqueness guard (scoped to
`deleted_at is null` so a soft-deleted company's slug never blocks a new/renamed live
company — see the Uniqueness note above) and it's the lookup index for slug-based
queries, same partial-index style as `idx_sections_slug` /
`idx_products_section_active_deleted` in `001_initial_schema.sql`. One index instead of
two (a unique index + a redundant non-unique one) — at this table's scale (tens of rows)
there's no reason to also narrow it to `is_active = true`; the planner has no meaningful
work to save either way.

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

## Server-side sanitization trigger (plan-eng-review finding, resolved)

`003_db_constraints_validation.sql` added `sanitize_text_trigger()` — a database-level
backstop (on top of client-side `sanitizeInput()`) that rejects `<...>` HTML in
`sections.name`/`products.name`/`products.description`, wired via `CREATE TRIGGER` on
both tables. Constitution Principle IX requires this kind of server-side validation as
non-negotiable ("Client-side validation... MUST NOT be the sole line of defense").
`companies.name`/`description` need the same protection:

```sql
CREATE OR REPLACE FUNCTION sanitize_text_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.name ~ '<[^>]*>'
     OR (TG_TABLE_NAME IN ('products', 'companies') AND NEW.description ~ '<[^>]*>')
  THEN
    RAISE EXCEPTION 'Input contains prohibited HTML or script tags';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_html_in_companies
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();
```

`CREATE OR REPLACE FUNCTION` redefines the existing shared function (owned by `003`) to
also check `description` when `TG_TABLE_NAME = 'companies'` — the original only special-cased
`'products'`, which would have silently skipped the `description` check for companies had
the trigger been attached without this change. The `name` check (which already covers
`sections`) is untouched, so this is purely additive — no behavior change for the existing
`sections`/`products` triggers.

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
