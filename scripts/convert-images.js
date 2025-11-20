// Batch convert images in ./image to WebP and AVIF using sharp
// Usage:
//   npm install sharp
//   node scripts/convert-images.js --src=image --out=image/optimized --formats=webp,avif

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const argv = require('minimist')(process.argv.slice(2));
const srcDir = argv.src || 'image';
const outDir = argv.out || path.join(srcDir, 'optimized');
const formats = (argv.formats || 'webp,avif').split(',').map(s => s.trim());

if (!fs.existsSync(srcDir)) {
  console.error('Source directory does not exist:', srcDir);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const exts = ['.jpg', '.jpeg', '.png', '.tif', '.tiff'];

async function convertFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.includes(ext)) return;
  const name = path.basename(file, ext);
  const input = path.join(srcDir, file);

  for (const fmt of formats) {
    const outPath = path.join(outDir, `${name}.${fmt}`);
    try {
      let pipeline = sharp(input).rotate();
      if (fmt === 'webp') pipeline = pipeline.webp({ quality: 80 });
      else if (fmt === 'avif') pipeline = pipeline.avif({ quality: 50 });
      else if (fmt === 'jpeg' || fmt === 'jpg') pipeline = pipeline.jpeg({ quality: 80 });
      else continue;
      await pipeline.toFile(outPath);
      console.log('Written', outPath);
    } catch (e) {
      console.error('Error converting', input, '->', fmt, e.message);
    }
  }
}

(async () => {
  const files = fs.readdirSync(srcDir).filter(f => !f.startsWith('.'));
  for (const f of files) {
    await convertFile(f);
  }
  console.log('Done. Optimized images are in:', outDir);
})();
