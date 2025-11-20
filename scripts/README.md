Convert images to modern formats (WebP/AVIF)

This helper script uses `sharp` to convert raster images in the `image/` folder
into WebP and AVIF images and writes them to `image/optimized` by default.

Install and run locally:

```powershell
# from repo root
npm init -y
npm install sharp minimist
node scripts/convert-images.js --src=image --out=image/optimized --formats=webp,avif
```

Notes:
- AVIF gives better compression but slower conversion; tune `quality` in the script.
- The script does not modify HTML files. After conversion, update image tags to use `<picture>` with WebP/AVIF sources and a fallback `img` pointing to the original.

Example `<picture>` snippet to replace an `<img>`:

```html
<picture>
  <source type="image/avif" srcset="/image/optimized/fourier-transform.avif">
  <source type="image/webp" srcset="/image/optimized/fourier-transform.webp">
  <img src="/image/fourier-transform.png" alt="Fourier Transform" class="responsive-img" loading="lazy">
</picture>
```

If you want, I can prepare automated PR-like patches to replace specific `<img>` tags with `<picture>` blocks for a few representative pages; tell me which pages you want converted automatically.