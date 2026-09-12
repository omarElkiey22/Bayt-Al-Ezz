import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock supabase-client.js before importing companies-api.js
const mockFrom = vi.fn();
vi.mock('../src/js/supabase-client.js', () => ({
  requireSupabase: () => ({
    from: mockFrom
  })
}));

describe('fetchActiveCompanies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries companies table directly for active, non-deleted rows ordered by name', async () => {
    const mockData = [
      { id: 'c1', name: 'أحمد وشركاه', is_active: true, deleted_at: null },
      { id: 'c2', name: 'شركة البركة', is_active: true, deleted_at: null }
    ];

    const chain = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null })
    };
    mockFrom.mockReturnValue(chain);

    const { fetchActiveCompanies } = await import('../src/js/companies-api.js');
    const result = await fetchActiveCompanies();

    expect(mockFrom).toHaveBeenCalledWith('companies');
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.is).toHaveBeenCalledWith('deleted_at', null);
    expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    expect(chain.order).toHaveBeenCalledWith('name');
    expect(result).toEqual(mockData);
  });

  it('returns empty array and logs error on query failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const chain = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB connection failed') })
    };
    mockFrom.mockReturnValue(chain);

    const { fetchActiveCompanies } = await import('../src/js/companies-api.js');
    const result = await fetchActiveCompanies();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('Empty state button text', () => {
  it('verifies product.html uses "العودة إلى الصفحة الرئيسية" and not "العودة للبيت"', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../src/pages/product.html'), 'utf-8');
    expect(html).toContain('العودة إلى الصفحة الرئيسية');
    expect(html).not.toContain('العودة للبيت');
  });

  it('verifies category.html uses "العودة إلى الصفحة الرئيسية" and not "العودة للبيت"', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../src/pages/category.html'), 'utf-8');
    expect(html).toContain('العودة إلى الصفحة الرئيسية');
    expect(html).not.toContain('العودة للبيت');
  });
});
