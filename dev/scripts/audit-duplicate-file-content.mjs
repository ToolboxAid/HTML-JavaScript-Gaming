import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  "tmp",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".next"
]);

const JSON_REPORT_PATH = path.join(repoRoot, "dev", "reports", "repo_duplicate_file_content_audit.json");
const MD_REPORT_PATH = path.join(repoRoot, "dev", "reports", "PR_10_26_REPO_DUPLICATE_FILE_CONTENT_AUDIT_report.md");

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function getExtension(filePath) {
  const ext = path.extname(filePath || "").toLowerCase();
  return ext || "(no-ext)";
}

function classifyDuplicateGroup(files) {
  const normalized = files.map((value) => value.toLowerCase());
  const inDocs = normalized.every((value) => value.startsWith("docs/"));
  const inReports = normalized.every((value) => value.includes("/reports/"));
  const inEvidenceSnapshot = normalized.some((value) => value.includes("/repo_relative/") || value.includes("/evidence/"));
  const touchesRuntime = normalized.some((value) => value.startsWith("src/")
    || value.startsWith("www/games/")
    || value.startsWith("www/toolbox/")
    || value.startsWith("dev/archive/v1-v2/games/")
    || value.startsWith("dev/archive/v1-v2/samples/"));
  const inTestsOnly = normalized.every((value) => value.startsWith("dev/tests/"));
  const extensionSet = new Set(files.map((value) => getExtension(value)));
  const allJson = extensionSet.size === 1 && extensionSet.has(".json");
  const allMarkdown = extensionSet.size === 1 && extensionSet.has(".md");

  if (inEvidenceSnapshot && inDocs) {
    return {
      classification: "report-evidence-snapshot-duplicate",
      cleanupRisk: "low",
      rationale: "Duplicate is in report/evidence snapshot paths and is unlikely to be runtime source of truth."
    };
  }

  if (inReports && inDocs) {
    return {
      classification: "report-artifact-duplicate",
      cleanupRisk: "low",
      rationale: "Duplicates live under reports and are likely generated artifacts or archived outputs."
    };
  }

  if (inTestsOnly) {
    return {
      classification: "test-fixture-duplicate",
      cleanupRisk: "medium",
      rationale: "Duplicate files are test-scoped, but fixture coupling may break tests if removed blindly."
    };
  }

  if (touchesRuntime && allJson) {
    return {
      classification: "runtime-json-duplicate",
      cleanupRisk: "high",
      rationale: "Runtime/sample/tool JSON duplicates can represent mirrored contracts that need owner-by-owner review."
    };
  }

  if (touchesRuntime) {
    return {
      classification: "runtime-or-source-duplicate",
      cleanupRisk: "high",
      rationale: "Duplicate content touches runtime/source surfaces and could affect behavior if consolidated incorrectly."
    };
  }

  if (allMarkdown && inDocs) {
    return {
      classification: "documentation-duplicate",
      cleanupRisk: "medium",
      rationale: "Documentation duplicates are likely safe to consolidate, but may be intentionally archived by PR/report context."
    };
  }

  return {
    classification: "general-content-duplicate",
    cleanupRisk: "medium",
    rationale: "Requires targeted ownership review before cleanup."
  };
}

async function walkFiles(rootDir) {
  const collected = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.has(entry.name)) {
          continue;
        }
        await walk(absolutePath);
        continue;
      }
      if (entry.isFile()) {
        collected.push(absolutePath);
      }
    }
  }

  await walk(rootDir);
  return collected;
}

async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

