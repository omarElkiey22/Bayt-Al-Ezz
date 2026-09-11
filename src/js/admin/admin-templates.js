import { escapeHtml, formatPrice } from '../utils.js';
import { WHOLESALE_ICONS, WHOLESALE_DEFAULT_ICON, WHOLESALE_ICON_SET, iconSource } from './icon-picker.js';

// Pure, testable templates shared by products-crud.js and sections-crud.js.
// Extracted to fix /cso Finding #3: sanitizeInput() (utils.js) only strips
// <tags>, it does not escape quote characters, so values it "sanitized" at
// write time could still break out of an HTML attribute (value=, alt=,
// title=) when rendered without escapeHtml(). Escaping belongs at the
// render boundary -- these functions are that boundary.

export function renderProductFormFieldValues(editing) {
  return {
    name: escapeHtml(editing?.name || ''),
    description: escapeHtml(editing?.description || ''),
  };
}

export function renderProductRow(product, sectionName, wholesaleSectionName, companyName) {
  const name = escapeHtml(product.name);
  const description = escapeHtml(product.description || '');
  const image = escapeHtml(product.primary_image_url || '../../../public/assets/placeholder.svg');
  // plan-eng-review finding, resolved: a missing/undefined wholesaleSectionName
  // or companyName (e.g. an old 2-arg call site, or a product with no
  // wholesale placement) MUST render the same "no wholesale placement"
  // state as a product with none of these set at all -- never the literal
  // string "undefined" in the badge.
  //
  // Code-review follow-up finding (TODOS.md, resolved): this badge shows
  // *category* placement (wholesale section / company), not price -- a
  // product with only a wholesale_price and no section/company has nothing
  // to put inside this specific badge, so it falls back to the same
  // placeholder rather than rendering an empty amber box. The wholesale
  // price itself is never lost -- it's already shown unconditionally in
  // the price column below, independent of this badge.
  const hasWholesalePlacement = Boolean(wholesaleSectionName || companyName);
  const wholesaleBadge = hasWholesalePlacement
    ? `<div class="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit mt-1">
         ${wholesaleSectionName ? `<span class="font-semibold">${escapeHtml(wholesaleSectionName)}</span>` : ''}
         ${wholesaleSectionName && companyName ? ' · ' : ''}
         ${companyName ? escapeHtml(companyName) : ''}
       </div>`
    : `<div class="text-[10px] text-gray-400 mt-1">لا يوجد تصنيف جملة</div>`;
  return `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="p-4">
        <div class="w-12 h-12 rounded-lg border border-[#9E9E9E]/10 overflow-hidden bg-gray-100">
          <img class="w-full h-full object-cover" src="${image}" alt="${name}">
        </div>
      </td>
      <td class="p-4 font-bold">
        <div>${name}</div>
        <div class="text-xs text-[#75777E] mt-0.5 line-clamp-1">${description}</div>
      </td>
      <td class="p-4">
        <span class="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">${escapeHtml(sectionName || 'غير محدد')}</span>
        ${wholesaleBadge}
      </td>
      <td class="p-4">
        <div class="font-bold text-[#0056B3]">${formatPrice(product.base_price)}</div>
        ${product.wholesale_price ? `<div class="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit mt-1">جملة: ${formatPrice(product.wholesale_price)}</div>` : ''}
      </td>
      <td class="p-4">
        <div class="flex items-center justify-center gap-2">
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors" data-edit="${product.id}" title="تعديل">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-delete="${product.id}" title="حذف">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

export function renderSectionFormFieldValues(editing) {
  return {
    name: escapeHtml(editing?.name || ''),
    description: escapeHtml(editing?.description || ''),
  };
}

export function renderCompanyFormFieldValues(editing) {
  return {
    name: escapeHtml(editing?.name || ''),
    description: escapeHtml(editing?.description || ''),
  };
}

export function renderCompanyRow(company) {
  const name = escapeHtml(company.name);
  const logo = escapeHtml(company.logo_url || '../../../public/assets/placeholder.svg');
  return `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="p-4">
        <div class="w-12 h-12 rounded-lg border border-[#9E9E9E]/10 overflow-hidden bg-gray-100">
          <img class="w-full h-full object-cover" src="${logo}" alt="${name}">
        </div>
      </td>
      <td class="p-4 font-bold">
        <div>${name}</div>
        <div class="text-xs text-[#75777E] mt-0.5 line-clamp-1">${escapeHtml(company.description || '')}</div>
      </td>
      <td class="p-4">
        <span class="${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} text-xs font-semibold px-2.5 py-0.5 rounded-full">${company.is_active ? 'نشطة' : 'موقوفة'}</span>
      </td>
      <td class="p-4">
        <div class="flex items-center justify-center gap-2">
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors" data-edit="${company.id}" title="تعديل">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-delete="${company.id}" title="حذف">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

export function renderWholesaleSectionFormFieldValues(editing) {
  return {
    name: escapeHtml(editing?.name || ''),
    display_order: editing?.display_order ?? 0,
    // Feature 005, US3: same default-icon fallback style as the other
    // fields' defaulting above -- mirrors how renderSectionRow's icon
    // column already degrades via the shared icon-picker.js's iconSource().
    // Validated against the WHOLESALE set, not the retail one: these are
    // wholesale sections, whose icons come from their own separate library
    // (public/assets/wholesale-new/), so a retail icon name here is just as
    // invalid as an unknown one and degrades to the wholesale default.
    // Note: wholesale-sections-crud.js's picker itself reads icon_name
    // straight off the editing record (renderIconPickerHTML() does its own
    // equivalent fallback internally), not through this field -- same
    // convention sections-crud.js already uses. This field exists so the
    // defaulted value is available/testable independent of the picker.
    icon_name: WHOLESALE_ICONS.includes(editing?.icon_name) ? editing.icon_name : WHOLESALE_DEFAULT_ICON,
  };
}

export function renderWholesaleSectionRow(section, index) {
  const name = escapeHtml(section.name);
  return `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="p-4 font-semibold text-gray-400">#${index + 1}</td>
      <td class="p-4 font-bold">${name}</td>
      <td class="p-4">
        <img src="${iconSource(section.icon_name, WHOLESALE_ICON_SET)}" class="w-16 h-16 rounded object-contain" alt="">
      </td>
      <td class="p-4">
        <span class="${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} text-xs font-semibold px-2.5 py-0.5 rounded-full">${section.is_active ? 'نشط' : 'موقوف'}</span>
      </td>
      <td class="p-4">
        <div class="flex items-center justify-center gap-2">
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors" data-edit="${section.id}" title="تعديل">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-delete="${section.id}" title="حذف">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}

export function renderSectionRow(section, index, iconSrc, isActive) {
  return `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="p-4 font-semibold text-gray-400">#${index + 1}</td>
      <td class="p-4 font-bold">
        <div>${escapeHtml(section.name)}</div>
        <div class="text-xs text-[#75777E] mt-0.5 max-w-[200px] truncate" title="${escapeHtml(section.description || '')}">${escapeHtml(section.description || '')}</div>
      </td>
      <td class="p-4">
        <img src="${iconSrc || ''}" class="w-16 h-16 rounded object-contain" alt="">
      </td>
      <td class="p-4">
        <span class="${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} text-xs font-semibold px-2.5 py-0.5 rounded-full">${isActive ? 'نشط' : 'موقوف'}</span>
      </td>
      <td class="p-4">
        <div class="flex items-center justify-center gap-2">
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-[#0056B3]/10 transition-colors" data-edit="${section.id}" title="تعديل">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button class="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" data-delete="${section.id}" title="حذف">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `;
}
