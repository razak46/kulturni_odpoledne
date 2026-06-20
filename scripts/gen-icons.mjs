import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../public/kasirka-logo.webp');

const sizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 248, g: 244, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, '../public', name));
  console.log(`✓ ${name} (${size}x${size})`);
}
console.log('Done.');
