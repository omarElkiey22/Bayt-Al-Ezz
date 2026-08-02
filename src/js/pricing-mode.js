/**
 * Pricing Mode Module
 * Handles wholesale pricing mode detection, link rewrites, and product filtering.
 */

const STORAGE_KEY = 'bayt_pricing_mode';

export function isWholesaleMode() {
  if (typeof globalThis.window !== 'undefined' && globalThis.window.location) {
    const urlParam = new URLSearchParams(globalThis.window.location.search).get('pricing');
    if (urlParam === 'wholesale') {
      if (globalThis.sessionStorage) globalThis.sessionStorage.setItem(STORAGE_KEY, 'wholesale');
      return true;
    }
    if (urlParam === 'normal' || urlParam === 'retail') {
      if (globalThis.sessionStorage) globalThis.sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
  }
  if (typeof globalThis.sessionStorage !== 'undefined' && globalThis.sessionStorage) {
    return globalThis.sessionStorage.getItem(STORAGE_KEY) === 'wholesale';
  }
  return false;
}

export function filterWholesaleProducts(products) {
  if (!isWholesaleMode()) return products || [];
  return (products || []).filter(p => p.wholesale_price !== null && p.wholesale_price !== undefined && p.wholesale_price > 0);
}

export function getProductPrice(product) {
  if (!product) return 0;
  if (isWholesaleMode() && product.wholesale_price !== null && product.wholesale_price !== undefined && product.wholesale_price > 0) {
    return product.wholesale_price;
  }
  return product.base_price || 0;
}

export function renderWholesaleBanner() {
  // Banner removed per user request
  return;
}

export function initPricingMode() {
  if (typeof document === 'undefined') return;
  
  const active = isWholesaleMode();
  if (!active) return;

  const updateLinks = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      // Skip admin links so admin login and dashboard remain intact
      if (href.includes('admin/')) return;

      try {
        const u = new URL(a.href);
        if (u.origin === window.location.origin && !u.searchParams.has('pricing')) {
          u.searchParams.set('pricing', 'wholesale');
          const originalPath = href.split('?')[0].split('#')[0];
          const newSearch = u.search;
          const hash = u.hash;
          a.setAttribute('href', `${originalPath}${newSearch}${hash}`);
        }
      } catch (e) {
        // ignore invalid URLs
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateLinks();
      const observer = new MutationObserver(updateLinks);
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    updateLinks();
    const observer = new MutationObserver(updateLinks);
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
