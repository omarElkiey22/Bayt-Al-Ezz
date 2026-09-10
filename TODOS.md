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

**Status**: Resolved — fixed in migration `016_sanitize_triggers_products_sections.sql`,
applied 2026-09-10. Before creating either trigger, `sanitize_text_trigger()`'s live
definition was re-queried directly from `pg_proc` and re-confirmed to already be the
corrected nested-IF version from `014_wholesale_sections.sql` (name checked
unconditionally; `NEW.description` only ever evaluated inside a nested
`IF TG_TABLE_NAME IN ('products', 'companies')` block) — the function itself was not
touched, only the two triggers were added. `prevent_html_in_products` and
`prevent_html_in_sections` now both attach it `BEFORE INSERT OR UPDATE`. Verified live:
(1) a safe name+description inserts successfully on both tables; (2) a malicious
(HTML-containing) name is rejected on both tables, raising `sanitize_text_trigger()`'s
own exception rather than a field-access crash — confirms the trigger is genuinely
active, not silently no-op'ing; (3) a malicious description is rejected on `products`
(in the function's `TG_TABLE_NAME` list) and, matching the documented/verified
existing behavior for tables outside that list, does *not* crash on `sections` (its
`description` branch is simply not evaluated there — pre-existing, unrelated gap,
not a regression introduced by this fix); (4) `mcp__supabase__get_advisors` (security)
shows the same 5 pre-existing findings as baseline, nothing new; (5) all test rows
deleted immediately after, confirmed gone by name lookup.

## Security: `sections.description` not covered by `sanitize_text_trigger()`

**Found**: 2026-09-10, during verification of migration 016
(prevent_html_in_products/sections).

**Issue**: `sanitize_text_trigger()`'s description check only fires for
`TG_TABLE_NAME IN ('products', 'companies')` — `sections.description` is not
sanitized server-side, only `sections.name` is. Low risk currently (section
descriptions aren't prominently rendered), but inconsistent with the
protection level given to products/companies.

**Fix needed**: Add `'sections'` to the function's `TG_TABLE_NAME IN (...)`
list for the description check, if `sections.description` is ever used more
prominently or this consistency becomes a priority.

**Status**: Not yet scheduled. Low priority, low current risk.

