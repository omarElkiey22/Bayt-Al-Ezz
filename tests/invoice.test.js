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

  it('calculates total invoice amounts with percentage discount on (subtotal + shipping)', () => {
    const items = [
      { unitPrice: 1310, quantity: 1 } // subtotal = 1310
    ];

    // Subtotal 1310, Shipping 10 => Total before discount 1320
    // 10% discount on 1320 = 132 EGP discount
    // Grand total = 1320 - 132 = 1188
    const result = calculateInvoiceTotals(items, 10, 10);
    expect(result.subtotal).toBe(1310);
    expect(result.shipping).toBe(10);
    expect(result.totalBeforeDiscount).toBe(1320);
    expect(result.discountPercent).toBe(10);
    expect(result.discountAmount).toBe(132);
    expect(result.grandTotal).toBe(1188);
  });

  it('handles negative or invalid values safely in totals', () => {
    const items = [{ unitPrice: 100, quantity: 1 }];
    const result = calculateInvoiceTotals(items, -10, 150);
    expect(result.subtotal).toBe(100);
    expect(result.shipping).toBe(0);
    expect(result.discountPercent).toBe(100); // capped at 100%
    expect(result.discountAmount).toBe(100);
    expect(result.grandTotal).toBe(0); // Cannot be negative
  });

  it('formats currency correctly', () => {
    expect(formatCurrency(150)).toContain('150');
    expect(formatCurrency(150)).toContain('ج.م');
  });
});
