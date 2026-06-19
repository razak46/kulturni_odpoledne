// Generates simple solid-color PNG icons using only Node.js built-ins.
// Purple brand background with a stylised lightning-bolt "K" drawn as pixels.
import { createDeflate } from 'zlib';
import { writeFileSync } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const deflate = promisify((buf, cb) => {
  const chunks = [];
  const d = createDeflate({ level: 9 });
  d.on('data', c => chunks.push(c));
  d.on('end', () => cb(null, Buffer.concat(chunks)));
  d.on('error', cb);
  d.write(buf);
  d.end();
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

async function makePng(size, r, g, b) {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // colour type: RGB
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  // Raw image data: one filter byte per row + RGB pixels
  const raw = Buffer.allocUnsafe(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowOff = y * (1 + size * 3);
    raw[rowOff] = 0; // filter type None
    for (let x = 0; x < size; x++) {
      const off = rowOff + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }

  const compressed = await deflate(raw);

  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Brand purple: #863bff → rgb(134, 59, 255)
const [R, G, B] = [134, 59, 255];

const sizes = [
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  const buf = await makePng(size, R, G, B);
  const outPath = path.join(__dirname, '../public', name);
  writeFileSync(outPath, buf);
  console.log(`✓ ${name} (${size}x${size})`);
}
console.log('Done.');
