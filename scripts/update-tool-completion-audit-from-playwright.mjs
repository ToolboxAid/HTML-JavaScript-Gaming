/*
Toolbox Aid
David Quesenberry
05/03/2026
update-tool-completion-audit-from-playwright.mjs
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const resultsPath = path.join(repoRoot, "tests", "results", "playwright-results.json");
const auditPath = path.join(repoRoot, "docs", "dev", "reports", "tool_completion_audit.md");
const validationReportPath = path.join(repoRoot, "docs", "dev", "reports", "tool_validation_results.md");

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeTextFile(filePath, text) {
  fs.writeFileSync(filePath, text);
}

function collectToolIdsFromAudit(auditText) {
  const toolMatches = [...auditText.matchAll(/###\s+([a-z0-9-]+-v2)\s*$/gm)];
  const toolIds = [];
  for (const match of toolMatches) {
    const toolId = match[1].trim();
    if (!toolIds.includes(toolId)) {
      toolIds.push(toolId);
    }
  }
  return toolIds;
}

function collectTestsFromPlaywrightSuite(suite, tests) {
  if (suite.specs && Array.isArray(suite.specs)) {
    for (const spec of suite.specs) {
      const specTitle = typeof spec.title === "string" ? spec.title : "";
      const titlePath = Array.isArray(spec.titlePath) ? spec.titlePath : [];
      if (!spec.tests || !Array.isArray(spec.tests)) {
        continue;
      }
      for (const test of spec.tests) {
        const resultStatus = Array.isArray(test.results)
          ? test.results.map((result) => result.status).find((status) => status && status !== "skipped")
          : null;
        tests.push({
          title: typeof test.title === "string" ? test.title : specTitle,
          fullTitle: [...titlePath, test.title || specTitle].filter(Boolean).join(" > "),
          status: resultStatus || (test.outcome === "expected" ? "passed" : "failed"),
          error: Array.isArray(test.results)
            ? test.results.map((result) => result.error && result.error.message).find(Boolean) || ""
            : ""
        });
      }
    }
  }
  if (suite.suites && Array.isArray(suite.suites)) {
    for (const childSuite of suite.suites) {
      collectTestsFromPlaywrightSuite(childSuite, tests);
    }
  }
}

function collectAllPlaywrightTests(playwrightJson) {
  const tests = [];
  if (playwrightJson.suites && Array.isArray(playwrightJson.suites)) {
    for (const suite of playwrightJson.suites) {
      collectTestsFromPlaywrightSuite(suite, tests);
    }
  }
  return tests;
}

function isGlobalPaletteStateTool(toolId) {
  return toolId === "palette-manager-v2";
}

function getToolStatusFromTests(toolId, tests) {
  if (isGlobalPaletteStateTool(toolId)) {
    const paletteContractTests = tests.filter((test) => test.fullTitle.includes("palette contract: palette-browser exists, swatches empty, one palette entry"));
    if (paletteContractTests.length === 0) {
      return {
        status: "FAIL",
        reason: "Global palette contract test was not found."
      };
    }
    const failedPaletteContractTest = paletteContractTests.find((test) => test.status !== "passed");
    if (failedPaletteContractTest) {
      const failureMessage = failedPaletteContractTest.error
        ? failedPaletteContractTest.error.replace(/\s+/g, " ").trim()
        : "Global palette contract test failed.";
      return {
        status: "FAIL",
        reason: `${failedPaletteContractTest.fullTitle}${failureMessage ? ` -> ${failureMessage}` : ""}`
      };
    }
    return {
      status: "PASS",
      reason: "Validated as global workspace palette state via tools.palette-browser.swatches; excluded from toolState-capable tool validation."
    };
  }
  const matchingTests = tests.filter((test) => test.fullTitle.includes(`@${toolId}`) || test.title.includes(`@${toolId}`));
  if (matchingTests.length === 0) {
    return {
      status: "FAIL",
      reason: "No Playwright tool-level tests found for this tool."
    };
  }
  const failedTests = matchingTests.filter((test) => test.status !== "passed");
  if (failedTests.length > 0) {
    const firstFailure = failedTests[0];
    const failureMessage = firstFailure.error ? firstFailure.error.replace(/\s+/g, " ").trim() : "Playwright reported a failing tool-level test.";
    return {
      status: "FAIL",
      reason: `${firstFailure.fullTitle}${failureMessage ? ` -> ${failureMessage}` : ""}`
    };
  }
  return {
    status: "PASS",
    reason: "All mapped Playwright tool-level tests passed."
  };
}

function updateToolSectionStatus(auditText, toolId, status, reason) {
  const sectionPattern = new RegExp(`(###\\s+${toolId}[\\s\\S]*?)(?=\\n###\\s+[a-z0-9-]+-v2\\s*$|\\s*$)`);
  const sectionMatch = auditText.match(sectionPattern);
  if (!sectionMatch) {
    return auditText;
  }
  const section = sectionMatch[1];
  const sectionLines = section.split(/\r?\n/);
  const headingLine = sectionLines[0];
  const remainingLines = sectionLines
    .slice(1)
    .filter((line) => !/^\s*-\s+\*\*Status:\*\*/.test(line))
    .filter((line) => !/^\s*-\s+Exact failure reason:/.test(line));
  const rebuiltLines = [
    headingLine,
    `- **Status:** ${status}`,
    `- Exact failure reason: ${reason}`,
    ...remainingLines
  ];
  const rebuiltSection = `${rebuiltLines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
  return auditText.replace(sectionPattern, rebuiltSection);
}

function buildValidationReport(toolIds, toolStatuses) {
  const lines = [];
  lines.push("# Tool Validation Results");
  lines.push("");
  lines.push("Derived from `tests/results/playwright-results.json` generated by `npm run test:workspace-v2`.");
  lines.push("`palette-manager-v2` is tracked as global workspace palette state (`tools.palette-browser.swatches`) and excluded from toolState-capable validation scope.");
  lines.push("");
  lines.push("| Tool | Scope | Status | Failing Reason |");
  lines.push("| --- | --- | --- | --- |");
  for (const toolId of toolIds) {
    const entry = toolStatuses[toolId];
    const reasonText = entry.status === "FAIL" ? entry.reason : "n/a";
    const scope = isGlobalPaletteStateTool(toolId) ? "Global Workspace Palette State" : "ToolState-capable Tool";
    lines.push(`| \`${toolId}\` | ${scope} | ${entry.status} | ${reasonText.replace(/\|/g, "\\|")} |`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function updateGateEvidenceLine(auditText, passedCount, failedCount) {
  const gateStatus = failedCount > 0 ? "FAIL" : "PASS";
  const gateLine = `- \`npm run test:workspace-v2\` -> ${gateStatus} (\`${passedCount} passed\`, \`${failedCount} failed\`).`;
  if (/^- `npm run test:workspace-v2` -> .*/m.test(auditText)) {
    return auditText.replace(/^- `npm run test:workspace-v2` -> .*/m, gateLine);
  }
  return auditText;
}

