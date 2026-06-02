/*
Toolbox Aid
David Quesenberry
06/02/2026
projectWorkspaceRuntimeContract.js
*/

export const PROJECT_WORKSPACE_RUNTIME_CONTRACT_ID = "gamefoundrystudio.project-workspace.runtime-only";
export const PROJECT_WORKSPACE_RUNTIME_CONTRACT_VERSION = "1.0.0";

export const PROJECT_WORKSPACE_RUNTIME_FIELDS = Object.freeze({
  ACTIVE_PROJECT_ID: "activeProjectId",
  ACTIVE_TOOL_ID: "activeToolId",
  ACTIVE_TOOL_STATE_ID: "activeToolStateId",
  DIRTY: "dirty",
  RECOVERY_AVAILABLE: "recoveryAvailable",
  RECOVERY_TOOL_STATE_ID: "recoveryToolStateId",
  ACTIVE_PALETTE_CONTEXT: "activePaletteContext",
  FLOW_STATE: "flowState",
});

export const PROJECT_WORKSPACE_RUNTIME_FIELD_LIST = Object.freeze([
  PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PROJECT_ID,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_ID,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_STATE_ID,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.DIRTY,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.RECOVERY_AVAILABLE,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.RECOVERY_TOOL_STATE_ID,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT,
  PROJECT_WORKSPACE_RUNTIME_FIELDS.FLOW_STATE,
]);

export const PROJECT_WORKSPACE_RUNTIME_FLOW_STATES = Object.freeze({
  IDLE: "idle",
  OPENING: "opening",
  OPEN: "open",
  CLOSING: "closing",
  SAVING: "saving",
});

export const PROJECT_WORKSPACE_RUNTIME_FLOW_STATE_LIST = Object.freeze([
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.IDLE,
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.OPENING,
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.OPEN,
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.CLOSING,
  PROJECT_WORKSPACE_RUNTIME_FLOW_STATES.SAVING,
]);

export const PROJECT_WORKSPACE_RUNTIME_RULES = Object.freeze({
  RUNTIME_ONLY: true,
  DOES_NOT_PERSIST_TOOL_PAYLOADS: true,
  DOES_NOT_OWN_SAVED_TOOL_STATE: true,
  DOES_NOT_DUPLICATE_PROJECT_STORAGE: true,
  DOES_NOT_DUPLICATE_TOOL_STATE_STORAGE: true,
  RECOVERY_POINTS_TO_TOOL_STATE: true,
  ACTIVE_WORKING_CONTEXT_FOR_PROJECT: true,
});

export const PROJECT_WORKSPACE_DATA_OWNERSHIP = Object.freeze({
  PROJECT: "persisted-db-container",
  PROJECT_WORKSPACE: "runtime-working-context-for-project",
  TOOL_STATE: "persisted-db-record-for-one-tool",
  MANIFEST: "portable-export-import-format",
});

export const PROJECT_WORKSPACE_SAVED_EDITING_SOURCE = "tool-state";

export const PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS = Object.freeze([
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
  "workspace",
  "workspacePayload",
  "workspaceState",
  "workspaceStorage",
  "workspaceSession",
  "savedWorkspace",
  "localStorage",
  "sessionStorage",
  "persistedWorkspaceState",
  "hiddenWorkspaceState",
  "sampleJson",
  "fallbackData",
]);

export const PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS = Object.freeze({
  PALETTE_ID: "paletteId",
  SOURCE_TOOL_ID: "sourceToolId",
  SOURCE_TOOL_STATE_ID: "sourceToolStateId",
  VERSION: "version",
});

export const PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELD_LIST = Object.freeze([
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.PALETTE_ID,
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_ID,
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_STATE_ID,
  PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.VERSION,
]);

