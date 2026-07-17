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

const GIFT_HOME_ICON = 'Gift_Home.svg';

function createLabel(section, bounds, fallback, delay, options = {}) {
  const label = document.createElement('button');
  const isGift = options.isGift || false;

  if (isGift) {
    // Special gift/promo section — lives in the triangle (roof) area
    // Triangle points from Frame 2.svg viewBox(2048×2048): (35,512) (1018,51) (2000,512)
    // As percentages: left=1.71%, top=2.49%, width=95.95%, height=22.51%
    // clip-path points relative to the button bounding box:
    //   top-left  (35,512)  → (0%, 100%)
    //   apex      (1018,51) → ((1018-35)/(2000-35)*100%, (51-51)/(512-51)*100%) = (50%, 0%)
    //   top-right (2000,512)→ (100%, 100%)
    label.className = 'room-label room-label--gift';
    label.style.left   = '1.71%';
    label.style.top    = '2.49%';
    label.style.width  = '95.95%';
    label.style.height = '22.51%';
  } else {
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
  }

  label.style.transitionDelay = `${delay * 35}ms`;
  label.innerHTML = `
    <img src="../../public/assets/icons/${section.icon_name || 'placeholder.svg'}" class="room-label__icon object-contain pointer-events-none" alt="" onerror="this.style.display='none'">
    <span class="room-label__text text-center font-extrabold">${section.name}</span>
  `;
  label.setAttribute('aria-label', section.name);
  label.addEventListener('click', () => location.href = `category.html?section=${encodeURIComponent(section.slug)}`);
  return label;
}

export async function initializeHouse(root) {
  const [sections, coordinates] = await Promise.all([fetchActiveSections(), loadCoordinates()]);
  const labels = root.querySelector('.room-labels');

  // Separate gift sections (icon === Gift_Home.svg) from regular grid sections
  const giftSections = sections.filter(s => s.icon_name === GIFT_HOME_ICON);
  const regularSections = sections.filter(s => s.icon_name !== GIFT_HOME_ICON);
  const gridCoordinates = coordinates.filter(c => !c.isGiftZone);

  // Render regular grid sections mapped by index
  regularSections.forEach((section, index) => {
    if (index >= gridCoordinates.length) return;
    const slot = gridCoordinates[index];

    // Look for the SVG zone element (in frame-2 first, then frame-1) using the static slot ID
    const zone = root.querySelector(`#hero-frame-2 #${CSS.escape(slot.slug)}`)
              || root.querySelector(`#${CSS.escape(slot.slug)}`);

    let bounds = null;
    if (zone) {
      zone.classList.add('zone');
      zone.tabIndex = 0;
      zone.setAttribute('aria-label', section.name);
      zone.addEventListener('click', () => location.href = `category.html?section=${encodeURIComponent(section.slug)}`);
      zone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zone.click(); } });
      bounds = zoneBoundsPercent(zone);
    }

    labels.append(createLabel(section, bounds, slot, index));
  });

  // Render gift/promo sections in the triangle roof zone
  giftSections.forEach((section, index) => {
    // Wire up the SVG gift-zone element for hover/click
    const giftZone = root.querySelector('#hero-frame-2 #gift-zone')
                  || root.querySelector('#gift-zone');
    if (giftZone && index === 0) {
      giftZone.classList.add('zone');
      giftZone.tabIndex = 0;
      giftZone.setAttribute('aria-label', section.name);
      giftZone.addEventListener('click', () => location.href = `category.html?section=${encodeURIComponent(section.slug)}`);
      giftZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); giftZone.click(); } });
    }

    labels.append(createLabel(section, null, null, index, { isGift: true }));
  });

  if (sessionStorage.getItem('house_opened') === '1') {
    root.classList.add('house-open');
  } else {
    setTimeout(() => openHouse(root), 2000);
  }
}
