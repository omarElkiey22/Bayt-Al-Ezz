import { escapeHtml } from './utils.js';

// Pure template for category.html's "no search results" empty state.
// searchQuery comes straight from the URL (getQueryParam('search')) -- pure
// attacker-controlled input -- and was rendered unescaped into innerHTML,
// a zero-privilege reflected XSS reachable via a crafted link alone.
export function buildNoResultsHTML({ searchQuery, indexMockParam }) {
  return `
    <span class="material-symbols-outlined text-6xl text-[#75777E] mb-4">search_off</span>
    <h3 class="text-xl font-bold text-[#1A237E] mb-2">لا توجد نتائج بحث مطابقة</h3>
    <p class="text-[#75777E] mb-6">لم نعثر على أي منتج يطابق كلمة "${escapeHtml(searchQuery)}". جرب البحث باسم منتج آخر.</p>
    <a class="inline-flex items-center gap-2 bg-[#0056B3] hover:bg-[#004491] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm" href="index.html${escapeHtml(indexMockParam || '')}">
      <span class="material-symbols-outlined text-sm">home</span>
      العودة للرئيسية
    </a>
  `;
}
