import { escapeHtml } from './utils.js';

// Pure templates for category.html's sidebar and mobile section nav.
// Extracted out of the page's inline <script type="module"> so the escaping
// fix is unit testable (inline scripts inside .html files can't be
// imported by the test runner).

export function buildSidebarNavLinkHTML(section, { isActive, mockParam }) {
  const activeClass = isActive
    ? 'bg-[#0056B3]/10 text-[#0056B3] font-bold border-r-4 border-[#0056B3]'
    : 'text-[#75777E] hover:bg-gray-100 hover:text-[#1A237E]';
  return `
    <a class="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${activeClass}" href="category.html?section=${escapeHtml(section.slug)}${escapeHtml(mockParam || '')}">
      <img src="../../public/assets/icons/${escapeHtml(section.icon_name || 'laundry.svg')}" class="w-7 h-7 object-contain pointer-events-none" alt="" onerror="this.style.display='none'">
      <span>${escapeHtml(section.name)}</span>
    </a>
  `;
}

export function buildMobileNavLinkHTML(section, { isActive, mockParam }) {
  const activeClass = isActive
    ? 'bg-[#0056B3] text-white border-[#0056B3]'
    : 'bg-white text-[#75777E] border-gray-200 hover:bg-gray-50';
  return `
    <a class="flex-shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition-all ${activeClass}" href="category.html?section=${escapeHtml(section.slug)}${escapeHtml(mockParam || '')}">
      ${escapeHtml(section.name)}
    </a>
  `;
}
