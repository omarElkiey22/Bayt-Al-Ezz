import { describe, it, expect } from 'vitest';
import { buildNoResultsHTML } from '../src/js/no-results-html.js';

// Found by the follow-up requesting-code-review pass: category.html's
// "no search results" message echoed `searchQuery` -- read straight from
// `getQueryParam('search')`, i.e. the URL -- unescaped into innerHTML.
// Zero privileges needed: a crafted link like
// category.html?search=<img src=x onerror=alert(1)> executes for anyone
// who clicks it. Worse than the earlier `mock`-param bugs because `search`
// is a normal, expected feature -- the malicious link looks legitimate.

describe('buildNoResultsHTML', () => {
  it('escapes an attacker-controlled search query', () => {
    const html = buildNoResultsHTML({ searchQuery: '<img src=x onerror=alert(1)>', indexMockParam: '' });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes an attribute-breakout payload in indexMockParam', () => {
    const html = buildNoResultsHTML({ searchQuery: 'شيء', indexMockParam: '"><img src=x onerror=alert(2)>' });
    expect(html).not.toContain('"><img src=x onerror=alert(2)>');
  });

  it('renders a normal query', () => {
    const html = buildNoResultsHTML({ searchQuery: 'كنبة', indexMockParam: '' });
    expect(html).toContain('كنبة');
  });
});