export const PROJECT_WORKSPACE_RUNTIME_ERRORS = Object.freeze({
  CONTEXT_INVALID: "PROJECT_WORKSPACE_RUNTIME_CONTEXT_INVALID",
  FIELD_NOT_ALLOWED: "PROJECT_WORKSPACE_RUNTIME_FIELD_NOT_ALLOWED",
  REFERENCE_INVALID: "PROJECT_WORKSPACE_RUNTIME_REFERENCE_INVALID",
  DIRTY_INVALID: "PROJECT_WORKSPACE_RUNTIME_DIRTY_INVALID",
  RECOVERY_AVAILABLE_INVALID: "PROJECT_WORKSPACE_RUNTIME_RECOVERY_AVAILABLE_INVALID",
  RECOVERY_TOOL_STATE_REQUIRED: "PROJECT_WORKSPACE_RUNTIME_RECOVERY_TOOL_STATE_REQUIRED",
  FLOW_STATE_INVALID: "PROJECT_WORKSPACE_RUNTIME_FLOW_STATE_INVALID",
  ACTIVE_PALETTE_CONTEXT_INVALID: "PROJECT_WORKSPACE_RUNTIME_ACTIVE_PALETTE_CONTEXT_INVALID",
});

export function isProjectWorkspaceRuntimeFlowState(value) {
  return PROJECT_WORKSPACE_RUNTIME_FLOW_STATE_LIST.includes(value);
}

export function isProjectWorkspaceRuntimeReference(value) {
  return value === undefined || value === null || hasNonEmptyString(value);
}

export function canProjectWorkspacePersistToolPayloadData() {
  return false;
}

export function canProjectWorkspaceCreateSavedToolStateRecord() {
  return false;
}

export function isToolStateSavedEditingSource(value) {
  return value === PROJECT_WORKSPACE_SAVED_EDITING_SOURCE;
}

export function projectWorkspaceRecoveryTargetsToolState(projectWorkspaceContext) {
  if (!projectWorkspaceContext?.recoveryAvailable) {
    return true;
  }

  return hasNonEmptyString(projectWorkspaceContext.recoveryToolStateId)
    && !hasForbiddenProjectWorkspaceField(projectWorkspaceContext);
}

