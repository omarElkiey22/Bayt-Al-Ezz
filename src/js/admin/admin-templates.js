import { escapeHtml, formatPrice } from '../utils.js';

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

export function renderProductRow(product, sectionName) {
  const name = escapeHtml(product.name);
  const description = escapeHtml(product.description || '');
  const image = escapeHtml(product.primary_image_url || '../../public/assets/placeholder.svg');
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

export function renderSectionRow(section, index, iconSrc) {
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
