import {fetchActiveSections} from './sections-api.js';
async function loadCoordinates(){return fetch('../../public/assets/house-coordinates.json').then(r=>r.json())}
function openHouse(root){
  root.classList.add('house-open');
  sessionStorage.setItem('house_opened', '1');
}
function createLabel(section,position){
  const label=document.createElement('button');
  label.className='room-label';
  label.style.left=`${position.cx}%`;
  label.style.top=`${position.cy}%`;
  label.style.transitionDelay=`${section.display_order*35}ms`;
  label.innerHTML=`
    <img src="../../public/assets/icons/${section.icon_name || 'placeholder.svg'}" class="w-5 h-5 object-contain pointer-events-none" alt="" onerror="this.style.display='none'">
    <span>${section.name}</span>
  `;
  label.setAttribute('aria-label',section.name);
  label.addEventListener('click',()=>location.href=`category.html?section=${encodeURIComponent(section.slug)}`);
  return label;
}
export async function initializeHouse(root){
  const [sections,coordinates]=await Promise.all([fetchActiveSections(),loadCoordinates()]);
  const labels=root.querySelector('.room-labels');
  
  for(const section of sections){
    const position=coordinates.find(item=>item.slug===section.slug);
    if(!position)continue;
    
    // Zones are now in frame 2 (if present)
    const zone=root.querySelector(`#hero-frame-2 #${CSS.escape(section.slug)}`) || root.querySelector(`#${CSS.escape(section.slug)}`);
    if(zone){
      zone.classList.add('zone');
      zone.tabIndex=0;
      zone.setAttribute('aria-label',section.name);
      zone.addEventListener('click',()=>location.href=`category.html?section=${encodeURIComponent(section.slug)}`);
      zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();zone.click()}});
    }
    
    labels.append(createLabel(section,position));
  }
  
  if (sessionStorage.getItem('house_opened') === '1') {
    root.classList.add('house-open');
  } else {
    setTimeout(() => openHouse(root), 2000);
  }
}
