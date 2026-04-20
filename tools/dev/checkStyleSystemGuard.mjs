import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const styleSystemPages = [
  "index.html",
  "samples/index.html",
  "games/index.html",
  "tools/index.html",
  "tools/State Inspector/index.html",
  "tools/Performance Profiler/index.html",
  "tools/Replay Visualizer/index.html",
  "tools/Physics Sandbox/index.html"
];

const requiredThemeFiles = [
  "src/engine/theme/main.css",
  "src/engine/theme/tokens.css",
  "src/engine/theme/layout.css",
  "src/engine/theme/header.css",
  "src/engine/theme/nav.css",
  "src/engine/theme/pages.css",
  "src/engine/theme/accordion.css",
  "src/engine/theme/tool-shell.css",
  "src/engine/theme/tools.css",
  "src/engine/theme/games.css",
  "src/engine/theme/samples.css"
];

function readUtf8(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const failures = [];

for (const file of requiredThemeFiles) {
  if (!fs.existsSync(path.join(repoRoot, file))) {
    failures.push(`missing-theme-file:${file}`);
  }
}

for (const page of styleSystemPages) {
  const fullPath = path.join(repoRoot, page);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing-page:${page}`);
    continue;
  }
  const content = readUtf8(page);
  if (/<style[\s>]/i.test(content)) {
    failures.push(`embedded-style-block:${page}`);
  }
  if (/style\s*=\s*"/i.test(content)) {
    failures.push(`inline-style-attr:${page}`);
  }
}

if (failures.length > 0) {
  console.error("STYLE_SYSTEM_GUARD_FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("STYLE_SYSTEM_GUARD_PASSED");
console.log(`- pages_checked=${styleSystemPages.length}`);
console.log(`- required_theme_files=${requiredThemeFiles.length}`);
