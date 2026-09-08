# Contract: Admin UI changes — nav link, retail sections page, companies+wholesale-sections page, product form, invoice line items

## 1. "إدارة الشركات" nav link on every admin page (FR-015)

`dashboard.html` and `companies.html` already contain this exact `<a>` block inside
`<nav class="flex-grow p-4 flex flex-col gap-2">` (identical markup in both, only the
active-state classes differ per current page):

```html
<a class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[#75777E] hover:bg-gray-100 hover:text-[#1A237E]" href="companies.html">
  <span class="material-symbols-outlined">store</span>
  <span>إدارة الشركات</span>
</a>
```

**Change**: insert this same block (inactive-state classes, since none of these four pages *is*
`companies.html`) into `sections.html`, `products.html`, `invoices.html`, and `customers.html`'s
sidebars, positioned immediately after their existing "إدارة المنتجات" link and before
"إنشاء وطباعة فاتورة" / "إدارة العملاء" — matching the exact ordering already established in
`dashboard.html` and `companies.html`. No JS change; this is a static markup addition repeated
identically across four files (there is no shared header/sidebar partial in this no-build-step
architecture — every admin page inlines its own `<aside>`, so each must be edited individually).

## 2. Retail sections admin page (`sections.html` / `sections-crud.js`) — FR-004, FR-005

**Remove**: the "add new section" path. Concretely, `initializeSectionsPage`'s form always
renders in edit mode against an existing row — the page loads with the first section selected for
editing by default (or a clear "اختر قسمًا للتعديل" empty state if none is selected), never with
`editing = null` producing an empty "إضافة قسم جديد" form. The submit handler's
`if (editing) { updateSection(...) } else { createSection(...) }` branch is deleted along with
the `else` path — only `updateSection()` is ever called from this page.

