import fs from "node:fs/promises";
import path from "node:path";

const SCAN_ROOTS = ["src", "games", "samples", "tools"];
const ALLOWED_EXTENSIONS = new Set([".js", ".mjs"]);
const IGNORED_DIRS = new Set(["node_modules", ".git", "tmp"]);

const LOCAL_HELPER_RULES = [
  { rule: "local-helper-definition", regex: /function\s+asFiniteNumber\s*\(/g, label: "rule:helper-fn-asFiniteNumber" },
  { rule: "local-helper-definition", regex: /function\s+asPositiveInteger\s*\(/g, label: "rule:helper-fn-asPositiveInteger" },
  { rule: "local-helper-definition", regex: /function\s+isPlainObject\s*\(/g, label: "rule:helper-fn-isPlainObject" },
  { rule: "local-helper-definition", regex: /const\s+asFiniteNumber\s*=/g, label: "rule:helper-const-asFiniteNumber" },
  { rule: "local-helper-definition", regex: /const\s+asPositiveInteger\s*=/g, label: "rule:helper-const-asPositiveInteger" },
  { rule: "local-helper-definition", regex: /const\s+isPlainObject\s*=/g, label: "rule:helper-const-isPlainObject" }
];

const DIRECT_SHARED_IMPORT_RULES = [
  { rule: "direct-shared-relative-import", regex: /\.\.\/shared\//g, label: "rule:relative-shared-depth-1" },
  { rule: "direct-shared-relative-import", regex: /\.\.\/\.\.\/shared\//g, label: "rule:relative-shared-depth-2" },
  { rule: "direct-shared-relative-import", regex: /\.\.\/\.\.\/\.\.\/src\/shared\//g, label: "rule:relative-shared-src-depth-3" },
  { rule: "direct-shared-relative-import", regex: /\.\.\/\.\.\/\.\.\/\.\.\/shared\//g, label: "rule:relative-shared-depth-4" }
];

const ALIAS_RULE = { rule: "shared-alias-import-disallowed", regex: /@shared\//g, label: "rule:shared-alias-marker" };

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectSourceFiles(startDir, outFiles) {
  const entries = await fs.readdir(startDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      await collectSourceFiles(entryPath, outFiles);
      continue;
    }

    if (!entry.isFile()) continue;
    if (entry.name.toLowerCase().endsWith(".zip")) continue;

    const ext = path.extname(entry.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    outFiles.push(entryPath);
  }
}

function findViolations(fileContent, filePathFromRoot) {
  const violations = [];

  for (const check of LOCAL_HELPER_RULES) {
    const matches = fileContent.match(check.regex) || [];
    for (const _match of matches) {
      violations.push({
        file: filePathFromRoot,
        type: check.rule,
        match: check.label
      });
    }
  }

  for (const check of DIRECT_SHARED_IMPORT_RULES) {
    const matches = fileContent.match(check.regex) || [];
    for (const _match of matches) {
      violations.push({
        file: filePathFromRoot,
        type: check.rule,
        match: check.label
      });
    }
  }

  const aliasMatches = fileContent.match(ALIAS_RULE.regex) || [];
  for (const _match of aliasMatches) {
    violations.push({
      file: filePathFromRoot,
      type: ALIAS_RULE.rule,
      match: ALIAS_RULE.label
    });
  }

  return violations;
}

async function run() {
  const repoRoot = process.cwd();
  const filesToScan = [];

  for (const root of SCAN_ROOTS) {
    const rootPath = path.join(repoRoot, root);
    if (!(await pathExists(rootPath))) continue;
    await collectSourceFiles(rootPath, filesToScan);
  }

  const violations = [];
  for (const filePath of filesToScan) {
    const content = await fs.readFile(filePath, "utf8");
    const relPath = path.relative(repoRoot, filePath).replaceAll("\\", "/");
    violations.push(...findViolations(content, relPath));
  }

  if (violations.length === 0) {
    console.log("Shared extraction guard passed. No violations found.");
    process.exit(0);
  }

  console.error(`Shared extraction guard failed with ${violations.length} violation(s).`);
  for (const violation of violations) {
    console.error(
      `${violation.file} | ${violation.type} | ${violation.match}`
    );
  }
  process.exit(1);
}

run().catch((error) => {
  console.error("Shared extraction guard encountered an unexpected error.");
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
