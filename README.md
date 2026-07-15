
# Bayt Al-Ezz Storefront

## V2 Upgrades

- **Assets Structure**: Icons are now separate SVG files under `public/assets/icons/`. A placeholder image is available at `public/assets/placeholder.svg`.
- **Authentication**: Admin dashboard is secured via Magic Link passwordless auth.
- **RLS**: Row Level Security is enforced on Supabase tables.
- **Anti-Spam**: Cart actions and buttons are rate-limited to 1 second. Text inputs are sanitized to prevent XSS.

Please refer to `specs/002-v2-storefront-upgrade` for detailed plans.
