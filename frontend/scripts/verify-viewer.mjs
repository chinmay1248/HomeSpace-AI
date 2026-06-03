import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { chromium, devices } from 'playwright';

const appUrl = process.env.METANEST_APP_URL ?? 'http://127.0.0.1:5173';
const outputDir = new URL('../../docs/verification/', import.meta.url);

const viewports = [
  { name: 'desktop', viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 },
  { name: 'mobile', ...devices['Pixel 5'] },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const config of viewports) {
  const context = await browser.newContext(config);
  const page = await context.newPage();
  await page.goto(appUrl, { waitUntil: 'networkidle' });
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ timeout: 15000 });
  await page.screenshot({ path: fileURLToPath(new URL(`${config.name}.png`, outputDir)), fullPage: true });
  const canvasPng = await canvas.screenshot({ path: fileURLToPath(new URL(`${config.name}-canvas.png`, outputDir)) });
  const pixelStats = analyzePng(canvasPng);

  results.push({ viewport: config.name, ...pixelStats });
  await context.close();
}

await browser.close();

const failed = results.filter((result) => !result.ok);
console.table(results);
if (failed.length) {
  throw new Error(`Canvas verification failed: ${JSON.stringify(failed)}`);
}

function analyzePng(buffer) {
  const png = parsePng(buffer);
  const colors = new Set();
  let brightPixels = 0;
  for (let index = 0; index < png.pixels.length; index += png.channels) {
    const red = png.pixels[index];
    const green = png.pixels[index + 1];
    const blue = png.pixels[index + 2];
    colors.add(`${red},${green},${blue}`);
    if (red + green + blue > 90) brightPixels += 1;
  }
  return {
    ok: colors.size > 12 && brightPixels > png.width * png.height * 0.02,
    reason: null,
    nonEmptyPixels: brightPixels,
    uniqueColors: colors.size,
  };
}

function parsePng(buffer) {
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error('Invalid PNG signature.');

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const chunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    }
    if (type === 'IDAT') chunks.push(data);
    offset += length + 12;
  }

  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`Unsupported PNG color type: ${colorType}`);

  const inflated = inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * channels);
  let source = 0;
  let target = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[source];
    source += 1;
    const row = Buffer.from(inflated.subarray(source, source + stride));
    source += stride;
    unfilter(row, previous, channels, filter);
    row.copy(pixels, target);
    target += stride;
    previous = row;
  }

  return { width, height, channels, pixels };
}

function unfilter(row, previous, bpp, filter) {
  for (let index = 0; index < row.length; index += 1) {
    const left = index >= bpp ? row[index - bpp] : 0;
    const up = previous[index] ?? 0;
    const upLeft = index >= bpp ? previous[index - bpp] : 0;
    if (filter === 1) row[index] = (row[index] + left) & 255;
    if (filter === 2) row[index] = (row[index] + up) & 255;
    if (filter === 3) row[index] = (row[index] + Math.floor((left + up) / 2)) & 255;
    if (filter === 4) row[index] = (row[index] + paeth(left, up, upLeft)) & 255;
  }
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const distanceLeft = Math.abs(estimate - left);
  const distanceUp = Math.abs(estimate - up);
  const distanceUpLeft = Math.abs(estimate - upLeft);
  if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) return left;
  if (distanceUp <= distanceUpLeft) return up;
  return upLeft;
}
