import fs from "node:fs/promises";
import path from "node:path";

const SCAN_ROOTS = ["src", "games", "samples", "tools"];
const ALLOWED_EXTENSIONS = new Set([".js", ".mjs"]);
const IGNORED_DIRS = new Set(["node_modules", ".git", "tmp"]);
// Selftest intentionally contains violating fixtures and should not affect repo guard status.
const IGNORED_FILES = new Set(["tools/dev/checkSharedExtractionGuard.selftest.mjs"]);
// Backlog is tracked in a baseline so pretest can fail only on regressions.
const BASELINE_RELATIVE_PATH = "tools/dev/checkSharedExtractionGuard.baseline.json";

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
const NUMBER_UTIL_IMPORT_HINT = /from\s+["'][^"']*shared\/utils\/numberUtils\.js["']/;

const INLINE_HELPER_VARIANT_RULES = [
  { rule: "inline-helper-clone", regex: /\(value\)\s*=>\s*Number\.isFinite/g, label: "rule:inline-arrow-number-is-finite" },
  { rule: "inline-helper-clone", regex: /typeof\s+value\s*===\s*'object'\s*&&\s*value\s*!==\s*null/g, label: "rule:inline-plain-object-check" }
];

const RENAMED_HELPER_FUNCTION_RULES = [
  { rule: "renamed-helper-clone", regex: /function\s+finiteNumber\s*\(/g, label: "rule:renamed-helper-finiteNumber" },
  { rule: "renamed-helper-clone", regex: /function\s+positiveInt\s*\(/g, label: "rule:renamed-helper-positiveInt" },
  { rule: "renamed-helper-clone", regex: /function\s+plainObj\s*\(/g, label: "rule:renamed-helper-plainObj" }
];

const DEEP_RELATIVE_TRAVERSAL_RULES = [
  { rule: "deep-relative-shared-traversal", regex: /\.\.\/\.\.\/\.\.\/\.\.\/src\/shared/g, label: "rule:deep-relative-src-shared-traversal" },
  { rule: "deep-relative-shared-traversal", regex: /\.\.\/\.\.\/\.\.\/src\/\.\.\/shared/g, label: "rule:relative-src-parent-shared-traversal" }
];

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

  for (const check of INLINE_HELPER_VARIANT_RULES) {
    const matches = fileContent.match(check.regex) || [];
    for (const _match of matches) {
      violations.push({
        file: filePathFromRoot,
        type: check.rule,
        match: check.label
      });
    }
  }

  for (const check of RENAMED_HELPER_FUNCTION_RULES) {
    const matches = fileContent.match(check.regex) || [];
    for (const _match of matches) {
      violations.push({
        file: filePathFromRoot,
        type: check.rule,
        match: check.label
      });
    }
  }

  for (const check of DEEP_RELATIVE_TRAVERSAL_RULES) {
    const matches = fileContent.match(check.regex) || [];
    for (const _match of matches) {
      violations.push({
        file: filePathFromRoot,
        type: check.rule,
        match: check.label
      });
    }
  }

  const finiteMatches = [...fileContent.matchAll(/Number\.isFinite\s*\(/g)];
  for (const finiteMatch of finiteMatches) {
    const matchIndex = finiteMatch.index ?? -1;
    if (matchIndex < 0) continue;
    const lineStart = fileContent.lastIndexOf("\n", matchIndex) + 1;
    const lineEndCandidate = fileContent.indexOf("\n", matchIndex);
    const lineEnd = lineEndCandidate === -1 ? fileContent.length : lineEndCandidate;
    const lineText = fileContent.slice(lineStart, lineEnd);

    if (NUMBER_UTIL_IMPORT_HINT.test(lineText)) continue;

    violations.push({
      file: filePathFromRoot,
      type: "inline-helper-clone",
      match: "rule:number-is-finite-usage"
    });
  }

  return violations;
}

function summarizeViolationLabels(violations) {
  const counts = new Map();
  for (const violation of violations) {
    const next = (counts.get(violation.match) || 0) + 1;
    counts.set(violation.match, next);
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function printGroupedViolations(violations) {
  const byType = new Map();
  for (const violation of violations) {
    if (!byType.has(violation.type)) byType.set(violation.type, new Map());
    const byFile = byType.get(violation.type);
    if (!byFile.has(violation.file)) byFile.set(violation.file, []);
    byFile.get(violation.file).push(violation);
  }

  const typeEntries = [...byType.entries()].sort(([a], [b]) => a.localeCompare(b));
  for (const [type, filesMap] of typeEntries) {
    console.error(`TYPE: ${type}`);
    const fileEntries = [...filesMap.entries()].sort(([a], [b]) => a.localeCompare(b));
    for (const [file, fileViolations] of fileEntries) {
      console.error(`  FILE: ${file}`);
      const summaries = summarizeViolationLabels(fileViolations);
      for (const [label, count] of summaries) {
        console.error(`    MATCH: ${label}${count > 1 ? ` (x${count})` : ""}`);
      }
    }
  }
}

function printSummary(filesScanned, violations, useErrorStream = false) {
  const out = useErrorStream ? console.error : console.log;
  const types = [...new Set(violations.map((violation) => violation.type))].sort();
  const typeSummary = types.length > 0 ? types.join(", ") : "none";
  out(`Summary: files_scanned=${filesScanned}`);
  out(`Summary: total_violations=${violations.length}`);
  out(`Summary: violation_types=${typeSummary}`);
}

function sortViolations(violations) {
  return [...violations].sort((left, right) => (
    left.file.localeCompare(right.file)
    || left.type.localeCompare(right.type)
    || left.match.localeCompare(right.match)
  ));
}

function violationKey(violation) {
  return `${violation.file}::${violation.type}::${violation.match}`;
}

function parseArgs(argv) {
  return {
    updateBaseline: argv.includes("--update-baseline")
  };
}

async function loadBaseline(baselinePath) {
  const raw = await fs.readFile(baselinePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.violations)) {
    throw new Error("Invalid shared extraction guard baseline format.");
  }
  return sortViolations(parsed.violations);
}

async function writeBaseline(baselinePath, violations) {
  const payload = {
    generatedAt: new Date().toISOString(),
    violations: sortViolations(violations)
  };
  await fs.writeFile(`${baselinePath}`, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function diffViolations(currentViolations, baselineViolations) {
  const baselineSet = new Set(baselineViolations.map(violationKey));
  const currentSet = new Set(currentViolations.map(violationKey));

  const unexpected = currentViolations.filter((violation) => !baselineSet.has(violationKey(violation)));
  const resolved = baselineViolations.filter((violation) => !currentSet.has(violationKey(violation)));

  return {
    unexpected: sortViolations(unexpected),
    resolved: sortViolations(resolved)
  };
}

async function run() {
  const { updateBaseline } = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const filesToScan = [];
  const baselinePath = path.join(repoRoot, BASELINE_RELATIVE_PATH);

  for (const root of SCAN_ROOTS) {
    const rootPath = path.join(repoRoot, root);
    if (!(await pathExists(rootPath))) continue;
    await collectSourceFiles(rootPath, filesToScan);
  }

  const violations = [];
  for (const filePath of filesToScan) {
    const relPath = path.relative(repoRoot, filePath).replaceAll("\\", "/");
    if (IGNORED_FILES.has(relPath)) continue;
    const content = await fs.readFile(filePath, "utf8");
    violations.push(...findViolations(content, relPath));
  }

  if (updateBaseline) {
    await writeBaseline(baselinePath, violations);
    console.log(`Shared extraction guard baseline updated at ${BASELINE_RELATIVE_PATH}.`);
    printSummary(filesToScan.length, violations);
    process.exit(0);
  }

  if (await pathExists(baselinePath)) {
    const baselineViolations = await loadBaseline(baselinePath);
    const { unexpected, resolved } = diffViolations(sortViolations(violations), baselineViolations);

    if (unexpected.length === 0) {
      console.log("Shared extraction guard passed against baseline.");
      printSummary(filesToScan.length, violations);
      console.log(`Summary: baseline_expected=${baselineViolations.length}`);
      console.log(`Summary: baseline_resolved=${resolved.length}`);
      return;
    }

    console.error(`Shared extraction guard failed with ${unexpected.length} unexpected violation(s).`);
    printGroupedViolations(unexpected);
    printSummary(filesToScan.length, violations, true);
    console.error(`Summary: baseline_expected=${baselineViolations.length}`);
    console.error(`Summary: baseline_unexpected=${unexpected.length}`);
    console.error(`Summary: baseline_resolved=${resolved.length}`);
    process.exit(1);
  }

  if (violations.length === 0) {
    console.log("Shared extraction guard passed. No violations found.");
    printSummary(filesToScan.length, violations);
    process.exit(0);
  }

  console.error(`Shared extraction guard failed with ${violations.length} violation(s).`);
  printGroupedViolations(violations);
  printSummary(filesToScan.length, violations, true);
  process.exit(1);
}

run().catch((error) => {
  console.error("Shared extraction guard encountered an unexpected error.");
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
