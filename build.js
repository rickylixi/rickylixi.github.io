const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { transform } = require("lightningcss");
const { PurgeCSS } = require("purgecss");

const ROOT = __dirname;
const INPUT_CSS = path.join(ROOT, "stylesheets", "styles.css");
const OUTPUT_MIN_PATH = path.join(ROOT, "stylesheets", "styles.min.css");
const PUBLIC_MANIFEST_PATH = path.join(ROOT, "assets", "asset-manifest.json");
const DATA_DIR = path.join(ROOT, "_data");
const DATA_MANIFEST_PATH = path.join(DATA_DIR, "asset-manifest.json");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Directories that must never be walked when collecting PurgeCSS content:
// dependency trees (deep paths can throw), binary assets, and build output.
const PURGE_SKIP_DIRS = new Set([
  "node_modules",
  "supabase",
  "image",
  "research",
  "teaching",
  "_site",
]);

// Walk the repo collecting every .html/.js file that may reference classes.
// Per-entry error handling: one unreadable file must never void the whole
// content list (an empty list makes PurgeCSS strip the entire stylesheet).
function collectContentFiles(rootDir) {
  const files = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      console.warn(`  ⚠ 无法读取目录（已跳过）: ${dir} (${e.message})`);
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.name.startsWith(".")) continue; // .git, .jekyll-cache, ...
      if (entry.isDirectory()) {
        if (PURGE_SKIP_DIRS.has(entry.name)) continue;
        stack.push(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!/\.(html|js|md)$/i.test(entry.name)) continue;
      files.push(full);
    }
  }
  return files;
}

// Selectors whose removal would visibly break the site. PurgeCSS output is
// verified against this list so a broken content scan fails the build loudly
// instead of silently shipping a skeletal stylesheet.
const ESSENTIAL_SELECTORS = [
  ".wrapper",
  ".social-row",
  ".skip-link",
  ".accordion",
  ".gb-form",
  // Added after the first five proved too narrow: a broken content scan could
  // silently drop these core classes without tripping the safety net.
  ".site-title",
  ".breadcrumb",
  ".publication-entry",
  ".responsive-img",
];
// NOTE: every entry above must exist in stylesheets/styles.css — this check
// catches a broken content scan, not a missing rule. Do NOT add classes that
// appear only in markup (e.g. .post-title), or the build fails every time.

// Browser targets for the CSS minifier. lightningcss defaults to "latest
// everything" and emits modern range syntax (@media (width<=700px)), which
// Safari < 16.4 (i.e. iOS 16.3 and older) does not understand — every
// responsive rule is silently dropped there. Pinning conservative targets
// keeps the classic max-width syntax. Verified cost: ~120 bytes.
// Encoding is (major << 16) | (minor << 8) | patch.
const CSS_TARGETS = {
  safari: (15 << 16) | (6 << 8), // Safari 15.6
  chrome: (109 << 16),
  firefox: (110 << 16),
  edge: (109 << 16),
};

