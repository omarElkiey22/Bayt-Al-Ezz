# Contract: Database Schema Changes

## Migration `015_wholesale_section_icon.sql`

```sql
BEGIN;

ALTER TABLE wholesale_sections
  ADD COLUMN IF NOT EXISTS icon_name varchar;

COMMIT;
```

That is the entire migration. No RLS policy change, no trigger change, no index — see
[data-model.md](../data-model.md) for the full rationale (RLS is row-scoped so the existing
policies already cover this column; the sanitize trigger intentionally does not check `icon_name`,
matching retail `sections.icon_name`'s existing exclusion; nothing filters/sorts on it so no index
is needed).

**Nullable, no default.** An existing wholesale section (there are none in production today per
spec.md's assumption, but any created between now and this migration landing) gets `NULL` —
handled at the application layer exactly like retail's `icon_name` fallback: `iconSource()` (moved
to `src/js/admin/icon-picker.js` per research.md Decision 5) treats any value not in the known
`ICONS` list — `NULL` included — as `DEFAULT_ICON`.

## Verification checklist (mirrors feature 004's live-verification discipline)

Before this migration is considered done:

1. Apply it via `mcp__supabase__apply_migration`.
2. `mcp__supabase__list_tables` (or a direct `select` on `information_schema.columns`) confirms
   `wholesale_sections.icon_name` exists, is nullable, `varchar`, no default.
3. Insert a test row with a valid `icon_name`, then one with `icon_name` omitted (NULL) — both must
   succeed (confirms the sanitize trigger, unmodified by this migration, still does not reject an
   icon filename and still does not require `icon_name` to be present).
4. `mcp__supabase__get_advisors` (security) shows no new findings introduced by this migration.
5. Clean up any test rows inserted for step 3.

No RLS/soft-delete/sanitize-trigger re-verification beyond step 3/4 is needed — this migration
changes none of those mechanisms (per Decision 5's "no new trigger/policy needed" reasoning);
migration 014's own verification already covered them for every other column on this table.
