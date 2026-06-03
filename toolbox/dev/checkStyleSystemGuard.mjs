import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const styleSystemPages = [
  "index.html",
  "games/index.html",
  "toolbox/index.html",
  "docs/index.html",
  "toolbox/localization/index.html"
];

const requiredThemeFiles = [
  "assets/theme-v2/css/theme.css",
  "assets/theme-v2/css/colors.css",
  "assets/theme-v2/css/spacing.css",
  "assets/theme-v2/css/typography.css",
  "assets/theme-v2/css/layout.css",
  "assets/theme-v2/css/buttons.css",
  "assets/theme-v2/css/forms.css",
  "assets/theme-v2/css/controls.css",
  "assets/theme-v2/css/panels.css",
  "assets/theme-v2/css/accordion.css",
  "assets/theme-v2/css/status.css",
  "assets/theme-v2/css/tables.css",
  "assets/theme-v2/css/dialogs.css"
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
