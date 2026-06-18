import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const roots = [
  "account",
  "admin",
  "assets",
  "company",
  "community",
  "games",
  "legal",
  "marketplace",
  "memberships",
  "owner",
  "src/api",
  "src/engine",
  "toolbox",
];
const filePattern = /\.(html|js|mjs)$/;
const forbiddenPatterns = [
  /src\/dev-runtime/,
  /src\\dev-runtime/,
  /from\s+["'][^"']*\.\.\/dev-runtime\//,
  /import\(["'][^"']*\.\.\/dev-runtime\//,
];
const findings = [];

function walk(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return filePattern.test(entry.name) ? [fullPath] : [];
  });
}

for (const root of roots) {
  for (const filePath of walk(path.join(repoRoot, root))) {
    const source = fs.readFileSync(filePath, "utf8");
    if (forbiddenPatterns.some((pattern) => pattern.test(source))) {
      findings.push(path.relative(repoRoot, filePath).replaceAll("\\", "/"));
    }
  }
}

if (findings.length) {
  console.error("FAIL: UAT/PROD-facing files import or reference src/dev-runtime:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("PASS: UAT/PROD-facing browser/runtime files do not import or bundle src/dev-runtime.");
