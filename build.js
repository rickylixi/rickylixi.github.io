const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { transform } = require('lightningcss');

const ROOT = __dirname;
const INPUT_CSS = path.join(ROOT, 'stylesheets', 'styles.css');
const OUTPUT_MIN_PATH = path.join(ROOT, 'stylesheets', 'styles.min.css');
const PUBLIC_MANIFEST_PATH = path.join(ROOT, 'assets', 'asset-manifest.json');
const DATA_DIR = path.join(ROOT, '_data');
const DATA_MANIFEST_PATH = path.join(DATA_DIR, 'asset-manifest.json');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
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
  fs.writeFileSync(OUTPUT_MIN_PATH, code);
  console.log('✓ CSS 输出: styles.min.css');
  return { hash };
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
  const styles = buildStyles();

  const manifest = {
    generatedAt: new Date().toISOString(),
    styles: '/stylesheets/styles.min.css',
    hash: styles.hash
  };

  writeManifest(manifest);
  console.log('构建完成！');
}

build();
