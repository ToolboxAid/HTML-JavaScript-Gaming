/*
Toolbox Aid
David Quesenberry
06/02/2026
toolStateContract.js
*/
import {
  IDENTITY_PERMISSION_SCOPES,
  IDENTITY_PERMISSIONS,
  IDENTITY_ROLES,
  canActorPerformPermission,
  isIdentityPermission,
} from "./identityPermissionsContract.js";
import {
  PROJECT_ROLES,
  PROJECT_VISIBILITY_STATES,
  canActorAccessProject,
  isProjectVisibility,
} from "./projectContract.js";

export const TOOL_STATE_CONTRACT_ID = "gamefoundrystudio.tool-state.lifecycle";
export const TOOL_STATE_CONTRACT_VERSION = "1.1.0";

export const TOOL_STATE_SLOTS = Object.freeze({
  CURRENT_SAVED_STATE: "current-saved-state",
  RECOVERY_STATE: "recovery-state",
  VERSION_HISTORY: "version-history",
});

export const TOOL_STATE_FIELDS = Object.freeze({
  TOOL_STATE_ID: "toolStateId",
  TOOL_TYPE: "toolType",
  OWNER: "ownerId",
  PROJECT: "projectId",
  VISIBILITY: "visibility",
  VERSION: "version",
  STATUS: "status",
});

export const TOOL_STATE_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
});

export const TOOL_STATE_STATUS_LIST = Object.freeze([
  TOOL_STATE_STATUS.DRAFT,
  TOOL_STATE_STATUS.ACTIVE,
  TOOL_STATE_STATUS.ARCHIVED,
]);

export const TOOL_STATE_VISIBILITY_STATES = Object.freeze({
  PRIVATE: PROJECT_VISIBILITY_STATES.PRIVATE,
  PROJECT: PROJECT_VISIBILITY_STATES.PROJECT,
  UNLISTED: PROJECT_VISIBILITY_STATES.UNLISTED,
  PUBLIC: PROJECT_VISIBILITY_STATES.PUBLIC,
});

export const TOOL_STATE_VISIBILITY_LIST = Object.freeze([
  TOOL_STATE_VISIBILITY_STATES.PRIVATE,
  TOOL_STATE_VISIBILITY_STATES.PROJECT,
  TOOL_STATE_VISIBILITY_STATES.UNLISTED,
  TOOL_STATE_VISIBILITY_STATES.PUBLIC,
]);

export const TOOL_STATE_RELATIONSHIPS = Object.freeze({
  BELONGS_TO_PROJECT: "belongs-to-project",
  OWNED_BY_USER: "owned-by-user",
  MAY_REFERENCE_ASSETS: "may-reference-assets",
  MAY_BE_EXPORTED: "may-be-exported",
});

export const TOOL_STATE_RELATIONSHIP_LIST = Object.freeze([
  TOOL_STATE_RELATIONSHIPS.BELONGS_TO_PROJECT,
  TOOL_STATE_RELATIONSHIPS.OWNED_BY_USER,
  TOOL_STATE_RELATIONSHIPS.MAY_REFERENCE_ASSETS,
  TOOL_STATE_RELATIONSHIPS.MAY_BE_EXPORTED,
]);

export const TOOL_STATE_RECOVERY_ACTIONS = Object.freeze({
  RESUME: "resume",
  OPEN: "open",
  DISCARD: "discard",
  PROMOTE: "promote",
});

export const TOOL_STATE_STARTUP_ACTION_LIST = Object.freeze([
  TOOL_STATE_RECOVERY_ACTIONS.RESUME,
  TOOL_STATE_RECOVERY_ACTIONS.OPEN,
]);

export const TOOL_STATE_RECOVERY_AGE = Object.freeze({
  NEWER_THAN_SAVED: "newer-than-saved",
  OLDER_THAN_SAVED: "older-than-saved",
  SAME_AS_SAVED: "same-as-saved",
  WITHOUT_SAVED_STATE: "without-saved-state",
});

