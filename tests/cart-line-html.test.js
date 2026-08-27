import { describe, it, expect } from 'vitest';
import { renderCartLineHTML } from '../src/js/cart-line-html.js';

// Found while doing variant analysis on /cso Finding #2/#3 (same class of
// bug: DB-sourced product data rendered into innerHTML with no escaping).
// cart.html renders product_name/variant_label/selected_size/selected_color
// -- all copied from product/variant data at add-to-cart time -- straight
// into innerHTML. Any customer who adds a poisoned product to their cart
// gets the payload executed in their own browser.

const evilItem = {
  id: '1',
  variant_id: 'v1',
  product_name: '<img src=x onerror=alert(1)>',
  variant_label: '<b>bold</b>',
  selected_size: '"><script>alert(2)</script>',
  selected_color: 'أحمر',
  variant_image: '',
  quantity: 1,
  price: 10,
  is_stale: false,
};

describe('renderCartLineHTML', () => {
  it('escapes a malicious product name in both the alt attribute and heading', () => {
    const html = renderCartLineHTML(evilItem, '10 ج.م', '10 ج.م');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes a malicious variant label', () => {
    const html = renderCartLineHTML(evilItem, '10 ج.م', '10 ج.م');
    expect(html).not.toContain('<b>bold</b>');
  });

  it('escapes a malicious selected size', () => {
    const html = renderCartLineHTML(evilItem, '10 ج.م', '10 ج.م');
    expect(html).not.toContain('<script>alert(2)</script>');
  });

  it('escapes an attribute-breakout payload in the image src (defense in depth)', () => {
    const item = { ...evilItem, variant_image: '"><img src=x onerror=alert(3)>' };
    const html = renderCartLineHTML(item, '10 ج.م', '10 ج.م');
    expect(html).not.toContain('"><img src=x onerror=alert(3)>');
  });

  it('still renders normal item details', () => {
    const html = renderCartLineHTML(
      { ...evilItem, product_name: 'منتج عادي', variant_label: 'افتراضي', selected_size: null, selected_color: null },
      '10 ج.م',
      '10 ج.م'
    );
    expect(html).toContain('منتج عادي');
  });
});
