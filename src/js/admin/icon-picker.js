import { escapeHtml } from '../utils.js';

// Feature 005, US3: shared icon-picker module (research.md Decision 5,
// contracts/admin-ui.md). Extracted out of sections-crud.js -- ICONS/
// ICON_DIRECTORY/DEFAULT_ICON/iconSource() moved here unchanged, plus two
// new functions (renderIconPickerHTML, wireIconPicker) so
// wholesale-sections-crud.js can reuse the exact same picker instead of a
// duplicated copy. sections-crud.js now imports from here instead of
// defining its own local copies -- this is the single source of truth for
// the admin panel's icon set.

export const ICONS = ['laundry.svg', 'kitchen-shelving.svg', 'paper-goods.svg', 'bathroom.svg', 'women.svg', 'men.svg', 'reception.svg', 'baby.svg', 'footwear.svg', 'vanity.svg', 'garage.svg', 'cleaning.svg', 'Gift_Home.svg', 'Medications.svg', 'library-book.svg'];
export const ICON_DIRECTORY = '../../../public/assets/icons/';
export const DEFAULT_ICON = 'laundry.svg';

export function iconSource(iconName) {
  return `${ICON_DIRECTORY}${ICONS.includes(iconName) ? iconName : DEFAULT_ICON}`;
}

// Pure template for the "الأيقونة" form field (label + hidden input + grid
// of icon buttons). `special` is optional -- { icon, label, hint } -- and is
// only ever passed by sections-crud.js for the retail house-triangle "مميز"
// callout on Gift_Home.svg. wholesale-sections-crud.js omits it entirely and
// gets a plain grid with no special-cased button and no hint paragraph.
export function renderIconPickerHTML(selectedIcon, { special } = {}) {
  const selectedValue = ICONS.includes(selectedIcon) ? selectedIcon : DEFAULT_ICON;
  return `
    <label class="block text-xs font-semibold text-[#1A237E] mb-1.5">الأيقونة (اختر من القائمة)</label>
    <input type="hidden" name="icon_name" id="selected-icon-input" value="${selectedValue}" required>
    <div class="grid grid-cols-4 gap-2" id="icon-picker">
      ${ICONS.map(icon => {
        const isSelected = selectedIcon === icon;
        const isSpecial = Boolean(special && icon === special.icon);
        const baseClass = isSpecial
          ? `icon-btn p-2 border-2 rounded-xl flex flex-col items-center justify-center transition-all relative ${isSelected ? 'border-[#1E2154] bg-[#1E2154]/10 ring-1 ring-[#1E2154]' : 'border-amber-400 hover:bg-amber-50 hover:border-amber-500'}`
          : `icon-btn p-2 border rounded-xl flex items-center justify-center transition-all ${isSelected ? 'border-[#0056B3] bg-[#0056B3]/10 ring-1 ring-[#0056B3]' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`;
        return `
        <button type="button" data-icon="${icon}" class="${baseClass}" title="${isSpecial ? 'موضع خاص: قسم عروض البيت (المثلث العلوي)' : icon}">
          ${isSpecial ? `<span class="absolute -top-1.5 right-1 text-[8px] font-bold bg-amber-400 text-white px-1 rounded leading-tight">${escapeHtml(special.label)}</span>` : ''}
          <img src="${iconSource(icon)}" class="w-16 h-16 object-contain pointer-events-none" alt="${icon}">
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
// retail-specific about it, only the render-time styling above does.
export function wireIconPicker(root, hiddenInputSelector) {
  root.querySelectorAll('.icon-btn').forEach(btn => {
    btn.onclick = () => {
      root.querySelectorAll('.icon-btn').forEach(b => {
        b.classList.remove('border-[#0056B3]', 'bg-[#0056B3]/10', 'ring-1', 'ring-[#0056B3]');
        b.classList.add('border-gray-200', 'hover:bg-gray-50', 'hover:border-gray-300');
      });
      btn.classList.add('border-[#0056B3]', 'bg-[#0056B3]/10', 'ring-1', 'ring-[#0056B3]');
      btn.classList.remove('border-gray-200', 'hover:bg-gray-50', 'hover:border-gray-300');
      root.querySelector(hiddenInputSelector).value = btn.dataset.icon;
    };
  });
}
