import { escapeHtml } from './utils.js';

// The `mock` URL query param is read straight from location.search and
// echoed back into the DOM in several places (dev/testing convenience
// flag). Any such reflection has to be escaped -- it's pure attacker-
// controlled input reachable via a crafted link, no privileged access
// needed.
export function buildMockHiddenInputHTML(mockValue) {
  if (!mockValue) return '';
  return `<input type="hidden" name="mock" value="${escapeHtml(mockValue)}">`;
}
