import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));

export const APPROVED_LEGACY_JS_PATHS = Object.freeze(new Set([
  "www/toolbox/game-hub/game-hub-api-client.js",
  "www/toolbox/game-hub/game-hub.js",
  "www/toolbox/messages/message-tts-service-registry.js",
  "www/toolbox/messages/messages-api-client.js",
  "www/toolbox/messages/messages.js",
  "www/toolbox/tool-registry-api-client.js",
  "www/toolbox/toolRegistry.js",
  "www/toolbox/tools-page-accordions.js",
  "src/engine/paletteList.js",
]));

export const APPROVED_LEGACY_CSS_PATHS = Object.freeze(new Set([
  "src/engine/ui/baseLayout.css",
  "src/engine/ui/hubCommon.css",
  "src/engine/ui/spriteEditor.css",
]));

export const APPROVED_LEGACY_TEST_SEGMENTS = Object.freeze(new Set([
  "ai",
  "assets",
  "audio",
  "combat",
  "config",
  "core",
  "dev-runtime",
  "engine",
  "entity",
  "events",
  "final",
  "fixtures",
  "fx",
  "games",
  "helpers",
  "index.html",
  "input",
  "persistence",
  "playwright",
  "playwright_installation.txt",
  "production",
  "README.md",
  "render",
  "replay",
  "run-tests.mjs",
  "runtime",
  "samples",
  "scenes",
  "schemas",
  "shared",
  "testRunner.html",
  "testRunner.js",
  "tools",
  "validation",
  "vector",
  "world",
]));

const canonicalTestPrefixes = Object.freeze([
  "dev/tests/toolbox/",
  "dev/tests/engine/",
  "dev/tests/api/",
  "dev/tests/server/",
  "dev/tests/js/shared/",
  "dev/tests/regression/",
]);

