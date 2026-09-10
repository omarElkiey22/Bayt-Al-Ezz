import { describe, it, expect } from 'vitest';
import { ICONS, ICON_DIRECTORY, DEFAULT_ICON, iconSource, renderIconPickerHTML } from '../src/js/admin/icon-picker.js';

// Feature 005, US3 (T018/T022): ICONS/ICON_DIRECTORY/DEFAULT_ICON/iconSource
// and the picker's rendering are extracted out of sections-crud.js into this
// shared module so both the retail and wholesale admin forms reuse one
// picker instead of a duplicated copy (research.md Decision 5,
// contracts/admin-ui.md). These tests pin the shared module's contract down
// before sections-crud.js (T019) and wholesale-sections-crud.js (T021) are
// wired to import from here.

const tagPayload = '<img src=x onerror=alert(1)>';

describe('iconSource', () => {
  it('returns the real path for a known icon name', () => {
    expect(iconSource(ICONS[0])).toBe(`${ICON_DIRECTORY}${ICONS[0]}`);
  });

  it('falls back to DEFAULT_ICON for an unknown icon name', () => {
    expect(iconSource('not-a-real-icon.svg')).toBe(`${ICON_DIRECTORY}${DEFAULT_ICON}`);
  });

  it('falls back to DEFAULT_ICON for a null icon name', () => {
    expect(iconSource(null)).toBe(`${ICON_DIRECTORY}${DEFAULT_ICON}`);
  });

  it('falls back to DEFAULT_ICON for an undefined icon name', () => {
    expect(iconSource(undefined)).toBe(`${ICON_DIRECTORY}${DEFAULT_ICON}`);
  });
});

describe('renderIconPickerHTML', () => {
  it('renders one button for every icon in ICONS', () => {
    const html = renderIconPickerHTML(ICONS[0]);
    ICONS.forEach(icon => {
      expect(html).toContain(`data-icon="${icon}"`);
    });
  });

  it('marks the selected icon and leaves the others unmarked', () => {
    const html = renderIconPickerHTML(ICONS[1]);
    const selectedButton = html.match(new RegExp(`data-icon="${ICONS[1]}" class="([^"]*)"`))[1];
    const otherButton = html.match(new RegExp(`data-icon="${ICONS[0]}" class="([^"]*)"`))[1];
    expect(selectedButton).toContain('ring-1');
    expect(otherButton).not.toContain('ring-1');
  });

  it('defaults the hidden input to DEFAULT_ICON when the selected icon is unknown/absent', () => {
    const html = renderIconPickerHTML('not-a-real-icon.svg');
    expect(html).toContain(`id="selected-icon-input" value="${DEFAULT_ICON}"`);
  });

  it('renders no special callout when no special config is passed (wholesale-sections-crud.js usage)', () => {
    const html = renderIconPickerHTML(ICONS[0]);
    expect(html).not.toContain('مميز');
  });

  it('renders the special callout only when a special config is passed (sections-crud.js usage)', () => {
    const html = renderIconPickerHTML(ICONS[0], { special: { icon: ICONS[0], label: 'مميز', hint: 'تنويه خاص' } });
    expect(html).toContain('مميز');
    expect(html).toContain('تنويه خاص');
  });

  it('applies the special styling only to the configured icon button, not the rest of the grid', () => {
    const html = renderIconPickerHTML(ICONS[0], { special: { icon: ICONS[2], label: 'مميز', hint: 'تنويه خاص' } });
    const specialButton = html.match(new RegExp(`data-icon="${ICONS[2]}" class="([^"]*)"`))[1];
    const plainButton = html.match(new RegExp(`data-icon="${ICONS[0]}" class="([^"]*)"`))[1];
    expect(specialButton).toContain('border-amber-400');
    expect(plainButton).not.toContain('border-amber-400');
  });

  it('escapes a tag-injection payload in the special label and hint', () => {
    const html = renderIconPickerHTML(ICONS[0], { special: { icon: ICONS[0], label: tagPayload, hint: tagPayload } });
    expect(html).not.toContain(tagPayload);
  });
});
