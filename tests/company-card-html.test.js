import { describe, it, expect } from 'vitest';
import { buildCompanyCardHTML } from '../src/js/company-card-html.js';

// Mirrors tests/section-nav-html.test.js: escaping is the security-relevant
// behavior here (a company's name/logo_url come from admin-entered data
// rendered on public storefront pages), plus the fallback-monogram case
// from the spec's "Company without logo" edge case.

const evilCompany = { id: 'c1', name: '<img src=x onerror=alert(1)>', logo_url: null };

describe('buildCompanyCardHTML', () => {
  it('escapes a malicious company name', () => {
    const html = buildCompanyCardHTML(evilCompany);
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('renders a branded fallback monogram when logo_url is absent', () => {
    const html = buildCompanyCardHTML({ id: 'c2', name: 'شركة الاتحاد', logo_url: null });
    // No broken <img> pointing at an empty/undefined src
    expect(html).not.toMatch(/<img[^>]*src=["']?["']?[^>]*>/);
    // The fallback shows a monogram derived from the company name
    expect(html).toContain('ش');
  });

  it('renders the logo image when logo_url is present', () => {
    const html = buildCompanyCardHTML({ id: 'c3', name: 'شركة النور', logo_url: 'https://example.com/logo.png' });
    expect(html).toContain('https://example.com/logo.png');
    expect(html).toMatch(/<img[^>]*src=["']https:\/\/example\.com\/logo\.png["'][^>]*>/);
  });

  it('escapes an attribute-breakout payload in logo_url', () => {
    const html = buildCompanyCardHTML({ id: 'c4', name: 'شركة', logo_url: '"><script>alert(1)</script>' });
    expect(html).not.toContain('"><script>alert(1)</script>');
  });

  it('links the card to the company id', () => {
    const html = buildCompanyCardHTML({ id: 'abc-123', name: 'شركة', logo_url: null });
    expect(html).toContain('abc-123');
  });
});

// Presentation contract for the company card -- kept deliberately in step with
// buildWholesaleSectionGridEntryHTML's w-28 h-28 icon so section cards and
// company cards read as one visual system on the wholesale storefront. The
// absent line-clamp is equally deliberate: long company names must wrap and
// stay fully visible on a narrow mobile viewport.
describe('buildCompanyCardHTML presentation', () => {
  const LONG_NAME = 'شركة الاتحاد للتجارة والتوزيع والاستيراد';

  it('sizes the logo container at w-28 h-28', () => {
    const html = buildCompanyCardHTML({ id: 'c1', name: LONG_NAME, logo_url: 'https://example.com/logo.png' });
    expect(html).toContain('w-28 h-28');
    expect(html).not.toContain('w-16 h-16');
  });

  it('sizes the monogram fallback container at w-28 h-28 too', () => {
    const html = buildCompanyCardHTML({ id: 'c2', name: LONG_NAME, logo_url: null });
    expect(html).toContain('w-28 h-28');
    expect(html).not.toContain('w-16 h-16');
  });

  it('never truncates the company name (no line-clamp), logo or monogram', () => {
    const withLogo = buildCompanyCardHTML({ id: 'c3', name: LONG_NAME, logo_url: 'https://example.com/logo.png' });
    const withMonogram = buildCompanyCardHTML({ id: 'c4', name: LONG_NAME, logo_url: null });
    expect(withLogo).not.toContain('line-clamp');
    expect(withMonogram).not.toContain('line-clamp');
    expect(withLogo).toContain(LONG_NAME);
    expect(withMonogram).toContain(LONG_NAME);
  });
});
