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
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    }))
  }
}));

import { fetchCustomers, saveOrUpdateCustomer, updateCustomer, deleteCustomer, getCustomerDebt } from '../src/js/admin/customers-api.js';

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

  it('should calculate customer total debt from partial and unpaid invoices', async () => {
    const invoices = [
      { invoice_number: 'INV-1001', customer_name: 'خالد عبد الله', payment_status: 'غير مدفوع', grand_total: 500, remaining_amount: 500, paid_amount: 0 },
      { invoice_number: 'INV-1002', customer_name: 'خالد عبد الله', payment_status: 'مدفوع جزئياً', grand_total: 300, remaining_amount: 100, paid_amount: 200 },
      { invoice_number: 'INV-1003', customer_name: 'خالد عبد الله', payment_status: 'مدفوع بالكامل', grand_total: 400, remaining_amount: 0, paid_amount: 400 }
    ];
    localStorage.setItem('bayt_al_ezz_invoices', JSON.stringify(invoices));

    const debt = await getCustomerDebt('خالد عبد الله');
    expect(debt).toBe(600); // 500 (unpaid) + 100 (partially paid remaining)

    // When editing INV-1002, previous debt from other invoices should be 500
    const debtExcludingCurrent = await getCustomerDebt('خالد عبد الله', 'INV-1002');
    expect(debtExcludingCurrent).toBe(500);
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
