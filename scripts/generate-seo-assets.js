const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return ~c;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixel) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(rawData);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function createIco(png32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Image type: 1 = ICO
  header.writeUInt16LE(1, 4); // Number of images

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // Width
  entry.writeUInt8(32, 1); // Height
  entry.writeUInt8(0, 2);  // Palette colors (0 = no palette)
  entry.writeUInt8(0, 3);  // Reserved
  entry.writeUInt16LE(1, 4); // Color planes
  entry.writeUInt16LE(32, 6); // Bits per pixel
  entry.writeUInt32LE(png32.length, 8); // Size of image data
  entry.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

  return Buffer.concat([header, entry, png32]);
}

// Draw icon: Navy background with yellow border and bold "H X" letters
function drawIconPixel(size, x, y) {
  const normX = x / size;
  const normY = y / size;

  // Background navy: #0B1F3A
  let r = 11, g = 31, b = 58, a = 255;

  // Subtle 8-pixel grid lines
  const gridStep = size >= 128 ? 0.08 : 0.16;
  if (Math.abs(normX % gridStep) < 0.008 || Math.abs(normY % gridStep) < 0.008) {
    r = 25; g = 50; b = 80;
  }

  // Outer border & corner ticks (Yellow #FFD23F)
  const borderWidth = 2 / size;
  if (
    normX < borderWidth ||
    normX > 1 - borderWidth ||
    normY < borderWidth ||
    normY > 1 - borderWidth
  ) {
    return [255, 210, 63, 255];
  }

  // Corner brackets
  const cornerSize = 0.18;
  const isCorner =
    (normX < cornerSize && (normY < borderWidth * 3 || normY > 1 - borderWidth * 3)) ||
    (normX > 1 - cornerSize && (normY < borderWidth * 3 || normY > 1 - borderWidth * 3)) ||
    (normY < cornerSize && (normX < borderWidth * 3 || normX > 1 - borderWidth * 3)) ||
    (normY > 1 - cornerSize && (normX < borderWidth * 3 || normX > 1 - borderWidth * 3));

  if (isCorner) {
    return [255, 210, 63, 255];
  }

  // Draw Letter "H" on the left: normX in [0.22, 0.44], normY in [0.26, 0.74]
  const isH_Left = normX >= 0.22 && normX <= 0.28 && normY >= 0.26 && normY <= 0.74;
  const isH_Right = normX >= 0.38 && normX <= 0.44 && normY >= 0.26 && normY <= 0.74;
  const isH_Cross = normX >= 0.24 && normX <= 0.42 && normY >= 0.46 && normY <= 0.54;

  if (isH_Left || isH_Right || isH_Cross) {
    // Warm Off-White: #F2EFE6
    return [242, 239, 230, 255];
  }

  // Draw Letter "X" on the right: normX in [0.54, 0.78], normY in [0.26, 0.74]
  if (normX >= 0.52 && normX <= 0.80 && normY >= 0.26 && normY <= 0.74) {
    const xRel = (normX - 0.52) / (0.80 - 0.52);
    const yRel = (normY - 0.26) / (0.74 - 0.26);
    const dist1 = Math.abs(xRel - yRel);
    const dist2 = Math.abs(xRel - (1 - yRel));
    const thickness = 0.18;

    if (dist1 < thickness || dist2 < thickness) {
      // Yellow: #FFD23F
      return [255, 210, 63, 255];
    }
  }

  return [r, g, b, a];
}

// Draw OG image (1200 x 630): Technical Blueprint Banner
function drawOgPixel(x, y) {
  const normX = x / 1200;
  const normY = y / 630;

  // Background navy: #0B1F3A
  let r = 11, g = 31, b = 58, a = 255;

  // 48px graph grid lines
  if (x % 48 === 0 || y % 48 === 0) {
    r = 20; g = 44; b = 76;
  }
  // Major 240px grid line
  if (x % 240 === 0 || y % 240 === 0) {
    r = 30; g = 60; b = 98;
  }

  // Outer border & technical corner brackets (Yellow #FFD23F)
  const padX = 36 / 1200;
  const padY = 36 / 630;
  const borderThickness = 2 / 630;

  if (
    (normX >= padX && normX <= 1 - padX && (Math.abs(normY - padY) < borderThickness || Math.abs(normY - (1 - padY)) < borderThickness)) ||
    (normY >= padY && normY <= 1 - padY && (Math.abs(normX - padX) < borderThickness * 1.9 || Math.abs(normX - (1 - padX)) < borderThickness * 1.9))
  ) {
    // Dim grid border
    return [60, 90, 130, 255];
  }

  // Corner yellow brackets
  const cornerLenX = 40 / 1200;
  const cornerLenY = 40 / 630;
  const isCornerX = (normX >= padX - 0.005 && normX <= padX + cornerLenX) || (normX >= 1 - padX - cornerLenX && normX <= 1 - padX + 0.005);
  const isCornerY = (normY >= padY - 0.005 && normY <= padY + cornerLenY) || (normY >= 1 - padY - cornerLenY && normY <= 1 - padY + 0.005);

  if (
    ((Math.abs(normY - padY) < 0.006 || Math.abs(normY - (1 - padY)) < 0.006) && isCornerX) ||
    ((Math.abs(normX - padX) < 0.003 || Math.abs(normX - (1 - padX)) < 0.003) && isCornerY)
  ) {
    return [255, 210, 63, 255];
  }

  // Yellow accent bar at top
  if (normX >= 0.08 && normX <= 0.42 && normY >= 0.14 && normY <= 0.15) {
    return [255, 210, 63, 255];
  }

  // Dimension caliper horizontal line
  if (normX >= 0.08 && normX <= 0.92 && Math.abs(normY - 0.62) < 0.002) {
    return [100, 135, 175, 255];
  }
  // Dimension caliper end arrows
  if (
    (Math.abs(normX - 0.08) < 0.002 && normY >= 0.60 && normY <= 0.64) ||
    (Math.abs(normX - 0.92) < 0.002 && normY >= 0.60 && normY <= 0.64)
  ) {
    return [255, 210, 63, 255];
  }

  // Bottom stats box outline (Bento card on right)
  if (normX >= 0.64 && normX <= 0.92 && normY >= 0.24 && normY <= 0.54) {
    if (
      Math.abs(normX - 0.64) < 0.002 ||
      Math.abs(normX - 0.92) < 0.002 ||
      Math.abs(normY - 0.24) < 0.004 ||
      Math.abs(normY - 0.54) < 0.004
    ) {
      return [255, 210, 63, 255];
    }
    // Inside the card: slightly lighter navy
    r = 16; g = 40; b = 72;
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(__dirname, '../public');

console.log('Generating favicon-32x32.png...');
const png32 = createPng(32, 32, (x, y) => drawIconPixel(32, x, y));
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

console.log('Generating favicon.ico...');
const ico = createIco(png32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);

console.log('Generating apple-touch-icon.png (180x180)...');
const png180 = createPng(180, 180, (x, y) => drawIconPixel(180, x, y));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

console.log('Generating icon-192.png...');
const png192 = createPng(192, 192, (x, y) => drawIconPixel(192, x, y));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

console.log('Generating icon-512.png...');
const png512 = createPng(512, 512, (x, y) => drawIconPixel(512, x, y));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

console.log('Generating og-image.png (1200x630)...');
const ogPng = createPng(1200, 630, (x, y) => drawOgPixel(x, y));
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);

console.log('✅ All SEO visual assets generated successfully!');
