/*
Toolbox Aid
David Quesenberry
06/02/2026
workspaceRuntimeContract.js
*/

export const WORKSPACE_RUNTIME_CONTRACT_ID = "gamefoundrystudio.workspace.runtime-only";
export const WORKSPACE_RUNTIME_CONTRACT_VERSION = "1.0.0";

export const WORKSPACE_RUNTIME_FIELDS = Object.freeze({
  ACTIVE_PROJECT_ID: "activeProjectId",
  ACTIVE_TOOL_ID: "activeToolId",
  ACTIVE_TOOL_STATE_ID: "activeToolStateId",
  DIRTY: "dirty",
  RECOVERY_AVAILABLE: "recoveryAvailable",
  RECOVERY_TOOL_STATE_ID: "recoveryToolStateId",
  ACTIVE_PALETTE_CONTEXT: "activePaletteContext",
  FLOW_STATE: "flowState",
});

export const WORKSPACE_RUNTIME_FIELD_LIST = Object.freeze([
  WORKSPACE_RUNTIME_FIELDS.ACTIVE_PROJECT_ID,
  WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_ID,
  WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_STATE_ID,
  WORKSPACE_RUNTIME_FIELDS.DIRTY,
  WORKSPACE_RUNTIME_FIELDS.RECOVERY_AVAILABLE,
  WORKSPACE_RUNTIME_FIELDS.RECOVERY_TOOL_STATE_ID,
  WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT,
  WORKSPACE_RUNTIME_FIELDS.FLOW_STATE,
]);

export const WORKSPACE_RUNTIME_FLOW_STATES = Object.freeze({
  IDLE: "idle",
  OPENING: "opening",
  OPEN: "open",
  CLOSING: "closing",
  SAVING: "saving",
});

export const WORKSPACE_RUNTIME_FLOW_STATE_LIST = Object.freeze([
  WORKSPACE_RUNTIME_FLOW_STATES.IDLE,
  WORKSPACE_RUNTIME_FLOW_STATES.OPENING,
  WORKSPACE_RUNTIME_FLOW_STATES.OPEN,
  WORKSPACE_RUNTIME_FLOW_STATES.CLOSING,
  WORKSPACE_RUNTIME_FLOW_STATES.SAVING,
]);

export const WORKSPACE_RUNTIME_RULES = Object.freeze({
  RUNTIME_ONLY: true,
  DOES_NOT_PERSIST_TOOL_PAYLOADS: true,
  DOES_NOT_OWN_SAVED_TOOL_STATE: true,
  DOES_NOT_DUPLICATE_PROJECT_STORAGE: true,
  DOES_NOT_DUPLICATE_TOOL_STATE_STORAGE: true,
  RECOVERY_POINTS_TO_TOOL_STATE: true,
});

export const WORKSPACE_DATA_OWNERSHIP = Object.freeze({
  PROJECT: "persisted-db-container",
  TOOL_STATE: "persisted-db-record-for-one-tool",
  WORKSPACE: "runtime-session-ui-context",
  MANIFEST: "portable-export-import-format",
});

export const WORKSPACE_SAVED_EDITING_SOURCE = "tool-state";

export const WORKSPACE_RUNTIME_FORBIDDEN_FIELDS = Object.freeze([
  "payload",
  "payloadJson",
  "toolPayload",
  "toolPayloads",
  "savedToolState",
  "savedToolStates",
  "toolState",
  "toolStates",
  "toolStateRecords",
  "project",
  "projects",
  "projectRecords",
  "manifest",
  "databaseId",
  "recoveryState",
  "savedState",
  "swatches",
  "colors",
  "palettePayload",
]);

export const WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS = Object.freeze({
  PALETTE_ID: "paletteId",
  SOURCE_TOOL_ID: "sourceToolId",
  SOURCE_TOOL_STATE_ID: "sourceToolStateId",
  VERSION: "version",
});

export const WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST = Object.freeze([
  WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.PALETTE_ID,
  WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_ID,
  WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_STATE_ID,
  WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.VERSION,
]);

export const WORKSPACE_RUNTIME_ERRORS = Object.freeze({
  CONTEXT_INVALID: "WORKSPACE_RUNTIME_CONTEXT_INVALID",
  FIELD_NOT_ALLOWED: "WORKSPACE_RUNTIME_FIELD_NOT_ALLOWED",
  REFERENCE_INVALID: "WORKSPACE_RUNTIME_REFERENCE_INVALID",
  DIRTY_INVALID: "WORKSPACE_RUNTIME_DIRTY_INVALID",
  RECOVERY_AVAILABLE_INVALID: "WORKSPACE_RUNTIME_RECOVERY_AVAILABLE_INVALID",
  RECOVERY_TOOL_STATE_REQUIRED: "WORKSPACE_RUNTIME_RECOVERY_TOOL_STATE_REQUIRED",
  FLOW_STATE_INVALID: "WORKSPACE_RUNTIME_FLOW_STATE_INVALID",
  ACTIVE_PALETTE_CONTEXT_INVALID: "WORKSPACE_RUNTIME_ACTIVE_PALETTE_CONTEXT_INVALID",
});

export function isWorkspaceRuntimeFlowState(value) {
  return WORKSPACE_RUNTIME_FLOW_STATE_LIST.includes(value);
}

export function isWorkspaceRuntimeReference(value) {
  return value === undefined || value === null || hasNonEmptyString(value);
}

