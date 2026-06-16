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
const userFacingImplementationPattern = /\b(?:DEV|UAT|PROD|Local DB|Local API|SQLite|Supabase|provider)\b/i;
const accountBrowserFiles = new Set([
  "assets/theme-v2/js/account-auth-actions.js",
  "assets/theme-v2/js/account-auth-service.js",
  "assets/theme-v2/js/account-page-data.js",
  "assets/theme-v2/js/login-session.js",
]);
const accountAuthPages = Object.freeze([
  Object.freeze({
    expectedScript: "../assets/theme-v2/js/login-session.js",
    formAttribute: "data-login-form",
    page: "account/sign-in.html",
  }),
  Object.freeze({
    expectedScript: "../assets/theme-v2/js/account-auth-actions.js",
    formAttribute: "data-account-auth-form=\"create-account\"",
    page: "account/create-account.html",
  }),
  Object.freeze({
    expectedScript: "../assets/theme-v2/js/account-auth-actions.js",
    formAttribute: "data-account-auth-form=\"password-reset\"",
    page: "account/password-reset.html",
  }),
]);
const productApiClientFiles = Object.freeze([
  "toolbox/assets/assets-api-client.js",
  "toolbox/colors/palette-api-client.js",
  "toolbox/controls/controls-api-client.js",
  "toolbox/game-configuration/game-configuration-api-client.js",
  "toolbox/game-design/game-design-api-client.js",
  "toolbox/game-journey/game-journey-api-client.js",
  "toolbox/game-workspace/game-workspace-api-client.js",
  "toolbox/objects/objects-api-client.js",
  "toolbox/tags/tags-api-client.js",
]);
const userFacingUiRoots = Object.freeze(["account", "toolbox"]);
const nonUiCompatibilityFiles = new Set([
  "toolbox/toolRegistry.js",
]);
const deprecatedLocalDbDebt = Object.freeze([
  Object.freeze({
    path: "admin/db-viewer.html",
    reason: "Admin diagnostic viewer still exposes historical Local DB labels while product paths move to the server service contract.",
    followUp: "Rename or retire with the Admin DB Viewer provider-source cleanup after migrated data is fully cut over.",
  }),
  Object.freeze({
    path: "admin/users.html",
    reason: "Admin identity review page still mounts the historical Local DB page-data renderer.",
    followUp: "Move to the Account/Admin identity service contract and remove data-local-db hooks.",
  }),
  Object.freeze({
    path: "admin/roles.html",
    reason: "Admin role review page still mounts the historical Local DB page-data renderer.",
    followUp: "Move to the Account/Admin identity service contract and remove data-local-db hooks.",
  }),
  Object.freeze({
    path: "admin/site-settings.html",
    reason: "Admin site-settings contract page still mounts the historical Local DB page-data renderer.",
    followUp: "Replace with server contract diagnostics after site settings get a migrated table owner.",
  }),
  Object.freeze({
    path: "admin/site-setup.html",
    reason: "Admin setup still contains controlled Local DB reseed diagnostics for transition validation.",
    followUp: "Remove reseed wording once DEV setup bootstrap no longer needs Local DB transition checks.",
  }),
  Object.freeze({
    path: "assets/theme-v2/js/local-db-page-data.js",
    reason: "Legacy Admin Local DB page renderer remains for Admin diagnostic pages only.",
    followUp: "Delete after Admin identity/status pages use service-contract renderers.",
  }),
  Object.freeze({
    path: "src/engine/api/local-db-api-client.js",
    reason: "Legacy Admin DB Viewer client wraps server API endpoints and is not an Account/product browser data source.",
    followUp: "Rename or replace when DB Viewer routes are no longer named local-db.",
  }),
  Object.freeze({
    path: "src/dev-runtime/server/local-api-router.mjs",
    reason: "Server retains lazy SQLite/Local DB helpers for legacy Admin/test endpoints, not for active product-data fallback.",
    followUp: "Remove the legacy adapter when Admin DB Viewer and old tests finish the service-contract migration.",
  }),
  Object.freeze({
    path: "toolbox/toolRegistry.js",
    reason: "Compatibility registry wrapper still imports dev-runtime seed metadata for older tests/scripts, while active Toolbox UI uses the registry service API.",
    followUp: "Delete after legacy registry consumers move to the server registry service contract.",
  }),
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

function isModuleSyntaxOnly(line) {
  return /^\s*(?:import|export)\b/.test(line);
}

function isAccountBrowserFile(filePath) {
  const normalizedPath = repoPath(filePath);
  return normalizedPath.startsWith("account/") || accountBrowserFiles.has(normalizedPath);
}

function isUserFacingUiFile(filePath) {
  const normalizedPath = repoPath(filePath);
  return !nonUiCompatibilityFiles.has(normalizedPath) &&
    userFacingUiRoots.some((root) => normalizedPath.startsWith(`${root}/`));
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
  const userFacingUiFindings = [];
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
    if (
      isUserFacingUiFile(filePath) &&
      userFacingImplementationPattern.test(line) &&
      !isCommentOnly(line) &&
      !isModuleSyntaxOnly(line)
    ) {
      userFacingUiFindings.push({
        ...record,
        reason: "User-facing Account/product UI contains implementation wording.",
      });
    }
  });
  return { accountFindings, findings, mentions, userFacingUiFindings };
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

function reportRecord(filePath, reason) {
  return {
    line: 1,
    path: filePath,
    reason,
    text: "",
  };
}

async function readRequiredRepoFile(filePath, findings, reasonPrefix) {
  try {
    return await fs.readFile(path.join(repoRoot, filePath), "utf8");
  } catch (error) {
    findings.push(reportRecord(filePath, `${reasonPrefix}: ${error instanceof Error ? error.message : String(error || "missing file")}`));
    return "";
  }
}

function requireSnippet(contents, filePath, snippet, findings, reason) {
  if (!contents.includes(snippet)) {
    findings.push(reportRecord(filePath, reason));
  }
}

function rejectPattern(contents, filePath, pattern, findings, reason) {
  if (pattern.test(contents)) {
    findings.push(reportRecord(filePath, reason));
  }
}

async function validateAccountServiceContract() {
  const findings = [];
  for (const pageContract of accountAuthPages) {
    const contents = await readRequiredRepoFile(pageContract.page, findings, "Account auth page is missing");
    requireSnippet(
      contents,
      pageContract.page,
      pageContract.expectedScript,
      findings,
      `Account auth page must load ${pageContract.expectedScript}.`,
    );
    requireSnippet(
      contents,
      pageContract.page,
      pageContract.formAttribute,
      findings,
      `Account auth page must expose ${pageContract.formAttribute}.`,
    );
    rejectPattern(
      contents,
      pageContract.page,
      /data-local-db-|local-db-page-data\.js|\/api\/auth|\/api\/session/i,
      findings,
      "Account auth page must not own Local DB hooks or direct API calls.",
    );
  }

  const authActions = await readRequiredRepoFile("assets/theme-v2/js/account-auth-actions.js", findings, "Account auth actions module is missing");
  requireSnippet(authActions, "assets/theme-v2/js/account-auth-actions.js", "./account-auth-service.js", findings, "Create/reset actions must use the shared account auth service module.");
  requireSnippet(authActions, "assets/theme-v2/js/account-auth-actions.js", "requestAccountAuth(endpoint", findings, "Create/reset actions must call requestAccountAuth through the service contract.");
  rejectPattern(authActions, "assets/theme-v2/js/account-auth-actions.js", /\bfetch\s*\(/, findings, "Create/reset actions must not call fetch directly.");

  const loginSession = await readRequiredRepoFile("assets/theme-v2/js/login-session.js", findings, "Login session module is missing");
  requireSnippet(loginSession, "assets/theme-v2/js/login-session.js", "./account-auth-service.js", findings, "Sign-in flow must use the shared account auth service module.");
  requireSnippet(loginSession, "assets/theme-v2/js/login-session.js", "requestAccountAuth(SIGN_IN_ACTION", findings, "Sign-in flow must call requestAccountAuth through the service contract.");
  requireSnippet(loginSession, "assets/theme-v2/js/login-session.js", "requestCurrentSession(", findings, "Sign-in flow must resolve sessions through requestCurrentSession.");
  rejectPattern(loginSession, "assets/theme-v2/js/login-session.js", /\bfetch\s*\(/, findings, "Sign-in flow must not call fetch directly.");

  const accountService = await readRequiredRepoFile("assets/theme-v2/js/account-auth-service.js", findings, "Account auth service module is missing");
  requireSnippet(accountService, "assets/theme-v2/js/account-auth-service.js", "fetch(`/api/auth/${path}`", findings, "Account auth service must own /api/auth requests.");
  requireSnippet(accountService, "assets/theme-v2/js/account-auth-service.js", "fetch(\"/api/session/current\"", findings, "Account auth service must own /api/session/current requests.");
  rejectPattern(accountService, "assets/theme-v2/js/account-auth-service.js", /local-db|SQLite|Supabase|provider|GAMEFOUNDRY_|process\.env/i, findings, "Account auth service must not expose provider or environment implementation details.");

  return findings;
}

async function validateProductServiceContract() {
  const findings = [];
  const registryClient = await readRequiredRepoFile("toolbox/tool-registry-api-client.js", findings, "Toolbox registry client is missing");
  requireSnippet(registryClient, "toolbox/tool-registry-api-client.js", "safeRequestServerApi(\"/toolbox/registry/snapshot\")", findings, "Toolbox registry must read through the server API service contract.");
  rejectPattern(registryClient, "toolbox/tool-registry-api-client.js", /local-db|SQLite|Supabase|GAMEFOUNDRY_|process\.env/i, findings, "Toolbox registry client must not expose provider/environment implementation details.");

  const votesClient = await readRequiredRepoFile("src/engine/api/toolbox-votes-api-client.js", findings, "Toolbox votes API client is missing");
  requireSnippet(votesClient, "src/engine/api/toolbox-votes-api-client.js", "safeRequestServerApi(\"/toolbox/votes/snapshot\")", findings, "Toolbox votes must read through the server API service contract.");
  requireSnippet(votesClient, "src/engine/api/toolbox-votes-api-client.js", "safeRequestServerApi(\"/toolbox/votes/cast\"", findings, "Toolbox votes must write through the server API service contract.");
  rejectPattern(votesClient, "src/engine/api/toolbox-votes-api-client.js", /local-db|SQLite|Supabase|GAMEFOUNDRY_|process\.env/i, findings, "Toolbox votes client must not expose provider/environment implementation details.");

  for (const filePath of productApiClientFiles) {
    const contents = await readRequiredRepoFile(filePath, findings, "Product API client is missing");
    requireSnippet(contents, filePath, "createServerRepositoryClient", findings, "Product API client must use the server repository contract.");
    requireSnippet(contents, filePath, "readServerToolConstants", findings, "Product API client must read server-owned constants.");
    rejectPattern(contents, filePath, /local-db|SQLite|Supabase|GAMEFOUNDRY_|process\.env/i, findings, "Product API client must not expose provider/environment implementation details.");
  }

  const router = await readRequiredRepoFile("src/dev-runtime/server/local-api-router.mjs", findings, "Local API router is missing");
  requireSnippet(router, "src/dev-runtime/server/local-api-router.mjs", "async toolRegistrySnapshotForRoute() {\n    this.supabaseDatabaseAdapter(\"Reading Toolbox registry\");", findings, "Toolbox registry route must require the configured server product-data adapter.");
  requireSnippet(router, "src/dev-runtime/server/local-api-router.mjs", "async toolboxVoteSnapshotForRoute() {\n    this.supabaseDatabaseAdapter(\"Reading Supabase Toolbox vote snapshot\");", findings, "Toolbox vote route must require the configured server product-data adapter.");
  requireSnippet(router, "src/dev-runtime/server/local-api-router.mjs", "async snapshotForRoute() {\n    const adapter = this.supabaseDatabaseAdapter(\"Reading Supabase product database state\");", findings, "DB snapshot route must read the configured server product-data adapter.");
  requireSnippet(router, "src/dev-runtime/server/local-api-router.mjs", "this.assertProductDatabaseProvider(`Creating ${toolId} repository`);", findings, "Repository creation must assert the server-owned product-data contract.");
  requireSnippet(router, "src/dev-runtime/server/local-api-router.mjs", "this.assertProductDatabaseProvider(`Calling repository method ${methodName}`);", findings, "Repository method calls must assert the server-owned product-data contract.");
  rejectPattern(router, "src/dev-runtime/server/local-api-router.mjs", /selectedDatabaseProviderId|selectedAuthProvider|selectedProvidersCanServeRuntime/, findings, "Runtime router must not contain active provider-selection helpers.");

  return findings;
}

function formatTechnicalDebt(records) {
  return records.map((record) =>
    `- \`${record.path}\` - ${record.reason} Follow-up: ${record.followUp}`
  ).join("\n");
}

const files = (await Promise.all(scanRoots.map(collectFiles))).flat();
const allMentions = [];
const accountFindings = [];
const findings = [];
const userFacingUiFindings = [];
for (const filePath of files) {
  const contents = await fs.readFile(filePath, "utf8");
  const result = scanFile(filePath, contents);
  allMentions.push(...result.mentions);
  accountFindings.push(...result.accountFindings);
  findings.push(...result.findings);
  userFacingUiFindings.push(...result.userFacingUiFindings);
}
const accountServiceContractFindings = await validateAccountServiceContract();
const productServiceContractFindings = await validateProductServiceContract();

const status = findings.length ||
  accountFindings.length ||
  userFacingUiFindings.length ||
  accountServiceContractFindings.length ||
  productServiceContractFindings.length
  ? "FAIL"
  : "PASS";
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
  "## Account Service Contract Findings",
  formatRecords(accountServiceContractFindings),
  "",
  "## Product Service Contract Findings",
  formatRecords(productServiceContractFindings),
  "",
  "## User-Facing Implementation Wording Findings",
  formatRecords(userFacingUiFindings),
  "",
  "## Deprecated SQLite/Local DB Technical Debt",
  formatTechnicalDebt(deprecatedLocalDbDebt),
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
      : accountServiceContractFindings.length
        ? "- FAIL - Account auth pages are not fully constrained to the shared account service contract."
        : productServiceContractFindings.length
          ? "- FAIL - Product data browser/API paths are not fully constrained to server service contracts."
          : userFacingUiFindings.length
            ? "- FAIL - User-facing Account/product UI contains implementation wording."
            : "- PASS - Browser/page code uses service contracts without deployment-label branching, account dependency leaks, product-data fallback, or user-facing implementation wording.",
  "",
].join("\n");

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, report);
console.log(`Wrote ${reportPath}`);
if (status === "FAIL") {
  process.exitCode = 1;
}
