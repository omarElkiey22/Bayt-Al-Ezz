import { escapeHtml } from './utils.js';

// Pure, dependency-free template used by house-interactions.js to build a
// room label's innerHTML. Kept in its own module (instead of inline in
// house-interactions.js) so it can be unit tested without dragging in the
// sections-api.js -> supabase-client.js import chain, which reaches out to
// a live CDN URL and can't be loaded by the plain Node ESM loader in tests.
export function buildRoomLabelHTML(section) {
  return `
    <img src="../../public/assets/icons/${escapeHtml(section.icon_name || 'placeholder.svg')}" class="room-label__icon object-contain pointer-events-none" alt="" onerror="this.style.display='none'">
    <span class="room-label__text text-center font-extrabold">${escapeHtml(section.name)}</span>
  `;
}