export const TOOL_STATE_RECOVERY_RULES = Object.freeze({
  SEPARATE_FROM_SAVED_STATE: true,
  TEMPORARY: true,
  NEVER_OVERWRITES_SAVED_STATE_AUTOMATICALLY: true,
  USER_SELECTED: true,
  MAY_BE_AUTOSAVED: true,
  MAY_BE_DISCARDED: true,
  MAY_BE_PROMOTED_TO_SAVED_STATE: true,
  NEVER_AUTO_LOADED: true,
  NEVER_AUTO_APPLIED: true,
  REMAINS_AVAILABLE_UNTIL_SAVED_OR_DISCARDED: true,
  REQUIRES_TIMESTAMP: true,
  IDENTIFIES_TOOL_AND_PROJECT: true,
});

export const TOOL_STATE_PORTABLE_EXPORT_FIELDS = Object.freeze([
  TOOL_STATE_FIELDS.TOOL_STATE_ID,
  TOOL_STATE_FIELDS.TOOL_TYPE,
  TOOL_STATE_FIELDS.VISIBILITY,
  TOOL_STATE_FIELDS.VERSION,
  TOOL_STATE_FIELDS.STATUS,
  "assetRefs",
  "payload",
]);

export const TOOL_STATE_CONTRACT_ERRORS = Object.freeze({
  TOOL_STATE_ID_REQUIRED: "TOOL_STATE_ID_REQUIRED",
  TOOL_TYPE_REQUIRED: "TOOL_TYPE_REQUIRED",
  OWNER_REQUIRED: "TOOL_STATE_OWNER_REQUIRED",
  PROJECT_REQUIRED: "TOOL_STATE_PROJECT_REQUIRED",
  VISIBILITY_REQUIRED: "TOOL_STATE_VISIBILITY_REQUIRED",
  VISIBILITY_INVALID: "TOOL_STATE_VISIBILITY_INVALID",
  VERSION_REQUIRED: "TOOL_STATE_VERSION_REQUIRED",
  VERSION_INVALID: "TOOL_STATE_VERSION_INVALID",
  STATUS_REQUIRED: "TOOL_STATE_STATUS_REQUIRED",
  STATUS_INVALID: "TOOL_STATE_STATUS_INVALID",
  RELATIONSHIP_INVALID: "TOOL_STATE_RELATIONSHIP_INVALID",
  ASSET_REF_INVALID: "TOOL_STATE_ASSET_REF_INVALID",
  PORTABLE_EXPORT_INVALID: "TOOL_STATE_PORTABLE_EXPORT_INVALID",
  RECOVERY_OWNER_REQUIRED: "TOOL_STATE_RECOVERY_OWNER_REQUIRED",
  RECOVERY_PROJECT_REQUIRED: "TOOL_STATE_RECOVERY_PROJECT_REQUIRED",
  RECOVERY_TOOL_TYPE_REQUIRED: "TOOL_STATE_RECOVERY_TOOL_TYPE_REQUIRED",
  RECOVERY_TIMESTAMP_REQUIRED: "TOOL_STATE_RECOVERY_TIMESTAMP_REQUIRED",
  RECOVERY_TIMESTAMP_INVALID: "TOOL_STATE_RECOVERY_TIMESTAMP_INVALID",
  RECOVERY_PROJECT_MISMATCH: "TOOL_STATE_RECOVERY_PROJECT_MISMATCH",
});

export function isToolStateStatus(value) {
  return TOOL_STATE_STATUS_LIST.includes(value);
}

export function isToolStateVisibility(value) {
  return TOOL_STATE_VISIBILITY_LIST.includes(value) && isProjectVisibility(value);
}

export function isToolStateRelationship(value) {
  return TOOL_STATE_RELATIONSHIP_LIST.includes(value);
}

export function isToolStateVersion(value) {
  return Number.isInteger(value) && value >= 1;
}

