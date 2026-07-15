# Quickstart Validation Guide: V2 Storefront Upgrade

This document outlines validation scenarios, setup procedures, and test instructions to verify that the upgraded features function correctly from end to end.

For underlying schemas, interfaces, and parameters, please see the following specifications:
- Data Schema: [data-model.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/data-model.md)
- Contracts: [api.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/contracts/api.md), [local-storage.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/contracts/local-storage.md), and [whatsapp.md](file:///D:/مشاريع/Bayt%20Al-Ezz/specs/002-v2-storefront-upgrade/contracts/whatsapp.md)

---

## 1. Setup & Environment Verification

### Prerequisites
1. Local Development Server: Node.js (or any static HTTP server like Python's `http.server`).
2. Supabase Instance: Live credentials or LocalStorage mock enabled (toggle `USE_MOCK = true` in browser console to run tests without internet connection).

### Starting the Storefront
To run the server locally:
```bash
# Start a local static server
npx http-server ./ -p 5500
```
Open `http://localhost:5500/src/pages/index.html` in your browser.

---

## 2. Validation Scenarios

### Scenario 1: Auto-Opening House Animation (storefront)
1. Clear session cache: run `sessionStorage.clear()` in the browser console.
2. Load page: Navigate to `http://localhost:5500/src/pages/index.html`.
3. **Verify Closed State**: The closed house image (`Frame 1.svg`) must render immediately. The text "اضغط على الباب الأزرق لفتح البيت" must NOT be visible (deprecated in v2.0).
4. **Verify Transition**: Wait ~2 seconds. The homepage must automatically and smoothly transition to `Frame 2.svg` (interior layout overlayed with 12 room names).
5. **Verify Interactivity**: Hover over and click a room zone (e.g., "منظفات"). It must highlight and redirect to: `category.html?section=cleaning`.
6. **Verify No-Replay on Return**: Click "بيت العز" in the header navigation to return to the homepage. The house must display in its open state immediately without repeating the animation or delay.

---

### Scenario 2: Magic Link Admin Login (security)
1. Go to: `http://localhost:5500/src/pages/admin/dashboard.html` without being logged in.
2. **Verify Redirect**: You must be redirected to `login.html` immediately.
3. Enter email: Enter the administrator email (e.g. `admin@baytalezz.com`).
4. **Verify Submission**: Click "إرسال رابط الدخول". The UI must update to show a check-your-email message. No password fields should exist.
5. Simulated login (if `USE_MOCK = true`):
   - Set the mock session by clicking the mock login helper link or console command.
6. Verify redirect: The browser redirects to `dashboard.html` with access tokens in the URL.
7. Access admin pages (Sections / Products): They must load without redirecting back to login.

---

### Scenario 3: Section Icon Selection (admin panels)
1. Go to: `http://localhost:5500/src/pages/admin/sections.html` as an authenticated admin.
2. Click "تعديل" (edit) on an existing section or fill the "إضافة قسم جديد" form.
3. **Verify Icon Picker**: The "اسم ملف الأيقونة" text input must be replaced by a visual gallery showing the actual icon shapes.
4. Select a thumbnail icon (e.g., the shaving blade for gentleman/men category).
5. Click "حفظ القسم".
6. **Verify Live Preview**:
   - The sections table list must show the chosen icon thumbnail.
   - Return to the homepage storefront. Verify the corresponding room zone reflects the new icon shape.

---

### Scenario 4: Image-less Products (storefront grid)
1. Go to: `http://localhost:5500/src/pages/admin/products.html` as an authenticated admin.
2. Click "إضافة منتج جديد".
3. Fill out product fields (Name: "منتج تجريبي", Price: "100"), but leave the image field empty.
4. Click "حفظ المنتج" and verify it saves successfully.
5. Go to the storefront: `http://localhost:5500/src/pages/category.html?section=laundry` (or the section chosen).
6. **Verify Fallback Asset**: The newly created product card must show `/public/assets/placeholder.svg` in place of the missing product photo. No blank images, default browser icons, or broken image markers should appear.

---

### Scenario 5: Security Hardening & Rate Limiting
1. Go to the product category or cart page.
2. Double-click the "أضف إلى السلة" or "إرسال عبر واتساب" button rapidly.
3. **Verify UI Throttling**: The clicked button must become disabled for exactly 1.0 second. Double clicks must not generate duplicate actions or launch multiple tabs.
4. Go to the database interface or admin CRUD forms:
   - Try to submit a name containing HTML script tags: `<script>alert('xss')</script>`.
   - **Verify Rejection/Sanitization**: The form must clean the input before sending, and the database/backend constraints must block raw executable tags.
