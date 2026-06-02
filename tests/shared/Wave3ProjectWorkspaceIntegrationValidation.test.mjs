/*
Toolbox Aid
David Quesenberry
06/02/2026
Wave3ProjectWorkspaceIntegrationValidation.test.mjs
*/
import assert from "node:assert/strict";
import {
  validateProjectWorkspaceLaunchBoundary,
} from "./ProjectWorkspaceLaunchBoundaryValidation.test.mjs";
import {
  validateProjectWorkspaceLifecycleBoundary,
} from "./ProjectWorkspaceLifecycleValidation.test.mjs";
import {
  WAVE_3_TOOL_IDS,
  createLaunch,
  readScenarios,
} from "./Wave3ToolContractBaselineValidation.test.mjs";

export function run() {
  const scenarios = readScenarios();

  assert.deepEqual(scenarios.tools.map((tool) => tool.toolId), WAVE_3_TOOL_IDS);

  for (const toolId of WAVE_3_TOOL_IDS) {
    const result = validateProjectWorkspaceLaunchBoundary(createLaunch(toolId));
    assert.equal(result.status, "PASS", toolId);
    assert.equal(result.valid, true, toolId);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", toolId);
    assert.equal(result.samplesDecision, "SKIP / pending rebuild", toolId);
  }

  for (const scenario of scenarios.invalidLaunches) {
    const result = validateProjectWorkspaceLaunchBoundary(scenario.launch);
    assert.equal(result.status, "REJECT", scenario.name);
    assert.deepEqual(result.errors.map((error) => error.code), scenario.expectedErrorCodes, scenario.name);
    assert.match(result.visibleMessage, /^REJECT ProjectWorkspace launch boundary:/, scenario.name);
  }

  for (const toolId of WAVE_3_TOOL_IDS) {
    for (const transition of createLifecycleTransitions(toolId)) {
      const result = validateProjectWorkspaceLifecycleBoundary(transition);
      assert.equal(result.status, "PASS", `${toolId} ${transition.action}`);
      assert.equal(result.valid, true, `${toolId} ${transition.action}`);
      assert.equal(result.toolRuntimeValidation, "SKIP / future lane", `${toolId} ${transition.action}`);
      assert.equal(result.samplesDecision, "SKIP / pending rebuild", `${toolId} ${transition.action}`);
    }
  }
}

export function createLifecycleTransitions(toolId) {
  const activeToolStateId = `tool-state.wave3.${toolId}`;

  return Object.freeze([
    Object.freeze({
      action: "open",
      before: Object.freeze({
        activeProjectId: "project.wave3",
        flowState: "idle",
      }),
      after: Object.freeze({
        activeProjectId: "project.wave3",
        activeToolId: toolId,
        activeToolStateId,
        dirty: false,
        recoveryAvailable: false,
        flowState: "open",
      }),
    }),
    Object.freeze({
      action: "save",
      saveTargetToolStateId: activeToolStateId,
      before: Object.freeze({
        activeProjectId: "project.wave3",
        activeToolId: toolId,
        activeToolStateId,
        dirty: true,
        recoveryAvailable: false,
        flowState: "open",
      }),
      after: Object.freeze({
        activeProjectId: "project.wave3",
        activeToolId: toolId,
        activeToolStateId,
        dirty: false,
        recoveryAvailable: false,
        flowState: "open",
      }),
    }),
    Object.freeze({
      action: "close",
      before: Object.freeze({
        activeProjectId: "project.wave3",
        activeToolId: toolId,
        activeToolStateId,
        dirty: false,
        recoveryAvailable: false,
        flowState: "open",
      }),
      after: Object.freeze({
        dirty: false,
        recoveryAvailable: false,
        flowState: "idle",
      }),
    }),
  ]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
