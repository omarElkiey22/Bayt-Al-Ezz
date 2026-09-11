import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildWholesaleSectionGridEntryHTML } from '../src/js/wholesale-section-grid-html.js';
import { WHOLESALE_ICONS, WHOLESALE_DEFAULT_ICON } from '../src/js/admin/icon-picker.js';

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

  // Wholesale sections have their own icon library, so the fallback must be a
  // WHOLESALE icon -- the old retail default (laundry.svg) does not exist in
  // public/assets/wholesale-new/ and rendered a silent 404 hidden by onerror.
  it('falls back to the wholesale default icon when icon_name is absent', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-2', name: 'قسم بدون أيقونة', icon_name: null });
    expect(html).toContain(WHOLESALE_DEFAULT_ICON);
    expect(html).not.toContain('laundry.svg');
  });

  it('renders icons from the wholesale directory, never the retail one', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-2', name: 'قسم', icon_name: 'cooking-pot.svg' });
    expect(html).toContain('/public/assets/wholesale-new/cooking-pot.svg');
    expect(html).not.toContain('/public/assets/icons/');
  });

  it('escapes an attribute-breakout payload in icon_name', () => {
    const html = buildWholesaleSectionGridEntryHTML({ id: 'ws-3', name: 'قسم', icon_name: '"><script>alert(1)</script>' });
    expect(html).not.toContain('"><script>alert(1)</script>');
  });
});

// Regression guard for the silent-404 bug this template shipped with: the
// src path was hardcoded to the retail directory, so every wholesale icon
// 404'd and was hidden by the img's onerror handler -- invisible to both the
// user and the test suite. These tests resolve the rendered src against the
// real filesystem, from the depth of the page that actually renders it
// (src/pages/wholesale-home.html), so a wrong directory OR a wrong number of
// '../' hops fails loudly here instead of silently in the browser.
describe('buildWholesaleSectionGridEntryHTML icon paths resolve on disk', () => {
  const renderingPageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'pages');
  const srcPathFor = iconName => buildWholesaleSectionGridEntryHTML(
    { id: 'ws-1', name: 'قسم', icon_name: iconName }
  ).match(/<img src="([^"]+)"/)[1];

  it.each(WHOLESALE_ICONS)('resolves %s to a real file from src/pages/', icon => {
    expect(existsSync(resolve(renderingPageDir, srcPathFor(icon)))).toBe(true);
  });

  it('resolves the no-icon fallback to a real file from src/pages/', () => {
    expect(existsSync(resolve(renderingPageDir, srcPathFor(null)))).toBe(true);
  });
});
