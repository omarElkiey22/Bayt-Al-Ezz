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

**plan-eng-review finding (CRITICAL, verified live, resolved):** an earlier draft of this
contract assumed no change to `sanitize_text_trigger()` was needed, since `wholesale_sections`
has a `name` column and the shared function's `description` check is already gated behind
`TG_TABLE_NAME IN ('products', 'companies')`. That assumption was tested directly against the
live Supabase project (temp table, `name` column only, no `description`, this exact trigger
attached) and **failed**: `INSERT` raised `record "new" has no field "description"`. The
function's single boolean expression —

```sql
IF NEW.name ~ '<[^>]*>'
   OR (TG_TABLE_NAME IN ('products', 'companies') AND NEW.description ~ '<[^>]*>')
THEN ...
```

— does not reliably short-circuit far enough to avoid evaluating `NEW.description` on a record
type that lacks the field. Every table this function has been attached to so far (`products`,
`companies`) happens to have a `description` column, so this failure mode was never exercised
until `wholesale_sections` (the first attached table without one). Left as originally drafted,
migration `014` would have made every `INSERT`/`UPDATE` on `wholesale_sections` fail outright,
breaking all of User Story 1.

**Fix (verified live, both branches)**: restructure the single OR expression into nested
`IF`/`END IF` statements. PL/pgSQL's statement-level `IF` genuinely skips an unentered block —
unlike a boolean `OR`/`AND` expression, it never evaluates `NEW.description` unless
`TG_TABLE_NAME` has already matched:

```sql
CREATE OR REPLACE FUNCTION sanitize_text_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.name ~ '<[^>]*>' THEN
    RAISE EXCEPTION 'Input contains prohibited HTML or script tags';
  END IF;
  IF TG_TABLE_NAME IN ('products', 'companies') THEN
    IF NEW.description ~ '<[^>]*>' THEN
      RAISE EXCEPTION 'Input contains prohibited HTML or script tags';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_html_in_wholesale_sections
  BEFORE INSERT OR UPDATE ON public.wholesale_sections
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();
```

Verified live in a rolled-back transaction: (1) a safe `name` on a table with no `description`
column inserts successfully; (2) a malicious `name` on that same no-description table is
correctly rejected (not a field-access crash); (3) a malicious `description` on a table that
*has* a `description` column but isn't in `('products', 'companies')` is still accepted,
matching today's existing (unrelated) behavior for such tables — this restructure changes
nothing for `products`/`companies`, it only makes the description branch genuinely skippable.
This is a general fix: it also protects any future table attached to this shared trigger that
lacks a `description` column, not just `wholesale_sections`.

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
