import { describe, it, expect } from 'vitest';
import { renderAdminSidebarHTML } from '../src/js/admin/admin-nav.js';

// Feature 005, US4 (T024/T025): every admin page's hand-copied <nav> sidebar
// block is replaced by this one shared module (research.md Decision 7,
// contracts/admin-ui.md). Structure per FR-012-FR-014, in order: two
// always-visible flat links, then two collapsible groups. FR-016: the group
// containing activePage auto-expands; a match against a flat link expands
// neither group. These tests pin the render contract down before any of the
// seven admin pages (T026-T032) are wired to it.

const ALL_LINKS = [
  { href: 'dashboard.html', label: 'الرئيسية' },
  { href: 'products.html', label: 'إدارة المنتجات' },
  { href: 'sections.html', label: 'إدارة أقسام متجر المستهلك' },
  { href: 'wholesale-sections.html', label: 'إدارة أقسام متجر الجملة' },
  { href: 'companies.html', label: 'إدارة شركات متجر الجملة' },
  { href: 'invoices.html', label: 'إنشاء وطباعة فاتورة' },
  { href: 'customers.html', label: 'إدارة العملاء' },
];

const CONSUMER_GROUP_LINKS = ['sections.html'];
const WHOLESALE_GROUP_LINKS = ['wholesale-sections.html', 'companies.html', 'invoices.html', 'customers.html'];

describe('renderAdminSidebarHTML: link presence, order, grouping', () => {
  it('renders all seven links with correct hrefs and labels', () => {
    const html = renderAdminSidebarHTML('dashboard.html');
    ALL_LINKS.forEach(link => {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(link.label);
    });
  });

  it('renders the links in FR-012-FR-014 order: flat links, then group 1, then group 2 links in order', () => {
    const html = renderAdminSidebarHTML('dashboard.html');
    const indices = ALL_LINKS.map(link => html.indexOf(`href="${link.href}"`));
    indices.forEach(i => expect(i).toBeGreaterThan(-1));
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });

  it('never nests the two flat links inside a group panel', () => {
    const html = renderAdminSidebarHTML('dashboard.html');
    const firstGroupPanelIndex = html.indexOf('data-group-panel=');
    expect(firstGroupPanelIndex).toBeGreaterThan(-1);
    const dashboardIndex = html.indexOf('href="dashboard.html"');
    const productsIndex = html.indexOf('href="products.html"');
    expect(dashboardIndex).toBeLessThan(firstGroupPanelIndex);
    expect(productsIndex).toBeLessThan(firstGroupPanelIndex);
  });

  it('nests every group-1 link href within the consumer group panel only', () => {
    const html = renderAdminSidebarHTML('dashboard.html');
    const consumerPanel = html.match(/data-group-panel="consumer"[^]*?<\/div>\s*<\/div>/)[0];
    CONSUMER_GROUP_LINKS.forEach(href => expect(consumerPanel).toContain(`href="${href}"`));
    WHOLESALE_GROUP_LINKS.forEach(href => expect(consumerPanel).not.toContain(`href="${href}"`));
  });

  it('nests every group-2 link href within the wholesale group panel only, in the specified order', () => {
    const html = renderAdminSidebarHTML('dashboard.html');
    const wholesalePanel = html.match(/data-group-panel="wholesale"[^]*?<\/div>\s*<\/div>/)[0];
    const indices = WHOLESALE_GROUP_LINKS.map(href => wholesalePanel.indexOf(`href="${href}"`));
    indices.forEach(i => expect(i).toBeGreaterThan(-1));
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]);
    }
  });
});

describe('renderAdminSidebarHTML: active-link marking', () => {
  it.each(ALL_LINKS.map(l => l.href))('marks exactly %s as active when activePage matches it', href => {
    const html = renderAdminSidebarHTML(href);
    const activeLinks = ALL_LINKS.filter(link => {
      const anchorMatch = html.match(new RegExp(`<a class="([^"]*)" href="${link.href.replace('.', '\\.')}">`));
      return anchorMatch && anchorMatch[1].includes('border-[#0056B3]');
    });
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0].href).toBe(href);
  });

  it('marks no link active for an unknown activePage', () => {
    const html = renderAdminSidebarHTML('unknown-page.html');
    ALL_LINKS.forEach(link => {
      const anchorMatch = html.match(new RegExp(`<a class="([^"]*)" href="${link.href.replace('.', '\\.')}">`));
      expect(anchorMatch[1]).not.toContain('border-[#0056B3]');
    });
  });
});

describe('renderAdminSidebarHTML: FR-016 auto-expand', () => {
  it('expands the consumer group and collapses the wholesale group when activePage is sections.html', () => {
    const html = renderAdminSidebarHTML('sections.html');
    const consumerClass = html.match(/data-group-panel="consumer" class="([^"]*)"/)[1];
    const wholesaleClass = html.match(/data-group-panel="wholesale" class="([^"]*)"/)[1];
    expect(consumerClass).not.toContain('hidden');
    expect(wholesaleClass).toContain('hidden');
  });

  it.each(WHOLESALE_GROUP_LINKS)('expands the wholesale group and collapses the consumer group when activePage is %s', href => {
    const html = renderAdminSidebarHTML(href);
    const consumerClass = html.match(/data-group-panel="consumer" class="([^"]*)"/)[1];
    const wholesaleClass = html.match(/data-group-panel="wholesale" class="([^"]*)"/)[1];
    expect(wholesaleClass).not.toContain('hidden');
    expect(consumerClass).toContain('hidden');
  });

  it.each(['dashboard.html', 'products.html'])('expands neither group when activePage is the flat link %s', href => {
    const html = renderAdminSidebarHTML(href);
    const consumerClass = html.match(/data-group-panel="consumer" class="([^"]*)"/)[1];
    const wholesaleClass = html.match(/data-group-panel="wholesale" class="([^"]*)"/)[1];
    expect(consumerClass).toContain('hidden');
    expect(wholesaleClass).toContain('hidden');
  });

  it('expands neither group for an unknown activePage', () => {
    const html = renderAdminSidebarHTML('unknown-page.html');
    const consumerClass = html.match(/data-group-panel="consumer" class="([^"]*)"/)[1];
    const wholesaleClass = html.match(/data-group-panel="wholesale" class="([^"]*)"/)[1];
    expect(consumerClass).toContain('hidden');
    expect(wholesaleClass).toContain('hidden');
  });
});
