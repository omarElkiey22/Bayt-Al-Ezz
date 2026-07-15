# WhatsApp Checkout Interface Contract

This contract defines the format of the deep link generated to send orders from the cart to the merchant's WhatsApp.

---

## 1. Destination Configuration
- **WhatsApp Target Number**: Configured from `merchant_settings` table (initial value: `+201555077347`).
- **Base API URL**: `https://wa.me/{whatsapp_number}` or `https://api.whatsapp.com/send?phone={whatsapp_number}`

---

## 2. Request Contract

The frontend must redirect the browser to:
`https://wa.me/{whatsapp_number}?text={encoded_text}`

### Parameter Definitions
- `whatsapp_number`: String containing only numbers and a leading country code (no `+`, dashes, or spaces). E.g., `201555077347`.
- `encoded_text`: URL-encoded Arabic string representing the order contents.

---

## 3. Order Message Format (Arabic)

The pre-filled text message must match the following template:

```text
السلام عليكم ورحمة الله وبركاته،
أود طلب المنتجات التالية من بيت العز:

[للجميع]
- {اسم المنتج} [المواصفات/النوع] x {الكمية} - {السعر الإجمالي للمنتج} ج.م

الإجمالي الكلي: {إجمالي الحساب} ج.م
----------------------------------
شكراً لكم!
```

### Example Encoded URL
If the cart contains:
- 1 x "فستان صيفي مشجر" (450 ج.م)
- 2 x "طقم معالق خشبية" (85 ج.م each)

The total price is `450 + 170 = 620 ج.م`.
The message will format as:
```text
السلام عليكم ورحمة الله وبركاته،
أود طلب المنتجات التالية من بيت العز:

- فستان صيفي مشجر x 1 - 450 ج.م
- طقم معالق خشبية x 2 - 170 ج.م

الإجمالي الكلي: 620 ج.م
----------------------------------
شكراً لكم!
```

This text must be URL-encoded as the `text` parameter in the final WhatsApp link.
