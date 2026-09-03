-- Migration: companies table + products.company_id
--
-- Adds the `companies` entity (manufacturer/brand/wholesale vendor) that
-- wholesale-mode browsing groups products by, plus a nullable FK from
-- `products` to it. RLS mirrors the existing sections/products
-- public-read/admin-write pattern (using public.is_admin() from
-- 012_admin_role_access_control.sql -- companies never has the pre-012
-- vulnerable bare-`authenticated` window other tables started with).
--
-- See specs/003-wholesale-companies-browsing/contracts/database-schema.md
-- for the full contract this migration implements.

BEGIN;

-- 1. Table. `slug` is intentionally NOT a plain `unique` column -- see the
--    partial unique index below (Uniqueness note in the contract: a plain
--    unique constraint would let a soft-deleted company's slug permanently
--    block re-creating/renaming a company to the same name).
CREATE TABLE companies (
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

-- 2. products.company_id -- nullable (an "unassigned" product is a
--    supported state, not an error), ON DELETE SET NULL as a defense-in-
--    depth safety net (the application layer never hard-deletes a company).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id) ON DELETE SET NULL;

-- 3. Indexes. idx_companies_slug_unique does double duty: it is both the
--    uniqueness guard (scoped to deleted_at is null, so a soft-deleted
--    company's slug never blocks a new/renamed live company) and the
--    lookup index for slug-based queries.
CREATE UNIQUE INDEX idx_companies_slug_unique
  ON companies(slug) WHERE deleted_at IS NULL;

CREATE INDEX idx_products_company_active_deleted
  ON products(company_id) WHERE deleted_at IS NULL AND is_active = true;

-- 4. Row-Level Security -- mirrors "sections readable" / "merchant sections
--    writes" exactly, gated behind public.is_admin() from day one.
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies readable" ON companies
  FOR SELECT USING (deleted_at IS NULL AND is_active = true);

CREATE POLICY "merchant companies writes" ON companies
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Server-side sanitization trigger (Constitution Principle IX --
--    client-side sanitizeInput() MUST NOT be the sole line of defense).
--    Redefines the shared sanitize_text_trigger() (owned by
--    003_db_constraints_validation.sql) to also check `description` when
--    TG_TABLE_NAME = 'companies' -- the original only special-cased
--    'products', so attaching the trigger without this change would have
--    silently skipped the description check for companies. The `name`
--    check (already covering sections) is untouched -- purely additive,
--    no behavior change for the existing sections/products triggers.
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

COMMIT;

-- Storage: company logos reuse the existing store-assets bucket (created in
-- 001_initial_schema.sql) under a new companies/ path prefix -- the
-- existing bucket-scoped policies ("public asset read" / "merchant asset
-- write") already cover it since they key on bucket_id, not path. No new
-- bucket or storage policy needed.
