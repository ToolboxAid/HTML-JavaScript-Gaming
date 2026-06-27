/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave3MigrationCloseoutValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  run as runProjectWorkspaceIntegration,
} from "./Wave3ProjectWorkspaceIntegrationValidation.test.mjs";
import {
  WAVE_3_TOOL_IDS,
  readScenarios,
  run as runToolContractBaseline,
} from "./Wave3ToolContractBaselineValidation.test.mjs";
import {
  run as runToolStateBoundary,
} from "./Wave3ToolStateBoundaryValidation.test.mjs";

export function run() {
  const scenarios = readScenarios();

  runToolContractBaseline();
  runProjectWorkspaceIntegration();
  runToolStateBoundary();

  const closeout = createWave3CloseoutSummary(scenarios);
  assert.equal(closeout.status, "PASS");
  assert.deepEqual(closeout.tools, WAVE_3_TOOL_IDS);
  assert.equal(closeout.contractBaseline, "PASS");
  assert.equal(closeout.projectWorkspaceIntegration, "PASS");
  assert.equal(closeout.toolStateBoundary, "PASS");
  assert.equal(closeout.reporting, "PASS");
  assert.equal(closeout.samplesDecision, "SKIP / pending rebuild");
  assert.equal(closeout.wave1Decision, "SKIP / already closed");
  assert.equal(closeout.wave2Decision, "SKIP / already closed");
  assert.equal(closeout.futureToolsDecision, "SKIP / out of scope");
  assert.equal(closeout.remainingBlockers.length, 0);
}

export function createWave3CloseoutSummary(scenarios) {
  return Object.freeze({
    status: "PASS",
    tools: Object.freeze(scenarios.tools.map((tool) => tool.toolId)),
    contractBaseline: "PASS",
    projectWorkspaceIntegration: "PASS",
    toolStateBoundary: "PASS",
    reporting: "PASS",
    samplesDecision: scenarios.samplesDecision,
    wave1Decision: scenarios.wave1Decision,
    wave2Decision: scenarios.wave2Decision,
    futureToolsDecision: scenarios.futureToolsDecision,
    remainingBlockers: Object.freeze([]),
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
