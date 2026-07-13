# WhatsApp Checkout Message & Fallback Contract

**Branch**: `001-house-ecommerce-store` | **Date**: 2026-07-14

This document defines the layout, encoding rules, and fallback mechanisms for transferring checkout orders from the storefront client to the merchant's WhatsApp interface.

---

## 1. WhatsApp Link Scheme

The storefront initiates checkout by redirecting the client browser or launching the WhatsApp application using a deep link matching this format:

```text
https://wa.me/{phone_number}?text={encoded_message}
```

### Components
- `{phone_number}`: The merchant's mobile number fetched dynamically from `merchant_settings` table (formatted in E.164, without leading `+` or `00`, e.g. `201001234567` for Egypt).
- `{encoded_message}`: The UTF-8 URL-encoded Arabic order summary string.

---

## 2. Order Message Template (Arabic)

The message generated from the cart items array must follow this exact textual layout (in RTL format):

```text
طلب جديد من بيت العز 🏠
-------------------------
التاريخ: 14-07-2026

المنتجات المطلوبة:
- طقم ملايات تركي (اللون: أزرق سماوي)
  الكمية: 2 | السعر: 350 ج.م | الإجمالي: 700 ج.م

- مفرش مطبخ مقاوم للحرارة (افتراضي)
  الكمية: 1 | السعر: 120 ج.م | الإجمالي: 120 ج.م
-------------------------
إجمالي قيمة الطلب: 820 ج.م
-------------------------
من فضلك أكد لي تفاصيل الشحن والتوصيل.
```

### Generation Logic Rules
- **Date Formatting**: Displayed dynamically using client system time formatted as `DD-MM-YYYY`.
- **Default Variant Display**: If the variant label matches `"افتراضي"`, output it explicitly as `(افتراضي)` or omit the variant detail depending on store configuration (recommended: include explicitly).
- **Stale Items Exclusion**: Stale items (where `is_stale === true`) MUST be omitted entirely from the text generation.
- **Numbers Formatting**: Output numbers cleanly as simple digits without decimals.

---

## 3. URL Encoding Standards

Because the order string is in Arabic, native string representation will break raw HTTP calls. The string MUST be formatted using JavaScript's native encoding function:

```javascript
const orderText = buildOrderString(cartItems);
const encodedMessage = encodeURIComponent(orderText);
const whatsappUrl = `https://wa.me/${merchantNumber}?text=${encodedMessage}`;
```

---

## 4. Persistent Fallback Area UI Spec

To guarantee a reliable shopping flow (FR-029), the cart checkout section renders a fallback module alongside the WhatsApp link. This interface contains two key elements:

```text
┌────────────────────────────────────────────────────────┐
│ [ إرسال الطلب عبر واتساب ]                             │ (Primary Button)
├────────────────────────────────────────────────────────┤
│ للتواصل المباشر في حال عدم عمل الزر أعلاه:            │
│ 1. [ نسخ نص الطلب ]                                   │ (Copy Button)
│ 2. رقم الهاتف للاتصال أو الإرسال يدويًا:               │
│    [ +20 100 123 4567 ]                                │ (Tappable tel: Link)
│                                                        │
│ نص الطلب:                                              │
│ ┌────────────────────────────────────────────────────┐ │
│ │ طلب جديد من بيت العز 🏠...                          │ │ (Read-only Textarea)
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Fallback Elements Specs

#### 1. Copy Order Button
- Action: Copies the raw, unencoded Arabic order text to the system clipboard using `navigator.clipboard.writeText(orderText)`.
- UI behavior: On successful copy, temporary state feedback is displayed (e.g. changing text to "تم النسخ ✓" for 2 seconds).

#### 2. Tappable Phone Link
- Format: A hyperlink with the `tel:` scheme.
- Markup: `<a href="tel:+201001234567" class="phone-link">+20 100 123 4567</a>`
- Behavior: Tapping on mobile triggers the device dialer with the merchant's number prefilled.

#### 3. Read-Only Order Summary Container
- A textarea or blockquote container showing the preview of the formatted Arabic order text so the visitor can see what is being copied.
- Attributes: `readonly` (if textarea) or styled to prevent manual edits.
