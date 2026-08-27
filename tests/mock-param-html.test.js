import { describe, it, expect } from 'vitest';
import { buildMockHiddenInputHTML } from '../src/js/mock-param-html.js';

// Found via variant analysis after the code review caught the same bug in
// section-nav-html.js: search-bar.js reads `mock` straight from
// `new URLSearchParams(location.search).get('mock')` -- pure attacker-
// controlled URL input -- and interpolated it unescaped into a hidden
// input's value attribute, then assigned via innerHTML. Reachable on every
// page that mounts the header search bar (index/category/product/cart).

describe('buildMockHiddenInputHTML', () => {
  it('escapes an attribute-breakout payload from the mock query param', () => {
    const html = buildMockHiddenInputHTML('"><img src=x onerror=alert(1)>');
    expect(html).not.toContain('"><img src=x onerror=alert(1)>');
  });

  it('returns an empty string when there is no mock value', () => {
    expect(buildMockHiddenInputHTML(null)).toBe('');
    expect(buildMockHiddenInputHTML('')).toBe('');
  });

  it('renders a normal mock value', () => {
    expect(buildMockHiddenInputHTML('true')).toContain('value="true"');
  });
});
