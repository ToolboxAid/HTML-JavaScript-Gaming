/*
Toolbox Aid
David Quesenberry
06/02/2026
ProjectWorkspaceRuntimeContract.test.mjs
*/
import assert from "node:assert/strict";
import {
  PROJECT_CONTRACT_ID,
  PROJECT_TYPES,
  validateProjectContract,
} from "../../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_CONTRACT_ID,
  TOOL_STATE_SLOTS,
  validateToolStateContract,
  validateToolStateRecoveryContract,
} from "../../../src/shared/contracts/toolStateContract.js";
import {
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS,
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST,
  PROJECT_WORKSPACE_DATA_OWNERSHIP,
  PROJECT_WORKSPACE_RUNTIME_CONTRACT_ID,
  PROJECT_WORKSPACE_RUNTIME_CONTRACT_VERSION,
  PROJECT_WORKSPACE_RUNTIME_ERRORS,
  PROJECT_WORKSPACE_RUNTIME_FIELD_LIST,
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES,
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATE_LIST,
  PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS,
  PROJECT_WORKSPACE_RUNTIME_RULES,
  PROJECT_WORKSPACE_SAVED_EDITING_SOURCE,
  canProjectWorkspaceCreateSavedToolStateRecord,
  canProjectWorkspacePersistToolPayloadData,
  getProjectWorkspaceRuntimeReferences,
  isProjectWorkspaceRuntimeFlowState,
  isProjectWorkspaceRuntimeReference,
  isToolStateSavedEditingSource,
  projectWorkspaceRecoveryTargetsToolState,
  validateProjectWorkspaceRuntimeContract,
} from "../../../src/shared/contracts/projectWorkspaceRuntimeContract.js";

