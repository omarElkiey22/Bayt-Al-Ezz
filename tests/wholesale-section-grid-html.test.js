import { describe, it, expect } from 'vitest';
import { buildWholesaleSectionGridEntryHTML } from '../src/js/wholesale-section-grid-html.js';

// Feature 005, US1 (T006): wholesale_sections has no slug column (research.md
// Decision 1 -- wholesale sections are keyed by id everywhere, same
// precedent as ?company=<id>). This template's link target must change from
// the old ?section=<slug> shape to ?wholesale_section=<id> accordingly --
// these tests pin that contract down before T006 touches the implementation.

describe('buildWholesaleSectionGridEntryHTML', () => {
  it('links to wholesale-section-companies.html by id, not slug', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-123', name: 'مواد غذائية', icon_name: 'kitchen-shelving.svg' });
    expect(html).toContain('wholesale-section-companies.html?wholesale_section=ws-123');
    expect(html).not.toContain('?section=');
  });

  it('escapes a malicious section name', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-1', name: '<img src=x onerror=alert(1)>', icon_name: 'laundry.svg' });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes an attribute-breakout payload in the id used for the link', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: '"><script>alert(1)</script>', name: 'قسم', icon_name: 'laundry.svg' });
    expect(html).not.toContain('"><script>alert(1)</script>');
  });

  it('falls back to a default icon when icon_name is absent', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-2', name: 'قسم بدون أيقونة', icon_name: null });
    expect(html).toContain('laundry.svg');
  });

  it('escapes an attribute-breakout payload in icon_name', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-3', name: 'قسم', icon_name: '"><script>alert(1)</script>' });
    expect(html).not.toContain('"><script>alert(1)</script>');
  });
});
