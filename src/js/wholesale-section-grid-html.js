import { escapeHtml } from './utils.js';

// Pure template for one section's entry on the wholesale homepage's
// section-grid entry view -- mirrors section-nav-html.js. Placeholder-level
// markup: functional structure, real data, working links. The final visual
// design is produced separately (Claude Design) and will replace this
// markup without changing its data/click contract (each entry links to
// wholesale-section-companies.html?section=<slug>).

export function buildWholesaleSectionGridEntryHTML(section) {
  const name = escapeHtml(section.name);
  const slug = escapeHtml(section.slug);
  const icon = escapeHtml(section.icon_name || 'laundry.svg');
  return `
    <a class="flex flex-col items-center gap-2 p-4 bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm hover:border-[#0056B3] hover:shadow-md transition-all text-center" href="wholesale-section-companies.html?section=${slug}">
      <img src="../../public/assets/icons/${icon}" class="w-12 h-12 object-contain pointer-events-none" alt="" onerror="this.style.display='none'">
      <span class="font-bold text-sm text-[#1A237E] line-clamp-1">${name}</span>
    </a>
  `;
}
