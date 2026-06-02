/*
Toolbox Aid
David Quesenberry
06/02/2026
WorkspaceRuntimeContract.test.mjs
*/
import assert from "node:assert/strict";
import {
  PROJECT_CONTRACT_ID,
  validateProjectContract,
} from "../../src/shared/contracts/projectContract.js";
import {
  TOOL_STATE_CONTRACT_ID,
  TOOL_STATE_SLOTS,
  validateToolStateContract,
  validateToolStateRecoveryContract,
} from "../../src/shared/contracts/toolStateContract.js";
import {
  WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS,
  WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST,
  WORKSPACE_DATA_OWNERSHIP,
  WORKSPACE_RUNTIME_CONTRACT_ID,
  WORKSPACE_RUNTIME_CONTRACT_VERSION,
  WORKSPACE_RUNTIME_ERRORS,
  WORKSPACE_RUNTIME_FIELDS,
  WORKSPACE_RUNTIME_FIELD_LIST,
  WORKSPACE_RUNTIME_FLOW_STATES,
  WORKSPACE_RUNTIME_FLOW_STATE_LIST,
  WORKSPACE_RUNTIME_FORBIDDEN_FIELDS,
  WORKSPACE_RUNTIME_RULES,
  WORKSPACE_SAVED_EDITING_SOURCE,
  canWorkspaceCreateSavedToolStateRecord,
  canWorkspacePersistToolPayloadData,
  getWorkspaceRuntimeReferences,
  isToolStateSavedEditingSource,
  isWorkspaceRuntimeFlowState,
  isWorkspaceRuntimeReference,
  validateWorkspaceRuntimeContract,
  workspaceRecoveryTargetsToolState,
} from "../../src/shared/contracts/workspaceRuntimeContract.js";

