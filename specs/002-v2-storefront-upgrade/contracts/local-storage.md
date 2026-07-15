# Local Storage Schema Contract

This contract defines the structure of the visitor's shopping cart state saved in the browser's `localStorage`.

---

## 1. Cart Storage Location
All shopping cart items are serialized and saved under the key:
`bayt_al_ezz_cart`

---

## 2. Cart Item Schema

The cart stores an array of item objects containing selected options.

```typescript
type Cart = Array<CartItem>;

interface CartItem {
  productId: string;        // UUID of the parent product
  variantId: string | null; // UUID of the selected variant (null if product has no variants)
  name: string;             // Product name in Arabic
  variantLabel: string;     // Variant label (empty string if no variant selected)
  price: number;            // Final price per unit in EGP (inherited from product or override)
  imageUrl: string;         // Thumbnail image URL (resolved with fallback fallback placeholder)
  quantity: number;         // Quantity of this item added to cart
}
```

---

## 3. Cart Summary and Calculations

Any calculation utility (e.g., in `cart.js`) must calculate totals according to the following formulas:

- **Item Count**: Sum of `quantity` for all items in the array.
- **Cart Subtotal**: Sum of `price * quantity` for all items in the array.
- **WhatsApp Checkout Payload**: Uses these values to compile the final URL-encoded string.
