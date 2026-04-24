import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'icons');

mkdirSync(OUT_DIR, { recursive: true });

function makeSvg(size) {
  const fontSize = Math.round(size * 0.5);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#1A1A2E"/>
      <text
        x="50%"
        y="54%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-size="${fontSize}"
      >📊</text>
    </svg>
  `);
}

const SIZES = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-180.png', size: 180 },
];

for (const { name, size } of SIZES) {
  await sharp(makeSvg(size), { density: 300 })
    .png()
    .toFile(join(OUT_DIR, name));
  console.log(`✓ Generated ${name}`);
}

console.log(`\nIcons saved to public/icons/`);
console.log('Commit public/icons/ to your repo — these are static assets.');
