import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// ── CRC32 ─────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const l = Buffer.allocUnsafe(4); l.writeUInt32BE(data.length);
  const cr = Buffer.allocUnsafe(4);
  cr.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, cr]);
}

// ── PNG writer ─────────────────────────────────────────────────────────────
function makePNG(size, getPixel) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const stride = 1 + size * 3;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = getPixel(x / size, y / size);
      raw[y * stride + 1 + x * 3] = r;
      raw[y * stride + 2 + x * 3] = g;
      raw[y * stride + 3 + x * 3] = b;
    }
  }
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Point-in-polygon (ray casting) ────────────────────────────────────────
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ── Lightning bolt polygon (normalised 0..1) ───────────────────────────────
// Mimics the Lucide Zap icon shape
const bolt = [
  [0.62, 0.07],
  [0.36, 0.53],
  [0.55, 0.53],
  [0.38, 0.93],
  [0.64, 0.47],
  [0.45, 0.47],
];

// ── Pixel renderer ────────────────────────────────────────────────────────
const BG  = [0x1e, 0x39, 0x32]; // #1E3932 — sb-house
const FG  = [0xff, 0xff, 0xff]; // white bolt

function getPixel(nx, ny) {
  return pointInPoly(nx, ny, bolt) ? FG : BG;
}

// ── Generate files ────────────────────────────────────────────────────────
for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), makePNG(size, getPixel));
  console.log(`✓ icon-${size}.png`);
}

// apple-touch-icon: same as 192
writeFileSync(join(outDir, 'apple-touch-icon.png'), makePNG(192, getPixel));
console.log('✓ apple-touch-icon.png');

// maskable icon: bolt centred in a larger safe zone (bolt occupies ~60% of canvas)
const boltMaskable = bolt.map(([x, y]) => [x * 0.6 + 0.2, y * 0.6 + 0.2]);
writeFileSync(join(outDir, 'icon-maskable-192.png'), makePNG(192, (nx, ny) =>
  pointInPoly(nx, ny, boltMaskable) ? FG : BG));
console.log('✓ icon-maskable-192.png');
