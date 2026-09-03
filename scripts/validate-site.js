const fs = require("fs");
const path = require("path");

const siteRoot = path.resolve(process.argv[2] || "_site");
if (!fs.existsSync(siteRoot)) throw new Error(`Built site directory does not exist: ${siteRoot}`);

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}

function localTarget(raw) {
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(raw)) return null;
  const pathname = raw.split(/[?#]/, 1)[0];
  if (!pathname) return null;
  const relative = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const direct = path.join(siteRoot, relative);
  if (fs.existsSync(direct)) return direct;
  return path.join(direct, "index.html");
}

walk(siteRoot);
const failures = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const label = path.relative(siteRoot, file);
  if (/^(?:google|yandex)[^/]*\.html$/i.test(label)) continue;
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) failures.push(`${label}: missing html lang`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push(`${label}: expected exactly one h1`);
  if (!/<a\b[^>]*\bclass=["'][^"']*\bskip-link\b/i.test(html)) failures.push(`${label}: missing skip link`);
  for (const button of html.matchAll(/<button\b[^>]*\bid=["']theme-toggle["'][^>]*>/gi)) {
    if (!/\baria-label=["'][^"']+["']/i.test(button[0])) failures.push(`${label}: theme toggle missing aria-label`);
  }
  for (const control of html.matchAll(/<(input|textarea|select)\b([^>]*)>/gi)) {
    const attrs = control[2];
    if (/\btype=["'](?:hidden|submit|button)["']/i.test(attrs)) continue;
    if (/\baria-label(?:ledby)?=["']/i.test(attrs)) continue;
    const id = (attrs.match(/\bid=["']([^"']+)["']/i) || [])[1];
    const labelled = id && new RegExp(`<label\\b[^>]*\\bfor=["']${id}["']`, "i").test(html);
    if (!labelled) failures.push(`${label}: form control without an associated label (${control[0].slice(0, 80)})`);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(image[0])) failures.push(`${label}: image without alt text`);
  }
  for (const link of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = link[1];
    if (/\btarget=["']_blank["']/i.test(attrs) && !/\brel=["'][^"']*\bnoopener\b/i.test(attrs)) failures.push(`${label}: target=_blank link lacks rel=noopener`);
  }
  for (const ref of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const target = localTarget(ref[1]);
    if (target && !fs.existsSync(target)) failures.push(`${label}: missing local asset ${ref[1]}`);
  }
}

const serviceWorker = path.join(siteRoot, "sw.js");
if (fs.existsSync(serviceWorker)) {
  require("child_process").execFileSync(process.execPath, ["--check", serviceWorker], { stdio: "inherit" });
}

if (failures.length) throw new Error(`Site validation failed:\n${failures.join("\n")}`);
console.log(`Validated ${htmlFiles.length} HTML files for basic accessibility and local links.`);