function bytesToHuman(value) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const scannedFiles = await walkFiles(repoRoot);
  const hashToFiles = new Map();
  const fileSizeByPath = new Map();

  for (const absoluteFilePath of scannedFiles) {
    const relative = toPosixPath(path.relative(repoRoot, absoluteFilePath));
    const stat = await fs.stat(absoluteFilePath);
    fileSizeByPath.set(relative, stat.size);
    const hash = await hashFile(absoluteFilePath);
    if (!hashToFiles.has(hash)) {
      hashToFiles.set(hash, []);
    }
    hashToFiles.get(hash).push(relative);
  }

  const duplicateGroups = [];
  let duplicateFilesTotal = 0;
  let duplicateContentBytes = 0;
  let potentialSavingsBytes = 0;

  for (const [hash, files] of hashToFiles.entries()) {
    if (files.length < 2) {
      continue;
    }

    files.sort((a, b) => a.localeCompare(b));
    const firstSize = fileSizeByPath.get(files[0]) || 0;
    const classification = classifyDuplicateGroup(files);
    const extraCopies = files.length - 1;

    duplicateFilesTotal += files.length;
    duplicateContentBytes += firstSize * files.length;
    potentialSavingsBytes += firstSize * extraCopies;

    duplicateGroups.push({
      hash,
      count: files.length,
      fileSizeBytes: firstSize,
      duplicateBytes: firstSize * files.length,
      potentialSavingsBytes: firstSize * extraCopies,
      classification: classification.classification,
      cleanupRisk: classification.cleanupRisk,
      rationale: classification.rationale,
      files
    });
  }

  duplicateGroups.sort((a, b) => {
    if (b.potentialSavingsBytes !== a.potentialSavingsBytes) {
      return b.potentialSavingsBytes - a.potentialSavingsBytes;
    }
    return b.count - a.count;
  });

  const byClassification = new Map();
  for (const group of duplicateGroups) {
    const key = `${group.classification}::${group.cleanupRisk}`;
    if (!byClassification.has(key)) {
      byClassification.set(key, {
        classification: group.classification,
        cleanupRisk: group.cleanupRisk,
        groups: 0,
        files: 0,
        potentialSavingsBytes: 0
      });
    }
    const bucket = byClassification.get(key);
    bucket.groups += 1;
    bucket.files += group.count;
    bucket.potentialSavingsBytes += group.potentialSavingsBytes;
  }

  const summary = {
    scannedAt: new Date().toISOString(),
    repoRoot: toPosixPath(repoRoot),
    excludedDirectories: Array.from(EXCLUDED_DIRS.values()),
    scannedFileCount: scannedFiles.length,
    uniqueHashCount: hashToFiles.size,
    duplicateGroupCount: duplicateGroups.length,
    duplicateFileCount: duplicateFilesTotal,
    duplicateContentBytes,
    potentialSavingsBytes
  };

  const jsonReport = {
    summary,
    classificationSummary: Array.from(byClassification.values())
      .sort((a, b) => b.potentialSavingsBytes - a.potentialSavingsBytes),
    duplicateGroups
  };

  await fs.mkdir(path.dirname(JSON_REPORT_PATH), { recursive: true });
  await fs.writeFile(JSON_REPORT_PATH, `${JSON.stringify(jsonReport, null, 2)}\n`, "utf8");

  const topGroups = duplicateGroups.slice(0, 25);
  const mdLines = [];
  mdLines.push("# PR_10_26_REPO_DUPLICATE_FILE_CONTENT_AUDIT Report");
  mdLines.push("");
  mdLines.push("## Result");
  mdLines.push("PASS");
  mdLines.push("");
  mdLines.push("## Scope");
  mdLines.push("- Repo-wide duplicate content audit by exact SHA-256 hash.");
  mdLines.push("- No duplicate files were deleted, moved, or rewritten in this PR.");
  mdLines.push("");
  mdLines.push("## Scan Configuration");
  mdLines.push(`- Excluded directories: ${summary.excludedDirectories.join(", ")}`);
  mdLines.push(`- Scanned files: ${summary.scannedFileCount}`);
  mdLines.push("");
  mdLines.push("## Summary");
  mdLines.push(`- Duplicate groups: ${summary.duplicateGroupCount}`);
  mdLines.push(`- Duplicate files (in groups): ${summary.duplicateFileCount}`);
  mdLines.push(`- Duplicate content bytes: ${summary.duplicateContentBytes} (${bytesToHuman(summary.duplicateContentBytes)})`);
  mdLines.push(`- Potential cleanup savings (extra copies only): ${summary.potentialSavingsBytes} (${bytesToHuman(summary.potentialSavingsBytes)})`);
  mdLines.push("");
  mdLines.push("## Classification And Cleanup Risk");
  mdLines.push("| Classification | Cleanup Risk | Groups | Files | Potential Savings |\n|---|---|---:|---:|---:|");
  for (const bucket of jsonReport.classificationSummary) {
    mdLines.push(`| ${bucket.classification} | ${bucket.cleanupRisk} | ${bucket.groups} | ${bucket.files} | ${bucket.potentialSavingsBytes} (${bytesToHuman(bucket.potentialSavingsBytes)}) |`);
  }
  mdLines.push("");
  mdLines.push("## Top Duplicate Groups By Potential Savings");
  mdLines.push("| Hash (short) | Count | File Size | Potential Savings | Classification | Risk | Representative File |\n|---|---:|---:|---:|---|---|---|");
  for (const group of topGroups) {
    mdLines.push(`| ${group.hash.slice(0, 12)} | ${group.count} | ${group.fileSizeBytes} | ${group.potentialSavingsBytes} | ${group.classification} | ${group.cleanupRisk} | ${group.files[0]} |`);
  }
  mdLines.push("");
  mdLines.push("## Notes");
  mdLines.push("- Full duplicate group details are in `repo_duplicate_file_content_audit.json`.");
  mdLines.push("- High-risk groups should be reviewed by code/data owners before any consolidation.");

  await fs.writeFile(MD_REPORT_PATH, `${mdLines.join("\n")}\n`, "utf8");

  console.log(`[duplicate-audit] JSON report: ${toPosixPath(path.relative(repoRoot, JSON_REPORT_PATH))}`);
  console.log(`[duplicate-audit] Markdown report: ${toPosixPath(path.relative(repoRoot, MD_REPORT_PATH))}`);
  console.log(`[duplicate-audit] duplicate groups: ${summary.duplicateGroupCount}`);
}

main().catch((error) => {
  console.error("[duplicate-audit] failed:", error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
