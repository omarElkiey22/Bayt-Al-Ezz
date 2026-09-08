# Contract: Database Schema — `wholesale_sections` + `products.wholesale_section_id` + invoice item shape + `softDeleteSection` fix

**Migration file**: `supabase/migrations/014_wholesale_sections.sql`
(next sequential number after `013_companies_and_product_company.sql`)

This documents the schema contract `/speckit-tasks` + `/speckit-implement` must produce. It
follows the exact structural style of `013_companies_and_product_company.sql` (table + FK column
+ indexes + RLS + sanitize trigger in one migration).

## Table: `wholesale_sections`

```sql
create table wholesale_sections (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);
```

No `slug`, no `logo_url` — see `research.md` Decision 4.

## Column addition: `products.wholesale_section_id`

```sql
alter table products
  add column if not exists wholesale_section_id uuid references wholesale_sections(id) on delete set null;
```

`on delete set null` is a defense-in-depth safety net only — the application-level contract
(`wholesale-sections-api.md`) never hard-deletes a wholesale section row, only soft-deletes.

## Index

```sql
create index idx_products_wholesale_section_active_deleted
  on products(wholesale_section_id) where deleted_at is null and is_active = true;
```

Mirrors `idx_products_company_active_deleted` / `idx_products_section_active_deleted` exactly —
same partial-index style, same rationale (fast lookup of a placement's active products without a
redundant second index).

No unique index is needed on `wholesale_sections` itself — unlike `companies`/`sections`, it has
no slug to protect from soft-delete collisions (research.md Decision 4).

## Row-Level Security

```sql
alter table wholesale_sections enable row level security;

create policy "wholesale sections readable" on wholesale_sections
  for select using (deleted_at is null and is_active = true);

create policy "merchant wholesale sections writes" on wholesale_sections
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
```

- The `select` policy is public (no `to` clause — same as `"companies readable"` /
  `"sections readable"`), restricted to active, non-deleted rows only, per Constitution
  Principle IX.
- The write policy uses `public.is_admin()` from this migration's first version — `wholesale_sections`
  never has the pre-012 vulnerable bare-`authenticated` window other tables started with, same as
  `companies`.
- No RLS change needed on `products` itself — the existing `"products readable"` /
  `"merchant products writes"` policies (already gated behind `is_admin()` as of `012`) apply to
  the whole row, `wholesale_section_id` included.

## Server-side sanitization trigger

`sanitize_text_trigger()` (owned by `003_db_constraints_validation.sql`, last extended by `013`)
already checks `NEW.name ~ '<[^>]*>'` for every table it's attached to — `wholesale_sections` has
a `name` column and no `description` column, so **no change to the shared function body is
needed** (unlike `013`, which had to add `description` handling for `companies`). Only a new
trigger attachment is required:

```sql
CREATE TRIGGER prevent_html_in_wholesale_sections
  BEFORE INSERT OR UPDATE ON public.wholesale_sections
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();
```

## Invoice line item shape — no migration change

`invoices.items` stays a `jsonb` column (existing, from `008_invoice_payments_and_debts.sql`); the
new optional `product_id` key (`data-model.md`) is an application-level shape addition only — no
`ALTER TABLE` needed, since jsonb has no fixed schema to migrate.

## `softDeleteSection()` bug fix — not a migration, an application-code fix

`research.md` Decision 2 and `data-model.md`'s Retail Section section: `sections.deleted_at`
already exists (`001_initial_schema.sql`) and is already read by every `is('deleted_at', null)`
query across the codebase. The bug is entirely in `sections-api.js`'s `softDeleteSection()`
function body (hard `.delete()` calls instead of an `update({deleted_at: ...})`) — **no schema
change accompanies this fix**, it is a pure application-code correction tracked in
`wholesale-sections-api.md` / the tasks list, not in this migration file.

## Required test update (not part of the migration file, but part of this contract)

`tests/rls-admin-access.test.js` statically parses every migration for `is_admin()`-gated policies
on a hardcoded `SENSITIVE_POLICIES` list (established by `013`'s contract). This feature's
implementation task list MUST add:

```js
['wholesale_sections', 'merchant wholesale sections writes'],
```

to that array, so the existing regression guard covers the new table from day one.