export function validateProjectWorkspaceRuntimeContract(projectWorkspaceContext = {}) {
  const errors = [];

  if (!projectWorkspaceContext || typeof projectWorkspaceContext !== "object" || Array.isArray(projectWorkspaceContext)) {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.CONTEXT_INVALID,
      "ProjectWorkspace runtime context must be an object.",
      "projectWorkspace"
    ));

    return Object.freeze({
      valid: false,
      errors: Object.freeze(errors),
    });
  }

  collectForbiddenFieldErrors(projectWorkspaceContext, errors);
  validateRuntimeReference(projectWorkspaceContext, PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PROJECT_ID, errors);
  validateRuntimeReference(projectWorkspaceContext, PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_ID, errors);
  validateRuntimeReference(projectWorkspaceContext, PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_TOOL_STATE_ID, errors);
  validateRuntimeReference(projectWorkspaceContext, PROJECT_WORKSPACE_RUNTIME_FIELDS.RECOVERY_TOOL_STATE_ID, errors);

  if (projectWorkspaceContext.dirty !== undefined && typeof projectWorkspaceContext.dirty !== "boolean") {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.DIRTY_INVALID,
      "ProjectWorkspace dirty status must be a runtime boolean when provided.",
      PROJECT_WORKSPACE_RUNTIME_FIELDS.DIRTY
    ));
  }

  if (projectWorkspaceContext.recoveryAvailable !== undefined && typeof projectWorkspaceContext.recoveryAvailable !== "boolean") {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.RECOVERY_AVAILABLE_INVALID,
      "ProjectWorkspace recovery availability must be a runtime boolean when provided.",
      PROJECT_WORKSPACE_RUNTIME_FIELDS.RECOVERY_AVAILABLE
    ));
  }

  if (projectWorkspaceContext.recoveryAvailable === true && !hasNonEmptyString(projectWorkspaceContext.recoveryToolStateId)) {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.RECOVERY_TOOL_STATE_REQUIRED,
      "ProjectWorkspace recovery must point to a tool state recovery reference.",
      PROJECT_WORKSPACE_RUNTIME_FIELDS.RECOVERY_TOOL_STATE_ID
    ));
  }

  if (projectWorkspaceContext.flowState !== undefined && !isProjectWorkspaceRuntimeFlowState(projectWorkspaceContext.flowState)) {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.FLOW_STATE_INVALID,
      "ProjectWorkspace flow state must be an allowed runtime flow state.",
      PROJECT_WORKSPACE_RUNTIME_FIELDS.FLOW_STATE
    ));
  }

  validateActivePaletteContext(projectWorkspaceContext.activePaletteContext, errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function getProjectWorkspaceRuntimeReferences(projectWorkspaceContext = {}) {
  return Object.freeze({
    activeProjectId: normalizeReference(projectWorkspaceContext.activeProjectId),
    activeToolId: normalizeReference(projectWorkspaceContext.activeToolId),
    activeToolStateId: normalizeReference(projectWorkspaceContext.activeToolStateId),
    recoveryToolStateId: normalizeReference(projectWorkspaceContext.recoveryToolStateId),
  });
}

function validateRuntimeReference(projectWorkspaceContext, fieldName, errors) {
  if (!isProjectWorkspaceRuntimeReference(projectWorkspaceContext[fieldName])) {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.REFERENCE_INVALID,
      "ProjectWorkspace runtime references must be non-empty strings when provided.",
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
      PROJECT_WORKSPACE_RUNTIME_ERRORS.ACTIVE_PALETTE_CONTEXT_INVALID,
      "ProjectWorkspace active palette context must be an object when provided.",
      PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT
    ));
    return;
  }

  collectForbiddenFieldErrors(
    activePaletteContext,
    errors,
    PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT
  );

  for (const fieldName of [
    PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.PALETTE_ID,
    PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_ID,
    PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.SOURCE_TOOL_STATE_ID,
  ]) {
    if (!isProjectWorkspaceRuntimeReference(activePaletteContext[fieldName])) {
      errors.push(createContractError(
        PROJECT_WORKSPACE_RUNTIME_ERRORS.ACTIVE_PALETTE_CONTEXT_INVALID,
        "ProjectWorkspace active palette context references must be non-empty strings when provided.",
        `${PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT}.${fieldName}`
      ));
    }
  }

  if (activePaletteContext.version !== undefined && !isPositiveInteger(activePaletteContext.version)) {
    errors.push(createContractError(
      PROJECT_WORKSPACE_RUNTIME_ERRORS.ACTIVE_PALETTE_CONTEXT_INVALID,
      "ProjectWorkspace active palette context version must be a positive integer when provided.",
      `${PROJECT_WORKSPACE_RUNTIME_FIELDS.ACTIVE_PALETTE_CONTEXT}.${PROJECT_WORKSPACE_ACTIVE_PALETTE_CONTEXT_FIELDS.VERSION}`
    ));
  }
}

function collectForbiddenFieldErrors(record, errors, pathPrefix = "") {
  for (const fieldName of PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS) {
    if (Object.hasOwn(record, fieldName)) {
      errors.push(createContractError(
        PROJECT_WORKSPACE_RUNTIME_ERRORS.FIELD_NOT_ALLOWED,
        "ProjectWorkspace runtime context must not persist project, tool state, manifest, or tool payload data.",
        pathPrefix ? `${pathPrefix}.${fieldName}` : fieldName
      ));
    }
  }
}

function hasForbiddenProjectWorkspaceField(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return false;
  }

  return PROJECT_WORKSPACE_RUNTIME_FORBIDDEN_FIELDS.some((fieldName) => Object.hasOwn(record, fieldName));
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
