import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
globalThis.localStorage = localStorageMock;

vi.mock('../src/js/supabase-client.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    }))
  }
}));

import { fetchCustomers, saveOrUpdateCustomer, updateCustomer, deleteCustomer } from '../src/js/admin/customers-api.js';

describe('Customers API', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save a new customer to localStorage fallback', async () => {
    const cust = await saveOrUpdateCustomer('محمد أحمد', '01012345678', 'القاهرة');
    expect(cust).toBeDefined();
    expect(cust.name).toBe('محمد أحمد');

    const list = await fetchCustomers('');
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some(c => c.name === 'محمد أحمد')).toBe(true);
  });

  it('should search customers by query', async () => {
    await saveOrUpdateCustomer('على حسن', '01122334455', 'الجيزة');
    await saveOrUpdateCustomer('سارة محمود', '01233445566', 'الإسكندرية');

    const results = await fetchCustomers('سارة');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('سارة محمود');
  });

  it('should update existing customer details', async () => {
    await saveOrUpdateCustomer('محمود علي', '01000000000', 'طنطا');
    await saveOrUpdateCustomer('محمود علي', '01099999999', 'المنصورة');

    const list = await fetchCustomers('محمود علي');
    expect(list.length).toBe(1);
    expect(list[0].phone).toBe('01099999999');
    expect(list[0].address).toBe('المنصورة');
  });

  it('should delete a customer', async () => {
    await saveOrUpdateCustomer('عميل للتجربة', '01500000000', 'أسيوط');
    let list = await fetchCustomers('عميل للتجربة');
    expect(list.length).toBe(1);

    await deleteCustomer(list[0].id, 'عميل للتجربة');
    list = await fetchCustomers('عميل للتجربة');
    expect(list.length).toBe(0);
  });
});
