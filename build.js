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

async function purgeUnusedCSS(css) {
  console.log("  → 正在清理未使用的 CSS ...");

  // Define content sources for PurgeCSS
  const content = [
    path.join(ROOT, "_layouts", "**", "*.html"),
    path.join(ROOT, "_includes", "**", "*.html"),
    path.join(ROOT, "*.html"),
    path.join(ROOT, "blog", "**", "*.html"),
    path.join(ROOT, "assets", "js", "**", "*.js"),
    path.join(ROOT, "javascripts", "**", "*.js"),
  ]
    .filter(p => fs.existsSync(p) || fs.existsSync(path.dirname(p)))
    .flatMap(pattern => {
      try {
        if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
          return [pattern];
        }
        const dir = path.dirname(pattern);
        const basename = path.basename(pattern);
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir, { recursive: true })
          .map(f => path.join(dir, f))
          .filter(f => f.endsWith('.html') || f.endsWith('.js'));
      } catch {
        return [];
      }
    });

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
  console.log(`  ✓ PurgeCSS 完成: 移除了未使用的样式`);
  return purgedCSS;
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
    generatedAt: new Date().toISOString(),
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
