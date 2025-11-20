Font Awesome usage audit and self-host / subset options

Summary

- Found Font Awesome classes in `/_layouts/default.html` (social links):
  - `fas fa-envelope` (solid)
  - `fab fa-github` (brands)
  - `fab fa-x-twitter` (brands)
  - `fab fa-zhihu` (brands)

Goal

- Remove dependency on the full Font Awesome delivery (CDN or full font file) by one of:
  1. Replacing these few icons with inline SVGs (recommended — simplest and smallest).
  2. Self-hosting only the needed SVGs as separate files and referencing them with `<img>` or `<svg><use>` sprite.
  3. Generating a subset webfont using `pyftsubset` (fonttools) or `fontmin` (Node) if you prefer to keep icon font usage.

Recommended approach (A) — Inline SVGs (best for a few icons)

Steps:
1. Create an `assets/icons/` directory.
2. Download the needed SVG files from the Font Awesome free repo (or export from the FA kit):
   - `envelope.svg` (solid)
   - `github.svg` (brands)
   - `x-twitter.svg` (brands) — note: the class name may vary; pick the right file in the repo
   - `zhihu.svg` (brands) — if unavailable in FA free set, consider using a custom SVG or fallback icon.

PowerShell example (run from repository root):

```powershell
# create icons dir
New-Item -ItemType Directory -Path .\assets\icons -Force

# download envelope from Font Awesome GitHub raw (example URL — update to correct tag/version)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/envelope.svg" -OutFile .\assets\icons\envelope.svg
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/brands/github.svg" -OutFile .\assets\icons\github.svg
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/brands/x-twitter.svg" -OutFile .\assets\icons\x-twitter.svg
# For zhihu you may need a custom SVG (search or draw). Save it as zhihu.svg in the same folder.
```

3. (Optional) Optimize SVGs with `svgo` (Node) or another optimizer.

```powershell
# install svgo globally or use npx
npx svgo .\assets\icons\*.svg --multipass
```

4. Replace `<i class="...">` markers with inline SVG or an `<img>` reference in `/_layouts/default.html`. Example inline SVG snippet:

```html
<a href="mailto:xieshenlixi@163.com" class="social-link" title="Email" aria-label="Send email to Xi Li">
  <img src="/assets/icons/envelope.svg" alt="Email icon" class="icon"> Email
</a>
```

Or inline the raw `<svg>` content for the smallest requests-per-resource and best control over styling:

```html
<a href="mailto:..." class="social-link">
  <!-- paste content of envelope.svg here -->
  <svg class="icon" width="16" height="16" viewBox="0 0 512 512" aria-hidden="true">...</svg>
  Email
</a>
```

5. Update CSS to style `.icon` (size, vertical alignment):

```css
.icon { width: 1em; height: 1em; vertical-align: -0.125em; fill: currentColor; }
```

Recommended approach (B) — Create an SVG sprite and use `<svg><use>`

- Combine icons into a single sprite with `svg-sprite` or `svgstore`, then reference them with `<svg><use xlink:href="#icon-github"></use></svg>`.
- This reduces requests and gives caching benefits.

Recommended approach (C) — Subset an icon webfont

- If you must keep an icon font, use `pyftsubset` (fonttools) to create a smaller TTF/WOFF2 containing only glyphs you need. Steps:

```powershell
# Install python tools (one-time):
python -m pip install fonttools

# Example: subset font.ttf to only glyphs used (you need the unicode points or glyph names):
pyftsubset fontawesome-webfont.ttf --output-file=fontawesome-subset.woff2 --flavor=woff2 --glyphs="uniE001,uniE002"
```

Notes & Caveats

- If Font Awesome icons are loaded via a kit (JS/CSS) from a CDN, removing the `<link>` or kit is necessary after replacing icons.
- Some brand icons (e.g., Zhihu) may not be available in Font Awesome free set; you might need to add custom SVGs.
- Inline SVGs adopt `currentColor` when using `fill: currentColor`, so they inherit text color and are easy to style with CSS.

Next steps I can take for you

- Option 1: Create `assets/icons/`, fetch/optimize the 3–4 needed SVGs, and prepare a patch that replaces the `<i>` elements in `/_layouts/default.html` with `<img>` or inline SVG (non-breaking change). (I will stage changes as small, reviewable patches.)
- Option 2: Produce a script & patch to build an SVG sprite and update layout to reference it.
- Option 3: Produce instructions only (you run them locally) and I will not change files.

Which option do you prefer? Reply with `1`, `2`, or `3` and I will proceed.