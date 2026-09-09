-- Migration: wholesale_sections table + products.wholesale_section_id
--
-- Adds the `wholesale_sections` entity -- a merchant-defined wholesale
-- category, fully independent of the retail `sections` table (no shared
-- rows, foreign keys, or parity constraints -- see specs/004-admin-control-
-- center-v2/research.md Decision 3) -- plus a nullable FK from `products`
-- to it, so each product can carry a wholesale placement (wholesale
-- section + company + wholesale_price) completely independent of its
-- retail placement (section_id + base_price).
--
-- Mirrors 013_companies_and_product_company.sql's table+FK+index+RLS+
-- trigger structure exactly (wholesale_sections never has the pre-012
-- vulnerable bare-`authenticated` window other tables started with).
--
-- See specs/004-admin-control-center-v2/contracts/database-schema.md for
-- the full contract this migration implements, including the
-- plan-eng-review finding (CRITICAL, verified live) that required
-- restructuring sanitize_text_trigger() into nested IF statements below --
-- the original single boolean-OR expression crashes with "record new has
-- no field description" on any table (like this one) that has no
-- description column, because Postgres does not reliably short-circuit
-- around a nonexistent record field in a plain OR expression.

BEGIN;

-- 1. Table. No slug (nothing routes to a wholesale section by URL -- it's
--    selected by id in the product form, same as company_id already is),
--    no logo (not a browsable brand card like companies).
CREATE TABLE wholesale_sections (
  id uuid primary key default gen_random_uuid(),
  name varchar not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

-- 2. products.wholesale_section_id -- nullable (a product may have no
--    wholesale placement at all, or a wholesale price with no section yet
--    assigned), ON DELETE SET NULL as a defense-in-depth safety net (the
--    application layer only ever soft-deletes a wholesale section).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS wholesale_section_id uuid REFERENCES wholesale_sections(id) ON DELETE SET NULL;

-- 3. Index -- mirrors idx_products_company_active_deleted /
--    idx_products_section_active_deleted exactly. No unique index needed
--    on wholesale_sections itself (no slug to protect from soft-delete
--    collisions, unlike companies/sections).
CREATE INDEX idx_products_wholesale_section_active_deleted
  ON products(wholesale_section_id) WHERE deleted_at IS NULL AND is_active = true;

-- 4. Row-Level Security -- mirrors "companies readable" / "merchant
--    companies writes" exactly, gated behind public.is_admin() from day
--    one.
ALTER TABLE wholesale_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wholesale sections readable" ON wholesale_sections
  FOR SELECT USING (deleted_at IS NULL AND is_active = true);

CREATE POLICY "merchant wholesale sections writes" ON wholesale_sections
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Server-side sanitization trigger (Constitution Principle IX --
--    client-side sanitizeInput() MUST NOT be the sole line of defense).
--
--    plan-eng-review finding (CRITICAL, verified live in a rolled-back
--    transaction against this project): the ORIGINAL shared function body
--    --
--      IF NEW.name ~ '<[^>]*>'
--         OR (TG_TABLE_NAME IN ('products', 'companies') AND NEW.description ~ '<[^>]*>')
--      THEN ...
--    -- raises `record "new" has no field "description"` the moment it's
--    attached to any table lacking a description column, because a plain
--    boolean OR expression does not reliably short-circuit far enough to
--    avoid evaluating NEW.description on a record type without that
--    field. wholesale_sections is the first table this shared trigger has
--    ever been attached to without a description column (products and
--    companies both have one), so this failure mode was never previously
--    exercised. Restructuring into nested IF/END IF statements fixes it
--    generally (verified live for both with- and without-description
--    tables): PL/pgSQL's statement-level IF genuinely skips an unentered
--    block, unlike a boolean expression. This is purely a control-flow
--    rewrite -- the `name` check (already covering sections/products/
--    companies/wholesale_sections) and the `description` check scoped to
--    ('products', 'companies') are both behaviorally unchanged.
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

COMMIT;
