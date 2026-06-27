import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const ledgerPath = path.join(repoRoot, "dev/docs_build/dev/toolbox/intentionalAliasLedger.json");
const scanRoots = ["src", "toolbox", "tests"];
const sourceExtensions = new Set([".js", ".mjs"]);
const ignoredDirNames = new Set(["node_modules", ".git", "tmp", "results", "generated", "vendor"]);
const ignoredPathFragments = [
  "dev/docs_build/dev/reports/",
  "dev/archive/v1-v2/docs_build/archive/",
  "tmp/test-results/"
];

function shouldIgnoreDirectory(directoryName) {
  return ignoredDirNames.has(directoryName)
    || directoryName.startsWith("old_");
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isIgnoredPath(relativePath) {
  return ignoredPathFragments.some((fragment) => relativePath.startsWith(fragment));
}

function collectSourceFiles(startPath, outFiles) {
  if (!fs.existsSync(startPath)) return;
  const entries = fs.readdirSync(startPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(startPath, entry.name);
    const relPath = toPosix(path.relative(repoRoot, fullPath));
    if (entry.isDirectory()) {
      if (shouldIgnoreDirectory(entry.name)) continue;
      if (isIgnoredPath(`${relPath}/`)) continue;
      collectSourceFiles(fullPath, outFiles);
      continue;
    }

    if (!entry.isFile()) continue;
    if (isIgnoredPath(relPath)) continue;
    if (entry.name.toLowerCase().endsWith(".min.js")) continue;
    if (!sourceExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    outFiles.push(fullPath);
  }
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

function collectImportExportStatements(source, file) {
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
      const statement = normalizeStatement(current.chunks.join("\n"));
      if (/\bas\b/.test(statement)) {
        statements.push({
          file,
          line: current.startLine,
          statement
        });
      }
      current = null;
    }
  }

  if (current) {
    const statement = normalizeStatement(current.chunks.join("\n"));
    if (/\bas\b/.test(statement)) {
      statements.push({
        file,
        line: current.startLine,
        statement
      });
    }
  }

  return statements;
}

function compileEntry(entry) {
  const statementRegex = entry.statementRegex ? new RegExp(entry.statementRegex) : null;
  const fileRegex = entry.fileRegex ? new RegExp(entry.fileRegex) : null;
  return {
    ...entry,
    statementRegex,
    fileRegex,
    files: new Set(entry.files || []),
    statements: new Set(entry.statements || [])
  };
}

function entryMatchesOccurrence(entry, occurrence) {
  const fileMatches = entry.files.has(occurrence.file) || (entry.fileRegex && entry.fileRegex.test(occurrence.file));
  if (!fileMatches) return false;

  return entry.statements.has(occurrence.statement)
    || (entry.statementRegex && entry.statementRegex.test(occurrence.statement));
}

function validateLedger(ledger) {
  if (!ledger || ledger.version !== 1 || !Array.isArray(ledger.entries)) {
    throw new Error("Invalid intentional alias ledger format.");
  }

  for (const entry of ledger.entries) {
    if (!entry.id || !entry.reason) {
      throw new Error("Intentional alias ledger entries require id and reason.");
    }
    if (!entry.files && !entry.fileRegex) {
      throw new Error(`Ledger entry ${entry.id} requires files or fileRegex.`);
    }
    if (!entry.statements && !entry.statementRegex) {
      throw new Error(`Ledger entry ${entry.id} requires statements or statementRegex.`);
    }
  }
}

function printFailures(unexpected, staleEntries) {
  if (unexpected.length > 0) {
    console.error("Unexpected import/export alias statements:");
    for (const occurrence of unexpected) {
      console.error(`- ${occurrence.file}:${occurrence.line} ${occurrence.statement}`);
    }
  }

  if (staleEntries.length > 0) {
    console.error("Ledger entries with no current matches:");
    for (const entry of staleEntries) {
      console.error(`- ${entry.id}`);
    }
  }
}

function run() {
  if (!fs.existsSync(ledgerPath)) {
    throw new Error("Missing dev/docs_build/dev/toolbox/intentionalAliasLedger.json.");
  }

  const ledger = readJson(ledgerPath);
  validateLedger(ledger);
  const entries = ledger.entries.map(compileEntry);

  const files = [];
  for (const root of scanRoots) {
    collectSourceFiles(path.join(repoRoot, root), files);
  }

  const occurrences = [];
  for (const filePath of files) {
    const relativePath = toPosix(path.relative(repoRoot, filePath));
    const source = fs.readFileSync(filePath, "utf8");
    occurrences.push(...collectImportExportStatements(source, relativePath));
  }

  const matchCounts = new Map(entries.map((entry) => [entry.id, 0]));
  const unexpected = [];

  for (const occurrence of occurrences) {
    const matchedEntries = entries.filter((entry) => entryMatchesOccurrence(entry, occurrence));
    if (matchedEntries.length === 0) {
      unexpected.push(occurrence);
      continue;
    }
    for (const entry of matchedEntries) {
      matchCounts.set(entry.id, (matchCounts.get(entry.id) || 0) + 1);
    }
  }

  const staleEntries = entries.filter((entry) => (matchCounts.get(entry.id) || 0) === 0);
  if (unexpected.length > 0 || staleEntries.length > 0) {
    console.error("INTENTIONAL_ALIAS_LEDGER_GUARD_FAILED");
    printFailures(unexpected, staleEntries);
    console.error(`Summary: files_scanned=${files.length}`);
    console.error(`Summary: aliases_found=${occurrences.length}`);
    console.error(`Summary: unexpected_aliases=${unexpected.length}`);
    console.error(`Summary: stale_ledger_entries=${staleEntries.length}`);
    process.exit(1);
  }

  console.log("INTENTIONAL_ALIAS_LEDGER_GUARD_PASSED");
  console.log(`Summary: files_scanned=${files.length}`);
  console.log(`Summary: aliases_found=${occurrences.length}`);
  console.log(`Summary: ledger_entries=${entries.length}`);
}

run();
