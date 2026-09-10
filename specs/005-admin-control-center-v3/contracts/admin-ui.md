# Contract: Admin UI (Page Split, Icon Picker, Sidebar Restructure)

## Shared module: `src/js/admin/icon-picker.js` (new)

```js
export const ICONS = [/* same 15 filenames currently in sections-crud.js */];
export const ICON_DIRECTORY = '../../../public/assets/icons/';
export const DEFAULT_ICON = 'laundry.svg';

export function iconSource(iconName) {
  return `${ICON_DIRECTORY}${ICONS.includes(iconName) ? iconName : DEFAULT_ICON}`;
}

// Pure template. `special` is optional — { icon, label, hint } — only sections-crud.js passes it
// (the retail house-triangle "مميز" callout on Gift_Home.svg). Omitted entirely by
// wholesale-sections-crud.js, which gets a plain grid with no special-cased button.
export function renderIconPickerHTML(selectedIcon, { special } = {}) { /* ... */ }

// DOM wiring: click-toggles .icon-btn selected state, writes the chosen filename into the
// hidden input the caller names. No knowledge of `special` needed here -- the click behavior
// is identical for every icon, special-cased or not.
export function wireIconPicker(root, hiddenInputSelector) { /* ... */ }
```

`sections-crud.js` is refactored to import `ICONS`/`ICON_DIRECTORY`/`DEFAULT_ICON`/`iconSource`
from here instead of defining its own copies, and to call `renderIconPickerHTML(editing.icon_name,
{ special: { icon: 'Gift_Home.svg', label: 'مميز', hint: 'اختيار أيقونة يضع القسم في موقع خاص داخل
مثلث البيت (الأعلى).' } })` in place of its current inline `ICONS.map(...)` block. Its existing
click-handling `root.querySelectorAll('.icon-btn')...` block is replaced by
`wireIconPicker(root, '#selected-icon-input')`. **No visible/functional change** to the retail
sections admin page — this is a pure extraction, verified by keeping the rendered HTML/behavior
identical before and after.

## `wholesale-sections.html` — new page

Mirrors `sections.html`'s page shell (same head/Tailwind setup, same mobile-topbar/sidebar/logout
wiring pattern) with a body that mounts `initializeWholesaleSectionsPage()` from the new
`src/js/admin/wholesale-sections-crud.js`, exactly as `sections.html` mounts
`initializeSectionsPage()` today.

### `src/js/admin/wholesale-sections-crud.js` — new (moved out of `companies-crud.js`)

`initializeWholesaleSectionsPage(root)` — same shape as `initializeSectionsPage()`, but:

- **Full CRUD**, unlike retail sections: create, rename, reorder (`display_order`),
  activate/deactivate, soft-delete. This is the create-capable form feature 004 already built
  into `companies-crud.js`'s wholesale-section block — moved here unchanged in capability
  (FR-007), plus the new icon field (below).
- Form gains an icon field: `renderIconPickerHTML(editing?.icon_name, {})` (no `special` config —
  plain grid) wired via `wireIconPicker(root, '#selected-icon-input')`, same shared module as
  retail's.
- List table gains an icon thumbnail column, using `iconSource(section.icon_name)` — same helper
  retail's `renderSectionRow` already uses via its `iconSrc` param.
- Uses `fetchAllWholesaleSectionsAdmin`/`createWholesaleSection`/`updateWholesaleSection`/
  `softDeleteWholesaleSection` from `wholesale-sections-api.js` (unchanged functions, just a new
  caller) plus the submit payload gains `icon_name: rawData.icon_name`.

### `src/js/admin/admin-templates.js` — extended

- `renderWholesaleSectionFormFieldValues(editing)` gains `icon_name` in its returned object
  (defaulting to `DEFAULT_ICON` when absent, mirroring `renderSectionFormFieldValues`'s existing
  defaulting style for other fields).
- `renderWholesaleSectionRow(section, index)` gains an icon `<img>` cell, sourced via
  `iconSource(section.icon_name)` — same visual treatment as `renderSectionRow`'s existing icon
  column, minus the "مميز" badge (retail-only, per icon-picker.js's `special` design above).

## `companies.html` / `src/js/admin/companies-crud.js` — trimmed

- `<title>` reverts from "إدارة الشركات وأقسام الجملة" back to "إدارة الشركات".
- Page heading/description revert to companies-only copy.
- `initializeCompaniesPage()` loses: the `fetchAllWholesaleSectionsAdmin` import, the
  `editingWholesaleSection` state variable, the second form (`#wholesale-section-form`) and second
  table (`#admin-wholesale-sections-tbody`) blocks, and their event wiring. Companies-only CRUD
  (form + list + logo upload, Decision 6) remains exactly as-is — this is a pure removal, not a
  rewrite of what stays.
- `renderWholesaleSectionFormFieldValues`/`renderWholesaleSectionRow` imports removed from
  `companies-crud.js` (no longer called from here — called from the new
  `wholesale-sections-crud.js` instead).

## Shared module: `src/js/admin/admin-nav.js` (new)

```js
// activePage: the current page's own filename, e.g. 'products.html' -- each admin page passes
// its own name (a one-line literal at the call site, not derived from location.pathname, so it
// works identically regardless of deployment path depth).
export function renderAdminSidebarHTML(activePage) { /* returns the <nav>...</nav> inner HTML */ }

// Call once after injecting the HTML above into the DOM. Wires each group's toggle button
// (click -> expand/collapse) and applies the FR-016 auto-expand: the group containing activePage
// starts expanded, the other starts collapsed.
export function initAdminSidebarBehavior(root, activePage) { /* ... */ }
```

Structure (FR-012–FR-014), in order:

1. `الرئيسية` → `dashboard.html` — flat link, always visible.
2. `إدارة المنتجات` → `products.html` — flat link, always visible.
3. Group **`إدارة متجر المستهلك`**:
   - `إدارة أقسام متجر المستهلك` → `sections.html`
4. Group **`إدارة متجر الجملة`**:
   - `إدارة أقسام متجر الجملة` → `wholesale-sections.html`
   - `إدارة شركات متجر الجملة` → `companies.html`
   - `إنشاء وطباعة فاتورة` → `invoices.html`
   - `إدارة العملاء` → `customers.html`

### Per-page integration (all 7 admin pages)

Each admin page's existing `<nav class="flex-grow p-4 flex flex-col gap-2">...</nav>` block
(hand-written, one per page today) is replaced with an empty mount point:

```html
<nav class="flex-grow p-4 flex flex-col gap-2" id="admin-nav"></nav>
```

and its module script adds, alongside the existing `requireAdmin()`/logout/mobile-sidebar-toggle
wiring already present on every page:

```js
import { renderAdminSidebarHTML, initAdminSidebarBehavior } from '../../js/admin/admin-nav.js';
document.getElementById('admin-nav').innerHTML = renderAdminSidebarHTML('dashboard.html'); // per-page literal
initAdminSidebarBehavior(document.getElementById('admin-nav'), 'dashboard.html');
```

(literal second argument differs per page: `'dashboard.html'`, `'products.html'`, `'sections.html'`,
`'companies.html'`, `'wholesale-sections.html'`, `'invoices.html'`, `'customers.html'`).

No other part of any of these 7 pages changes because of this contract — mobile-topbar, logout
buttons, sidebar-backdrop toggle, and every page's own main-content logic are all untouched.