export function run() {
  assert.equal(WORKSPACE_RUNTIME_CONTRACT_ID, "gamefoundrystudio.workspace.runtime-only");
  assert.equal(WORKSPACE_RUNTIME_CONTRACT_VERSION, "1.0.0");
  assert.deepEqual(WORKSPACE_RUNTIME_FIELD_LIST, [
    "activeProjectId",
    "activeToolId",
    "activeToolStateId",
    "dirty",
    "recoveryAvailable",
    "recoveryToolStateId",
    "activePaletteContext",
    "flowState",
  ]);
  assert.deepEqual(WORKSPACE_RUNTIME_FLOW_STATE_LIST, ["idle", "opening", "open", "closing", "saving"]);
  assert.deepEqual(WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST, [
    "paletteId",
    "sourceToolId",
    "sourceToolStateId",
    "version",
  ]);
  assert.equal(WORKSPACE_RUNTIME_RULES.RUNTIME_ONLY, true);
  assert.equal(WORKSPACE_RUNTIME_RULES.DOES_NOT_PERSIST_TOOL_PAYLOADS, true);
  assert.equal(WORKSPACE_RUNTIME_RULES.DOES_NOT_OWN_SAVED_TOOL_STATE, true);
  assert.equal(WORKSPACE_RUNTIME_RULES.DOES_NOT_DUPLICATE_PROJECT_STORAGE, true);
  assert.equal(WORKSPACE_RUNTIME_RULES.DOES_NOT_DUPLICATE_TOOL_STATE_STORAGE, true);
  assert.equal(WORKSPACE_RUNTIME_RULES.RECOVERY_POINTS_TO_TOOL_STATE, true);
  assert.equal(WORKSPACE_DATA_OWNERSHIP.PROJECT, "persisted-db-container");
  assert.equal(WORKSPACE_DATA_OWNERSHIP.TOOL_STATE, "persisted-db-record-for-one-tool");
  assert.equal(WORKSPACE_DATA_OWNERSHIP.WORKSPACE, "runtime-session-ui-context");
  assert.equal(WORKSPACE_DATA_OWNERSHIP.MANIFEST, "portable-export-import-format");
  assert.equal(WORKSPACE_SAVED_EDITING_SOURCE, "tool-state");
  assert.equal(TOOL_STATE_CONTRACT_ID, "gamefoundrystudio.tool-state.lifecycle");
  assert.equal(PROJECT_CONTRACT_ID, "gamefoundrystudio.project.lifecycle");
  assert.equal(TOOL_STATE_SLOTS.CURRENT_SAVED_STATE, "current-saved-state");

  assert.equal(isWorkspaceRuntimeFlowState(WORKSPACE_RUNTIME_FLOW_STATES.OPEN), true);
  assert.equal(isWorkspaceRuntimeFlowState("persisting"), false);
  assert.equal(isWorkspaceRuntimeReference("project.alpha"), true);
  assert.equal(isWorkspaceRuntimeReference(""), false);
  assert.equal(isWorkspaceRuntimeReference(undefined), true);
  assert.equal(canWorkspacePersistToolPayloadData(), false);
  assert.equal(canWorkspaceCreateSavedToolStateRecord(), false);
  assert.equal(isToolStateSavedEditingSource(WORKSPACE_SAVED_EDITING_SOURCE), true);
  assert.equal(isToolStateSavedEditingSource("workspace"), false);

  const project = {
    id: "project.alpha",
    ownerId: "user.owner",
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
  const workspace = {
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
    flowState: WORKSPACE_RUNTIME_FLOW_STATES.OPEN,
  };

  assert.equal(validateProjectContract(project).valid, true);
  assert.equal(validateToolStateContract(savedToolState).valid, true);
  assert.equal(validateToolStateRecoveryContract({
    savedState: savedToolState,
    recoveryState,
  }).valid, true);

  const validation = validateWorkspaceRuntimeContract(workspace);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
  assert.deepEqual(getWorkspaceRuntimeReferences(workspace), {
    activeProjectId: "project.alpha",
    activeToolId: "palette-manager-v2",
    activeToolStateId: "tool-state.palette.alpha",
    recoveryToolStateId: "tool-state.palette.alpha",
  });
  assert.equal(workspaceRecoveryTargetsToolState(workspace), true);
  assert.equal(workspace.activePaletteContext[WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_STATE_ID], "tool-state.palette.alpha");
  assert.equal(Object.hasOwn(workspace, "payload"), false);
  assert.equal(Object.hasOwn(workspace, "savedToolStates"), false);
  assert.equal(savedToolState.payload.swatches[0].hex, "#ffffff");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    payload: { swatches: [] },
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace cannot persist tool payload data");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    savedToolStates: [savedToolState],
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace cannot create saved tool state records");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    toolStates: [savedToolState],
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace cannot duplicate tool state storage");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    project: { ...project },
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace cannot duplicate project storage");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    manifest: { tools: {} },
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace cannot own manifest export data");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    recoveryToolStateId: "",
  }), [
    WORKSPACE_RUNTIME_ERRORS.REFERENCE_INVALID,
    WORKSPACE_RUNTIME_ERRORS.RECOVERY_TOOL_STATE_REQUIRED,
  ], "workspace recovery must point to tool state recovery");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    recoveryState,
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace cannot own recovery saved data");
  assert.equal(workspaceRecoveryTargetsToolState({
    ...workspace,
    recoveryState,
  }), false);

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    dirty: "yes",
  }), [WORKSPACE_RUNTIME_ERRORS.DIRTY_INVALID], "dirty flag is runtime boolean");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    recoveryAvailable: "yes",
  }), [WORKSPACE_RUNTIME_ERRORS.RECOVERY_AVAILABLE_INVALID], "recovery availability is runtime boolean");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    flowState: "persisting",
  }), [WORKSPACE_RUNTIME_ERRORS.FLOW_STATE_INVALID], "flow state is runtime-only and bounded");

  assertErrorCodes(validateWorkspaceRuntimeContract({
    ...workspace,
    activePaletteContext: {
      swatches: [{ hex: "#ffffff" }],
    },
  }), [WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED], "workspace palette context cannot persist palette payload");

  assert.equal(WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("payload"), true);
  assert.equal(WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.includes("savedToolStates"), true);
}

function assertErrorCodes(validation, expectedCodes, name) {
  assert.deepEqual(validation.errors.map((error) => error.code), expectedCodes, name);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
