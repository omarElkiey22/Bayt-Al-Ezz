# Quickstart: Validating Admin Control Center v2

## Prerequisites

- Migration `014_wholesale_sections.sql` applied (`contracts/database-schema.md`) — verify with:
  ```sql
  select to_regclass('public.wholesale_sections'),
         to_regprocedure('public.is_admin()');
  ```
  and confirm `products.wholesale_section_id` exists (`information_schema.columns`).
- Logged in as one of the accounts in `public.admins` (see prior session's admin-login fix).
- At least one existing retail section and one existing company (from feature 003) to place a
  product against for the dual-placement scenarios below.

## Scenario 1 — Wholesale sections are independent (User Story 1)

1. Open `companies.html` → the "أقسام الجملة" area. Create a wholesale section, e.g. "أدوات
   منزلية جملة". Confirm it appears immediately in the list.
2. Rename it and change its `display_order` number; confirm the change persists after a page
   reload.
3. Run `select count(*) from sections;` before and after steps 1–2 — count must be unchanged
   (nothing written to the retail table).
4. Soft-delete the wholesale section (`select deleted_at from wholesale_sections where id = '<id>'`
   should now be non-null, and the row itself still exists — not hard-deleted).

## Scenario 2 — Independent product placements (User Story 2)

1. Open `products.html`, edit an existing product.
2. Set its retail section to section A and retail price to 100.
3. Separately set its wholesale section to a *different* wholesale section, assign a company, and
   set wholesale price to 80.
4. Save, reload the page, re-open the same product for edit — confirm all four values (retail
   section, retail price, wholesale section, wholesale price) round-tripped correctly and the
   company is still selected.
5. Clear only the wholesale section (set it back to "بدون قسم جملة") and save — confirm the
   product's retail section/price are untouched, and the company/wholesale price fields (if left
   filled) are also untouched (only the one field you changed changed).
6. In the products list, confirm the row shows both placements (or "لا يوجد تصنيف جملة" if a
   product has none of company/wholesale-section/wholesale-price set).

## Scenario 3 — Retail section metadata management, no create (User Story 3)

1. Open `sections.html`. Confirm there is no way to reach a blank "إضافة قسم جديد" form — the page
   only ever offers editing of an existing row.
2. Rename a section, change its `display_order`, and toggle its `is_active` off. Reload the
   storefront homepage (`index.html`) — confirm the house hero's Frame 1/Frame 2 SVGs and all 12
   zone shapes render identically to before, and the disabled section's zone reflects the inactive
   state (per the existing pattern already used for `is_active=false` sections).
3. Attempt to soft-delete a section that currently has an active product assigned — confirm the
   existing guard still blocks it with the same error message pattern.
4. Soft-delete a section with no active products — confirm `deleted_at` is set on the `sections`
   row and run `select count(*) from products where section_id = '<id>';` before/after: the count
   must be unchanged (the hard-delete bug is fixed; products are never removed by this action).

## Scenario 4 — Hybrid invoice item entry (User Story 4 — verification only, per research.md Decision 1)

1. Open `invoices.html`, start a new invoice.
2. In "ابحث عن منتج من المتجر", search for a product that has a wholesale price set — confirm only
   wholesale-priced products appear in results.
3. Select one — confirm name and price pre-fill, then edit the price field before adding it.
4. Add it, then add a second line item via "أو إضافة بند يدوي مخصص" with a made-up name/price.
5. Confirm both lines appear in the live preview and are included in the totals.
6. Save the invoice; inspect the saved `invoices.items` jsonb — confirm the picker-added line has
   a `product_id` key and the manual line does not (`data-model.md`).

## Scenario 5 — Nav link consistency (User Story 5)

1. Visit `sections.html`, `products.html`, `invoices.html`, and `customers.html` in turn.
2. On each, confirm the sidebar shows "إدارة الشركات" in the same position/style as on
   `dashboard.html`, and clicking it lands on `companies.html`.

## Automated checks

```bash
npm test
```

Must include (new or updated): `tests/rls-admin-access.test.js` (wholesale_sections policy
present) and `tests/admin-templates.test.js` (new/changed row-template functions render expected
markup for both populated and empty-placement product rows).
