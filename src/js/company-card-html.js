import { escapeHtml } from './utils.js';

// Pure template for a company card (logo + name), used by
// wholesale-section-companies.html and wholesale-home.html's "Browse
// Companies" showcase. Mirrors section-nav-html.js: extracted so escaping
// is unit testable, since inline scripts inside .html files can't be
// imported by the test runner.
//
// Returns the card only (no wrapping <a> href) -- the two pages that use
// this link to different targets (category.html?section=<slug>&company=<id>
// vs category.html?company=<id>), so the caller wraps the returned markup
// in the anchor appropriate for its context; the company id is also
// exposed via data-company-id for callers that prefer event delegation.

export function buildCompanyCardHTML(company) {
  const name = escapeHtml(company.name || '');
  const logoUrl = company.logo_url;
  const monogram = escapeHtml((company.name || '؟').trim().charAt(0) || '؟');

  const media = logoUrl
    ? `
      <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-[#9E9E9E]/10 flex items-center justify-center shrink-0">
        <img src="${escapeHtml(logoUrl)}" alt="${name}" class="w-full h-full object-contain" onerror="this.style.display='none'">
      </div>
    `
    : `
      <div class="w-16 h-16 rounded-xl bg-gray-50 border border-[#9E9E9E]/10 text-amber-600 flex items-center justify-center shrink-0 font-extrabold text-2xl" aria-hidden="true">
        ${monogram}
      </div>
    `;

  return `
    <div class="company-card flex flex-col items-center gap-2 p-4 bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm hover:border-amber-500 hover:shadow-md transition-all text-center" data-company-id="${escapeHtml(company.id)}">
      ${media}
      <span class="font-bold text-sm text-[#1A237E] line-clamp-1">${name}</span>
    </div>
  `;
}
