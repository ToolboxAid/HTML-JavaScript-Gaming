import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const reportPath = path.join(repoRoot, "docs_build", "dev", "reports", "environment_agnostic_browser_gate_report.md");
const scanRoots = [
  "account",
  "admin",
  "assets/theme-v2/js",
  "toolbox",
  "src/engine",
];
const allowedExtensions = new Set([".html", ".js", ".mjs"]);
const excludedSegments = new Set([
  ".git",
  "archive",
  "docs_build",
  "node_modules",
  "start_of_day",
  "tests",
  "tmp",
]);

const deploymentTermPattern = /\b(?:DEV|UAT|PROD|Prod|Production|production|Development|development)\b|process\.env|GAMEFOUNDRY_[A-Z0-9_]*(?:ENV|ENVIRONMENT|STAGE|PROVIDER|MODE)[A-Z0-9_]*/;
const branchPattern = /^\s*(?:if|else\s+if|switch|while|for)\s*\(|^\s*case\b|\?|\&\&|\|\|/;
const accountDependencyPattern = /\b(?:Local(?: DB| API)?|SQLite|Supabase|provider|localhost|DEV|UAT|PROD|Prod)\b|data-local-db-|local-db-page-data\.js/i;
const accountBrowserFiles = new Set([
  "assets/theme-v2/js/account-auth-actions.js",
  "assets/theme-v2/js/account-auth-service.js",
  "assets/theme-v2/js/account-page-data.js",
  "assets/theme-v2/js/login-session.js",
]);

function repoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

function isExcluded(absolutePath) {
  return repoPath(absolutePath)
    .split("/")
    .some((segment) => excludedSegments.has(segment));
}

function isCommentOnly(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("<!--");
}

function isAccountBrowserFile(filePath) {
  const normalizedPath = repoPath(filePath);
  return normalizedPath.startsWith("account/") || accountBrowserFiles.has(normalizedPath);
}

async function collectFiles(rootPath) {
  const absoluteRoot = path.join(repoRoot, rootPath);
  const files = [];
  const entries = await fs.readdir(absoluteRoot, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const absolutePath = path.join(absoluteRoot, entry.name);
    if (isExcluded(absolutePath)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...await collectFiles(repoPath(absolutePath)));
      continue;
    }
    if (entry.isFile() && allowedExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }
  return files;
}

function scanFile(filePath, contents) {
  const mentions = [];
  const findings = [];
  const accountFindings = [];
  const lines = contents.split(/\r?\n/);
  lines.forEach((line, index) => {
    const record = {
      line: index + 1,
      path: repoPath(filePath),
      text: line.trim(),
    };
    if (deploymentTermPattern.test(line)) {
      mentions.push(record);
    }
    if (deploymentTermPattern.test(line) && !isCommentOnly(line) && branchPattern.test(line)) {
      findings.push({
        ...record,
        reason: "Deployment label appears on a control-flow or branching line.",
      });
    }
    if (isAccountBrowserFile(filePath) && accountDependencyPattern.test(line)) {
      accountFindings.push({
        ...record,
        reason: "Account page/browser code contains a forbidden environment/provider dependency term.",
      });
    }
  });
  return { accountFindings, findings, mentions };
}

function formatRecords(records, limit = 40) {
  if (!records.length) {
    return "- None";
  }
  const rendered = records.slice(0, limit).map((record) =>
    `- \`${record.path}:${record.line}\` - ${record.reason ? `${record.reason} ` : ""}\`${record.text}\``
  );
  if (records.length > limit) {
    rendered.push(`- ... ${records.length - limit} additional record(s) omitted from this report.`);
  }
  return rendered.join("\n");
}

const files = (await Promise.all(scanRoots.map(collectFiles))).flat();
const allMentions = [];
const accountFindings = [];
const findings = [];
for (const filePath of files) {
  const contents = await fs.readFile(filePath, "utf8");
  const result = scanFile(filePath, contents);
  allMentions.push(...result.mentions);
  accountFindings.push(...result.accountFindings);
  findings.push(...result.findings);
}

const status = findings.length || accountFindings.length ? "FAIL" : "PASS";
const report = [
  "# Environment-Agnostic Browser Gate Report",
  "",
  `Status: ${status}`,
  "",
  "## Scope",
  `- Scanned active browser/page roots: ${scanRoots.map((root) => `\`${root}\``).join(", ")}`,
  `- Files scanned: ${files.length}`,
  "- Excluded server/dev/test/archive/report/temp roots: `.git`, `archive`, `docs_build`, `node_modules`, `start_of_day`, `tests`, `tmp`.",
  "",
  "## Deployment-Label Branching Findings",
  formatRecords(findings),
  "",
  "## Account Page Dependency Findings",
  formatRecords(accountFindings),
  "",
  "## Non-Branching Deployment Mentions Reviewed",
  formatRecords(allMentions.filter((mention) =>
    !findings.some((finding) => finding.path === mention.path && finding.line === mention.line)
  )),
  "",
  "## Result",
  findings.length
    ? "- FAIL - Browser/page code contains deployment-label branching that must be removed or moved behind server connection config."
    : accountFindings.length
      ? "- FAIL - Account page/browser code contains forbidden environment/provider dependency terms."
      : "- PASS - No DEV/UAT/PROD deployment-label branching or forbidden account page dependency terms were found in active browser/page code.",
  "",
].join("\n");

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, report);
console.log(`Wrote ${reportPath}`);
if (findings.length) {
  process.exitCode = 1;
}
