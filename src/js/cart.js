import {CART_KEY} from './constants.js';
const memory=new Map();
const storage=()=>globalThis.localStorage||{getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value),removeItem:key=>memory.delete(key)};
let lastActionTime = 0;
function throttleAction(action) {
  return function(...args) {
    const now = Date.now();
    if (now - lastActionTime < 300) return getCartItems();
    lastActionTime = now;
    return action(...args);
  };
}
export function getCartItems(){try{const items=JSON.parse(storage()?.getItem(CART_KEY)||'[]');return Array.isArray(items)?items:[]}catch{return []}}
function save(items){storage()?.setItem(CART_KEY,JSON.stringify(items));return items}
export function addToCart(product_id, variant_id, variant_label, price, variant_image, product_name, selected_size = null, selected_color = null) {
  const items = getCartItems();
  const found = items.find(item => item.variant_id === variant_id && item.selected_size === selected_size && item.selected_color === selected_color);
  if (found) {
    found.quantity += 1;
  } else {
    items.push({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
      product_id,
      variant_id,
      variant_label,
      price: Math.round(price),
      variant_image,
      product_name,
      quantity: 1,
      is_stale: false,
      selected_size,
      selected_color
    });
  }
  return save(items);
}
export const updateQuantity = throttleAction((itemId, newQuantity) => {
  const items = getCartItems();
  const item = items.find(entry => entry.id === itemId || entry.variant_id === itemId);
  if (!item) return items;
  if (Number(newQuantity) <= 0) return removeFromCart(itemId);
  item.quantity = Math.max(1, Math.floor(Number(newQuantity) || 1));
  return save(items);
});
export const removeFromCart = throttleAction((itemId) => {
  return save(getCartItems().filter(item => item.id !== itemId && item.variant_id !== itemId));
});
export function clearCart(){storage()?.removeItem(CART_KEY)}
export function calculateCartTotals(items){const active=items.filter(item=>!item.is_stale);return {subtotal:active.reduce((sum,item)=>sum+item.price*item.quantity,0),itemCount:active.reduce((sum,item)=>sum+item.quantity,0),hasStaleItems:items.some(item=>item.is_stale)}}

// Automatically append mock=true to local links if mock mode is active
if (typeof document !== 'undefined') {
  const updateLinks = () => {
    const isMock = sessionStorage.getItem('sb_mock_mode') === 'true' || new URLSearchParams(window.location.search).get('mock') === 'true';
    if (!isMock) return;
    
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('javascript:') || href.startsWith('#')) return;
      
      try {
        const url = new URL(href, window.location.origin + window.location.pathname);
        if (!url.searchParams.has('mock')) {
          url.searchParams.set('mock', 'true');
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