**Add to the form**: an `is_active` checkbox (same markup pattern as `companies.html`'s "الشركة
نشطة" checkbox) and a `display_order` numeric input, both wired into the same `data` object the
submit handler already builds and passes to `updateSection()`.

**Add to the list table**: an "الحالة" (status) column using the same active/inactive badge
markup `renderCompanyRow()` already uses (`admin-templates.js`), and the existing "الترتيب"
column's `#${index+1}` display is joined by the new numeric input so order is editable inline,
not just displayed.

**Delete button confirm copy**: update the existing `confirm(...)` message (currently "سيتم حذف
القسم والمنتجات غير النشطة التابعة له") to reflect the corrected behavior — no products are
deleted any more (`wholesale-sections-api.md`'s `softDeleteSection()` fix): "هل تريد حذف هذا
القسم؟ سيتم إخفاؤه فقط، ولا يمكن حذفه إذا كان يحتوي على منتجات نشطة."

**`admin-templates.js` addition**: `renderSectionRow()` gains an `is_active` parameter to render
the new status badge; existing callers (`sections-crud.js`) pass `section.is_active` — a
backward-compatible additive change (new optional argument), not a breaking signature change to
`renderProductRow`/`renderCompanyRow`.

## 3. Companies + wholesale sections admin page (`companies.html` / `companies-crud.js`) — FR-006

**Change**: `initializeCompaniesPage` renders two clearly separated sections stacked on the page
(each with its own heading, form, and list — same `grid grid-cols-1 lg:grid-cols-3 gap-8` layout
repeated twice), not a tabbed interface (simplest structure, no new interaction pattern needed):

1. **الشركات** (existing companies CRUD, unchanged — form, list, edit/delete wiring exactly as
   today).
2. **أقسام الجملة** (new) — a form (name, `is_active` checkbox, `display_order` number input) and
   a list table (name, order, status, edit/delete actions), calling
   `fetchAllWholesaleSectionsAdmin()` / `createWholesaleSection()` / `updateWholesaleSection()` /
   `softDeleteWholesaleSection()` from the new `wholesale-sections-api.js`. Unlike retail sections,
   **create remains available** here (FR-002).

**`admin-templates.js` additions**: `renderWholesaleSectionFormFieldValues(editing)` and
`renderWholesaleSectionRow(section)`, following the exact shape of
`renderCompanyFormFieldValues`/`renderCompanyRow` (name + status badge + edit/delete buttons; no
logo column).

**Page title/description update**: `<title>` and the `<h1>` copy adjust to reflect both
responsibilities (e.g., "إدارة الشركات وأقسام الجملة"), and the sidebar's own nav-link label stays
"إدارة الشركات" everywhere (FR-015) — the wholesale-sections management area is discovered by
visiting that same link, not a new nav entry.

## 4. Product form (`products.html` / `products-crud.js`) — FR-007, FR-010, FR-017

**Add**: a wholesale-section `<select name="wholesale_section_id">` immediately alongside the
existing company `<select name="company_id">` (same "اختياري" optional-field styling), populated
from `fetchAllWholesaleSectionsAdmin()` (new import), pre-selecting `editing?.wholesale_section_id`
on edit, with a "بدون قسم جملة" empty option — exact structural mirror of the existing company
`<select>` (research.md Decision 1's verification target, satisfying FR-017).

**Submit handler**: the existing `updates` object gains one key:
`wholesale_section_id: data.wholesale_section_id || null`, alongside the existing `company_id`
and `wholesale_price` lines — no other change to the create/update flow.

**Form layout grouping (FR-007, FR-010 readability)**: the four wholesale-placement fields
(company `<select>`, new wholesale-section `<select>`, `wholesale_price` input) are visually
grouped under a small "بيانات البيع بالجملة (اختياري)" sub-heading, separated from the retail
fields (name, description, retail `section_id` `<select>`, `base_price`) — a presentational
grouping only, no change to how the fields are read/submitted.

**Product list view (`renderProductRow`, FR-010)**: currently shows one section badge (retail) and
`base_price` + a conditional `wholesale_price` line. **Add**: a second badge row showing the
wholesale section's name (via a name lookup map built the same way `renderProductRow`'s existing
`sectionName` argument is already resolved by its caller) and the company's name (already resolved
today, since `products-crud.js` already fetches `companies` — the row template just needs to
receive and render it), or a muted "لا يوجد تصنيف جملة" placeholder when the product has no
wholesale section, no company, and no wholesale price at all (FR-004's "no wholesale placement"
state). `renderProductRow()`'s signature grows from `(product, sectionName)` to
`(product, sectionName, wholesaleSectionName, companyName)` — an additive parameter change,
consistent with how `renderSectionRow()` gains its new parameter in the same release (§2 above).

## 5. Invoice creation (`invoices.html`) — `product_id` traceability (data-model.md Decision 5)

**Change**: `btnAddCatalog.onclick`'s pushed object gains one key:

```js
invoiceItems.push({
  id: Date.now().toString(),
  title,
  unitPrice: price,
  quantity: qty,
  product_id: selectedProduct.id   // NEW
});
```

`btnAddCustom.onclick`'s pushed object is **unchanged** (no `product_id` key at all — its absence
is how a manual line item is distinguished, per `data-model.md`). No other part of the invoice
flow (totals calculation, print view, history save/load) needs to change — the search/filter/
pre-fill/editable-price/mixed-entry behavior already works correctly (research.md Decision 1) and
is verified, not modified, by this plan.

## Files touched summary

| File | Change |
|---|---|
| `src/pages/admin/sections.html` | add nav link |
| `src/pages/admin/products.html` | add nav link |
| `src/pages/admin/invoices.html` | add nav link; `product_id` on catalog-add push |
| `src/pages/admin/customers.html` | add nav link |
| `src/js/admin/sections-crud.js` | remove create path; add `is_active`/`display_order` controls; updated confirm copy |
| `src/js/sections-api.js` | fix `softDeleteSection()` to soft-delete |
| `src/js/admin/companies-crud.js` | add wholesale-sections CRUD section alongside existing companies CRUD |
| `src/js/wholesale-sections-api.js` | **NEW** — admin CRUD data layer |
| `src/js/admin/products-crud.js` | add wholesale-section `<select>`; include `wholesale_section_id` in submit `updates` |
| `src/js/admin/admin-templates.js` | `renderSectionRow()` gains `is_active` param; `renderProductRow()` gains `wholesaleSectionName`/`companyName` params; new `renderWholesaleSectionFormFieldValues()`/`renderWholesaleSectionRow()` |
| `src/js/constants.js` | add `TABLES.wholesaleSections` |
| `supabase/migrations/014_wholesale_sections.sql` | **NEW** (contracts/database-schema.md) |
| `tests/rls-admin-access.test.js` | add `wholesale_sections` to `SENSITIVE_POLICIES` |
| `tests/admin-templates.test.js` | cover new/changed template functions |
