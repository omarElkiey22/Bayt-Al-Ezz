import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  ICONS, ICON_DIRECTORY, DEFAULT_ICON,
  WHOLESALE_ICONS, WHOLESALE_ICON_DIRECTORY, WHOLESALE_DEFAULT_ICON,
  RETAIL_ICON_SET, WHOLESALE_ICON_SET,
  iconSource, renderIconPickerHTML, wireIconPicker,
} from '../src/js/admin/icon-picker.js';

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

// ── Two independent icon sets ────────────────────────────────────────────
// The retail set (ICONS/ICON_DIRECTORY/DEFAULT_ICON) stays the default for
// every function, so sections-crud.js's existing calls keep working with no
// changes at all. wholesale-sections-crud.js passes WHOLESALE_ICON_SET
// explicitly to get its own 5-icon set from public/assets/wholesale-new/.

describe('WHOLESALE_ICON_SET constants', () => {
  it('exposes exactly the five wholesale icons', () => {
    expect(WHOLESALE_ICONS).toEqual([
      'paper-rolls.svg', 'stretch-wrap.svg', 'spray-bottle.svg', 'care-bottle.svg', 'cooking-pot.svg',
    ]);
  });

  it('points at the wholesale asset directory, not the retail one', () => {
    expect(WHOLESALE_ICON_DIRECTORY).toBe('../../../public/assets/wholesale-new/');
    expect(WHOLESALE_ICON_DIRECTORY).not.toBe(ICON_DIRECTORY);
  });

  it('defaults to a wholesale icon that is itself in the wholesale set', () => {
    expect(WHOLESALE_DEFAULT_ICON).toBe('paper-rolls.svg');
    expect(WHOLESALE_ICONS).toContain(WHOLESALE_DEFAULT_ICON);
  });

  it('shares no icon filenames with the retail set (fully independent sets)', () => {
    const overlap = WHOLESALE_ICONS.filter(icon => ICONS.includes(icon));
    expect(overlap).toEqual([]);
  });

  it('bundles the three wholesale constants into WHOLESALE_ICON_SET', () => {
    expect(WHOLESALE_ICON_SET).toEqual({
      icons: WHOLESALE_ICONS,
      iconDirectory: WHOLESALE_ICON_DIRECTORY,
      defaultIcon: WHOLESALE_DEFAULT_ICON,
    });
  });
});

describe('iconSource with an explicit icon set', () => {
  it('resolves a wholesale icon against the wholesale directory', () => {
    expect(iconSource(WHOLESALE_ICONS[0], WHOLESALE_ICON_SET)).toBe(`${WHOLESALE_ICON_DIRECTORY}${WHOLESALE_ICONS[0]}`);
  });

  it('falls back to WHOLESALE_DEFAULT_ICON for an unknown name in the wholesale set', () => {
    expect(iconSource('not-a-real-icon.svg', WHOLESALE_ICON_SET)).toBe(`${WHOLESALE_ICON_DIRECTORY}${WHOLESALE_DEFAULT_ICON}`);
  });

  it('falls back to WHOLESALE_DEFAULT_ICON for a null name in the wholesale set', () => {
    expect(iconSource(null, WHOLESALE_ICON_SET)).toBe(`${WHOLESALE_ICON_DIRECTORY}${WHOLESALE_DEFAULT_ICON}`);
  });

  // The two sets are allow-lists for each other: a retail icon name is not a
  // valid wholesale icon and vice versa, so each falls back to its own default
  // rather than silently resolving against the wrong directory.
  it('does not resolve a retail icon name against the wholesale set', () => {
    expect(iconSource(DEFAULT_ICON, WHOLESALE_ICON_SET)).toBe(`${WHOLESALE_ICON_DIRECTORY}${WHOLESALE_DEFAULT_ICON}`);
  });

  it('does not resolve a wholesale icon name against the retail (default) set', () => {
    expect(iconSource(WHOLESALE_ICONS[0])).toBe(`${ICON_DIRECTORY}${DEFAULT_ICON}`);
  });
});