function normalizeRepoPath(filePath) {
  return String(filePath || "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}

function fileExtension(filePath) {
  return path.posix.extname(normalizeRepoPath(filePath)).toLowerCase();
}

function isJavaScript(filePath) {
  return [".js", ".mjs"].includes(fileExtension(filePath));
}

function isCss(filePath) {
  return fileExtension(filePath) === ".css";
}

function relevantPath(filePath) {
  return filePath.startsWith("www/assets/") ||
    filePath.startsWith("www/toolbox/") ||
    filePath.startsWith("src/engine/") ||
    filePath.startsWith("dev/tests/");
}

function record(severity, area, file, message, expected) {
  return Object.freeze({ area, expected, file, message, severity });
}

function isCanonicalAssetJs(filePath) {
  return /^www\/assets\/toolbox\/[^/]+\/js\/index\.js$/.test(filePath) ||
    /^www\/assets\/toolbox\/[^/]+\/js\/[^/]+-worker\.js$/.test(filePath) ||
    filePath.startsWith("www/assets/js/shared/") ||
    filePath.startsWith("www/assets/theme-v2/js/");
}

function isCanonicalAssetCss(filePath) {
  return /^www\/assets\/toolbox\/[^/]+\/css\/index\.css$/.test(filePath) ||
    filePath.startsWith("www/assets/theme-v2/css/") ||
    filePath.startsWith("www/assets/theme-v2/fonts/");
}

function auditJavaScript(filePath) {
  if (!isJavaScript(filePath)) {
    return null;
  }
  if (filePath.startsWith("www/assets/") && !isCanonicalAssetJs(filePath)) {
    return record(
      "FAIL",
      "JS",
      filePath,
      "JavaScript under www/assets must use www/assets/toolbox/{tool}/js/index.js, www/assets/toolbox/{tool}/js/{worker-name}.js for tool-local workers, www/assets/js/shared/, or www/assets/theme-v2/js/.",
      "www/assets/toolbox/{tool}/js/index.js, www/assets/toolbox/{tool}/js/{worker-name}.js, or www/assets/js/shared/",
    );
  }
  if (filePath.startsWith("www/toolbox/")) {
    if (APPROVED_LEGACY_JS_PATHS.has(filePath)) {
      return record(
        "LEGACY",
        "JS",
        filePath,
        "Approved legacy toolbox JavaScript sidecar awaiting canonical migration.",
        "www/assets/toolbox/{tool}/js/index.js, www/assets/toolbox/{tool}/js/{worker-name}.js, or www/assets/js/shared/",
      );
    }
    return record(
      "FAIL",
      "JS",
      filePath,
      "New or unapproved toolbox JavaScript sidecar is outside canonical structure.",
      "www/assets/toolbox/{tool}/js/index.js or www/assets/js/shared/",
    );
  }
  if (/^src\/engine\/[^/]+\.m?js$/.test(filePath)) {
    if (APPROVED_LEGACY_JS_PATHS.has(filePath)) {
      return record(
        "LEGACY",
        "JS",
        filePath,
        "Approved legacy root-level engine JavaScript awaiting feature-folder migration.",
        "src/engine/{feature-name}/",
      );
    }
    return record(
      "FAIL",
      "JS",
      filePath,
      "Root-level engine JavaScript is outside src/engine/{feature-name}/.",
      "src/engine/{feature-name}/",
    );
  }
  return null;
}

function auditCss(filePath) {
  if (!isCss(filePath)) {
    return null;
  }
  if (filePath.startsWith("www/assets/") && !isCanonicalAssetCss(filePath)) {
    return record(
      "FAIL",
      "CSS",
      filePath,
      "CSS under www/assets must use www/assets/toolbox/{tool}/css/index.css or www/assets/theme-v2/css/.",
      "www/assets/toolbox/{tool}/css/index.css or www/assets/theme-v2/css/",
    );
  }
  if (filePath.startsWith("www/toolbox/")) {
    return record(
      "FAIL",
      "CSS",
      filePath,
      "Toolbox CSS sidecar is outside canonical tool asset structure.",
      "www/assets/toolbox/{tool}/css/index.css",
    );
  }
  if (filePath.startsWith("src/engine/") && APPROVED_LEGACY_CSS_PATHS.has(filePath)) {
    return record(
      "LEGACY",
      "CSS",
      filePath,
      "Approved legacy engine UI CSS awaiting asset/theme placement decision.",
      "assets/theme-v2/css/ or approved engine UI style policy",
    );
  }
  if (filePath.startsWith("src/engine/")) {
    return record(
      "FAIL",
      "CSS",
      filePath,
      "Engine CSS is outside canonical asset/theme roots.",
      "assets/theme-v2/css/ or approved engine UI style policy",
    );
  }
  return null;
}

function auditTestPath(filePath) {
  if (!filePath.startsWith("dev/tests/")) {
    return null;
  }
  if (canonicalTestPrefixes.some((prefix) => filePath.startsWith(prefix))) {
    return null;
  }
  const segment = filePath.slice("dev/tests/".length).split("/")[0] || "";
  if (segment === "results") {
    return record(
      "FAIL",
      "Tests",
      filePath,
      "Generated test result artifacts must not be tracked under active dev/tests/results/.",
      "ignored dev/workspace/test-results/ or dev/reports/",
    );
  }
  if (APPROVED_LEGACY_TEST_SEGMENTS.has(segment)) {
    return record(
      "LEGACY",
      "Tests",
      filePath,
      "Approved legacy test location awaiting canonical test structure migration.",
      "dev/tests/toolbox/, dev/tests/engine/, dev/tests/api/, dev/tests/server/, dev/tests/js/shared/, or dev/tests/regression/",
    );
  }
  return record(
    "FAIL",
    "Tests",
    filePath,
    "New or unapproved test location is outside canonical test roots.",
    "dev/tests/toolbox/, dev/tests/engine/, dev/tests/api/, dev/tests/server/, dev/tests/js/shared/, or dev/tests/regression/",
  );
}

export function auditCanonicalRepositoryStructure(files) {
  const findings = [];
  const legacy = [];
  [...new Set(files.map(normalizeRepoPath).filter(Boolean))]
    .filter(relevantPath)
    .sort((left, right) => left.localeCompare(right))
    .forEach((filePath) => {
      const records = [
        auditJavaScript(filePath),
        auditCss(filePath),
        auditTestPath(filePath),
      ].filter(Boolean);
      records.forEach((entry) => {
        if (entry.severity === "FAIL") {
          findings.push(entry);
        } else {
          legacy.push(entry);
        }
      });
    });

  return Object.freeze({
    findings,
    legacy,
    status: findings.length === 0 ? "PASS" : "FAIL",
  });
}

async function walkFiles(root) {
  const results = [];
  async function visit(absolutePath) {
    let entries = [];
    try {
      entries = await fs.readdir(absolutePath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if ([".git", "node_modules", "tmp"].includes(entry.name)) {
        continue;
      }
      const child = path.join(absolutePath, entry.name);
      if (entry.isDirectory()) {
        await visit(child);
      } else if (entry.isFile()) {
        results.push(path.relative(root, child).replace(/\\/g, "/"));
      }
    }
  }
  await visit(root);
  return results;
}

export async function collectRepositoryFiles(root = repoRoot) {
  const result = spawnSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });
  if (result.status === 0 && result.stdout.trim()) {
    return result.stdout.split(/\r?\n/).map(normalizeRepoPath).filter(Boolean);
  }
  return walkFiles(root);
}

function markdownRows(records) {
  if (!records.length) {
    return ["| none | none | PASS | none |"];
  }
  return records.map((entry) =>
    `| ${entry.area} | \`${entry.file}\` | ${entry.severity} | ${entry.message} Expected: \`${entry.expected}\`. |`
  );
}

export function formatCanonicalStructureReport(result) {
  return [
    "# Canonical Repository Structure Guardrail",
    "",
    `Status: ${result.status}`,
    "",
    "## Blocking Violations",
    "",
    "| Area | File | Severity | Details |",
    "| --- | --- | --- | --- |",
    ...markdownRows(result.findings),
    "",
    "## Approved Legacy Exceptions",
    "",
    "| Area | File | Severity | Details |",
    "| --- | --- | --- | --- |",
    ...markdownRows(result.legacy),
    "",
    "## Result",
    "",
    result.status === "PASS"
      ? "- PASS - No unapproved JS, CSS, or test structure violations were found."
      : "- FAIL - Unapproved JS, CSS, or test structure violations were found.",
    "",
  ].join("\n");
}

function parseArgs(argv) {
  const options = { reportPath: "", root: repoRoot };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--report") {
      options.reportPath = argv[index + 1] || "";
      index += 1;
    } else if (argument.startsWith("--report=")) {
      options.reportPath = argument.slice("--report=".length);
    } else if (argument === "--root") {
      options.root = path.resolve(argv[index + 1] || repoRoot);
      index += 1;
    } else if (argument.startsWith("--root=")) {
      options.root = path.resolve(argument.slice("--root=".length));
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = await collectRepositoryFiles(options.root);
  const result = auditCanonicalRepositoryStructure(files);
  const report = formatCanonicalStructureReport(result);
  if (options.reportPath) {
    const absoluteReportPath = path.resolve(options.root, options.reportPath);
    await fs.mkdir(path.dirname(absoluteReportPath), { recursive: true });
    await fs.writeFile(absoluteReportPath, report, "utf8");
  }
  console.log(`Canonical repository structure guardrail: ${result.status}`);
  console.log(`Blocking violations: ${result.findings.length}`);
  console.log(`Approved legacy exceptions: ${result.legacy.length}`);
  if (result.findings.length > 0) {
    console.error(report);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  });
}