async function purgeUnusedCSS(css) {
  console.log("  → 正在清理未使用的 CSS ...");

  const content = collectContentFiles(ROOT);
  if (content.length < 5) {
    throw new Error(
      `PurgeCSS content scan found only ${content.length} files — refusing to purge (would destroy the stylesheet).`
    );
  }
  console.log(`  ✓ 扫描到 ${content.length} 个内容文件`);

  const purgeResults = await new PurgeCSS().purge({
    content: content,
    css: [{ raw: css.toString() }],
    defaultExtractor: content => {
      // Match class names, IDs, and data attributes
      const matches = content.match(/[A-Za-z0-9_\-:\/]+/g) || [];
      return matches;
    },
    safelist: {
      standard: [
        // Theme-related classes
        /^data-theme/,
        /^theme-/,
        // Syntax highlighting classes
        /^highlight/,
        /^language-/,
        // Navigation states
        /^active$/,
        /^current$/,
        // Accessibility
        /^sr-only/,
        /^aria-/,
        // Common utilities
        /^visually-hidden/,
        /^show$/,
        /^hide$/,
        /^loading$/,
        // Math/TikZ related
        /^MathJax/,
        /^tikz/,
        // Visitor counter
        /^visitor-/,
        // Blog figures & annotated elements
        /^annotated-line/,
        /^marker/,
      ],
      deep: [],
      greedy: [
        // Keep all dark mode variations
        /:dark/,
        // Keep hover, focus, active states
        /:hover/,
        /:focus/,
        /:active/,
        // Keep responsive breakpoints
        /sm:/,
        /md:/,
        /lg:/,
        // Keep data attribute selectors
        /\[data-/,
      ],
    },
  });

  const purgedCSS = purgeResults[0].css;

  // PurgeCSS's `fontFace` option only keeps @font-face blocks whose
  // font-family appears in a KEPT font-family declaration. Our pages use
  // font-family via var(--font-sans), so the self-hosted Inter faces would
  // be dropped. Re-insert them from the source instead.
  const fontFaceBlocks = (css.toString().match(/@font-face\s*\{[^}]*\}/g) || []).join("\n");
  const finalCSS = fontFaceBlocks ? fontFaceBlocks + "\n" + purgedCSS : purgedCSS;

  // Safety net: a purged stylesheet missing core layout selectors means the
  // content scan failed. Fail loudly instead of deploying a broken page.
  const missing = ESSENTIAL_SELECTORS.filter(sel => !finalCSS.includes(sel));
  if (missing.length) {
    throw new Error(
      `PurgeCSS removed essential selectors: ${missing.join(", ")} — aborting build.`
    );
  }
  console.log(`  ✓ PurgeCSS 完成: 移除了未使用的样式（关键选择器校验通过）`);
  return finalCSS;
}

async function buildStyles() {
  console.log("→ 正在编译 CSS ...");
  const source = fs.readFileSync(INPUT_CSS);

  // Apply PurgeCSS to remove unused styles
  const purgedCSS = await purgeUnusedCSS(source);

  const { code } = transform({
    filename: INPUT_CSS,
    code: Buffer.from(purgedCSS),
    minify: true,
    sourceMap: false,
    targets: CSS_TARGETS,
  });

  const hash = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex")
    .slice(0, 10);
  fs.writeFileSync(OUTPUT_MIN_PATH, code);
  console.log("✓ CSS 输出: styles.min.css");
  return { hash };
}

function writeManifest(manifest) {
  console.log("→ 写入资源清单 ...");
  ensureDir(path.dirname(PUBLIC_MANIFEST_PATH));
  ensureDir(DATA_DIR);

  const data = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(PUBLIC_MANIFEST_PATH, data);
  fs.writeFileSync(DATA_MANIFEST_PATH, data);
}

async function build() {
  console.log("开始构建网站...");
  const styles = await buildStyles();

  // Generate a combined hash for CSS and core JS files to ensure proper cache
  // invalidation in the Service Worker even if only JS/HTML changes.
  const hashObj = crypto.createHash("sha256");
  hashObj.update(styles.hash);
  
  const filesToHash = [
    path.join(ROOT, "assets", "js", "visitor-counter.js"),
    path.join(ROOT, "assets", "js", "theme.js"),
    path.join(ROOT, "javascripts", "accordion.js"),
    path.join(ROOT, "sw.js")
  ];
  
  filesToHash.forEach(file => {
    if (fs.existsSync(file)) {
      hashObj.update(fs.readFileSync(file));
    }
  });
  
  const finalHash = hashObj.digest("hex").slice(0, 10);

  const manifest = {
    styles: "/stylesheets/styles.min.css",
    hash: finalHash,
  };

  writeManifest(manifest);
  console.log("构建完成！");
}

build().catch(error => {
  console.error("构建失败:", error);
  process.exit(1);
});
