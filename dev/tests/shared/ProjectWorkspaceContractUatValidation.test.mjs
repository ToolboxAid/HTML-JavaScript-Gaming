/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceContractUatValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  validateProjectWorkspaceLaunchBoundary,
} from "./ProjectWorkspaceLaunchBoundaryValidation.test.mjs";
import {
  validateProjectWorkspaceLifecycleBoundary,
} from "./ProjectWorkspaceLifecycleValidation.test.mjs";
import {
  validateProjectWorkspaceManifestHandoffBoundary,
} from "./ProjectWorkspaceManifestHandoffBoundaryValidation.test.mjs";
import {
  validateProjectWorkspaceStateBoundary,
} from "./ProjectWorkspaceStateBoundaryValidation.test.mjs";

const launchScenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-launch-boundary-scenarios.json", import.meta.url)
);
const manifestHandoffScenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-manifest-handoff-boundary-scenarios.json", import.meta.url)
);
const stateScenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-state-boundary-scenarios.json", import.meta.url)
);
const lifecycleScenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-lifecycle-scenarios.json", import.meta.url)
);

export function run() {
  const summary = validateProjectWorkspaceContractUat();

  assert.equal(summary.status, "PASS");
  assert.equal(summary.projectWorkspaceContract, "PASS");
  assert.equal(summary.launchBoundary, "PASS");
  assert.equal(summary.manifestHandoffBoundary, "PASS");
  assert.equal(summary.toolStateBoundary, "PASS");
  assert.equal(summary.paletteBoundary, "PASS");
  assert.equal(summary.lifecycleBoundary, "PASS");
  assert.equal(summary.toolRuntimeValidation, "SKIP / future lane");
  assert.equal(summary.unmigratedTools, "SKIP / not migrated / out of scope");
  assert.equal(summary.samplesDecision, "SKIP / pending rebuild");
}

export function validateProjectWorkspaceContractUat() {
  const launchScenarios = readJson(launchScenariosPath);
  const manifestHandoffScenarios = readJson(manifestHandoffScenariosPath);
  const stateScenarios = readJson(stateScenariosPath);
  const lifecycleScenarios = readJson(lifecycleScenariosPath);

  for (const scenario of launchScenarios.validLaunches) {
    assert.equal(validateProjectWorkspaceLaunchBoundary(scenario.launch).status, "PASS", scenario.name);
  }
  for (const scenario of launchScenarios.invalidLaunches) {
    assert.equal(validateProjectWorkspaceLaunchBoundary(scenario.launch).status, "REJECT", scenario.name);
  }
  for (const scenario of launchScenarios.skippedLaunches) {
    assert.equal(validateProjectWorkspaceLaunchBoundary(scenario.launch).status, "SKIP", scenario.name);
  }

  for (const scenario of manifestHandoffScenarios.validHandoffs) {
    assert.equal(validateProjectWorkspaceManifestHandoffBoundary(scenario.handoff).status, "PASS", scenario.name);
  }
  for (const scenario of manifestHandoffScenarios.invalidHandoffs) {
    assert.equal(validateProjectWorkspaceManifestHandoffBoundary(scenario.handoff).status, "REJECT", scenario.name);
  }

  for (const scenario of stateScenarios.validStateBoundaries) {
    const result = validateProjectWorkspaceStateBoundary(scenario);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.ownership.toolState, "saved-editing-source", scenario.name);
    assert.equal(result.ownership.palette, "active-context-reference-only", scenario.name);
  }
  for (const scenario of stateScenarios.invalidStateBoundaries) {
    assert.equal(validateProjectWorkspaceStateBoundary(scenario).status, "REJECT", scenario.name);
  }

  for (const scenario of lifecycleScenarios.validLifecycleTransitions) {
    assert.equal(validateProjectWorkspaceLifecycleBoundary(scenario.transition).status, "PASS", scenario.name);
  }
  for (const scenario of lifecycleScenarios.invalidLifecycleTransitions) {
    assert.equal(validateProjectWorkspaceLifecycleBoundary(scenario.transition).status, "REJECT", scenario.name);
  }

  return Object.freeze({
    status: "PASS",
    projectWorkspaceContract: "PASS",
    launchBoundary: "PASS",
    manifestHandoffBoundary: "PASS",
    toolStateBoundary: "PASS",
    paletteBoundary: "PASS",
    lifecycleBoundary: "PASS",
    toolRuntimeValidation: "SKIP / future lane",
    unmigratedTools: "SKIP / not migrated / out of scope",
    samplesDecision: "SKIP / pending rebuild",
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
