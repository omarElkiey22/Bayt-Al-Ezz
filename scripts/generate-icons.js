import fs from 'fs';
import path from 'path';

const icons = [
  'laundry', 'kitchen-shelving', 'paper-goods', 'bathroom', 'women', 'men', 
  'reception', 'baby', 'footwear', 'vanity', 'garage', 'cleaning', 'placeholder'
];

const dir = 'd:/مشاريع/Bayt Al-Ezz/public/assets/icons';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

icons.forEach(icon => {
  const file = icon === 'placeholder' 
    ? 'd:/مشاريع/Bayt Al-Ezz/public/assets/placeholder.svg' 
    : path.join(dir, `${icon}.svg`);
    
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#EAEAEA" rx="8" />
    <text x="50" y="55" font-size="12" font-family="sans-serif" text-anchor="middle" fill="#333">${icon}</text>
  </svg>`;
  
  fs.writeFileSync(file, svg);
});

console.log('Icons generated.');
