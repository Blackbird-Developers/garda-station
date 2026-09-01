/**
 * Responsive image variants (task #123yxuagbec).
 *
 * The source heroes are ~2400px wide, wasteful on mobile where most of this
 * traffic will be. For every hero in assets/img/ this generates:
 *   name-960.webp / name-960.jpg    (phones; <=960px viewports)
 *   name-1600.webp / name-1600.jpg  (desktop; build.js swaps by media query)
 *
 * Originals are kept untouched (og:image still uses them). texture.* is a CSS
 * tile, not a hero - skipped. Re-run after adding photography (`npm run
 * images`); build.js falls back to the original file for any missing variant,
 * so a forgotten run degrades performance, never correctness.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMG = path.join(__dirname, 'assets', 'img');
const SIZES = [960, 1600];
const SKIP = new Set(['texture']);

async function main() {
  const sources = fs.readdirSync(IMG)
    .filter((f) => f.endsWith('.jpg') && !/-\d+\.jpg$/.test(f))
    .map((f) => f.replace(/\.jpg$/, ''))
    .filter((n) => !SKIP.has(n));

  let made = 0, skipped = 0;
  for (const name of sources) {
    const src = path.join(IMG, `${name}.jpg`);
    const meta = await sharp(src).metadata();
    for (const w of SIZES) {
      const outJpg = path.join(IMG, `${name}-${w}.jpg`);
      const outWebp = path.join(IMG, `${name}-${w}.webp`);
      if (meta.width <= w) { skipped++; continue; }
      const fresh = (p) => fs.existsSync(p) && fs.statSync(p).mtimeMs >= fs.statSync(src).mtimeMs;
      if (fresh(outJpg) && fresh(outWebp)) { skipped++; continue; }
      const base = sharp(src).resize({ width: w });
      await base.clone().jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(outJpg);
      await base.clone().webp({ quality: 72 }).toFile(outWebp);
      made++;
    }
  }
  console.log(`images: ${made} variant pair(s) generated, ${skipped} up to date or not needed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
