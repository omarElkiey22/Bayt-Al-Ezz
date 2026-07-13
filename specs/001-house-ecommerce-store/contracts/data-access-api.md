# Data Access API Contract

**Branch**: `001-house-ecommerce-store` | **Date**: 2026-07-14

This document defines the interface signatures for the data-access layer modules (`sections-api.js` and `products-api.js`). These modules sit between the UI rendering code and the Supabase client library, enforcing the Separation of Concerns principle (Principle IV).

---

## 1. Sections API (`src/js/sections-api.js`)

Provides CRUD and listing operations for house categories.

### `fetchActiveSections()`
Fetches sections currently active and not deleted for display on the storefront homepage.
- **Parameters**: None
- **Return Type**: `Promise<Array<SectionObject>>`
- **Output Record Shape**:
  ```javascript
  {
    id: "uuid-string",
    name: "اسم القسم باللغة العربية",
    slug: "url-friendly-slug",
    icon_name: "icon-filename.svg",
    display_order: 0
  }
  ```
- **Error Handling**: Log error to console, return empty array `[]` to prevent crashes.

### `fetchAllSectionsAdmin()`
Fetches all sections including inactive ones (but excluding soft-deleted ones) for the admin dashboard.
- **Parameters**: None
- **Return Type**: `Promise<Array<SectionObjectAdmin>>`
- **Output Record Shape**: Includes `is_active` toggle.
- **Error Handling**: Throw original database error.

### `createSection(sectionData)`
Inserts a new section into the database.
- **Parameters**: 
  - `sectionData` (`object`): `{ name, slug, icon_name, display_order }`
- **Return Type**: `Promise<SectionObject>`
- **Error Handling**: Throw validation or database duplicate errors.

### `updateSection(id, updates)`
Updates an existing section record.
- **Parameters**:
  - `id` (`string`): Section UUID
  - `updates` (`object`): `{ name, slug, icon_name, is_active, display_order }`
- **Return Type**: `Promise<SectionObject>`
- **Error Handling**: Throw error.

### `softDeleteSection(id)`
Sets `deleted_at = now()` on a section. Checks for linked products first.
- **Parameters**:
  - `id` (`string`): Section UUID
- **Return Type**: `Promise<boolean>` (returns true on success)
- **Error Handling**: Throw warning if section has active products assigned.

---

## 2. Products & Variants API (`src/js/products-api.js`)

Manages storefront listings and backend catalog mutations.

### `fetchProductsBySection(sectionSlug)`
Queries parent products under a given section, returning single listings with base prices.
- **Parameters**:
  - `sectionSlug` (`string`): Slug of target category
- **Return Type**: `Promise<Array<ProductListingObject>>`
- **Sorting**: Sorted by `created_at DESC` (newest first).
- **Storefront Rule**: Exclude items where `is_active = false` or `deleted_at IS NOT NULL`.
- **Output Shape**:
  ```javascript
  {
    id: "uuid-string",
    name: "اسم المنتج",
    primary_image_url: "url-to-storage",
    base_price: 350,
    has_different_prices: true // True if variant prices differ from base
  }
  ```

### `fetchProductDetails(productId)`
Retrieves a single product listing and all active variants linked to it.
- **Parameters**:
  - `productId` (`string`): Product UUID
- **Return Type**: `Promise<ProductDetailsObject>`
- **Output Shape**:
  ```javascript
  {
    id: "uuid-string",
    name: "اسم المنتج",
    description: "تفاصيل المنتج كاملة باللغة العربية",
    primary_image_url: "url-to-storage",
    base_price: 350,
    variants: [
      {
        id: "variant-uuid",
        label: "اللون أو المقاس",
        price_override: null, // Inherits base_price if null
        image_url: "variant-specific-image.webp", // Inherits parent if null
        is_in_stock: true
      }
    ]
  }
  ```

### `createProduct(productData, variantsList)`
Creates a parent product and inserts all declared variants inside a database transaction.
- **Parameters**:
  - `productData` (`object`): `{ name, description, section_id, primary_image_url, base_price }`
  - `variantsList` (`array`): Array of variant objects `{ label, price_override, image_url, is_in_stock }`
- **Return Type**: `Promise<ProductDetailsObject>`

### `updateProduct(id, productUpdates, variantsList)`
Updates a product listing and reconciles its variant child records (adding new, modifying existing, soft-deleting removed).
- **Parameters**:
  - `id` (`string`): Product UUID
  - `productUpdates` (`object`): Product modifications
  - `variantsList` (`array`): Updated variant set
- **Return Type**: `Promise<ProductDetailsObject>`

### `softDeleteProduct(id)`
Sets `deleted_at = now()` on the product record.
- **Parameters**:
  - `id` (`string`): Product UUID
- **Return Type**: `Promise<boolean>`

---

## 3. Merchant Settings API (`src/js/settings-api.js`)

Manages shop settings.

### `fetchMerchantNumber()`
Retrieves the target E.164 phone number configured for order messages.
- **Parameters**: None
- **Return Type**: `Promise<string>` (e.g. `"201001234567"`)

### `updateMerchantNumber(newNumber)`
Updates the destination phone number.
- **Parameters**:
  - `newNumber` (`string`): E.164 phone number
- **Return Type**: `Promise<boolean>`