describe('renderIconPickerHTML with an explicit icon set', () => {
  it('renders one button for every wholesale icon and none from the retail set', () => {
    const html = renderIconPickerHTML(WHOLESALE_ICONS[0], { iconSet: WHOLESALE_ICON_SET });
    WHOLESALE_ICONS.forEach(icon => {
      expect(html).toContain(`data-icon="${icon}"`);
    });
    ICONS.forEach(icon => {
      expect(html).not.toContain(`data-icon="${icon}"`);
    });
  });

  it('points every wholesale button image at the wholesale directory', () => {
    const html = renderIconPickerHTML(WHOLESALE_ICONS[0], { iconSet: WHOLESALE_ICON_SET });
    WHOLESALE_ICONS.forEach(icon => {
      expect(html).toContain(`src="${WHOLESALE_ICON_DIRECTORY}${icon}"`);
    });
    expect(html).not.toContain(ICON_DIRECTORY);
  });

  it('marks the selected wholesale icon and leaves the others unmarked', () => {
    const html = renderIconPickerHTML(WHOLESALE_ICONS[1], { iconSet: WHOLESALE_ICON_SET });
    const selectedButton = html.match(new RegExp(`data-icon="${WHOLESALE_ICONS[1]}" class="([^"]*)"`))[1];
    const otherButton = html.match(new RegExp(`data-icon="${WHOLESALE_ICONS[0]}" class="([^"]*)"`))[1];
    expect(selectedButton).toContain('ring-1');
    expect(otherButton).not.toContain('ring-1');
  });

  it('defaults the hidden input to WHOLESALE_DEFAULT_ICON for an unknown/absent selection', () => {
    const html = renderIconPickerHTML(null, { iconSet: WHOLESALE_ICON_SET });
    expect(html).toContain(`id="selected-icon-input" value="${WHOLESALE_DEFAULT_ICON}"`);
  });

  // A stored retail icon name (e.g. from before the two sets were split) is
  // not in the wholesale allow-list, so it degrades to the wholesale default
  // rather than rendering a broken image from the wrong directory.
  it('degrades a stored retail icon name to the wholesale default', () => {
    const html = renderIconPickerHTML(DEFAULT_ICON, { iconSet: WHOLESALE_ICON_SET });
    expect(html).toContain(`id="selected-icon-input" value="${WHOLESALE_DEFAULT_ICON}"`);
  });

  it('renders a plain grid with no special callout for the wholesale set', () => {
    const html = renderIconPickerHTML(WHOLESALE_ICONS[0], { iconSet: WHOLESALE_ICON_SET });
    expect(html).not.toContain('مميز');
    expect(html).not.toContain('border-amber-400');
  });
});

describe('RETAIL_ICON_SET constants', () => {
  // Symmetric with the WHOLESALE_ICON_SET assertion above, so a future edit
  // to ICONS/ICON_DIRECTORY/DEFAULT_ICON can't silently desync the bundle
  // that every function uses as its default.
  it('bundles the three retail constants into RETAIL_ICON_SET', () => {
    expect(RETAIL_ICON_SET).toEqual({
      icons: ICONS,
      iconDirectory: ICON_DIRECTORY,
      defaultIcon: DEFAULT_ICON,
    });
  });
});

describe('icon sets match the files actually on disk', () => {
  // Guards the "declared path doesn't match disk" class of bug: a typo in
  // either array, or a directory pointing at the wrong depth, silently
  // renders a broken image with no other test failing. Both directories are
  // written relative to src/pages/admin/, so strip the leading ../ hops to
  // get the repo-root-relative path.
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const fromRepoRoot = dir => resolve(repoRoot, dir.replace(/^(\.\.\/)+/, ''));

  it.each(ICONS)('retail icon %s exists on disk', icon => {
    expect(existsSync(resolve(fromRepoRoot(ICON_DIRECTORY), icon))).toBe(true);
  });

  it.each(WHOLESALE_ICONS)('wholesale icon %s exists on disk', icon => {
    expect(existsSync(resolve(fromRepoRoot(WHOLESALE_ICON_DIRECTORY), icon))).toBe(true);
  });

  it('resolves each directory to a real, distinct folder', () => {
    expect(existsSync(fromRepoRoot(ICON_DIRECTORY))).toBe(true);
    expect(existsSync(fromRepoRoot(WHOLESALE_ICON_DIRECTORY))).toBe(true);
    expect(fromRepoRoot(ICON_DIRECTORY)).not.toBe(fromRepoRoot(WHOLESALE_ICON_DIRECTORY));
  });
});

