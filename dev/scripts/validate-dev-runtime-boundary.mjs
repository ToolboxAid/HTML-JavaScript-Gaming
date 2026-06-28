import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const roots = [
  "www/account",
  "www/admin",
  "www/assets",
  "www/company",
  "www/community",
  "www/games",
  "www/legal",
  "www/marketplace",
  "www/memberships",
  "www/owner",
  "src/api",
  "src/engine",
  "www/toolbox",
];
const filePattern = /\.(html|js|mjs)$/;
const forbiddenPatterns = [
  /src\/dev-runtime/,
  /src\\dev-runtime/,
  /from\s+["'][^"']*(?:\.\.?\/)+api\//,
  /import\(["'][^"']*(?:\.\.?\/)+api\//,
  /from\s+["'][^"']*\.\.\/dev-runtime\//,
  /import\(["'][^"']*\.\.\/dev-runtime\//,
];
const allowedFindings = new Set([
  "www/owner/notes.html",
]);
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
    const relativeFilePath = path.relative(repoRoot, filePath).replaceAll("\\", "/");
    if (forbiddenPatterns.some((pattern) => pattern.test(source)) && !allowedFindings.has(relativeFilePath)) {
      findings.push(relativeFilePath);
    }
  }
}

if (findings.length) {
  console.error("FAIL: UAT/PROD-facing files import or reference local API runtime implementation:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("PASS: UAT/PROD-facing browser/runtime files do not import or bundle local API runtime implementation.");
