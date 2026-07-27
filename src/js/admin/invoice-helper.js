/**
 * Invoice Helper utilities for Bayt Al-Ezz Admin Panel
 */

export function generateInvoiceNumber(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `INV-${yyyy}${mm}${dd}-${randomStr}`;
}

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
}

export function calculateItemTotal(unitPrice, quantity) {
  const price = parseFloat(unitPrice) || 0;
  const qty = parseInt(quantity, 10) || 0;
  return Math.max(0, price * qty);
}

export function calculateInvoiceTotals(items = [], shippingFee = 0, discount = 0) {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemTotal(item.unitPrice, item.quantity);
  }, 0);

  const shipping = Math.max(0, parseFloat(shippingFee) || 0);
  const disc = Math.max(0, parseFloat(discount) || 0);

  const grandTotal = Math.max(0, subtotal + shipping - disc);

  return {
    subtotal,
    shipping,
    discount: disc,
    grandTotal
  };
}
