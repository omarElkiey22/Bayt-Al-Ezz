/**
 * Context-aware subtitle for category.html's zero-products empty state.
 *
 * @param {Object} params
 * @param {boolean} [params.isWholesale=false] - Whether the page is in wholesale mode
 * @param {string|null} [params.section=null] - Retail section slug (?section=...)
 * @param {string|null} [params.wholesaleSection=null] - Wholesale section ID (?wholesale_section=...)
 * @param {string|null} [params.company=null] - Company ID (?company=...)
 * @returns {string} The context-accurate empty-state subtitle
 */
export function getCategoryEmptySubtitle({ isWholesale = false, section = null, wholesaleSection = null, company = null } = {}) {
  if (!isWholesale) {
    return 'لم يتم إضافة منتجات في هذا القسم بعد.';
  }

  // Company-only route with no section of any kind
  if (company && !section && !wholesaleSection) {
    return 'لا توجد منتجات مسعرة بالجملة من هذه الشركة حالياً.';
  }

  return 'لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.';
}
