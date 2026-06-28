import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const reportPath = path.join(repoRoot, "dev", "reports", "environment_agnostic_browser_gate_report.md");
const browserScanRoots = [
  "www/account",
  "www/admin",
  "www/assets/theme-v2/js",
  "www/toolbox",
  "src/engine",
];
const environmentScanRoots = [
  ...browserScanRoots,
  "api",
  "src",
  "dev/scripts",
  "dev/build/database",
];
const environmentScanFiles = [
  ".env.example",
  "package.json",
];
const allowedExtensions = new Set([".html", ".js", ".json", ".md", ".mjs", ".sql"]);
const excludedSegments = new Set([
  ".git",
  "archive",
  "node_modules",
  "tests",
  "tmp",
]);

const retiredFileDbToken = "SQL" + "ite";
const retiredDbConstructorToken = "Database" + "Sync";
const providerLeakPattern = new RegExp([
  "local-db",
  retiredFileDbToken,
  "Supabase",
  "GAMEFOUNDRY_",
  "process\\.env",
].join("|"), "i");
const routerRetiredStoragePattern = new RegExp([
  `node:${retiredFileDbToken}`,
  retiredDbConstructorToken,
  "createRequire",
  "GAMEFOUNDRY_AUTH_PROVIDER",
  "GAMEFOUNDRY_DB_PROVIDER",
  "parts\\[1\\] === \"local-db\"",
  "parts\\[1\\] === \"mock-db\"",
  "mock-db-state",
  "deprecatedDatabaseEndpointError",
].join("|"), "i");
const deploymentTermPattern = /\b(?:DEV|UAT|PROD|Prod|Production|production|Development|development)\b|process\.env|GAMEFOUNDRY_[A-Z0-9_]*(?:ENV|ENVIRONMENT|STAGE|PROVIDER|MODE)[A-Z0-9_]*/;
const deploymentBranchDecisionPattern = /^\s*(?:if|else\s+if|switch|while|for)\s*\([^)]*(?:GAMEFOUNDRY_(?:ENV|DEPLOYMENT_ENV|STAGE|MODE)|NODE_ENV|process\.env\.(?:GAMEFOUNDRY_ENV|GAMEFOUNDRY_DEPLOYMENT_ENV|NODE_ENV)|\.env\.(?:local|uat|prod)|deployment|environment|stage)[^)]*(?:DEV|UAT|PROD|dev|development|uat|prod|production)[^)]*\)/i;
const deploymentCasePattern = /^\s*case\s+["'`](?:dev|development|uat|prod|production)["'`]\s*:/i;
const deploymentTernaryDecisionPattern = /(?:GAMEFOUNDRY_(?:ENV|DEPLOYMENT_ENV|STAGE|MODE)|NODE_ENV|process\.env|deployment|environment|stage)[^?\r\n]*\?[^:\r\n]*(?:DEV|UAT|PROD|dev|development|uat|prod|production)/i;
const accountDependencyPattern = new RegExp(`\\b(?:Local(?: DB| API)?|${retiredFileDbToken}|Supabase|provider|localhost|DEV|UAT|PROD|Prod)\\b|data-local-db-|local-db-page-data\\.js`, "i");
const userFacingImplementationPattern = new RegExp(`\\b(?:DEV|UAT|PROD|Local DB|Local API|${retiredFileDbToken}|Supabase|provider)\\b`, "i");
const accountBrowserFiles = new Set([
  "www/assets/theme-v2/js/account-auth-actions.js",
  "www/assets/theme-v2/js/account-auth-service.js",
  "www/assets/theme-v2/js/account-page-data.js",
  "www/assets/theme-v2/js/login-session.js",
]);
const accountAuthPages = Object.freeze([
  Object.freeze({
    expectedScript: "../assets/theme-v2/js/login-session.js",
    formAttribute: "data-login-form",
    page: "www/account/sign-in.html",
  }),
  Object.freeze({
    expectedScript: "../assets/theme-v2/js/account-auth-actions.js",
    formAttribute: "data-account-auth-form=\"create-account\"",
    page: "www/account/create-account.html",
  }),
  Object.freeze({
    expectedScript: "../assets/theme-v2/js/account-auth-actions.js",
    formAttribute: "data-account-auth-form=\"password-reset\"",
    page: "www/account/password-reset.html",
  }),
]);
const productApiClientFiles = Object.freeze([
  "www/assets/js/shared/assets-api-client.js",
  "www/assets/toolbox/colors/js/index.js",
  "www/assets/js/shared/controls-api-client.js",
  "www/assets/toolbox/game-configuration/js/index.js",
  "www/assets/toolbox/game-design/js/index.js",
  "www/assets/js/shared/game-journey-api-client.js",
  "www/toolbox/game-hub/game-hub-api-client.js",
  "www/assets/toolbox/objects/js/index.js",
  "www/assets/toolbox/tags/js/index.js",
]);
const userFacingUiRoots = Object.freeze(["www/account", "www/toolbox"]);
const nonUiCompatibilityFiles = new Set([
  "www/toolbox/toolRegistry.js",
]);
const deprecatedLocalDbDebt = Object.freeze([]);

function repoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}