export function run() {
  assert.equal(PROJECT_WORKSPACE_RUNTIME_CONTRACT_ID, "gamefoundrystudio.project-workspace.runtime-only");
  assert.equal(PROJECT_WORKSPACE_RUNTIME_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(PROJECT_WORKSPACE_RUNTIME_FIELD_LIST, [
    "activeProjectId",
    "activeToolId",
    "activeToolStateId",
    "dirty",
    "recoveryAvailable",
    "recoveryToolStateId",
    "activePaletteContext",
    "flowState",
  ]);
  assert.deepEqual(PROJECT_WORKSPACE_RUNTIME_FLOW_STATE_LIST, ["idle", "opening", "open", "closing", "saving"]);
  assert.deepEqual(PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST, [
    "paletteId",
    "sourceToolId",
    "sourceToolStateId",
    "version",
  ]);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.RUNTIME_ONLY, true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.DOES_NOT_PERSIST_TOOL_PAYLOADS, true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.DOES_NOT_OWN_SAVED_TOOL_STATE, true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.DOES_NOT_DUPLICATE_PROJECT_STORAGE, true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.DOES_NOT_DUPLICATE_TOOL_STATE_STORAGE, true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.RECOVERY_POINTS_TO_TOOL_STATE, true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_RULES.ACTIVE_WORKING_CONTEXT_FOR_PROJECT, true);
  assert.equal(PROJECT_WORKSPACE_DATA_OWNERSHIP.PROJECT, "persisted-db-container");
  assert.equal(PROJECT_WORKSPACE_DATA_OWNERSHIP.PROJECT_WORKSPACE, "runtime-working-context-for-project");
  assert.equal(PROJECT_WORKSPACE_DATA_OWNERSHIP.TOOL_STATE, "persisted-db-record-for-one-tool");
  assert.equal(PROJECT_WORKSPACE_DATA_OWNERSHIP.MANIFEST, "portable-export-import-format");
  assert.equal(PROJECT_WORKSPACE_SAVED_EDITING_SOURCE, "tool-state");
  assert.equal(TOOL_STATE_CONTRACT_ID, "gamefoundrystudio.tool-state.lifecycle");
  assert.equal(PROJECT_CONTRACT_ID, "gamefoundrystudio.project.lifecycle");
  assert.equal(TOOL_STATE_SLOTS.CURRENT_SAVED_STATE, "current-saved-state");

  assert.equal(isProjectWorkspaceRuntimeFlowState(PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.OPEN), true);
  assert.equal(isProjectWorkspaceRuntimeFlowState("persisting"), false);
  assert.equal(isProjectWorkspaceRuntimeReference("project.alpha"), true);
  assert.equal(isProjectWorkspaceRuntimeReference(""), false);
  assert.equal(isProjectWorkspaceRuntimeReference(undefined), true);
  assert.equal(canProjectWorkspacePersistToolPayloadData(), false);
  assert.equal(canProjectWorkspaceCreateSavedToolStateRecord(), false);
  assert.equal(isToolStateSavedEditingSource(PROJECT_WORKSPACE_SAVED_EDITING_SOURCE), true);
  assert.equal(isToolStateSavedEditingSource("project-workspace"), false);

  const project = {
    id: "project.alpha",
    ownerId: "user.owner",
    projectType: PROJECT_TYPES.GAME,
    visibility: "project",
    state: "active",
    relationships: ["tool-states", "game-manifest"],
  };
  const savedToolState = {
    toolStateId: "tool-state.palette.alpha",
    toolType: "palette-manager-v2",
    ownerId: "user.owner",
    projectId: "project.alpha",
    visibility: "project",
    version: 1,
    status: "active",
    payload: {
      swatches: [{ hex: "#ffffff" }],
    },
  };
  const recoveryState = {
    toolStateId: "tool-state.palette.alpha",
    toolType: "palette-manager-v2",
    ownerId: "user.owner",
    projectId: "project.alpha",
    visibility: "project",
    version: 2,
    status: "active",
    timestamp: "2026-06-02T13:30:00.000Z",
    payload: {
      swatches: [{ hex: "#00ff99" }],
    },
  };
  const projectWorkspace = {
    activeProjectId: "project.alpha",
    activeToolId: "palette-manager-v2",
    activeToolStateId: "tool-state.palette.alpha",
    dirty: true,
    recoveryAvailable: true,
    recoveryToolStateId: "tool-state.palette.alpha",
    activePaletteContext: {
      paletteId: "palette.hud",
      sourceToolId: "palette-manager-v2",
      sourceToolStateId: "tool-state.palette.alpha",
      version: 1,
    },
    flowState: PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.OPEN,
  };

  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateToolStateContract(savedToolState).valid, true);
  assert.equal(validateToolStateRecoveryContract({
    savedState: savedToolState,
    recoveryState,
  }).valid, true);

  const validation = validateProjectWorkspaceRuntimeContract(projectWorkspace);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(getProjectWorkspaceRuntimeReferences(projectWorkspace), {
    activeProjectId: "project.alpha",
    activeToolId: "palette-manager-v2",
    activeToolStateId: "tool-state.palette.alpha",
    recoveryToolStateId: "tool-state.palette.alpha",
  });
  assert.equal(projectWorkspaceRecoveryTargetsToolState(projectWorkspace), true);
  assert.equal(projectWorkspace.activePaletteContext[PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_STATE_ID], "tool-state.palette.alpha");
  assert.equal(Object.hasOwn(projectWorkspace, "payload"), false);
  assert.equal(Object.hasOwn(projectWorkspace, "savedToolStates"), false);
  assert.equal(savedToolState.payload.swatches[0].hex, "#ffffff");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    payload: { swatches: [] },
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace cannot persist tool payload data");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    savedToolStates: [savedToolState],
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace cannot create saved tool state records");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    toolStates: [savedToolState],
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace cannot duplicate tool state storage");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    project: { ...project },
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace cannot duplicate project storage");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    manifest: { tools: {} },
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace cannot own manifest export data");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    recoveryToolStateId: "",
  }), [
    PROJECT_WORKSPACE_RUNTIME_ERRORS.REFERENCE_INVALID,
    PROJECT_WORKSPACE_RUNTIME_ERRORS.RECOVERY_TOOL_STATE_REQUIRED,
  ], "ProjectWorkspace recovery must point to tool state recovery");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    recoveryState,
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace cannot own recovery saved data");
  assert.equal(projectWorkspaceRecoveryTargetsToolState({
    ...projectWorkspace,
    recoveryState,
  }), false);

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    dirty: "yes",
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.DIRTY_INVALID], "dirty flag is runtime boolean");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    recoveryAvailable: "yes",
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.RECOVERY_AVAILABLE_INVALID], "recovery availability is runtime boolean");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    flowState: "persisting",
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FLOW_STATE_INVALID], "flow state is runtime-only and bounded");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    activePaletteContext: {
      swatches: [{ hex: "#ffffff" }],
    },
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "ProjectWorkspace palette context cannot persist palette payload");

  assertErrorCodes(validateProjectWorkspaceRuntimeContract({
    ...projectWorkspace,
    workspaceState: { activeToolId: "palette-manager-v2" },
  }), [PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "old standalone workspace storage is rejected");

  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("payload"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("savedToolStates"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("workspaceState"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("localStorage"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("sessionStorage"), true);
  assert.equal(PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("sampleJson"), true);
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
