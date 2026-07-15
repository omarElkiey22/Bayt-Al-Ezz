# API Interface Contracts

This contract specifies the function signatures and returned data shapes for the data-access modules interfacing between the storefront/admin UIs and Supabase.

---

## 1. Sections Data Access Interface (`sections-api.js`)

All functions must handle error responses gracefully and return standard JS objects or arrays.

### `fetchActiveSections()`
Retrieves active, non-deleted sections for public display.
- **Inputs**: None
- **Returns**: `Promise<Array<Section>>`
- **Output Schema**:
  ```typescript
  interface Section {
    id: string; // UUID v4
    name: string; // Arabic name
    slug: string; // url slug
    icon_name: string; // icon filename (e.g. laundry.svg)
    display_order: number;
  }
  ```

### `fetchAllSectionsAdmin()`
Retrieves all sections (active or inactive, but non-deleted) for the admin table list.
- **Inputs**: None
- **Returns**: `Promise<Array<SectionAdmin>>`
- **Output Schema**:
  ```typescript
  interface SectionAdmin {
    id: string;
    name: string;
    slug: string;
    icon_name: string;
    display_order: number;
    is_active: boolean;
    created_at: string; // ISO date-time
  }
  ```

### `createSection(data)`
Creates a new section.
- **Inputs**:
  ```typescript
  interface SectionCreateInput {
    name: string;
    slug: string;
    icon_name: string;
    display_order: number;
  }
  ```
- **Returns**: `Promise<SectionAdmin>`

### `updateSection(id, data)`
Updates an existing section.
- **Inputs**:
  - `id`: `string` (UUID v4)
  - `data`: `Partial<SectionCreateInput> & { is_active?: boolean }`
- **Returns**: `Promise<SectionAdmin>`

### `softDeleteSection(id)`
Toggles the deleted state by setting `deleted_at = now()`.
- **Inputs**: `id` (`string`, UUID v4)
- **Returns**: `Promise<void>`

---

## 2. Products & Variants Interface (`products-api.js`)

### `fetchActiveProducts(sectionSlug)`
Fetches active products inside a specific section by its slug.
- **Inputs**: `sectionSlug` (`string`)
- **Returns**: `Promise<Array<ProductPreview>>`
- **Output Schema**:
  ```typescript
  interface ProductPreview {
    id: string;
    name: string;
    base_price: number;
    primary_image_url: string | null;
  }
  ```

### `fetchProductDetail(productId)`
Retrieves a detailed product view with all its available variants.
- **Inputs**: `productId` (`string`, UUID v4)
- **Returns**: `Promise<ProductDetail>`
- **Output Schema**:
  ```typescript
  interface ProductDetail {
    id: string;
    name: string;
    description: string;
    base_price: number;
    primary_image_url: string | null;
    is_active: boolean;
    product_variants: Array<{
      id: string;
      label: string;
      price_override: number | null;
      image_url: string | null;
      is_in_stock: boolean;
      display_order: number;
    }>;
  }
  ```

### `createProduct(data)`
Creates a new parent product listing.
- **Inputs**: `ProductCreateInput`
- **Returns**: `Promise<ProductDetail>`

### `updateProduct(id, data)`
Updates a product's details.
- **Inputs**: `id` (UUID), `data` (`Partial<ProductCreateInput> & { is_active?: boolean }`)
- **Returns**: `Promise<ProductDetail>`

### `softDeleteProduct(id)`
Soft-deletes a product by setting `deleted_at = now()`.
- **Inputs**: `id` (UUID)
- **Returns**: `Promise<void>`
