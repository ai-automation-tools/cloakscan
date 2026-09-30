// Draws the toolbar icon set into src/extension/icons/ (16, 32, 48, 128 px PNGs): the same
// teal gradient tile with a dashed inner frame as the popup's .cs-mark. Run it by hand with
// `node scripts/icons.js` after changing the design; the PNGs are committed.
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const STOPS = [
  [0, [0x1f, 0x29, 0x37]],
  [0.65, [0x0f, 0x76, 0x6e]],
  [1, [0x14, 0xb8, 0xa6]],
];

function gradient(t) {
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (t <= t1) return c0.map((v, k) => v + ((c1[k] - v) * (t - t0)) / (t1 - t0));
  }
  return STOPS.at(-1)[1];
}

// Signed distance from (x, y) to a rounded rectangle centred at (c, c).
function roundedBox(x, y, c, half, r) {
  const qx = Math.abs(x - c) - (half - r);
  const qy = Math.abs(y - c) - (half - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// One sample: [r, g, b, a] in 0..255 / 0..1 at a point inside a size x size tile.
function sample(x, y, size) {
  const c = size / 2;
  if (roundedBox(x, y, c, c, size * 0.3) > 0) return [0, 0, 0, 0];
  const color = gradient((x + y) / (2 * size));
  const half = c - size * 0.3;
  const line = Math.max(1, size / 15);
  const d = roundedBox(x, y, c, half, size * 0.2);
  if (d <= 0 && d > -line) {
    // Dash along whichever edge the point sits on; 16px gets a solid frame, dashes don't read.
    const along = Math.abs(x - c) > Math.abs(y - c) ? y : x;
    const dash = size * 0.12;
    if (size <= 16 || Math.floor(along / dash) % 2 === 0) {
      return [...color.map((v) => v + (255 - v) * 0.85), 1];
    }
  }
  return [...color, 1];
}

function crc32(buf) {
  let crc = ~0;
  for (const byte of buf) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function png(size) {
  const SS = 4; // 4x4 supersampling for smooth edges
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [sr, sg, sb, sa] = sample(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS, size);
          r += sr * sa; g += sg * sa; b += sb * sa; a += sa;
        }
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = a ? Math.round(r / a) : 0;
      raw[o + 1] = a ? Math.round(g / a) : 0;
      raw[o + 2] = a ? Math.round(b / a) : 0;
      raw[o + 3] = Math.round((a / (SS * SS)) * 255);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("src/extension/icons", { recursive: true });
for (const size of [16, 32, 48, 128]) {
  writeFileSync(`src/extension/icons/icon-${size}.png`, png(size));
}
console.log("Wrote src/extension/icons/icon-{16,32,48,128}.png");
