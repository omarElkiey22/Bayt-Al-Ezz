import { escapeHtml } from './utils.js';

// Pure template for one section's entry on the wholesale homepage's
// section-grid entry view -- mirrors section-nav-html.js. Placeholder-level
// markup: functional structure, real data, working links. The final visual
// design is produced separately (Claude Design) and will replace this
// markup without changing its data/click contract.
//
// Feature 005, US1: wholesale_sections has no slug column by design
// (research.md Decision 1 -- wholesale sections are keyed by id everywhere,
// the same precedent as ?company=<id>), so each entry links to
// wholesale-section-companies.html?wholesale_section=<id> instead of the
// old ?section=<slug> shape.
//
// Wholesale sections draw from their own icon library
// (public/assets/wholesale-new/), separate from the retail set that
// section-nav-html.js / room-label-html.js use -- the two share no
// filenames. The path below is written relative to the page that renders
// this markup (src/pages/wholesale-home.html), so it needs two '../' to
// reach repo-root public/; the admin-side copy of this set in
// src/js/admin/icon-picker.js needs three, because admin pages sit one
// directory deeper. Keep the default in sync with that module's
// WHOLESALE_DEFAULT_ICON.

export function buildWholesaleSectionGridEntryHTML(section) {
  const name = escapeHtml(section.name);
  const id = escapeHtml(section.id);
  const icon = escapeHtml(section.icon_name || 'paper-rolls.svg');
  return `
    <a class="flex flex-col items-center gap-2 p-4 bg-white border border-[#9E9E9E]/20 rounded-2xl shadow-sm hover:border-[#0056B3] hover:shadow-md transition-all text-center" href="wholesale-section-companies.html?wholesale_section=${id}">
      <img src="../../public/assets/wholesale-new/${icon}" class="w-12 h-12 object-contain pointer-events-none" alt="" onerror="this.style.display='none'">
      <span class="font-bold text-sm text-[#1A237E] line-clamp-1">${name}</span>
    </a>
  `;
}
