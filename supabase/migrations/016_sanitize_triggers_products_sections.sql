BEGIN;

-- TODOS.md: "Security: Missing server-side sanitize triggers on `products`
-- and `sections`". sanitize_text_trigger() (003_db_constraints_validation.sql,
-- corrected to the nested-IF version by 014_wholesale_sections.sql per
-- specs/004-admin-control-center-v2/contracts/database-schema.md) already
-- supports both tables via its TG_TABLE_NAME check, but no trigger was ever
-- attached to either -- only `prevent_html_in_companies` and
-- `prevent_html_in_wholesale_sections` exist today. This leaves server-side
-- XSS protection missing for products/sections writes, violating
-- Constitution Principle IX ("client-side sanitization MUST NOT be the sole
-- line of defense"). Function itself is NOT touched here -- its live
-- definition was re-confirmed to already be the corrected nested-IF version
-- before writing this migration.

CREATE TRIGGER prevent_html_in_products
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();

CREATE TRIGGER prevent_html_in_sections
  BEFORE INSERT OR UPDATE ON public.sections
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();

COMMIT;
