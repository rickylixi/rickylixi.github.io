// Batch convert images in ./image to WebP and AVIF using sharp.
//
// Improvements over a naive converter:
//   1. Never writes an output that is LARGER than the source image — a
//      "optimized" file that is bigger than the original is pure waste
//      (browsers pick it via <picture> even when the original is smaller).
//   2. Removes stale outputs that are larger than their source (e.g. from
//      earlier runs before this check existed).
//   3. Optional --max-width to downscale sources before encoding (0 = off).
//
// Usage:
//   npm install sharp
//   node scripts/convert-images.js --src=image --out=image/optimized --formats=webp,avif [--max-width=1640]

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const argv = require("minimist")(process.argv.slice(2));
const srcDir = argv.src || "image";
const outDir = argv.out || path.join(srcDir, "optimized");
const formats = (argv.formats || "webp,avif").split(",").map((s) => s.trim());
const maxWidth = Number(argv["max-width"] || 0);

if (!fs.existsSync(srcDir)) {
  console.error("Source directory does not exist:", srcDir);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const exts = [".jpg", ".jpeg", ".png", ".tif", ".tiff"];

async function convertFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.includes(ext)) return;
  const name = path.basename(file, ext);
  const input = path.join(srcDir, file);
  const sourceSize = fs.statSync(input).size;

  let pipeline = sharp(input).rotate();
  if (maxWidth > 0) pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });

  for (const fmt of formats) {
    const outPath = path.join(outDir, `${name}.${fmt}`);
    try {
      let encoded;
      if (fmt === "webp") encoded = pipeline.clone().webp({ quality: 80 });
      else if (fmt === "avif") encoded = pipeline.clone().avif({ quality: 50 });
      else if (fmt === "jpeg" || fmt === "jpg") encoded = pipeline.clone().jpeg({ quality: 80 });
      else continue;

      const { data, info } = await encoded.toBuffer({ resolveWithObject: true });

      if (info.size >= sourceSize) {
        // Converted file would be no smaller than the source — drop any stale
        // output so browsers fall back to the (smaller) original instead.
        if (fs.existsSync(outPath)) {
          fs.unlinkSync(outPath);
          console.log(
            `Removed ${outPath} (${fmt} not smaller than source ${input})`
          );
        } else {
          console.log(`Skipped ${fmt} for ${input}: no smaller than source`);
        }
        continue;
      }

      fs.writeFileSync(outPath, data);
      console.log(
        `Written ${outPath} (${(info.size / 1024).toFixed(0)} KB vs source ${(sourceSize / 1024).toFixed(0)} KB)`
      );
    } catch (e) {
      console.error("Error converting", input, "->", fmt, e.message);
    }
  }
}

(async () => {
  const files = fs.readdirSync(srcDir).filter((f) => !f.startsWith("."));
  for (const f of files) {
    await convertFile(f);
  }
  console.log("Done. Optimized images are in:", outDir);
})();
