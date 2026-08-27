import { searchProducts } from './products-api.js';
import { formatPrice, escapeHtml } from './utils.js';
import { buildMockHiddenInputHTML } from './mock-param-html.js';

export function initializeSearchBar(containerElement) {
  if (!containerElement) return;

  const isMock = new URLSearchParams(location.search).get('mock');
  // Escaped once here so every href/attribute reuse below is already safe --
  // `mock` is attacker-controlled URL input, reflected in several places.
  const mockParam = isMock ? `&mock=${escapeHtml(isMock)}` : '';

  containerElement.innerHTML = `
    <div class="relative flex-grow max-w-xs md:max-w-md mx-2 md:mx-4" id="header-search-container">
      <form id="header-search-form" class="relative flex items-center w-full" action="category.html" method="GET">
        ${buildMockHiddenInputHTML(isMock)}
        <input 
          type="text" 
          id="header-search-input" 
          name="search" 
          placeholder="ابحث عن منتج..." 
          autocomplete="off"
          class="w-full bg-white/15 text-white placeholder-white/70 text-xs md:text-sm rounded-full pl-9 pr-4 py-1.5 md:py-2 border border-white/30 focus:outline-none focus:bg-white focus:text-[#1A237E] focus:placeholder-gray-400 transition-all shadow-inner"
        />
        <button type="submit" class="absolute left-2.5 text-white/80 hover:text-white focus:outline-none flex items-center justify-center" aria-label="بحث">
          <span class="material-symbols-outlined text-lg">search</span>
        </button>
      </form>
      <!-- Dropdown Results -->
      <div id="header-search-dropdown" class="absolute right-0 left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 hidden max-h-80 overflow-y-auto divide-y divide-gray-100 text-right">
      </div>
    </div>
  `;

  const input = containerElement.querySelector('#header-search-input');
  const form = containerElement.querySelector('#header-search-form');
  const dropdown = containerElement.querySelector('#header-search-dropdown');

  let debounceTimer = null;

  // Handle focus when input turns white
  input.addEventListener('focus', () => {
    const btnIcon = form.querySelector('button span');
    if (btnIcon) {
      btnIcon.classList.remove('text-white/80');
      btnIcon.classList.add('text-[#1A237E]');
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      const btnIcon = form.querySelector('button span');
      if (btnIcon && !input.value) {
        btnIcon.classList.remove('text-[#1A237E]');
        btnIcon.classList.add('text-white/80');
      }
    }, 200);
  });

  const performSearch = async () => {
    const query = input.value.trim();
    if (!query) {
      dropdown.innerHTML = '';
      dropdown.classList.add('hidden');
      return;
    }

    dropdown.innerHTML = `
      <div class="p-4 text-center text-xs text-[#75777E] flex items-center justify-center gap-2">
        <span class="material-symbols-outlined animate-spin text-sm">sync</span>
        <span>جاري البحث...</span>
      </div>
    `;
    dropdown.classList.remove('hidden');

    try {
      const results = await searchProducts(query);
      if (!results.length) {
        dropdown.innerHTML = `
          <div class="p-4 text-center text-sm text-[#75777E]">
            لا توجد منتجات تطابق "<span class="font-bold text-[#1A237E]">${escapeHtml(query)}</span>"
          </div>
        `;
        return;
      }

      const itemsHtml = results.slice(0, 5).map(p => `
        <a href="product.html?id=${p.id}${mockParam}" class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group">
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
            <img src="${escapeHtml(p.primary_image_url || '../../public/assets/placeholder.svg')}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
          <div class="flex-grow min-w-0">
            <div class="text-sm font-bold text-[#1A237E] truncate group-hover:text-[#0056B3] transition-colors">${escapeHtml(p.name)}</div>
            <div class="text-xs text-[#75777E] flex items-center gap-2 mt-0.5">
              ${p.section_name ? `<span class="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">${escapeHtml(p.section_name)}</span>` : ''}
              <span class="font-semibold text-[#0056B3]">${formatPrice(p.starting_price || p.base_price)}</span>
            </div>
          </div>
        </a>
      `).join('');

      const viewAllHtml = `
        <a href="category.html?search=${encodeURIComponent(query)}${mockParam}" class="block p-3 text-center text-xs font-bold text-[#0056B3] bg-gray-50 hover:bg-[#0056B3]/10 transition-colors border-t border-gray-100">
          عرض جميع النتائج (${results.length}) ➔
        </a>
      `;

      dropdown.innerHTML = itemsHtml + viewAllHtml;
    } catch (e) {
      console.error('Search error:', e);
      dropdown.innerHTML = `
        <div class="p-3 text-center text-xs text-red-500">
          حدث خطأ أثناء البحث
        </div>
      `;
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 250);
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!containerElement.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Re-open dropdown on click if input has value
  input.addEventListener('click', () => {
    if (input.value.trim() && dropdown.children.length > 0) {
      dropdown.classList.remove('hidden');
    }
  });
}
