// Pure client-side filter for the wholesale-mode product listing filter
// panel (category.html). No Supabase/DOM dependency -- takes an
// already-fetched product array and this facet state, returns the subset
// that matches. Filters wholesale_price (not base_price/starting_price)
// since this panel only ever renders in wholesale mode.
//
// companyId and unassignedOnly are deliberately separate parameters
// rather than one overloaded value -- companyId: null would otherwise
// ambiguously mean both "no company filter active" and "filter to
// unassigned products" (FR-013). unassignedOnly takes precedence over
// companyId when both are set (data-model.md's "Filter panel shape" note).
//
// sectionId narrows by section_id too, for completeness of the pure
// function's contract -- the filter panel itself never routes a section
// change through this function (that's a real re-fetch, see category.html),
// but the function stays general-purpose rather than assuming its own caller.

export function applyProductFilters(products, { minPrice, maxPrice, companyId, unassignedOnly, sectionId } = {}) {
  return (products || []).filter(p => {
    if (unassignedOnly) {
      if (p.company_id) return false;
    } else if (companyId != null) {
      if (p.company_id !== companyId) return false;
    }

    if (sectionId != null && p.section_id !== sectionId) return false;

    if (minPrice != null && p.wholesale_price < minPrice) return false;
    if (maxPrice != null && p.wholesale_price > maxPrice) return false;

    return true;
  });
}
