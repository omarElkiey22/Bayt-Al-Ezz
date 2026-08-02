/**
 * Pricing Mode Module
 * Handles wholesale pricing mode detection, link rewrites, banner display, and product filtering.
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
  if (typeof document === 'undefined') return;
  if (!isWholesaleMode()) return;
  if (document.getElementById('wholesale-top-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'wholesale-top-banner';
  banner.className = 'bg-amber-600 text-white text-xs md:text-sm font-bold py-2 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-sm';
  banner.innerHTML = `
    <span class="material-symbols-outlined text-base">local_offer</span>
    <span>أنتم تتصفحون المتجر حالياً بأسعار الجملة 🏷️</span>
  `;

  document.body.prepend(banner);
  
  // Adjust sticky nav top position if exists
  const nav = document.querySelector('nav');
  if (nav && nav.classList.contains('sticky')) {
    nav.classList.remove('top-0');
    nav.style.top = `${banner.offsetHeight}px`;
  }
}

export function initPricingMode() {
  if (typeof document === 'undefined') return;
  
  const active = isWholesaleMode();
  if (!active) return;

  renderWholesaleBanner();

  const updateLinks = () => {
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('javascript:') || href.startsWith('#')) return;

      try {
        const url = new URL(href, window.location.origin + window.location.pathname);
        if (!url.searchParams.has('pricing')) {
          url.searchParams.set('pricing', 'wholesale');
          const relativePath = url.pathname.substring(url.pathname.lastIndexOf('/') + 1) + url.search + url.hash;
          a.setAttribute('href', relativePath);
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
