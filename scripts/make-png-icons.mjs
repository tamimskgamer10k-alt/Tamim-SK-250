import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // truecolor (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data: height rows, each row begins with 0 filter byte, followed by width * 3 bytes (RGB)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Generate stylized dark charcoal background with red central symbol
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      
      // Outer border / circle
      if (dist < width * 0.42 && dist > width * 0.38) {
        rawData[pixelOffset] = 229;     // R
        rawData[pixelOffset + 1] = 9;   // G
        rawData[pixelOffset + 2] = 20;  // B
      } else if (dist <= width * 0.38) {
        // Center area (ruby red gradient)
        const t = Math.max(0, 1 - dist / (width * 0.38));
        rawData[pixelOffset] = Math.min(255, Math.floor(229 * t + 180 * (1 - t)));
        rawData[pixelOffset + 1] = Math.floor(9 * t + 10 * (1 - t));
        rawData[pixelOffset + 2] = Math.floor(20 * t + 25 * (1 - t));
      } else {
        // Dark charcoal background (#0B0C10)
        rawData[pixelOffset] = 11;
        rawData[pixelOffset + 1] = 12;
        rawData[pixelOffset + 2] = 16;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('/public')) {
  fs.mkdirSync('/public', { recursive: true });
}

fs.writeFileSync('/public/pwa-192x192.png', createPng(192, 192, 229, 9, 20));
fs.writeFileSync('/public/pwa-512x512.png', createPng(512, 512, 229, 9, 20));
fs.writeFileSync('/public/pwa-maskable-512x512.png', createPng(512, 512, 229, 9, 20));
fs.writeFileSync('/public/apple-touch-icon.png', createPng(180, 180, 229, 9, 20));
console.log('Successfully generated all PWA PNG icon assets!');
