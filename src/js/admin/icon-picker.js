import { escapeHtml } from '../utils.js';

// Feature 005, US3: shared icon-picker module (research.md Decision 5,
// contracts/admin-ui.md). Extracted out of sections-crud.js -- ICONS/
// ICON_DIRECTORY/DEFAULT_ICON/iconSource() moved here unchanged, plus two
// new functions (renderIconPickerHTML, wireIconPicker) so
// wholesale-sections-crud.js can reuse the exact same picker instead of a
// duplicated copy. sections-crud.js now imports from here instead of
// defining its own local copies -- this is the single source of truth for
// every icon set the admin panel offers.

// Two independent icon sets. The retail set below is the house-hero section
// set (unchanged); the wholesale set is its own separate library with its own
// directory -- wholesale sections are a merchant-defined taxonomy with no
// house-hero zones behind them, so they share no icons with retail. Every
// function here defaults to the retail set, which is what keeps
// sections-crud.js working with zero changes; wholesale-sections-crud.js
// passes WHOLESALE_ICON_SET explicitly.

// ── Retail set (consumer store / house hero) ─────────────────────────────
export const ICONS = ['laundry.svg', 'kitchen-shelving.svg', 'paper-goods.svg', 'bathroom.svg', 'women.svg', 'men.svg', 'reception.svg', 'baby.svg', 'footwear.svg', 'vanity.svg', 'garage.svg', 'cleaning.svg', 'Gift_Home.svg', 'Medications.svg', 'library-book.svg'];
export const ICON_DIRECTORY = '../../../public/assets/icons/';
export const DEFAULT_ICON = 'laundry.svg';

// ── Wholesale set (wholesale store) ──────────────────────────────────────
export const WHOLESALE_ICONS = ['paper-rolls.svg', 'stretch-wrap.svg', 'spray-bottle.svg', 'care-bottle.svg', 'cooking-pot.svg'];
export const WHOLESALE_ICON_DIRECTORY = '../../../public/assets/wholesale-new/';
export const WHOLESALE_DEFAULT_ICON = 'paper-rolls.svg';

// Bundled form each function takes: { icons, iconDirectory, defaultIcon }.
// Callers pass one of these rather than three loose arguments, so adding a
// third set later needs no signature change anywhere.
export const RETAIL_ICON_SET = { icons: ICONS, iconDirectory: ICON_DIRECTORY, defaultIcon: DEFAULT_ICON };
export const WHOLESALE_ICON_SET = { icons: WHOLESALE_ICONS, iconDirectory: WHOLESALE_ICON_DIRECTORY, defaultIcon: WHOLESALE_DEFAULT_ICON };

// Each set is its own allow-list: a name outside the given set (including a
// name that belongs to the *other* set) degrades to that set's own default
// rather than resolving against the wrong directory.
export function iconSource(iconName, iconSet = RETAIL_ICON_SET) {
  const { icons, iconDirectory, defaultIcon } = iconSet;
  return `${iconDirectory}${icons.includes(iconName) ? iconName : defaultIcon}`;
}

// Pure template for the "الأيقونة" form field (label + hidden input + grid
// of icon buttons). `special` is optional -- { icon, label, hint } -- and is
// only ever passed by sections-crud.js for the retail house-triangle "مميز"
// callout on Gift_Home.svg. wholesale-sections-crud.js omits `special`
// (passing only its `iconSet`) and so gets a plain grid with no
// special-cased button and no hint paragraph.
export function renderIconPickerHTML(selectedIcon, { special, iconSet = RETAIL_ICON_SET } = {}) {
  const { icons, defaultIcon } = iconSet;
  const selectedValue = icons.includes(selectedIcon) ? selectedIcon : defaultIcon;
  return `
    <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الأيقونة (اختر من القائمة)</label>
    <input type="hidden" name="icon_name" id="selected-icon-input" value="${selectedValue}" required>
    <div class="grid grid-cols-4 gap-2" id="icon-picker">
      ${icons.map(icon => {
        const isSelected = selectedIcon === icon;
        const isSpecial = Boolean(special && icon === special.icon);
        const baseClass = isSpecial
          ? `icon-btn p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all relative ${isSelected ? 'border-[#1E2154] bg-[#1E2154]/10 ring-1 ring-[#1E2154]' : 'border-amber-400 hover:bg-amber-50 hover:border-amber-500'}`
          : `icon-btn p-2 border rounded-xl flex items-center justify-center transition-all ${isSelected ? 'border-[#0056B3] bg-[#0056B3]/10 ring-1 ring-[#0056B3]' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`;
        return `
        <button type="button" data-icon="${icon}" class="${baseClass}" title="${isSpecial ? 'موضع خاص: قسم عروض البيت (المثلث العلوي)' : icon}">
          ${isSpecial ? `<span class="absolute -top-1.5 right-1 text-[8px] font-bold bg-amber-400 text-white px-1 rounded leading-tight">${escapeHtml(special.label)}</span>` : ''}
          <img src="${iconSource(icon, iconSet)}" class="w-16 h-16 object-contain pointer-events-none" alt="${icon}">
        </button>
      `}).join('')}
    </div>
    ${special ? `
    <p class="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
      <span class="text-sm">⚠️</span>
      ${escapeHtml(special.hint)}
    </p>` : ''}
  `;
}

// DOM wiring: click-toggles .icon-btn selected state and writes the chosen
// filename into the hidden input the caller names. Identical behavior for
// every icon regardless of `special` -- the click handling has nothing
// retail-specific about it, only the render-time styling above does. The
// icon set is taken for the same allow-list reason iconSource() applies it:
// the value written to the form's hidden input can only ever be a filename
// from the set this picker was rendered with (defence in depth -- the grid's
// buttons are already rendered from that same set).
export function wireIconPicker(root, hiddenInputSelector, iconSet = RETAIL_ICON_SET) {
  const { icons, defaultIcon } = iconSet;
  root.querySelectorAll('.icon-btn').forEach(btn => {
    btn.onclick = () => {
      root.querySelectorAll('.icon-btn').forEach(b => {
        b.classList.remove('border-[#0056B3]', 'bg-[#0056B3]/10', 'ring-1', 'ring-[#0056B3]');
        b.classList.add('border-gray-200', 'hover:bg-gray-50', 'hover:border-gray-300');
      });
      btn.classList.add('border-[#0056B3]', 'bg-[#0056B3]/10', 'ring-1', 'ring-[#0056B3]');
      btn.classList.remove('border-gray-200', 'hover:bg-gray-50', 'hover:border-gray-300');
      const clicked = btn.dataset.icon;
      root.querySelector(hiddenInputSelector).value = icons.includes(clicked) ? clicked : defaultIcon;
    };
  });
}
