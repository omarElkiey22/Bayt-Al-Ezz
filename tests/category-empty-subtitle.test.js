import { describe, it, expect } from 'vitest';
import { getCategoryEmptySubtitle } from '../src/js/category-empty-subtitle.js';

describe('getCategoryEmptySubtitle', () => {
  describe('Wholesale mode', () => {
    it('returns company-specific subtitle when reached via company alone (no section of any kind)', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
        company: 'ca57035d-64ae-404d-a884-2001750c5254',
        section: null,
        wholesaleSection: null,
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة من هذه الشركة حالياً.');
    });

    it('returns section-specific subtitle when reached via section slug alone', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
        company: null,
        section: 'laundry',
        wholesaleSection: null,
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.');
    });

    it('returns section-specific subtitle when reached via wholesale_section id alone', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
        company: null,
        section: null,
        wholesaleSection: 'ws-12345',
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.');
    });

    it('returns section-specific subtitle when reached via section slug with company', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
        company: 'ca57035d-64ae-404d-a884-2001750c5254',
        section: 'laundry',
        wholesaleSection: null,
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.');
    });

    it('returns section-specific subtitle when reached via wholesale_section with company', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
        company: 'ca57035d-64ae-404d-a884-2001750c5254',
        section: null,
        wholesaleSection: 'ws-12345',
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.');
    });
    it('returns company-specific subtitle when empty strings are passed for sections', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
        company: 'ca57035d-64ae-404d-a884-2001750c5254',
        section: '',
        wholesaleSection: '',
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة من هذه الشركة حالياً.');
    });

    it('defaults to section subtitle in wholesale mode when neither company nor section is provided', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: true,
      });
      expect(subtitle).toBe('لا توجد منتجات مسعرة بالجملة في هذا القسم حالياً.');
    });
  });

  describe('Retail mode', () => {
    it('returns retail section subtitle when not in wholesale mode', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: false,
        section: 'reception',
      });
      expect(subtitle).toBe('لم يتم إضافة منتجات في هذا القسم بعد.');
    });

    it('returns retail section subtitle even if company is present when not in wholesale mode', () => {
      const subtitle = getCategoryEmptySubtitle({
        isWholesale: false,
        company: 'ca57035d-64ae-404d-a884-2001750c5254',
      });
      expect(subtitle).toBe('لم يتم إضافة منتجات في هذا القسم بعد.');
    });

    it('defaults to retail section subtitle when called with no arguments', () => {
      const subtitle = getCategoryEmptySubtitle();
      expect(subtitle).toBe('لم يتم إضافة منتجات في هذا القسم بعد.');
    });
  });
});