describe('wireIconPicker', () => {
  // Minimal stub of the only DOM surfaces wireIconPicker touches -- this
  // project has no jsdom dependency, and the function's contract is small
  // enough to exercise honestly without one.
  const makeRoot = (iconNames, { tamperedIcon } = {}) => {
    const hiddenInput = { value: '' };
    const buttons = iconNames.map(icon => ({
      dataset: { icon },
      onclick: null,
      classes: new Set(),
      get classList() {
        return {
          add: (...c) => c.forEach(x => this.classes.add(x)),
          remove: (...c) => c.forEach(x => this.classes.delete(x)),
        };
      },
    }));
    if (tamperedIcon) buttons.push({ dataset: { icon: tamperedIcon }, onclick: null, classes: new Set(), get classList() { return { add: () => {}, remove: () => {} }; } });
    return {
      hiddenInput,
      buttons,
      querySelectorAll: sel => (sel === '.icon-btn' ? buttons : []),
      querySelector: sel => (sel === '#selected-icon-input' ? hiddenInput : null),
    };
  };

  it('writes the clicked retail icon into the hidden input (default set, sections-crud.js call shape)', () => {
    const root = makeRoot(ICONS);
    wireIconPicker(root, '#selected-icon-input');
    root.buttons[3].onclick();
    expect(root.hiddenInput.value).toBe(ICONS[3]);
  });

  it('writes the clicked wholesale icon when the wholesale set is passed', () => {
    const root = makeRoot(WHOLESALE_ICONS);
    wireIconPicker(root, '#selected-icon-input', WHOLESALE_ICON_SET);
    root.buttons[2].onclick();
    expect(root.hiddenInput.value).toBe(WHOLESALE_ICONS[2]);
  });

  it('marks the clicked button selected and clears the previous selection', () => {
    const root = makeRoot(ICONS);
    wireIconPicker(root, '#selected-icon-input');
    root.buttons[0].onclick();
    expect(root.buttons[0].classes.has('ring-1')).toBe(true);
    root.buttons[1].onclick();
    expect(root.buttons[1].classes.has('ring-1')).toBe(true);
    expect(root.buttons[0].classes.has('ring-1')).toBe(false);
  });

  // Defence in depth: the grid's buttons are always rendered from the same
  // set passed here, so this is unreachable through the UI -- but the value
  // goes straight into the submit payload (wholesale-sections-crud.js's
  // `icon_name: rawData.icon_name`), so a tampered data-icon must never
  // reach the database. It degrades to the set's own default instead.
  it('never writes a filename outside the given set (falls back to that set default)', () => {
    const root = makeRoot(WHOLESALE_ICONS, { tamperedIcon: 'evil.svg' });
    wireIconPicker(root, '#selected-icon-input', WHOLESALE_ICON_SET);
    root.buttons[root.buttons.length - 1].onclick();
    expect(root.hiddenInput.value).toBe(WHOLESALE_DEFAULT_ICON);
  });

  it('rejects a retail icon name when wired to the wholesale set', () => {
    const root = makeRoot(WHOLESALE_ICONS, { tamperedIcon: DEFAULT_ICON });
    wireIconPicker(root, '#selected-icon-input', WHOLESALE_ICON_SET);
    root.buttons[root.buttons.length - 1].onclick();
    expect(root.hiddenInput.value).toBe(WHOLESALE_DEFAULT_ICON);
  });
});
