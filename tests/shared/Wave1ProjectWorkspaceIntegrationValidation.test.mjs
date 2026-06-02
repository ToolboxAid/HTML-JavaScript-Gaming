/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave1ProjectWorkspaceIntegrationValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  validateProjectWorkspaceLaunchBoundary,
} from "./ProjectWorkspaceLaunchBoundaryValidation.test.mjs";
import {
  validateProjectWorkspaceLifecycleBoundary,
} from "./ProjectWorkspaceLifecycleValidation.test.mjs";
import {
  WAVE_1_TOOL_IDS,
  readScenarios,
} from "./Wave1ToolContractBaselineValidation.test.mjs";

export function run() {
  const scenarios = readScenarios();

  assert.deepEqual(scenarios.tools.map((tool) => tool.toolId), WAVE_1_TOOL_IDS);

  for (const scenario of scenarios.validLaunches) {
    const result = validateProjectWorkspaceLaunchBoundary(scenario.launch);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
    assert.equal(result.samplesDecision, "SKIP / pending rebuild", scenario.name);
  }

  for (const scenario of scenarios.invalidLaunches) {
    const result = validateProjectWorkspaceLaunchBoundary(scenario.launch);
    assert.equal(result.status, "REJECT", scenario.name);
    assert.deepEqual(result.errors.map((error) => error.code), scenario.expectedErrorCodes, scenario.name);
    assert.match(result.visibleMessage, /^REJECT ProjectWorkspace launch boundary:/, scenario.name);
  }

  for (const scenario of scenarios.lifecycleTransitions) {
    const result = validateProjectWorkspaceLifecycleBoundary(scenario.transition);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
    assert.equal(result.samplesDecision, "SKIP / pending rebuild", scenario.name);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
