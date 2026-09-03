const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const ignored = new Set(["node_modules", "_site", ".git", ".jekyll-cache"]);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walk(path.join(dir, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".js") && entry.name !== "sw.js") {
      files.push(path.join(dir, entry.name));
    }
  }
}

walk(root);
for (const file of files) execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
console.log(`Validated JavaScript syntax in ${files.length} files.`);