function main() {
  if (!fs.existsSync(resultsPath)) {
    const reportText = "# Tool Validation Results\n\nPlaywright results file is missing. Run `npm run test:workspace-v2` first.\n";
    writeTextFile(validationReportPath, reportText);
    console.error(`Missing Playwright results: ${resultsPath}`);
    process.exitCode = 1;
    return;
  }

  const playwrightJson = readJsonFile(resultsPath);
  const auditText = readTextFile(auditPath);
  const toolIds = collectToolIdsFromAudit(auditText);
  const tests = collectAllPlaywrightTests(playwrightJson);
  const passedCount = tests.filter((test) => test.status === "passed").length;
  const failedCount = tests.filter((test) => test.status !== "passed").length;
  const toolStatuses = {};

  let updatedAuditText = updateGateEvidenceLine(auditText, passedCount, failedCount);
  for (const toolId of toolIds) {
    toolStatuses[toolId] = getToolStatusFromTests(toolId, tests);
    updatedAuditText = updateToolSectionStatus(
      updatedAuditText,
      toolId,
      toolStatuses[toolId].status,
      toolStatuses[toolId].reason
    );
  }

  writeTextFile(auditPath, updatedAuditText);
  writeTextFile(validationReportPath, buildValidationReport(toolIds, toolStatuses));
  console.log(`Updated tool audit and validation report from Playwright results for ${toolIds.length} tools.`);
}

main();
