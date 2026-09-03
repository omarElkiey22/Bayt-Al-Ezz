import { describe, it, expect } from 'vitest';
import { applyProductFilters } from '../src/js/product-filters.js';

// Fixture: 4 products spread across 2 companies + 1 unassigned, 2 sections,
// and a spread of wholesale prices -- enough combinations to exercise every
// filter dimension in isolation and combined.
const products = [
  { id: '1', name: 'صنف 1', wholesale_price: 50, company_id: 'c1', section_id: 's1' },
  { id: '2', name: 'صنف 2', wholesale_price: 100, company_id: 'c2', section_id: 's1' },
  { id: '3', name: 'صنف 3', wholesale_price: 150, company_id: null, section_id: 's1' },
  { id: '4', name: 'صنف 4', wholesale_price: 80, company_id: 'c1', section_id: 's2' },
];

const ids = (result) => result.map(p => p.id);

describe('applyProductFilters -- no-op / defaults', () => {
  it('returns every product when no filters are given', () => {
    expect(ids(applyProductFilters(products, {}))).toEqual(['1', '2', '3', '4']);
  });

  it('returns every product when called with no options at all', () => {
    expect(ids(applyProductFilters(products))).toEqual(['1', '2', '3', '4']);
  });

  it('returns an empty array for an empty/missing product list', () => {
    expect(applyProductFilters([], { minPrice: 0 })).toEqual([]);
    expect(applyProductFilters(undefined, { minPrice: 0 })).toEqual([]);
  });
});

describe('applyProductFilters -- price range', () => {
  it('applies minPrice as an inclusive lower bound', () => {
    expect(ids(applyProductFilters(products, { minPrice: 80 }))).toEqual(['2', '3', '4']);
  });

  it('applies maxPrice as an inclusive upper bound', () => {
    expect(ids(applyProductFilters(products, { maxPrice: 100 }))).toEqual(['1', '2', '4']);
  });

  it('combines minPrice and maxPrice into a range', () => {
    expect(ids(applyProductFilters(products, { minPrice: 60, maxPrice: 120 }))).toEqual(['2', '4']);
  });

  it('is a zero-match case when the range excludes every product', () => {
    expect(applyProductFilters(products, { minPrice: 1000 })).toEqual([]);
  });
});

describe('applyProductFilters -- companyId', () => {
  it('keeps only the given company\'s products', () => {
    expect(ids(applyProductFilters(products, { companyId: 'c1' }))).toEqual(['1', '4']);
  });

  it('is a zero-match case for a company with no products in the array', () => {
    expect(applyProductFilters(products, { companyId: 'no-such-company' })).toEqual([]);
  });
});

describe('applyProductFilters -- unassignedOnly', () => {
  it('keeps only products with no company_id', () => {
    expect(ids(applyProductFilters(products, { unassignedOnly: true }))).toEqual(['3']);
  });

  it('takes precedence over companyId when both are set', () => {
    expect(ids(applyProductFilters(products, { unassignedOnly: true, companyId: 'c1' }))).toEqual(['3']);
  });

  it('is a no-op (falsy) by default, not implicitly excluding assigned products', () => {
    expect(ids(applyProductFilters(products, { unassignedOnly: false, companyId: 'c1' }))).toEqual(['1', '4']);
  });
});

describe('applyProductFilters -- sectionId', () => {
  it('keeps only the given section\'s products', () => {
    expect(ids(applyProductFilters(products, { sectionId: 's2' }))).toEqual(['4']);
  });
});

describe('applyProductFilters -- combined filters', () => {
  it('combines price and companyId', () => {
    // c1's products are 50 (id 1) and 80 (id 4); minPrice 60 should drop id 1.
    expect(ids(applyProductFilters(products, { companyId: 'c1', minPrice: 60 }))).toEqual(['4']);
  });

  it('combines price, companyId and sectionId into a zero-match case', () => {
    // id 4 is c1/s2/80 -- asking for c1 in s1 with that price range matches nothing.
    expect(applyProductFilters(products, { companyId: 'c1', sectionId: 's1', minPrice: 60 })).toEqual([]);
  });
});
