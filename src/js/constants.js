// Bayt Al-Ezz Constants Mapping
// Glossary/Terminology Mapping (L1 Alignment):
// - "Section" (أقسام) in the database matches "Room" (غرفة) or "Zone" (منطقة تفاعلية) in the storefront homepage design.
// - All interactive rooms mapped in public/assets/house-coordinates.json correspond to active rows in the 'sections' table.

export const TABLES = {
  settings: 'merchant_settings',
  sections: 'sections',
  products: 'products',
  variants: 'product_variants'
};

export const PALETTE = {
  primary: '#0056B3',
  navy: '#1A237E',
  gray: '#9E9E9E',
  neutral: '#75777E',
  white: '#F8F9FA'
};

export const MAX_SECTIONS = 12; // Maximum visual zones allowed on the Frame 2 SVG homepage
export const CART_KEY = 'bayt_al_ezz_cart';
