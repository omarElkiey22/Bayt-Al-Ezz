import { describe, it, expect, beforeEach } from 'vitest';
import { filterWholesaleProducts, getProductPrice } from '../src/js/pricing-mode.js';
import { buildOrderText } from '../src/js/utils.js';

describe('Wholesale Pricing Mode Logic', () => {
  const sampleProducts = [
    { id: '1', name: 'منتج أ', base_price: 100, wholesale_price: 80 },
    { id: '2', name: 'منتج ب', base_price: 150, wholesale_price: null },
    { id: '3', name: 'منتج ج', base_price: 200, wholesale_price: 160 }
  ];

  it('filters products to include only those with a valid wholesale_price in wholesale mode', () => {
    // Mock sessionStorage / window pricing mode
    globalThis.sessionStorage = {
      getItem: (key) => key === 'bayt_pricing_mode' ? 'wholesale' : null,
      setItem: () => {}
    };

    const filtered = filterWholesaleProducts(sampleProducts);
    expect(filtered).toHaveLength(2);
    expect(filtered.map(p => p.id)).toEqual(['1', '3']);
  });

  it('returns wholesale_price when in wholesale mode', () => {
    globalThis.sessionStorage = {
      getItem: (key) => key === 'bayt_pricing_mode' ? 'wholesale' : null,
      setItem: () => {}
    };

    const price = getProductPrice(sampleProducts[0]);
    expect(price).toBe(80);
  });

  it('returns base_price when not in wholesale mode', () => {
    globalThis.sessionStorage = {
      getItem: () => null,
      setItem: () => {}
    };

    const price = getProductPrice(sampleProducts[0]);
    expect(price).toBe(100);
  });

  it('builds order text with wholesale header tag when isWholesale is true', () => {
    const items = [
      { product_name: 'طقم كنب', price: 500, quantity: 1, is_stale: false }
    ];
    const text = buildOrderText(items, new Date('2026-08-02'), true);
    expect(text).toContain('🏷️ *طلب جملة*');
    expect(text).toContain('طقم كنب');
  });
});
