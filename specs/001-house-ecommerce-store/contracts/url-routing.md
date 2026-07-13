# URL Routing Contract

**Branch**: `001-house-ecommerce-store` | **Date**: 2026-07-14

This contract defines the URL routes, query parameters, and navigation structures for both the public e-commerce storefront and the authenticated merchant admin panel.

---

## 1. Storefront Public Routes

Since the project operates as a static site (No-Build-Step Principle), routing is resolved via static file mapping.

### Homepage
- **URL Path**: `/src/pages/index.html` (Accessible as `/` or `/index.html` on Vercel deployment)
- **Role**: Displays the isometric house hero graphic. Clicking the door opens the house to reveal the 12 room-sections.
- **Parameters**: None

### Category Listing Page
- **URL Path**: `/src/pages/category.html` (Deployed as `/category.html`)
- **Role**: Lists products assigned to a section.
- **Query Parameter**: `section` (URL slug string, e.g. `category.html?section=men`)
- **Routing Rules**:
  - If the `section` parameter is missing or empty, navigate back to `/index.html`.
  - If the section slug does not exist in the database, render the Arabic error state ("القسم غير موجود" + link back to home).

### Product Detail Page
- **URL Path**: `/src/pages/product.html` (Deployed as `/product.html`)
- **Role**: Shows product description, image gallery, variant switcher, and add to cart buttons.
- **Query Parameter**: `id` (UUID string, e.g. `product.html?id=c220f8c8-f86a-493f-a3c3-6b801a61c5e4`)
- **Routing Rules**:
  - If the `id` parameter is missing or not a valid UUID format, redirect to `/index.html`.
  - If the product record does not exist or has been soft-deleted, display a friendly error page.

### Cart Page
- **URL Path**: `/src/pages/cart.html` (Deployed as `/cart.html`)
- **Role**: Displays guest cart items, adjustments, and WhatsApp checkout fallbacks.
- **Parameters**: None

---

## 2. Admin Portal Routes

The admin pages are secured by client-side authentication checks.

### Admin Login
- **URL Path**: `/src/pages/admin/login.html`
- **Role**: Email/password authentication gate.
- **Behavior**: If a user is already authenticated, redirect to `dashboard.html`.

### Admin Dashboard
- **URL Path**: `/src/pages/admin/dashboard.html`
- **Role**: Overview screen displaying quick stats and primary navigation links (Manage Sections, Manage Products).
- **Security**: Redirect to `login.html` if user session is not authenticated.

### Sections Management
- **URL Path**: `/src/pages/admin/sections.html`
- **Role**: Lists current sections, handles create, edit forms, and delete prompts.
- **Security**: Authenticated session required.

### Products Management
- **URL Path**: `/src/pages/admin/products.html`
- **Role**: Product catalog editor (creating items, adjusting prices, toggling active states, editing variants).
- **Security**: Authenticated session required.

---

## 3. Router Navigation Helpers (`src/js/utils.js`)

Common JavaScript utility helpers are utilized for parsing and navigating:

```javascript
/**
 * Extract a query parameter value by name from the window location.
 * @param {string} param - Parameter name
 * @returns {string|null} - Parameter value or null if not found
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Validates if a string matches UUIDv4 pattern.
 * @param {string} uuid - String to check
 * @returns {boolean} - True if valid UUID
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```