function isExcluded(absolutePath) {
  const normalizedPath = repoPath(absolutePath);
  if (normalizedPath.startsWith("dev/build/database/")) {
    return false;
  }
  return normalizedPath
    .split("/")
    .some((segment) => excludedSegments.has(segment));
}

function isValidationOrTestException(filePath) {
  const normalizedPath = repoPath(filePath);
  return normalizedPath.startsWith("dev/tests/") ||
    normalizedPath.startsWith("api/testing/") ||
    /^dev\/scripts\/validate-[^/]+\.mjs$/.test(normalizedPath) ||
    /^dev\/scripts\/cleanup-supabase-dev-auth-test-users\.mjs$/.test(normalizedPath) ||
    /^dev\/scripts\/sync-supabase-dev-creator-identities\.mjs$/.test(normalizedPath);
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

function isEnvironmentBranchLine(line) {
  return deploymentBranchDecisionPattern.test(line) ||
    deploymentCasePattern.test(line) ||
    deploymentTernaryDecisionPattern.test(line);
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

async function collectExplicitFiles(filePaths) {
  const files = [];
  for (const filePath of filePaths) {
    const absolutePath = path.join(repoRoot, filePath);
    const stat = await fs.stat(absolutePath).catch(() => null);
    if (stat?.isFile() && allowedExtensions.has(path.extname(filePath))) {
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
    if (deploymentTermPattern.test(line) && !isCommentOnly(line) && !isValidationOrTestException(filePath) && isEnvironmentBranchLine(line)) {
      findings.push({
        ...record,
        reason: "Deployment label appears on an active environment control-flow line.",
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

  const authActions = await readRequiredRepoFile("www/assets/theme-v2/js/account-auth-actions.js", findings, "Account auth actions module is missing");
  requireSnippet(authActions, "www/assets/theme-v2/js/account-auth-actions.js", "./account-auth-service.js", findings, "Create/reset actions must use the shared account auth service module.");
  requireSnippet(authActions, "www/assets/theme-v2/js/account-auth-actions.js", "requestAccountAuth(endpoint", findings, "Create/reset actions must call requestAccountAuth through the service contract.");
  rejectPattern(authActions, "www/assets/theme-v2/js/account-auth-actions.js", /\bfetch\s*\(/, findings, "Create/reset actions must not call fetch directly.");

  const loginSession = await readRequiredRepoFile("www/assets/theme-v2/js/login-session.js", findings, "Login session module is missing");
  requireSnippet(loginSession, "www/assets/theme-v2/js/login-session.js", "./account-auth-service.js", findings, "Sign-in flow must use the shared account auth service module.");
  requireSnippet(loginSession, "www/assets/theme-v2/js/login-session.js", "requestAccountAuth(SIGN_IN_ACTION", findings, "Sign-in flow must call requestAccountAuth through the service contract.");
  requireSnippet(loginSession, "www/assets/theme-v2/js/login-session.js", "requestCurrentSession(", findings, "Sign-in flow must resolve sessions through requestCurrentSession.");
  rejectPattern(loginSession, "www/assets/theme-v2/js/login-session.js", /\bfetch\s*\(/, findings, "Sign-in flow must not call fetch directly.");

  const accountService = await readRequiredRepoFile("www/assets/theme-v2/js/account-auth-service.js", findings, "Account auth service module is missing");
  requireSnippet(accountService, "www/assets/theme-v2/js/account-auth-service.js", "fetchServerApi(`/auth/${path}`", findings, "Account auth service must own configured /api/auth requests.");
  requireSnippet(accountService, "www/assets/theme-v2/js/account-auth-service.js", "fetchServerApi(\"/session/current\"", findings, "Account auth service must own configured /api/session/current requests.");
  rejectPattern(accountService, "www/assets/theme-v2/js/account-auth-service.js", providerLeakPattern, findings, "Account auth service must not expose provider or environment implementation details.");

  return findings;
}

async function validateProductServiceContract() {
  const findings = [];
  const registryClient = await readRequiredRepoFile("www/toolbox/tool-registry-api-client.js", findings, "Toolbox registry client is missing");
  requireSnippet(registryClient, "www/toolbox/tool-registry-api-client.js", "safeRequestServerApi(\"/toolbox/registry/snapshot\")", findings, "Toolbox registry must read through the server API service contract.");
  rejectPattern(registryClient, "www/toolbox/tool-registry-api-client.js", providerLeakPattern, findings, "Toolbox registry client must not expose provider/environment implementation details.");

  const votesClient = await readRequiredRepoFile("src/api/toolbox-votes-api-client.js", findings, "Toolbox votes API client is missing");
  requireSnippet(votesClient, "src/api/toolbox-votes-api-client.js", "safeRequestServerApi(\"/toolbox/votes/snapshot\")", findings, "Toolbox votes must read through the server API service contract.");
  requireSnippet(votesClient, "src/api/toolbox-votes-api-client.js", "safeRequestServerApi(\"/toolbox/votes/cast\"", findings, "Toolbox votes must write through the server API service contract.");
  rejectPattern(votesClient, "src/api/toolbox-votes-api-client.js", providerLeakPattern, findings, "Toolbox votes client must not expose provider/environment implementation details.");

  for (const filePath of productApiClientFiles) {
    const contents = await readRequiredRepoFile(filePath, findings, "Product API client is missing");
    requireSnippet(contents, filePath, "createServerRepositoryClient", findings, "Product API client must use the server repository contract.");
    requireSnippet(contents, filePath, "readServerToolConstants", findings, "Product API client must read server-owned constants.");
    rejectPattern(contents, filePath, providerLeakPattern, findings, "Product API client must not expose provider/environment implementation details.");
  }

  const router = await readRequiredRepoFile("api/server/local-api-router.mjs", findings, "Local API router is missing");
  requireSnippet(router, "api/server/local-api-router.mjs", "async toolRegistrySnapshotForRoute() {\n    this.supabaseDatabaseAdapter(\"Reading Toolbox registry\");", findings, "Toolbox registry route must require the configured server product-data adapter.");
  requireSnippet(router, "api/server/local-api-router.mjs", "async toolboxVoteSnapshotForRoute() {\n    this.supabaseDatabaseAdapter(\"Reading Supabase Toolbox vote snapshot\");", findings, "Toolbox vote route must require the configured server product-data adapter.");
  requireSnippet(router, "api/server/local-api-router.mjs", "async snapshotForRoute() {\n    const adapter = this.supabaseDatabaseAdapter(\"Reading Supabase product database state\");", findings, "DB snapshot route must read the configured server product-data adapter.");
  requireSnippet(router, "api/server/local-api-router.mjs", "if (parts[1] === \"product-data\" && request.method === \"GET\" && parts[2] === \"snapshot\")", findings, "Product data snapshots must use the service-contract route name.");
  requireSnippet(router, "api/server/local-api-router.mjs", "this.assertProductDatabaseProvider(`Creating ${toolId} repository`);", findings, "Repository creation must assert the server-owned product-data contract.");
  requireSnippet(router, "api/server/local-api-router.mjs", "this.assertProductDatabaseProvider(`Calling repository method ${methodName}`);", findings, "Repository method calls must assert the server-owned product-data contract.");
  rejectPattern(router, "api/server/local-api-router.mjs", /selectedDatabaseProviderId|selectedAuthProvider|selectedProvidersCanServeRuntime/, findings, "Runtime router must not contain active provider-selection helpers.");
  rejectPattern(router, "api/server/local-api-router.mjs", routerRetiredStoragePattern, findings, "Runtime router must not contain retired file-DB startup/opening code, provider-selection environment variables, or retired local-db/mock-db routes.");

  const startup = await readRequiredRepoFile("dev/scripts/start-local-api-server.mjs", findings, "Local API startup script is missing");
  rejectPattern(startup, "dev/scripts/start-local-api-server.mjs", /GAMEFOUNDRY_AUTH_PROVIDER|GAMEFOUNDRY_DB_PROVIDER|auth provider|product data provider|provider selection/i, findings, "Local API startup must describe configured connections without provider-selection environment variables.");

  return findings;
}

function formatTechnicalDebt(records) {
  if (!records.length) {
    return "- None";
  }
  return records.map((record) =>
    `- \`${record.path}\` - ${record.reason} Follow-up: ${record.followUp}`
  ).join("\n");
}

const collectedFiles = (await Promise.all(environmentScanRoots.map(collectFiles))).flat();
const explicitFiles = await collectExplicitFiles(environmentScanFiles);
const files = Array.from(new Set([...collectedFiles, ...explicitFiles])).sort();
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
  "# Environment-Agnostic Runtime Gate Report",
  "",
  `Status: ${status}`,
  "",
  "## Scope",
  `- Scanned active browser/page/server/runtime roots: ${environmentScanRoots.map((root) => `\`${root}\``).join(", ")}`,
  `- Scanned active runtime example files: ${environmentScanFiles.map((filePath) => `\`${filePath}\``).join(", ")}`,
  `- Files scanned: ${files.length}`,
  "- Excluded test/archive/report/temp roots: `.git`, `archive`, `node_modules`, `dev/tests`, `tmp`.",
  "- Active team/start governance is sourced from `dev/build/ProjectInstructions/`.",
  "- Tests and validation scripts are excluded only from deployment-label branching failures; their non-branching mentions may still appear for review.",
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
  "## Deprecated Local DB Technical Debt",
  formatTechnicalDebt(deprecatedLocalDbDebt),
  "",
  "## Non-Branching Deployment Mentions Reviewed",
  formatRecords(allMentions.filter((mention) =>
    !findings.some((finding) => finding.path === mention.path && finding.line === mention.line)
  )),
  "",
  "## Result",
  findings.length
    ? "- FAIL - Active app/server/DB code contains deployment-label branching that must be removed or moved behind server connection config."
    : accountFindings.length
      ? "- FAIL - Account page/browser code contains forbidden environment/provider dependency terms."
      : accountServiceContractFindings.length
        ? "- FAIL - Account auth pages are not fully constrained to the shared account service contract."
        : productServiceContractFindings.length
          ? "- FAIL - Product data browser/API paths are not fully constrained to server service contracts."
          : userFacingUiFindings.length
            ? "- FAIL - User-facing Account/product UI contains implementation wording."
            : "- PASS - Active app/server/DB code uses service contracts without deployment-label branching, account dependency leaks, product-data fallback, or user-facing implementation wording.",
  "",
].join("\n");

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, report);
console.log(`Wrote ${reportPath}`);
if (status === "FAIL") {
  process.exitCode = 1;
}
