/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceLaunchBoundaryValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  validateProjectWorkspaceRuntimeContract,
} from "../../src/shared/contracts/projectWorkspaceRuntimeContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-launch-boundary-scenarios.json", import.meta.url)
);

const VISIBLE_REJECT_PREFIX = "REJECT ProjectWorkspace launch boundary:";

const LAUNCH_BOUNDARY_ERRORS = Object.freeze({
  PROJECT_WORKSPACE_REQUIRED: "PROJECTWORKSPACE_LAUNCH_PROJECTWORKSPACE_REQUIRED",
  SELECTED_TOOL_REQUIRED: "PROJECTWORKSPACE_LAUNCH_SELECTED_TOOL_REQUIRED",
  TOOL_MISMATCH: "PROJECTWORKSPACE_LAUNCH_TOOL_MISMATCH",
  MANIFEST_INPUT_REQUIRED: "PROJECTWORKSPACE_LAUNCH_MANIFEST_INPUT_REQUIRED",
  MANIFEST_PROJECT_MISMATCH: "PROJECTWORKSPACE_LAUNCH_MANIFEST_PROJECT_MISMATCH",
  TOOLSTATE_INPUT_REQUIRED: "PROJECTWORKSPACE_LAUNCH_TOOLSTATE_INPUT_REQUIRED",
  TOOLSTATE_MISMATCH: "PROJECTWORKSPACE_LAUNCH_TOOLSTATE_MISMATCH",
  TOOLSTATE_PROJECT_MISMATCH: "PROJECTWORKSPACE_LAUNCH_TOOLSTATE_PROJECT_MISMATCH",
  FORBIDDEN_FIELD: "PROJECTWORKSPACE_LAUNCH_FORBIDDEN_FIELD",
});

const FORBIDDEN_LAUNCH_FIELDS = Object.freeze([
  "toolRuntime",
  "runtimeState",
  "renderState",
  "renderPayload",
  "fallbackData",
  "sampleJson",
  "localStorage",
  "sessionStorage",
  "payloadJson",
  "toolPayload",
]);

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  for (const scenario of scenarios.validLaunches) {
    const result = validateProjectWorkspaceLaunchBoundary(scenario.launch);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.equal(result.visibleMessage, "", scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
    assert.equal(result.samplesDecision, "SKIP / pending rebuild", scenario.name);
  }

  for (const scenario of scenarios.invalidLaunches) {
    const result = validateProjectWorkspaceLaunchBoundary(scenario.launch);
    assert.equal(result.status, "REJECT", scenario.name);
    assert.equal(result.valid, false, scenario.name);
    assert.ok(result.visibleMessage.startsWith(VISIBLE_REJECT_PREFIX), scenario.name);
    assert.deepEqual(result.errors.map((error) => error.code), scenario.expectedErrorCodes, scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
  }

  for (const scenario of scenarios.skippedLaunches) {
    const result = validateProjectWorkspaceLaunchBoundary(scenario.launch);
    assert.equal(result.status, "SKIP", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.equal(result.reason, "unmigrated tool runtime is out of scope", scenario.name);
    assert.equal(result.toolRuntimeValidation, "SKIP / future lane", scenario.name);
  }
}

export function validateProjectWorkspaceLaunchBoundary(launch) {
  if (launch?.migrationStatus === "not-migrated") {
    return Object.freeze({
      valid: true,
      status: "SKIP",
      reason: "unmigrated tool runtime is out of scope",
      toolRuntimeValidation: "SKIP / future lane",
      samplesDecision: "SKIP / pending rebuild",
      visibleMessage: "",
      errors: Object.freeze([]),
    });
  }

  const errors = [];

  if (!isPlainObject(launch)) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.PROJECT_WORKSPACE_REQUIRED, "launch"));
    return reject(errors);
  }

  collectForbiddenFieldErrors(launch, "launch", errors);
  collectForbiddenFieldErrors(launch.manifestInput, "manifestInput", errors);
  collectForbiddenFieldErrors(launch.toolStateInput, "toolStateInput", errors);

  if (!isPlainObject(launch.projectWorkspace)) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.PROJECT_WORKSPACE_REQUIRED, "projectWorkspace"));
  } else {
    const projectWorkspaceValidation = validateProjectWorkspaceRuntimeContract(launch.projectWorkspace);
    for (const projectWorkspaceError of projectWorkspaceValidation.errors) {
      errors.push(projectWorkspaceError);
    }
  }

  if (!hasNonEmptyString(launch.selectedToolId)) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.SELECTED_TOOL_REQUIRED, "selectedToolId"));
  } else if (hasNonEmptyString(launch.projectWorkspace?.activeToolId) && launch.selectedToolId !== launch.projectWorkspace.activeToolId) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.TOOL_MISMATCH, "selectedToolId"));
  }

  validateManifestInput(launch.manifestInput, launch.projectWorkspace?.activeProjectId, errors);
  validateToolStateInput(launch.toolStateInput, launch.projectWorkspace, errors);

  if (errors.length > 0) {
    return reject(errors);
  }

  return Object.freeze({
    valid: true,
    status: "PASS",
    reason: "ProjectWorkspace launch inputs are explicit and contract scoped.",
    toolRuntimeValidation: "SKIP / future lane",
    samplesDecision: "SKIP / pending rebuild",
    visibleMessage: "",
    errors: Object.freeze([]),
  });
}

function validateManifestInput(manifestInput, activeProjectId, errors) {
  if (!isPlainObject(manifestInput) || !hasNonEmptyString(manifestInput.manifestId)) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.MANIFEST_INPUT_REQUIRED, "manifestInput.manifestId"));
    return;
  }

  if (!hasNonEmptyString(manifestInput.projectId) || manifestInput.projectId !== activeProjectId) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.MANIFEST_PROJECT_MISMATCH, "manifestInput.projectId"));
  }
}

function validateToolStateInput(toolStateInput, projectWorkspace, errors) {
  if (!isPlainObject(toolStateInput) || !hasNonEmptyString(toolStateInput.toolStateId)) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.TOOLSTATE_INPUT_REQUIRED, "toolStateInput.toolStateId"));
    return;
  }

  if (hasNonEmptyString(projectWorkspace?.activeToolStateId) && toolStateInput.toolStateId !== projectWorkspace.activeToolStateId) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.TOOLSTATE_MISMATCH, "toolStateInput.toolStateId"));
  }

  if (!hasNonEmptyString(toolStateInput.projectId) || toolStateInput.projectId !== projectWorkspace?.activeProjectId) {
    errors.push(error(LAUNCH_BOUNDARY_ERRORS.TOOLSTATE_PROJECT_MISMATCH, "toolStateInput.projectId"));
  }
}

function collectForbiddenFieldErrors(record, pathPrefix, errors) {
  if (!isPlainObject(record)) {
    return;
  }

  for (const fieldName of FORBIDDEN_LAUNCH_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(error(LAUNCH_BOUNDARY_ERRORS.FORBIDDEN_FIELD, `${pathPrefix}.${fieldName}`));
    }
  }
}

function reject(errors) {
  return Object.freeze({
    valid: false,
    status: "REJECT",
    reason: "invalid ProjectWorkspace launch input",
    toolRuntimeValidation: "SKIP / future lane",
    samplesDecision: "SKIP / pending rebuild",
    visibleMessage: `${VISIBLE_REJECT_PREFIX} ${errors.map((item) => item.code).join(", ")}`,
    errors: Object.freeze(errors),
  });
}

function error(code, path) {
  return Object.freeze({ code, path });
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
