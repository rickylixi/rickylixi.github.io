const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { transform } = require('lightningcss');

const ROOT = __dirname;
const INPUT_CSS = path.join(ROOT, 'stylesheets', 'styles.css');
const CSS_DIST_DIR = path.join(ROOT, 'stylesheets', 'dist');
const LEGACY_MIN_PATH = path.join(ROOT, 'stylesheets', 'styles.min.css');
const PUBLIC_MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const DATA_DIR = path.join(ROOT, '_data');
const DATA_MANIFEST_PATH = path.join(DATA_DIR, 'asset-manifest.json');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanOldBundles(dirPath, prefix) {
  if (!fs.existsSync(dirPath)) return;
  for (const file of fs.readdirSync(dirPath)) {
    if (file.startsWith(prefix)) {
      fs.unlinkSync(path.join(dirPath, file));
    }
  }
}

function buildStyles() {
  console.log('→ 正在编译 CSS ...');
  const source = fs.readFileSync(INPUT_CSS);

  const { code } = transform({
    filename: INPUT_CSS,
    code: source,
    minify: true,
    sourceMap: false
  });

  const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 10);
  const fileName = `styles.${hash}.css`;

  ensureDir(CSS_DIST_DIR);
  cleanOldBundles(CSS_DIST_DIR, 'styles.');

  fs.writeFileSync(path.join(CSS_DIST_DIR, fileName), code);
  fs.writeFileSync(LEGACY_MIN_PATH, code);

  console.log(`✓ CSS 输出: ${fileName}`);
  return { hash, fileName };
}

function writeManifest(manifest) {
  console.log('→ 写入资源清单 ...');
  ensureDir(path.dirname(PUBLIC_MANIFEST_PATH));
  ensureDir(DATA_DIR);

  const data = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(PUBLIC_MANIFEST_PATH, data);
  fs.writeFileSync(DATA_MANIFEST_PATH, data);
}

function build() {
  console.log('开始构建网站...');
  const cssBundle = buildStyles();

  const manifest = {
    generatedAt: new Date().toISOString(),
    styles: `/stylesheets/dist/${cssBundle.fileName}`,
    hash: cssBundle.hash
  };

  writeManifest(manifest);
  console.log('构建完成！');
}

build();
