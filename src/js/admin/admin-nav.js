// Feature 005, US4: shared admin sidebar module (research.md Decision 7,
// contracts/admin-ui.md). Single source of truth for all 7 admin pages'
// sidebars, replacing 7 hand-copied <nav> blocks. FR-012-FR-014: two
// always-visible flat links, then two collapsible groups. FR-016: the group
// containing activePage auto-expands on load; a match against a flat link
// expands neither group. All link data here is static/developer-authored
// (never DB-sourced), so unlike section-nav-html.js it needs no escapeHtml()
// -- there is no attacker-controllable input flowing through this module.

const FLAT_LINKS = [
  { href: 'dashboard.html', icon: 'dashboard', label: 'الرئيسية' },
  { href: 'products.html', icon: 'inventory_2', label: 'إدارة المنتجات' },
];

const GROUPS = [
  {
    id: 'consumer',
    icon: 'storefront',
    label: 'إدارة متجر المستهلك',
    links: [
      { href: 'sections.html', icon: 'layers', label: 'إدارة أقسام متجر المستهلك' },
    ],
  },
  {
    id: 'wholesale',
    icon: 'warehouse',
    label: 'إدارة متجر الجملة',
    links: [
      { href: 'wholesale-sections.html', icon: 'category', label: 'إدارة أقسام متجر الجملة' },
      { href: 'companies.html', icon: 'store', label: 'إدارة شركات متجر الجملة' },
      { href: 'invoices.html', icon: 'receipt_long', label: 'إنشاء وطباعة فاتورة' },
      { href: 'customers.html', icon: 'group', label: 'إدارة العملاء' },
    ],
  },
];

function renderLinkHTML(link, activePage) {
  const isActive = activePage === link.href;
  const cls = isActive
    ? 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bg-[#0056B3]/10 text-[#0056B3] font-bold border-r-4 border-[#0056B3]'
    : 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[#75777E] hover:bg-gray-100 hover:text-[#1A237E]';
  return `
      <a class="${cls}" href="${link.href}">
        <span class="material-symbols-outlined">${link.icon}</span>
        <span>${link.label}</span>
      </a>`;
}

function groupContainingActivePage(activePage) {
  return GROUPS.find(group => group.links.some(link => link.href === activePage)) || null;
}

function renderGroupHTML(group, activePage) {
  const isExpanded = groupContainingActivePage(activePage) === group;
  const panelClass = `flex flex-col gap-1 pr-2 mt-1${isExpanded ? '' : ' hidden'}`;
  return `
      <div class="flex flex-col">
        <button type="button" class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[#75777E] hover:bg-gray-100 hover:text-[#1A237E] font-bold text-sm" data-group-toggle="${group.id}">
          <span class="flex items-center gap-3">
            <span class="material-symbols-outlined">${group.icon}</span>
            <span>${group.label}</span>
          </span>
          <span class="material-symbols-outlined text-base transition-transform duration-200${isExpanded ? ' rotate-180' : ''}" data-group-chevron="${group.id}">expand_more</span>
        </button>
        <div data-group-panel="${group.id}" class="${panelClass}">
          ${group.links.map(link => renderLinkHTML(link, activePage)).join('')}
        </div>
      </div>`;
}

// Pure template -- returns the <nav>...</nav> inner HTML. `activePage` is
// the calling page's own filename (e.g. 'products.html'), a one-line literal
// at each page's call site, never derived from location.pathname, so it
// works identically regardless of deployment path depth.
export function renderAdminSidebarHTML(activePage) {
  return `
      ${FLAT_LINKS.map(link => renderLinkHTML(link, activePage)).join('')}
      ${GROUPS.map(group => renderGroupHTML(group, activePage)).join('')}
    `;
}

// DOM wiring: call once after injecting the HTML above into the DOM. Wires
// each group's toggle button to expand/collapse its panel and rotate its
// chevron. The initial expanded/collapsed state (FR-016's auto-expand) is
// already baked into renderAdminSidebarHTML()'s output above -- this only
// handles the click-time transition, mirroring icon-picker.js's split
// between render-time state and wireIconPicker()'s click-time behavior.
export function initAdminSidebarBehavior(root, activePage) {
  GROUPS.forEach(group => {
    const toggle = root.querySelector(`[data-group-toggle="${group.id}"]`);
    const panel = root.querySelector(`[data-group-panel="${group.id}"]`);
    const chevron = root.querySelector(`[data-group-chevron="${group.id}"]`);
    if (!toggle || !panel) return;
    toggle.onclick = () => {
      panel.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('rotate-180');
    };
  });
}
