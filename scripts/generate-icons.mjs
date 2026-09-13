import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.resolve(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Regular icon SVG (rounded rect)
const anySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#0F172A"/>
  <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear)" stroke-width="32"/>
  <path d="M256 160V352M160 256H352" stroke="#F43F5E" stroke-width="32" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="42" fill="#FFFFFF"/>
  <defs>
    <linearGradient id="paint0_linear" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F43F5E"/>
      <stop offset="1" stop-color="#FB7185"/>
    </linearGradient>
  </defs>
</svg>`;

// 2. Maskable icon SVG (full bleed #0F172A background, emblem inside 75% safe area)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#0F172A"/>
  <g transform="translate(64, 64) scale(0.75)">
    <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear)" stroke-width="32"/>
    <path d="M256 160V352M160 256H352" stroke="#F43F5E" stroke-width="32" stroke-linecap="round"/>
    <circle cx="256" cy="256" r="42" fill="#FFFFFF"/>
  </g>
  <defs>
    <linearGradient id="paint0_linear" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F43F5E"/>
      <stop offset="1" stop-color="#FB7185"/>
    </linearGradient>
  </defs>
</svg>`;

// 3. Apple Touch Icon SVG (full square, no pre-rounding because iOS masks it)
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#0F172A"/>
  <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear)" stroke-width="32"/>
  <path d="M256 160V352M160 256H352" stroke="#F43F5E" stroke-width="32" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="42" fill="#FFFFFF"/>
  <defs>
    <linearGradient id="paint0_linear" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F43F5E"/>
      <stop offset="1" stop-color="#FB7185"/>
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.resolve(publicDir, 'icon-any.svg'), anySvg);
fs.writeFileSync(path.resolve(publicDir, 'icon-maskable.svg'), maskableSvg);
fs.writeFileSync(path.resolve(publicDir, 'icon-apple.svg'), appleSvg);

console.log('SVGs generated successfully');
