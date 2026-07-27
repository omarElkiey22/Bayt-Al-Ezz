import { describe, it, expect } from 'vitest';
import { generateInvoiceNumber, formatCurrency, calculateItemTotal, calculateInvoiceTotals } from '../src/js/admin/invoice-helper.js';

describe('Invoice Helper Functions', () => {
  it('generates a valid invoice number format', () => {
    const invNum = generateInvoiceNumber(new Date(2026, 6, 27));
    expect(invNum).toMatch(/^INV-20260727-\d{4}$/);
  });

  it('calculates item line totals correctly', () => {
    expect(calculateItemTotal(150, 3)).toBe(450);
    expect(calculateItemTotal('20.5', '2')).toBe(41);
    expect(calculateItemTotal(-10, 2)).toBe(0);
    expect(calculateItemTotal(100, 'invalid')).toBe(0);
  });

  it('calculates total invoice amounts with discount and shipping', () => {
    const items = [
      { unitPrice: 100, quantity: 2 }, // 200
      { unitPrice: 50, quantity: 1 }    // 50
    ];

    const result = calculateInvoiceTotals(items, 30, 20);
    expect(result.subtotal).toBe(250);
    expect(result.shipping).toBe(30);
    expect(result.discount).toBe(20);
    expect(result.grandTotal).toBe(260); // 250 + 30 - 20 = 260
  });

  it('handles negative or invalid values safely in totals', () => {
    const items = [{ unitPrice: 100, quantity: 1 }];
    const result = calculateInvoiceTotals(items, -10, 200);
    expect(result.subtotal).toBe(100);
    expect(result.shipping).toBe(0);
    expect(result.discount).toBe(200);
    expect(result.grandTotal).toBe(0); // Cannot be negative
  });

  it('formats currency correctly', () => {
    expect(formatCurrency(150)).toContain('150');
    expect(formatCurrency(150)).toContain('ج.م');
  });
});