export function canWorkspacePersistToolPayloadData() {
  return false;
}

export function canWorkspaceCreateSavedToolStateRecord() {
  return false;
}

export function isToolStateSavedEditingSource(value) {
  return value === WORKSPACE_SAVED_EDITING_SOURCE;
}

export function workspaceRecoveryTargetsToolState(workspaceContext) {
  if (!workspaceContext?.recoveryAvailable) {
    return true;
  }

  return hasNonEmptyString(workspaceContext.recoveryToolStateId)
    && !hasForbiddenWorkspaceField(workspaceContext);
}

export function validateWorkspaceRuntimeContract(workspaceContext = {}) {
  const errors = [];

  if (!workspaceContext || typeof workspaceContext !== "object" || Array.isArray(workspaceContext)) {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.CONTEXT_INVALID,
      "Workspace runtime context must be an object.",
      "workspace"
    ));

    return Object.freeze({
      valid: false,
      errors: Object.freeze(errors),
    });
  }

  collectForbiddenFieldErrors(workspaceContext, errors);
  validateRuntimeReference(workspaceContext, WORKSPACE_RUNTIME_FIELDS.ACTIVE_PROJECT_ID, errors);
  validateRuntimeReference(workspaceContext, WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_ID, errors);
  validateRuntimeReference(workspaceContext, WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_STATE_ID, errors);
  validateRuntimeReference(workspaceContext, WORKSPACE_RUNTIME_FIELDS.RECOVERY_TOOL_STATE_ID, errors);

  if (workspaceContext.dirty !== undefined && typeof workspaceContext.dirty !== "boolean") {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.DIRTY_INVALID,
      "Workspace dirty status must be a runtime boolean when provided.",
      WORKSPACE_RUNTIME_FIELDS.DIRTY
    ));
  }

  if (workspaceContext.recoveryAvailable !== undefined && typeof workspaceContext.recoveryAvailable !== "boolean") {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.RECOVERY_AVAILABLE_INVALID,
      "Workspace recovery availability must be a runtime boolean when provided.",
      WORKSPACE_RUNTIME_FIELDS.RECOVERY_AVAILABLE
    ));
  }

  if (workspaceContext.recoveryAvailable === true && !hasNonEmptyString(workspaceContext.recoveryToolStateId)) {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.RECOVERY_TOOL_STATE_REQUIRED,
      "Workspace recovery must point to a tool state recovery reference.",
      WORKSPACE_RUNTIME_FIELDS.RECOVERY_TOOL_STATE_ID
    ));
  }

  if (workspaceContext.flowState !== undefined && !isWorkspaceRuntimeFlowState(workspaceContext.flowState)) {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.FLOW_STATE_INVALID,
      "Workspace flow state must be an allowed runtime flow state.",
      WORKSPACE_RUNTIME_FIELDS.FLOW_STATE
    ));
  }

  validateActivePaletteContext(workspaceContext.activePaletteContext, errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function getWorkspaceRuntimeReferences(workspaceContext = {}) {
  return Object.freeze({
    activeProjectId: normalizeReference(workspaceContext.activeProjectId),
    activeToolId: normalizeReference(workspaceContext.activeToolId),
    activeToolStateId: normalizeReference(workspaceContext.activeToolStateId),
    recoveryToolStateId: normalizeReference(workspaceContext.recoveryToolStateId),
  });
}

function validateRuntimeReference(workspaceContext, fieldName, errors) {
  if (!isWorkspaceRuntimeReference(workspaceContext[fieldName])) {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.REFERENCE_INVALID,
      "Workspace runtime references must be non-empty strings when provided.",
      fieldName
    ));
  }
}

function validateActivePaletteContext(activePaletteContext, errors) {
  if (activePaletteContext === undefined || activePaletteContext === null) {
    return;
  }

  if (typeof activePaletteContext !== "object" || Array.isArray(activePaletteContext)) {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.ACTIVE_PALETTE_CONTEXT_INVALID,
      "Workspace active palette context must be an object when provided.",
      WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT
    ));
    return;
  }

  collectForbiddenFieldErrors(
    activePaletteContext,
    errors,
    WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT
  );

  for (const fieldName of [
    WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.PALETTE_ID,
    WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_ID,
    WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_STATE_ID,
  ]) {
    if (!isWorkspaceRuntimeReference(activePaletteContext[fieldName])) {
      errors.push(createContractError(
        WORKSPACE_RUNTIME_ERRORS.ACTIVE_PALETTE_CONTEXT_INVALID,
        "Workspace active palette context references must be non-empty strings when provided.",
        `${WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT}.${fieldName}`
      ));
    }
  }

  if (activePaletteContext.version !== undefined && !isPositiveInteger(activePaletteContext.version)) {
    errors.push(createContractError(
      WORKSPACE_RUNTIME_ERRORS.ACTIVE_PALETTE_CONTEXT_INVALID,
      "Workspace active palette context version must be a positive integer when provided.",
      `${WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT}.${WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.VERSION}`
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  for (const fieldName of WORKSPACE_RUNTIME_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED,
        "Workspace runtime context must not persist project, tool state, manifest, or tool payload data.",
        pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName
      ));
    }
  }
}

function hasForbiddenWorkspaceField(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return false;
  }

  return WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.some((fieldName) => Object.hasOwn(record, fieldName));
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 1;
}

function normalizeReference(value) {
  return hasNonEmptyString(value) ? value : null;
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
