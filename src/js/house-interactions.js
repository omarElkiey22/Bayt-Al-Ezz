import {fetchActiveSections} from './sections-api.js';
async function loadCoordinates(){return fetch('../../public/assets/house-coordinates.json').then(r=>r.json())}
function openHouse(root){
  root.classList.add('house-open');
  sessionStorage.setItem('house_opened', '1');
}

/**
 * Compute a zone's bounding-box as percentages of the SVG viewBox.
 * Works for <g>, <rect>, <path> or any SVG element with getBBox().
 */
function zoneBoundsPercent(zone) {
  const svg = zone.ownerSVGElement;
  if (!svg) return null;
  const vb = svg.viewBox.baseVal;
  if (!vb || !vb.width) return null;
  const bbox = zone.getBBox();
  return {
    left:   (bbox.x / vb.width)  * 100,
    top:    (bbox.y / vb.height) * 100,
    width:  (bbox.width / vb.width)  * 100,
    height: (bbox.height / vb.height) * 100,
  };
}

function createLabel(section, bounds, fallback, delay) {
  const label = document.createElement('button');
  label.className = 'room-label';

  if (bounds) {
    // Position & size from the actual SVG zone bounding box with a 1.5% inset gap
    const insetX = 1.5;
    const insetY = 1.5;
    label.style.left   = `${bounds.left + insetX}%`;
    label.style.top    = `${bounds.top + insetY}%`;
    label.style.width  = `${bounds.width - insetX * 2}%`;
    label.style.height = `${bounds.height - insetY * 2}%`;
  } else if (fallback) {
    // Graceful degradation: old cx/cy approach
    label.style.left = `${fallback.cx}%`;
    label.style.top  = `${fallback.cy}%`;
  }

  label.style.transitionDelay = `${delay * 35}ms`;
  label.innerHTML = `
    <img src="../../public/assets/icons/${section.icon_name || 'placeholder.svg'}" class="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain pointer-events-none mb-1 md:mb-2" alt="" onerror="this.style.display='none'">
    <span class="text-center font-extrabold text-sm md:text-base leading-tight">${section.name}</span>
  `;
  label.setAttribute('aria-label', section.name);
  label.addEventListener('click', () => location.href = `category.html?section=${encodeURIComponent(section.slug)}`);
  return label;
}

export async function initializeHouse(root) {
  const [sections, coordinates] = await Promise.all([fetchActiveSections(), loadCoordinates()]);
  const labels = root.querySelector('.room-labels');

  for (const section of sections) {
    const fallback = coordinates.find(item => item.slug === section.slug);
    if (!fallback) continue;

    // Look for the SVG zone element (in frame-2 first, then frame-1)
    const zone = root.querySelector(`#hero-frame-2 #${CSS.escape(section.slug)}`)
              || root.querySelector(`#${CSS.escape(section.slug)}`);

    let bounds = null;
    if (zone) {
      zone.classList.add('zone');
      zone.tabIndex = 0;
      zone.setAttribute('aria-label', section.name);
      zone.addEventListener('click', () => location.href = `category.html?section=${encodeURIComponent(section.slug)}`);
      zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zone.click(); } });
      bounds = zoneBoundsPercent(zone);
    }

    labels.append(createLabel(section, bounds, fallback, section.display_order));
  }

  if (sessionStorage.getItem('house_opened') === '1') {
    root.classList.add('house-open');
  } else {
    setTimeout(() => openHouse(root), 2000);
  }
}
