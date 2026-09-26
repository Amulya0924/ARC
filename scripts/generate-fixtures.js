const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PNG } = require('pngjs');

const FIXTURES_DIR = path.join(process.cwd(), 'fixtures');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function lcg(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generateNoisyPng(width, height, seed) {
  const png = new PNG({ width, height });
  const rand = lcg(seed);

  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = Math.floor(rand() * 256);     // Red
    png.data[i + 1] = Math.floor(rand() * 256); // Green
    png.data[i + 2] = Math.floor(rand() * 256); // Blue
    png.data[i + 3] = 255;                      // Alpha
  }

  return PNG.sync.write(png);
}

function main() {
  ensureDir(FIXTURES_DIR);

  console.log('Generating small high-detail PNG (< 2 MiB)...');
  // 600x600 pixels -> ~1.44 MB raw
  const smallBuffer = generateNoisyPng(600, 600, 12345);
  const smallSize = smallBuffer.length;
  const smallSha256 = crypto.createHash('sha256').update(smallBuffer).digest('hex');

  if (smallSize >= 2 * 1024 * 1024) {
    throw new Error(`small-detailed.png size (${smallSize}) is not under 2 MiB`);
  }

  const smallPath = path.join(FIXTURES_DIR, 'small-detailed.png');
  fs.writeFileSync(smallPath, smallBuffer);
  console.log(`Saved small-detailed.png: ${smallSize} bytes, SHA256: ${smallSha256}`);

  console.log('Generating large noisy PNG (> 8 MiB)...');
  // 2000x1800 pixels -> guarantees compressed PNG > 8 MiB
  const largeBuffer = generateNoisyPng(2000, 1800, 54321);
  const largeSize = largeBuffer.length;
  const largeSha256 = crypto.createHash('sha256').update(largeBuffer).digest('hex');

  if (largeSize <= 8 * 1024 * 1024) {
    throw new Error(`large-noisy.png size (${largeSize}) is not over 8 MiB`);
  }

  const largePath = path.join(FIXTURES_DIR, 'large-noisy.png');
  fs.writeFileSync(largePath, largeBuffer);
  console.log(`Saved large-noisy.png: ${largeSize} bytes, SHA256: ${largeSha256}`);

  const manifest = {
    generatedAt: new Date().toISOString(),
    fixtures: [
      {
        filename: 'small-detailed.png',
        size: smallSize,
        dimensions: { width: 600, height: 600 },
        mimeType: 'image/png',
        sha256: smallSha256
      },
      {
        filename: 'large-noisy.png',
        size: largeSize,
        dimensions: { width: 2000, height: 1800 },
        mimeType: 'image/png',
        sha256: largeSha256
      }
    ]
  };

  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Saved manifest.json at ${manifestPath}`);
}

main();
