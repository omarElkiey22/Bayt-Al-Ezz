import { describe, it, expect, vi } from 'vitest';

const mockProducts = [
  { id: '1', name: 'منظف ملابس لافندر', description: 'منظف ملابس 3 لتر', section_id: 'sec1', is_active: true, deleted_at: null, base_price: 120, product_variants: [] },
  { id: '2', name: 'مسحوق غسيل أوتوماتيك', description: 'مسحوق 5 كيلو', section_id: 'sec1', is_active: true, deleted_at: null, base_price: 240, product_variants: [] },
  { id: '3', name: 'طقم معالق خشبية', description: 'طقم 5 ملاعق', section_id: 'sec2', is_active: true, deleted_at: null, base_price: 85, product_variants: [] }
];

const mockSections = [
  { id: 'sec1', name: 'الغسالة', icon_name: 'laundry.svg', is_active: true, deleted_at: null },
  { id: 'sec2', name: 'رفايع المطبخ', icon_name: 'kitchen.svg', is_active: true, deleted_at: null }
];

vi.mock('../src/js/supabase-client.js', () => {
  return {
    requireSupabase: () => ({
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } })
      },
      from: (table) => {
        if (table === 'sections') {
          return {
            select: () => ({
              is: () => ({
                eq: () => Promise.resolve({ data: mockSections, error: null })
              })
            })
          };
        }
        if (table === 'products') {
          return {
            select: () => {
              const builder = {
                is: () => builder,
                eq: () => builder,
                ilike: (col, pattern) => {
                  const search = pattern.replace(/%/g, '').toLowerCase();
                  const matched = mockProducts.filter(p => p.name.toLowerCase().includes(search));
                  return {
                    order: () => Promise.resolve({ data: matched, error: null })
                  };
                }
              };
              return builder;
            }
          };
        }
      }
    })
  };
});

import { searchProducts } from '../src/js/products-api.js';

describe('Product Search API', () => {
  it('returns empty array when query is empty or whitespace', async () => {
    const emptyResult = await searchProducts('');
    const whitespaceResult = await searchProducts('   ');
    expect(emptyResult).toEqual([]);
    expect(whitespaceResult).toEqual([]);
  });

  it('finds products by partial matching name (Arabic)', async () => {
    const results = await searchProducts('منظف');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('منظف ملابس لافندر');
    expect(results[0].section_name).toBe('الغسالة');
  });

  it('returns empty array when no product matches search query', async () => {
    const results = await searchProducts('منتج غير موجود 999');
    expect(results).toEqual([]);
  });
});
