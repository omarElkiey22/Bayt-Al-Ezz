import { describe, it, expect } from 'vitest';
import { buildRoomLabelHTML } from '../src/js/room-label-html.js';

// Regression guard for /cso Finding #2: section.name was interpolated
// straight into innerHTML with no escaping, so any section name written to
// the DB (writable by anyone the RLS gap in Finding #1 lets in) becomes
// stored XSS against every homepage visitor.

describe('buildRoomLabelHTML', () => {
  it('escapes a malicious section name instead of emitting a live tag', () => {
    const section = { name: '<img src=x onerror=alert(1)>', slug: 'x', icon_name: 'laundry.svg' };
    const html = buildRoomLabelHTML(section);
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('still renders a normal section name and icon', () => {
    const section = { name: 'الغسالة', slug: 'laundry', icon_name: 'laundry.svg' };
    const html = buildRoomLabelHTML(section);
    expect(html).toContain('الغسالة');
    expect(html).toContain('laundry.svg');
  });
});
