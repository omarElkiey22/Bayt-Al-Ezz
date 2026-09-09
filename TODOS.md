# TODOs

Standalone follow-up work tracked outside any single feature's spec/plan/tasks.

## Security: Missing server-side sanitize triggers on `products` and `sections`

**Found**: 2026-09-08, during /plan-eng-review for feature 004-admin-control-center-v2.

**Issue**: Only `prevent_html_in_companies` is actually attached to the live
Supabase database. Despite `sanitize_text_trigger()` (in
003_db_constraints_validation.sql, extended by 013) supporting both `products`
and `sections` via its TG_TABLE_NAME check, no trigger is actually attached to
either table. This means server-side XSS protection is currently missing for
`products` and `sections` writes — client-side sanitizeInput() is the only
defense currently in place for these two tables, which violates Constitution
Principle IX ("client-side sanitization MUST NOT be the sole line of defense").

**Fix needed**: A new migration attaching `CREATE TRIGGER prevent_html_in_products
BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION
sanitize_text_trigger();` and the equivalent for `sections`. Must use the
CORRECTED nested-IF version of sanitize_text_trigger() from
specs/004-admin-control-center-v2/contracts/database-schema.md (not the original
single-OR-expression version), since both `products` and `sections` have a
`description`/`name` column so the original version wouldn't crash on them —
but using the corrected version keeps the function consistent everywhere it's
attached.

**Status**: Not yet scheduled. Out of scope for feature 004 (unrelated tables).
Track as a standalone follow-up.

## UI: Empty wholesale badge for wholesale-price-only products

**Found**: 2026-09-09, code review during feature 004-admin-control-center-v2.

**Issue**: A product with only a wholesale price set (no wholesale section, no
company) renders an empty amber box in the product list's wholesale badge
instead of showing content or the "لا يوجد تصنيف جملة" placeholder.

**Fix needed**: renderProductRow() in admin-templates.js should treat this
partial state consistently with the full "no wholesale placement" case, or
show the wholesale price alone if that's the intended behavior — needs a
product decision on what a wholesale-price-only product should display.

**Status**: Resolved — fixed in 004-admin-control-center-v2 Polish phase.
renderProductRow() now falls back to the "لا يوجد تصنيف جملة" placeholder
whenever both wholesaleSectionName and companyName are absent, regardless of
wholesale_price. Covered by a regression test in tests/admin-templates.test.js.

## UI: Wholesale section row number inconsistency

**Found**: 2026-09-09, code review during feature 004-admin-control-center-v2.

**Issue**: renderWholesaleSectionRow()'s "#" column shows display_order + 1
rather than the row's actual list position, inconsistent with the retail
sections page's #index+1 convention.

**Fix needed**: Align renderWholesaleSectionRow() to show list position
(index+1) like renderSectionRow() does.

**Status**: Resolved — fixed in 004-admin-control-center-v2 Polish phase.
renderWholesaleSectionRow() now takes an `index` param and renders `#${index +
1}`, matching renderSectionRow()'s convention. Covered by a regression test
in tests/admin-templates.test.js (non-contiguous display_order case).
