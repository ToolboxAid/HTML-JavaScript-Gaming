/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceStateBoundaryValidation.test.mjs
*/
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST,
  PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS,
  canProjectWorkspaceCreateSavedToolStateRecord,
  canProjectWorkspacePersistToolPayloadData,
  projectWorkspaceRecoveryTargetsToolState,
  validateProjectWorkspaceRuntimeContract,
} from "../../../src/shared/contracts/projectWorkspaceRuntimeContract.js";
import {
  validateToolStateContract,
} from "../../../src/shared/contracts/toolStateContract.js";

const scenariosPath = fileURLToPath(
  new URL("../fixtures/project-workspaces/projectworkspace-state-boundary-scenarios.json", import.meta.url)
);

const STATE_BOUNDARY_ERRORS = Object.freeze({
  TOOL_STATE_INVALID: "PROJECTWORKSPACE_STATE_TOOLSTATE_INVALID",
  PALETTE_CONTEXT_FIELD_INVALID: "PROJECTWORKSPACE_STATE_PALETTE_CONTEXT_FIELD_INVALID",
  TOOL_STATE_PAYLOAD_MISSING: "PROJECTWORKSPACE_STATE_TOOLSTATE_PAYLOAD_MISSING",
});

export function run() {
  const scenarios = JSON.parse(readFileSync(scenariosPath, "utf8"));

  assert.equal(canProjectWorkspacePersistToolPayloadData(), false);
  assert.equal(canProjectWorkspaceCreateSavedToolStateRecord(), false);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("localStorage"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("sessionStorage"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("hiddenWorkspaceState"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("fallbackData"), true);

  for (const scenario of scenarios.validStateBoundaries) {
    const result = validateProjectWorkspaceStateBoundary(scenario);
    assert.equal(result.status, "PASS", scenario.name);
    assert.equal(result.valid, true, scenario.name);
    assert.deepEqual(result.errors, [], scenario.name);
    assert.equal(result.ownership.projectWorkspace, "coordination-only", scenario.name);
    assert.equal(result.ownership.toolState, "saved-editing-source", scenario.name);
    assert.equal(result.ownership.palette, "active-context-reference-only", scenario.name);
  }

  for (const scenario of scenarios.invalidStateBoundaries) {
    const result = validateProjectWorkspaceStateBoundary(scenario);
    assert.equal(result.status, "REJECT", scenario.name);
    assert.equal(result.valid, false, scenario.name);
    assert.deepEqual(result.errors.map((item) => item.code), scenario.expectedErrorCodes, scenario.name);
  }
}

export function validateProjectWorkspaceStateBoundary(scenario) {
  const errors = [];
  const projectWorkspace = scenario?.projectWorkspace;
  const projectWorkspaceValidation = validateProjectWorkspaceRuntimeContract(projectWorkspace);

  for (const projectWorkspaceError of projectWorkspaceValidation.errors) {
    errors.push(projectWorkspaceError);
  }

  if (scenario?.toolState) {
    const toolStateValidation = validateToolStateContract(scenario.toolState);
    for (const toolStateError of toolStateValidation.errors) {
      errors.push(error(STATE_BOUNDARY_ERRORS.TOOL_STATE_INVALID, toolStateError.path));
    }

    if (!scenario.toolState.payload) {
      errors.push(error(STATE_BOUNDARY_ERRORS.TOOL_STATE_PAYLOAD_MISSING, "toolState.payload"));
    }
  }

  validatePaletteContextFields(projectWorkspace?.activePaletteContext, errors);

  if (errors.length > 0) {
    return Object.freeze({
      valid: false,
      status: "REJECT",
      ownership: ownershipSummary(),
      errors: Object.freeze(errors),
    });
  }

  assert.equal(projectWorkspaceRecoveryTargetsToolState(projectWorkspace), true);
  assert.equal(Object.hasOwn(projectWorkspace, "payload"), false);
  assert.equal(Object.hasOwn(projectWorkspace, "toolState"), false);
  assert.equal(Object.hasOwn(projectWorkspace, "workspaceState"), false);
  assert.equal(Object.hasOwn(projectWorkspace, "localStorage"), false);
  assert.equal(Object.hasOwn(projectWorkspace.activePaletteContext, "swatches"), false);
  assert.equal(Object.hasOwn(scenario.toolState, "payload"), true);

  return Object.freeze({
    valid: true,
    status: "PASS",
    ownership: ownershipSummary(),
    errors: Object.freeze([]),
  });
}

function validatePaletteContextFields(activePaletteContext, errors) {
  if (!activePaletteContext || typeof activePaletteContext !== "object" || Array.isArray(activePaletteContext)) {
    return;
  }

  const allowedFields = new Set(PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST);
  for (const fieldName of Object.keys(activePaletteContext)) {
    if (!allowedFields.has(fieldName)) {
      errors.push(error(STATE_BOUNDARY_ERRORS.PALETTE_CONTEXT_FIELD_INVALID, `activePaletteContext.${fieldName}`));
    }
  }
}

function ownershipSummary() {
  return Object.freeze({
    projectWorkspace: "coordination-only",
    toolState: "saved-editing-source",
    palette: "active-context-reference-only",
  });
}

function error(code, path) {
  return Object.freeze({ code, path });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
