import { escapeHtml } from './utils.js';

// Pure template for one cart.html line item. Extracted out of the page's
// inline <script type="module"> for unit testing, and to fix the stored-XSS
// variant found while auditing /cso Findings #2/#3: product_name,
// variant_label, selected_size and selected_color are all copied from
// admin-writable product/variant data at add-to-cart time and were
// rendered into innerHTML with no escaping.
export function renderCartLineHTML(item, formattedPrice, formattedSubtotal) {
  const productName = escapeHtml(item.product_name);
  const details = [
    item.variant_label !== 'افتراضي' ? escapeHtml(item.variant_label) : null,
    item.selected_size ? `المقاس: ${escapeHtml(item.selected_size)}` : null,
    item.selected_color ? `اللون: ${escapeHtml(item.selected_color)}` : null,
  ].filter(Boolean).join(' | ');

  return `
    <article class="bg-white border border-[#9E9E9E]/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group transition-all duration-300 hover:border-[#0056B3]">

      <!-- Thumbnail -->
      <div class="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
        <img class="w-full h-full object-cover" src="${escapeHtml(item.variant_image || '../public/assets/placeholder.svg')}" alt="${productName}">
      </div>

      <!-- Product Info -->
      <div class="flex-grow">
        <h3 class="font-bold text-[#1A237E] text-base md:text-lg mb-1">${productName}</h3>
        <p class="text-xs text-[#75777E] mb-2">
          ${details}
        </p>
        ${item.is_stale
          ? `<span class="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">المنتج ده مبقاش متاح حالياً</span>`
          : `<span class="text-sm font-bold text-[#0056B3]">${formattedPrice}</span>`
        }
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 mt-2 sm:mt-0">
        ${item.is_stale
          ? `<button class="text-red-500 hover:underline text-sm font-semibold" data-remove="${item.id || item.variant_id}">حذف</button>`
          : `
            <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 gap-2">
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-[#75777E] hover:bg-white hover:text-[#0056B3] active:scale-95 transition-all" data-change="${item.id || item.variant_id}" data-value="${item.quantity - 1}">
                <span class="material-symbols-outlined text-sm">remove</span>
              </button>
              <span class="font-bold text-sm w-6 text-center text-[#1A237E]">${item.quantity}</span>
              <button class="w-8 h-8 rounded-lg flex items-center justify-center text-[#75777E] hover:bg-white hover:text-[#0056B3] active:scale-95 transition-all" data-change="${item.id || item.variant_id}" data-value="${item.quantity + 1}">
                <span class="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <span class="font-extrabold text-base text-[#1A237E] min-w-[70px] text-left">${formattedSubtotal}</span>
          `
        }
      </div>

      <!-- Delete Button -->
      <button class="absolute top-4 left-4 text-gray-400 hover:text-red-500 transition-colors p-1" title="إزالة" data-remove="${item.id || item.variant_id}">
        <span class="material-symbols-outlined text-[20px]">delete</span>
      </button>

    </article>
  `;
}
