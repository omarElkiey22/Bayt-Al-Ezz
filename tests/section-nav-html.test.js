import { describe, it, expect } from 'vitest';
import { buildSidebarNavLinkHTML, buildMobileNavLinkHTML } from '../src/js/section-nav-html.js';

// Regression guard for /cso Finding #2 (category.html sidebar/mobile nav):
// s.name was interpolated straight into innerHTML with no escaping, on a
// page every storefront visitor hits.

const evilSection = { name: '<img src=x onerror=alert(1)>', slug: 'x', icon_name: 'laundry.svg' };

describe('buildSidebarNavLinkHTML', () => {
  it('escapes a malicious section name', () => {
    const html = buildSidebarNavLinkHTML(evilSection, { isActive: false, mockParam: '' });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('buildMobileNavLinkHTML', () => {
  it('escapes a malicious section name', () => {
    const html = buildMobileNavLinkHTML(evilSection, { isActive: false, mockParam: '' });
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

// Found in code review of the above fix: mockParam is built from
// `new URLSearchParams(location.search).get('mock')` in category.html --
// pure attacker-controlled URL input -- and was interpolated straight into
// the href attribute unescaped. A crafted link like
// category.html?mock="><img src=x onerror=alert(1)> breaks out of the
// attribute with no privileged write access needed at all.
const normalSection = { name: 'قسم', slug: 'x', icon_name: 'laundry.svg' };
const breakoutMockParam = '&mock="><img src=x onerror=alert(1)>';

describe('buildSidebarNavLinkHTML mockParam', () => {
  it('escapes an attribute-breakout payload in mockParam', () => {
    const html = buildSidebarNavLinkHTML(normalSection, { isActive: false, mockParam: breakoutMockParam });
    expect(html).not.toContain('"><img src=x onerror=alert(1)>');
  });
});

describe('buildMobileNavLinkHTML mockParam', () => {
  it('escapes an attribute-breakout payload in mockParam', () => {
    const html = buildMobileNavLinkHTML(normalSection, { isActive: false, mockParam: breakoutMockParam });
    expect(html).not.toContain('"><img src=x onerror=alert(1)>');
  });
});