export function validateToolStateContract(toolState) {
  const errors = [];

  if (!hasNonEmptyString(toolState?.toolStateId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.TOOL_STATE_ID_REQUIRED,
      "Tool state records require toolStateId.",
      "toolStateId"
    ));
  }

  if (!hasNonEmptyString(toolState?.toolType)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.TOOL_TYPE_REQUIRED,
      "Tool state records require toolType.",
      "toolType"
    ));
  }

  if (!hasNonEmptyString(toolState?.ownerId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.OWNER_REQUIRED,
      "Tool state records require ownerId.",
      "ownerId"
    ));
  }

  if (!hasNonEmptyString(toolState?.projectId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PROJECT_REQUIRED,
      "Tool state records require projectId.",
      "projectId"
    ));
  }

  if (!hasNonEmptyString(toolState?.visibility)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VISIBILITY_REQUIRED,
      "Tool state records require explicit visibility.",
      "visibility"
    ));
  } else if (!isToolStateVisibility(toolState.visibility)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VISIBILITY_INVALID,
      "Tool state visibility must be an allowed project visibility state.",
      "visibility"
    ));
  }

  if (toolState?.version === undefined || toolState?.version === null) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VERSION_REQUIRED,
      "Tool state records require version.",
      "version"
    ));
  } else if (!isToolStateVersion(toolState.version)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.VERSION_INVALID,
      "Tool state version must be a positive integer.",
      "version"
    ));
  }

  if (!hasNonEmptyString(toolState?.status)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.STATUS_REQUIRED,
      "Tool state records require status.",
      "status"
    ));
  } else if (!isToolStateStatus(toolState.status)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.STATUS_INVALID,
      "Tool state status must be an allowed tool state status.",
      "status"
    ));
  }

  if (Array.isArray(toolState?.relationships)) {
    toolState.relationships.forEach((relationship, index) => {
      if (!isToolStateRelationship(relationship)) {
        errors.push(createContractError(
          TOOL_STATE_CONTRACT_ERRORS.RELATIONSHIP_INVALID,
          "Tool state relationship must be an allowed relationship.",
          `relationships[${index}]`
        ));
      }
    });
  }

  if (Array.isArray(toolState?.assetRefs)) {
    toolState.assetRefs.forEach((assetRef, index) => {
      if (!hasNonEmptyString(assetRef)) {
        errors.push(createContractError(
          TOOL_STATE_CONTRACT_ERRORS.ASSET_REF_INVALID,
          "Tool state asset references must be non-empty strings.",
          `assetRefs[${index}]`
        ));
      }
    });
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function canEditToolStateStatus(toolState, policy = {}) {
  if (toolState?.status === TOOL_STATE_STATUS.ARCHIVED) {
    return policy.allowArchivedToolStateEdit === true;
  }

  return isToolStateStatus(toolState?.status);
}

export function isToolStateVisibleToActor({
  actorId,
  toolState,
  project,
  grantedProjectIds = [],
} = {}) {
  if (!hasNonEmptyString(actorId) || !toolState) {
    return false;
  }

  if (actorId === toolState.ownerId) {
    return true;
  }

  if (toolState.visibility === TOOL_STATE_VISIBILITY_STATES.PUBLIC || toolState.visibility === TOOL_STATE_VISIBILITY_STATES.UNLISTED) {
    return true;
  }

  if (!project || toolState.projectId !== project.id) {
    return false;
  }

  return canActorAccessProject({
    actorId,
    projectRole: PROJECT_ROLES.VIEWER,
    permission: IDENTITY_PERMISSIONS.VIEW,
    project,
    grantedProjectIds,
  });
}

export function canActorAccessToolState({
  actorId,
  projectRole,
  permission,
  toolState,
  project,
  grantedProjectIds = [],
  grantedScopes = [],
  policy = {},
} = {}) {
  if (!isIdentityPermission(permission) || !isToolStateVisibleToActor({ actorId, toolState, project, grantedProjectIds })) {
    return false;
  }

  if (permission === IDENTITY_PERMISSIONS.EDIT && !canEditToolStateStatus(toolState, policy)) {
    return false;
  }

  if (actorId === toolState?.ownerId) {
    return canActorPerformPermission({
      actorId,
      role: IDENTITY_ROLES.OWNER,
      permission,
      scope: IDENTITY_PERMISSION_SCOPES.OWNED_OBJECT,
      object: {
        ownerId: toolState.ownerId,
        visibility: toolState.visibility,
      },
    });
  }

  return canActorAccessProject({
    actorId,
    projectRole,
    permission,
    project,
    grantedProjectIds,
    grantedScopes,
    policy,
  });
}

export function createPortableToolStateExport(toolState) {
  const validation = validateToolStateContract(toolState);

  if (!validation.valid) {
    return Object.freeze({
      valid: false,
      errors: validation.errors,
      export: null,
    });
  }

  const portableExport = Object.freeze({
    contractId: TOOL_STATE_CONTRACT_ID,
    contractVersion: TOOL_STATE_CONTRACT_VERSION,
    toolStateId: toolState.toolStateId,
    toolType: toolState.toolType,
    visibility: toolState.visibility,
    version: toolState.version,
    status: toolState.status,
    assetRefs: Object.freeze(normalizeStringArray(toolState.assetRefs)),
    payload: clonePortablePayload(toolState.payload ?? {}),
    portable: true,
  });

  return Object.freeze({
    valid: true,
    errors: Object.freeze([]),
    export: portableExport,
  });
}

export function validatePortableToolStateExport(portableExport) {
  const errors = [];

  if (!portableExport?.portable) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool state export must declare portable=true.",
      "portable"
    ));
  }

  if (hasNonEmptyString(portableExport?.ownerId) || hasNonEmptyString(portableExport?.projectId) || hasNonEmptyString(portableExport?.databaseId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool state export must not carry database owner, project, or database ids.",
      "portable"
    ));
  }

  if (!hasNonEmptyString(portableExport?.toolStateId)
    || !hasNonEmptyString(portableExport?.toolType)
    || !isToolStateVisibility(portableExport?.visibility)
    || !isToolStateVersion(portableExport?.version)
    || !isToolStateStatus(portableExport?.status)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.PORTABLE_EXPORT_INVALID,
      "Portable tool state export must preserve valid portable identity, type, visibility, version, and status fields.",
      "portable"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function validateToolStateRecoveryContract({
  savedState = null,
  recoveryState = null,
} = {}) {
  const errors = [];

  if (!recoveryState) {
    return Object.freeze({
      valid: true,
      errors: Object.freeze(errors),
    });
  }

  if (!hasNonEmptyString(recoveryState.ownerId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.RECOVERY_OWNER_REQUIRED,
      "Recovery state requires ownerId.",
      "recoveryState.ownerId"
    ));
  }

  if (!hasNonEmptyString(recoveryState.projectId)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.RECOVERY_PROJECT_REQUIRED,
      "Recovery state requires projectId.",
      "recoveryState.projectId"
    ));
  }

  if (!hasNonEmptyString(recoveryState.toolType)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.RECOVERY_TOOL_TYPE_REQUIRED,
      "Recovery state requires toolType.",
      "recoveryState.toolType"
    ));
  }

  if (!hasNonEmptyString(recoveryState.timestamp)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.RECOVERY_TIMESTAMP_REQUIRED,
      "Recovery state requires timestamp.",
      "recoveryState.timestamp"
    ));
  } else if (!isTimestamp(recoveryState.timestamp)) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.RECOVERY_TIMESTAMP_INVALID,
      "Recovery state timestamp must be a valid timestamp.",
      "recoveryState.timestamp"
    ));
  }

  if (savedState && hasNonEmptyString(savedState.projectId) && recoveryState.projectId !== savedState.projectId) {
    errors.push(createContractError(
      TOOL_STATE_CONTRACT_ERRORS.RECOVERY_PROJECT_MISMATCH,
      "Recovery state projectId must match saved state projectId.",
      "recoveryState.projectId"
    ));
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function getToolStateRecoveryAge({
  savedState = null,
  recoveryState = null,
} = {}) {
  if (!savedState) {
    return TOOL_STATE_RECOVERY_AGE.WITHOUT_SAVED_STATE;
  }

  const recoveryTime = Date.parse(recoveryState?.timestamp || "");
  const savedTime = Date.parse(savedState.savedAt || savedState.timestamp || "");

  if (!Number.isFinite(recoveryTime) || !Number.isFinite(savedTime)) {
    return TOOL_STATE_RECOVERY_AGE.WITHOUT_SAVED_STATE;
  }

  if (recoveryTime > savedTime) {
    return TOOL_STATE_RECOVERY_AGE.NEWER_THAN_SAVED;
  }

  if (recoveryTime < savedTime) {
    return TOOL_STATE_RECOVERY_AGE.OLDER_THAN_SAVED;
  }

  return TOOL_STATE_RECOVERY_AGE.SAME_AS_SAVED;
}

export function getToolStateStartupChoices({
  savedState = null,
  recoveryState = null,
} = {}) {
  if (recoveryState) {
    return Object.freeze([
      Object.freeze({
        action: TOOL_STATE_RECOVERY_ACTIONS.RESUME,
        label: "Resume",
        stateSlot: TOOL_STATE_SLOTS.RECOVERY_STATE,
        enabled: true,
      }),
      Object.freeze({
        action: TOOL_STATE_RECOVERY_ACTIONS.OPEN,
        label: "Open",
        stateSlot: TOOL_STATE_SLOTS.CURRENT_SAVED_STATE,
        enabled: Boolean(savedState),
      }),
    ]);
  }

  return Object.freeze([
    Object.freeze({
      action: TOOL_STATE_RECOVERY_ACTIONS.OPEN,
      label: "Open",
      stateSlot: TOOL_STATE_SLOTS.CURRENT_SAVED_STATE,
      enabled: Boolean(savedState),
    }),
  ]);
}

export function resolveToolStateStartupState(context = {}) {
  return Object.freeze({
    action: null,
    stateSlot: null,
    loadedState: null,
    recoveryAvailable: Boolean(context.recoveryState),
    choices: getToolStateStartupChoices(context),
  });
}

export function selectToolStateStartupAction(context = {}, action) {
  if (action === TOOL_STATE_RECOVERY_ACTIONS.RESUME) {
    return Object.freeze({
      action,
      stateSlot: TOOL_STATE_SLOTS.RECOVERY_STATE,
      loadedState: cloneJsonData(context.recoveryState),
      savedState: cloneJsonData(context.savedState),
      recoveryState: cloneJsonData(context.recoveryState),
    });
  }

  if (action === TOOL_STATE_RECOVERY_ACTIONS.OPEN) {
    return Object.freeze({
      action,
      stateSlot: TOOL_STATE_SLOTS.CURRENT_SAVED_STATE,
      loadedState: cloneJsonData(context.savedState),
      savedState: cloneJsonData(context.savedState),
      recoveryState: cloneJsonData(context.recoveryState),
    });
  }

  return Object.freeze({
    action: null,
    stateSlot: null,
    loadedState: null,
    savedState: cloneJsonData(context.savedState),
    recoveryState: cloneJsonData(context.recoveryState),
  });
}

export function discardToolStateRecovery(context = {}) {
  return Object.freeze({
    savedState: cloneJsonData(context.savedState),
    recoveryState: null,
    versionHistory: cloneJsonData(context.versionHistory ?? []),
  });
}

export function promoteToolStateRecovery(context = {}) {
  const promotedSavedState = recoveryStateAsSavedState(context.recoveryState);

  return Object.freeze({
    savedState: promotedSavedState,
    recoveryState: null,
    versionHistory: cloneJsonData(context.versionHistory ?? []),
  });
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTimestamp(value) {
  return hasNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.filter((value) => hasNonEmptyString(value))));
}

function clonePortablePayload(payload) {
  return Object.freeze(JSON.parse(JSON.stringify(payload)));
}

function cloneJsonData(value) {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
}

function recoveryStateAsSavedState(recoveryState) {
  if (!recoveryState) {
    return null;
  }

  const savedState = cloneJsonData(recoveryState);
  delete savedState.autosaved;
  delete savedState.temporary;
  delete savedState.timestamp;

  return Object.freeze({
    ...savedState,
    savedAt: recoveryState.timestamp,
  });
}

function createContractError(code, message, path) {
  return Object.freeze({ code, message, path });
}
