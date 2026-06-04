import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceExtensions = new Set([".js", ".mjs"]);
const passThroughScanRoots = ["src", "archive/v1-v2/samples/shared", "toolbox"];
const importScanRoots = ["src", "archive/v1-v2/samples", "toolbox", "tests"];
const ignoredDirNames = new Set(["node_modules", ".git", "tmp"]);
const ignoredPathPrefixes = [
  "archive/v1-v2/docs_build/archive/",
  "docs_build/dev/reports/",
  "tmp/test-results/"
];
const baselineRelativePath = "docs_build/dev/toolbox/checkInternalBarrelGuard.baseline.json";

function shouldIgnoreDirectory(directoryName) {
  return ignoredDirNames.has(directoryName)
    || directoryName.startsWith("old_")
    || directoryName === "SpriteEditor_old_keep";
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function isIgnoredPath(relativePath) {
  return ignoredPathPrefixes.some((prefix) => relativePath.startsWith(prefix));
}

function collectSourceFiles(startPath, outFiles) {
  if (!fs.existsSync(startPath)) return;
  const entries = fs.readdirSync(startPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(startPath, entry.name);
    const relativePath = toPosix(path.relative(repoRoot, fullPath));
    if (entry.isDirectory()) {
      if (shouldIgnoreDirectory(entry.name)) continue;
      if (isIgnoredPath(`${relativePath}/`)) continue;
      collectSourceFiles(fullPath, outFiles);
      continue;
    }

    if (!entry.isFile()) continue;
    if (isIgnoredPath(relativePath)) continue;
    if (entry.name.toLowerCase().endsWith(".min.js")) continue;
    if (!sourceExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    outFiles.add(fullPath);
  }
}

function collectFiles(roots) {
  const files = new Set();
  for (const root of roots) {
    collectSourceFiles(path.join(repoRoot, root), files);
  }
  return [...files].sort((left, right) => left.localeCompare(right));
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

function normalizeStatement(statement) {
  return statement
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectImportExportStatements(source) {
  const statements = [];
  const lines = source.split(/\r?\n/);
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!current && /^\s*(?:import|export)\b/.test(line)) {
      current = {
        startLine: index + 1,
        chunks: [line]
      };
    } else if (current) {
      current.chunks.push(line);
    }

    if (current && /;\s*$/.test(line)) {
      statements.push({
        line: current.startLine,
        statement: normalizeStatement(current.chunks.join("\n"))
      });
      current = null;
    }
  }

  if (current) {
    statements.push({
      line: current.startLine,
      statement: normalizeStatement(current.chunks.join("\n"))
    });
  }

  return statements;
}

function isExportFromStatement(statement) {
  return /^export\s+(?:\*|\{[\s\S]*\})\s+from\s+["'][^"']+["'];?$/.test(statement);
}

function isPassThroughBarrelSource(source) {
  const statements = collectImportExportStatements(source);
  const exportFromStatements = statements.filter((entry) => isExportFromStatement(entry.statement));
  if (exportFromStatements.length === 0) return false;

  const body = stripComments(source)
    .split(";")
    .map((part) => normalizeStatement(part))
    .filter(Boolean);
  if (body.length === 0) return false;

  return body.every((part) => isExportFromStatement(`${part};`));
}

function isExternalSpecifier(specifier) {
  return specifier.startsWith("node:")
    || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(specifier)
    || (!specifier.startsWith(".") && !specifier.startsWith("/"));
}

function resolveSpecifier(importerPath, specifier) {
  if (specifier.startsWith("/")) {
    return path.join(repoRoot, specifier.slice(1));
  }
  if (specifier.startsWith(".")) {
    return path.resolve(path.dirname(importerPath), specifier);
  }
  return null;
}

function getImportSpecifiers(statement) {
  const specifiers = [];
  const importExportPattern = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of statement.matchAll(importExportPattern)) {
    specifiers.push(match[1] || match[2]);
  }
  return specifiers.filter(Boolean);
}

function isGameEntryIndex(relativePath) {
  return /^archive\/v1-v2\/games\/[^/]+\/index\.js$/.test(relativePath);
}

function isSampleEntryIndex(relativePath) {
  return /^archive\/v1-v2\/samples\/phase-\d{2}\/\d{4}\/index\.js$/.test(relativePath);
}

function isToolEntryIndex(relativePath, fullPath) {
  if (!/^toolbox\/.+\/index\.js$/.test(relativePath)) return false;
  if (!fs.existsSync(fullPath)) return true;
  return !isPassThroughBarrelSource(fs.readFileSync(fullPath, "utf8"));
}

function isAllowedEntrypointIndex(relativePath, fullPath) {
  return isGameEntryIndex(relativePath)
    || isSampleEntryIndex(relativePath)
    || isToolEntryIndex(relativePath, fullPath);
}

function findPassThroughBarrelViolations() {
  const violations = [];
  for (const filePath of collectFiles(passThroughScanRoots)) {
    const relativePath = toPosix(path.relative(repoRoot, filePath));
    const source = fs.readFileSync(filePath, "utf8");
    if (!isPassThroughBarrelSource(source)) continue;
    violations.push({
      file: relativePath,
      type: "pass-through-export-barrel",
      detail: "Internal pass-through files using `export ... from` are disallowed."
    });
  }
  return violations;
}

function findInternalIndexImportViolations() {
  const violations = [];
  for (const filePath of collectFiles(importScanRoots)) {
    const relativePath = toPosix(path.relative(repoRoot, filePath));
    const source = fs.readFileSync(filePath, "utf8");
    const statements = collectImportExportStatements(source);
    for (const entry of statements) {
      for (const specifier of getImportSpecifiers(entry.statement)) {
        if (isExternalSpecifier(specifier)) continue;
        if (!specifier.replace(/\\/g, "/").endsWith("/index.js")) continue;

        const resolvedPath = resolveSpecifier(filePath, specifier);
        const resolvedRelativePath = resolvedPath ? toPosix(path.relative(repoRoot, resolvedPath)) : specifier;
        if (resolvedPath && isAllowedEntrypointIndex(resolvedRelativePath, resolvedPath)) continue;

        violations.push({
          file: relativePath,
          line: entry.line,
          type: "internal-index-import",
          detail: `Import targets internal index barrel ${specifier} (${resolvedRelativePath}).`
        });
      }
    }
  }
  return violations;
}

function printViolations(violations) {
  for (const violation of violations) {
    const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
    console.error(`- ${location} [${violation.type}] ${violation.detail}`);
  }
}

function sortViolations(violations) {
  return [...violations].sort((left, right) => (
    left.file.localeCompare(right.file)
    || left.type.localeCompare(right.type)
    || left.detail.localeCompare(right.detail)
  ));
}

function violationKey(violation) {
  return `${violation.file}::${violation.type}::${violation.detail}`;
}

function parseArgs(argv) {
  return {
    updateBaseline: argv.includes("--update-baseline")
  };
}

function loadBaseline(baselinePath) {
  const parsed = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  if (!parsed || !Array.isArray(parsed.violations)) {
    throw new Error("Invalid internal barrel guard baseline format.");
  }
  return sortViolations(parsed.violations);
}

function writeBaseline(baselinePath, violations) {
  const payload = {
    generatedAt: new Date().toISOString(),
    violations: sortViolations(violations)
  };
  fs.writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function diffViolations(currentViolations, baselineViolations) {
  const baselineKeys = new Set(baselineViolations.map(violationKey));
  const currentKeys = new Set(currentViolations.map(violationKey));
  return {
    unexpected: sortViolations(currentViolations.filter((violation) => !baselineKeys.has(violationKey(violation)))),
    resolved: sortViolations(baselineViolations.filter((violation) => !currentKeys.has(violationKey(violation))))
  };
}

function run() {
  const { updateBaseline } = parseArgs(process.argv.slice(2));
  const baselinePath = path.join(repoRoot, baselineRelativePath);
  const passThroughViolations = findPassThroughBarrelViolations();
  const importViolations = findInternalIndexImportViolations();
  const violations = sortViolations([...passThroughViolations, ...importViolations]);

  if (updateBaseline) {
    writeBaseline(baselinePath, violations);
    console.log(`Internal barrel guard baseline updated at ${baselineRelativePath}.`);
    console.log(`Summary: pass_through_files_scanned=${collectFiles(passThroughScanRoots).length}`);
    console.log(`Summary: import_files_scanned=${collectFiles(importScanRoots).length}`);
    console.log(`Summary: baseline_violations=${violations.length}`);
    return;
  }

  if (fs.existsSync(baselinePath)) {
    const baselineViolations = loadBaseline(baselinePath);
    const { unexpected, resolved } = diffViolations(violations, baselineViolations);

    if (unexpected.length === 0) {
      console.log("INTERNAL_BARREL_GUARD_PASSED");
      console.log(`Summary: pass_through_files_scanned=${collectFiles(passThroughScanRoots).length}`);
      console.log(`Summary: import_files_scanned=${collectFiles(importScanRoots).length}`);
      console.log(`Summary: baseline_expected=${baselineViolations.length}`);
      console.log(`Summary: baseline_resolved=${resolved.length}`);
      console.log(`Summary: new_violations=0`);
      return;
    }

    console.error("INTERNAL_BARREL_GUARD_FAILED");
    printViolations(unexpected);
    console.error(`Summary: baseline_expected=${baselineViolations.length}`);
    console.error(`Summary: baseline_resolved=${resolved.length}`);
    console.error(`Summary: new_violations=${unexpected.length}`);
    process.exit(1);
  }

  if (violations.length > 0) {
    console.error("INTERNAL_BARREL_GUARD_FAILED");
    printViolations(violations);
    console.error(`Summary: pass_through_barrels=${passThroughViolations.length}`);
    console.error(`Summary: internal_index_imports=${importViolations.length}`);
    process.exit(1);
  }

  console.log("INTERNAL_BARREL_GUARD_PASSED");
  console.log(`Summary: pass_through_files_scanned=${collectFiles(passThroughScanRoots).length}`);
  console.log(`Summary: import_files_scanned=${collectFiles(importScanRoots).length}`);
  console.log("Summary: pass_through_barrels=0");
  console.log("Summary: internal_index_imports=0");
}

run();
