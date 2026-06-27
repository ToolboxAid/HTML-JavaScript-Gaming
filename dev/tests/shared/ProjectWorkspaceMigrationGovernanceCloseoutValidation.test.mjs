/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceMigrationGovernanceCloseoutValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  migratedProjectWorkspaceToolIds,
  readGovernanceScenarios,
  run as runComplianceValidation,
} from "./ProjectWorkspaceToolComplianceValidation.test.mjs";
import {
  run as runRegistrationValidation,
} from "./ProjectWorkspaceToolRegistrationValidation.test.mjs";

const reportNames = Object.freeze([
  "tool_migration_wave_audit.md",
  "projectworkspace_tool_compliance.md",
  "projectworkspace_tool_registration_validation.md",
  "projectworkspace_migration_summary.md",
  "projectworkspace_migration_closeout.md",
]);

export function run() {
  const scenarios = readGovernanceScenarios();

  runComplianceValidation();
  runRegistrationValidation();

  const summary = createMigrationGovernanceCloseoutSummary(scenarios);
  assert.equal(summary.status, "PASS");
  assert.equal(summary.migratedToolCount, 33);
  assert.deepEqual(summary.remainingUnmigratedToolIds, []);
  assert.equal(summary.samplesDecision, "SKIP / pending rebuild");
  assert.equal(summary.futureWorkBeginsWith, "sample rebuild planning");
  assert.equal(summary.runtimeImplementationDecision, "SKIP / future feature lane");

  for (const reportName of reportNames) {
    const report = readReport(reportName);
    assert.match(report, /Samples.*SKIP \/ pending rebuild/s, reportName);
    assert.match(report, /Playwright impacted: No/, reportName);
  }
}

export function createMigrationGovernanceCloseoutSummary(scenarios) {
  return Object.freeze({
    status: "PASS",
    migratedToolCount: migratedProjectWorkspaceToolIds(scenarios).length,
    remainingUnmigratedToolIds: Object.freeze(scenarios.remainingUnmigratedToolIds),
    samplesDecision: scenarios.samplesDecision,
    futureWorkBeginsWith: scenarios.futureWorkBeginsWith,
    runtimeImplementationDecision: scenarios.runtimeImplementationDecision,
  });
}

function readReport(reportName) {
  const reportPath = fileURLToPath(new URL(`../../reports/${reportName}`, import.meta.url));
  return readFileSync(reportPath, "utf8");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
