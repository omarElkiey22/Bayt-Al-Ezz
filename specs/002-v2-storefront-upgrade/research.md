# Research & Decisions: V2 Storefront Upgrade

This document outlines the resolved technical unknowns and design decisions for the Bayt Al-Ezz v2 storefront upgrade.

---

## 1. Magic Link Redirect Flow in Vanilla JS

### Decision
Use Supabase Auth's `signInWithOtp` method with `options.emailRedirectTo` configured to redirect back to the static admin dashboard URL (e.g., `location.origin + '/src/pages/admin/dashboard.html'`).

### Rationale
Since the project uses a no-build-step static architecture on Vercel:
1. The Magic Link token is appended by Supabase to the redirect URL as a hash fragment (e.g., `#access_token=...&type=magiclink`).
2. When the user lands on the redirected dashboard (or login page), the Supabase client JS library automatically reads the hash fragment, exchanges the tokens for a session, and saves it in the browser's storage (e.g., LocalStorage).
3. The existing `auth-gate.js` already calls `supabase.auth.getSession()` to check if a valid session exists. It will retrieve this session seamlessly without needing a server-side redirect or auth-exchange handler.

### Alternatives Considered
- **Password Auth**: Rejected because passwordless login is a non-negotiable security requirement of the v2.0.0 constitution.
- **Dedicated Auth Edge Function**: Rejected because the Supabase client handles URL fragment parsing and session storage client-side in static HTML/JS without requiring custom backend middleware.

---

## 2. Two-Phase SVG House Hero Transition

### Decision
Render both `Frame 1.svg` (closed house) and `Frame 2.svg` (open house) inline within layered absolute-positioned wrappers inside `<div id="svg-host">`.
- Use a fade-out animation on Frame 1 and a fade-in animation on Frame 2 after a delay of 2.0 seconds.
- Store a flag in `sessionStorage` (e.g., `house-hero-opened = 'true'`) upon completion.
- If the page loads and `sessionStorage.getItem('house-hero-opened') === 'true'`, render Frame 2 immediately with no transition animation and Frame 1 hidden.

### Rationale
1. **Pixel-Perfect Fidelity**: Morphing paths dynamically inside a single SVG is fragile and prone to render bugs because the illustrations in Frame 1 (closed windows, doors) and Frame 2 (12 complex rooms, navy divider lines) are completely different. Layering and fading is 100% reliable.
2. **Dynamic Overlays**: Inline SVGs allow us to inject coordinate-based interactive HTML zones directly over the rooms for clickable regions.
3. **Responsive and Accessible**: Layered containers perform extremely well on mobile browsers and support WCAG-compliant keyboard focus transitions.
4. **No Replay**: Using `sessionStorage` ensures returning visitors (using back navigation or navigating home) do not suffer repetitive delay times.

### Alternatives Considered
- **Single SVG with Path Morphing**: Rejected due to extreme design difference between closed and open states, making path interpolation impractical.
- **CSS SVG Masking**: Rejected as compatibility on older mobile devices is inconsistent.

---

## 3. Admin Visual Icon Picker

### Decision
Extract the 12 icons from `Frame 3.svg` as standalone SVG files and place them in `public/assets/icons/`.
- Replace the text input for `icon_name` in the Section CRUD form with a CSS grid of 12 selectable visual cells.
- Each cell contains an inline SVG or `<img>` rendering the icon shape.
- Selecting a cell updates a hidden input (`name="icon_name"`) with the corresponding filename (e.g., `laundry.svg`).
- In the table listing the sections, render the thumbnail of the selected icon instead of its filename string.

### Rationale
This satisfies the client's need for a visual preview for non-technical managers and stores the reference standardly in the database.

### Alternatives Considered
- **Runtime SVG Parsing**: Extracting icons from `Frame 3.svg` in real-time in the browser. Rejected because it increases page weight, causes layout layout shifts (CLS), and is fragile.

---

## 4. Security Hardening (RLS & Sanitization)

### Decision
1. **RLS Policies**: Enforce that public SELECT queries only read rows where `is_active = true` AND `deleted_at IS NULL`. Restrict ALL write operations (INSERT, UPDATE, DELETE) to authenticated sessions.
2. **Server-Side Constraints**: Add Check Constraints on the Postgres tables to enforce minimum length for names/slugs and non-negative prices.
3. **Throttling**: Disable interactive buttons (e.g., "Add to Cart" and "Send Order") for 1.0 second immediately after clicking.
4. **Input Sanitization**:
   - Client-side: Strip HTML and script tags using a regex helper (`/<\/?[^>]+(>|$)/g`) in `utils.js` before calling the API.
   - Database-level constraint/trigger: Add a trigger to the database that scans incoming names/descriptions and rejects transactions containing HTML markup (e.g., `<script>` or HTML tags) to prevent database pollution.

### Rationale
Combining database constraints with UI-level throttling and API sanitization provides defense-in-depth against malicious scripting and spam.

### Alternatives Considered
- **Vercel API Middleware**: Rejected because the project has a no-build-step architecture with direct client-side Supabase database interaction. Securing the database directly via constraints, triggers, and RLS is the most robust approach.
